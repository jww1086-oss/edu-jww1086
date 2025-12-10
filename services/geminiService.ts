import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// 기존에 맨 위에 있던 const ai = ... 코드를 삭제했습니다. (이게 하얀 화면의 주범입니다!)

export const analyzeFeedback = async (comments: string[]): Promise<AnalysisResult> => {
  if (comments.length === 0) {
    return {
      summary: "분석할 데이터가 없습니다.",
      sentiment: "neutral",
      keyPoints: []
    };
  }

  // 1. API 키를 안전하게 가져옵니다.
  // @ts-ignore
  const apiKey = import.meta.env.VITE_API_KEY;

  // 2. 키가 없으면 하얀 화면 대신 '안내 메시지'를 보여줍니다.
  if (!apiKey) {
    console.error("API Key is missing!");
    return {
      summary: "오류: Vercel 설정에서 VITE_API_KEY를 찾을 수 없습니다.",
      sentiment: "neutral",
      keyPoints: ["환경 변수 설정을 확인해주세요."]
    };
  }

  // 3. 키가 있을 때만 AI를 연결합니다. (안전!)
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `
  다음은 안전보건교육 만족도 조사의 주관식 응답들입니다.
  이 응답들을 분석하여 다음 정보를 제공해주세요:
  1. 전체적인 요약 (summary)
  2. 전반적인 정서 (sentiment: positive, neutral, negative 중 하나)
  3. 주요 개선 요청 사항이나 특징적인 의견 3~5가지 (keyPoints)

  응답 목록:
  ${comments.map((c, i) => `- ${c}`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text();
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "분석 중 오류가 발생했습니다.",
      sentiment: "neutral",
      keyPoints: ["AI 응답을 가져오지 못했습니다."]
    };
  }
};