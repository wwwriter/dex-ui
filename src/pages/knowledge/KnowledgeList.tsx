import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { knowledgeApi } from "../../api/dexApi";
import { Knowledge } from "../../types";
import { FiPlus, FiExternalLink } from "react-icons/fi";
import YouTubeSummaryButton from "../../components/YouTubeSummaryButton";
import { createListQueryKey } from "../../api/query-keys";
import DropdownMenu from "../../components/DropdownMenu";
import { useState } from "react";

const KnowledgeList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Knowledge | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // 현재 온톨로지에 해당하는 지식만 가져오기
  const {
    data: knowledgeList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: createListQueryKey("knowledge", {
      limit: 200,
      sort: "updated_at.desc",
      filters: { ontology_id: Number(ontology_id) },
    }),
    queryFn: () =>
      knowledgeApi.getAll(Number(ontology_id), {
        limit: 200,
        sort: "updated_at.desc",
      }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Knowledge>) =>
      knowledgeApi.create({
        ...data,
        ontology_id: Number(ontology_id),
      } as Knowledge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", ontology_id] });
      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; name: string; description: string }) =>
      knowledgeApi.update(data.id, {
        name: data.name,
        description: data.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", ontology_id] });
      setIsModalOpen(false);
      setEditingKnowledge(null);
      setFormData({ name: "", description: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", ontology_id] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKnowledge) {
      updateMutation.mutate({
        id: editingKnowledge.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (knowledge: Knowledge) => {
    setEditingKnowledge(knowledge);
    setFormData({
      name: knowledge.name,
      description: knowledge.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("정말로 이 지식을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
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

  return (
    <div className="container mx-auto p-4 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">지식 목록</h2>
        <button
          onClick={() => navigate(`/ontologies/${ontology_id}/knowlege/new`)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus />새 지식 추가
        </button>
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
            <div key={knowledge.id} className="relative">
              <div className="absolute top-4 right-4">
                <DropdownMenu
                  // onEdit={() => handleEdit(knowledge)}
                  onDelete={() => handleDelete(knowledge.id)}
                />
              </div>
              <Link
                to={`/ontologies/${ontology_id}/knowlege/${knowledge.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
              >
                <div className="flex justify-between items-start mb-3 max-w-[290px]">
                  <h3 className="text-lg font-medium text-gray-900">
                    {knowledge.name}
                  </h3>
                  {/* {knowledge.link && (
                    <a
                      href={knowledge.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiExternalLink />
                    </a>
                  )} */}
                </div>

                {/* {knowledge.label && (
                  <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-3">
                    {knowledge.label}
                  </div>
                )} */}

                {knowledge.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {knowledge.description}
                  </p>
                )}

                {knowledge.mermaid && (
                  <div className="border border-gray-200 rounded p-2 mb-4 bg-gray-50">
                    <p className="text-xs text-gray-500">
                      Mermaid 다이어그램 포함
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-gray-400">
                    생성일:{" "}
                    {new Date(knowledge.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* YouTube 요약 버튼 컴포넌트 */}
      <YouTubeSummaryButton />

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingKnowledge ? "지식 수정" : "새 지식 추가"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  설명
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingKnowledge(null);
                    setFormData({ name: "", description: "" });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "저장 중..."
                    : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeList;
