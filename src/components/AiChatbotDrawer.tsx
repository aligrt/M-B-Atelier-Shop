import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { askAiAssistant } from '../services/aiChatService';
import { STORE_PHONE_NUMBER, STORE_DISPLAY_PHONE } from '../data/products';

export const AiChatbotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Assalam-o-Alaikum! Welcome to M&B Atelier. I can assist you with bag specs, COD rules, delivery timelines (2–4 days), or our doorstep Open-Parcel inspection policy.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        'Can I inspect before paying COD?',
        'Which bag fits a 16" laptop?',
        'How fast is delivery to my city?',
        'What makes your bags rainproof?',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const botReply = await askAiAssistant(text, [...messages, userMsg]);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `For instant human assistance, feel free to WhatsApp our concierge directly at ${STORE_DISPLAY_PHONE}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger on Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        
        {/* Direct WhatsApp Concierge Button */}
        <a
          href={`https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent('Hi M&B Atelier, I have a query about your bags.')}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`WhatsApp Direct Support (${STORE_DISPLAY_PHONE})`}
          className="group flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-950/40 border border-emerald-400/40 transition-all hover:scale-105 cursor-pointer text-xs font-bold"
        >
          <PhoneCall className="w-4 h-4 text-white animate-bounce" />
          <span className="hidden sm:inline">WhatsApp Concierge</span>
        </a>

        {/* AI Chatbot Launcher Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open AI Assistant"
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#1C1F24] to-[#14171A] hover:border-[#C5832B] text-white rounded-full shadow-2xl border border-[#C5832B]/60 transition-all hover:scale-105 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-[#C5832B]/20 flex items-center justify-center text-[#C5832B]">
            <Bot className="w-4 h-4 text-[#C5832B]" />
          </div>
          <span className="text-xs font-bold tracking-wide">
            {isOpen ? 'Close Concierge' : 'Atelier AI Chat'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Slide-Over / Popover Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] max-h-[80vh] bg-[#16181B] border border-[#2B3038] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-[#14171A] border-b border-[#252A30] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1F242C] border border-[#C5832B]/50 flex items-center justify-center text-[#C5832B]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-white">M&B AI Concierge</h3>
                  <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Instant guidance on COD, bags & delivery
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Notice Pill */}
          <div className="px-3.5 py-1.5 bg-[#1C2025] border-b border-[#2B3038] flex items-center justify-between text-[11px] text-neutral-300">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Open Parcel Inspection
            </span>
            <span className="flex items-center gap-1 text-neutral-400">
              <Truck className="w-3 h-3 text-[#C5832B]" /> 2–4 Days Nationwide
            </span>
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-[#1E232A] border border-[#2B3038] flex items-center justify-center shrink-0 text-[#C5832B] mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 space-y-1.5 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#C5832B] to-[#9C5B42] text-white rounded-tr-none'
                      : 'bg-[#1C2025] text-neutral-200 border border-[#2B3038] rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-[9px] ${
                      msg.sender === 'user' ? 'text-neutral-200 text-right' : 'text-neutral-500 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>

                  {/* Optional Quick Reply Chips for Bot */}
                  {msg.quickReplies && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(reply)}
                          className="px-2.5 py-1 text-[11px] bg-[#14171A] hover:bg-[#252A30] border border-[#3A424E] text-[#E2B29F] rounded-lg transition-colors cursor-pointer text-left"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-[#252A30] flex items-center justify-center shrink-0 text-white mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-neutral-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-[#1E232A] border border-[#2B3038] flex items-center justify-center shrink-0 text-[#C5832B]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-3 py-2 bg-[#1C2025] rounded-xl border border-[#2B3038] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5832B] animate-ping" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-[#14171A] border-t border-[#252A30]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about bag specs, delivery, or COD..."
                className="flex-1 bg-[#1C2025] border border-[#2B3038] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C5832B] transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 bg-gradient-to-r from-[#DF9B84] to-[#C5832B] hover:from-[#F0C0B0] hover:to-[#D49D87] disabled:opacity-50 text-neutral-950 rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
