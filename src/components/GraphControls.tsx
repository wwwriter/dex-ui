import React from "react";

interface GraphControlsProps {
  showGroups: boolean;
  showMetrics: boolean;
  onToggleGroups: (value: boolean) => void;
  onToggleMetrics: (value: boolean) => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  showGroups,
  showMetrics,
  onToggleGroups,
  onToggleMetrics,
}) => {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
      <div className="flex flex-col space-y-2">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600"
            checked={showGroups}
            onChange={(e) => onToggleGroups(e.target.checked)}
          />
          <span className="ml-2 text-sm font-medium text-gray-900">
            그룹별로 표시
          </span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600"
            checked={showMetrics}
            onChange={(e) => onToggleMetrics(e.target.checked)}
          />
          <span className="ml-2 text-sm font-medium text-gray-900">
            지표 표시
          </span>
        </label>
      </div>
    </div>
  );
};

export default GraphControls;
