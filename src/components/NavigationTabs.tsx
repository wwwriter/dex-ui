import { useLocation } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiBook,
  FiLayers,
  FiBarChart2,
} from "react-icons/fi";

const NavigationTabs = () => {
  const location = useLocation();
  const path = location.pathname;

  // 홈 화면에서는 탭을 표시하지 않음
  if (path === "/") return null;

  // ontology_id가 URL에 있는 경우에만 탭 표시
  const ontologyMatch = path.match(/\/ontologies\/([^\/]+)/);
  if (!ontologyMatch) return null;

  const ontologyId = ontologyMatch[1];
  const baseUrl = `/ontologies/${ontologyId}`;

  const tabs = [
    { name: "Ontology", path: `${baseUrl}/graph`, icon: FiActivity },
    { name: "Problem", path: `${baseUrl}/problems`, icon: FiAlertCircle },
    { name: "Knowledge", path: `${baseUrl}/knowledge`, icon: FiBook },
    { name: "Object", path: `${baseUrl}/object-types`, icon: FiLayers },
    { name: "Metric", path: `${baseUrl}/metrics`, icon: FiBarChart2 },
  ];

  return (
    <>
      {/* 모바일 뷰에서 보여지는 하단 탭 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10">
        <div className="flex justify-between px-2">
          {tabs.map((tab) => (
            <a
              key={tab.path}
              href={tab.path}
              className={`py-3 px-2 text-center flex-1 flex flex-col items-center ${
                path.startsWith(tab.path)
                  ? "text-blue-600 border-t-2 border-blue-600"
                  : "text-gray-500"
              }`}
            >
              <tab.icon size={20} />
              <div className="text-xs mt-1">{tab.name}</div>
            </a>
          ))}
        </div>
      </div>

      {/* PC 뷰에서 보여지는 사이드바 */}
      <div className="hidden md:block fixed left-0 top-16 bottom-0 w-16 bg-white shadow-lg">
        <div className="flex flex-col pt-4 items-center">
          {tabs.map((tab) => (
            <a
              key={tab.path}
              href={tab.path}
              className={`py-4 w-full flex flex-col items-center ${
                path.startsWith(tab.path)
                  ? "bg-gray-100 text-blue-600 border-l-4 border-blue-600"
                  : "text-gray-700"
              }`}
              title={tab.name}
            >
              <tab.icon size={24} />
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default NavigationTabs;
