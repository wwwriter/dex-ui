import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { FiYoutube, FiX } from "react-icons/fi";
import { runDifyWorkflow } from "../api/dify";
import { Ontology } from "../types";
type YouTubeSummaryButtonProps = {
  ontologies?: Ontology[];
};
const YouTubeSummaryButton = ({ ontologies }: YouTubeSummaryButtonProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [selectedOntologyId, setSelectedOntologyId] = useState<string>("");

  useEffect(() => {
    if (ontology_id) {
      setSelectedOntologyId(ontology_id);
    } else if (ontologies && ontologies.length > 0) {
      const lastOntology = ontologies[ontologies.length - 1];
      setSelectedOntologyId(String(lastOntology.id));
    }
  }, [ontology_id, ontologies]);

  useEffect(() => {
    const checkClipboard = async () => {
      if (isModalOpen) {
        try {
          const clipboardText = await navigator.clipboard.readText();
          if (
            clipboardText.includes("youtube.com") ||
            clipboardText.includes("youtu.be")
          ) {
            setUrl(clipboardText);
          }
        } catch (err) {
          console.error("클립보드 접근 실패:", err);
        }
      }
    };

    checkClipboard();
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || (!ontology_id && !selectedOntologyId)) return;

    try {
      await runDifyWorkflow(url, Number(ontology_id || selectedOntologyId));
    } catch (error) {
      console.error("요약 생성 중 오류 발생:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {/* Floating Youtube Summary Button */}
      <button
        onClick={() => {
          setIsModalOpen(true);
        }}
        className="fixed bottom-24 right-4 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors z-10"
        aria-label="유튜브 요약"
      >
        <FiYoutube size={24} />
      </button>

      {/* Youtube Summary Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">유튜브 영상 요약</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="닫기"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="mb-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e);
                    }
                  }}
                  placeholder="YouTube URL을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />

                {!ontology_id && ontologies && ontologies.length > 0 && (
                  <div className="w-full mb-2">
                    <label
                      htmlFor="ontology-select"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      온톨로지 선택
                    </label>
                    <select
                      id="ontology-select"
                      value={selectedOntologyId}
                      onChange={(e) => setSelectedOntologyId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {ontologies.map((ontology) => (
                        <option key={ontology.id} value={ontology.id}>
                          {ontology.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 min-w-[50px]"
                >
                  요약
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default YouTubeSummaryButton;
