interface DifyRunWorkflowResponse {
  workflow_id: string;
  execution_id: string;
  outputs: Record<string, any>;
}
const YOUTUBE_SUMMARY_API_KEY = "app-3DvfHXIBpTeMb8UOoJFFvRLd";
const PLAYLIST_SUMMARY_API_KEY = "app-QCIYng868Jp37vRe4vyvNsUN";
/**
 * Dify 워크플로우 실행 API 요청 함수
 * @param apiKey Dify API 키
 * @param requestData 요청 데이터
 * @returns 스트리밍 모드일 경우 ReadableStream, 블로킹 모드일 경우 응답 데이터
 */

export async function runDifyWorkflow(
  input: string,
  ontology_id: number
): Promise<Response | DifyRunWorkflowResponse> {
  const endpoint = "https://dify.soneuro-handmade.com/v1/workflows/run";

  const hasList = input.includes("list=") || input.includes("channel");

  const headers = {
    Authorization: `Bearer ${
      hasList ? PLAYLIST_SUMMARY_API_KEY : YOUTUBE_SUMMARY_API_KEY
    }`,
    "Content-Type": "application/json",
  };

  // 스트리밍 모드인 경우 fetch API 사용
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      inputs: {
        input,
        ontology_id,
      },
      response_mode: "streaming",
      user: "admin",
    }),
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }

  return response;
}

/**
 * 스트리밍 응답을 처리하는 유틸리티 함수
 * @param response fetch API 응답
 * @param onChunk 각 청크 데이터를 처리하는 콜백
 */
export async function handleStreamingResponse(
  response: Response,
  onChunk: (data: any) => void
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("응답에 body가 없습니다");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            onChunk(data);
          } catch (e) {
            console.error("JSON 파싱 오류:", e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
