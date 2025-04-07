import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OntologyView from "./pages/OntologyView";
import { Suspense, lazy } from "react";
import Header from "./components/Header";
import {
  FiActivity,
  FiAlertCircle,
  FiBook,
  FiLayers,
  FiBarChart2,
} from "react-icons/fi";

const queryClient = new QueryClient();

// 홈페이지 컴포넌트 (대시보드나 온톨로지 목록 등을 표시할 수 있음)
const Home = lazy(() => import("./pages/Home"));
const ProblemList = lazy(() => import("./pages/ProblemList"));
const ProblemForm = lazy(() => import("./pages/ProblemForm"));
const KnowledgeList = lazy(() => import("./pages/KnowledgeList"));
const KnowledgeForm = lazy(() => import("./pages/KnowledgeForm"));
const ObjectTypeList = lazy(() => import("./pages/ObjectTypeList"));
const ObjectTypeForm = lazy(() => import("./pages/ObjectTypeForm"));
const MetricList = lazy(() => import("./pages/MetricList"));
const MetricForm = lazy(() => import("./pages/MetricForm"));

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
    { name: "Ontology", path: `${baseUrl}`, icon: FiActivity },
    { name: "Problem", path: `${baseUrl}/problems`, icon: FiAlertCircle },
    { name: "Knowledge", path: `${baseUrl}/knowlege`, icon: FiBook },
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
                path === tab.path
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
                path === tab.path
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen w-screen bg-gray-100 flex flex-col">
          <Header />

          <main className="h-[calc(100vh-64px)] overflow-auto md:ml-16 pb-16 md:pb-0">
            <Suspense fallback={<div>로딩 중...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/ontologies/:ontology_id"
                  element={<OntologyView />}
                />
                <Route
                  path="/ontologies/:ontology_id/problems"
                  element={<ProblemList />}
                />
                <Route
                  path="/ontologies/:ontology_id/problems/new"
                  element={<ProblemForm />}
                />
                <Route
                  path="/ontologies/:ontology_id/problems/:id"
                  element={<ProblemForm isEditing={true} />}
                />
                <Route
                  path="/ontologies/:ontology_id/knowlege"
                  element={<KnowledgeList />}
                />
                <Route
                  path="/ontologies/:ontology_id/knowlege/new"
                  element={<KnowledgeForm />}
                />
                <Route
                  path="/ontologies/:ontology_id/knowlege/:id"
                  element={<KnowledgeForm isEditing={true} />}
                />
                <Route
                  path="/ontologies/:ontology_id/object-types"
                  element={<ObjectTypeList />}
                />
                <Route
                  path="/ontologies/:ontology_id/object-types/new"
                  element={<ObjectTypeForm />}
                />
                <Route
                  path="/ontologies/:ontology_id/object-types/:id"
                  element={<ObjectTypeForm isEditing={true} />}
                />
                <Route
                  path="/ontologies/:ontology_id/metrics"
                  element={<MetricList />}
                />
                <Route
                  path="/ontologies/:ontology_id/metrics/new"
                  element={<MetricForm />}
                />
                <Route
                  path="/ontologies/:ontology_id/metrics/:id"
                  element={<MetricForm isEditing={true} />}
                />
              </Routes>
            </Suspense>
          </main>

          <NavigationTabs />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
