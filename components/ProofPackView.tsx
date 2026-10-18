'use client';

import React, { useState } from 'react';
import { CreatorProfile } from '@/types';
import { formatInr, formatCompactNumber, formatPct } from '@/lib/formatters';
import { Download, ShieldCheck } from 'lucide-react';

interface ProofPackViewProps {
  profile: CreatorProfile;
}

export function ProofPackView({ profile }: ProofPackViewProps) {
  const [audienceNote, setAudienceNote] = useState(
    'My audience consists primarily of young urban professionals and students aged 18–34 across tier-1 Indian metros. They actively engage with authentic daily lifestyle, skincare, and productivity recommendations.'
  );

  const viewsToFollowersRatio = profile.followers > 0
    ? (profile.medianReelViews / profile.followers) * 100
    : 0;

  // CPV at three commercial price points
  const cpvTiers = [
    { label: 'Standard reel rate', cpv: 0.60, fee: Math.round(profile.medianReelViews * 0.60) },
    { label: 'Full creative & rights (3m)', cpv: 0.85, fee: Math.round(profile.medianReelViews * 0.85) },
    { label: 'Premium integrated scope', cpv: 1.10, fee: Math.round(profile.medianReelViews * 1.10) },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top actions bar (no-print) */}
      <div className="no-print bg-white p-4 rounded-[20px] border border-[#E3E7EF] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-[#121A2B] tracking-tight flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#121A2B]" />
            Creator proof pack
          </h2>
          <p className="text-[13px] text-[#6B7488]">
            One-page data sheet formatted in media-buyer terms
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 text-[13px] font-semibold text-white bg-[#121A2B] hover:bg-[#1f2b45] rounded-full shadow-sm flex items-center gap-2 transition-colors min-h-[44px]"
        >
          <Download className="w-3.5 h-3.5" />
          Download PDF (print)
        </button>
      </div>

      {/* The Printable Proof Pack Sheet */}
      <div className="proof-pack-container bg-white p-6 sm:p-8 rounded-[20px] border border-[#E3E7EF] space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b border-[#E3E7EF] pb-5 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3F5F9] border border-[#E3E7EF] text-[#121A2B] text-[11px] font-semibold mb-2">
              Verified creator metrics
            </div>
            <h1 className="text-[24px] font-semibold text-[#121A2B] tracking-tight">
              {profile.name}
            </h1>
            <p className="text-[13px] text-[#6B7488] mt-0.5 capitalize">
              {profile.niche} creator • India
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-[#6B7488] block">
              Verification standard
            </span>
            <span className="text-[13px] font-semibold text-[#121A2B]">DealDesk verified</span>
            <span className="text-[11px] text-[#6B7488] block mt-0.5">
              Updated: {new Date(profile.updatedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 4 Core Quantitative Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#F3F5F9] p-3.5 rounded-2xl border border-[#E3E7EF]">
            <span className="text-[11px] font-semibold text-[#6B7488] block mb-0.5">
              Median reel views
            </span>
            <span className="text-[18px] font-semibold text-[#121A2B] tabular-nums">
              {profile.medianReelViews.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#6B7488] block mt-0.5">Primary pricing basis</span>
          </div>

          <div className="bg-[#F3F5F9] p-3.5 rounded-2xl border border-[#E3E7EF]">
            <span className="text-[11px] font-semibold text-[#6B7488] block mb-0.5">
              Audience followers
            </span>
            <span className="text-[18px] font-semibold text-[#121A2B] tabular-nums">
              {formatCompactNumber(profile.followers)}
            </span>
            <span className="text-[10px] text-[#6B7488] block mt-0.5">
              {profile.followers.toLocaleString('en-IN')} total
            </span>
          </div>

          <div className="bg-[#F3F5F9] p-3.5 rounded-2xl border border-[#E3E7EF]">
            <span className="text-[11px] font-semibold text-[#6B7488] block mb-0.5">
              Engagement rate
            </span>
            <span className="text-[18px] font-semibold text-[#121A2B] tabular-nums">
              {formatPct(profile.engagementRatePct)}
            </span>
            <span className="text-[10px] text-[#6B7488] block mt-0.5">Active comment affinity</span>
          </div>

          <div className="bg-[#F3F5F9] p-3.5 rounded-2xl border border-[#E3E7EF]">
            <span className="text-[11px] font-semibold text-[#6B7488] block mb-0.5">
              Views-to-followers
            </span>
            <span className="text-[18px] font-semibold text-[#121A2B] tabular-nums">
              {viewsToFollowersRatio.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[#6B7488] block mt-0.5">Reach consistency</span>
          </div>
        </div>

        {/* Cost Per View (CPV) Framework at 3 Price Points */}
        <div className="space-y-3">
          <div>
            <h3 className="text-[13px] font-semibold text-[#121A2B]">
              Cost per view (CPV) rate benchmarks
            </h3>
            <p className="text-[11px] text-[#6B7488]">
              Standard commercial pricing across deliverable tiers
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E3E7EF]">
            <table className="w-full text-[13px] text-left">
              <thead className="bg-[#F3F5F9] border-b border-[#E3E7EF] text-[#6B7488] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Scope</th>
                  <th className="py-2.5 px-3">Effective CPV</th>
                  <th className="py-2.5 px-3">Standard fee</th>
                  <th className="py-2.5 px-3">Deliverables</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E7EF]">
                {cpvTiers.map((tier, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-[#121A2B]">{tier.label}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#121A2B] tabular-nums">
                      ₹{tier.cpv.toFixed(2)} / view
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#121A2B] tabular-nums">
                      {formatInr(tier.fee)}
                    </td>
                    <td className="py-2.5 px-3 text-[#6B7488]">
                      {idx === 0 && '1 reel (organic)'}
                      {idx === 1 && '1 reel + 3m usage'}
                      {idx === 2 && '1 reel + story + 3m usage'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audience Context */}
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-[#121A2B]">
            Audience demographics & alignment
          </h3>
          <textarea
            value={audienceNote}
            onChange={(e) => setAudienceNote(e.target.value)}
            rows={3}
            className="w-full p-3 bg-[#F3F5F9] rounded-2xl border border-[#E3E7EF] text-[13px] text-[#121A2B] leading-relaxed focus:outline-none"
          />
        </div>

        {/* Footer Notes */}
        <div className="border-t border-[#E3E7EF] pt-4 text-[11px] text-[#6B7488] flex flex-wrap items-center justify-between gap-2">
          <span>Estimate based on benchmark assumptions</span>
          <span>Sample data verification</span>
        </div>
      </div>
    </div>
  );
}
