import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ProblemMetric, Metric } from "../../types";
import { problemMetricApi, metricApi } from "../../api/dexApi";

interface ProblemMetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemMetric: ProblemMetric | null;
  ontology_id: number;
  problem_id: number;
}

const ProblemMetricModal = ({
  isOpen,
  onClose,
  problemMetric,
  ontology_id,
  problem_id,
}: ProblemMetricModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<ProblemMetric>>({
    metric_id: undefined,
    ontology_id,
    problem_id,
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["metrics", ontology_id],
    queryFn: () => metricApi.getAll(ontology_id),
  });

  const { data: existingProblemMetrics = [] } = useQuery({
    queryKey: ["problemMetrics", ontology_id, problem_id],
    queryFn: () =>
      problemMetricApi.getAll(ontology_id, {
        filters: { problem_id },
      }),
  });

  // 이미 선택된 메트릭을 제외한 목록
  const availableMetrics = metrics.filter(
    (metric) =>
      !existingProblemMetrics.some(
        (problemMetric) => problemMetric.metric_id === metric.id,
      ),
  );

  useEffect(() => {
    if (problemMetric) {
      setFormData({
        metric_id: problemMetric.metric_id,
        ontology_id,
        problem_id,
      });
    } else {
      setFormData({
        metric_id: undefined,
        ontology_id,
        problem_id,
      });
    }
  }, [problemMetric, ontology_id, problem_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (problemMetric) {
        await problemMetricApi.update(problemMetric.id, {
          ...formData,
          ontology_id,
          problem_id,
        });
      } else {
        await problemMetricApi.create({
          metric_id: formData.metric_id || 0,
          ontology_id,
          problem_id,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["problemMetrics", ontology_id, problem_id],
      });
      setFormData({
        metric_id: undefined,
        ontology_id,
        problem_id,
      });
      onClose();
    } catch (error) {
      console.error("문제 메트릭 저장 중 오류 발생:", error);
      alert("문제 메트릭 저장 중 오류가 발생했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {problemMetric ? "문제 메트릭 수정" : "새 문제 메트릭 추가"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메트릭 *
            </label>
            <select
              value={formData.metric_id || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metric_id: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">선택해주세요</option>
              {availableMetrics.map((metric) => (
                <option key={metric.id} value={metric.id}>
                  {metric.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {problemMetric ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemMetricModal;
