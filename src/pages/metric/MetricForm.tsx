import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Metric } from "../../types";
import { metricApi } from "../../api/dexApi";
import { createDetailQueryKey } from "../../api/query-keys";

interface MetricFormProps {
  initialData?: Metric;
  isEditing?: boolean;
}

const MetricForm = ({ initialData, isEditing = false }: MetricFormProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Metric>>({
    name: "",
    label: "",
    description: "",
    is_main_metric: false,
    type: "simple",
    type_params: {},
    filter: "",
    dimension: null,
    children: null,
    ontology_id: Number(ontology_id),
    measure_type_id: null,
  });

  // 편집 모드인 경우 초기 데이터 불러오기
  const { id } = useParams<{ id: string }>();
  const {
    data: metricData,
    isLoading: isLoadingMetric,
    error: metricError,
  } = useQuery({
    queryKey: createDetailQueryKey("metrics", Number(id)),
    queryFn: () => metricApi.getById(Number(id)),
    enabled: isEditing && !!id,
  });

  // 편집 모드에서 데이터가 로드되면 폼 상태 업데이트
  useEffect(() => {
    if (isEditing && metricData) {
      setFormData({
        name: metricData.name,
        label: metricData.label,
        description: metricData.description,
        is_main_metric: metricData.is_main_metric,
        type: metricData.type,
        type_params: metricData.type_params,
        filter: metricData.filter,
        dimension: metricData.dimension,
        children: metricData.children,
        ontology_id: metricData.ontology_id,
        measure_type_id: metricData.measure_type_id,
      });
    }
  }, [isEditing, metricData]);

  // 입력 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // 체크박스의 경우 checked 속성 사용
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && id) {
        await metricApi.update(Number(id), formData);
      } else {
        await metricApi.create(
          formData as Omit<Metric, "id" | "created_at" | "updated_at">
        );
      }
      navigate(`/ontologies/${ontology_id}/metrics`);
    } catch (error) {
      console.error("지표 저장 중 오류 발생:", error);
      alert("지표 저장 중 오류가 발생했습니다.");
    }
  };

  if (isEditing && isLoadingMetric) {
    return <div className="text-center py-10">데이터를 불러오는 중...</div>;
  }

  if (isEditing && metricError) {
    return (
      <div className="text-center py-10 text-red-600">
        오류가 발생했습니다: {String(metricError)}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEditing ? "지표 편집" : "새 지표 생성"}
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

        {/* <div className="mb-4">
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
        </div> */}

        <div className="mb-4">
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

        <div className="mb-4">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_main_metric"
              checked={formData.is_main_metric || false}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm font-medium text-gray-900">
              주요 지표로 설정
            </span>
          </label>
        </div>

        <div className="mb-4">
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            지표 유형 *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type || "simple"}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="simple">단순</option>
            <option value="derived">파생</option>
            <option value="cumulative">누적</option>
            <option value="ratio">비율</option>
            <option value="conversion">전환</option>
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            필터
          </label>
          <input
            type="text"
            id="filter"
            name="filter"
            value={formData.filter || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            지표를 계산할 때 적용할 필터 조건을 입력하세요.
          </p>
        </div>

        {(formData.type === "derived" ||
          formData.type === "ratio" ||
          formData.type === "conversion") && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500 mb-2">
              {formData.type === "derived" &&
                "파생 지표는 다른 지표들의 조합으로 계산됩니다."}
              {formData.type === "ratio" &&
                "비율 지표는 두 지표의 비율로 계산됩니다."}
              {formData.type === "conversion" &&
                "전환 지표는 시작 지표와 종료 지표 간의 전환율을 계산합니다."}
            </p>
            <p className="text-sm text-gray-600">
              지표를 먼저 생성한 후, 상세 설정에서 필요한 관계를 구성할 수
              있습니다.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(`/ontologies/${ontology_id}/metrics`)}
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

export default MetricForm;
