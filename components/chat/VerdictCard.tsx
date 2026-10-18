'use client';

import React, { useState } from 'react';
import { DealRecord, Verdict } from '@/types';
import { PriceRuler } from './PriceRuler';
import { formatInr, formatCpv } from '@/lib/formatters';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface VerdictCardProps {
  deal: DealRecord;
  onOpenChipSheet: (chipType: 'usage' | 'payout' | 'confidence', deal: DealRecord) => void;
}

export function VerdictCard({ deal, onOpenChipSheet }: VerdictCardProps) {
  const [showWorking, setShowWorking] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  const engine = deal?.engine;
  const extraction = deal?.extraction;
  const profile = deal?.profile;
  const brandName = extraction?.brand_name || deal?.brandName || 'Brand Collab';

  // Deliverables summary line
  const deliverables = extraction?.deliverables || [];
  const deliverablesSummary = deliverables.length > 0
    ? deliverables.map(d => `${d.count} ${(d.type || 'reel').replace('_', ' ')}`).join(', ')
    : 'Custom scope';
  const usageSummary = extraction?.usage_rights?.duration_months
    ? `${extraction.usage_rights.duration_months} months usage`
    : '';
  const termsLine = [deliverablesSummary, usageSummary].filter(Boolean).join(', ') || '1 reel, standard terms';

  // Verdict word and styling
  const getVerdictLabel = (v: Verdict) => {
    switch (v) {
      case 'TAKE':
        return { word: 'Take it', color: '#1F9D6B' };
      case 'COUNTER':
        return { word: 'Counter', color: '#D98A00' };
      case 'PASS_OR_RESET':
        return { word: 'Pass or re-scope', color: '#D64545' };
      case 'NEED_INFO':
        return { word: 'Need info', color: '#8A93A6' };
    }
  };

  const vInfo = getVerdictLabel(engine?.verdict || 'NEED_INFO');

  // One plain sentence
  let summarySentence = '';
  if (engine?.verdict === 'TAKE') {
    summarySentence = `They offered ${formatInr(engine.offerValue)}. Fair for you is ${formatInr(engine.fairRange?.low)} to ${formatInr(engine.fairRange?.high)}.`;
  } else if (engine?.verdict === 'COUNTER') {
    summarySentence = `They offered ${formatInr(engine.offerValue)}. Fair for you is ${formatInr(engine.fairRange?.low)} to ${formatInr(engine.fairRange?.high)}.`;
  } else if (engine?.verdict === 'PASS_OR_RESET') {
    summarySentence = `They offered ${formatInr(engine.offerValue)}. Fair for you without extended rights is ${formatInr(engine.resetRange?.low)} to ${formatInr(engine.resetRange?.high)}.`;
  } else {
    summarySentence = 'A few key terms are missing before we can calculate a fair price.';
  }

  // Small outlined chips
  const chips: { label: string; type: 'usage' | 'payout' | 'confidence' }[] = [];

  if (engine?.giveaways && engine.giveaways.length > 0) {
    chips.push({
      label: `Giving away: ${engine.giveaways[0].term} +${engine.giveaways[0].addOnPct}%`,
      type: 'usage',
    });
  }

  if (engine?.brandTier === 1 && deal?.brandRecord?.payout_days) {
    chips.push({
      label: `Pays in about ${deal.brandRecord.payout_days.median} days`,
      type: 'payout',
    });
  } else if (engine?.brandTier === 2 || engine?.brandTier === 3) {
    chips.push({
      label: 'Not enough reports on this brand',
      type: 'payout',
    });
  }

  if (engine?.confidence) {
    chips.push({
      label: `${engine.confidence.charAt(0) + engine.confidence.slice(1).toLowerCase()} confidence`,
      type: 'confidence',
    });
  }

  const handleCopyQuestions = () => {
    const questionsText = engine.missingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    const msg = `Hi, thank you for reaching out! Could you please clarify:\n${questionsText}`;
    navigator.clipboard.writeText(msg);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 3000);
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#E3E7EF] p-5 space-y-3.5 my-2">
      {/* 1. Brand name (600 weight) and one-line terms summary in Mute */}
      <div>
        <h3 className="font-semibold text-[15px] text-[#121A2B] leading-tight">
          {brandName}
        </h3>
        <p className="text-[13px] text-[#6B7488] mt-0.5">
          {termsLine}
        </p>
      </div>

      {/* 2. Verdict word at 40px in verdict colour */}
      <div>
        <span
          className="text-[40px] font-semibold tracking-tight leading-none block"
          style={{ color: vInfo.color }}
        >
          {vInfo.word}
        </span>
      </div>

      {/* 3. One plain sentence */}
      <p className="text-[15px] text-[#121A2B] leading-relaxed">
        {summarySentence}
      </p>

      {/* 4. The Price Ruler OR Missing Questions */}
      {engine.verdict !== 'NEED_INFO' && engine.fairRange ? (
        <PriceRuler
          verdict={engine.verdict}
          offerValue={engine.offerValue}
          fairLow={engine.fairRange.low}
          fairHigh={engine.fairRange.high}
          counterTarget={engine.counterTarget}
        />
      ) : (
        <div className="bg-[#F3F5F9] rounded-xl p-3.5 space-y-2.5">
          <span className="text-[13px] font-semibold text-[#121A2B] block">
            Questions to ask the brand:
          </span>
          <ul className="text-[13px] text-[#6B7488] space-y-1 list-disc pl-4">
            {engine.missingQuestions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
          <button
            onClick={handleCopyQuestions}
            className="w-full py-2 px-3 text-[13px] font-semibold bg-white border border-[#E3E7EF] text-[#121A2B] rounded-full hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            {copiedQuestions ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#1F9D6B]" /> Copied as message
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy as message
              </>
            )}
          </button>
        </div>
      )}

      {/* 5. Row of up to three small chips (outlined, Mute text) */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {chips.slice(0, 3).map((chip, idx) => (
          <button
            key={idx}
            onClick={() => onOpenChipSheet(chip.type, deal)}
            className="text-[13px] text-[#6B7488] bg-transparent hover:bg-[#F3F5F9] border border-[#E3E7EF] rounded-full px-3 py-1 transition-colors"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 6. Quiet text button: See the working */}
      <div className="pt-2 border-t border-[#E3E7EF]">
        <button
          onClick={() => setShowWorking(!showWorking)}
          className="text-[13px] font-semibold text-[#6B7488] hover:text-[#121A2B] transition-colors flex items-center gap-1"
        >
          <span>See the working</span>
          {showWorking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showWorking && (
          <div className="mt-3 pt-2 text-[13px] space-y-2 text-[#121A2B]">
            <div className="overflow-x-auto rounded-lg border border-[#E3E7EF]">
              <table className="w-full text-left text-[13px]">
                <tbody className="divide-y divide-[#E3E7EF]">
                  <tr>
                    <td className="py-2 px-3 text-[#6B7488]">Median views</td>
                    <td className="py-2 px-3 font-semibold text-right tabular-nums">
                      {profile.medianReelViews.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#6B7488]">Fair range</td>
                    <td className="py-2 px-3 font-semibold text-right tabular-nums">
                      {engine.fairRange ? `${formatInr(engine.fairRange.low)} – ${formatInr(engine.fairRange.high)}` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#6B7488]">Their offer</td>
                    <td className="py-2 px-3 font-semibold text-right tabular-nums">
                      {engine.offerValue !== null ? `${formatInr(engine.offerValue)} (${engine.ratioToLow ? Math.round(engine.ratioToLow * 100) : 0}% of low)` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-[#6B7488]">Cost per view</td>
                    <td className="py-2 px-3 font-semibold text-right tabular-nums">
                      {engine.cpvOffer !== null ? `${formatCpv(engine.cpvOffer)} (fair: ${formatCpv(engine.cpvFair?.low)} – ${formatCpv(engine.cpvFair?.high)})` : '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#6B7488] text-center italic">
              Estimate based on benchmark assumptions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
