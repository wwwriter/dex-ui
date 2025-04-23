import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Property } from "../../types";
import { propertyApi } from "../../api/dexApi";
import { createDetailQueryKey } from "../../api/query-keys";
import PropertyModal from "./PropertyModal";

import { FiEdit2, FiTrash2 } from "react-icons/fi";
interface PropertyTableProps {
  ontology_id: number;
  object_type_id: number;
}

const PropertyTable = ({ ontology_id, object_type_id }: PropertyTableProps) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: properties,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["properties", ontology_id, object_type_id],
    queryFn: () =>
      propertyApi.getAll(ontology_id, { filters: { object_type_id } }),
  });

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("정말로 이 속성을 삭제하시겠습니까?")) {
      try {
        await propertyApi.delete(id);
        // 쿼리 무효화 및 새로고침
      } catch (error) {
        console.error("속성 삭제 중 오류 발생:", error);
        alert("속성 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류가 발생했습니다.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">속성 목록</h2>
        <button
          onClick={() => {
            setSelectedProperty(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          새 속성 추가
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>

              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {properties?.map((property) => (
              <tr key={property.id}>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {property.name}
                </td>

                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  <button
                    onClick={() => handleEdit(property)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="수정"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="text-red-600 hover:text-red-900"
                    title="삭제"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PropertyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
        ontology_id={ontology_id}
        object_type_id={object_type_id}
      />
    </div>
  );
};

export default PropertyTable;
