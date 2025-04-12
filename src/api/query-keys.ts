import { ApiRequest, DetailApiRequest } from "./dexApi";

// 도메인 타입 정의
export type Domain =
  | "ontologies"
  | "metrics"
  | "problems"
  | "knowledge"
  | "objectTypes"
  | "properties"
  | "problemMetrics";

// LIST 쿼리 키 생성 함수
export const createListQueryKey = (
  domain: Domain,
  params?: ApiRequest
): [Domain, ApiRequest | undefined] => {
  return [domain, params];
};

// DETAIL 쿼리 키 생성 함수
export const createDetailQueryKey = (
  domain: Domain,
  id: number,
  params?: DetailApiRequest
): [Domain, number, DetailApiRequest | undefined] => {
  return [domain, id, params];
};

// 예시 사용:
// const metricsListKey = createListQueryKey("metrics", { limit: 10 });
// const metricDetailKey = createDetailQueryKey("metrics", 1, { fields: "name,description" });
