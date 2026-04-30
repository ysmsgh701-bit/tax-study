export interface ProgressData {
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  lastVisitedAt?: string;
}

export interface StreakData {
  current: number;
  lastStudyDate: string;
  longestStreak: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

export function getProgress(topicId: string): ProgressData {
  return safeGet<ProgressData>(`progress_${topicId}`, { status: 'not_started' });
}

export function saveProgress(topicId: string, data: Partial<ProgressData>): void {
  const current = getProgress(topicId);
  safeSet(`progress_${topicId}`, { ...current, ...data });
}

const CACHE_VERSION = 'v4';

export function getCachedContent(topicId: string): string | null {
  try {
    // Remove all old version caches
    ['', 'v2_', 'v3_'].forEach(v => localStorage.removeItem(`content_${v}${topicId}`));
    return localStorage.getItem(`content_${CACHE_VERSION}_${topicId}`);
  } catch {
    return null;
  }
}

export function saveCachedContent(topicId: string, content: string): void {
  try {
    localStorage.setItem(`content_${CACHE_VERSION}_${topicId}`, content);
  } catch {
    // storage full
  }
}

export function clearCachedContent(topicId: string): void {
  localStorage.removeItem(`content_${CACHE_VERSION}_${topicId}`);
}

export function getChatHistory(topicId: string): ChatMessage[] {
  return safeGet<ChatMessage[]>(`chat_${topicId}`, []);
}

export function saveChatHistory(topicId: string, messages: ChatMessage[]): void {
  safeSet(`chat_${topicId}`, messages);
}

export function getStreak(): StreakData {
  return safeGet<StreakData>('streak', {
    current: 0,
    lastStudyDate: '',
    longestStreak: 0,
  });
}

export function updateStreak(): void {
  const today = new Date().toISOString().split('T')[0];
  const streak = getStreak();

  if (streak.lastStudyDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newCurrent = streak.lastStudyDate === yesterdayStr ? streak.current + 1 : 1;

  safeSet('streak', {
    current: newCurrent,
    lastStudyDate: today,
    longestStreak: Math.max(newCurrent, streak.longestStreak),
  });
}

export function getNotes(topicId: string): string {
  return safeGet<string>(`note_${topicId}`, '');
}

export function saveNote(topicId: string, content: string): void {
  safeSet(`note_${topicId}`, content);
}

export function getAllProgress(): Record<string, ProgressData> {
  const result: Record<string, ProgressData> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('progress_')) {
      const topicId = key.replace('progress_', '');
      result[topicId] = getProgress(topicId);
    }
  }
  return result;
}
