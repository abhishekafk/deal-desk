'use client';

import React from 'react';
import { BrandRecord, Tier } from '@/types';
import { formatInr } from '@/lib/formatters';

interface BrandCardProps {
  brandRecord?: BrandRecord | null;
  tier?: Tier;
  onAddExperience?: () => void;
}

export function BrandCard({ brandRecord, tier = 1, onAddExperience }: BrandCardProps) {
  const isTier1 = tier === 1 && brandRecord && brandRecord.reports_count >= 5 && brandRecord.payout_days;

  return (
    <div className="bg-white rounded-[20px] border border-[#E3E7EF] p-4 space-y-3 my-2">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-[15px] text-[#121A2B]">
            {brandRecord?.name || 'Brand Payment History'}
          </h4>
          <span className="text-[13px] text-[#6B7488] capitalize">
            {brandRecord?.category || 'Lifestyle'}
          </span>
        </div>
        <span className="text-[11px] text-[#6B7488] bg-[#F3F5F9] border border-[#E3E7EF] px-2 py-0.5 rounded-full">
          Sample data
        </span>
      </div>

      {isTier1 && brandRecord ? (
        <div className="space-y-2">
          {/* One big line: Pays in about 52 days */}
          <div>
            <span className="text-[24px] font-semibold text-[#121A2B] block tracking-tight">
              Pays in about {brandRecord.payout_days?.median} days
            </span>
            <span className="text-[13px] text-[#6B7488]">
              Most creators: {brandRecord.payout_days?.p25} to {brandRecord.payout_days?.p75} days
            </span>
          </div>

          {/* Two quiet lines */}
          <div className="pt-1 text-[13px] text-[#6B7488] space-y-0.5">
            <div>
              Typical reel:{' '}
              <span className="text-[#121A2B] font-semibold tabular-nums">
                {formatInr(brandRecord.typical_reel_cash_inr?.low)} to {formatInr(brandRecord.typical_reel_cash_inr?.high)}
              </span>
            </div>
            <div>
              Verified reports:{' '}
              <span className="text-[#121A2B] font-semibold tabular-nums">
                {brandRecord.reports_count} reports
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Tier 2 and 3 */
        <div className="space-y-1.5 py-1">
          <span className="text-[18px] font-semibold text-[#121A2B] block">
            Not enough reports yet
          </span>
          <p className="text-[13px] text-[#6B7488] leading-relaxed">
            {brandRecord
              ? `We only have ${brandRecord.reports_count} reports on this brand, below our minimum of 5. Category benchmark (${brandRecord.category}): typical median payout is 42 days.`
              : 'Category benchmark: typical median payout is 42 days, cash range ₹4,000 to ₹7,000.'}
          </p>
        </div>
      )}

      {onAddExperience && (
        <div className="pt-2 border-t border-[#E3E7EF]">
          <button
            onClick={onAddExperience}
            className="w-full py-2 text-[13px] font-semibold text-[#121A2B] bg-[#F3F5F9] hover:bg-[#E3E7EF] rounded-full transition-colors"
          >
            Add your experience
          </button>
        </div>
      )}
    </div>
  );
}
