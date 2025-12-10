import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      sentiment: "neutral",
      keyPoints: ["분석 실패"]
    };
  }
};