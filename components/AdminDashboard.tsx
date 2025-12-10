import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { getSurveyData, clearSurveyData } from '../services/storageService';
import { analyzeFeedback } from '../services/geminiService';
import { SURVEY_QUESTIONS, ADMIN_PASSWORD, RATING_LABELS } from '../constants';
import { SurveyResponse, AnalysisResult } from '../types';

// 1점(매우 불만족) ~ 5점(매우 만족) 순서에 맞춘 의미론적 색상 (Red -> Green)
const RATING_COLORS = {
  1: '#EF4444', // Red (매우 불만족)
  2: '#F97316', // Orange (불만족)
  3: '#EAB308', // Yellow (보통)
  4: '#3B82F6', // Blue (만족)
  5: '#22C55E', // Green (매우 만족)
};

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [data, setData] = useState<SurveyResponse[]>([]);
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'comments'>('overview');

  useEffect(() => {
    if (isAuthenticated) {
      setData(getSurveyData());
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const comments: string[] = [];
    data.forEach(response => {
      const commentQ = SURVEY_QUESTIONS.find(q => q.type === 'text');
      if (commentQ && response.answers[commentQ.id]) {
        comments.push(String(response.answers[commentQ.id]));
      }
    });

    const result = await analyzeFeedback(comments);
    setAiResult(result);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    if (confirm("정말 모든 설문 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      clearSurveyData();
      setData([]);
      setAiResult(null);
    }
  };

  // Compute Statistics
  const stats = useMemo(() => {
    const total = data.length;
    if (total === 0) return null;

    const ratingQuestions = SURVEY_QUESTIONS.filter(q => q.type === 'rating');
    const questionStats = ratingQuestions.map(q => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;
      data.forEach(r => {
        const val = Number(r.answers[q.id] || 0);
        if (val >= 1 && val <= 5) {
          counts[val as keyof typeof counts]++;
          sum += val;
        }
      });
      return {
        id: q.id,
        text: q.text,
        avg: (sum / total).toFixed(1),
        counts
      };
    });

    return { total, questionStats };
  }, [data]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    if (percent < 0.05) return null; // 5% 미만은 라벨 숨김

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          설문 화면으로 돌아가기
        </button>
        <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">관리자 접속</h2>
            <p className="text-gray-500 mt-2">비밀번호를 입력하여 접속해주세요.</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">비밀번호</label>
              <input
                type="password"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="1234"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button 
                onClick={onBack}
                className="mr-4 text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                title="설문 화면으로 돌아가기"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-800 hidden sm:block">관리자 대시보드</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {stats && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-bold">
                  총 {stats.total}명 참여
                </span>
              )}
              <div className="h-6 w-px bg-gray-300 mx-1"></div>
              <button 
                onClick={handleReset}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
              >
                초기화
              </button>
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2 py-1 hover:bg-gray-100 rounded"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {!stats ? (
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-white p-16 rounded-xl shadow-sm text-center border-2 border-dashed border-gray-200">
            <div className="text-gray-300 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">데이터 없음</h3>
            <p className="text-gray-500 text-lg">아직 등록된 설문 데이터가 없습니다.</p>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg shadow-sm w-full sm:w-fit overflow-x-auto">
            {(['overview', 'details', 'comments'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap flex-1 sm:flex-none px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow ring-2 ring-blue-600 ring-offset-2' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab === 'overview' && '종합 요약'}
                {tab === 'details' && '문항별 상세'}
                {tab === 'comments' && 'AI 분석 & 의견'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6 text-gray-800">문항별 평균 만족도</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.questionStats}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                      <XAxis type="number" domain={[0, 5]} hide />
                      <YAxis 
                        dataKey="id" 
                        type="category" 
                        width={40} 
                        tickFormatter={(val) => `Q${val}`} 
                        tick={{fill: '#6B7280', fontSize: 12, fontWeight: 'bold'}}
                      />
                      <Tooltip 
                        cursor={{fill: '#F3F4F6'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                        formatter={(value: any) => [`${value}점`, '평균']}
                        labelFormatter={(label) => stats.questionStats.find(q => q.id === label)?.text}
                      />
                      <Bar dataKey="avg" radius={[0, 4, 4, 0]} barSize={24}>
                        {stats.questionStats.map((entry, index) => {
                          const score = Number(entry.avg);
                          // 점수에 따른 동적 색상 할당
                          let color = RATING_COLORS[3];
                          if (score >= 4.5) color = RATING_COLORS[5];
                          else if (score >= 3.5) color = RATING_COLORS[4];
                          else if (score >= 2.5) color = RATING_COLORS[3];
                          else if (score >= 1.5) color = RATING_COLORS[2];
                          else color = RATING_COLORS[1];
                          
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {stats.questionStats.map((q) => (
                  <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-colors">
                     <div className="flex-1 min-w-0 pr-4">
                       <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Q{q.id}</span>
                       <p className="text-sm font-medium text-gray-800 line-clamp-2" title={q.text}>{q.text}</p>
                     </div>
                     <div className="flex flex-col items-end flex-shrink-0">
                       <span className={`text-3xl font-bold leading-none ${
                         Number(q.avg) >= 4 ? 'text-blue-600' : 
                         Number(q.avg) <= 2 ? 'text-red-500' : 'text-yellow-500'
                       }`}>{q.avg}</span>
                       <span className="text-xs text-gray-400 mt-1">/ 5.0</span>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details Tab - Pie Charts */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.questionStats.map((q) => {
                const chartData = Object.entries(q.counts).map(([key, value]) => ({
                  name: RATING_LABELS[Number(key)],
                  value: value as number,
                  rating: Number(key)
                })).filter(item => item.value > 0); // 값이 0인 항목은 차트에서 제외하지 않음(범례에는 필요할 수 있으나 깔끔함을 위해 제외 가능, 여기선 유지하되 값이 있는것만)

                // 전체 응답 수 계산 (0개일 경우 처리)
                const questionTotal = chartData.reduce((acc, cur) => acc + cur.value, 0);

                return (
                  <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="mb-4">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mb-2">문항 {q.id}</span>
                      <h3 className="text-base font-bold text-gray-800 h-10 line-clamp-2 leading-snug">{q.text}</h3>
                    </div>
                    <div className="h-64 relative">
                      {questionTotal > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={renderCustomizedLabel}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={RATING_COLORS[entry.rating as keyof typeof RATING_COLORS]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                               formatter={(value: number) => [`${value}명 (${((value/questionTotal)*100).toFixed(1)}%)`, '응답 수']}
                               contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                            />
                            <Legend 
                              layout="vertical" 
                              verticalAlign="middle" 
                              align="right"
                              iconSize={8}
                              iconType="circle"
                              wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">데이터 없음</div>
                      )}
                      {/* 중앙 평균 점수 표시 */}
                      {questionTotal > 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                          <span className="text-gray-400 text-xs block">평균</span>
                          <span className="text-2xl font-bold text-gray-800">{q.avg}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comments Tab (with AI) */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-2xl shadow-xl text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      AI 의견 분석
                    </h3>
                    <p className="text-indigo-100 mt-2 opacity-90">Gemini AI가 모든 서술형 답변을 분석하여 핵심 인사이트를 도출합니다.</p>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        분석 중...
                      </>
                    ) : '지금 분석하기'}
                  </button>
                </div>

                {aiResult && (
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mt-6 border border-white/20 animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        aiResult.sentiment === 'positive' ? 'bg-green-400 text-green-900 shadow-sm' :
                        aiResult.sentiment === 'negative' ? 'bg-red-400 text-red-900 shadow-sm' : 'bg-yellow-400 text-yellow-900 shadow-sm'
                      }`}>
                        {aiResult.sentiment === 'positive' ? '긍정적' : aiResult.sentiment === 'negative' ? '부정적' : '중립적'}
                      </span>
                      <span className="text-indigo-100 text-sm font-medium">전반적인 분위기</span>
                    </div>
                    
                    <div className="mb-6">
                       <h4 className="text-indigo-200 text-xs font-bold uppercase mb-2">요약</h4>
                       <p className="leading-relaxed text-lg">{aiResult.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold mb-3 border-b border-white/20 pb-2 flex items-center text-indigo-100">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        주요 의견 및 개선사항
                      </h4>
                      <ul className="space-y-2">
                        {aiResult.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start bg-white/5 p-3 rounded-lg">
                            <span className="text-indigo-300 mr-2 mt-0.5">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center">
                  <span className="w-2 h-8 bg-gray-800 rounded-full mr-3"></span>
                  모든 서술형 응답
                </h3>
                <div className="space-y-4">
                  {data.map((res, idx) => {
                    const textQ = SURVEY_QUESTIONS.find(q => q.type === 'text');
                    const answer = textQ ? res.answers[textQ.id] : null;
                    
                    if (!answer) return null;
                    return (
                      <div key={res.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                        <p className="text-gray-800 leading-relaxed font-medium">"{answer}"</p>
                        <div className="flex justify-end mt-3">
                          <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                            {new Date(res.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {data.every(res => {
                     const textQ = SURVEY_QUESTIONS.find(q => q.type === 'text');
                     return !textQ || !res.answers[textQ.id];
                  }) && (
                    <div className="text-center py-10">
                      <p className="text-gray-400 italic">등록된 서술형 답변이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default AdminDashboard;