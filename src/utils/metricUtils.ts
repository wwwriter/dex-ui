import { Metric } from "../types";

export const getMetricTypeInfo = (type: Metric["type"]) => {
  const typeInfo = {
    simple: {
      label: "단순",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    derived: {
      label: "파생",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
    },
    cumulative: {
      label: "누적",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
    },
    ratio: {
      label: "비율",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
    },
    conversion: {
      label: "전환",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
    },
  };

  return (
    typeInfo[type] || {
      label: type,
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    }
  );
};

export const getMetricTypeClassName = (type: Metric["type"]) => {
  const { bgColor, textColor } = getMetricTypeInfo(type);
  return `inline-block px-2 py-1 rounded-full text-xs ${bgColor} ${textColor}`;
};
