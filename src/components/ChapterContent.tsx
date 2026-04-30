import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { RefreshCw, AlertTriangle, Star, Loader2 } from 'lucide-react';
import { Topic } from '../data/curriculum';
import { callClaudeJSON } from '../services/claudeApi';
import { getCachedContent, saveCachedContent, clearCachedContent } from '../services/storage';
import { getContentGenerationPrompt, ChapterJSON } from '../agents/teacherAgent';
import ExampleCard, { Example } from './ExampleCard';

interface Props {
  topic: Topic;
  onComplete: () => void;
}

const LOADING_MESSAGES = [
  'AI가 개념 설명을 작성하고 있습니다...',
  '예제 문제를 만들고 있습니다...',
  '핵심 포인트를 정리하고 있습니다...',
  '시험 함정 포인트를 분석하고 있습니다...',
];

export default function ChapterContent({ topic, onComplete }: Props) {
  const [content, setContent] = useState<ChapterJSON | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState('');
  const generatingRef = useRef(false);

  useEffect(() => {
    const cached = getCachedContent(topic.id);
    if (cached) {
      try {
        setContent(JSON.parse(cached));
        return;
      } catch {
        clearCachedContent(topic.id);
      }
    }
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  async function generate() {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setLoading(true);
    setError('');
    setContent(null);

    // 로딩 메시지 순환
    let msgIdx = 0;
    const msgTimer = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 4000);

    try {
      const result = await callClaudeJSON<ChapterJSON>(
        getContentGenerationPrompt(topic),
        `${topic.name} 단원의 기본서 콘텐츠를 JSON으로 작성해주세요.`
      );
      saveCachedContent(topic.id, JSON.stringify(result));
      setContent(result);
    } catch (e: any) {
      console.error('[ChapterContent]', e?.message);
      setError(e?.message || '콘텐츠 생성 중 오류가 발생했습니다.');
    } finally {
      clearInterval(msgTimer);
      setLoading(false);
      generatingRef.current = false;
    }
  }

  function regenerate() {
    clearCachedContent(topic.id);
    generate();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
          <div className="flex gap-2 mt-1 text-xs text-gray-500">
            <span>중요도 <strong>{topic.importance}</strong></span>
            <span>·</span>
            <span>1차 {topic.exam1_frequency}회</span>
            <span>·</span>
            <span>2차 {topic.exam2_frequency}회 ({topic.exam2_type})</span>
          </div>
        </div>
        <button
          onClick={regenerate}
          disabled={loading}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> 새로 생성
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="animate-spin text-blue-500" />
          <p className="text-sm text-blue-600 font-medium">{loadingMsg}</p>
          <p className="text-xs text-gray-400">처음 생성은 30초~1분 소요됩니다</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-700">
          <p className="font-semibold mb-1">콘텐츠 생성 오류</p>
          <p className="text-xs">{error}</p>
          <button onClick={regenerate} className="mt-3 text-xs text-red-600 underline">
            다시 시도
          </button>
        </div>
      )}

      {/* Content */}
      {content && (
        <>
          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">1</span>
              개념 설명
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 bg-white rounded-xl p-5 shadow-sm">
              <ReactMarkdown>{content.section1}</ReactMarkdown>
            </div>
          </section>

          {/* Section 2 */}
          {content.section2 && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">2</span>
                핵심 포인트
              </h2>
              <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center gap-1 text-blue-700 font-semibold text-sm mb-3">
                  <Star size={15} /> 반드시 기억할 것
                </div>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown>{content.section2}</ReactMarkdown>
                </div>
              </div>
            </section>
          )}

          {/* Section 3 */}
          {content.section3?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">3</span>
                예제
              </h2>
              {content.section3.map((ex, i) => (
                <ExampleCard key={ex.id} example={ex as Example} index={i} />
              ))}
            </section>
          )}

          {/* Section 4 */}
          {content.section4 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-yellow-500 text-white rounded-full text-xs flex items-center justify-center">4</span>
                시험 함정 포인트
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-1 text-yellow-700 font-semibold text-sm mb-3">
                  <AlertTriangle size={15} /> 수험생이 자주 틀리는 부분
                </div>
                <div className="prose prose-sm max-w-none text-yellow-900">
                  <ReactMarkdown>{content.section4}</ReactMarkdown>
                </div>
              </div>
            </section>
          )}

          <div className="flex justify-center">
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              이 챕터 완료 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
