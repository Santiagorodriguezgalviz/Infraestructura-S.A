import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';
import { getChatResponse } from '@/services/gemini';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatbotComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  message: string;
  sender: "user" | "bot";
}

export function ChatbotComponent({ isOpen, onClose }: ChatbotComponentProps) {
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      message: "¡Hola! Soy el asistente del sistema de inventario. ¿En qué puedo ayudarte?",
      sender: "bot"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      message: inputValue,
      sender: "user"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await getChatResponse(inputValue);
      const botMessage: ChatMessage = {
        message: response,
        sender: "bot"
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        message: "Lo siento, hubo un error. Por favor, intenta nuevamente.",
        sender: "bot"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-24 right-6 z-50 w-[380px] rounded-2xl shadow-2xl",
        "transform transition-all duration-300 ease-in-out",
        isOpen 
          ? "translate-y-0 opacity-100 scale-100" 
          : "translate-y-4 opacity-0 scale-95 pointer-events-none",
        isDark 
          ? "bg-slate-900/95 backdrop-blur-lg border border-slate-800" 
          : "bg-white/95 backdrop-blur-lg border border-gray-200",
        "overflow-hidden"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        isDark 
          ? "border-slate-700/50 bg-slate-900/50" 
          : "border-gray-200 bg-white/50",
        "backdrop-blur-md"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-full",
            isDark 
              ? "bg-primary/10 text-primary/90" 
              : "bg-primary/10 text-primary"
          )}>
            <MessageCircle size={20} />
          </div>
          <h3 className={cn(
            "font-semibold",
            isDark ? "text-slate-200" : "text-gray-900"
          )}>
            Chat de Asistencia
          </h3>
        </div>
        <button
          onClick={onClose}
          className={cn(
            "p-2 rounded-full transition-colors duration-200",
            isDark 
              ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" 
              : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          )}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        className={cn(
          "h-[450px] overflow-y-auto p-4 space-y-4",
          isDark ? "bg-slate-900/30" : "bg-gray-50/30",
          "scroll-smooth"
        )}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={cn(
              "max-w-[80%] p-3 rounded-2xl transition-all duration-200 hover:shadow-md",
              msg.sender === 'user'
                ? "bg-primary text-primary-foreground ml-4"
                : isDark
                ? "bg-slate-800 text-slate-200 mr-4"
                : "bg-white text-gray-900 shadow-sm mr-4"
            )}>
              {msg.message}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full",
              isDark 
                ? "bg-slate-800 text-slate-200" 
                : "bg-white text-gray-900 shadow-sm"
            )}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={cn(
        "p-4 border-t",
        isDark 
          ? "border-slate-700/50 bg-slate-900/50" 
          : "border-gray-200 bg-white/50",
        "backdrop-blur-md"
      )}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
            placeholder="Escribe tu mensaje..."
            className={cn(
              "flex-1 p-3 rounded-xl border transition-all duration-200",
              isDark
                ? "bg-slate-800/50 border-slate-700 text-slate-200 placeholder-slate-400 focus:border-primary"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-primary",
              "focus:ring-2 focus:ring-primary/20 focus:outline-none"
            )}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={cn(
              "p-3 rounded-xl font-medium transition-all duration-200",
              "flex items-center justify-center gap-2 min-w-[100px]",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "disabled:bg-slate-800 disabled:text-slate-400",
              "disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            )}
          >
            <Send size={18} className={isLoading ? 'opacity-0' : 'opacity-100'} />
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
