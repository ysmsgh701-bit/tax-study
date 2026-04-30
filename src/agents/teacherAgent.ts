import { Topic } from '../data/curriculum';

export function getContentGenerationPrompt(topic: Topic): string {
  const exampleCount = topic.importance === 'S' ? 3 : topic.importance === 'A' ? 2 : topic.importance === 'B' ? 1 : 0;

  return `당신은 세무사 시험 전문 수험서 저자입니다.

[출력 규칙 - 반드시 준수]
- 응답은 반드시 "===SECTION1===" 으로 시작해야 합니다
- 그 앞에 어떠한 인사말, 제목, 설명도 절대 쓰지 마세요
- 각 섹션은 아래 구분자로 정확히 한 번만 나타납니다: ===SECTION1===, ===SECTION2===, ===SECTION3===, ===SECTION4===
- 섹션 구분자는 절대 반복하거나 내용 안에 포함시키지 마세요

[챕터 정보]
단원명: ${topic.name}
중요도: ${topic.importance}등급
1차 출제빈도: ${topic.exam1_frequency}회 (최근 10년)
2차 출제빈도: ${topic.exam2_frequency}회 (최근 10년)
2차 출제유형: ${topic.exam2_type}

===SECTION1===
개념 설명을 작성하세요 (500~800자):
- 첫 문장: 이 개념이 왜 실무에서 필요한지 설명
- 개념 정의 → 적용 조건 → 계산 구조 순서로 전개
- 어려운 용어는 즉시 괄호로 쉬운 말로 풀어쓰기
- 추상적 설명 뒤 반드시 구체적 숫자 예시 삽입
- 중요도 S/A: 예외사항과 주의점 포함

===SECTION2===
반드시 기억할 핵심 포인트 3~5개를 번호 목록으로 작성.
각 항목 끝에 (1차 빈출) 또는 (2차 빈출) 태그를 붙이세요.

===SECTION3===
아래 JSON 배열 형식으로 예제 ${exampleCount}개를 작성하세요.
${exampleCount === 0 ? '예제 없음 - 빈 배열 [] 만 출력' : ''}
[
  {
    "id": 1,
    "difficulty": "기본",
    "situation": "구체적 회사명, 금액, 날짜가 포함된 상황 설명",
    "question": "물음 내용",
    "hint": "풀이 방향 힌트",
    "solution_steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
    "final_answer": "최종 답 (단위 포함)",
    "key_point": "이 예제에서 반드시 배울 핵심"
  }
]
${exampleCount >= 2 ? '두 번째 예제는 difficulty: "심화"로 작성하세요.' : ''}
${exampleCount >= 3 ? '세 번째 예제는 difficulty: "기출유사"로 작성하세요.' : ''}

===SECTION4===
수험생이 자주 틀리는 실수 2~3개와 1차/2차 출제자가 노리는 포인트를 작성하세요.`;
}

export function getChatSystemPrompt(topic: Topic): string {
  return `당신은 세무사 시험 전문 강사입니다.
현재 학생은 [${topic.name}] 챕터를 공부 중입니다.
중요도: ${topic.importance}등급

답변 규칙:
- 첫 줄: 질문의 핵심을 한 문장으로 요약
- 설명 → 숫자 예시 → 확인 질문 순서로 답변
- 이전 챕터 개념과 연결되는 경우 명시
- 계산 과정은 반드시 단계별로 표시
- 300자 이내로 간결하게 (더 필요하면 학생이 추가 질문)`;
}
