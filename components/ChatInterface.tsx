import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Chat, GenerateContentResponse } from '@google/genai';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your marketing assistant powered by Gemini 3.0 Pro. How can I help you with your strategy today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userText = input;
    setInput('');
    setIsLoading(true);
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    try {
      // Add placeholder for model response
      setMessages(prev => [...prev, { role: 'model', text: '', isLoading: true }]);

      const result = await chatSessionRef.current.sendMessageStream({ message: userText });
      
      let fullText = '';
      
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const chunkText = c.text || '';
        fullText += chunkText;
        
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.text = fullText;
          }
          return newMessages;
        });
      }

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === 'model') {
          lastMsg.isLoading = false;
        }
        return newMessages;
      });

    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage = error.message || "";
      let userFriendlyError = "I apologize, but I encountered an error processing your request. Please try again.";
      
      if (errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("403")) {
        userFriendlyError = "I don't have permission to use this model. Please ensure you've selected a paid API key with billing enabled.";
      }

      setMessages(prev => [
        ...prev.slice(0, -1), // Remove loading placeholder if it exists
        { role: 'model', text: userFriendlyError }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    chatSessionRef.current = createChatSession();
    setMessages([{ role: 'model', text: "Chat cleared. How can I help you start fresh?" }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[900px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Marketing Assistant</h2>
          <p className="text-xs text-slate-500">Powered by Gemini 3.0 Pro</p>
        </div>
        <button 
          onClick={resetChat}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          title="Reset Chat"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}
            `}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`
              max-w-[80%] rounded-2xl px-5 py-3 shadow-sm
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}
            `}>
              {msg.role === 'model' && msg.text === '' && msg.isLoading ? (
                <div className="flex gap-1 h-6 items-center">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white prose-invert' : 'text-slate-800'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-xl p-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about marketing strategies, SEO, or content ideas..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-slate-800 placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`
              p-3 rounded-lg transition-all duration-200
              ${!input.trim() || isLoading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'}
            `}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};