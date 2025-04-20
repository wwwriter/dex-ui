import React from "react";
import { FiSearch, FiX } from "react-icons/fi";

// 검색 버튼 컴포넌트
const SearchButton = ({
  currentSearchQuery,
  onClick,
  onReset,
}: {
  currentSearchQuery: string;
  onClick: () => void;
  onReset: () => void;
}) => {
  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReset();
  };

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <FiSearch />
      {currentSearchQuery && (
        <span className="text-sm">"{currentSearchQuery}"</span>
      )}
      {!currentSearchQuery ? (
        <span className="text-sm">검색</span>
      ) : (
        <FiX
          onClick={handleResetClick}
          className="cursor-pointer hover:text-gray-300"
          size={16}
        />
      )}
    </button>
  );
};

export default SearchButton;
