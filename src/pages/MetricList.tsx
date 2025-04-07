import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { metricApi } from "../api/dexApi";
import { Metric } from "../types";
import { FiPlus, FiBarChart2, FiStar } from "react-icons/fi";

const MetricList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();

  // 현재 온톨로지에 해당하는 지표만 가져오기
  const {
    data: metrics = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["metrics", ontology_id],
    queryFn: () => metricApi.getAll(Number(ontology_id), { limit: 40 }),
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

  // 주요 지표와 일반 지표로 분리
  const mainMetrics = metrics.filter((metric) => metric.is_main_metric);
  const otherMetrics = metrics.filter((metric) => !metric.is_main_metric);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">지표 목록</h2>
        <Link
          to={`/ontologies/${ontology_id}/metrics/new`}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />새 지표 추가
        </Link>
      </div>

      {metrics.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">표시할 지표가 없습니다.</p>
          <Link
            to={`/ontologies/${ontology_id}/metrics/new`}
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            첫 번째 지표 추가하기
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {mainMetrics.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <FiStar className="mr-2 text-yellow-500" />
                주요 지표
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mainMetrics.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
              </div>
            </div>
          )}

          {otherMetrics.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                일반 지표
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherMetrics.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  metric: Metric;
}

const MetricCard = ({ metric }: MetricCardProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();

  // 지표 유형에 따른 배경색 및 텍스트 색상 설정
  const typeColors = {
    simple: { bg: "bg-blue-100", text: "text-blue-800" },
    derived: { bg: "bg-green-100", text: "text-green-800" },
    cumulative: { bg: "bg-yellow-100", text: "text-yellow-800" },
    ratio: { bg: "bg-purple-100", text: "text-purple-800" },
    conversion: { bg: "bg-orange-100", text: "text-orange-800" },
  };
  const typeColor = typeColors[metric.type] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  return (
    <Link
      to={`/ontologies/${ontology_id}/metrics/${metric.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
    >
      <div className="flex items-center mb-3">
        <span className="bg-indigo-100 p-2 rounded-lg mr-3">
          <FiBarChart2 className="text-indigo-600" size={20} />
        </span>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
          {metric.is_main_metric && (
            <div className="flex items-center text-yellow-500 text-xs mt-1">
              <FiStar size={12} className="mr-1" />
              주요 지표
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center mb-3">
        <span
          className={`${typeColor.bg} ${typeColor.text} text-xs px-2 py-1 rounded-full`}
        >
          {metric.type === "simple" && "단순"}
          {metric.type === "derived" && "파생"}
          {metric.type === "cumulative" && "누적"}
          {metric.type === "ratio" && "비율"}
          {metric.type === "conversion" && "전환"}
        </span>

        {metric.label && (
          <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {metric.label}
          </span>
        )}
      </div>

      {metric.description && (
        <p className="text-gray-600 mb-4 line-clamp-3">{metric.description}</p>
      )}

      <div className="text-xs text-gray-400">
        생성일: {new Date(metric.created_at).toLocaleDateString()}
      </div>
    </Link>
  );
};

export default MetricList;
