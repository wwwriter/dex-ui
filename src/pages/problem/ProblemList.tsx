import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { problemApi, problemBookmarkApi } from "../../api/dexApi";
import { Problem } from "../../types";
import ItemCard from "../../components/ItemCard";
import { createListQueryKey } from "../../api/query-keys";
import { useUser } from "../../hooks/useUser";
import ListPageLayout from "../../components/ListPageLayout";

const ProblemList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { profile } = useUser();
  const queryKey = createListQueryKey("problems", {
    filters: { ontology_id },
  });

  const {
    data: problems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => problemApi.getAll(Number(ontology_id)),
  });

  const knowledgeQueryKey = createListQueryKey("problemBookmarks", {
    filters: { user_id: profile?.id },
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: knowledgeQueryKey,
    queryFn: () =>
      problemBookmarkApi.getAll({ filters: { user_id: profile?.id } }),
  });

  const problemsWithBookmarks = problems.map((problem) => ({
    ...problem,
    isBookmarked: bookmarks.some(
      (bookmark) => bookmark.problem_id === problem.id,
    ),
    problem_bookmarks: bookmarks.filter(
      (bookmark) => bookmark.problem_id === problem.id,
    ),
  }));

  const sortedProblems = [...problemsWithBookmarks].sort((a, b) => {
    // 북마크된 항목이 위로 오도록 정렬
    if (a.isBookmarked && !b.isBookmarked) return -1;
    if (!a.isBookmarked && b.isBookmarked) return 1;
    // 북마크 상태가 같다면 생성일 기준 내림차순 정렬
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => problemApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const createBookmarkMutation = useMutation({
    mutationFn: (problem_id: number) =>
      problemBookmarkApi.create({
        problem_id,
        user_id: Number(profile?.id),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: (id: number) => problemBookmarkApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: knowledgeQueryKey });
    },
  });

  const handleBookmark = (e: React.MouseEvent, problem: Problem) => {
    e.preventDefault(); // 링크 이동을 방지
    e.stopPropagation(); // 이벤트 버블링 방지

    if (
      problem.isBookmarked &&
      problem.problem_bookmarks &&
      problem.problem_bookmarks.length > 0
    ) {
      // 북마크 삭제
      const bookmarkId = problem.problem_bookmarks[0].id;
      deleteBookmarkMutation.mutate(bookmarkId);
    } else {
      // 북마크 추가
      createBookmarkMutation.mutate(problem.id);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("정말로 이 문제를 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <ListPageLayout
      title="문제 목록"
      addButtonText="문제"
      addButtonLink={`/ontologies/${ontology_id}/problems/new`}
      isEmpty={problems.length === 0}
      emptyMessage="표시할 문제가 없습니다."
      emptyButtonLink={`/ontologies/${ontology_id}/problems/new`}
      emptyButtonText="첫 번째 문제 추가하기"
      isLoading={isLoading}
      error={error}
    >
      {sortedProblems.map((problem) => (
        <ItemCard
          key={problem.id}
          id={problem.id}
          name={problem.name}
          description={problem.description || ""}
          isBookmarked={problem.isBookmarked}
          ontologyId={ontology_id || ""}
          itemType="problems"
          onBookmark={(e) => handleBookmark(e, problem)}
          onDelete={() => handleDelete(problem.id)}
          onItemClick={(e) =>
            navigate(`/ontologies/${ontology_id}/problems/${problem.id}`)
          }
          created_at={problem.created_at}
        />
      ))}
    </ListPageLayout>
  );
};

export default ProblemList;
