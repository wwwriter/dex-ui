import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Knowledge } from "../types";
import { knowledgeApi } from "../api/dexApi";
import MDEditor from "@uiw/react-md-editor";

interface KnowledgeFormProps {
  initialData?: Knowledge;
  isEditing?: boolean;
}

const KnowledgeForm = ({
  initialData,
  isEditing = false,
}: KnowledgeFormProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Knowledge>>({
    name: "",
    label: "",
    description: "",
    mermaid: "",
    link: "",
    ontology_id: Number(ontology_id),
  });

  // 편집 모드인 경우 초기 데이터 불러오기
  const { id } = useParams<{ id: string }>();
  const {
    data: knowledgeData,
    isLoading: isLoadingKnowledge,
    error: knowledgeError,
  } = useQuery({
    queryKey: ["knowledge", id],
    queryFn: () => knowledgeApi.getById(Number(id)),
    enabled: isEditing && !!id,
  });

  // 편집 모드에서 데이터가 로드되면 폼 상태 업데이트
  useEffect(() => {
    if (isEditing && knowledgeData) {
      setFormData({
        name: knowledgeData.name,
        label: knowledgeData.label,
        description: knowledgeData.description,
        mermaid: knowledgeData.mermaid,
        link: knowledgeData.link,
        ontology_id: knowledgeData.ontology_id,
      });
    }
  }, [isEditing, knowledgeData]);

  // 입력 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 마크다운 에디터 변경 핸들러
  const handleDescriptionChange = (value?: string) => {
    setFormData((prev) => ({ ...prev, description: value || "" }));
  };

  // 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && id) {
        await knowledgeApi.update(Number(id), formData);
      } else {
        await knowledgeApi.create(
          formData as Omit<
            Knowledge,
            "id" | "created_at" | "updated_at" | "deleted_at"
          >
        );
      }
      navigate(`/ontologies/${ontology_id}/knowlege`);
    } catch (error) {
      console.error("지식 저장 중 오류 발생:", error);
      alert("지식 저장 중 오류가 발생했습니다.");
    }
  };

  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    if (!formData.name || !formData.description || !id) return;

    setIsSummarizing(true);
    try {
      const response = await fetch(
        `https://data-api.soneuro-handmade.com/api/knowledge/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.name,
            content: formData.description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("요약 생성에 실패했습니다");
      }

      const result = await response.json();
      setFormData((prev) => ({
        ...prev,
        description: result.summary || prev.description,
      }));
    } catch (error) {
      console.error("요약 생성 중 오류 발생:", error);
      alert("요약 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSummarizing(false);
    }
  };

  if (isEditing && isLoadingKnowledge) {
    return <div className="text-center py-10">데이터를 불러오는 중...</div>;
  }

  if (isEditing && knowledgeError) {
    return (
      <div className="text-center py-10 text-red-600">
        오류가 발생했습니다: {String(knowledgeError)}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isEditing ? "지식 편집" : "새 지식 생성"}
        </h2>
        {isEditing && (
          <button
            type="button"
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            {isSummarizing ? "요약 중..." : "요약하기"}
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-4"
      >
        <div className="flex flex-row gap-4 mb-4">
          <div className="w-1/2 ">
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
          <div className="w-1/2">
            <label
              htmlFor="link"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              링크
            </label>
            <input
              type="url"
              id="link"
              name="link"
              value={formData.link || ""}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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
          <div data-color-mode="light">
            <MDEditor
              preview="preview"
              value={formData.description || ""}
              onChange={handleDescriptionChange}
              height={400}
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="mermaid"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mermaid 다이어그램
          </label>
          <textarea
            id="mermaid"
            name="mermaid"
            value={formData.mermaid || ""}
            onChange={handleChange}
            rows={6}
            placeholder="graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;"
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Mermaid 마크다운 형식으로 다이어그램을 작성하세요.
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/ontologies/${ontology_id}/knowlege`)}
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

export default KnowledgeForm;
