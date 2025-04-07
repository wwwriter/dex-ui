import { request } from "obsidian";
import { encodingForModel, TiktokenModel } from "js-tiktoken";

export function countTokens(text: string, model = "text-embedding-3-large") {
	try {
		// 모델에 맞는 토크나이저 로드
		const encoder = encodingForModel(model as TiktokenModel);

		// 텍스트를 토큰으로 인코딩하고 개수 반환
		const tokens = encoder.encode(text);
		const tokenCount = tokens.length;

		// 메모리 누수 방지를 위해 인코더 해제
		// encodingForModel.free();

		return tokenCount;
	} catch (error) {
		console.error("토큰 수 계산 중 에러 발생:", error);
		throw error;
	}
}

const getPrompt = (ontology: Record<string, any>) => `

`;

export const fetchOllamaQueryStream = async (
	prompt: string,
	ontology: Record<string, any>,
	onChunk: (chunk: string) => void
): Promise<string> => {
	try {
		const promptString = `${getPrompt(ontology)}
사용자 설명:
${prompt}
위의 DBT 시멘틱 모델을 바탕으로 온톨로지를 만들어줘.

사용자의 설명을 바탕으로 위 형식에 맞는 JSON을 생성하세요.`;
		const num_ctx = countTokens(promptString) + 4000;
		
		const response = await fetch(
			"https://ollama-gpu.soneuro-handmade.com/api/generate",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					system: "당신은 온톨로지 설계 전문가입니다. 사용자의 설명을 바탕으로 아래 형식에 맞는 온톨로지 구조를 생성해야 합니다.",
					model: "deepseek-r1:32b-qwen-distill-q4_K_M",
					options: {
						temperature: 0.2,
						num_ctx,
						num_threads: 8,
					},
					prompt: promptString,
					stream: true,  // 스트리밍 모드 활성화
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
			const lines = chunk.split('\n').filter(line => line.trim() !== '');
			
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
		console.error("Error streaming from Ollama:", error);
		throw error;
	}
};

export const fetchOllamaModels = async (serverUrl: string): Promise<any[]> => {
	try {
		const response = await request({
			url: `${serverUrl}/api/tags`,
			method: "GET",
		});
		const data = JSON.parse(response);
		return data.models || [];
	} catch (error) {
		console.error("모델 목록을 불러오는데 실패했습니다:", error);
		return [];
	}
};

export const extractResponse = (response: string) => {
	return JSON.parse(response.replace(/<think>[\s\S]*?<\/think>/g, "").trim());
};
