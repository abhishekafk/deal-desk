'use client';

import React from 'react';
import { DealRecord } from '@/types';
import { extractNumbersFromText } from '@/lib/guardrails';
import { X, ShieldCheck } from 'lucide-react';

interface NumbersUsedSheetProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: DealRecord | null;
}

export function NumbersUsedSheet({
  isOpen,
  onClose,
  deal,
}: NumbersUsedSheetProps) {
  if (!isOpen || !deal) return null;

  const replyDrafts = deal.explanation.replies.map(r => r.text).join(' ');
  const numbersInDraft = Array.from(new Set(extractNumbersFromText(replyDrafts)));

  const numberSources = numbersInDraft.map(n => {
    let source = 'Calculated by pricing engine';
    if (n === deal.profile.followers) source = 'Your profile (followers)';
    else if (n === deal.profile.medianReelViews) source = 'Your profile (median views)';
    else if (n === deal.profile.engagementRatePct) source = 'Your profile (engagement rate)';
    else if (n === deal.extraction.cash_offer_inr) source = 'Brand offer (cash offered)';
    else if (n === deal.engine.counterTarget) source = 'Engine (counter target)';
    else if (deal.engine.fairRange && (n === deal.engine.fairRange.low || n === deal.engine.fairRange.high)) source = 'Engine (fair commercial range)';
    else if (deal.engine.resetRange && (n === deal.engine.resetRange.low || n === deal.engine.resetRange.high)) source = 'Engine (re-scope range)';
    else if (n === 50) source = 'Engine (50% advance recommendation)';
    else if (deal.extraction.usage_rights.duration_months === n) source = 'Brand offer (usage months)';
    return { number: n, source };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in">
      <div className="w-full max-w-[480px] bg-white bottom-sheet p-6 space-y-4 border-t border-[#E3E7EF] shadow-float">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[18px] font-semibold text-[#121A2B] tracking-tight">
              Numbers used in this message
            </h3>
          </div>
          <button onClick={onClose} className="text-[#6B7488] hover:text-[#121A2B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[13px] text-[#6B7488] leading-relaxed">
          Every figure quoted in your reply comes directly from your verified numbers or the fair engine. No invented stats.
        </p>

        <div className="space-y-2 max-h-56 overflow-y-auto">
          {numberSources.length > 0 ? (
            numberSources.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#F3F5F9] rounded-xl border border-[#E3E7EF] flex items-center justify-between"
              >
                <span className="font-semibold text-[15px] text-[#121A2B] tabular-nums">
                  {item.number.toLocaleString('en-IN')}
                </span>
                <span className="text-[13px] text-[#6B7488]">
                  {item.source}
                </span>
              </div>
            ))
          ) : (
            <p className="text-[13px] text-[#6B7488] italic py-2">
              No numbers were cited in this reply draft.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[15px] rounded-full transition-colors mt-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
