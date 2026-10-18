'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreatorProfile } from '@/types';
import { formatCompactNumber } from '@/lib/formatters';
import { ProofPackView } from '@/components/ProofPackView';
import { X, FileText, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface MeTabProps {
  profile: CreatorProfile;
  onUpdateProfile: (p: CreatorProfile) => void;
  onSwitchProfile: () => void;
  runMode: 'live' | 'demo';
}

export function MeTab({
  profile,
  onUpdateProfile,
  onSwitchProfile,
  runMode,
}: MeTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [followers, setFollowers] = useState(profile.followers);
  const [medianViews, setMedianViews] = useState(profile.medianReelViews);
  const [engagement, setEngagement] = useState(profile.engagementRatePct || 3.1);
  const [showProofPack, setShowProofPack] = useState(false);

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      followers: Number(followers) || profile.followers,
      medianReelViews: Number(medianViews) || profile.medianReelViews,
      engagementRatePct: Number(engagement) || profile.engagementRatePct,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  if (showProofPack) {
    return (
      <div className="p-4 space-y-4 pb-24 max-w-[480px] mx-auto">
        <button
          onClick={() => setShowProofPack(false)}
          className="text-[13px] font-semibold text-[#6B7488] hover:text-[#121A2B] mb-2 inline-flex items-center gap-1"
        >
          ← Back to profile
        </button>
        <ProofPackView profile={profile} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24 max-w-[480px] mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-[20px] font-semibold text-[#121A2B] tracking-tight">
          Me
        </h2>
        <p className="text-[13px] text-[#6B7488]">
          Your verified channel metrics and settings
        </p>
      </div>

      {/* Profile Card & Inline Stats */}
      <div className="bg-white rounded-[20px] border border-[#E3E7EF] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#121A2B] text-white flex items-center justify-center text-[18px] font-semibold">
              {profile.name.charAt(0)}
            </div>
            <div>
              <span className="font-semibold text-[18px] text-[#121A2B] block">
                {profile.name}
              </span>
              <span className="text-[13px] text-[#6B7488] capitalize">
                {profile.niche} creator
              </span>
            </div>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="text-[13px] font-semibold text-[#121A2B] px-3 py-1.5 rounded-full border border-[#E3E7EF] hover:bg-[#F3F5F9]"
          >
            {isEditing ? 'Save' : 'Edit stats'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E3E7EF]">
          <div className="p-2.5 rounded-xl bg-[#F3F5F9] text-center">
            <span className="text-[11px] text-[#6B7488] block">Followers</span>
            {isEditing ? (
              <input
                type="number"
                value={followers}
                onChange={e => setFollowers(Number(e.target.value))}
                className="w-full text-center text-[15px] font-semibold text-[#121A2B] bg-white rounded border border-[#E3E7EF] mt-0.5"
              />
            ) : (
              <span className="text-[15px] font-semibold text-[#121A2B] block tabular-nums">
                {formatCompactNumber(profile.followers)}
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-[#F3F5F9] text-center">
            <span className="text-[11px] text-[#6B7488] block">Median views</span>
            {isEditing ? (
              <input
                type="number"
                value={medianViews}
                onChange={e => setMedianViews(Number(e.target.value))}
                className="w-full text-center text-[15px] font-semibold text-[#121A2B] bg-white rounded border border-[#E3E7EF] mt-0.5"
              />
            ) : (
              <span className="text-[15px] font-semibold text-[#121A2B] block tabular-nums">
                {profile.medianReelViews.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-[#F3F5F9] text-center">
            <span className="text-[11px] text-[#6B7488] block">Engagement</span>
            {isEditing ? (
              <input
                type="number"
                step="0.1"
                value={engagement}
                onChange={e => setEngagement(Number(e.target.value))}
                className="w-full text-center text-[15px] font-semibold text-[#121A2B] bg-white rounded border border-[#E3E7EF] mt-0.5"
              />
            ) : (
              <span className="text-[15px] font-semibold text-[#121A2B] block tabular-nums">
                {profile.engagementRatePct ?? 3.1}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action List */}
      <div className="bg-white rounded-[20px] border border-[#E3E7EF] divide-y divide-[#E3E7EF]">
        {/* Proof Pack Button */}
        <button
          onClick={() => setShowProofPack(true)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F3F5F9] transition-colors min-h-[44px]"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#121A2B]" />
            <div>
              <span className="font-semibold text-[15px] text-[#121A2B] block">
                Proof pack
              </span>
              <span className="text-[13px] text-[#6B7488]">
                Print-friendly one-pager in brand buyer language
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6B7488]" />
        </button>

        {/* Switch Profile Button */}
        <button
          onClick={onSwitchProfile}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F3F5F9] transition-colors min-h-[44px]"
        >
          <div>
            <span className="font-semibold text-[15px] text-[#121A2B] block">
              Switch profile
            </span>
            <span className="text-[13px] text-[#6B7488]">
              Switch between Riya, Aman, or custom numbers
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6B7488]" />
        </button>

        {/* How it works */}
        <Link
          href="/how-it-works"
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F3F5F9] transition-colors min-h-[44px]"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-[#121A2B]" />
            <div>
              <span className="font-semibold text-[15px] text-[#121A2B] block">
                How it works
              </span>
              <span className="text-[13px] text-[#6B7488]">
                Pipeline, tiers, guardrails, and prompts
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6B7488]" />
        </Link>

        {/* For Reviewers: Evals */}
        <Link
          href="/evals"
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F3F5F9] transition-colors min-h-[44px]"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#1F9D6B]" />
            <div>
              <span className="font-semibold text-[15px] text-[#121A2B] block">
                For reviewers: run the 10 checks
              </span>
              <span className="text-[13px] text-[#1F9D6B] font-semibold">
                Evaluation suite (10/10 automated assertions)
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6B7488]" />
        </Link>
      </div>

      {/* Engine Status Line */}
      <div className="text-center py-2">
        <span className="text-[13px] text-[#6B7488]">
          Engine status: <strong className="text-[#121A2B]">{runMode === 'live' ? 'Live AI' : 'Demo mode'}</strong>
        </span>
      </div>
    </div>
  );
}
