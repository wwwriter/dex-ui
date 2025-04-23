import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { metricApi } from "../../api/dexApi";
import { Metric } from "../../types";
import { FiBarChart2, FiStar } from "react-icons/fi";
import { createListQueryKey } from "../../api/query-keys";
import DropdownMenu from "../../components/DropdownMenu";
import ListPageLayout from "../../components/ListPageLayout";
import {
  getMetricTypeClassName,
  getMetricTypeInfo,
} from "../../utils/metricUtils";

const MetricList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const queryClient = useQueryClient();

  const {
    data: metrics = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: createListQueryKey("metrics", {
      limit: 200,
      filters: { ontology_id: Number(ontology_id) },
    }),
    queryFn: () => metricApi.getAll(Number(ontology_id), { limit: 200 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => metricApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics", ontology_id] });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("정말로 이 지표를 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  // 주요 지표와 일반 지표로 분리
  const mainMetrics = metrics.filter((metric) => !!metric.is_main_metric);
  const otherMetrics = metrics.filter((metric) => !metric.is_main_metric);

  return (
    <ListPageLayout
      title="지표 목록"
      addButtonText="지표"
      addButtonLink={`/ontologies/${ontology_id}/metrics/new`}
      isEmpty={metrics.length === 0}
      emptyMessage="표시할 지표가 없습니다."
      emptyButtonLink={`/ontologies/${ontology_id}/metrics/new`}
      emptyButtonText="첫 번째 지표 추가하기"
      isLoading={isLoading}
      error={error}
    >
      {mainMetrics.length > 0 && (
        <div className="col-span-full">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
            <FiStar className="mr-2 text-yellow-500" />
            주요 지표
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainMetrics.map((metric) => (
              <div key={metric.id} className="relative">
                <div className="absolute top-4 right-4">
                  <DropdownMenu onDelete={() => handleDelete(metric.id)} />
                </div>
                <MetricCard metric={metric} />
              </div>
            ))}
          </div>
        </div>
      )}

      {otherMetrics.length > 0 && (
        <div className="col-span-full">
          <h3 className="text-lg font-medium text-gray-800 mb-4">일반 지표</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherMetrics.map((metric) => (
              <div key={metric.id} className="relative">
                <div className="absolute top-4 right-4">
                  <DropdownMenu onDelete={() => handleDelete(metric.id)} />
                </div>
                <MetricCard metric={metric} />
              </div>
            ))}
          </div>
        </div>
      )}
    </ListPageLayout>
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
          {!!metric.is_main_metric && (
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
          {getMetricTypeInfo(metric.type).label}
        </span>
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
