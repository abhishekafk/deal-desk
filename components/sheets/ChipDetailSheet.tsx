'use client';

import React from 'react';
import { DealRecord } from '@/types';
import { X } from 'lucide-react';

interface ChipDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  chipType: 'usage' | 'payout' | 'confidence' | null;
  deal?: DealRecord | null;
}

export function ChipDetailSheet({
  isOpen,
  onClose,
  chipType,
  deal,
}: ChipDetailSheetProps) {
  if (!isOpen || !chipType || !deal) return null;

  let title = '';
  let content = '';
  let isSampleData = false;

  if (chipType === 'usage') {
    title = 'Usage rights add-on';
    const giveaway = deal.engine.giveaways[0];
    content = giveaway
      ? `This brand requested ${giveaway.term}. Digital usage rights allow them to boost or repurpose your content in ad campaigns. In our pricing model, this adds approximately +${giveaway.addOnPct}% to your commercial value.`
      : 'Usage rights allow brands to use your content for commercial promotion.';
  } else if (chipType === 'payout') {
    isSampleData = true;
    if (deal.engine.brandTier === 1 && deal.brandRecord?.payout_days) {
      title = `${deal.brandRecord.name} payment report`;
      content = `Based on ${deal.brandRecord.reports_count} verified creator reports, the median payout timeline is ${deal.brandRecord.payout_days.median} days (middle-half range: ${deal.brandRecord.payout_days.p25} to ${deal.brandRecord.payout_days.p75} days). If payment is over 45 days, we recommend securing a 50% advance.`;
    } else {
      title = 'Brand payment benchmark';
      content = `We only have ${deal.brandRecord?.reports_count ?? 0} reports on this brand, below our minimum threshold of 5 for brand-specific figures. Instead, we show category benchmark numbers (${deal.profile.niche}), where median payout is 42 days.`;
    }
  } else if (chipType === 'confidence') {
    title = `${deal.engine.confidence} confidence score`;
    content = deal.engine.confidence === 'HIGH'
      ? 'This valuation is calculated from your verified, fresh recent reel analytics and complete deliverable terms.'
      : deal.engine.confidence === 'MEDIUM'
      ? 'This valuation is based on your stated median views and industry CPM benchmarks for your niche.'
      : 'This valuation has lower confidence because your profile metrics are over 30 days old, or some key offer terms were inferred.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in">
      <div className="w-full max-w-[480px] bg-white bottom-sheet p-6 space-y-4 border-t border-[#E3E7EF] shadow-float">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] font-semibold text-[#121A2B] tracking-tight">
              {title}
            </h3>
            {isSampleData && (
              <span className="text-[11px] text-[#6B7488] bg-[#F3F5F9] border border-[#E3E7EF] px-2 py-0.5 rounded-full">
                Sample data
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-[#6B7488] hover:text-[#121A2B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[15px] text-[#121A2B] leading-relaxed">
          {content}
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[15px] rounded-full transition-colors mt-2"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
