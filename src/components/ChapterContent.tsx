import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { RefreshCw, AlertTriangle, Star, Loader2 } from 'lucide-react';
import { Topic } from '../data/curriculum';
import { streamClaude } from '../services/claudeApi';
import { getCachedContent, saveCachedContent, clearCachedContent } from '../services/storage';
import { getContentGenerationPrompt } from '../agents/teacherAgent';
import ExampleCard, { Example } from './ExampleCard';

interface ParsedContent {
  section1: string;
  section2: string;
  section3: Example[];
  section4: string;
}

function parseContent(raw: string): ParsedContent {
  const positions = [
    raw.indexOf('===SECTION1==='),
    raw.indexOf('===SECTION2==='),
    raw.indexOf('===SECTION3==='),
    raw.indexOf('===SECTION4==='),
  ];

  if (positions[0] === -1) {
    return { section1: raw, section2: '', section3: [], section4: '' };
  }

  // Extract content between two marker positions; returns '' if start marker missing
  const extract = (fromIdx: number, toIdx: number): string => {
    const from = positions[fromIdx];
    if (from === -1) return '';
    const lineEnd = raw.indexOf('\n', from);
    const contentStart = lineEnd === -1 ? from : lineEnd + 1;
    // Find the nearest next valid marker as the end boundary
    let contentEnd = raw.length;
    for (let i = toIdx; i < positions.length; i++) {
      if (positions[i] !== -1) { contentEnd = positions[i]; break; }
    }
    return raw.slice(contentStart, contentEnd).trim();
  };

  const sec1 = extract(0, 1);
  const sec2 = extract(1, 2);
  const sec3Raw = extract(2, 3);
  const sec4 = extract(s4Start, -1);

  let examples: Example[] = [];
  try {
    const jsonMatch = sec3Raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      examples = JSON.parse(jsonMatch[0]);
    }
  } catch {
    examples = [];
  }

  return { section1: sec1, section2: sec2, section3: examples, section4: sec4 };
}

interface Props {
  topic: Topic;
  onComplete: () => void;
}

export default function ChapterContent({ topic, onComplete }: Props) {
  const [rawContent, setRawContent] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [done, setDone] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    const cached = getCachedContent(topic.id);
    if (cached) {
      setRawContent(cached);
      setDone(true);
      return;
    }
    generate();
    return () => { abortRef.current = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  async function generate() {
    setRawContent('');
    setDone(false);
    setStreaming(true);
    let accumulated = '';

    try {
      await streamClaude(
        getContentGenerationPrompt(topic),
        [{ role: 'user', content: `${topic.name} 챕터의 기본서 콘텐츠를 작성해주세요.` }],
        (chunk) => {
          if (abortRef.current) return;
          accumulated += chunk;
          setRawContent(accumulated);
        },
        () => {
          if (!abortRef.current) {
            saveCachedContent(topic.id, accumulated);
            setDone(true);
          }
        }
      );
    } catch (e: any) {
      const msg = e?.message || String(e);
      console.error('[ChapterContent]', msg);
      setRawContent(`콘텐츠 생성 오류:\n\n${msg}`);
      setDone(true);
    } finally {
      setStreaming(false);
    }
  }

  function regenerate() {
    clearCachedContent(topic.id);
    generate();
  }

  const parsed = done ? parseContent(rawContent) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Chapter header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
          <div className="flex gap-2 mt-1 text-xs text-gray-500">
            <span>중요도 <strong>{topic.importance}</strong></span>
            <span>·</span>
            <span>1차 출제 {topic.exam1_frequency}회</span>
            <span>·</span>
            <span>2차 출제 {topic.exam2_frequency}회 ({topic.exam2_type})</span>
          </div>
        </div>
        <button
          onClick={regenerate}
          disabled={streaming}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40"
        >
          <RefreshCw size={13} className={streaming ? 'animate-spin' : ''} /> 새로 생성
        </button>
      </div>

      {/* Streaming indicator */}
      {streaming && (
        <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
          <Loader2 size={16} className="animate-spin" />
          AI가 기본서 콘텐츠를 작성하고 있습니다...
        </div>
      )}

      {/* Section 1: Concept */}
      {(rawContent || streaming) && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">1</span>
            개념 설명
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 bg-white rounded-xl p-5 shadow-sm">
            {done && parsed ? (
              <ReactMarkdown>{parsed.section1}</ReactMarkdown>
            ) : (
              <ReactMarkdown>{rawContent}</ReactMarkdown>
            )}
          </div>
        </section>
      )}

      {/* Section 2: Key Points */}
      {done && parsed?.section2 && (
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
              <ReactMarkdown>{parsed.section2}</ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Examples */}
      {done && parsed && parsed.section3.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">3</span>
            예제
          </h2>
          {parsed.section3.map((ex, i) => (
            <ExampleCard key={ex.id} example={ex} index={i} />
          ))}
        </section>
      )}

      {/* Section 4: Traps */}
      {done && parsed?.section4 && (
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
              <ReactMarkdown>{parsed.section4}</ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* Complete button */}
      {done && (
        <div className="flex justify-center">
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
          >
            이 챕터 완료 →
          </button>
        </div>
      )}
    </div>
  );
}
