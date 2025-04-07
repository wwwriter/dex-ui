import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaUser } from "react-icons/fa";
import { ChatMessage, fetchChatResponse } from "../api/llmService";
import ReactMarkdown from "react-markdown";
// import "github-markdown-css/github-markdown.css";

interface ChatModalProps {
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "안녕하세요! 무엇을 도와드릴까요?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 스크롤을 항상 최신 메시지로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 모달이 열릴 때 입력 필드에 포커스
  useEffect(() => {
    // 약간의 지연을 줘서 모달 애니메이션이 완료된 후 포커스
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 중복된 텍스트를 정리하는 함수
  const cleanDuplicatedText = (text: string): string => {
    // 줄바꿈, 공백, 특수문자 등을 고려하여 중복 패턴을 정리
    const lines = text.split("\n");
    const cleanedLines = lines.map((line) => {
      // 공백과 특수문자로 구분된 단어 단위로 중복 검사
      const words = line.split(/(\s+|[.,!?;:*])/);
      let result = "";
      let lastWord = "";

      for (const word of words) {
        if (word !== lastWord) {
          result += word;
          lastWord = word;
        }
      }
      return result;
    });

    return (
      cleanedLines
        .join("\n")
        // ** 패턴 정리 (중복 *, **)
        .replace(/\*{2,}/g, "**")
        // 중복된 특수문자 정리
        .replace(/([.,!?;:])\1+/g, "$1")
        // 연속된: 리스트 표시 (**: **) 패턴 정리
        .replace(/\*\*:\s*\*\*/g, "**:")
        // 공백만 제거하고 줄바꿈은 유지
        .replace(/[^\S\n]{2,}/g, " ")
        .trim()
    );
  };

  const formatMessage = (message: string): string => {
    return (
      message
        // 마크다운 스타일 리스트 포맷팅 개선
        .replace(/\*\*\s*([^:]+):\s*\*\*/g, "**$1:**")
        // 이모지 주변 공백 정리
        .replace(/([\uD800-\uDBFF][\uDC00-\uDFFF])\s+/g, "$1 ")
        // 연속된 줄바꿈 최대 3개까지 허용 (더 많은 경우 3개로 제한)
        .replace(/\n{4,}/g, "\n\n\n")
        .trim()
    );
  };

  // 마크다운 컴포넌트 스타일 정의
  const MarkdownComponents = {
    // 헤더 커스터마이징
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold my-3" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-bold my-3" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-bold my-2" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-base font-bold my-2" {...props} />
    ),
    // 리스트 커스터마이징
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />
    ),
    li: ({ node, ...props }: any) => <li className="my-1" {...props} />,
    // 단락 커스터마이징
    p: ({ node, ...props }: any) => (
      <p className="my-2 whitespace-pre-wrap" {...props} />
    ),
    // 코드 블록 커스터마이징
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre className="bg-gray-800 text-white p-3 rounded-md my-3 overflow-auto">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code
          className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    // 표 스타일
    table: ({ node, ...props }: any) => (
      <div className="overflow-auto my-3">
        <table
          className="min-w-full border border-gray-300 text-sm"
          {...props}
        />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-gray-100" {...props} />
    ),
    tbody: ({ node, ...props }: any) => (
      <tbody className="divide-y divide-gray-300" {...props} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr className="hover:bg-gray-50" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th
        className="border border-gray-300 px-4 py-2 text-left font-semibold"
        {...props}
      />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border border-gray-300 px-4 py-2" {...props} />
    ),
    // 수평선
    hr: ({ node, ...props }: any) => (
      <hr className="my-4 border-gray-300" {...props} />
    ),
    // 강조 텍스트
    strong: ({ node, ...props }: any) => (
      <strong className="font-bold" {...props} />
    ),
    // 취소선
    del: ({ node, ...props }: any) => (
      <del className="line-through text-gray-500" {...props} />
    ),
    // 체크박스 리스트
    input: ({ node, ...props }: any) => {
      const { checked, type } = props;
      return type === "checkbox" ? (
        <input
          type="checkbox"
          checked={checked}
          readOnly
          className="mr-1 h-4 w-4 rounded border-gray-300 text-blue-600"
          {...props}
        />
      ) : (
        <input {...props} />
      );
    },
    // 링크
    a: ({ node, ...props }: any) => (
      <a
        className="text-blue-600 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    // 인용구
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="pl-4 border-l-4 border-gray-300 italic text-gray-600 my-3"
        {...props}
      />
    ),
    // 인라인 요소
    em: ({ node, ...props }: any) => <em className="italic" {...props} />,
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isLoading) return;

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: newMessage,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    // 봇 응답 메시지 준비
    const botMessage: ChatMessage = {
      id: messages.length + 2,
      text: "",
      isBot: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);

    try {
      // 모든 메시지 포함하여 API에 전송
      const allMessages = [...messages, userMessage];

      // 누적 응답 처리를 위한 변수
      let accumulatedResponse = "";

      // 스트리밍 응답 처리
      await fetchChatResponse(allMessages, (chunk) => {
        // 응답 누적
        accumulatedResponse += chunk;

        // 중복 제거 및 포맷팅 처리
        const cleanedResponse = cleanDuplicatedText(accumulatedResponse);
        const formattedResponse = formatMessage(cleanedResponse);

        // 메시지 업데이트
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];

          if (lastMessage && lastMessage.isBot) {
            lastMessage.text = formattedResponse;
          }

          return updatedMessages;
        });
      });
    } catch (error) {
      console.error("채팅 API 오류:", error);

      // 오류 메시지 표시
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (lastMessage && lastMessage.isBot) {
          lastMessage.text =
            "죄송합니다. 응답을 처리하는 동안 오류가 발생했습니다.";
        }

        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
      
      

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[90%] sm:w-full max-w-md h-[90vh] sm:h-[700px] sm:max-h-[80vh] shadow-lg flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b flex justify-between items-center">
          {/* <h3 className="text-lg font-semibold text-gray-900">채팅 상담</h3> */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isBot ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[100%] p-3 rounded-lg ${
                    message.isBot
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.isBot ? (
                      <FaRobot className="mr-2 h-4 w-4" />
                    ) : (
                      <FaUser className="mr-2 h-4 w-4" />
                    )}
                    <span className="text-xs">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="markdown-wrapper">
                    {message.isBot ? (
                      <ReactMarkdown
                        // remarkPlugins={[remarkGfm]}
                        components={MarkdownComponents}
                      >
                        {message.text}
                      </ReactMarkdown>
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 메시지 입력 영역 */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              ref={inputRef}
            />
            <button
              type="submit"
              className={`${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-4 py-2 rounded-r-lg focus:outline-none`}
              disabled={isLoading}
            >
              {isLoading ? "전송 중..." : "전송"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
