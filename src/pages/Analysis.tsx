import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Circle, ArrowLeft } from 'lucide-react';
import { CURRICULUM, Topic } from '../data/curriculum';
import { getAllProgress } from '../services/storage';

const importanceBadge: Record<Topic['importance'], string> = {
  S: 'bg-red-500 text-white',
  A: 'bg-orange-400 text-white',
  B: 'bg-blue-400 text-white',
  C: 'bg-gray-400 text-white',
};

function DonutChart({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : value / max;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <svg width={88} height={88} className="-rotate-90">
      <circle cx={44} cy={44} r={r} fill="none" stroke="#E5E7EB" strokeWidth={10} />
      <circle
        cx={44} cy={44} r={r} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

export default function Analysis() {
  const navigate = useNavigate();
  const allProgress = getAllProgress();

  const today = new Date().toISOString().split('T')[0];
  const needsReview = CURRICULUM.filter(t => {
    const p = allProgress[t.id];
    if (p?.status !== 'completed' || !p.completedAt) return false;
    const daysSince = Math.floor((Date.now() - new Date(p.completedAt).getTime()) / 86400000);
    return daysSince >= 14;
  });

  const phase1Topics = CURRICULUM.filter(t => t.phase === 1);
  const phase2Topics = CURRICULUM.filter(t => t.phase === 2);
  const phase1Done = phase1Topics.filter(t => allProgress[t.id]?.status === 'completed').length;
  const phase2Done = phase2Topics.filter(t => allProgress[t.id]?.status === 'completed').length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={16} /> 대시보드로
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">학습 분석</h1>

      {/* Phase completion donuts */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <DonutChart value={phase1Done} max={phase1Topics.length} color="#8B5CF6" />
          <div>
            <p className="font-semibold text-gray-700">Phase 1</p>
            <p className="text-sm text-gray-500">재무회계</p>
            <p className="text-lg font-bold text-purple-600">{phase1Done}/{phase1Topics.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <DonutChart value={phase2Done} max={phase2Topics.length} color="#10B981" />
          <div>
            <p className="font-semibold text-gray-700">Phase 2</p>
            <p className="text-sm text-gray-500">세법</p>
            <p className="text-lg font-bold text-green-600">{phase2Done}/{phase2Topics.length}</p>
          </div>
        </div>
      </div>

      {/* Needs review */}
      {needsReview.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <p className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Clock size={16} /> 복습 필요 ({needsReview.length}개)
          </p>
          <div className="space-y-2">
            {needsReview.map(t => (
              <button
                key={t.id}
                onClick={() => navigate(`/study/${t.id}`)}
                className="w-full flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900"
              >
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${importanceBadge[t.importance]}`}>{t.importance}</span>
                {t.name} →
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full topic table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">단원명</th>
              <th className="px-4 py-3 text-center">중요도</th>
              <th className="px-4 py-3 text-center">상태</th>
              <th className="px-4 py-3 text-center">완료일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {CURRICULUM.map(t => {
              const p = allProgress[t.id];
              const isDone = p?.status === 'completed';
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/study/${t.id}`)}
                      className="text-left hover:text-blue-600 font-medium"
                    >
                      {t.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${importanceBadge[t.importance]}`}>
                      {t.importance}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isDone
                      ? <span className="flex items-center justify-center gap-1 text-green-600"><CheckCircle size={14} /> 완료</span>
                      : p?.status === 'in_progress'
                        ? <span className="text-blue-600">학습 중</span>
                        : <span className="flex items-center justify-center gap-1 text-gray-400"><Circle size={14} /> 미시작</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">
                    {p?.completedAt || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
