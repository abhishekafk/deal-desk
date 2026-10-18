'use client';

import React, { useState } from 'react';
import { CreatorProfile } from '@/types';
import { formatInr, formatCompactNumber, formatCpv, formatPct } from '@/lib/formatters';
import { Printer, Download, Sparkles, User, ShieldCheck } from 'lucide-react';

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
    { label: 'Standard Reel Rate', cpv: 0.60, fee: Math.round(profile.medianReelViews * 0.60) },
    { label: 'Full Creative & Rights (3m)', cpv: 0.85, fee: Math.round(profile.medianReelViews * 0.85) },
    { label: 'Premium Integrated Scope', cpv: 1.10, fee: Math.round(profile.medianReelViews * 1.10) },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top actions bar (no-print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            Creator Proof Pack (Media Kit)
          </h2>
          <p className="text-xs text-slate-500">
            Professional one-page data sheet formatted in brand media-buyer language
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download PDF (Print)
        </button>
      </div>

      {/* The Printable Proof Pack Sheet */}
      <div className="proof-pack-container bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold mb-2">
              Verified Creator Metrics
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {profile.name}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 capitalize">
              {profile.niche} Content Creator • India
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Verification Engine
            </span>
            <span className="text-xs font-bold text-teal-800">DealDesk Standard</span>
            <span className="text-[10px] text-slate-500 block">
              Updated: {new Date(profile.updatedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 4 Core Quantitative Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
              Median Reel Views
            </span>
            <span className="text-lg font-black text-slate-900">
              {profile.medianReelViews.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Primary pricing basis</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
              Audience Followers
            </span>
            <span className="text-lg font-black text-slate-900">
              {formatCompactNumber(profile.followers)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {profile.followers.toLocaleString('en-IN')} total
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
              Engagement Rate
            </span>
            <span className="text-lg font-black text-slate-900">
              {formatPct(profile.engagementRatePct)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">High comment affinity</span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
              Views-to-Followers
            </span>
            <span className="text-lg font-black text-teal-800">
              {viewsToFollowersRatio.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Reach consistency</span>
          </div>
        </div>

        {/* Cost Per View (CPV) Framework at 3 Price Points */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Cost Per View (CPV) Rate Benchmarks
            </h3>
            <p className="text-[11px] text-slate-500">
              What brands pay per guaranteed organic impression across standard deliverable tiers
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Commercial Scope</th>
                  <th className="py-2.5 px-3">Effective CPV</th>
                  <th className="py-2.5 px-3">Standard Fee (INR)</th>
                  <th className="py-2.5 px-3">Deliverables Included</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cpvTiers.map((tier, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{tier.label}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-800">
                      ₹{tier.cpv.toFixed(2)} / view
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {formatInr(tier.fee)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {idx === 0 && '1 Reel (Organic posting)'}
                      {idx === 1 && '1 Reel + 3-month digital usage'}
                      {idx === 2 && '1 Reel + 1 Story set + Ad booster'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audience Note */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Audience Demographics & Brand Fit Note
          </label>
          <div className="no-print">
            <textarea
              rows={3}
              value={audienceNote}
              onChange={e => setAudienceNote(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              You can edit this note before clicking Download PDF.
            </p>
          </div>
          <div className="print-only text-xs text-slate-700 leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-200">
            {audienceNote}
          </div>
        </div>

        {/* Footer / Transparency Notice */}
        <div className="border-t border-slate-200 pt-4 text-center">
          <p className="text-[10px] text-slate-500">
            Generated via DealDesk — All rates calculated from verified median views, not inflated follower totals.
          </p>
        </div>
      </div>
    </div>
  );
}
