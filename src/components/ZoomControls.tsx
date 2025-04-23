import React from "react";

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;

  onFitToScreen: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,

  onFitToScreen,
}) => {
  return (
    <div
      className="absolute z-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-md
                     right-4 top-3 md:left-4 md:bottom-auto md:right-auto
                    p-1.5 md:p-3"
    >
      <div className="flex flex-row md:flex-row items-center space-x-1.5 md:space-x-2">
        <button
          onClick={onZoomOut}
          className="p-1.5 md:p-2 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
          aria-label="축소"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>

        <span className="text-xs md:text-sm font-medium text-gray-700 min-w-[2.5rem] md:min-w-[3.5rem] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          className="p-1.5 md:p-2 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
          aria-label="확대"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        <button
          onClick={onFitToScreen}
          className="p-1.5 md:p-2 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
          aria-label="화면에 맞추기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 md:h-5 md:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ZoomControls;
