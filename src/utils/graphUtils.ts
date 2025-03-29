/**
 * 그래프 관련 유틸리티 함수
 */

/**
 * SVG 요소에 노드 호버 스타일을 추가합니다.
 * @param container SVG 컨테이너 요소
 */
export const addNodeHoverStyles = (containerElement: HTMLElement | null) => {
  if (!containerElement) return;

  // 기존 스타일 태그 제거
  const existingStyle = containerElement.querySelector("#mermaid-node-styles");
  if (existingStyle) {
    existingStyle.remove();
  }

  // 새 스타일 태그 생성
  const styleElement = document.createElement("style");
  styleElement.id = "mermaid-node-styles";
  styleElement.textContent = `
    .node {
      cursor: pointer !important;
      
    }
    .node:hover {
      
      filter: brightness(1.2) drop-shadow(0px 4px 5px rgba(0, 0, 0, 0.25)) !important;
    }
    .node rect, .node circle, .node polygon {
      stroke-width: 2px !important;
    }
    .node:hover rect, .node:hover circle, .node:hover polygon {
      stroke-width: 3px !important;
      stroke: #ff6b6b !important;
    }
    .node:hover .label {
      font-weight: bold !important;
    }
  `;

  // 스타일 태그 삽입
  containerElement.appendChild(styleElement);
};

/**
 * 라벨의 괄호를 HTML 안전한 형식으로 변환합니다.
 * @param label 원본 라벨
 * @returns 변환된 라벨
 */
export const formatLabel = (label: string | null): string => {
  if (!label) return "";
  return label.replace(/\(/g, "<").replace(/\)/g, ">");
};
