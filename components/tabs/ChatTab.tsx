'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  CreatorProfile, 
  DealRecord, 
  BrandRecord, 
  ReplyDraft 
} from '@/types';
import { SAMPLE_MESSAGES } from '@/config/samples';
import { formatInr } from '@/lib/formatters';
import { VerdictCard } from '@/components/chat/VerdictCard';
import { ReplyCard } from '@/components/chat/ReplyCard';
import { GiveawaysCard } from '@/components/chat/GiveawaysCard';
import { BrandCard } from '@/components/chat/BrandCard';
import { Paperclip, ArrowUp, HelpCircle } from 'lucide-react';

export type ChatMessage = {
  id: string;
  sender: 'user' | 'assistant';
  type: 'text' | 'verdict' | 'giveaways' | 'brandCard' | 'replyDraft' | 'captionDraft';
  text?: string;
  deal?: DealRecord;
  brandRecord?: BrandRecord | null;
  brandTier?: 1 | 2 | 3;
  giveaways?: { term: string; addOnPct: number }[];
  replies?: ReplyDraft[];
  captions?: string[];
  chips?: string[];
  timestamp: string;
};

interface ChatTabProps {
  profile: CreatorProfile;
  totalUplift: number;
  activeDeal: DealRecord | null;
  onDealChecked: (deal: DealRecord) => void;
  onOpenOutcomeSheet: (deal: DealRecord) => void;
  onOpenCoach: () => void;
  onOpenScreenshotSheet: () => void;
  onOpenChipSheet: (chipType: 'usage' | 'payout' | 'confidence', deal: DealRecord) => void;
  onOpenNumbersUsed: (deal: DealRecord) => void;
}

