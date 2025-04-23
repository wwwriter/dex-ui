import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Metric, ObjectType, MetricObjectTypeRelation } from "../../types";
import { metricObjectTypeRelationApi, objectTypeApi } from "../../api/dexApi";

interface MetricObjectRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  relation: any;
  metric: Metric;
  ontology_id: number;
}

const MetricObjectRelationModal = ({
  isOpen,
  onClose,
  relation,
  metric,
  ontology_id,
}: MetricObjectRelationModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<
    Omit<MetricObjectTypeRelation, "id" | "created_at" | "updated_at">
  >({
    object_type_id: 0,
    metric_id: metric.id,
    ontology_id,
  });

  const { data: objectTypes = [] } = useQuery({
    queryKey: ["objectTypes", ontology_id],
    queryFn: () => objectTypeApi.getAll(ontology_id),
  });

  const { data: existingRelations = [] } = useQuery({
    queryKey: ["metricObjectRelations", metric.id],
    queryFn: () =>
      metricObjectTypeRelationApi.getAll(ontology_id, {
        filters: { metric_id: metric.id },
      }),
  });

  // 이미 연결된 객체 타입을 제외한 목록
  const availableObjectTypes = objectTypes.filter(
    (obj) => !existingRelations.some((rel) => rel.object_type_id === obj.id)
  );

  useEffect(() => {
    if (relation) {
      setFormData({
        object_type_id: relation.object_type_id,
        metric_id: metric.id,
        ontology_id,
      });
    } else {
      setFormData({
        object_type_id: 0,
        metric_id: metric.id,
        ontology_id,
      });
    }
  }, [relation, metric.id, ontology_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (relation) {
        await metricObjectTypeRelationApi.update(relation.id, formData);
      } else {
        await metricObjectTypeRelationApi.create(formData);
      }
      queryClient.invalidateQueries({
        queryKey: ["metricObjectRelations", metric.id],
      });
      setFormData({
        object_type_id: 0,
        metric_id: metric.id,
        ontology_id,
      });
      onClose();
    } catch (error) {
      console.error("관계 저장 중 오류 발생:", error);
      alert("관계 저장 중 오류가 발생했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {relation ? "관계 수정" : "새 관계 추가"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              객체 타입 *
            </label>
            <select
              value={formData.object_type_id || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  object_type_id: e.target.value ? Number(e.target.value) : 0,
                })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">선택해주세요</option>
              {availableObjectTypes.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
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
              {relation ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MetricObjectRelationModal;
