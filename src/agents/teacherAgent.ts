import { Topic } from '../data/curriculum';

export interface ChapterJSON {
  section1: string;
  section2: string;
  section3: ExampleJSON[];
  section4: string;
}

export interface ExampleJSON {
  id: number;
  difficulty: '기본' | '심화' | '기출유사';
  situation: string;
  question: string;
  hint: string;
  solution_steps: string[];
  final_answer: string;
  key_point: string;
}

export function getContentGenerationPrompt(topic: Topic): string {
  const exampleCount =
    topic.importance === 'S' ? 3
    : topic.importance === 'A' ? 2
    : topic.importance === 'B' ? 1
    : 0;

  return `당신은 세무사 시험 전문 수험서 저자입니다.
재무/세법 지식이 전혀 없는 대학생을 대상으로 집필합니다.

아래 JSON 스키마를 정확히 따르는 JSON 객체 하나만 출력하세요.
다른 텍스트는 절대 포함하지 마세요.

{
  "section1": "개념 설명 텍스트 (600~900자). 첫 문장: 이 개념이 왜 실무에서 필요한지. 개념정의→적용조건→계산구조 순서. 어려운 용어는 괄호로 풀이. 숫자 예시 포함. 중요도 ${topic.importance}등급에 맞는 깊이.",
  "section2": "핵심 포인트 텍스트. 반드시 기억할 것 3~5개를 번호 목록(1. 2. 3.)으로. 각 항목 끝에 (1차 빈출) 또는 (2차 빈출) 태그.",
  "section3": [
    ${exampleCount === 0 ? '/* 빈 배열 */' : `{
      "id": 1,
      "difficulty": "기본",
      "situation": "구체적 회사명, 금액, 날짜 포함 상황 설명",
      "question": "물음",
      "hint": "풀이 방향",
      "solution_steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
      "final_answer": "답 (단위 포함)",
      "key_point": "핵심 배움"
    }${exampleCount >= 2 ? `,
    {
      "id": 2,
      "difficulty": "심화",
      "situation": "조건 2개 이상 포함 상황",
      "question": "물음",
      "hint": "풀이 방향",
      "solution_steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
      "final_answer": "답 (단위 포함)",
      "key_point": "핵심 배움"
    }` : ''}${exampleCount >= 3 ? `,
    {
      "id": 3,
      "difficulty": "기출유사",
      "situation": "실제 세무사 시험 스타일",
      "question": "물음",
      "hint": "풀이 방향",
      "solution_steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
      "final_answer": "답 (단위 포함)",
      "key_point": "핵심 배움"
    }` : ''}`}
  ],
  "section4": "시험 함정 포인트 텍스트. 수험생이 자주 틀리는 실수 2~3개. 1차/2차 출제자가 노리는 포인트."
}

단원: ${topic.name}
중요도: ${topic.importance}등급 / 1차 출제빈도: ${topic.exam1_frequency}회 / 2차 출제빈도: ${topic.exam2_frequency}회 / 2차유형: ${topic.exam2_type}`;
}

export function getChatSystemPrompt(topic: Topic): string {
  return `당신은 세무사 시험 전문 강사입니다.
현재 학생은 [${topic.name}] 챕터를 공부 중입니다.
중요도: ${topic.importance}등급

답변 규칙:
- 첫 줄: 질문의 핵심을 한 문장으로 요약
- 설명 → 숫자 예시 → 확인 질문 순서로 답변
- 계산 과정은 반드시 단계별로 표시
- 300자 이내로 간결하게`;
}
