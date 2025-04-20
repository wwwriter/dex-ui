import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { FiYoutube } from "react-icons/fi";
import { runDifyWorkflow } from "../api/dify";

const SUMMARY_URL = "https://data-api.soneuro-handmade.com";
const YouTubeSummaryButton = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { mutate: summarizeYouTube } = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch(`${SUMMARY_URL}/api/knowledge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, ontology_id: Number(ontology_id) }),
      });

      if (!response.ok) {
        throw new Error("요약 생성에 실패했습니다");
      }

      return response.json();
    },
    onSuccess: () => {
      setUrl("");
      setError(null);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      await runDifyWorkflow(url, Number(ontology_id));
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
            <h2 className="text-xl font-semibold mb-4">유튜브 영상 요약</h2>
            <div className="mb-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  요약하기
                </button>
              </form>
              {error && (
                <p className="mt-2 text-sm text-red-600">
                  오류가 발생했습니다: {error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default YouTubeSummaryButton;
