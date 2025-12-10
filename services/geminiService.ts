import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// 사용자가 제공한 기본 API 키 (환경 변수가 없을 경우 사용)
const DEFAULT_API_KEY = "AIzaSyAf9O6d0WqvcyX0C2zUOAxZcxYCtg8SJjY";

const getApiKey = (): string | undefined => {
  try {
    // process.env가 존재하는지 안전하게 확인 (Node.js/Webpack/CRA 등)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // process 접근 오류 무시 (브라우저 환경 등)
  }
  
  // 환경 변수가 없으면 기본 키 반환
  return DEFAULT_API_KEY;
};

export const analyzeFeedback = async (comments: string[]): Promise<AnalysisResult> => {
  // 데이터가 없는 경우 처리
  if (comments.length === 0) {
    return {
      summary: "분석할 데이터가 없습니다.",
      sentiment: "neutral",
      keyPoints: []
    };
  }

  const apiKey = getApiKey();

  if (!apiKey) {
    console.error("API Key is missing!");
    return {
      summary: "오류: API 키 설정을 확인해주세요.",
      sentiment: "neutral",
      keyPoints: ["API 키가 설정되지 않았습니다."]
    };
  }

  try {
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "AI 분석 중 오류가 발생했습니다.",
      sentiment: "neutral",
      keyPoints: ["잠시 후 다시 시도하거나 네트워크 상태를 확인하세요."]
    };
  }
};