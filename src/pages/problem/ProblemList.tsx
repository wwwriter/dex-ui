import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { problemApi } from "../../api/dexApi";
import { Problem } from "../../types";
import { FiPlus } from "react-icons/fi";
import DropdownMenu from "../../components/DropdownMenu";
import { useState } from "react";

const ProblemList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["problems", ontology_id],
    queryFn: () => problemApi.getAll(Number(ontology_id)),
  });

  const createMutation = useMutation({
    mutationFn: (data: Problem) => problemApi.create(data as Problem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems", ontology_id] });
      setIsModalOpen(false);
      setFormData({ name: "", description: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Problem) =>
      problemApi.update(data.id, {
        name: data.name,
        description: data.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems", ontology_id] });
      setIsModalOpen(false);
      setEditingProblem(null);
      setFormData({ name: "", description: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => problemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems", ontology_id] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProblem) {
      updateMutation.mutate({
        id: editingProblem.id,
        ontology_id: Number(ontology_id),
        ...formData,
      } as Problem);
    } else {
      createMutation.mutate({
        ...formData,
        ontology_id: Number(ontology_id),
      } as Problem);
    }
  };

  const handleEdit = (problem: Problem) => {
    setEditingProblem(problem);
    setFormData({
      name: problem.name,
      description: problem.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("정말로 이 문제를 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">문제 목록</h1>
        <button
          onClick={() => navigate(`/ontologies/${ontology_id}/problems/new`)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus />새 문제 추가
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow relative"
          >
            <div className="absolute top-4 right-4">
              <DropdownMenu
                // onEdit={() => handleEdit(problem)}
                onDelete={() => handleDelete(problem.id)}
              />
            </div>
            <Link to={`/ontologies/${ontology_id}/problems/${problem.id}`}>
              <h2 className="text-xl font-semibold text-gray-900 max-w-[290px]">
                {problem.name}
              </h2>
              <p className="mt-2 text-gray-600">{problem.description}</p>
            </Link>
          </div>
        ))}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingProblem ? "문제 수정" : "새 문제 추가"}
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
                    setEditingProblem(null);
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

export default ProblemList;
