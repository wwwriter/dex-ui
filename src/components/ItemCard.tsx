import { Link } from "react-router-dom";
import BookmarkStar from "./BookmarkStar";
import DropdownMenu from "./DropdownMenu";

interface ItemCardProps {
  id: number;
  name: string;
  description?: string;
  isBookmarked: boolean;
  ontologyId: string | number | null;
  itemType: "knowledge" | "problems";
  onBookmark: (e: React.MouseEvent) => void;
  onItemClick: (e: React.MouseEvent) => void;
  onDelete: () => void;
  created_at?: string;
}

const ItemCard = ({
  id,
  name,
  description,
  isBookmarked,
  ontologyId,
  itemType,
  onBookmark,
  onDelete,
  created_at,
  onItemClick,
}: ItemCardProps) => {
  return (
    <div className="relative">
      <div className="absolute right-4 top-4">
        <DropdownMenu onDelete={onDelete} />
      </div>
      <div
        className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
        onClick={onItemClick}
      >
        <div className="flex justify-between items-start mb-3 w-full">
          <h3 className="text-base md:text-xl font-medium text-gray-900 flex items-center">
            <BookmarkStar isBookmarked={isBookmarked} onBookmark={onBookmark} />
            {/* <Link to={`/ontologies/${ontologyId}/${itemType}/${id}`}> */}
            {name}
            {/* </Link> */}
          </h3>
        </div>

        {description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
        )}

        {created_at && (
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-400">
              생성일: {new Date(created_at).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
