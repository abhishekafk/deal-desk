'use client';

import React, { useState } from 'react';
import { CreatorProfile, Niche } from '@/types';
import { SAMPLE_PROFILES } from '@/config/profiles';
import { X, Sparkles, User, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: CreatorProfile;
  onSelectProfile: (profile: CreatorProfile) => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  currentProfile,
  onSelectProfile,
}: OnboardingModalProps) {
  const [mode, setMode] = useState<'pick' | 'custom'>('pick');
  const [customName, setCustomName] = useState(currentProfile.source === 'self_reported' ? currentProfile.name : '');
  const [niche, setNiche] = useState<Niche>(currentProfile.niche || 'lifestyle');
  const [followers, setFollowers] = useState<number>(currentProfile.followers || 10000);
  const [medianViews, setMedianViews] = useState<number>(currentProfile.medianReelViews || 2500);
  const [engagementRate, setEngagementRate] = useState<string>(
    currentProfile.engagementRatePct ? currentProfile.engagementRatePct.toString() : '3.0'
  );

  if (!isOpen) return null;

  const handleSelectSample = (sampleId: 'riya' | 'aman') => {
    const p = SAMPLE_PROFILES.find(item => item.id === sampleId);
    if (p) {
      onSelectProfile({
        ...p,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    }
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: CreatorProfile = {
      id: `custom_${Date.now()}`,
      name: customName.trim() || 'My Creator Profile',
      niche,
      followers: Number(followers) || 1000,
      medianReelViews: Number(medianViews) || 500,
      engagementRatePct: engagementRate ? parseFloat(engagementRate) : undefined,
      updatedAt: new Date().toISOString(),
      source: 'self_reported',
      verified: false,
    };
    onSelectProfile(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Creator Profile Selection
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Paste a brand offer. Know in seconds if it's fair.
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Test with one of our benchmark creator personas or enter your own channel metrics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'pick' ? (
            <div className="space-y-3">
              {/* Option 1: Riya */}
              <button
                onClick={() => handleSelectSample('riya')}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  currentProfile.id === 'riya'
                    ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Riya</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Lifestyle
                    </span>
                  </div>
                  {currentProfile.id === 'riya' && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  30.6K followers • <strong>9,200 median reel views</strong> • 3.1% engagement
                </p>
                <span className="inline-block mt-2 text-[11px] text-teal-700 font-medium">
                  → Try as Riya (Established micro-creator)
                </span>
              </button>

              {/* Option 2: Aman */}
              <button
                onClick={() => handleSelectSample('aman')}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  currentProfile.id === 'aman'
                    ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Aman</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Lifestyle
                    </span>
                  </div>
                  {currentProfile.id === 'aman' && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  3.8K followers • <strong>1,400 median reel views</strong> • 4.2% engagement
                </p>
                <span className="inline-block mt-2 text-[11px] text-teal-700 font-medium">
                  → Try as Aman (Early stage creator / first barter deals)
                </span>
              </button>

              {/* Option 3: Custom Form Button */}
              <button
                onClick={() => setMode('custom')}
                className="w-full text-center py-3 px-4 rounded-xl border border-dashed border-slate-300 hover:border-teal-500 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all mt-4"
              >
                + Enter my own channel stats
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Creator Name or Handle
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Niche
                  </label>
                  <select
                    value={niche}
                    onChange={e => setNiche(e.target.value as Niche)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Followers
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={followers}
                    onChange={e => setFollowers(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Median Reel Views (Crucial)
                  </label>
                </div>
                <input
                  type="number"
                  required
                  min={50}
                  value={medianViews}
                  onChange={e => setMedianViews(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  Helper tip: Look at your last 10 reels, sort them and take the middle number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Engagement Rate % (Optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 3.2"
                  value={engagementRate}
                  onChange={e => setEngagementRate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('pick')}
                  className="w-1/3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
                >
                  Save & Use Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
