import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  knowledgeApi,
  knowledgeBookmarkApi,
  ontologyApi,
} from "../../api/dexApi";
import { Knowledge, Ontology } from "../../types";
import { FiPlus, FiMove } from "react-icons/fi";
import YouTubeSummaryButton from "../../components/YouTubeSummaryButton";
import { createListQueryKey } from "../../api/query-keys";
import { useState, useEffect, useCallback, KeyboardEvent } from "react";
import SearchButton from "../../components/SearchButton";
import SearchModal from "../../components/SearchModal";
import { useUser } from "../../hooks/useUser";
import ItemCard from "../../components/ItemCard";

const KnowledgeList = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearchQuery = searchParams.get("q") || "";

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(currentSearchQuery);
  const [targetOntologyId, setTargetOntologyId] = useState<string>("");
  const [isCommandKeyPressed, setIsCommandKeyPressed] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { profile } = useUser();
  const queryKey = createListQueryKey("knowledge", {
    limit: 200,
    sort: "updated_at.desc",
    filters: {
      ontology_id: Number(ontology_id),
      "name[search]": currentSearchQuery,
    },
  });

  const bookmarkQueryKey = createListQueryKey("knowledgeBookmarks", {
    filters: { user_id: profile?.id },
  });

  // 현재 온톨로지에 해당하는 지식만 가져오기
  const {
    data: knowledgeList = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: () =>
      knowledgeApi.getAll(Number(ontology_id), {
        limit: 200,
        sort: "updated_at.desc",
        filters: { "name[search]": currentSearchQuery },
      }),
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: bookmarkQueryKey,
    queryFn: () =>
      knowledgeBookmarkApi.getAll({ filters: { user_id: profile?.id } }),
  });

  const knowledgeWithBookmarks = knowledgeList.map((knowledge) => ({
    ...knowledge,
    isBookmarked: bookmarks.some(
      (bookmark) => bookmark.knowledge_id === knowledge.id,
    ),
    knowledge_bookmarks: bookmarks.filter(
      (bookmark) => bookmark.knowledge_id === knowledge.id,
    ),
  }));

  const sortedKnowledge = [...knowledgeWithBookmarks].sort((a, b) => {
    // 북마크된 항목이 위로 오도록 정렬
    if (a.isBookmarked && !b.isBookmarked) return -1;
    if (!a.isBookmarked && b.isBookmarked) return 1;
    // 북마크 상태가 같다면 생성일 기준 내림차순 정렬
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  // 온톨로지 목록 가져오기
  const { data: ontologyList = [], isLoading: isOntologyLoading } = useQuery({
    queryKey: createListQueryKey("ontologies", {}),
    queryFn: () => ontologyApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 선택한 지식 항목들을 다른 온톨로지로 이동하는 뮤테이션
  const moveKnowledgeMutation = useMutation({
    mutationFn: async (data: {
      knowledgeIds: number[];
      targetOntologyId: number;
    }) => {
      const promises = data.knowledgeIds.map((id) =>
        knowledgeApi.patch(id, { ontology_id: data.targetOntologyId }),
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedItems([]);
      setIsMoveModalOpen(false);
    },
  });

  const createBookmarkMutation = useMutation({
    mutationFn: (knowledge_id: number) =>
      knowledgeBookmarkApi.create({
        knowledge_id,
        user_id: Number(profile?.id),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
    },
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: (id: number) => knowledgeBookmarkApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
    },
  });

  const handleBookmark = (e: React.MouseEvent, knowledge: Knowledge) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      knowledge.isBookmarked &&
      knowledge.knowledge_bookmarks &&
      knowledge.knowledge_bookmarks.length > 0
    ) {
      const bookmarkId = knowledge.knowledge_bookmarks[0].id;
      deleteBookmarkMutation.mutate(bookmarkId);
    } else {
      createBookmarkMutation.mutate(knowledge.id);
    }
  };

  // Command 키 감지 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "Control") {
        setIsCommandKeyPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "Control") {
        setIsCommandKeyPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown as any);
    window.addEventListener("keyup", handleKeyUp as any);

    return () => {
      window.removeEventListener("keydown", handleKeyDown as any);
      window.removeEventListener("keyup", handleKeyUp as any);
    };
  }, []);

  // 아이템 선택 토글
  const toggleItemSelection = useCallback((id: number) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  // 아이템 클릭 핸들러
  const handleItemClick = useCallback(
    (knowledge: Knowledge, e: React.MouseEvent) => {
      e.preventDefault();
      if (selectedItems.length > 0 || isCommandKeyPressed) {
        toggleItemSelection(knowledge.id);
      } else {
        // 선택 모드가 아닐 때만 링크 이동 허용
        navigate(`/ontologies/${ontology_id}/knowledge/${knowledge.id}`);
      }
    },
    [
      selectedItems.length,
      isCommandKeyPressed,
      toggleItemSelection,
      ontology_id,
      navigate,
    ],
  );

  // 선택 모드 종료
  const exitSelectionMode = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // 검색 실행 함수
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      searchParams.set("q", searchQuery.trim());
    } else {
      searchParams.delete("q");
    }
    setSearchParams(searchParams);
    setIsSearchModalOpen(false);
  }, [searchQuery, searchParams, setSearchParams]);

  // 검색 초기화 함수
  const handleResetSearch = useCallback(() => {
    setSearchQuery("");
    searchParams.delete("q");
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  // 이동 모달 확인 버튼 핸들러
  const handleMoveConfirm = () => {
    if (targetOntologyId && selectedItems.length > 0) {
      moveKnowledgeMutation.mutate({
        knowledgeIds: selectedItems,
        targetOntologyId: Number(targetOntologyId),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("정말로 이 지식을 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

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

  const isInSelectionMode = selectedItems.length > 0;

  return (
    <div className="container mx-auto p-4 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">지식 목록</h2>
        <div className="flex items-center gap-2">
          {isInSelectionMode && (
            <>
              <button
                onClick={exitSelectionMode}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              {selectedItems.length > 0 && (
                <button
                  onClick={() => setIsMoveModalOpen(true)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FiMove />
                  이동
                </button>
              )}
            </>
          )}
          <SearchButton
            currentSearchQuery={currentSearchQuery}
            onClick={() => setIsSearchModalOpen(true)}
            onReset={handleResetSearch}
          />
          <button
            onClick={() => navigate(`/ontologies/${ontology_id}/knowledge/new`)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus />새 지식 추가
          </button>
        </div>
      </div>

      {knowledgeWithBookmarks.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">표시할 지식이 없습니다.</p>
          <Link
            to={`/ontologies/${ontology_id}/knowledge/new`}
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            첫 번째 지식 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[80vh]">
          {sortedKnowledge.map((knowledge) => (
            <ItemCard
              key={knowledge.id}
              id={knowledge.id}
              name={knowledge.name}
              description={knowledge.description || ""}
              isBookmarked={knowledge.isBookmarked}
              ontologyId={ontology_id || ""}
              itemType="knowledge"
              onBookmark={(e) => handleBookmark(e, knowledge)}
              onItemClick={(e) => handleItemClick(knowledge, e)}
              onDelete={() => handleDelete(knowledge.id)}
              created_at={knowledge.created_at}
            />
          ))}
        </div>
      )}

      {/* YouTube 요약 버튼 컴포넌트 */}
      <YouTubeSummaryButton />

      {/* 검색 모달 */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      {/* 지식 이동 모달 */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">선택한 지식 이동</h2>
            <p className="mb-4 text-sm text-gray-600">
              선택된 {selectedItems.length}개의 지식을 이동할 온톨로지를
              선택하세요.
            </p>
            <div className="mb-6">
              <label
                htmlFor="targetOntology"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                대상 온톨로지
              </label>
              <select
                id="targetOntology"
                value={targetOntologyId}
                onChange={(e) => setTargetOntologyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">온톨로지 선택</option>
                {ontologyList
                  .filter((o: Ontology) => o.id !== Number(ontology_id))
                  .map((ontology: Ontology) => (
                    <option key={ontology.id} value={ontology.id}>
                      {ontology.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsMoveModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleMoveConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!targetOntologyId || moveKnowledgeMutation.isPending}
              >
                {moveKnowledgeMutation.isPending ? "이동 중..." : "이동"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeList;
