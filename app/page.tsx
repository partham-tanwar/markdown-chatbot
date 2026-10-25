'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! Welcome to QYBRENTHAK AI PRIVATE LIMITED. I am your official Customer Success Assistant. How can I assist you with our professional courses, admissions, or platform services today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, sources: data.sources }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'An error occurred. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 md:p-6 bg-[#fbfbfa] text-[#2c2c2c]">
      {/* Natural & Warm Header */}
      <header className="mb-4 text-center py-4 px-6 bg-[#f5f2eb] shadow-sm rounded-2xl border border-[#e6e1d6]">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[#3c3836]">QYBRENTHAK AI Assistant</h1>
        <p className="text-xs text-[#7c7368] font-medium mt-1">Customer Success & Admissions Portal</p>
      </header>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 md:p-6 bg-[#f7f5ef] rounded-2xl shadow-sm border border-[#e6e1d6]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                msg.role === 'user'
                  ? 'bg-[#4a5568] text-white rounded-br-none font-medium'
                  : 'bg-white text-[#2d3748] rounded-bl-none border border-[#e2dcd0]'
              }`}
            >
              {msg.content}
            </div>
            {msg.sources && msg.sources.length > 0 && (
              <span className="text-[10px] text-[#9c9388] mt-1 px-1 tracking-wider">
                Source: {msg.sources.join(', ')}
              </span>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="text-xs text-[#8c8275] italic px-2 animate-pulse">
            Qybrenthak Assistant is analyzing your query...
          </div>
        )}
      </div>

      {/* Warm & Soft Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button
          onClick={() => handleSend('View Available Courses')}
          className="p-3 text-xs md:text-sm font-semibold bg-[#f5f0eb] text-[#4a4039] rounded-xl shadow-sm hover:bg-[#eae2d8] transition-all duration-200 text-center border border-[#dfd6cb] active:scale-95"
        >
          View Available Courses
        </button>
        <button
          onClick={() => handleSend('Admission Process')}
          className="p-3 text-xs md:text-sm font-semibold bg-[#f5f0eb] text-[#4a4039] rounded-xl shadow-sm hover:bg-[#eae2d8] transition-all duration-200 text-center border border-[#dfd6cb] active:scale-95"
        >
          Admission & Placement
        </button>
        <button
          onClick={() => handleSend('Frequently Asked Questions')}
          className="p-3 text-xs md:text-sm font-semibold bg-[#f5f0eb] text-[#4a4039] rounded-xl shadow-sm hover:bg-[#eae2d8] transition-all duration-200 text-center border border-[#dfd6cb] active:scale-95"
        >
          Frequently Asked Questions
        </button>
      </div>

      {/* Sleek Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 bg-[#f5f2eb] p-2 rounded-2xl border border-[#e6e1d6] shadow-sm"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a specific question (e.g., Web Development course fee)..."
          className="flex-1 px-4 py-3 text-sm focus:outline-none text-[#2c2c2c] placeholder-[#9c9388] bg-transparent rounded-xl"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[#4a5568] text-white text-sm font-semibold rounded-xl hover:bg-[#374151] transition shadow-sm disabled:opacity-50 active:scale-95"
        >
          Send
        </button>
      </form>
    </div>
  );
}