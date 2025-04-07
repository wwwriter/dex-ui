import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { objectTypeApi } from "../api/dexApi";
import { ObjectType } from "../types";
import { FiPlus, FiLayers } from "react-icons/fi";

const ObjectTypeList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();

  // 현재 온톨로지에 해당하는 객체 타입만 가져오기
  const {
    data: objectTypes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["objectTypes", ontology_id],
    queryFn: () => objectTypeApi.getAll(Number(ontology_id)),
  });

  if (isLoading) {
    return <div className="text-center py-10">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        오류가 발생했습니다: {String(error)}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">객체 타입 목록</h2>
        <Link
          to={`/ontologies/${ontology_id}/object-types/new`}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />새 객체 타입 추가
        </Link>
      </div>

      {objectTypes.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">표시할 객체 타입이 없습니다.</p>
          <Link
            to={`/ontologies/${ontology_id}/object-types/new`}
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            첫 번째 객체 타입 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {objectTypes.map((objectType) => (
            <ObjectTypeCard key={objectType.id} objectType={objectType} />
          ))}
        </div>
      )}
    </div>
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
