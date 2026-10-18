'use client';

import React, { useState } from 'react';
import { DealRecord } from '@/types';
import { Copy, Check } from 'lucide-react';

interface ReplyCardProps {
  deal: DealRecord;
  onOpenNumbersUsed: (deal: DealRecord) => void;
}

export function ReplyCard({ deal, onOpenNumbersUsed }: ReplyCardProps) {
  const [tone, setTone] = useState<'friendly' | 'firm'>('friendly');
  const [draft, setDraft] = useState(() => {
    const found = deal.explanation.replies.find(r => r.label === 'friendly');
    return found?.text || deal.explanation.replies[0]?.text || '';
  });
  const [copied, setCopied] = useState(false);

  const handleSelectTone = (newTone: 'friendly' | 'firm') => {
    setTone(newTone);
    const found = deal.explanation.replies.find(r => r.label === newTone);
    if (found) setDraft(found.text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#E3E7EF] p-4 space-y-3 my-2">
      {/* Segmented Control */}
      <div className="flex bg-[#F3F5F9] rounded-full p-0.5">
        <button
          onClick={() => handleSelectTone('friendly')}
          className={`flex-1 py-1.5 text-[13px] font-semibold rounded-full transition-all ${
            tone === 'friendly' ? 'bg-white text-[#121A2B] shadow-sm' : 'text-[#6B7488]'
          }`}
        >
          Friendly
        </button>
        <button
          onClick={() => handleSelectTone('firm')}
          className={`flex-1 py-1.5 text-[13px] font-semibold rounded-full transition-all ${
            tone === 'firm' ? 'bg-white text-[#121A2B] shadow-sm' : 'text-[#6B7488]'
          }`}
        >
          Firm
        </button>
      </div>

      {/* Editable Draft */}
      <textarea
        rows={4}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        className="w-full text-[13px] text-[#121A2B] p-3 rounded-xl border border-[#E3E7EF] focus:outline-none focus:border-[#121A2B] font-sans resize-none leading-relaxed"
      />

      {/* Action Row */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onOpenNumbersUsed(deal)}
          className="text-[13px] text-[#6B7488] hover:text-[#121A2B] underline"
        >
          Numbers used
        </button>

        <button
          onClick={handleCopy}
          className="px-4 py-2 text-[13px] font-semibold text-white bg-[#121A2B] hover:bg-[#1f2b45] rounded-full flex items-center gap-1.5 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#1F9D6B]" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
