import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { knowledgeApi } from "../../api/dexApi";
import { createDetailQueryKey } from "../../api/query-keys";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import MermaidDiagram from "../../components/MermaidDiagram";
import MarkdownContent from "../../components/MarkdownContent";
import { removeThinkTags } from "../../utils/textUtils";
import { runDifyWorkflow } from "../../api/dify";

const KnowledgeDetail = () => {
  const { id, ontology_id } = useParams<{ id: string; ontology_id: string }>();
  const navigate = useNavigate();

  const {
    data: knowledge,
    isLoading,
    error,
  } = useQuery({
    queryKey: createDetailQueryKey("knowledge", Number(id)),
    queryFn: () => knowledgeApi.getById(Number(id)),
    enabled: !!id,
  });

  const handleResummarize = async () => {
    if (!knowledge?.link || !ontology_id) return;

    try {
      runDifyWorkflow(knowledge.link, Number(ontology_id));
      // 요약이 완료된 후 페이지를 새로고침하거나 데이터를 다시 불러옵니다
    } catch (error) {
      console.error("재요약 중 오류 발생:", error);
    } finally {
    }
  };

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
    <div className="container mx-auto relative max-w-screen-lg">
      <div className="flex justify-between items-center p-4 mb-1">
        <h2 className="text-xl md:text-xl font-semibold text-gray-900">
          {knowledge.name}
        </h2>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 min-w-[80px]">
          <button
            onClick={() =>
              navigate(`/ontologies/${ontology_id}/knowledge/${id}/edit`)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 min-w-[80px]"
          >
            편집
          </button>
          <button
            onClick={() => navigate(`/ontologies/${ontology_id}/knowledge`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 min-w-[80px]"
          >
            목록
          </button>
        </div>
      </div>

      {knowledge.updated_at && (
        <div className="px-4 mb-3">
          <p className="text-xs text-gray-500">
            최종 업데이트:{" "}
            {new Date(knowledge.updated_at).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}

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

        {knowledge.author && (
          <div className="mb-1 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">작성자</h3>
            <p className="text-gray-700">{knowledge.author}</p>
          </div>
        )}

        <div className="grid grid-cols-1">
          <div>
            <div className="flex justify-between items-center p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-0">요약</h3>
              {knowledge.link && (
                <button
                  onClick={handleResummarize}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-green-300"
                >
                  재요약
                </button>
              )}
            </div>
            <div className="p-4">
              <MarkdownContent
                content={removeThinkTags(knowledge.summary || "")}
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 p-4">설명</h3>
            <div className="p-4">
              <MarkdownContent
                content={removeThinkTags(knowledge.description || "")}
              />
            </div>
          </div>
        </div>
      </div>

      <MermaidDiagram id={id} mermaidContent={knowledge.mermaid} />
    </div>
  );
};

export default KnowledgeDetail;
