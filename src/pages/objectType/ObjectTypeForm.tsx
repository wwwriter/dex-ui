import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ObjectType } from "../../types";
import { objectTypeApi } from "../../api/dexApi";
import { createDetailQueryKey } from "../../api/query-keys";

interface ObjectTypeFormProps {
  initialData?: ObjectType;
  isEditing?: boolean;
}

const ObjectTypeForm = ({
  initialData,
  isEditing = false,
}: ObjectTypeFormProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<ObjectType>>({
    name: "",
    label: "",
    description: "",
    ontology_id: Number(ontology_id),
  });

  // 편집 모드인 경우 초기 데이터 불러오기
  const { id } = useParams<{ id: string }>();
  const {
    data: objectTypeData,
    isLoading: isLoadingObjectType,
    error: objectTypeError,
  } = useQuery({
    queryKey: createDetailQueryKey("objectTypes", Number(id)),
    queryFn: () => objectTypeApi.getById(Number(id)),
    enabled: isEditing && !!id,
  });

  // 편집 모드에서 데이터가 로드되면 폼 상태 업데이트
  useEffect(() => {
    if (isEditing && objectTypeData) {
      setFormData({
        name: objectTypeData.name,
        label: objectTypeData.label,
        description: objectTypeData.description,
        ontology_id: objectTypeData.ontology_id,
      });
    }
  }, [isEditing, objectTypeData]);

  // 입력 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && id) {
        await objectTypeApi.update(Number(id), formData);
      } else {
        await objectTypeApi.create(
          formData as Omit<ObjectType, "id" | "created_at" | "updated_at">
        );
      }
      navigate(`/ontologies/${ontology_id}/object-types`);
    } catch (error) {
      console.error("객체 타입 저장 중 오류 발생:", error);
      alert("객체 타입 저장 중 오류가 발생했습니다.");
    }
  };

  if (isEditing && isLoadingObjectType) {
    return <div className="text-center py-10">데이터를 불러오는 중...</div>;
  }

  if (isEditing && objectTypeError) {
    return (
      <div className="text-center py-10 text-red-600">
        오류가 발생했습니다: {String(objectTypeError)}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEditing ? "객체 타입 편집" : "새 객체 타입 생성"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-4"
      >
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이름 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="label"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            레이블
          </label>
          <input
            type="text"
            id="label"
            name="label"
            value={formData.label || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            설명
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/ontologies/${ontology_id}/object-types`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEditing ? "저장" : "생성"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ObjectTypeForm;