export function ChatTab({
  profile,
  totalUplift,
  activeDeal,
  onDealChecked,
  onOpenOutcomeSheet,
  onOpenCoach,
  onOpenScreenshotSheet,
  onOpenChipSheet,
  onOpenNumbersUsed,
}: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedUserMsgId, setExpandedUserMsgId] = useState<string | null>(null);
  const [displayedGained, setDisplayedGained] = useState(totalUplift);
  const [currentDeal, setCurrentDeal] = useState<DealRecord | null>(activeDeal);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Storage key per profile
  const STORAGE_KEY = `dealdesk_chat_${profile.id}`;

  // Load chat history from localStorage on profile mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [profile.id]);

  // Persist capped at 50
  useEffect(() => {
    try {
      if (messages.length > 0) {
        const capped = messages.slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
      }
    } catch {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, STORAGE_KEY]);

  // Uplift count-up effect
  useEffect(() => {
    if (totalUplift !== displayedGained) {
      setDisplayedGained(totalUplift);
    }
  }, [totalUplift]);

  // Auto-grow textarea up to 5 lines
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = async (textToSend?: string) => {
    const raw = (textToSend || inputText).trim();
    if (!raw || isTyping) return;

    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // 1. Post user bubble
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      type: 'text',
      text: raw,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: raw,
          profile,
          activeDeal: currentDeal,
        }),
      });

      const data = await res.json();

      // Orchestrate staged reveal (250ms intervals)
      setTimeout(() => {
        setIsTyping(false);

        if (data.type === 'verdict' && data.deal) {
          setCurrentDeal(data.deal);
          onDealChecked(data.deal);

          // Step 1: Text line
          const textMsg: ChatMessage = {
            id: `asst_text_${Date.now()}`,
            sender: 'assistant',
            type: 'text',
            text: data.text || "Here's what I found from this offer:",
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, textMsg]);

          // Step 2: Verdict card (250ms later)
          setTimeout(() => {
            const cardMsg: ChatMessage = {
              id: `asst_card_${Date.now()}`,
              sender: 'assistant',
              type: 'verdict',
              deal: data.deal,
              chips: data.chips,
              timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, cardMsg]);
          }, 250);
        } else if (data.type === 'giveaways') {
          const gMsg: ChatMessage = {
            id: `asst_g_${Date.now()}`,
            sender: 'assistant',
            type: 'giveaways',
            text: data.text,
            giveaways: data.giveaways,
            chips: data.chips,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, gMsg]);
        } else if (data.type === 'brandCard') {
          const bMsg: ChatMessage = {
            id: `asst_b_${Date.now()}`,
            sender: 'assistant',
            type: 'brandCard',
            text: data.text,
            brandRecord: data.brandRecord,
            brandTier: data.brandTier,
            chips: data.chips,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, bMsg]);
        } else if (data.type === 'replyDraft') {
          const rMsg: ChatMessage = {
            id: `asst_r_${Date.now()}`,
            sender: 'assistant',
            type: 'replyDraft',
            deal: data.deal || currentDeal || undefined,
            replies: data.replies,
            chips: data.chips,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, rMsg]);
        } else {
          // Standard text message
          const tMsg: ChatMessage = {
            id: `asst_t_${Date.now()}`,
            sender: 'assistant',
            type: 'text',
            text: data.text,
            chips: data.chips,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, tMsg]);
        }
      }, 500);
    } catch {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `asst_err_${Date.now()}`,
          sender: 'assistant',
          type: 'text',
          text: "I couldn't read that one. Try pasting it again.",
          chips: ["Try a sample offer", "What should I charge?", "Is a brand safe to work with?"],
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleChipClick = (chipText: string) => {
    if (chipText === 'Try a sample offer') {
      const sample = SAMPLE_MESSAGES[0].text;
      handleSend(sample);
      return;
    }

    if (chipText === 'Log this deal' && currentDeal) {
      onOpenOutcomeSheet(currentDeal);
      return;
    }

    handleSend(chipText);
  };

  // Find latest message with chips to only show chips on the latest message
  const latestMessageWithChipsIndex = messages.map((m, idx) => (m.chips && m.chips.length > 0 ? idx : -1)).filter(i => i !== -1).pop();

  return (
    <div className="flex flex-col h-screen max-w-[480px] mx-auto bg-[#F3F5F9]">
      {/* Header (Section 5.3) */}
      <header className="px-4 py-3 bg-[#F3F5F9] border-b border-[#E3E7EF] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#121A2B] text-white flex items-center justify-center text-[15px] font-semibold">
            {profile.name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-[15px] text-[#121A2B] leading-tight block">
              {profile.name}
            </span>
            <span className="text-[11px] text-[#6B7488] block">
              {profile.medianReelViews.toLocaleString('en-IN')} median views
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {displayedGained > 0 && (
            <div className="bg-white border border-[#E3E7EF] rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
              <span className="text-[11px] text-[#6B7488]">Gained</span>
              <span className="text-[13px] font-semibold text-[#1F9D6B] tabular-nums">
                {formatInr(displayedGained)}
              </span>
            </div>
          )}

          <button
            onClick={onOpenCoach}
            className="w-8 h-8 rounded-full bg-white border border-[#E3E7EF] flex items-center justify-center text-[#6B7488] hover:text-[#121A2B] transition-colors"
            title="How DealDesk works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-36">
        {/* Empty State: Assistant speaks first */}
        <div className="bubble-assistant p-4 text-[15px]">
          Hi {profile.name}. Got a brand offer? Paste it here and I'll tell you if it's fair.
        </div>

        {messages.length === 0 && (
          /* Suggestion chips vertical stack */
          <div className="space-y-2 pt-2 max-w-[88%]">
            <button
              onClick={() => handleChipClick('Try a sample offer')}
              className="w-full py-3 px-4 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[13px] rounded-full transition-colors text-center"
            >
              Try a sample offer
            </button>
            <button
              onClick={() => handleChipClick('What should I charge?')}
              className="w-full py-3 px-4 bg-white border border-[#E3E7EF] hover:bg-slate-50 text-[#121A2B] font-semibold text-[13px] rounded-full transition-colors text-center"
            >
              What should I charge?
            </button>
            <button
              onClick={() => handleChipClick('Is a brand safe to work with?')}
              className="w-full py-3 px-4 bg-white border border-[#E3E7EF] hover:bg-slate-50 text-[#121A2B] font-semibold text-[13px] rounded-full transition-colors text-center"
            >
              Is a brand safe to work with?
            </button>
          </div>
        )}

        {/* Render Conversation Messages */}
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isClamped = isUser && (msg.text?.length || 0) > 100 && expandedUserMsgId !== msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
            >
              {isUser ? (
                /* User Bubble (Clamped to 3 lines with Show more) */
                <div className="bubble-user p-3.5 text-[15px]">
                  <p className={isClamped ? 'line-clamp-3' : ''}>
                    {msg.text}
                  </p>
                  {(msg.text?.length || 0) > 100 && (
                    <button
                      onClick={() => setExpandedUserMsgId(isClamped ? msg.id : null)}
                      className="text-[11px] text-white/70 hover:text-white underline mt-1 block"
                    >
                      {isClamped ? 'Show more' : 'Show less'}
                    </button>
                  )}
                </div>
              ) : (
                /* Assistant Content */
                <div className="w-full space-y-2">
                  {msg.type === 'text' && msg.text && (
                    <div className="bubble-assistant p-3.5 text-[15px]">
                      {msg.text}
                    </div>
                  )}

                  {msg.type === 'verdict' && msg.deal && (
                    <VerdictCard
                      deal={msg.deal}
                      onOpenChipSheet={onOpenChipSheet}
                    />
                  )}

                  {msg.type === 'giveaways' && msg.giveaways && (
                    <GiveawaysCard giveaways={msg.giveaways} />
                  )}

                  {msg.type === 'brandCard' && (
                    <BrandCard
                      brandRecord={msg.brandRecord}
                      tier={msg.brandTier || 1}
                    />
                  )}

                  {msg.type === 'replyDraft' && msg.deal && (
                    <ReplyCard
                      deal={msg.deal}
                      onOpenNumbersUsed={onOpenNumbersUsed}
                    />
                  )}

                  {/* Render Follow-up Chips ONLY on the latest message */}
                  {index === latestMessageWithChipsIndex && msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleChipClick(chip)}
                          className="py-1.5 px-3.5 bg-white hover:bg-slate-50 border border-[#E3E7EF] text-[#121A2B] font-semibold text-[13px] rounded-full transition-colors shadow-sm"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Dots Indicator */}
        {isTyping && (
          <div className="bubble-assistant p-3.5 flex items-center gap-1.5 w-16">
            <span className="sr-only">DealDesk is reading your offer</span>
            <div className="w-2 h-2 rounded-full bg-[#6B7488] animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-[#6B7488] animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-[#6B7488] animate-bounce [animation-delay:300ms]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Composer (pinned above bottom bar) */}
      <div className="fixed bottom-16 left-0 right-0 z-20 px-4 py-2 bg-gradient-to-t from-[#F3F5F9] via-[#F3F5F9] to-transparent pointer-events-none">
        <div className="max-w-[480px] mx-auto pointer-events-auto">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-1.5 bg-white rounded-full border border-[#E3E7EF] shadow-float"
          >
            {/* Paperclip Button */}
            <button
              type="button"
              onClick={onOpenScreenshotSheet}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#6B7488] hover:text-[#121A2B] hover:bg-[#F3F5F9] transition-colors shrink-0"
              title="Upload screenshot"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input field */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Paste an offer or ask a question"
              className="flex-1 text-[15px] text-[#121A2B] placeholder:text-[#6B7488] focus:outline-none resize-none py-2 px-1 max-h-32 bg-transparent leading-snug"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-[#121A2B] hover:bg-[#1f2b45] disabled:opacity-30 disabled:hover:bg-[#121A2B] text-white flex items-center justify-center transition-colors shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
