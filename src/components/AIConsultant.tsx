import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Bot, User, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askAquariumExpert } from '../services/aiService';
import { useLocale } from '../context/LocaleContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIConsultantProps {
  onClose: () => void;
  context: any;
}

export default function AIConsultant({ onClose, context }: AIConsultantProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('ai_consultant_welcome'),
      sender: 'ai',
      timestamp: new Date()
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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askAquariumExpert(input, context, locale.id);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response || t('ai_consultant_error'),
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('ai_consultant_error'),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[800px]"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl">
              <Bot className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {t('ai_consultant_title')}
                <Sparkles size={16} className="text-amber-400 animate-pulse" />
              </h2>
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{t('ai_consultant_tagline')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white active:bg-white/20"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar bg-zinc-950/30">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-500 text-white rounded-tr-none shadow-lg shadow-indigo-500/10' 
                    : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                  <span className={`text-[10px] mt-2 block opacity-40 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-emerald-400" />
                  <span className="text-xs text-white/60 italic">{t('ai_consultant_loading')}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-zinc-900/50">
          <form onSubmit={handleSend} className="relative flex items-center gap-3">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai_consultant_placeholder')}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm placeholder:text-white/20 pr-14"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/20 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-[10px] text-center text-white/20 mt-3 uppercase tracking-widest font-bold">
            Powered by Gemini AI • Smart Guardian Expert
          </p>
        </div>
      </motion.div>
    </div>
  );
}
