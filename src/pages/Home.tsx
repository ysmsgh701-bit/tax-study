import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <span className="font-bold text-gray-900">세무사 AI 기본서</span>
        </div>
        <button
          onClick={() => navigate('/analysis')}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors"
        >
          <BarChart2 size={15} /> 학습 분석
        </button>
      </header>
      <Dashboard />
    </div>
  );
}
