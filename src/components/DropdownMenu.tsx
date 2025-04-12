import { FiMoreVertical, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useState } from "react";

interface DropdownMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const DropdownMenu = ({
  onEdit,
  onDelete,
  className = "",
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <FiMoreVertical />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          {onEdit && (
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <FiEdit2 className="mr-2" />
              수정
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <FiTrash2 className="mr-2" />
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
