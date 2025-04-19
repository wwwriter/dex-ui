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

// 채팅 메시지를 프롬프트로 변환하는 함수
const formatMessagesToPrompt = (messages: ChatMessage[]): string => {
  // 첫 번째 메시지(봇 인삿말)는 제외
  const messageHistory = messages.filter((_, index) => index > 0);

  // 메시지를 프롬프트 형식으로 변환
  return messageHistory
    .map((msg) => {
      const role = msg.isBot ? "AI" : "User";
      return `${role}: ${msg.text}`;
    })
    .join("\n\n");
};

// 채팅 응답을 스트리밍으로 가져오는 함수 (generate API 사용)
export const fetchChatResponse = async (
  messages: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<string> => {
  try {
    // 시스템 프롬프트
    const systemPrompt = `당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 사용자의 질문에 한국어로 답변해주세요.

다음 형식 기능을 활용하여 응답을 구조화하세요:
1. 제목과 소제목은 # 또는 ## 마크다운 헤더 형식을 사용하세요.
2. 목록은 다음과 같이 작성하세요:
   - 순서가 없는 목록은 각 항목 앞에 '- ' 기호를 사용하세요. (기호와 텍스트 사이에 공백 필수)
   - 순서가 있는 목록은 '1. ', '2. ' 등의 형식을 사용하세요.
3. 강조할 내용은 **텍스트** 형식으로 볼드체로 표시하세요.
4. 코드는 \`코드\`처럼 백틱으로 감싸서 표시하세요.
5. 코드 블록은 다음과 같이 표시하세요:
   \`\`\`언어명
   코드 내용
   \`\`\`
6. 줄바꿈을 적절히 사용하여 내용을 구분하세요.
7. 제목과 단락 사이에는 빈 줄을 두어 가독성을 높이세요.

응답은 마크다운 형식을 준수하고, 구조적이고 가독성 높게 작성하세요.`;

    // 메시지를 프롬프트로 변환
    const messagePrompt = formatMessagesToPrompt(messages);

    // 전체 프롬프트 구성
    const fullPrompt = `${systemPrompt}\n\n${messagePrompt}\n\nAI:`;

    // 컨텍스트 윈도우 계산
    const num_ctx = countTokens(fullPrompt) + 2000; // 여유 공간 추가

    const response = await fetch(
      "https://ollama-gpu.soneuro-handmade.com/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma3:27b",
          prompt: fullPrompt,
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

          if (data.response) {
            fullResponse += data.response;
            onChunk(data.response);
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
