import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, CheckCircle, Eye } from 'lucide-react';

export interface Example {
  id: number;
  difficulty: '기본' | '심화' | '기출유사';
  situation: string;
  question: string;
  hint: string;
  solution_steps: string[];
  final_answer: string;
  key_point: string;
}

const difficultyStyle: Record<Example['difficulty'], string> = {
  '기본': 'border-green-400',
  '심화': 'border-orange-400',
  '기출유사': 'border-red-400',
};

const difficultyBadge: Record<Example['difficulty'], string> = {
  '기본': 'bg-green-100 text-green-700',
  '심화': 'bg-orange-100 text-orange-700',
  '기출유사': 'bg-red-100 text-red-700',
};

type Stage = 'problem' | 'solving' | 'solution';

interface Props {
  example: Example;
  index: number;
}

export default function ExampleCard({ example, index }: Props) {
  const [stage, setStage] = useState<Stage>('problem');
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  return (
    <div className={`border-2 ${difficultyStyle[example.difficulty]} rounded-xl bg-white shadow-sm mb-4`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">예제 {index + 1}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyBadge[example.difficulty]}`}>
            {example.difficulty}
          </span>
          {example.difficulty === '기출유사' && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">기출</span>
          )}
        </div>
        {stage === 'problem' && (
          <button
            onClick={() => setStage('solving')}
            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            풀어보기 <ChevronDown size={16} />
          </button>
        )}
      </div>

      {/* Problem */}
      <div className="px-4 py-3">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{example.situation}</p>
        <p className="mt-2 font-semibold text-gray-900 text-sm">[물음] {example.question}</p>
      </div>

      {/* Hint toggle */}
      {stage !== 'problem' && example.hint && (
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowHint(v => !v)}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800"
          >
            <Lightbulb size={13} />
            힌트 {showHint ? '숨기기' : '보기'}
            {showHint ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {showHint && (
            <p className="mt-1 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">{example.hint}</p>
          )}
        </div>
      )}

      {/* Input stage */}
      {stage === 'solving' && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="답을 입력하세요"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={e => e.key === 'Enter' && setStage('solution')}
            />
            <button
              onClick={() => setStage('solution')}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              채점
            </button>
            <button
              onClick={() => setStage('solution')}
              className="px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <Eye size={14} /> 풀이 보기
            </button>
          </div>
        </div>
      )}

      {/* Solution stage */}
      {stage === 'solution' && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
          {answer && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <span className="text-gray-500">내 답:</span>
              <span className="font-medium">{answer}</span>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1 text-blue-700 font-semibold text-sm mb-2">
              <CheckCircle size={15} /> 풀이
            </div>
            <ol className="space-y-1">
              {example.solution_steps.map((step, i) => (
                <li key={i} className="text-sm text-gray-700">{step}</li>
              ))}
            </ol>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <span className="font-bold text-blue-800 text-sm">정답: {example.final_answer}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
            <span className="text-yellow-600 text-sm">💡</span>
            <p className="text-sm text-yellow-800">{example.key_point}</p>
          </div>

          <button
            onClick={() => { setStage('problem'); setAnswer(''); setShowHint(false); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            다시 풀기
          </button>
        </div>
      )}
    </div>
  );
}
