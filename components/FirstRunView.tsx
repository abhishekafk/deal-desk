'use client';

import React, { useState } from 'react';
import { CreatorProfile, Niche } from '@/types';
import { SAMPLE_PROFILES } from '@/config/profiles';
import { X } from 'lucide-react';

interface FirstRunViewProps {
  onSelectProfile: (profile: CreatorProfile) => void;
}

export function FirstRunView({ onSelectProfile }: FirstRunViewProps) {
  const [isCustomSheetOpen, setIsCustomSheetOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [niche, setNiche] = useState<Niche>('lifestyle');
  const [followers, setFollowers] = useState<number>(10000);
  const [medianViews, setMedianViews] = useState<number>(2500);

  const riya = SAMPLE_PROFILES[0];
  const aman = SAMPLE_PROFILES[1];

  const handlePickSample = (sample: CreatorProfile) => {
    onSelectProfile({
      ...sample,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: CreatorProfile = {
      id: `custom_${Date.now()}`,
      name: customName.trim() || 'Creator',
      niche,
      followers: Number(followers) || 1000,
      medianReelViews: Number(medianViews) || 500,
      engagementRatePct: 3.2,
      updatedAt: new Date().toISOString(),
      source: 'self_reported',
      verified: false,
    };
    onSelectProfile(newProfile);
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] flex flex-col justify-between p-6 max-w-[480px] mx-auto">
      {/* Top spacing */}
      <div className="pt-8 space-y-2">
        <span className="text-[13px] text-[#6B7488] font-semibold">
          DealDesk
        </span>
        <h1 className="text-[28px] font-semibold text-[#121A2B] tracking-tight leading-tight">
          Who's using DealDesk?
        </h1>
        <p className="text-[15px] text-[#6B7488]">
          Pick a creator persona to test with, or enter your own numbers.
        </p>
      </div>

      {/* Two Big Tiles */}
      <div className="space-y-3 py-6">
        {/* Riya Tile */}
        <button
          onClick={() => handlePickSample(riya)}
          className="w-full text-left p-5 rounded-[20px] bg-white border border-[#E3E7EF] hover:border-[#121A2B] transition-all flex items-center gap-4 group"
        >
          <div className="w-14 h-14 rounded-full bg-[#121A2B] text-white flex items-center justify-center text-[20px] font-semibold shrink-0">
            R
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-semibold text-[#121A2B]">Riya</span>
              <span className="text-[11px] text-[#6B7488] bg-[#F3F5F9] px-2 py-0.5 rounded-full capitalize">
                Lifestyle
              </span>
            </div>
            <p className="text-[13px] text-[#6B7488] mt-1">
              30.6K followers • 9,200 median views
            </p>
          </div>
        </button>

        {/* Aman Tile */}
        <button
          onClick={() => handlePickSample(aman)}
          className="w-full text-left p-5 rounded-[20px] bg-white border border-[#E3E7EF] hover:border-[#121A2B] transition-all flex items-center gap-4 group"
        >
          <div className="w-14 h-14 rounded-full bg-[#E3E7EF] text-[#121A2B] flex items-center justify-center text-[20px] font-semibold shrink-0">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-semibold text-[#121A2B]">Aman</span>
              <span className="text-[11px] text-[#6B7488] bg-[#F3F5F9] px-2 py-0.5 rounded-full capitalize">
                Just starting
              </span>
            </div>
            <p className="text-[13px] text-[#6B7488] mt-1">
              3.8K followers • 1,400 median views
            </p>
          </div>
        </button>
      </div>

      {/* Quiet text button: Use my own numbers */}
      <div className="pb-8 text-center">
        <button
          onClick={() => setIsCustomSheetOpen(true)}
          className="text-[15px] font-semibold text-[#6B7488] hover:text-[#121A2B] transition-colors py-2"
        >
          Use my own numbers
        </button>
      </div>

      {/* Short Custom Numbers Bottom Sheet */}
      {isCustomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in">
          <div className="w-full max-w-[480px] bg-white bottom-sheet p-6 space-y-4 border-t border-[#E3E7EF] shadow-float">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-semibold text-[#121A2B] tracking-tight">
                Enter your numbers
              </h3>
              <button
                onClick={() => setIsCustomSheetOpen(false)}
                className="text-[#6B7488] hover:text-[#121A2B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-3.5 text-[13px]">
              <div>
                <label className="block font-semibold text-[#121A2B] mb-1">
                  Your name or handle
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full text-[15px] px-3.5 py-2.5 rounded-xl border border-[#E3E7EF] focus:outline-none focus:border-[#121A2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#121A2B] mb-1">
                    Niche
                  </label>
                  <select
                    value={niche}
                    onChange={e => setNiche(e.target.value as Niche)}
                    className="w-full text-[15px] px-3 py-2.5 rounded-xl border border-[#E3E7EF] focus:outline-none focus:border-[#121A2B] bg-white"
                  >
                    <option value="lifestyle">Lifestyle</option>
                    <option value="beauty">Beauty</option>
                    <option value="fashion">Fashion</option>
                    <option value="food">Food</option>
                    <option value="tech">Tech</option>
                    <option value="fitness">Fitness</option>
                    <option value="travel">Travel</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#121A2B] mb-1">
                    Followers
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={followers}
                    onChange={e => setFollowers(Number(e.target.value))}
                    className="w-full text-[15px] px-3.5 py-2.5 rounded-xl border border-[#E3E7EF] focus:outline-none focus:border-[#121A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#121A2B] mb-1">
                  Median reel views
                </label>
                <input
                  type="number"
                  required
                  min={50}
                  value={medianViews}
                  onChange={e => setMedianViews(Number(e.target.value))}
                  className="w-full text-[15px] px-3.5 py-2.5 rounded-xl border border-[#E3E7EF] focus:outline-none focus:border-[#121A2B]"
                />
                <span className="text-[11px] text-[#6B7488] block mt-1">
                  Middle of your last 10 reels
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[15px] rounded-full transition-colors mt-2"
              >
                Start with my numbers
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
