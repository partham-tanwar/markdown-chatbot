'use client';

import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
};

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am Knowledge Buddy, your friendly knowledge assistant. How can I help you today?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    'Which courses are available?',
    'Can you tell me about the fees?',
    'What are the admission requirements?',
  ];

  const handleSend = async (questionText?: string) => {
    const query = questionText || input;
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    if (!questionText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message || 'Something went wrong. Please check your configuration.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF8EF] text-[#493528] flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-2xl bg-[#FFFCF7] border border-[#EBDCCD] rounded-2xl p-6 shadow-sm mb-6 text-center">
        <h1 className="text-3xl font-bold text-[#C47B4B] flex items-center justify-center gap-2">
          <span>🤖</span> Knowledge Buddy
        </h1>
        <p className="text-[#8B7768] mt-1">Your friendly knowledge assistant</p>
      </header>

      {/* Chat Container */}
      <div className="w-full max-w-2xl bg-[#FFFCF7] border border-[#EBDCCD] rounded-2xl p-6 shadow-sm flex flex-col h-[500px] mb-4">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#B86D43] text-white rounded-br-none'
                    : 'bg-[#EBDCCD] text-[#493528] rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 text-xs opacity-75 border-t border-[#493528]/20 pt-1">
                    Sources: {msg.sources.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-[#EBDCCD] text-[#8B7768] rounded-2xl rounded-bl-none px-4 py-3 text-sm animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Questions */}
        <div className="py-2 border-t border-[#EBDCCD] mt-2">
          <p className="text-xs text-[#8B7768] mb-2 font-semibold">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-xs bg-[#FFF8EF] border border-[#EBDCCD] text-[#C47B4B] px-3 py-1.5 rounded-full hover:bg-[#EBDCCD]/50 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2 mt-2 pt-2 border-t border-[#EBDCCD]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1 bg-[#FFF8EF] border border-[#EBDCCD] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#C47B4B]"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className="bg-[#B86D43] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}