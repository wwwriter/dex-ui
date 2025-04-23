import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Metric, ObjectType } from "../../types";
import { metricObjectTypeRelationApi, objectTypeApi } from "../../api/dexApi";
import MetricObjectRelationModal from "./MetricObjectRelationModal";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Table from "../../components/common/Table";

interface MetricObjectRelationTableProps {
  metric: Metric;
  ontology_id: number;
}

const MetricObjectRelationTable = ({
  metric,
  ontology_id,
}: MetricObjectRelationTableProps) => {
  const [selectedRelation, setSelectedRelation] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: relations = [], isLoading } = useQuery({
    queryKey: ["metricObjectRelations", metric.id],
    queryFn: () =>
      metricObjectTypeRelationApi.getAll(ontology_id, {
        filters: { metric_id: metric.id },
      }),
  });

  const { data: objectTypes = [] } = useQuery({
    queryKey: ["objectTypes", ontology_id],
    queryFn: () => objectTypeApi.getAll(ontology_id),
  });

  const handleEdit = (relation: any) => {
    setSelectedRelation(relation);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("정말로 이 관계를 삭제하시겠습니까?")) {
      try {
        await metricObjectTypeRelationApi.delete(id);
      } catch (error) {
        console.error("관계 삭제 중 오류 발생:", error);
        alert("관계 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <Table
      title="객체 타입 관계 목록"
      headers={["객체 타입", "작업"]}
      onAdd={() => {
        setSelectedRelation(null);
        setIsModalOpen(true);
      }}
      addButtonText="새 관계 추가"
    >
      {relations.map((relation) => {
        const objectType = objectTypes.find(
          (obj) => obj.id === relation.object_type_id,
        );
        return (
          <tr key={relation.id}>
            <td className="px-6 py-4 whitespace-nowrap">{objectType?.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <button
                onClick={() => handleEdit(relation)}
                className="text-blue-600 hover:text-blue-900 mr-3"
                title="수정"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={() => relation.id && handleDelete(relation.id)}
                className="text-red-600 hover:text-red-900"
                title="삭제"
              >
                <FiTrash2 />
              </button>
            </td>
          </tr>
        );
      })}
    </Table>
  );
};

export default MetricObjectRelationTable;
