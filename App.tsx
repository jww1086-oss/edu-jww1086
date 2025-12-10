import React, { useState } from 'react';
import SurveyForm from './components/SurveyForm';
import AdminDashboard from './components/AdminDashboard';

type ViewState = 'home' | 'survey' | 'admin';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="max-w-md w-full text-center space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 text-white shadow-lg mb-4">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">안전보건교육<br/>만족도 조사</h1>
                <p className="text-gray-500">더 나은 교육 환경을 위해<br/>근로자 여러분의 소중한 의견을 들려주세요.</p>
              </div>

              <div className="space-y-4 pt-4">
                <button
                  onClick={() => setView('survey')}
                  className="w-full group relative flex items-center p-6 bg-white border-2 border-blue-100 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">설문조사 참여하기</h3>
                    <p className="text-sm text-gray-500">교육 이수 후 설문 작성</p>
                  </div>
                  <div className="absolute right-6 text-gray-300 group-hover:text-blue-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => setView('admin')}
                  className="w-full group relative flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-gray-400 hover:shadow-lg transition-all duration-300 text-left"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center group-hover:bg-gray-700 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">관리자 모드</h3>
                    <p className="text-sm text-gray-500">결과 분석 및 조회</p>
                  </div>
                  <div className="absolute right-6 text-gray-300 group-hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </button>
              </div>

              <div className="text-xs text-gray-400 mt-8">
                &copy; SafetyEdu Pulse. All rights reserved.
              </div>
            </div>
          </div>
        );
      case 'survey':
        return <SurveyForm onBack={() => setView('home')} />;
      case 'admin':
        return <AdminDashboard onBack={() => setView('home')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {renderContent()}
    </div>
  );
};

export default App;