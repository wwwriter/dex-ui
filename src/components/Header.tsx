import React, { useEffect, useMemo, useState } from "react";
import { Link, matchPath, useParams } from "react-router-dom";
import { FaComment } from "react-icons/fa";
import ChatModal from "./ChatModal";
import { useQuery } from "@tanstack/react-query";
import { ontologyApi } from "../api/dexApi";
import { createListQueryKey } from "../api/query-keys";
import { Ontology } from "../types";

const Header: React.FC = () => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const queryKey = createListQueryKey("ontologies", {});
  const param = useParams();
  const ontologyMatch = matchPath(
    { path: "/ontologies/:ontology_id/*" },
    location.pathname
  );

  const ontology_id = ontologyMatch?.params?.ontology_id;

  const { data: ontologies = [] as Ontology[] } = useQuery({
    queryKey,
    queryFn: () => ontologyApi.getAll(),
  });

  const ontologyMap = useMemo(() => {
    if (!ontologies) return {};
    return ontologies.reduce(
      (acc, ontology) => {
        acc[ontology.id] = ontology;
        return acc;
      },
      {} as Record<number, Ontology>
    );
  }, [ontologies]);

  const handleOpenChat = () => {
    setIsChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatModalOpen(false);
  };
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if CMD+i (Mac) or CTRL+i (Windows) is pressed
      if ((event.metaKey || event.ctrlKey) && event.key === "u") {
        event.preventDefault(); // Prevent default browser behavior
        handleOpenChat();
      }

      // Check if OPTION+i (Mac) or ALT+i (Windows) is pressed
      if (event.altKey && event.key === "u") {
        event.preventDefault(); // Prevent default browser behavior
        handleOpenChat();
      }

      // ESC 키를 눌렀을 때 채팅 모달 닫기
      if (event.key === "Escape" && isChatModalOpen) {
        event.preventDefault();
        handleCloseChat();
      }
    };

    // Add event listener when component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isChatModalOpen]); // isChatModalOpen을 의존성 배열에 추가

  return (
    <header className="bg-gray-800 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <span className="text-blue-600 font-bold text-xl">DEX</span>
              </Link>
            </div>

            {ontology_id && ontologyMap[Number(ontology_id)] && (
              <h1 className="text-white text-xl font-bold ml-4">
                {ontologyMap[Number(ontology_id)].name}
              </h1>
            )}
            <button
              onClick={handleOpenChat}
              className="p-2 text-white hover:bg-gray-700 rounded-full focus:outline-none"
              aria-label="채팅 열기"
            >
              <FaComment className="h-5 w-5" />
            </button>
          </div>
          <nav className="hidden md:flex space-x-8">
            {/* 필요한 네비게이션 링크를 여기에 추가할 수 있습니다 */}
          </nav>
        </div>
      </div>

      {isChatModalOpen && <ChatModal onClose={handleCloseChat} />}
    </header>
  );
};

export default Header;
