import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Topic } from '../data/curriculum';
import { callClaude } from '../services/claudeApi';
import { getChatHistory, saveChatHistory, ChatMessage } from '../services/storage';
import { getChatSystemPrompt } from '../agents/teacherAgent';

interface Props {
  topic: Topic;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatDrawer({ topic, isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatHistory(topic.id));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(getChatHistory(topic.id));
  }, [topic.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = updated.map(m => ({ role: m.role, content: m.content }));
      const reply = await callClaude(getChatSystemPrompt(topic), apiMessages);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      const final = [...updated, assistantMsg];
      setMessages(final);
      saveChatHistory(topic.id, final);
    } catch (e) {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: '답변 중 오류가 발생했습니다. API 키를 확인해주세요.',
        timestamp: new Date().toISOString(),
      };
      const final = [...updated, errMsg];
      setMessages(final);
      saveChatHistory(topic.id, final);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="bg-black/30 flex-1" onClick={onClose} />
      <div className="w-full max-w-sm bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white">
          <div>
            <p className="font-semibold text-sm">강사에게 질문</p>
            <p className="text-xs text-slate-400 truncate max-w-[200px]">{topic.name}</p>
          </div>
          <button onClick={onClose} className="hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-8">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
              <p>이 챕터에 대해 궁금한 점을 질문해보세요!</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 size={16} className="animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="질문을 입력하세요..."
              disabled={loading}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
