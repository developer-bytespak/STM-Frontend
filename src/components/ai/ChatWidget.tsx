import React, { useEffect, useState, useRef } from 'react';
import { socketAIService } from '@/lib/socketAIService';

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'user' | 'ai'; text: string; time?: string }[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socketAIService.connect();
    socketAIService.onResponse((data) => {
      if (data?.message) {
        setMessages((m) => [...m, { from: 'ai', text: data.message || '', time: new Date().toISOString() }]);
      }
    });

    return () => {
      socketAIService.offResponse();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: 'user', text, time: new Date().toISOString() }]);
    setInput('');
    socketAIService.sendMessage(text);
  };

  return (
    <>
      {/* Floating button showing full square icon (no green outline) and label */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1">
        <button
          aria-label="Open SPS AI chat"
          onClick={() => setOpen((v) => !v)}
          className="w-14 h-14 bg-white shadow-lg flex items-center justify-center p-1 rounded-md"
        >
          <img src="/chatbot.png" alt="AI" className="w-full h-full object-contain" />
        </button>
        <div className="text-xs text-white font-semibold">AI Assistant</div>
      </div>

      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 w-full sm:w-[420px] h-full sm:h-[600px] bg-white sm:rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header - reuse ChatPopup header styling */}
          <div className="bg-navy-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white flex items-center justify-center">
                <img src="/chatbot.png" alt="AI" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-semibold text-sm">SPS Assistant</div>
                <p className="text-xs text-navy-200">Ask about services or pricing</p>
              </div>
            </div>
            <div>
              <button onClick={() => setOpen(false)} className="text-white hover:bg-navy-700 p-2 rounded transition-colors text-sm">Close</button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-sm text-gray-500">Ask me about SPS services, availability or pricing.</div>
            )}

            {messages.map((m, idx) => {
              const isUser = m.from === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${isUser ? 'order-2 max-w-[80%]' : 'order-1 max-w-[80%]'}`}>
                    {!isUser && <div className="text-xs font-semibold text-gray-600 mb-1">SPS Assistant</div>}
                    <div className={`rounded-lg ${isUser ? 'bg-green-500 text-white px-4 py-3' : 'bg-white border border-gray-200 text-gray-900 px-4 py-3'}`}>
                      <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{m.time ? new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
                placeholder="Ask about SPS services or pricing..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm bg-white text-black"
                style={{ color: '#000000' }}
              />
              <button
                onClick={send}
                className="bg-navy-600 text-white px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
