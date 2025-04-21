import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ontologyApi } from "../../api/dexApi";
import { Ontology } from "../../types";
import DropdownMenu from "../../components/DropdownMenu";
import { createListQueryKey } from "../../api/query-keys";

const OntologyList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOntology, setEditingOntology] = useState<Ontology | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const queryClient = useQueryClient();
  const queryKey = createListQueryKey("ontologies",{});

  const { data: ontologies = [] as Ontology[], isLoading } = useQuery<
    Ontology[]
  >({
    queryKey,
    queryFn: () => ontologyApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: ontologyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ontologies"] });
      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; name: string; description: string }) =>
      ontologyApi.update(data.id, {
        name: data.name,
        description: data.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ontologies"] });
      setIsModalOpen(false);
      setEditingOntology(null);
      setFormData({ name: "", description: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ontologyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ontologies"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOntology) {
      updateMutation.mutate({
        id: editingOntology.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (ontology: Ontology) => {
    setEditingOntology(ontology);
    setFormData({
      name: ontology.name,
      description: ontology.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("정말로 이 온톨로지를 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">온톨로지 목록</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus />새 온톨로지 생성
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ontologies.map((ontology) => (
          <div
            key={ontology.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow relative"
          >
            <div className="absolute top-4 right-4">
              <DropdownMenu
                onEdit={() => handleEdit(ontology)}
                onDelete={() => handleDelete(ontology.id)}
              />
            </div>
            <Link to={`/ontologies/${ontology.id}/knowlege`}>
              <h2 className="text-xl font-semibold text-gray-900">
                {ontology.name}
              </h2>
              <p className="mt-2 text-gray-600">{ontology.description}</p>
            </Link>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingOntology ? "온톨로지 수정" : "새 온톨로지 생성"}
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
                    setEditingOntology(null);
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

export default OntologyList;
