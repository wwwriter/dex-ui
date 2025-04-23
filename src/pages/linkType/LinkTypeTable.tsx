import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LinkType } from "../../types";
import { linkTypeApi } from "../../api/dexApi";
import LinkTypeModal from "./LinkTypeModal";

import { FiEdit2, FiTrash2 } from "react-icons/fi";
interface LinkTypeTableProps {
  ontology_id: number;
  object_type_id: number;
}

const LinkTypeTable = ({ ontology_id, object_type_id }: LinkTypeTableProps) => {
  const [selectedLinkType, setSelectedLinkType] = useState<LinkType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: linkTypes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["linkTypes", ontology_id, object_type_id],
    queryFn: () =>
      linkTypeApi.getAll(ontology_id, {
        filters: { source_object_type_id: object_type_id },
      }),
  });

  const handleEdit = (linkType: LinkType) => {
    setSelectedLinkType(linkType);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("정말로 이 링크 타입을 삭제하시겠습니까?")) {
      try {
        await linkTypeApi.delete(id);
      } catch (error) {
        console.error("링크 타입 삭제 중 오류 발생:", error);
        alert("링크 타입 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류가 발생했습니다.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">링크 타입 목록</h2>
        <button
          onClick={() => {
            setSelectedLinkType(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          새 링크 타입 추가
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
            {linkTypes?.map((linkType) => (
              <tr key={linkType.id}>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {linkType.name}
                </td>

                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  <button
                    onClick={() => handleEdit(linkType)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="수정"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDelete(linkType.id)}
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

      <LinkTypeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLinkType(null);
        }}
        linkType={selectedLinkType}
        ontology_id={ontology_id}
        object_type_id={object_type_id}
      />
    </div>
  );
};

export default LinkTypeTable;
