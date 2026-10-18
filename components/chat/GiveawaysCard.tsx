'use client';

import React from 'react';

interface GiveawaysCardProps {
  giveaways: { term: string; addOnPct: number }[];
}

export function GiveawaysCard({ giveaways }: GiveawaysCardProps) {
  return (
    <div className="bg-white rounded-[20px] border border-[#E3E7EF] p-4 space-y-3 my-2">
      <div>
        <h4 className="font-semibold text-[15px] text-[#121A2B]">
          What you're giving away
        </h4>
        <p className="text-[13px] text-[#6B7488] mt-0.5">
          Unpriced terms that usually cost brands extra:
        </p>
      </div>

      <div className="space-y-2">
        {giveaways.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#F3F5F9] text-[13px]"
          >
            <span className="font-semibold text-[#121A2B]">{item.term}</span>
            <span className="text-[#D98A00] font-semibold tabular-nums">
              +{item.addOnPct}% add-on
            </span>
          </div>
        ))}
      </div>

      <p className="text-[13px] text-[#121A2B] pt-1 leading-relaxed">
        Ask for a higher fee to keep these rights, or offer standard organic posting for their current budget.
      </p>
    </div>
  );
}
