import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// 아래 줄이 마법의 코드입니다. 빨간 줄 에러를 무시하게 해줍니다.
// @ts-ignore
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

export const analyzeFeedback = async (comments: string[]): Promise<AnalysisResult> => {
  if (comments.length === 0) {
    return {
      summary: "분석할 데이터가 없습니다.",
      sentiment: "neutral",
      keyPoints: []
    };
  }

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

    // 응답 텍스트를 JSON으로 변환
    const text = response.text();
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "분석 중 오류가 발생했습니다.",
      sentiment: "neutral",
      keyPoints: ["오류 발생: API 키를 확인해주세요."]
    };
  }
};