import { useState, useEffect } from "react";
import { FiYoutube } from "react-icons/fi";

interface YouTubeSummaryButtonProps {
  ontologyId?: string;
}

export const YouTubeSummaryButton = ({
  ontologyId,
}: YouTubeSummaryButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState("");

  const handleOpenModal = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardUrl(text);
    } catch (err) {
      console.error("클립보드 접근 오류:", err);
    }
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Floating Youtube Summary Button */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-24 right-4 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors z-10"
        aria-label="유튜브 요약"
      >
        <FiYoutube size={24} />
      </button>

      {/* Youtube Summary Modal */}
      {isModalOpen && (
        <YoutubeSummaryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultUrl={clipboardUrl}
          ontologyId={ontologyId}
        />
      )}
    </>
  );
};

interface YoutubeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl: string;
  ontologyId?: string;
}

const YoutubeSummaryModal = ({
  isOpen,
  onClose,
  defaultUrl,
  ontologyId,
}: YoutubeSummaryModalProps) => {
  const [url, setUrl] = useState(defaultUrl);

  const handleSubmit = () => {
    // TODO: 여기에 URL 제출 로직 구현
    console.log("제출된 URL:", url);
    onClose();
  };

  // 모달이 열릴 때 body 스크롤 방지 및 ESC 키로 모달 닫기
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    // 컴포넌트 언마운트 또는 모달 닫을 때 이벤트 리스너 제거 및 body 스크롤 복원
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">유튜브 영상 요약</h2>
        <div className="mb-4">
          <label
            htmlFor="youtube-url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            유튜브 URL
          </label>
          <input
            id="youtube-url"
            type="url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
};
