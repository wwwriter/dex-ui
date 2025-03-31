import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-blue-600 font-bold text-xl">DEX</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            {/* 필요한 네비게이션 링크를 여기에 추가할 수 있습니다 */}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
