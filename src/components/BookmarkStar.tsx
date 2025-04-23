import { FiStar } from "react-icons/fi";

interface BookmarkStarProps {
  isBookmarked: boolean;
  onBookmark: (e: React.MouseEvent) => void;
}

const BookmarkStar = ({ isBookmarked, onBookmark }: BookmarkStarProps) => {
  return (
    <FiStar
      className={`mr-1 md:mr-2 cursor-pointer w-[16px] h-[16px] md:w-[20px] md:h-[20px] flex-shrink-0 ${
        isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
      }`}
      onClick={onBookmark}
    />
  );
};

export default BookmarkStar;
