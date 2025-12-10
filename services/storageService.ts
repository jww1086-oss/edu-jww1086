import { SurveyResponse } from '../types';
import { STORAGE_KEY } from '../constants';

export const getSurveyData = (): SurveyResponse[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return [];
  }
};

export const saveSurveyResponse = (response: SurveyResponse): void => {
  try {
    const currentData = getSurveyData();
    const newData = [...currentData, response];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    throw new Error("데이터 저장에 실패했습니다. 브라우저 저장소 공간을 확인해주세요.");
  }
};

export const clearSurveyData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};