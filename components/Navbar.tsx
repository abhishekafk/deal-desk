'use client';

import React from 'react';
import Link from 'next/link';
import { CreatorProfile } from '@/types';
import { formatInr, formatCompactNumber } from '@/lib/formatters';
import { 
  Sparkles, 
  User, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle, 
  FileText, 
  Building2, 
  MessageSquare
} from 'lucide-react';

interface NavbarProps {
  profile: CreatorProfile;
  totalUplift: number;
  onOpenProfileModal: () => void;
  runMode?: 'live' | 'demo';
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export function Navbar({
  profile,
  totalUplift,
  onOpenProfileModal,
  runMode = 'demo',
  activeTab = 'deals',
  onSelectTab,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-2.5">
        {/* Top row: Brand & Profile info */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tight">
                DD
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-base leading-tight block">
                  DealDesk
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Fair pay for Indian micro-creators
                </span>
              </div>
            </Link>

            {/* Run mode badge */}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                runMode === 'live'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {runMode === 'live' ? 'Live AI' : 'Demo mode'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Rupee uplift tracker (North Star) */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg px-2.5 py-1 text-right">
              <span className="text-[10px] font-medium text-emerald-800 uppercase tracking-wider block">
                ₹ gained so far
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-700 leading-none">
                {formatInr(totalUplift)}
              </span>
            </div>

            {/* Profile trigger */}
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
              title="Switch profile or edit stats"
            >
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span>{profile.name}</span>
              <span className="text-[10px] font-normal text-slate-500 hidden sm:inline">
                ({formatCompactNumber(profile.followers)})
              </span>
            </button>
          </div>
        </div>

        {/* Navigation pills */}
        <nav className="flex items-center gap-1 mt-2.5 overflow-x-auto no-scrollbar text-xs font-medium border-t border-slate-100 pt-2">
          <button
            onClick={() => onSelectTab?.('deals')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'deals'
                ? 'bg-teal-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Deals
          </button>

          <button
            onClick={() => onSelectTab?.('brands')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'brands'
                ? 'bg-teal-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Brand Directory
          </button>

          <button
            onClick={() => onSelectTab?.('proof')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'proof'
                ? 'bg-teal-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Proof Pack
          </button>

          <button
            onClick={() => onSelectTab?.('caption')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'caption'
                ? 'bg-teal-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Caption Helper
          </button>

          <Link
            href="/how-it-works"
            className="px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 whitespace-nowrap transition-colors flex items-center gap-1.5 ml-auto"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            How it works
          </Link>

          <Link
            href="/evals"
            className="px-3 py-1.5 rounded-md text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 whitespace-nowrap transition-colors flex items-center gap-1.5 font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            Evals (10/10)
          </Link>
        </nav>
      </div>
    </header>
  );
}
