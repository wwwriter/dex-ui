import { encodingForModel, TiktokenModel } from "js-tiktoken";

// 토큰 수 계산 함수
export function countTokens(text: string, model = "text-embedding-3-large") {
  try {
    const encoder = encodingForModel(model as TiktokenModel);
    const tokens = encoder.encode(text);
    const tokenCount = tokens.length;
    return tokenCount;
  } catch (error) {
    console.error("토큰 수 계산 중 에러 발생:", error);
    throw error;
  }
}

// 채팅 메시지 인터페이스
export interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

// 채팅 응답을 스트리밍으로 가져오는 함수
export const fetchChatResponse = async (
  messages: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<string> => {
  try {
    // 메시지 포맷팅
    const formattedMessages = messages
      .map((msg) => ({
        role: msg.isBot ? "assistant" : "user",
        content: msg.text,
      }))
      .filter((_, index) => index > 0); // 첫 번째 메시지(봇 인삿말)는 제외

    // 시스템 프롬프트
    const systemPrompt =
      "당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 사용자의 질문에 한국어로 답변해주세요.";

    // 컨텍스트 윈도우 계산
    const messagesText = formattedMessages.map((m) => m.content).join("\n");
    const num_ctx = countTokens(messagesText + systemPrompt) + 2000; // 여유 공간 추가

    const response = await fetch(
      "https://ollama-gpu.soneuro-handmade.com/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma3:27b",
          messages: formattedMessages,
          system: systemPrompt,
          options: {
            temperature: 0.7,
            num_ctx,
            num_threads: 8,
          },
          stream: true,
        }),
      }
    );

    if (!response.body) {
      throw new Error("응답 스트림을 읽을 수 없습니다.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        return fullResponse;
      }

      // 청크 디코딩
      const chunk = decoder.decode(value, { stream: true });

      // 여러 JSON 객체가 포함될 수 있으므로 라인별로 처리
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        try {
          const data = JSON.parse(line);

          if (data.message?.content) {
            fullResponse += data.message.content;
            onChunk(data.message.content);
          }
        } catch (e) {
          console.warn("JSON 파싱 실패:", line);
        }
      }
    }
  } catch (error) {
    console.error("채팅 응답 스트리밍 중 오류:", error);
    throw error;
  }
};

// 사용 가능한 모델 목록 가져오기
export const fetchAvailableModels = async (
  serverUrl: string = "https://ollama-gpu.soneuro-handmade.com"
): Promise<any[]> => {
  try {
    const response = await fetch(`${serverUrl}/api/tags`, {
      method: "GET",
    });
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error("모델 목록을 불러오는데 실패했습니다:", error);
    return [];
  }
};
