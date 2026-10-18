'use client';

import React, { useState } from 'react';
import { DealRecord, Verdict } from '@/types';
import { formatInr } from '@/lib/formatters';
import { VerdictCard } from '@/components/chat/VerdictCard';
import { X, ArrowRight } from 'lucide-react';

interface DealsTabProps {
  deals: DealRecord[];
  onSwitchToChat: () => void;
  onOpenOutcome: (deal: DealRecord) => void;
  onOpenChipSheet: (chipType: 'usage' | 'payout' | 'confidence', deal: DealRecord) => void;
}

export function DealsTab({
  deals,
  onSwitchToChat,
  onOpenOutcome,
  onOpenChipSheet,
}: DealsTabProps) {
  const [selectedDeal, setSelectedDeal] = useState<DealRecord | null>(null);

  const getVerdictDot = (v?: Verdict) => {
    switch (v) {
      case 'TAKE':
        return 'bg-[#1F9D6B]';
      case 'COUNTER':
        return 'bg-[#D98A00]';
      case 'PASS_OR_RESET':
        return 'bg-[#D64545]';
      case 'NEED_INFO':
      default:
        return 'bg-[#8A93A6]';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 max-w-[480px] mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-[20px] font-semibold text-[#121A2B] tracking-tight">
          Deals
        </h2>
        <p className="text-[13px] text-[#6B7488]">
          Every offer you've checked with DealDesk
        </p>
      </div>

      {!deals || deals.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center space-y-4 bg-white rounded-[20px] border border-[#E3E7EF] p-6">
          <p className="text-[15px] text-[#6B7488]">
            Deals you check show up here.
          </p>
          <button
            onClick={onSwitchToChat}
            className="px-5 py-3 text-[13px] font-semibold text-white bg-[#121A2B] hover:bg-[#1f2b45] rounded-full transition-colors cursor-pointer"
          >
            Check a deal
          </button>
        </div>
      ) : (
        /* Deals List */
        <div className="space-y-2">
          {deals.map((d, index) => {
            const isLogged = d.outcome && d.outcome.finalCash > 0;
            const offerVal = d.engine?.offerValue ?? d.extraction?.cash_offer_inr ?? null;
            const offerStr = offerVal !== null ? formatInr(offerVal) : 'Unpriced';
            const finalStr = isLogged ? formatInr(d.outcome!.finalCash) : null;
            const brandName = d.brandName || d.extraction?.brand_name || 'Brand Collab';
            const verdict = d.engine?.verdict || 'NEED_INFO';
            const status = d.status || 'Checked';

            return (
              <div
                key={d.id || `deal_${index}`}
                onClick={() => setSelectedDeal(d)}
                className="bg-white p-4 rounded-[20px] border border-[#E3E7EF] hover:border-[#121A2B] cursor-pointer transition-all flex items-center justify-between min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${getVerdictDot(verdict)} shrink-0`} />
                  <div>
                    <span className="font-semibold text-[15px] text-[#121A2B] block">
                      {brandName}
                    </span>
                    <span className="text-[13px] text-[#6B7488] tabular-nums">
                      {finalStr ? `${offerStr} → ${finalStr}` : offerStr}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F3F5F9] border border-[#E3E7EF] text-[#6B7488]">
                    {status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#6B7488]" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Deal Detail Bottom Sheet */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in">
          <div className="w-full max-w-[480px] bg-white bottom-sheet p-6 space-y-4 border-t border-[#E3E7EF] shadow-float max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E3E7EF] pb-3">
              <span className="text-[15px] font-semibold text-[#121A2B]">
                Deal details
              </span>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-[#6B7488] hover:text-[#121A2B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <VerdictCard
              deal={selectedDeal}
              onOpenChipSheet={(type, deal) => onOpenChipSheet(type, deal)}
            />

            <button
              onClick={() => {
                const dealToLog = selectedDeal;
                setSelectedDeal(null);
                onOpenOutcome(dealToLog);
              }}
              className="w-full py-3.5 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[15px] rounded-full transition-colors cursor-pointer"
            >
              Log outcome
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
