const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function throwWithBody(response: Response): Promise<never> {
  let body = '';
  try { body = await response.text(); } catch {}
  console.error('[Gemini API Error]', response.status, body);
  throw new Error(`Gemini API ${response.status}: ${body}`);
}

// JSON 구조화 응답 (챕터 콘텐츠 생성용)
export async function callClaudeJSON<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  const response = await fetch(
    `${BASE_URL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) await throwWithBody(response);

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(text) as T;
}

// 일반 텍스트 응답 (채팅용)
export async function callClaude(
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `${BASE_URL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 1024 },
      }),
    }
  );

  if (!response.ok) await throwWithBody(response);

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// 스트리밍 (현재 미사용, 호환성 유지)
export async function streamClaude(
  systemPrompt: string,
  messages: Message[],
  onChunk: (text: string) => void,
  onDone: () => void
): Promise<void> {
  const text = await callClaude(systemPrompt, messages);
  onChunk(text);
  onDone();
}
