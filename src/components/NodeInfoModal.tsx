import React from "react";
import { ObjectType, Metric } from "../types";

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

  return (
    <div className="fixed inset-0 bg-black/50 z-50">
      <div className="fixed right-0 top-1/2 -translate-y-1/2 mr-6">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-auto shadow-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {isMetric ? "지표 정보" : "객체 타입 정보"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              <div>
                <h4 className="text-sm font-medium text-gray-500">ID</h4>
                <p className="mt-1">{selectedNode.id}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">이름</h4>
                <p className="mt-1">{selectedNode.name}</p>
              </div>

              {selectedNode.label && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">라벨</h4>
                  <p className="mt-1">{selectedNode.label}</p>
                </div>
              )}

              {selectedNode.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">설명</h4>
                  <p className="mt-1">{selectedNode.description}</p>
                </div>
              )}

              {isMetric && "type" in selectedNode && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    지표 유형
                  </h4>
                  <p className="mt-1">{selectedNode.type}</p>
                </div>
              )}

              {isMetric && "is_main_metric" in selectedNode && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    주요 지표
                  </h4>
                  <p className="mt-1">
                    {(selectedNode as Metric).is_main_metric ? "예" : "아니오"}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">생성일</h4>
                <p className="mt-1">
                  {new Date(selectedNode.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">수정일</h4>
                <p className="mt-1">
                  {new Date(selectedNode.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeInfoModal;
