import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ontologyApi } from "../api/dexApi";

const Home = () => {
  // 모든 온톨로지 데이터 가져오기
  const {
    data: ontologies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ontologies"],
    queryFn: ontologyApi.getAll,
  });

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
    <div className="bg-white shadow rounded-lg p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">온톨로지 목록</h2>
        <p className="mt-1 text-sm text-gray-500">
          보려는 온톨로지 그래프를 선택하세요
        </p>
      </div>

      {ontologies.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          표시할 온톨로지가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ontologies.map((ontology) => (
            <Link
              key={ontology.id}
              to={`/ontologies/${ontology.id}`}
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              <h3 className="font-medium text-gray-900">{ontology.name}</h3>
              {ontology.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {ontology.description}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-400">
                생성일: {new Date(ontology.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
