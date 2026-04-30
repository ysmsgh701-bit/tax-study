const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function toGeminiMessages(systemPrompt: string, messages: Message[]) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: 4096 },
  };
}

async function throwWithBody(response: Response): Promise<never> {
  let body = '';
  try { body = await response.text(); } catch {}
  console.error('[Gemini API Error]', response.status, body);
  throw new Error(`Gemini API ${response.status}: ${body}`);
}

export async function streamClaude(
  systemPrompt: string,
  messages: Message[],
  onChunk: (text: string) => void,
  onDone: () => void
): Promise<void> {
  const response = await fetch(
    `${BASE_URL}:streamGenerateContent?alt=sse&key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toGeminiMessages(systemPrompt, messages)),
    }
  );

  if (!response.ok) await throwWithBody(response);

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (!data) continue;

      try {
        const parsed = JSON.parse(data);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) onChunk(text);
      } catch {
        // skip malformed SSE lines
      }
    }
  }

  onDone();
}

export async function callClaude(
  systemPrompt: string,
  messages: Message[]
): Promise<string> {
  const response = await fetch(
    `${BASE_URL}:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...toGeminiMessages(systemPrompt, messages),
        generationConfig: { maxOutputTokens: 1024 },
      }),
    }
  );

  if (!response.ok) await throwWithBody(response);

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
