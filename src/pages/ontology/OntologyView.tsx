import { useEffect, useRef, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import mermaid from "mermaid";
import { useQuery } from "@tanstack/react-query";
import { ObjectType, Metric } from "../../types";
import {
  objectTypeApi,
  metricApi,
  linkTypeApi,
  metricObjectTypeRelationApi,
  // ontologyApi,
} from "../../api/dexApi";
import OntologyControls from "./OntologyControls";
import ZoomControls from "../../components/ZoomControls";
import NodeInfoModal from "../../components/NodeInfoModal";
// import OntologyLegend from "../components/OntologyLegend";
import { addNodeHoverStyles, formatLabel } from "../../utils/graphUtils";

interface ObjectTypeGroup {
  id: number;
  name: string;
  objectTypeIds: number[];
}

mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true,
    curve: "basis",
  },
  securityLevel: "loose",
});
// window 인터페이스 확장
declare global {
  interface Window {
    callback: (nodeId: string) => boolean | Promise<boolean>;
  }
}

const OntologyView = () => {
  const { ontology_id } = useParams<{ ontology_id: string }>();
  const containerRef = useRef<HTMLDivElement>(null);

  // 상태 관리
  const [showGroups, setShowGroups] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [svgContent, setSvgContent] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ObjectType | Metric | null>(
    null
  );
  const [modalType, setModalType] = useState<"object" | "metric">("object");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [objectTypeGroups] = useState<ObjectTypeGroup[]>([]);

  // 온톨로지 데이터 가져오기
  // const { data: currentOntology } = useQuery({
  //   queryKey: ["ontology", ontology_id],
  //   queryFn: () =>
  //     ontology_id
  //       ? ontologyApi.getById(Number(ontology_id))
  //       : Promise.resolve(null),
  //   enabled: !!ontology_id,
  // });

  // get metric object type relation
  const { data: metricObjectTypeRelations = [] } = useQuery({
    queryKey: ["metricObjectTypeRelations", ontology_id],
    queryFn: () => metricObjectTypeRelationApi.getAll(Number(ontology_id)),
  });

  // 객체 타입 데이터 가져오기
  const { data: objectTypes = [] } = useQuery({
    queryKey: ["objectTypes", ontology_id],
    queryFn: () => objectTypeApi.getAll(Number(ontology_id)),
  });

  // 메트릭 데이터 가져오기
  const { data: metrics = [] } = useQuery({
    queryKey: ["metrics", ontology_id],
    queryFn: () => metricApi.getAll(Number(ontology_id)),
  });

  // 링크 타입 데이터 가져오기
  const { data: linkTypes = [] } = useQuery({
    queryKey: ["linkTypes", ontology_id],
    queryFn: () => linkTypeApi.getAll(Number(ontology_id)),
  });

  // 노드 클릭 핸들러
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);

    // 객체 타입 노드인 경우
    if (nodeId.startsWith("OBJ")) {
      const objectId = Number(nodeId.replace("OBJ", ""));
      const objectNode = objectTypes.find((obj) => obj.id === objectId);
      if (objectNode) {
        setSelectedNode(objectNode);
        setModalType("object");
        setIsModalOpen(true);
      }
    }
    // 메트릭 노드인 경우
    else if (nodeId.startsWith("M")) {
      const metricId = Number(nodeId.replace("M", ""));
      const metricNode = metrics.find((m) => m.id === metricId);
      if (metricNode) {
        setSelectedNode(metricNode);
        setModalType("metric");
        setIsModalOpen(true);
      }
    }
  };

  // 온톨로지 코드 생성
  const mermaidCode = useMemo(() => {
    let code = "flowchart TD\n";

    // 모든 엣지의 색상을 하늘색으로 설정
    code += "  linkStyle default stroke:#66ccff,stroke-width:2px\n\n";

    // ObjectTypeGroup 정의 (그룹 표시 옵션이 활성화된 경우)
    if (showGroups && objectTypeGroups.length > 0) {
      objectTypeGroups.forEach((group) => {
        code += `  subgraph G${group.id}["${formatLabel(group.name)}"]\n`;
        // 그룹에 속한 ObjectType 정의
        group.objectTypeIds.forEach((objId: number) => {
          const obj = objectTypes.find((o) => o.id === objId);
          if (obj) {
            const isSelected = selectedNodeId === `OBJ${objId}`;
            const style = isSelected
              ? `style OBJ${objId} fill:#f9e0e8,stroke:#ff3399,stroke-width:4px,color:#990066,font-weight:bold`
              : "";
            code += `    OBJ${objId}["${formatLabel(
              obj.label || obj.name
            )}"]\n`;
            if (isSelected) {
              code += `    ${style}\n`;
            }
          }
        });
        code += "  end\n\n";
      });
    } else {
      // 그룹이 없거나 표시하지 않는 경우 ObjectType 직접 정의
      code += "  subgraph ObjectTypes\n";
      objectTypes.forEach((obj) => {
        const isSelected = selectedNodeId === `OBJ${obj.id}`;
        const style = isSelected
          ? `style OBJ${obj.id} fill:#f9e0e8,stroke:#ff3399,stroke-width:4px,color:#990066,font-weight:bold`
          : "";
        code += `    OBJ${obj.id}["${formatLabel(obj.label || obj.name)}"]\n`;
        if (isSelected) {
          code += `    ${style}\n`;
        }
      });
      code += "  end\n\n";
    }

    // Metric 그룹 정의 (지표가 있고 보여주기 옵션이 활성화된 경우)
    if (metrics.length > 0 && showMetrics) {
      code += "  subgraph Metrics\n";
      metrics.forEach((metric) => {
        const isSelected = selectedNodeId === `M${metric.id}`;
        const style = isSelected
          ? `style M${metric.id} fill:#e0f0ff,stroke:#3399ff,stroke-width:4px,color:#0066cc,font-weight:bold`
          : "";
        code += `    M${metric.id}["${formatLabel(
          metric.label || metric.name || `Metric-${metric.id}`
        )}"]\n`;
        if (isSelected) {
          code += `    ${style}\n`;
        }
      });
      code += "  end\n\n";
    }

    // LinkType 관계 정의
    linkTypes.forEach((link) => {
      try {
        if (link.source_object_type_id && link.target_object_type_id) {
          const sourceId = `OBJ${link.source_object_type_id}`;
          const targetId = `OBJ${link.target_object_type_id}`;
          const label = formatLabel(link.semantic_label || link.name || "연결");
          code += `  ${sourceId} -->|${label}| ${targetId}\n`;
        }
      } catch (e) {
        console.error("LinkType 처리 오류:", e, link);
      }
    });

    // Metric과 ObjectType 관계 정의 (메트릭 보여주기 옵션이 활성화된 경우)
    if (showMetrics) {
      // metricObjectTypeRelations에서 Metric과 ObjectType 관계 추가
      metricObjectTypeRelations.forEach((relation) => {
        try {
          const objId = `OBJ${relation.object_type_id}`;
          const metricId = `M${relation.metric_id}`;

          // 관련된 메트릭 찾기
          const metric = metrics.find((m) => m.id === relation.metric_id);
          const label = metric
            ? formatLabel(metric.label || metric.name || "측정")
            : "측정";

          code += `  ${objId} -.->|${label}| ${metricId}\n`;
        } catch (e) {
          console.error("MetricObjectTypeRelation 처리 오류:", e, relation);
        }
      });

      // 기존 measure_type_id 기반 연결도 유지 (중복되지 않는 경우에만)
      metrics.forEach((metric) => {
        if (metric.measure_type_id) {
          // 이미 metricObjectTypeRelations에 해당 관계가 있는지 확인
          const relationExists = metricObjectTypeRelations.some(
            (rel) =>
              rel.metric_id === metric.id &&
              rel.object_type_id === metric.measure_type_id
          );

          // 중복되지 않는 경우에만 추가
          if (!relationExists) {
            const objId = `OBJ${metric.measure_type_id}`;
            code += `  ${objId} -.->|${formatLabel(
              metric.label || metric.name || "측정"
            )}| M${metric.id}\n`;
          }
        }
      });
    }

    return code;
  }, [
    objectTypes,
    objectTypeGroups,
    metrics,
    linkTypes,
    metricObjectTypeRelations,
    showGroups,
    showMetrics,
    selectedNodeId,
  ]);

  // Mermaid 온톨로지 렌더링
  useEffect(() => {
    // 콜백 함수 등록
    window.callback = async function (nodeId: string) {
      if (nodeId && nodeId !== "") {
        handleNodeClick(nodeId);
      }
      return false; // 기본 동작 방지
    };

    const renderOntology = async () => {
      try {
        if (!mermaidCode.trim()) {
          setSvgContent("<div>데이터가 없습니다.</div>");
          return;
        }

        // 직접 클릭 이벤트를 Mermaid 코드에 추가
        let modifiedCode = mermaidCode;

        // ObjectType 노드에 클릭 액션 추가
        objectTypes.forEach((obj) => {
          const nodeId = `OBJ${obj.id}`;
          modifiedCode += `\nclick ${nodeId} "javascript:callback('${nodeId}')"\n`;
        });

        // Metric 노드에 클릭 액션 추가
        metrics.forEach((metric) => {
          const nodeId = `M${metric.id}`;
          modifiedCode += `\nclick ${nodeId} "javascript:callback('${nodeId}')"\n`;
        });
        // 렌더링 실행
        const { svg } = await mermaid.render("ontology-div", modifiedCode);
        setSvgContent(svg);

        // SVG가 DOM에 추가된 후 스타일 적용을 위한 지연 실행
        setTimeout(() => {
          addNodeHoverStyles(containerRef.current);
        }, 100);
      } catch (error) {
        console.error("Mermaid 렌더링 오류:", error);
        setSvgContent("<div>온톨로지 렌더링 중 오류가 발생했습니다.</div>");
      }
    };

    renderOntology();
  }, [mermaidCode, objectTypes, metrics]);

  // 줌 인 함수
  const zoomIn = () => {
    setZoomLevel((prevLevel) => Math.min(prevLevel + 0.1, 3));
  };

  // 줌 아웃 함수
  const zoomOut = () => {
    setZoomLevel((prevLevel) => Math.max(prevLevel - 0.1, 0.5));
  };

  // 줌 리셋 함수
  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // 화면에 맞추기 함수
  const fitToScreen = () => {
    const container = containerRef.current;
    if (!container) return;

    // SVG 요소 찾기
    const svgElement = container.querySelector("svg");
    if (!svgElement) return;

    // 컨테이너와 SVG의 크기 비율 계산
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const svgWidth = svgElement?.getBoundingClientRect()?.width / zoomLevel;
    const svgHeight = svgElement?.getBoundingClientRect()?.height / zoomLevel;

    // 여백을 고려한 비율 계산 (10% 여백)
    const widthRatio = (containerWidth * 0.9) / svgWidth;
    const heightRatio = (containerHeight * 0.9) / svgHeight;

    // 더 작은 비율을 선택하여 화면에 맞추기
    const scaleFactor = Math.min(widthRatio, heightRatio, 2); // 최대 200%까지만 확대

    // 줌 레벨 설정
    setZoomLevel(scaleFactor);
    // 중앙에 위치하도록 설정
    setPosition({ x: 0, y: 0 });
  };

  // 드래그 시작 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    // 노드 클릭 이벤트가 아닌 경우에만 드래그 처리
    if ((e.target as HTMLElement).closest(".node")) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // 드래그 중 핸들러
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // 드래그 종료 핸들러
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 마우스 휠 줌 핸들러
  const handleWheel = (e: React.WheelEvent) => {
    // Ctrl 키(Windows) 또는 Command 키(Mac)를 누른 상태에서 휠 이벤트 처리
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prevLevel) =>
        Math.min(Math.max(prevLevel + delta, 0.5), 3)
      );
    }
  };

  // 컴포넌트 마운트 시 마우스 이벤트 정리
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseLeave = () => {
      setIsDragging(false);
    };

    container.addEventListener("mouseleave", handleMouseLeave);

    // 휠 이벤트를 위한 passive: false 설정
    container.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey || e.metaKey) e.preventDefault();
      },
      { passive: false }
    );

    return () => {
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // SVG가 렌더링된 후 자동으로 화면에 맞추기
  useEffect(() => {
    if (svgContent && containerRef.current) {
      // 약간의 지연 후 화면에 맞추기 (SVG가 완전히 렌더링된 후)
      setTimeout(() => {
        // fitToScreen();
      }, 300);
    }
  }, [svgContent]);

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
    setSelectedNodeId(null);
  };

  return (
    <div className="w-full h-full bg-gray-900 relative pb-24 md:pb-0">
      {/* 온톨로지 컨트롤 */}
      <OntologyControls
        showGroups={showGroups}
        showMetrics={showMetrics}
        onToggleGroups={setShowGroups}
        onToggleMetrics={setShowMetrics}
      />

      {/* 온톨로지 범례 */}
      {/* <GraphLegend selectedNodeId={selectedNodeId} /> */}

      {/* 줌 컨트롤 */}
      <ZoomControls
        zoomLevel={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onFitToScreen={fitToScreen}
      />

      {/* 노드 정보 모달 */}
      {isModalOpen && selectedNode && (
        <NodeInfoModal
          selectedNode={selectedNode}
          modalType={modalType}
          onClose={handleCloseModal}
        />
      )}

      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden p-0 cursor-grab"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Mermaid SVG 삽입 - 줌 레벨 적용 */}

        <div
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: "center center",
            transition: "transform 0.1s ease",
            width: "fit-content",
            height: "fit-content",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        />

        {/* 온톨로지가 렌더링되지 않는 경우 숨겨진 다이어그램 */}
        {/* <div id="mermaid-flow">{mermaidCode}</div> */}
      </div>
    </div>
  );
};

export default OntologyView;
