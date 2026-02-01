
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatIcon } from './Icons';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [...messages, { role: 'user', text: userMessage }].map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }))
      });

      const aiText = response.text || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] space-y-4">
      <div className="text-center">
        <h2 className="text-3xl font-black text-white italic tracking-tighter">AI Assistant</h2>
        <p className="text-slate-500 text-sm">Powered by Gemini 3 Pro</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 glass rounded-[2rem] border-slate-800 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
               <ChatIcon className="w-8 h-8 text-blue-500" />
             </div>
             <p className="text-slate-400 font-bold">Ask me anything about QR codes or general topics.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-[1.5rem] text-sm font-medium ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 text-slate-400 border border-slate-800 px-5 py-3 rounded-[1.5rem] rounded-bl-none flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask something..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-blue-500 transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
};

export default AIChat;
