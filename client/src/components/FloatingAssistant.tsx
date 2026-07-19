import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am the Nagarseva AI. I can route complaints, provide updates, or explain civic processes.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content, history: messages.slice(-5) })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I am having trouble connecting to the server right now. Please try again later.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-32 right-6 sm:bottom-6 sm:right-6 z-50">
      {isOpen ? (
        <div className="w-[360px] h-[600px] flex flex-col rounded-[2.5rem] shadow-2xl mb-4 border border-white/60 bg-white/40 backdrop-blur-2xl relative overflow-hidden animate-[fade-in_0.3s_ease-out] group">
          {/* Animated Background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0"></div>
          
          {/* Header */}
          <div className="bg-white/50 backdrop-blur-md p-6 flex justify-between items-center border-b border-white/40 relative z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center relative z-10 shadow-sm">
                  <Sparkles size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-stone-800 text-lg leading-tight">Nagarseva AI</h3>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-black/5 p-2 rounded-full transition-colors text-stone-500 hover:text-stone-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scrollbar-hide">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'assistant' 
                    ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300' 
                    : 'bg-stone-800 text-white'
                }`}>
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`px-5 py-3 max-w-[75%] text-sm shadow-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-stone-800 text-white rounded-3xl rounded-tr-sm'
                    : 'bg-white/80 backdrop-blur-md text-stone-800 border border-white/60 rounded-3xl rounded-tl-sm font-medium'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 border border-emerald-300 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={16} />
                </div>
                <div className="px-5 py-4 rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 rounded-tl-sm flex gap-1.5 items-center shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/50 backdrop-blur-xl border-t border-white/40 relative z-10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="w-full bg-white/80 border border-white/60 rounded-full pl-5 pr-14 py-4 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/50 placeholder-stone-400 shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors shadow-md"
              >
                <Send size={18} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-16 h-16 flex items-center justify-center rounded-full hover:scale-110 transition-transform duration-300"
        >
          <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl border border-white/20">
            <Sparkles size={28} className="text-white drop-shadow-sm" />
          </div>
          
          {/* Notification Dot */}
          <div className="absolute top-0 right-0 w-4 h-4 bg-rose-500 border-2 border-white rounded-full z-20 animate-bounce"></div>
        </button>
      )}
    </div>
  );
}
