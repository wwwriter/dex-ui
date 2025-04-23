import { useState, useEffect, useRef } from "react";
import { FaProjectDiagram } from "react-icons/fa";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  id: string | number | undefined;
  mermaidContent?: string | null;
}

const MermaidDiagram = ({ id, mermaidContent }: MermaidDiagramProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [svgContent, setSvgContent] = useState<string>("");
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen && mermaidContent) {
      const renderMermaid = async () => {
        try {
          mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });
          const { svg } = await mermaid.render(
            `mermaid-${id}`,
            mermaidContent || "",
          );
          setSvgContent(svg);
        } catch (error) {
          console.error("Mermaid 렌더링 오류:", error);
          setSvgContent("<div>다이어그램 렌더링 중 오류가 발생했습니다.</div>");
        }
      };
      renderMermaid();
    }
  }, [isModalOpen, mermaidContent, id]);

  if (!mermaidContent) return null;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="다이어그램 보기"
      >
        <FaProjectDiagram className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">다이어그램</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div
              className="p-4 overflow-auto flex-grow flex justify-center items-center"
              ref={mermaidRef}
            >
              <div
                className="flex justify-center items-center"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MermaidDiagram;
