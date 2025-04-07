import React from "react";

interface GraphLegendProps {
  selectedNodeId: string | null;
}

const OntologyLegend: React.FC<GraphLegendProps> = ({ selectedNodeId }) => {
  return (
    <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
      <div className="text-sm font-medium text-gray-900 mb-2">범례</div>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded mr-2"></div>
          <span className="text-xs text-gray-700">객체 타입</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-400 rounded mr-2"></div>
          <span className="text-xs text-gray-700">지표</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-pink-100 border border-pink-400 rounded mr-2"></div>
          <span className="text-xs text-gray-700">선택된 항목</span>
        </div>
        <div className="flex items-center">
          <hr className="w-8 border-blue-400 mr-2" />
          <span className="text-xs text-gray-700">객체 간 관계</span>
        </div>
        <div className="flex items-center">
          <hr className="w-8 border-blue-400 border-dashed mr-2" />
          <span className="text-xs text-gray-700">측정 관계</span>
        </div>
      </div>

      {selectedNodeId && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-900">
            선택됨: {selectedNodeId}
          </div>
        </div>
      )}
    </div>
  );
};

export default OntologyLegend;
