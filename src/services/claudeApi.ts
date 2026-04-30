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

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 3000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      const is503 = e?.message?.includes('503');
      if (!is503 || i === retries - 1) throw e;
      console.warn(`[Retry ${i + 1}/${retries}] 503 - ${delayMs}ms 후 재시도...`);
      await new Promise(res => setTimeout(res, delayMs));
      delayMs *= 2;
    }
  }
  throw new Error('최대 재시도 횟수 초과');
}

export async function callClaudeJSON<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  return withRetry(async () => {
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

    try {
      return JSON.parse(text) as T;
    } catch {
      console.error('[callClaudeJSON] JSON parse failed:', text.slice(0, 300));
      throw new Error('AI 응답 파싱 실패. 다시 시도해주세요.');
    }
  });
}

export async function callClaude(
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  return withRetry(async () => {
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
  });
}

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
