// API 클라이언트 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// 오프라인 상태를 감지하는 함수
const isOffline = () => !navigator.onLine;

// 브라우저 캐시 스토리지 키 설정
const CACHE_KEY_PREFIX = "dex-api-cache-";

// 캐시 저장 함수
const saveToCache = async (key: string, data: any) => {
  try {
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${key}`,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch (error) {
    console.error("캐시 저장 실패:", error);
  }
};

// 캐시에서 데이터 가져오기
const getFromCache = (key: string) => {
  try {
    const item = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!item) return null;

    return JSON.parse(item);
  } catch (error) {
    console.error("캐시 읽기 실패:", error);
    return null;
  }
};

// API 요청 함수
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${options.method || "GET"}-${endpoint}`;

  // 오프라인 상태 확인
  if (isOffline()) {
    console.log("오프라인 모드: 캐시된 데이터 사용");
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      return cachedData.data;
    }

    throw new Error("오프라인 상태에서 캐시된 데이터가 없습니다.");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();

    // GET 요청 결과만 캐시에 저장
    if (!options.method || options.method === "GET") {
      await saveToCache(cacheKey, data);
    }

    return data;
  } catch (error) {
    // 네트워크 오류 시 캐시 확인
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      console.log("네트워크 오류: 캐시된 데이터 사용");
      return cachedData.data;
    }

    throw error;
  }
};

// GET 요청 헬퍼 함수
export const get = (endpoint: string, options: RequestInit = {}) => {
  return apiRequest(endpoint, { ...options, method: "GET" });
};

// POST 요청 헬퍼 함수
export const post = (
  endpoint: string,
  data: any,
  options: RequestInit = {}
) => {
  return apiRequest(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  });
};

// PUT 요청 헬퍼 함수
export const put = (endpoint: string, data: any, options: RequestInit = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// DELETE 요청 헬퍼 함수
export const del = (endpoint: string, options: RequestInit = {}) => {
  return apiRequest(endpoint, { ...options, method: "DELETE" });
};
