'use client';

import React, { useState } from 'react';
import { DealRecord, DealOutcome } from '@/types';
import { formatInr } from '@/lib/formatters';
import { X, Check, Coins, FileCheck, Sparkles, AlertCircle } from 'lucide-react';

interface OutcomeLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: DealRecord | null;
  brandName?: string;
  onSaveOutcome: (dealId: string | null, outcome: DealOutcome) => void;
}

export function OutcomeLoggerModal({
  isOpen,
  onClose,
  deal,
  brandName,
  onSaveOutcome,
}: OutcomeLoggerModalProps) {
  const brand = deal?.extraction.brand_name || brandName || 'Brand';
  const initialFirstOffer = deal?.engine.offerValue || 0;

  const [finalCash, setFinalCash] = useState<number>(deal?.engine.counterTarget || initialFirstOffer || 5000);
  const [productValue, setProductValue] = useState<number>(deal?.extraction.product_offered?.stated_value_inr || 0);
  const [usageAgreed, setUsageAgreed] = useState('3 months digital');
  const [exclusivityAgreed, setExclusivityAgreed] = useState('None');
  const [paidYet, setPaidYet] = useState(false);
  const [daysToPayment, setDaysToPayment] = useState<number>(30);
  const [paidOnTime, setPaidOnTime] = useState(true);
  const [proofAttached, setProofAttached] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const finalTotalValue = (Number(finalCash) || 0) + (Number(productValue) || 0);
  const uplift = Math.max(0, finalTotalValue - initialFirstOffer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const outcome: DealOutcome = {
      finalCash: Number(finalCash) || 0,
      productValue: Number(productValue) || 0,
      usageAgreed,
      exclusivityAgreed,
      paidYet,
      daysToPayment: Number(daysToPayment) || undefined,
      paidOnTime,
      proofAttached,
      upliftInr: uplift,
      loggedAt: new Date().toISOString(),
    };

    onSaveOutcome(deal ? deal.id : null, outcome);
    setToastMessage('Experience logged locally! In the production app, this joins the verified community pool after contract verification.');
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Log Deal Outcome: {brand}
              </h3>
              <p className="text-[11px] text-slate-500">
                Track your actual earnings and community payment report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {toastMessage ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Outcome Logged Successfully!</h4>
              <p className="text-xs text-slate-600 leading-relaxed px-4">
                {toastMessage}
              </p>
              {uplift > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
                  Added +{formatInr(uplift)} to your "₹ gained" total!
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Uplift Live Calculation */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 block">Rupee Uplift Gained:</span>
                  <span className="text-[11px] text-slate-500">
                    Final Value ({formatInr(finalTotalValue)}) – First Offer ({formatInr(initialFirstOffer)})
                  </span>
                </div>
                <span className="text-sm font-black text-emerald-700">
                  +{formatInr(uplift)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Final Cash Agreed (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={finalCash}
                    onChange={e => setFinalCash(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product / Perk Value (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={productValue}
                    onChange={e => setProductValue(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usage Rights Agreed
                </label>
                <select
                  value={usageAgreed}
                  onChange={e => setUsageAgreed(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="None / Organic only">None / Organic only</option>
                  <option value="3 months digital">3 months digital</option>
                  <option value="6 months digital">6 months digital</option>
                  <option value="12 months digital">12 months digital</option>
                  <option value="Perpetual">Perpetual</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Received?
                  </label>
                  <select
                    value={paidYet ? 'yes' : 'no'}
                    onChange={e => setPaidYet(e.target.value === 'yes')}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="yes">Yes, fully paid</option>
                    <option value="no">Not yet paid / Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Days to Payout
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={daysToPayment}
                    onChange={e => setDaysToPayment(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {paidYet && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Did they pay on time as contracted?
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={paidOnTime === true}
                        onChange={() => setPaidOnTime(true)}
                        className="text-teal-700 focus:ring-teal-500"
                      />
                      <span>Yes, on time</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={paidOnTime === false}
                        onChange={() => setPaidOnTime(false)}
                        className="text-teal-700 focus:ring-teal-500"
                      />
                      <span>No, overdue</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="proofAttached"
                  checked={proofAttached}
                  onChange={e => setProofAttached(e.target.checked)}
                  className="rounded text-teal-700 focus:ring-teal-500 w-4 h-4"
                />
                <label htmlFor="proofAttached" className="text-xs text-slate-600">
                  Simulated verification: Signed contract or payment screenshot attached
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
                >
                  Save Outcome & Update Uplift
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
