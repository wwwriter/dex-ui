import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { problemApi } from "../api/dexApi";
import { Problem } from "../types";
import { FiPlus } from "react-icons/fi";

const ProblemList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();

  // 현재 온톨로지에 해당하는 문제만 가져오기
  const {
    data: problems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["problems", ontology_id],
    queryFn: () => problemApi.getAll(Number(ontology_id)),
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">문제 목록</h2>
        <Link
          to={`/ontologies/${ontology_id}/problems/new`}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />새 문제 추가
        </Link>
      </div>

      {problems.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">표시할 문제가 없습니다.</p>
          <Link
            to={`/ontologies/${ontology_id}/problems/new`}
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            첫 번째 문제 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
};

interface ProblemCardProps {
  problem: Problem;
}

const ProblemCard = ({ problem }: ProblemCardProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();

  return (
    <Link
      to={`/ontologies/${ontology_id}/problems/${problem.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-2">{problem.name}</h3>
      {problem.label && (
        <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-3">
          {problem.label}
        </div>
      )}
      {problem.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">{problem.description}</p>
      )}
      <div className="text-xs text-gray-400">
        생성일: {new Date(problem.created_at).toLocaleDateString()}
      </div>
    </Link>
  );
};

export default ProblemList;
