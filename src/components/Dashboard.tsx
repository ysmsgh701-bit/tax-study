import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, BookOpen, TrendingUp, CheckCircle, Circle } from 'lucide-react';
import { CURRICULUM, Topic } from '../data/curriculum';
import { getProgress, getStreak, getAllProgress } from '../services/storage';

function ProgressBar({ value, max, color = 'bg-blue-500' }: { value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{value}/{max}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const importanceBadge: Record<Topic['importance'], string> = {
  S: 'bg-red-500 text-white',
  A: 'bg-orange-400 text-white',
  B: 'bg-blue-400 text-white',
  C: 'bg-gray-400 text-white',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const streak = getStreak();
  const allProgress = getAllProgress();

  const completed = CURRICULUM.filter(t => allProgress[t.id]?.status === 'completed');
  const inProgress = CURRICULUM.find(t => allProgress[t.id]?.status === 'in_progress');
  const nextTopic = CURRICULUM.find(t => !allProgress[t.id] || allProgress[t.id].status === 'not_started');
  const todayTopic = inProgress || nextTopic;

  const phase1Total = CURRICULUM.filter(t => t.phase === 1).length;
  const phase1Done = CURRICULUM.filter(t => t.phase === 1 && allProgress[t.id]?.status === 'completed').length;
  const phase2Total = CURRICULUM.filter(t => t.phase === 2).length;
  const phase2Done = CURRICULUM.filter(t => t.phase === 2 && allProgress[t.id]?.status === 'completed').length;

  const byImportance = (['S', 'A', 'B', 'C'] as const).map(imp => ({
    imp,
    total: CURRICULUM.filter(t => t.importance === imp).length,
    done: CURRICULUM.filter(t => t.importance === imp && allProgress[t.id]?.status === 'completed').length,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">학습 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Streak */}
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="text-4xl">🔥</div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{streak.current}일</p>
            <p className="text-sm text-gray-500">연속 학습</p>
            <p className="text-xs text-gray-400">최장 {streak.longestStreak}일</p>
          </div>
        </div>

        {/* Total progress */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-blue-500" />
            <p className="font-semibold text-gray-700">전체 진도</p>
          </div>
          <ProgressBar value={completed.length} max={CURRICULUM.length} />
        </div>

        {/* Today's topic */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-green-500" />
            <p className="font-semibold text-gray-700">오늘 학습</p>
          </div>
          {todayTopic ? (
            <button
              onClick={() => navigate(`/study/${todayTopic.id}`)}
              className="w-full text-left"
            >
              <p className="text-sm font-medium text-blue-600 hover:underline truncate">{todayTopic.name}</p>
              <p className="text-xs text-gray-400 mt-1">클릭하여 시작</p>
            </button>
          ) : (
            <p className="text-sm text-green-600 font-medium">모든 챕터 완료! 🎉</p>
          )}
        </div>
      </div>

      {/* Phase progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="font-semibold text-gray-700 mb-3">Phase 1 · 재무회계</p>
          <ProgressBar value={phase1Done} max={phase1Total} color="bg-purple-500" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="font-semibold text-gray-700 mb-3">Phase 2 · 세법</p>
          <ProgressBar value={phase2Done} max={phase2Total} color="bg-green-500" />
        </div>
      </div>

      {/* By importance */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-8">
        <p className="font-semibold text-gray-700 mb-4">등급별 완료 현황</p>
        <div className="grid grid-cols-4 gap-4">
          {byImportance.map(({ imp, total, done: d }) => (
            <div key={imp} className="text-center">
              <span className={`inline-block text-sm font-bold px-2 py-0.5 rounded mb-2 ${importanceBadge[imp]}`}>{imp}</span>
              <p className="text-2xl font-bold text-gray-900">{d}</p>
              <p className="text-xs text-gray-400">/{total}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Topic list */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="font-semibold text-gray-700">단원 목록</p>
        </div>
        <div className="divide-y divide-gray-50">
          {CURRICULUM.map(t => {
            const p = allProgress[t.id];
            const isDone = p?.status === 'completed';
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/study/${t.id}`)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                {isDone
                  ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  : <Circle size={16} className="text-gray-300 flex-shrink-0" />
                }
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${importanceBadge[t.importance]}`}>
                  {t.importance}
                </span>
                <span className={`text-sm flex-1 ${isDone ? 'text-gray-400' : 'text-gray-700'}`}>{t.name}</span>
                <span className="text-xs text-gray-400">
                  {t.phase === 1 ? '재무회계' : '세법'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
