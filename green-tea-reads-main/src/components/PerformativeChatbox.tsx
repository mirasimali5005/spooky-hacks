import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper function to format text by removing markdown asterisks
const formatMessageText = (text: string): string => {
  // Remove bold markers (**text**)
  let formatted = text.replace(/\*\*(.+?)\*\*/g, '$1');
  // Remove italic markers (*text*)
  formatted = formatted.replace(/\*(.+?)\*/g, '$1');
  return formatted;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PerformativeChatboxProps {
  isVisible: boolean;
  wikiPath?: string[];
}

export const PerformativeChatbox: React.FC<PerformativeChatboxProps> = ({ isVisible, wikiPath = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownInitialMessage, setHasShownInitialMessage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show initial message when the chat becomes visible
  useEffect(() => {
    if (isVisible && !hasShownInitialMessage) {
      setIsOpen(true);
      setHasShownInitialMessage(true);
      
      const pathInfo = wikiPath.length > 0 
        ? ` I see you're exploring the path from ${wikiPath[0]} to ${wikiPath[wikiPath.length - 1]}!`
        : '';
      
      setMessages([
        {
          role: 'assistant',
          content: `omg hiiii!! 🍵✨ I heard you needed help being more performative?${pathInfo} Let me help you master the art of looking like you have impeccable taste in everything matcha, indie music, and aesthetically pleasing! Ask me anything about being the most performatively cultured person ever~`
        }
      ]);
    }
  }, [isVisible, hasShownInitialMessage, wikiPath]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const pathContext = wikiPath.length > 0 
        ? `The user is exploring a Wikipedia path from ${wikiPath[0]} to ${wikiPath[wikiPath.length - 1]}. `
        : '';

      const systemPrompt = `${pathContext}You are a sassy, Gen-Z chatbot helping users become more "performative" in the most ironic and self-aware way possible. You're an expert in matcha culture, indie music (especially artists like Clairo, Beabadoobee), aesthetic trends, and the art of appearing cultured. You're playful, use lots of emojis, and gently poke fun at performative behavior while actually being helpful. Keep responses concise (2-3 sentences max), fun, and relevant to their interests. Use terms like "bestie," "no but literally," "it's giving," etc.`;

      const conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      }));

      conversationHistory.push({
        role: 'user',
        parts: [{ text: input }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...conversationHistory
        ]
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text.trim()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'omg sorry bestie, I\'m having a moment rn 😭 try again?'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat bubble button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce"
        >
          <MessageCircle className="w-6 h-6" />
          {!hasShownInitialMessage && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-accent"></span>
            </span>
          )}
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="bg-card rounded-2xl shadow-2xl border-2 border-primary/20 w-96 h-[500px] flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-glow text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              <h3 className="font-serif font-bold text-lg">Performative Bestie</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-card border border-border rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{formatMessageText(message.content)}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="ask me how to be more performative..."
                className="flex-1 px-4 py-2 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-primary text-white p-2 rounded-full hover:bg-primary-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
