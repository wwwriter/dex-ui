import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaUser, FaPlus } from "react-icons/fa";
import { ChatMessage, fetchChatResponse } from "../api/llmService";
import ReactMarkdown from "react-markdown";
// import "github-markdown-css/github-markdown.css";

interface ChatModalProps {
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // localStorage에서 대화 내용 불러오기
    const savedMessages = localStorage.getItem(window.location.pathname);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // timestamp를 Date 객체로 변환
        return parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } catch (error) {
        console.error("저장된 대화 내용을 불러오는데 실패했습니다:", error);
      }
    }
    return [
      {
        id: 1,
        text: "안녕하세요! 무엇을 도와드릴까요?",
        isBot: true,
        timestamp: new Date(),
      },
    ];
  });
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<
    Record<string, boolean>
  >({});

  // 생각 아코디언 토글 함수
  const toggleThought = (id: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // <think> 태그를 처리하는 함수
  const processThinkTags = (text: string): React.ReactNode[] => {
    if (!text.includes("</think>")) return [text];

    const segments = [];

    // </think> 태그 위치 찾기
    const endTagIndex = text.indexOf("</think>");

    if (endTagIndex !== -1) {
      // </think> 이전의 모든 내용을 생각 내용으로 간주
      const thoughtContent = text.substring(0, endTagIndex);
      const thoughtId = "thought-0";

      // 생각 내용을 아코디언으로 추가
      segments.push(
        <div
          key={thoughtId}
          className="my-2 border border-gray-200 rounded-md overflow-hidden"
        >
          <button
            onClick={() => toggleThought(thoughtId)}
            className="w-full p-2 bg-gray-100 text-left flex justify-between items-center"
          >
            <span className="font-medium text-gray-700">생각중...</span>
            <span>{expandedThoughts[thoughtId] ? "▲" : "▼"}</span>
          </button>
          {expandedThoughts[thoughtId] && (
            <div className="p-3 bg-gray-50">
              <ReactMarkdown components={MarkdownComponents}>
                {thoughtContent}
              </ReactMarkdown>
            </div>
          )}
        </div>,
      );

      // </think> 이후의 내용 추가
      const remainingText = text.substring(endTagIndex + 8); // 8 = "</think>".length

      if (remainingText.trim() !== "") {
        segments.push(
          <ReactMarkdown key="remaining" components={MarkdownComponents}>
            {remainingText}
          </ReactMarkdown>,
        );
      }
    }

    return segments;
  };

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
      <h1 className="text-xl font-bold my-3" {...props} />
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

  // 현재 문서의 텍스트를 가져오는 함수
  const getCurrentDocumentText = () => {
    // 메인 컨텐츠 영역을 찾기
    const mainContent = document.querySelector("main, .main-content, #content");
    if (!mainContent) return "";

    // 모든 텍스트 노드를 수집
    const textNodes: string[] = [];
    const walker = document.createTreeWalker(
      mainContent,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 공백만 있는 노드는 제외
          return node.textContent?.trim()
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      },
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node.textContent?.trim() || "");
    }

    // 텍스트를 합치고 정리
    return textNodes
      .filter((text) => text.length > 0)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n") // 연속된 줄바꿈 정리
      .trim();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isLoading) return;

    // 현재 문서의 텍스트 가져오기
    const currentDocumentText = getCurrentDocumentText();
    const contextMessage = currentDocumentText
      ? `\n\n현재 문서 내용:\n${currentDocumentText}`
      : "";

    console.log(currentDocumentText);

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
      await fetchChatResponse(
        allMessages,
        (chunk) => {
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
        },
        contextMessage,
      );
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

  // 메시지가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem(window.location.pathname, JSON.stringify(messages));
    } catch (error) {
      console.error("대화 내용을 저장하는데 실패했습니다:", error);
    }
  }, [messages]);

  const handleNewChat = () => {
    const newMessages = [
      {
        id: 1,
        text: "안녕하세요! 무엇을 도와드릴까요?",
        isBot: true,
        timestamp: new Date(),
      },
    ];
    setMessages(newMessages);
    // 새 대화 시작 시 localStorage도 업데이트
    try {
      localStorage.setItem(
        window.location.pathname,
        JSON.stringify(newMessages),
      );
    } catch (error) {
      console.error("새 대화 내용을 저장하는데 실패했습니다:", error);
    }
  };

  const handleTemplateClick = (template: string) => {
    setNewMessage(template);
    // 입력 필드에 포커스
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[90%] sm:w-full max-w-md h-[90vh] sm:h-[700px] sm:max-h-[80vh] shadow-lg flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b flex justify-between items-center">
          <button
            onClick={handleNewChat}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            title="새 대화 시작"
          >
            <FaPlus className="h-5 w-5" />
          </button>
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
          {messages.length === 1 && messages[0].isBot && (
            <div className="mb-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-500">템플릿 질문</h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleTemplateClick("한줄로 쉽게 요약해줘")}
                  className="p-3 text-left bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-700">한줄로 쉽게 요약해줘</span>
                </button>
                <button
                  onClick={() =>
                    handleTemplateClick(
                      "이 내용에서 만들 수 있는 컨텐츠 제목 3가지 뽑아줘",
                    )
                  }
                  className="p-3 text-left bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-700">
                    이 내용에서 만들 수 있는 컨텐츠 제목 3가지 뽑아줘
                  </span>
                </button>
                <button
                  onClick={() =>
                    handleTemplateClick("문서의 내용을 Mermaid 로 형상화 해줘")
                  }
                  className="p-3 text-left bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-700">
                    문서의 내용을 Mermaid 로 형상화 해줘
                  </span>
                </button>
              </div>
            </div>
          )}
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
                    {/* {message.isBot ? (
                      <>{processThinkTags(message.text)}</>
                    ) : (
                      message.text
                    )} */}

                    {message.isBot ? (
                      message.text.includes("</think>") ? (
                        <>{processThinkTags(message.text)}</>
                      ) : (
                        <ReactMarkdown components={MarkdownComponents}>
                          {message.text}
                        </ReactMarkdown>
                      )
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
