'use client';

import React, { useState } from 'react';
import { BrandRecord } from '@/types';
import { getAllBrands } from '@/lib/brandMatcher';
import { formatInr } from '@/lib/formatters';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  Clock, 
  Coins, 
  FileCheck, 
  Plus, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface BrandDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExperience: (brand: BrandRecord) => void;
}

export function BrandDirectoryModal({
  isOpen,
  onClose,
  onAddExperience,
}: BrandDirectoryModalProps) {
  const [search, setSearch] = useState('');
  const allBrands = getAllBrands();

  const filtered = allBrands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-700" />
              Brand Payment Directory
            </h2>
            <p className="text-xs text-slate-500">
              Community-verified commercial payout data for Indian brands
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            Sample data
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search brands (e.g. GlowLeaf, Zestify, UrbanKart) or categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
      </div>

      {/* Brand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(brand => {
          const isTier1 = brand.reports_count >= 5 && brand.payout_days && brand.typical_reel_cash_inr;

          return (
            <div
              key={brand.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{brand.name}</h3>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {brand.category}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isTier1
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isTier1 ? 'Tier 1 Verified' : 'Tier 2 (Under 5 reports)'}
                  </span>
                </div>

                {isTier1 ? (
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Reported Payout:
                      </span>
                      <span className="font-semibold text-slate-900">
                        {brand.payout_days?.p25} – {brand.payout_days?.p75} days (median {brand.payout_days?.median})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-slate-400" /> Typical Cash (Reel):
                      </span>
                      <span className="font-semibold text-teal-800">
                        {formatInr(brand.typical_reel_cash_inr?.low)} – {formatInr(brand.typical_reel_cash_inr?.high)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-slate-400" /> Advance Paid:
                      </span>
                      <span className="font-medium text-slate-900">
                        {brand.advance_paid_reports} of {brand.reports_count} reports
                      </span>
                    </div>

                    {brand.common_asks.length > 0 && (
                      <div className="text-[11px] text-slate-500 pt-1">
                        Common asks: {brand.common_asks.join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-0.5">
                        <AlertCircle className="w-3 h-3 text-slate-500" />
                        Category Benchmark (Not brand-specific)
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        We only have {brand.reports_count} reports on this brand, below our minimum of 5. Brand-specific payouts are hidden to protect accuracy.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {brand.verified_count} verified contracts on file
                </span>
                <button
                  onClick={() => onAddExperience(brand)}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add experience
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Directory Footer */}
      <div className="p-3.5 bg-slate-100 rounded-xl text-center text-xs text-slate-600">
        Based on creator reports only. "Verified" means a signed contract or proof of bank transfer was attached. All brand names are fictional sample data.
      </div>
    </div>
  );
}
