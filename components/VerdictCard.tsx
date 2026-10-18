'use client';

import React, { useState } from 'react';
import { DealRecord, Confidence, Verdict, Tier } from '@/types';
import { formatInr, formatCpv } from '@/lib/formatters';
import { 
  CheckCircle, 
  ArrowRightLeft, 
  XCircle, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Coins, 
  Info,
  Calendar,
  Building2,
  FileEdit,
  Check
} from 'lucide-react';

interface VerdictCardProps {
  deal: DealRecord;
  onWriteReply: (deal: DealRecord) => void;
  onLogOutcome: (deal: DealRecord) => void;
  onDecline: (deal: DealRecord) => void;
}

export function VerdictCard({
  deal,
  onWriteReply,
  onLogOutcome,
  onDecline,
}: VerdictCardProps) {
  const [showConfidenceExplainer, setShowConfidenceExplainer] = useState(false);
  const { engine, extraction, profile, explanation } = deal;

  // Verdict badge colors & text
  const getVerdictDetails = (v: Verdict) => {
    switch (v) {
      case 'TAKE':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          label: 'TAKE',
          desc: 'Offer is fair or above market baseline. Recommended to accept with written contract.',
          icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
        };
      case 'COUNTER':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          badge: 'bg-amber-600 text-white',
          label: 'COUNTER',
          desc: 'Offer is below commercial baseline. Recommended to counter with your verified reach.',
          icon: <ArrowRightLeft className="w-6 h-6 text-amber-600" />,
        };
      case 'PASS_OR_RESET':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-900',
          badge: 'bg-rose-600 text-white',
          label: 'PASS OR RESET',
          desc: 'Offer value is too low for the heavy rights requested. Decline or re-scope terms.',
          icon: <XCircle className="w-6 h-6 text-rose-600" />,
        };
      case 'NEED_INFO':
        return {
          bg: 'bg-slate-100 border-slate-300 text-slate-800',
          badge: 'bg-slate-600 text-white',
          label: 'NEED INFO',
          desc: 'Key commercial terms or budget are missing. Ask the brand to clarify before quoting.',
          icon: <HelpCircle className="w-6 h-6 text-slate-600" />,
        };
    }
  };

  const vDetails = getVerdictDetails(engine.verdict);

  const getConfidenceBadge = (conf: Confidence) => {
    switch (conf) {
      case 'HIGH':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          text: 'High Confidence',
          desc: 'Based on verified and fresh recent creator analytics.',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          text: 'Medium Confidence',
          desc: 'Calculated using creator benchmarks and sample or self-reported metrics.',
        };
      case 'LOW':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          text: 'Low Confidence',
          desc: 'Stale metrics, sparse brand reports, or inferred deliverable terms.',
        };
    }
  };

  const confDetails = getConfidenceBadge(engine.confidence);

  // Deliverables summary line
  const deliverablesSummary = extraction.deliverables.length > 0
    ? extraction.deliverables.map(d => `${d.count} ${d.type.replace('_', ' ')}`).join(' + ')
    : 'Custom collaboration';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-5 sm:p-6">
      {/* Top Header: Brand Name & One-line terms summary */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {extraction.brand_name || 'Brand Partnership Offer'}
            </h2>
          </div>

          {/* Visible Confidence Badge with tap to explain */}
          <div className="relative">
            <button
              onClick={() => setShowConfidenceExplainer(!showConfidenceExplainer)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all ${confDetails.bg}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{confDetails.text}</span>
              <Info className="w-3 h-3 opacity-70" />
            </button>

            {showConfidenceExplainer && (
              <div className="absolute right-0 top-8 z-30 w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl leading-relaxed">
                <span className="font-bold block mb-1">Confidence Score: {engine.confidence}</span>
                {confDetails.desc}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600">
          Terms: <span className="font-semibold text-slate-800">{deliverablesSummary}</span>
          {engine.offerValue !== null && ` • Offered: ${formatInr(engine.offerValue)}`}
          {extraction.usage_rights.duration_months && ` • ${extraction.usage_rights.duration_months}m usage`}
        </p>
      </div>

      {/* Large Verdict Hero Card */}
      <div className={`p-4 sm:p-5 rounded-xl border ${vDetails.bg} flex items-start gap-3.5`}>
        <div className="shrink-0 mt-0.5">{vDetails.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-black tracking-wider px-2.5 py-0.5 rounded-md ${vDetails.badge}`}>
              {vDetails.label}
            </span>
            {engine.counterTarget && engine.verdict === 'COUNTER' && (
              <span className="text-xs font-bold text-amber-900">
                Target: {formatInr(engine.counterTarget)}
              </span>
            )}
            {engine.resetRange && engine.verdict === 'PASS_OR_RESET' && (
              <span className="text-xs font-bold text-rose-900">
                Re-scope: {formatInr(engine.resetRange.low)} - {formatInr(engine.resetRange.high)}
              </span>
            )}
          </div>
          <p className="text-xs font-medium leading-relaxed">{vDetails.desc}</p>
          <p className="text-xs mt-1 text-slate-700 italic">{explanation.headline}</p>
        </div>
      </div>

      {/* Section 1: WHY (Short Table - Always Visible By Default!) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            1. Why (The Math Behind The Verdict)
          </h3>
          <span className="text-[10px] text-slate-400">Deterministic Engine</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3">Your Numbers</th>
                <th className="py-2.5 px-3">Their Offer</th>
                <th className="py-2.5 px-3">Fair Benchmark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-700">Median Views</td>
                <td className="py-2.5 px-3 font-semibold text-slate-900">
                  {profile.medianReelViews.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-3 text-slate-500">—</td>
                <td className="py-2.5 px-3 text-slate-500">Benchmark source</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-700">Total Valuation</td>
                <td className="py-2.5 px-3 font-semibold text-teal-800">
                  {engine.fairRange ? `${formatInr(engine.fairRange.low)} – ${formatInr(engine.fairRange.high)}` : 'Need terms'}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900">
                  {engine.offerValue !== null ? formatInr(engine.offerValue) : 'Not specified'}
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {engine.ratioToLow ? `${Math.round(engine.ratioToLow * 100)}% of baseline` : '—'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-700">
                  Cost Per View (CPV)
                  <span className="block text-[10px] text-slate-400 font-normal">
                    (What brand pays per view)
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {engine.cpvFair ? `${formatCpv(engine.cpvFair.low)} – ${formatCpv(engine.cpvFair.high)}` : '—'}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900">
                  {engine.cpvOffer !== null ? formatCpv(engine.cpvOffer) : '—'}
                </td>
                <td className="py-2.5 px-3 text-slate-600">
                  {engine.cpvFair ? `Fair: ${formatCpv(engine.cpvFair.low)}/view` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mandatory Assumption Label */}
        <p className="text-[11px] text-slate-500 italic text-center">
          Estimate based on benchmark assumptions
        </p>
      </div>

      {/* Section 2: What you'd be giving away (Unpriced terms & add-ons) */}
      {engine.giveaways.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            2. What You'd Be Giving Away
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            {engine.giveaways.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {item.term}
                </span>
                <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                  +{item.addOnPct}% commercial add-on
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: How this brand pays (Brand Card Summary with Tier 1/2/3) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            3. How This Brand Pays
          </h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            Sample data
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
          {engine.brandTier === 1 && deal.brandRecord && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{deal.brandRecord.name}</span>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Tier 1 Verified ({deal.brandRecord.verified_count} proofs)
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Reported payout: {deal.brandRecord.payout_days?.p25} to {deal.brandRecord.payout_days?.p75} days (median {deal.brandRecord.payout_days?.median}), based on {deal.brandRecord.reports_count} reports. Typical cash: ₹{deal.brandRecord.typical_reel_cash_inr?.low.toLocaleString('en-IN')} - ₹{deal.brandRecord.typical_reel_cash_inr?.high.toLocaleString('en-IN')}.
              </p>
            </div>
          )}

          {engine.brandTier === 2 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">
                  {extraction.brand_name || 'Brand Data Benchmark'}
                </span>
                <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  Tier 2 Benchmark
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {deal.brandRecord 
                  ? `We only have ${deal.brandRecord.reports_count} reports on ${deal.brandRecord.name}, below our minimum of 5 for brand-specific figures. Category benchmark (${deal.brandRecord.category}): median payout 45 days.`
                  : `Brand unknown or below minimum of 5 reports. Showing ${profile.niche} category benchmark instead: typical payout median 42 days.`}
              </p>
            </div>
          )}

          {engine.brandTier === 3 && (
            <div>
              <span className="font-bold text-slate-900 block mb-1">Tier 3: No Prior Data</span>
              <p className="text-slate-600">
                We don't have verified data on this brand yet. This verdict is computed purely from your channel numbers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Payment note (if reported payout > 60 days) */}
      {explanation.payment_note && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Payment Term Notice:</span>
            {explanation.payment_note}
          </div>
        </div>
      )}

      {/* Cautions and Disclaimers */}
      {explanation.cautions.length > 0 && (
        <div className="space-y-1.5">
          {explanation.cautions.map((caution, i) => (
            <div key={i} className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {caution}
            </div>
          ))}
        </div>
      )}

      {/* Section 5: Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
        <button
          onClick={() => onDecline(deal)}
          className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
        >
          Decline Offer
        </button>

        <button
          onClick={() => onLogOutcome(deal)}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Coins className="w-3.5 h-3.5 text-slate-600" />
          Log as Taken
        </button>

        <button
          onClick={() => onWriteReply(deal)}
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
        >
          <FileEdit className="w-3.5 h-3.5" />
          Write My Reply
        </button>
      </div>
    </div>
  );
}
