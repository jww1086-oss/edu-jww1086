import { Question } from './types';

export const SURVEY_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "교육 내용이 귀하의 업무 수행에 도움이 되었습니까?",
    type: 'rating',
  },
  {
    id: 2,
    text: "강사의 전문성과 전달력에 만족하십니까?",
    type: 'rating',
  },
  {
    id: 3,
    text: "교육 자료(교재, 시청각 자료 등)는 이해하기 쉬웠습니까?",
    type: 'rating',
  },
  {
    id: 4,
    text: "교육 시간과 장소(또는 환경)는 적절하였습니까?",
    type: 'rating',
  },
  {
    id: 5,
    text: "전반적인 안전보건교육 만족도는 어떻습니까?",
    type: 'rating',
  },
  {
    id: 6,
    text: "향후 교육에 바라는 점이나 개선사항이 있다면 자유롭게 적어주세요.",
    type: 'text',
  },
];

export const RATING_LABELS: Record<number, string> = {
  1: "매우 불만족",
  2: "불만족",
  3: "보통",
  4: "만족",
  5: "매우 만족",
};

export const ADMIN_PASSWORD = "1234";
export const STORAGE_KEY = "safety_edu_survey_data";