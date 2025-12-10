import React, { useState } from 'react';
import { SURVEY_QUESTIONS, RATING_LABELS } from '../constants';
import { saveSurveyResponse } from '../services/storageService';
import { SurveyResponse } from '../types';

interface SurveyFormProps {
  onBack?: () => void;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ onBack }) => {
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleRatingChange = (questionId: number, rating: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleTextChange = (questionId: number, text: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for rating questions
    const ratingQuestions = SURVEY_QUESTIONS.filter(q => q.type === 'rating');
    const allRated = ratingQuestions.every(q => answers[q.id]);
    
    if (!allRated) {
      alert("모든 평가 문항에 답변해주세요.");
      return;
    }

    try {
      // Use timestamp + random fallback for ID to ensure compatibility across all browsers
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);

      const response: SurveyResponse = {
        id: uniqueId,
        timestamp: Date.now(),
        answers
      };

      saveSurveyResponse(response);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Survey submission failed:", error);
      alert("설문 제출 중 오류가 발생했습니다. 브라우저 설정을 확인하거나 잠시 후 다시 시도해주세요.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">제출해주셔서 감사합니다!</h2>
          <p className="text-gray-600 mb-8">귀하의 소중한 의견은 더 나은 교육을 위해 활용됩니다.</p>
          <div className="flex gap-4 justify-center">
            {onBack && (
              <button 
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                홈으로 이동
              </button>
            )}
            <button 
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
            >
              새 설문 작성하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {onBack && (
        <button 
          onClick={onBack}
          className="mb-4 flex items-center text-gray-500 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          홈으로 돌아가기
        </button>
      )}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-white relative">
          <h1 className="text-3xl font-bold mb-2">안전보건교육 만족도 조사</h1>
          <p className="text-blue-100">
            본 설문은 근로자 여러분의 의견을 수렴하여 향후 교육의 질을 높이기 위해 실시합니다.
            솔직한 답변 부탁드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {SURVEY_QUESTIONS.map((q, idx) => (
            <div key={q.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
              <div className="flex items-start mb-4">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3 text-sm">
                  {idx + 1}
                </span>
                <label className="text-lg font-medium text-gray-800 pt-1">
                  {q.text}
                </label>
              </div>

              {q.type === 'rating' ? (
                <div className="ml-11 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(q.id, rating)}
                      className={`
                        relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
                        ${answers[q.id] === rating 
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                          : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-600'}
                      `}
                    >
                      <span className="text-2xl font-bold mb-1">{rating}</span>
                      <span className="text-xs font-medium">{RATING_LABELS[rating]}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="ml-11">
                  <textarea
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="자유롭게 의견을 적어주세요."
                    value={(answers[q.id] as string) || ''}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-lg font-bold py-4 rounded-xl shadow-lg transform active:scale-[0.98] transition-all duration-200"
            >
              설문 제출하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyForm;