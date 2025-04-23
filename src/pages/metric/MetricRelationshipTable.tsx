import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Metric, MetricRelationship } from "../../types";
import { metricApi, metricRelationshipApi } from "../../api/dexApi";
import MetricRelationshipModal from "./MetricRelationshipModal";
import Table from "../../components/common/Table";

interface MetricRelationshipTableProps {
  metric: Metric;
  ontology_id: number;
}

const MetricRelationshipTable = ({
  metric,
  ontology_id,
}: MetricRelationshipTableProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] =
    useState<MetricRelationship | null>(null);
  const queryClient = useQueryClient();

  const { data: relationships = [] } = useQuery({
    queryKey: ["metricRelationships", ontology_id, metric.id],
    queryFn: () =>
      metricRelationshipApi.getAll(ontology_id, {
        filters: { source_metric_id: metric.id },
      }),
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["metrics", ontology_id],
    queryFn: () => metricApi.getAll(ontology_id),
  });

  const handleEdit = (relationship: MetricRelationship) => {
    setSelectedRelationship(relationship);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("이 관계를 삭제하시겠습니까?")) {
      try {
        await metricRelationshipApi.delete(id);
        queryClient.invalidateQueries({
          queryKey: ["metricRelationships", ontology_id, metric.id],
        });
      } catch (error) {
        console.error("관계 삭제 중 오류 발생:", error);
        alert("관계 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <Table
      title="메트릭 관계"
      headers={["소스 메트릭", "타겟 메트릭", "작업"]}
      onAdd={() => {
        setSelectedRelationship(null);
        setIsModalOpen(true);
      }}
      addButtonText="새 관계 추가"
    >
      {relationships.map((relationship) => {
        const targetMetric = metrics.find(
          (m) => m.id === relationship.target_metric_id,
        );
        return (
          <tr key={relationship.id}>
            <td className="px-6 py-4 whitespace-nowrap">{metric.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {targetMetric?.name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => handleEdit(relationship)}
                className="text-blue-600 hover:text-blue-900 mr-4"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(relationship.id)}
                className="text-red-600 hover:text-red-900"
              >
                삭제
              </button>
            </td>
          </tr>
        );
      })}
    </Table>
  );
};

export default MetricRelationshipTable;
