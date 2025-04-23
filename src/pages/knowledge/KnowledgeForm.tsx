import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Knowledge } from "../../types";
import { knowledgeApi } from "../../api/dexApi";
import { createDetailQueryKey } from "../../api/query-keys";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import MarkdownEditor from "../../components/MarkdownEditor";
import FormInput from "../../components/FormInput";
import FormButton from "../../components/FormButton";
import FormLayout from "../../components/FormLayout";

interface KnowledgeFormProps {
  initialData?: Knowledge;
  isEditing?: boolean;
}

const removeThinkTags = (text: string): string => {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "");
};

const KnowledgeForm = ({
  initialData,
  isEditing = false,
}: KnowledgeFormProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const navigate = useNavigate();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Knowledge>>({
    name: "",
    label: "",
    description: "",
    summary: "",
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
    queryKey: createDetailQueryKey("knowledge", Number(id)),
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
        summary: knowledgeData.summary,
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
  const handleDescriptionChange = (key: string, value?: string) => {
    setFormData((prev) => ({ ...prev, [key]: value || "" }));
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
      if (id) {
        navigate(`/ontologies/${ontology_id}/knowledge/${id}`);
      } else {
        navigate(`/ontologies/${ontology_id}/knowledge`);
      }
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
    <FormLayout
      title="지식"
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/ontologies/${ontology_id}/knowledge`)}
      isEditing={isEditing}
      isLoading={isEditing && isLoadingKnowledge}
      error={isEditing ? knowledgeError : null}
      additionalActions={
        isEditing && (
          <FormButton
            type="button"
            onClick={handleSummarize}
            disabled={isSummarizing}
            variant="primary"
          >
            {isSummarizing ? "요약 중..." : "요약하기"}
          </FormButton>
        )
      }
    >
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="w-full lg:w-1/2">
          <FormInput
            label="이름"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            required
          />
        </div>
        <div className="w-full ">
          <FormInput
            label="링크"
            name="link"
            value={formData.link || ""}
            onChange={handleChange}
            type="url"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="flex flex-col  gap-4">
        <div className="w-full ">
          <MarkdownEditor
            label="요약"
            value={formData.summary || ""}
            onChange={(value) => handleDescriptionChange("summary", value)}
            height={600}
          />
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="w-full lg:w-1/2">
            <MarkdownEditor
              label="설명"
              value={formData.description || ""}
              onChange={(value) =>
                handleDescriptionChange("description", value)
              }
              height={600}
            />
          </div>
          <div className="w-full lg:w-1/2">
            <FormInput
              label="Mermaid 다이어그램"
              name="mermaid"
              value={formData.mermaid || ""}
              onChange={handleChange}
              type="textarea"
              rows={29}
              placeholder="graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;"
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Mermaid 마크다운 형식으로 다이어그램을 작성하세요.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <FormButton
          type="button"
          onClick={() => navigate(`/ontologies/${ontology_id}/knowledge`)}
          variant="secondary"
        >
          취소
        </FormButton>
        <FormButton type="submit">{isEditing ? "저장" : "생성"}</FormButton>
      </div>
    </FormLayout>
  );
};

export default KnowledgeForm;
