'use client';

import React, { useState } from 'react';
import { BrandRecord } from '@/types';
import { getAllBrands } from '@/lib/brandMatcher';
import { BrandCard } from '@/components/chat/BrandCard';
import { Search, X } from 'lucide-react';

interface BrandsTabProps {
  onAddExperienceForBrand: (brandName: string) => void;
}

export function BrandsTab({ onAddExperienceForBrand }: BrandsTabProps) {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<BrandRecord | null>(null);

  const allBrands = getAllBrands() || [];
  const filtered = allBrands.filter(b => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const nameMatch = (b.name || '').toLowerCase().includes(q);
    const catMatch = (b.category || '').toLowerCase().includes(q);
    return nameMatch || catMatch;
  });

  return (
    <div className="p-4 space-y-4 pb-24 max-w-[480px] mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-[20px] font-semibold text-[#121A2B] tracking-tight">
          Brands
        </h2>
        <p className="text-[13px] text-[#6B7488]">
          Community-verified payment timelines
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6B7488] absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search brands or categories"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-[15px] rounded-full border border-[#E3E7EF] bg-white focus:outline-none focus:border-[#121A2B]"
        />
      </div>

      {/* Brand Rows List */}
      <div className="space-y-2">
        {filtered.map(b => {
          const isTier1 = (b.reports_count || 0) >= 5 && b.payout_days;

          return (
            <div
              key={b.id || b.name}
              onClick={() => setSelectedBrand(b)}
              className="bg-white p-4 rounded-[20px] border border-[#E3E7EF] hover:border-[#121A2B] cursor-pointer transition-all flex items-center justify-between min-h-[44px]"
            >
              <div>
                <span className="font-semibold text-[15px] text-[#121A2B] block">
                  {b.name}
                </span>
                <span className="text-[13px] text-[#6B7488] capitalize">
                  {b.category || 'lifestyle'}
                </span>
              </div>

              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  isTier1
                    ? 'bg-[#F3F5F9] text-[#121A2B] border-[#E3E7EF]'
                    : 'bg-[#F3F5F9] text-[#6B7488] border-[#E3E7EF]'
                }`}
              >
                {isTier1 ? `Pays in ~${b.payout_days?.median} days` : 'Not enough reports'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Brand Card Bottom Sheet */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in">
          <div className="w-full max-w-[480px] bg-white bottom-sheet p-6 space-y-4 border-t border-[#E3E7EF] shadow-float">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-[#121A2B]">
                Brand details
              </span>
              <button
                onClick={() => setSelectedBrand(null)}
                className="text-[#6B7488] hover:text-[#121A2B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BrandCard
              brandRecord={selectedBrand}
              tier={(selectedBrand.reports_count || 0) >= 5 ? 1 : 2}
              onAddExperience={() => {
                const name = selectedBrand.name;
                setSelectedBrand(null);
                onAddExperienceForBrand(name);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
