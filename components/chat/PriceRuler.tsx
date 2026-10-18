'use client';

import React from 'react';
import { Verdict } from '@/types';
import { formatInr } from '@/lib/formatters';

interface PriceRulerProps {
  verdict: Verdict;
  offerValue: number | null;
  fairLow: number;
  fairHigh: number;
  counterTarget: number | null;
}

export function PriceRuler({
  verdict,
  offerValue,
  fairLow,
  fairHigh,
  counterTarget,
}: PriceRulerProps) {
  // Determine verdict color
  let tintColor = '#D98A00'; // counter amber
  if (verdict === 'TAKE') tintColor = '#1F9D6B'; // green
  if (verdict === 'PASS_OR_RESET') tintColor = '#D64545'; // red
  if (verdict === 'NEED_INFO') tintColor = '#8A93A6'; // grey

  // Calculate percentage positions across the ruler axis
  // Scale spans from 0.8 * min(offer, fairLow) to 1.15 * max(offer, fairHigh)
  const minVal = Math.min(offerValue ?? fairLow, fairLow) * 0.85;
  const maxVal = Math.max(offerValue ?? fairHigh, fairHigh) * 1.15;
  const range = maxVal - minVal || 1;

  const getPct = (val: number) => {
    const raw = ((val - minVal) / range) * 100;
    return Math.max(4, Math.min(94, raw));
  };

  const barLeftPct = getPct(fairLow);
  const barRightPct = getPct(fairHigh);
  const barWidthPct = Math.max(12, barRightPct - barLeftPct);

  const offerPct = offerValue !== null ? getPct(offerValue) : null;
  const counterPct = counterTarget !== null && verdict === 'COUNTER' ? getPct(counterTarget) : null;

  return (
    <div className="w-full pt-4 pb-1">
      {/* Upper area for pin label */}
      <div className="relative h-6 w-full">
        {offerValue !== null && offerPct !== null && (
          <div
            className="absolute transform -translate-x-1/2 flex flex-col items-center animate-pin"
            style={{ left: `${offerPct}%` }}
          >
            <span className="text-[11px] font-bold text-[#121A2B] tabular-nums whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow-sm border border-[#E3E7EF]">
              {formatInr(offerValue)}
            </span>
          </div>
        )}

        {counterPct !== null && counterTarget !== null && (
          <div
            className="absolute transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${counterPct}%` }}
          >
            <span className="text-[10px] font-semibold text-[#D98A00] whitespace-nowrap bg-amber-50 px-1 rounded border border-amber-200">
              ask {formatInr(counterTarget)}
            </span>
          </div>
        )}
      </div>

      {/* The Horizontal Ruler Axis */}
      <div className="relative h-7 w-full flex items-center">
        {/* Background track line */}
        <div className="absolute w-full h-1 bg-[#E3E7EF] rounded-full" />

        {/* The Fair Range Colored Bar */}
        <div
          className="absolute h-3 rounded-full opacity-80 animate-ruler"
          style={{
            left: `${barLeftPct}%`,
            width: `${barWidthPct}%`,
            backgroundColor: `${tintColor}25`,
            border: `1.5px solid ${tintColor}70`,
          }}
        />

        {/* Counter Target hollow marker (Counter verdict only) */}
        {counterPct !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#D98A00] z-10 shadow-sm"
            style={{ left: `${counterPct}%` }}
            title={`Suggested Counter: ${formatInr(counterTarget)}`}
          />
        )}

        {/* Their Offer dark solid pin */}
        {offerPct !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#121A2B] border-2 border-white z-20 shadow-md animate-pin"
            style={{ left: `${offerPct}%` }}
            title={`Their Offer: ${formatInr(offerValue)}`}
          />
        )}
      </div>

      {/* Under the bar: low and high figures, very small in Mute */}
      <div className="relative w-full h-4 text-[11px] text-[#6B7488] tabular-nums">
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `${barLeftPct}%` }}
        >
          {formatInr(fairLow)}
        </span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `${barRightPct}%` }}
        >
          {formatInr(fairHigh)}
        </span>
      </div>
    </div>
  );
}
