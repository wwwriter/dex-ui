import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

interface ListPageLayoutProps {
  title: string;
  addButtonText: string;
  addButtonLink: string;
  children: ReactNode;
  isEmpty: boolean;
  emptyMessage: string;
  emptyButtonLink: string;
  emptyButtonText: string;
  isLoading?: boolean;
  error?: Error | null;
}

const ListPageLayout = ({
  title,
  addButtonText,
  addButtonLink,
  children,
  isEmpty,
  emptyMessage,
  emptyButtonLink,
  emptyButtonText,
  isLoading,
  error,
}: ListPageLayoutProps) => {
  if (isLoading) {
    return <div className="text-center py-10">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        오류가 발생했습니다: {String(error)}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <Link
          to={addButtonLink}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus />
          {addButtonText}
        </Link>
      </div>

      {isEmpty ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">{emptyMessage}</p>
          <Link
            to={emptyButtonLink}
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            {emptyButtonText}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default ListPageLayout;
