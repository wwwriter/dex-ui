import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Metric, MetricRelationship } from "../../types";
import { metricApi, metricRelationshipApi } from "../../api/dexApi";

interface MetricRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  relationship: MetricRelationship | null;
  metric: Metric;
  ontology_id: number;
}

const MetricRelationshipModal = ({
  isOpen,
  onClose,
  relationship,
  metric,
  ontology_id,
}: MetricRelationshipModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<MetricRelationship>>({
    ontology_id,
    source_metric_id: metric.id,
    target_metric_id: null,
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["metrics", ontology_id],
    queryFn: () => metricApi.getAll(ontology_id),
  });

  const { data: existingRelationships = [] } = useQuery({
    queryKey: ["metricRelationships", ontology_id, metric.id],
    queryFn: () =>
      metricRelationshipApi.getAll(ontology_id, {
        filters: { source_metric_id: metric.id },
      }),
  });

  // 이미 연결된 메트릭과 자기 자신을 제외한 메트릭 목록
  const availableMetrics = metrics.filter(
    (m) =>
      m.id !== metric.id &&
      !existingRelationships.some((rel) => rel.target_metric_id === m.id),
  );

  useEffect(() => {
    if (relationship) {
      setFormData({
        ontology_id,
        source_metric_id: metric.id,
        target_metric_id: relationship.target_metric_id,
      });
    } else {
      setFormData({
        ontology_id,
        source_metric_id: metric.id,
        target_metric_id: null,
      });
    }
  }, [relationship, ontology_id, metric.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (relationship) {
        await metricRelationshipApi.update(relationship.id, {
          ...formData,
          ontology_id,
          source_metric_id: metric.id,
        });
      } else {
        await metricRelationshipApi.create({
          ontology_id,
          source_metric_id: metric.id,
          target_metric_id: formData.target_metric_id || 0,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["metricRelationships", ontology_id, metric.id],
      });
      setFormData({
        ontology_id,
        source_metric_id: metric.id,
        target_metric_id: null,
      });
      onClose();
    } catch (error) {
      console.error("메트릭 관계 저장 중 오류 발생:", error);
      alert("메트릭 관계 저장 중 오류가 발생했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {relationship ? "메트릭 관계 수정" : "새 메트릭 관계 추가"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              소스 메트릭
            </label>
            <input
              type="text"
              value={metric.name}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              타겟 메트릭 *
            </label>
            <select
              value={formData.target_metric_id || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  target_metric_id: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">선택해주세요</option>
              {availableMetrics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
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
              {relationship ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MetricRelationshipModal;
