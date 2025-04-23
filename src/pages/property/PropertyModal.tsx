import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Property,
  PropertyDataType,
  PropertyDimensionType,
  PropertyEntityType,
} from "../../types";
import { propertyApi } from "../../api/dexApi";

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  ontology_id: number;
  object_type_id: number;
}

const PropertyModal = ({
  isOpen,
  onClose,
  property,
  ontology_id,
  object_type_id,
}: PropertyModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<Property>>({
    name: "",
    description: "",
    data_type: "string",
    entity_type: "natural",
    dimension_type: null,
    ontology_id,
    object_type_id,
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        description: property.description,
        data_type: property.data_type,
        dimension_type: property.dimension_type,
        entity_type: property.entity_type,
        ontology_id,
        object_type_id,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        data_type: "string",
        entity_type: "natural",
        dimension_type: null,
      });
    }
  }, [property, ontology_id, object_type_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (property) {
        await propertyApi.update(property.id, {
          ...formData,
          ontology_id,
          object_type_id,
        });
      } else {
        await propertyApi.create({
          name: formData.name || "",
          description: formData.description || null,
          data_type: formData.data_type || "string",
          dimension_type: formData.dimension_type || null,
          entity_type: formData.entity_type || null,
          ontology_id,
          object_type_id,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["properties", ontology_id, object_type_id],
      });
      setFormData({
        name: "",
        description: "",
        data_type: "string",
        entity_type: "natural",
        dimension_type: null,
      });
      onClose();
    } catch (error) {
      console.error("속성 저장 중 오류 발생:", error);
      alert("속성 저장 중 오류가 발생했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {property ? "속성 수정" : "새 속성 추가"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              데이터 타입 *
            </label>
            <select
              value={formData.data_type || "string"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  data_type: e.target.value as PropertyDataType,
                })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="date">date</option>
              <option value="timestamp">timestamp</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              차원 타입
            </label>
            <select
              value={formData.dimension_type || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dimension_type: e.target.value
                    ? (e.target.value as PropertyDimensionType)
                    : null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">선택해주세요</option>
              <option value="time">time</option>
              <option value="categorical">categorical</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              엔티티 타입
            </label>
            <select
              value={formData.entity_type || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  entity_type: e.target.value
                    ? (e.target.value as PropertyEntityType)
                    : null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">선택해주세요</option>
              <option value="primary">primary</option>
              <option value="foreign">foreign</option>
              <option value="unique">unique</option>
              <option value="natural">natural</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
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
              {property ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;
