export interface Question {
  id: number;
  text: string;
  type: 'rating' | 'text';
}

export interface SurveyResponse {
  id: string;
  timestamp: number;
  answers: Record<number, number | string>; // Question ID -> Answer (1-5 or text)
}

export interface AnalysisResult {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keyPoints: string[];
}