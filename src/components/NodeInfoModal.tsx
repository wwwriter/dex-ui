import React from "react";
import { ObjectType, Metric } from "../types";
import { FiStar } from "react-icons/fi";
import {
  getMetricTypeClassName,
  getMetricTypeInfo,
} from "../utils/metricUtils";
import { useQuery } from "@tanstack/react-query";
import { propertyApi } from "../api/dexApi";

interface NodeInfoModalProps {
  selectedNode: ObjectType | Metric;
  modalType: "object" | "metric";
  onClose: () => void;
}

const NodeInfoModal: React.FC<NodeInfoModalProps> = ({
  selectedNode,
  modalType,
  onClose,
}) => {
  // 선택된 노드의 타입에 따라 표시할 정보를 결정
  const isMetric = modalType === "metric";

  // ObjectType인 경우 Properties 가져오기
  const { data: properties = [] } = useQuery({
    queryKey: ["properties", (selectedNode as ObjectType).id],
    queryFn: () =>
      propertyApi.getAll(
        (selectedNode as ObjectType).ontology_id || undefined,
        {
          filters: { object_type_id: (selectedNode as ObjectType).id },
        }
      ),
    enabled: !isMetric && !!(selectedNode as ObjectType).id,
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed right-0 top-1/2 -translate-y-1/2 mr-6 min-w-[300px]">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-auto shadow-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-sm md:text-lg font-semibold text-gray-900">
              {selectedNode.name}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              {isMetric && !!(selectedNode as Metric).is_main_metric && (
                <div className="flex items-center text-yellow-500">
                  <FiStar size={14} className="mr-1" />
                  <span className="text-[10px] md:text-sm">주요 지표</span>
                </div>
              )}

              {selectedNode.description && (
                <div>
                  <h4 className="text-[10px] md:text-xs font-medium text-gray-500">
                    설명
                  </h4>
                  <p className="mt-1 text-[10px] md:text-sm">
                    {selectedNode.description}
                  </p>
                </div>
              )}

              {isMetric && "type" in selectedNode && (
                <div>
                  <h4 className="text-[10px] md:text-xs font-medium text-gray-500">
                    지표 유형
                  </h4>
                  <div className="mt-1">
                    <span
                      className={`${getMetricTypeClassName((selectedNode as Metric).type)} text-[10px] md:text-xs`}
                    >
                      {getMetricTypeInfo((selectedNode as Metric).type).label}
                    </span>
                  </div>
                </div>
              )}

              {!isMetric && properties.length > 0 && (
                <div>
                  <h4 className="text-[10px] md:text-xs font-medium text-gray-500 mb-2">
                    속성 목록
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
                            이름
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {properties.map((property) => (
                          <tr key={property.id}>
                            <td className="px-4 py-2 text-[10px] md:text-sm text-gray-900">
                              {property.name}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeInfoModal;
