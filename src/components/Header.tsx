import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaComment } from "react-icons/fa";
import ChatModal from "./ChatModal";

const Header: React.FC = () => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleOpenChat = () => {
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
  };

  return (
    <header className="bg-gray-800 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <button
              onClick={handleOpenChat}
              className="mr-4 p-2 text-white hover:bg-gray-700 rounded-full focus:outline-none"
              aria-label="채팅 열기"
            >
              <FaComment className="h-5 w-5" />
            </button>
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <span className="text-blue-600 font-bold text-xl">DEX</span>
              </Link>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            {/* 필요한 네비게이션 링크를 여기에 추가할 수 있습니다 */}
          </nav>
        </div>
      </div>

      {isChatModalOpen && <ChatModal onClose={handleCloseChat} />}
    </header>
  );
};

export default Header;
