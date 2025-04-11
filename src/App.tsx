import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import OntologyView from "./pages/OntologyView";
import { Suspense, lazy, useEffect } from "react";
import Header from "./components/Header";
import OfflineStatus from "./components/OfflineStatus";
import NavigationTabs from "./components/NavigationTabs";
import Login from "./pages/Login";
import axiosInstance from "./api/axios";

const queryClient = new QueryClient();

// 홈페이지 컴포넌트 (대시보드나 온톨로지 목록 등을 표시할 수 있음)
const OntologyList = lazy(() => import("./pages/OntologyList"));
const ProblemList = lazy(() => import("./pages/ProblemList"));
const ProblemForm = lazy(() => import("./pages/ProblemForm"));
const KnowledgeList = lazy(() => import("./pages/KnowledgeList"));
const KnowledgeForm = lazy(() => import("./pages/KnowledgeForm"));
const ObjectTypeList = lazy(() => import("./pages/ObjectTypeList"));
const ObjectTypeForm = lazy(() => import("./pages/ObjectTypeForm"));
const MetricList = lazy(() => import("./pages/MetricList"));
const MetricForm = lazy(() => import("./pages/MetricForm"));

function AppContent() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axiosInstance.get("/auth/profile");
      return response.data;
    },
    retry: false,
  });

  if (isLoading) {
    return <div>로딩 중...</div>;
  }
  // useEffect(() => {}, [profile]);

  return (
    <div className="min-h-screen w-screen bg-gray-100 flex flex-col">
      <Header />

      <main className="h-[calc(100vh-64px)] overflow-auto md:ml-16 pb-16 md:pb-0">
        <Suspense fallback={<div>로딩 중...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<OntologyList />} />
            <Route path="/ontologies/:ontology_id" element={<OntologyView />} />
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
      <OfflineStatus />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
