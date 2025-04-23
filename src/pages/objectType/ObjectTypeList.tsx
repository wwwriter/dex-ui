import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { objectTypeApi } from "../../api/dexApi";
import { ObjectType } from "../../types";
import { FiLayers } from "react-icons/fi";
import { createListQueryKey } from "../../api/query-keys";
import DropdownMenu from "../../components/DropdownMenu";
import ListPageLayout from "../../components/ListPageLayout";

const ObjectTypeList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const queryClient = useQueryClient();

  // 현재 온톨로지에 해당하는 객체 타입만 가져오기
  const {
    data: objectTypes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: createListQueryKey("objectTypes", {
      limit: 200,
      filters: { ontology_id: Number(ontology_id) },
    }),
    queryFn: () => objectTypeApi.getAll(Number(ontology_id), { limit: 200 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => objectTypeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectTypes", ontology_id] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("정말로 이 객체 타입을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <ListPageLayout
      title="객체 타입 목록"
      addButtonText="객체 타입"
      addButtonLink={`/ontologies/${ontology_id}/object-types/new`}
      isEmpty={objectTypes.length === 0}
      emptyMessage="표시할 객체 타입이 없습니다."
      emptyButtonLink={`/ontologies/${ontology_id}/object-types/new`}
      emptyButtonText="첫 번째 객체 타입 추가하기"
      isLoading={isLoading}
      error={error}
    >
      {objectTypes.map((objectType) => (
        <div key={objectType.id} className="relative">
          <div className="absolute top-4 right-4">
            <DropdownMenu onDelete={() => handleDelete(objectType.id)} />
          </div>
          <ObjectTypeCard objectType={objectType} />
        </div>
      ))}
    </ListPageLayout>
  );
};

interface ObjectTypeCardProps {
  objectType: ObjectType;
}

const ObjectTypeCard = ({ objectType }: ObjectTypeCardProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();

  return (
    <Link
      to={`/ontologies/${ontology_id}/object-types/${objectType.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
    >
      <div className="flex items-center mb-3">
        <span className="bg-purple-100 p-2 rounded-lg mr-3">
          <FiLayers className="text-purple-600" size={20} />
        </span>
        <h3 className="text-lg font-medium text-gray-900">{objectType.name}</h3>
      </div>

      {objectType.label && (
        <div className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-3">
          {objectType.label}
        </div>
      )}

      {objectType.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">
          {objectType.description}
        </p>
      )}

      <div className="text-xs text-gray-400">
        생성일: {new Date(objectType.created_at).toLocaleDateString()}
      </div>
    </Link>
  );
};

export default ObjectTypeList;
