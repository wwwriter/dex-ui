import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProblemMetric, Metric } from "../../types";
import { problemMetricApi, metricApi } from "../../api/dexApi";
import ProblemMetricModal from "./ProblemMetricModal";

import { FiEdit2, FiTrash2 } from "react-icons/fi";

interface ProblemMetricTableProps {
  ontology_id: number;
  problem_id: number;
}

const ProblemMetricTable = ({
  ontology_id,
  problem_id,
}: ProblemMetricTableProps) => {
  const [selectedProblemMetric, setSelectedProblemMetric] =
    useState<ProblemMetric | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: problemMetrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["problemMetrics", ontology_id, problem_id],
    queryFn: () =>
      problemMetricApi.getAll(ontology_id, {
        filters: { problem_id },
      }),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["metrics", ontology_id],
    queryFn: () => metricApi.getAll(ontology_id),
  });

  const handleEdit = (problemMetric: ProblemMetric) => {
    setSelectedProblemMetric(problemMetric);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("정말로 이 문제 메트릭을 삭제하시겠습니까?")) {
      try {
        await problemMetricApi.delete(id);
      } catch (error) {
        console.error("문제 메트릭 삭제 중 오류 발생:", error);
        alert("문제 메트릭 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류가 발생했습니다.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">문제 메트릭 목록</h2>
        <button
          onClick={() => {
            setSelectedProblemMetric(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          새 문제 메트릭 추가
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                메트릭 이름
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                메트릭 설명
              </th>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {problemMetrics?.map((problemMetric) => {
              const metric = metrics.find(
                (m) => m.id === problemMetric.metric_id,
              );
              return (
                <tr key={problemMetric.id}>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    {metric?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    {metric?.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    <button
                      onClick={() => handleEdit(problemMetric)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="수정"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(problemMetric.id)}
                      className="text-red-600 hover:text-red-900"
                      title="삭제"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProblemMetricModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProblemMetric(null);
        }}
        problemMetric={selectedProblemMetric}
        ontology_id={ontology_id}
        problem_id={problem_id}
      />
    </div>
  );
};

export default ProblemMetricTable;
