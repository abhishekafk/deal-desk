'use client';

import React, { useState, useEffect } from 'react';
import { DealRecord, DealOutcome } from '@/types';
import { formatInr } from '@/lib/formatters';
import { X, Minus, Plus } from 'lucide-react';

interface OutcomeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: DealRecord | null;
  onSaveOutcome: (dealId: string | null, outcome: DealOutcome) => void;
}

export function OutcomeSheet({
  isOpen,
  onClose,
  deal,
  onSaveOutcome,
}: OutcomeSheetProps) {
  const initialOffer = deal?.engine.offerValue || 4000;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreedAmount, setAgreedAmount] = useState<number>(deal?.engine.counterTarget || initialOffer);
  const [paidStatus, setPaidStatus] = useState<'not_yet' | 'yes'>('yes');
  const [daysToPayment, setDaysToPayment] = useState<number>(30);
  const [displayedUplift, setDisplayedUplift] = useState<number>(0);

  const calculatedUplift = Math.max(0, agreedAmount - initialOffer);

  useEffect(() => {
    if (step === 3) {
      // Count up animation
      let start = 0;
      const end = calculatedUplift;
      const duration = 600;
      const stepTime = 30;
      const totalSteps = duration / stepTime;
      const increment = Math.ceil(end / totalSteps) || 1;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayedUplift(end);
          clearInterval(timer);
        } else {
          setDisplayedUplift(start);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [step, calculatedUplift]);

  if (!isOpen) return null;

  const handleFinish = () => {
    const outcome: DealOutcome = {
      finalCash: agreedAmount,
      productValue: 0,
      paidYet: paidStatus === 'yes',
      daysToPayment: paidStatus === 'yes' ? daysToPayment : undefined,
      paidOnTime: true,
      proofAttached: true,
      upliftInr: calculatedUplift,
      loggedAt: new Date().toISOString(),
    };

    onSaveOutcome(deal ? deal.id : null, outcome);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in">
      <div className="w-full max-w-[480px] bg-white bottom-sheet p-6 space-y-5 border-t border-[#E3E7EF] shadow-float">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#6B7488]">
            {step === 1 && 'Step 1 of 3'}
            {step === 2 && 'Step 2 of 3'}
            {step === 3 && 'Result'}
          </span>
          <button onClick={onClose} className="text-[#6B7488] hover:text-[#121A2B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: What did you agree? */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-[20px] font-semibold text-[#121A2B] tracking-tight">
              What did you agree?
            </h3>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-[24px] font-semibold text-[#6B7488]">₹</span>
              <input
                type="number"
                value={agreedAmount}
                onChange={e => setAgreedAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 text-[28px] font-semibold text-[#121A2B] tabular-nums rounded-2xl border border-[#E3E7EF] focus:outline-none focus:border-[#121A2B]"
              />
            </div>
            <p className="text-[13px] text-[#6B7488]">
              Initial offer was {formatInr(initialOffer)}
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[15px] rounded-full transition-colors mt-2"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Did they pay? */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-[20px] font-semibold text-[#121A2B] tracking-tight">
              Did they pay?
            </h3>

            {/* Segmented control: Not yet | Yes */}
            <div className="flex bg-[#F3F5F9] rounded-full p-0.5">
              <button
                onClick={() => setPaidStatus('not_yet')}
                className={`flex-1 py-2 text-[13px] font-semibold rounded-full transition-all ${
                  paidStatus === 'not_yet' ? 'bg-white text-[#121A2B] shadow-sm' : 'text-[#6B7488]'
                }`}
              >
                Not yet
              </button>
              <button
                onClick={() => setPaidStatus('yes')}
                className={`flex-1 py-2 text-[13px] font-semibold rounded-full transition-all ${
                  paidStatus === 'yes' ? 'bg-white text-[#121A2B] shadow-sm' : 'text-[#6B7488]'
                }`}
              >
                Yes
              </button>
            </div>

            {/* How many days stepper if Yes */}
            {paidStatus === 'yes' && (
              <div className="pt-2 space-y-2">
                <span className="text-[13px] font-semibold text-[#121A2B] block">
                  How many days did it take?
                </span>
                <div className="flex items-center justify-between p-3 rounded-2xl border border-[#E3E7EF] bg-[#F3F5F9]">
                  <button
                    onClick={() => setDaysToPayment(Math.max(1, daysToPayment - 5))}
                    className="w-10 h-10 rounded-full bg-white border border-[#E3E7EF] flex items-center justify-center text-[#121A2B] hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-[20px] font-semibold text-[#121A2B] tabular-nums">
                    {daysToPayment} days
                  </span>
                  <button
                    onClick={() => setDaysToPayment(daysToPayment + 5)}
                    className="w-10 h-10 rounded-full bg-white border border-[#E3E7EF] flex items-center justify-center text-[#121A2B] hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[15px] rounded-full transition-colors mt-2"
            >
              See outcome
            </button>
          </div>
        )}

        {/* Step 3: Result Screen */}
        {step === 3 && (
          <div className="space-y-4 py-2 text-center">
            {calculatedUplift > 0 ? (
              <div className="space-y-1">
                <span className="text-[15px] text-[#6B7488] block">
                  You gained
                </span>
                <span className="text-[40px] font-semibold text-[#1F9D6B] block tabular-nums tracking-tight">
                  {formatInr(displayedUplift)}
                </span>
                <span className="text-[13px] text-[#6B7488] block">
                  on this deal
                </span>
              </div>
            ) : (
              <p className="text-[15px] text-[#121A2B] leading-relaxed">
                No change this time. Your next one will go further because you know what to check.
              </p>
            )}

            <button
              onClick={handleFinish}
              className="w-full py-3.5 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[15px] rounded-full transition-colors mt-4"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
