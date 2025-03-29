import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GraphView from "./components/GraphView";
import { Suspense, lazy } from "react";

const queryClient = new QueryClient();

// 홈페이지 컴포넌트 (대시보드나 온톨로지 목록 등을 표시할 수 있음)
const Home = lazy(() => import("./components/Home"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen w-screen bg-gray-100">
          <main className="w-full h-screen">
            <Suspense fallback={<div>로딩 중...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/graph/:ontology_id" element={<GraphView />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
