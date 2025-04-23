import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { problemApi } from "../../api/dexApi";
import { createDetailQueryKey } from "../../api/query-keys";
import MermaidDiagram from "../../components/MermaidDiagram";
import MarkdownContent from "../../components/MarkdownContent";
import { removeThinkTags } from "../../utils/textUtils";

const ProblemDetail = () => {
  const { id, ontology_id } = useParams<{ id: string; ontology_id: string }>();
  const navigate = useNavigate();

  const {
    data: problem,
    isLoading,
    error,
  } = useQuery({
    queryKey: createDetailQueryKey("problems", Number(id)),
    queryFn: () => problemApi.getById(Number(id)),
    enabled: !!id,
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

  if (!problem) {
    return <div className="text-center py-10">문제를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto relative">
      <div className="flex justify-between items-center p-4 mb-2">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          {problem.name}
        </h2>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 min-w-[80px]">
          <button
            onClick={() =>
              navigate(`/ontologies/${ontology_id}/problems/${id}/edit`)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 min-w-[80px]"
          >
            편집
          </button>
          <button
            onClick={() => navigate(`/ontologies/${ontology_id}/problems`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 min-w-[80px]"
          >
            목록
          </button>
        </div>
      </div>

      <div>
        <div>
          {/* <h3 className="text-lg font-medium text-gray-900 mb-1 p-4">설명</h3> */}
          <MarkdownContent
            content={removeThinkTags(problem.description || "")}
          />
        </div>
      </div>

      <MermaidDiagram id={id} mermaidContent={problem.mermaid} />
    </div>
  );
};

export default ProblemDetail;
