import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { knowledgeApi } from "../api/dexApi";
import { Knowledge } from "../types";
import { FiPlus, FiExternalLink } from "react-icons/fi";
import { YouTubeSummaryButton } from "../components/YouTubeSummaryButton";

const KnowledgeList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();

  // 현재 온톨로지에 해당하는 지식만 가져오기
  const {
    data: knowledgeList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["knowledge", ontology_id],
    queryFn: () => knowledgeApi.getAll(Number(ontology_id)),
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
    <div className="container mx-auto p-4 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">지식 목록</h2>
        <Link
          to={`/ontologies/${ontology_id}/knowlege/new`}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />새 지식 추가
        </Link>
      </div>

      {knowledgeList.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">표시할 지식이 없습니다.</p>
          <Link
            to={`/ontologies/${ontology_id}/knowlege/new`}
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            첫 번째 지식 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {knowledgeList.map((knowledge) => (
            <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
          ))}
        </div>
      )}

      {/* YouTube 요약 버튼 컴포넌트 */}
      <YouTubeSummaryButton ontologyId={ontology_id} />
    </div>
  );
};

interface KnowledgeCardProps {
  knowledge: Knowledge;
}

const KnowledgeCard = ({ knowledge }: KnowledgeCardProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();

  return (
    <Link
      to={`/ontologies/${ontology_id}/knowlege/${knowledge.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-gray-900">{knowledge.name}</h3>
        {knowledge.link && (
          <a
            href={knowledge.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <FiExternalLink />
          </a>
        )}
      </div>

      {knowledge.label && (
        <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-3">
          {knowledge.label}
        </div>
      )}

      {knowledge.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">
          {knowledge.description}
        </p>
      )}

      {knowledge.mermaid && (
        <div className="border border-gray-200 rounded p-2 mb-4 bg-gray-50">
          <p className="text-xs text-gray-500">Mermaid 다이어그램 포함</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-400">
          생성일: {new Date(knowledge.created_at).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
};

export default KnowledgeList;
