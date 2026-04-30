import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { CURRICULUM } from '../data/curriculum';
import Sidebar from '../components/Sidebar';
import ChapterContent from '../components/ChapterContent';
import ChatDrawer from '../components/ChatDrawer';
import { saveProgress, updateStreak } from '../services/storage';

export default function Study() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const topic = CURRICULUM.find(t => t.id === topicId);

  if (!topic) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        단원을 찾을 수 없습니다.
      </div>
    );
  }

  const currentIndex = CURRICULUM.findIndex(t => t.id === topicId);
  const nextTopic = CURRICULUM[currentIndex + 1];

  function handleComplete() {
    saveProgress(topic!.id, { status: 'completed', completedAt: new Date().toISOString().split('T')[0] });
    updateStreak();
    setShowCompleteModal(true);
  }

  function goNext() {
    setShowCompleteModal(false);
    if (nextTopic) {
      navigate(`/study/${nextTopic.id}`);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <ChapterContent topic={topic} onComplete={handleComplete} />
      </main>

      {/* Floating chat button */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-xl hover:bg-blue-700 transition-all hover:scale-105 z-30"
        title="강사에게 질문"
      >
        <MessageCircle size={22} />
      </button>

      <ChatDrawer topic={topic} isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Completion modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCompleteModal(false)} />
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">챕터 완료!</h2>
            <p className="text-gray-500 text-sm mb-6">{topic.name}</p>
            <div className="space-y-3">
              {nextTopic && (
                <button
                  onClick={goNext}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  다음 챕터 → {nextTopic.name}
                </button>
              )}
              <button
                onClick={() => { setShowCompleteModal(false); setChatOpen(true); }}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                약점 질문하기
              </button>
              <button
                onClick={() => { setShowCompleteModal(false); navigate('/'); }}
                className="w-full py-3 text-gray-400 text-sm hover:text-gray-600"
              >
                대시보드로 이동
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
