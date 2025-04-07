import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaUser } from "react-icons/fa";
import { ChatMessage, fetchChatResponse } from "../api/llmService";

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

  // 스크롤을 항상 최신 메시지로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 텍스트에서 **로 감싸진 부분을 볼드체로 변환하는 함수
  const renderMessageText = (text: string) => {
    // 마크다운 스타일 강조 처리 (** 표시를 볼드 텍스트로)
    return text.split("\n").map((line, index) => {
      // 볼드 텍스트 처리 (**텍스트**)
      const formattedLine = line.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
      );

      return (
        <React.Fragment key={index}>
          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
          {index < text.split("\n").length - 1 && <br />}
        </React.Fragment>
      );
    });
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

      // 스트리밍 응답 처리
      await fetchChatResponse(allMessages, (chunk) => {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];

          if (lastMessage && lastMessage.isBot) {
            lastMessage.text += chunk;
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md h-[500px] max-h-[80vh] shadow-lg flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">채팅 상담</h3>
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
                  className={`max-w-[80%] p-3 rounded-lg ${
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
                  <div className="whitespace-pre-wrap">
                    {renderMessageText(message.text)}
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
