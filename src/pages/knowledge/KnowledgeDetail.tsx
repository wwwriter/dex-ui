import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { knowledgeApi } from "../../api/dexApi";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { createDetailQueryKey } from "../../api/query-keys";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const removeThinkTags = (text: string): string => {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "");
};

const KnowledgeDetail = () => {
  const { id, ontology_id } = useParams<{ id: string; ontology_id: string }>();
  const navigate = useNavigate();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const {
    data: knowledge,
    isLoading,
    error,
  } = useQuery({
    queryKey: createDetailQueryKey("knowledge", Number(id)),
    queryFn: () => knowledgeApi.getById(Number(id)),
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

  if (!knowledge) {
    return <div className="text-center py-10">지식을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto ">
      <div className="flex justify-between items-center p-4 mb-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          {knowledge.name}
        </h2>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 min-w-[80px]">
          <button
            onClick={() =>
              navigate(`/ontologies/${ontology_id}/knowlege/${id}/edit`)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            편집
          </button>
          <button
            onClick={() => navigate(`/ontologies/${ontology_id}/knowlege`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            목록
          </button>
        </div>
      </div>

      <div>
        {knowledge.link && (
          <div className="mb-1 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">링크</h3>
            <a
              href={knowledge.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {knowledge.link}
            </a>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1 p-4">요약</h3>
          <div className="bg-gray-50 rounded-md" data-color-mode="light">
            <MarkdownPreview
              source={removeThinkTags(knowledge.summary || "")}
              className="markdown-body"
              style={{
                padding: "16px",
                backgroundColor: "transparent",
                fontSize: "1rem",
                lineHeight: "1.6",
              }}
            />
          </div>
        </div>
        <div className="mb-2">
          <button
            type="button"
            onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            className="flex items-center justify-between w-full px-4 py-2 text-left bg-gray-50 rounded-md hover:bg-gray-100"
          >
            <span className="text-lg font-medium text-gray-900 mb-5">설명</span>
            {isDescriptionOpen ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {isDescriptionOpen && (
            <div
              className="mt-3 p-4 bg-gray-50 rounded-md"
              data-color-mode="light"
            >
              <MarkdownPreview
                source={removeThinkTags(knowledge.description || "")}
                className="markdown-body"
                style={{
                  padding: "16px",
                  backgroundColor: "transparent",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                }}
              />
            </div>
          )}
        </div>

        {knowledge.mermaid && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              다이어그램
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                {knowledge.mermaid}
              </pre>
              {/* 추후 Mermaid 렌더링 라이브러리 추가 가능 */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeDetail;
