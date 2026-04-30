import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Menu, X, BookOpen } from 'lucide-react';
import { CURRICULUM, Topic } from '../data/curriculum';
import { getProgress } from '../services/storage';

const importanceBadge: Record<Topic['importance'], string> = {
  S: 'bg-red-500 text-white',
  A: 'bg-orange-400 text-white',
  B: 'bg-blue-400 text-white',
  C: 'bg-gray-400 text-white',
};

function CompletionBar() {
  const total = CURRICULUM.length;
  const completed = CURRICULUM.filter(t => getProgress(t.id).status === 'completed').length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="px-4 py-3 border-b border-slate-700">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>전체 진도</span>
        <span>{completed}/{total} ({pct}%)</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface TopicItemProps {
  topic: Topic;
  isActive: boolean;
  onClick: () => void;
}

function TopicItem({ topic, isActive, onClick }: TopicItemProps) {
  const progress = getProgress(topic.id);
  const isDone = progress.status === 'completed';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm transition-colors hover:bg-slate-700 ${
        isActive ? 'bg-slate-700 border-r-2 border-blue-400' : ''
      }`}
    >
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${importanceBadge[topic.importance]}`}>
        {topic.importance}
      </span>
      <span className={`flex-1 truncate ${isDone ? 'text-slate-400' : 'text-slate-200'}`}>
        {topic.name}
      </span>
      {isDone && <CheckCircle size={14} className="text-green-400 flex-shrink-0" />}
    </button>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const [mobileOpen, setMobileOpen] = useState(false);

  const phase1 = CURRICULUM.filter(t => t.phase === 1);
  const phase2 = CURRICULUM.filter(t => t.phase === 2);

  const content = (
    <div className="flex flex-col h-full bg-slate-800 text-slate-200">
      <div className="px-4 py-4 flex items-center gap-2 border-b border-slate-700">
        <BookOpen size={20} className="text-blue-400" />
        <span className="font-bold text-white">세무사 AI 기본서</span>
        <button
          className="ml-auto lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <CompletionBar />

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
          Phase 1 · 재무회계
        </div>
        {phase1.map(t => (
          <TopicItem
            key={t.id}
            topic={t}
            isActive={t.id === topicId}
            onClick={() => {
              navigate(`/study/${t.id}`);
              setMobileOpen(false);
            }}
          />
        ))}

        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
          Phase 2 · 세법
        </div>
        {phase2.map(t => (
          <TopicItem
            key={t.id}
            topic={t}
            isActive={t.id === topicId}
            onClick={() => {
              navigate(`/study/${t.id}`);
              setMobileOpen(false);
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0 overflow-hidden">
        {content}
      </div>

      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 bg-slate-800 text-white p-2 rounded-lg shadow"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 h-full shadow-xl">{content}</div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
