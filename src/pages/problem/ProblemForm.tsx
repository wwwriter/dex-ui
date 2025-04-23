import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Problem } from "../../types";
import { problemApi } from "../../api/dexApi";
import { createDetailQueryKey } from "../../api/query-keys";
import { INITIAL_PROBLEM_DATA } from "./constant";
import MarkdownEditor from "../../components/MarkdownEditor";
import FormInput from "../../components/FormInput";
import FormButton from "../../components/FormButton";
import FormLayout from "../../components/FormLayout";

interface ProblemFormProps {
  initialData?: Problem;
  isEditing?: boolean;
}

const ProblemForm = ({ initialData, isEditing = false }: ProblemFormProps) => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Problem>>({
    name: "",

    mermaid: "",
    description: INITIAL_PROBLEM_DATA,
    ontology_id: Number(ontology_id),
  });

  // 편집 모드인 경우 초기 데이터 불러오기
  const { id } = useParams<{ id: string }>();
  const {
    data: problemData,
    isLoading: isLoadingProblem,
    error: problemError,
  } = useQuery({
    queryKey: createDetailQueryKey("problems", Number(id)),
    queryFn: () => problemApi.getById(Number(id)),
    enabled: isEditing && !!id,
  });

  // 편집 모드에서 데이터가 로드되면 폼 상태 업데이트
  useEffect(() => {
    if (isEditing && problemData) {
      setFormData({
        name: problemData.name,

        mermaid: problemData.mermaid,
        description: problemData.description,
        ontology_id: problemData.ontology_id,
      });
    }
  }, [isEditing, problemData]);

  // 입력 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
        await problemApi.update(Number(id), formData);
      } else {
        await problemApi.create(
          formData as Omit<
            Problem,
            "id" | "created_at" | "updated_at" | "deleted_at"
          >,
        );
      }
      navigate(`/ontologies/${ontology_id}/problems`);
    } catch (error) {
      console.error("문제 저장 중 오류 발생:", error);
      alert("문제 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <FormLayout
      title="문제"
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/ontologies/${ontology_id}/problems`)}
      isEditing={isEditing}
      isLoading={isEditing && isLoadingProblem}
      error={isEditing ? problemError : null}
    >
      <FormInput
        label="이름"
        name="name"
        value={formData.name || ""}
        onChange={handleChange}
        required
      />

      <div className="w-full">
        <MarkdownEditor
          label="설명"
          value={formData.description || ""}
          onChange={handleDescriptionChange}
          height={600}
        />
      </div>

      <div className="w-full">
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

      <div className="flex justify-end space-x-4">
        <FormButton
          type="button"
          onClick={() => navigate(`/ontologies/${ontology_id}/problems`)}
          variant="secondary"
        >
          취소
        </FormButton>
        <FormButton type="submit">{isEditing ? "저장" : "생성"}</FormButton>
      </div>
    </FormLayout>
  );
};

export default ProblemForm;
