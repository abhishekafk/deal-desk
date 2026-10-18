'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreatorProfile, 
  DealRecord, 
  DealCheckResponse, 
  BrandRecord, 
  DealOutcome,
  DealStatus
} from '@/types';
import { SAMPLE_PROFILES } from '@/config/profiles';
import { SAMPLE_MESSAGES } from '@/config/samples';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredDeals, 
  saveStoredDeals, 
  calculateTotalUplift 
} from '@/lib/storage';
import { formatInr, formatCompactNumber } from '@/lib/formatters';
import { matchBrand } from '@/lib/brandMatcher';

import { Navbar } from '@/components/Navbar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { NewDealCheckModal } from '@/components/NewDealCheckModal';
import { VerdictCard } from '@/components/VerdictCard';
import { ReplyEditorModal } from '@/components/ReplyEditorModal';
import { BrandDirectoryModal } from '@/components/BrandDirectoryModal';
import { OutcomeLoggerModal } from '@/components/OutcomeLoggerModal';
import { ProofPackView } from '@/components/ProofPackView';
import { CaptionHelperModal } from '@/components/CaptionHelperModal';

import { 
  Sparkles, 
  TrendingUp, 
  Plus, 
  FileText, 
  Coins, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function HomePage() {
  const [profile, setProfile] = useState<CreatorProfile>(SAMPLE_PROFILES[0]);
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [totalUplift, setTotalUplift] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'deals' | 'brands' | 'proof' | 'caption'>('deals');
  const [runMode, setRunMode] = useState<'live' | 'demo'>('demo');

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [selectedDealForReply, setSelectedDealForReply] = useState<DealRecord | null>(null);
  const [selectedDealForOutcome, setSelectedDealForOutcome] = useState<DealRecord | null>(null);
  const [brandForOutcome, setBrandForOutcome] = useState<string | null>(null);
  const [activeVerdictDeal, setActiveVerdictDeal] = useState<DealRecord | null>(null);

  // Initialize from localStorage on client load
  useEffect(() => {
    const loadedProfile = getStoredProfile();
    setProfile(loadedProfile);

    const loadedDeals = getStoredDeals();
    setDeals(loadedDeals);
    setTotalUplift(calculateTotalUplift(loadedDeals));

    if (loadedDeals.length > 0) {
      setActiveVerdictDeal(loadedDeals[0]);
    }
  }, []);

  const handleSelectProfile = (newProfile: CreatorProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
  };

  const handleDealChecked = (res: DealCheckResponse, originalMessage: string) => {
    setRunMode(res.runMode);

    const brandRecord = matchBrand(res.extraction.brand_name, profile.niche).brand;

    const newDeal: DealRecord = {
      id: `deal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      brandName: res.extraction.brand_name || 'Brand Collab',
      originalMessage,
      extraction: res.extraction,
      engine: res.engine,
      explanation: res.explanation,
      status: 'Checked',
      profile,
      brandRecord,
    };

    const updated = [newDeal, ...deals];
    setDeals(updated);
    saveStoredDeals(updated);
    setActiveVerdictDeal(newDeal);
    setActiveTab('deals');
  };

  const handleUpdateDealStatus = (dealId: string, status: DealStatus) => {
    const updated = deals.map(d => (d.id === dealId ? { ...d, status } : d));
    setDeals(updated);
    saveStoredDeals(updated);
    if (activeVerdictDeal && activeVerdictDeal.id === dealId) {
      setActiveVerdictDeal({ ...activeVerdictDeal, status });
    }
  };

  const handleSaveOutcome = (dealId: string | null, outcome: DealOutcome) => {
    let updated: DealRecord[];
    if (dealId) {
      updated = deals.map(d =>
        d.id === dealId
          ? {
              ...d,
              status: outcome.paidYet ? 'Paid' : 'Accepted',
              outcome,
            }
          : d
      );
    } else {
      // Direct brand experience log
      const dummyDeal: DealRecord = {
        id: `outcome_${Date.now()}`,
        createdAt: outcome.loggedAt,
        brandName: brandForOutcome || 'Brand Experience',
        originalMessage: 'Direct outcome log',
        extraction: {
          brand_name: brandForOutcome,
          deliverables: [{ type: 'reel', count: 1 }],
          cash_offer_inr: outcome.finalCash,
          product_offered: { description: 'Perk', stated_value_inr: outcome.productValue },
          usage_rights: { duration_months: 3, paid_ads: false },
          exclusivity: { duration_months: null, category: null },
          deadline: null,
          payment_terms: { days_after_posting: outcome.daysToPayment || 30, advance_pct: null },
          sponsorship_disclosure_mentioned: true,
          red_flags: [],
          injection_attempt_detected: false,
          missing_fields: [],
        },
        engine: {
          verdict: 'TAKE',
          confidence: 'MEDIUM',
          brandTier: 1,
          fairRange: { low: outcome.finalCash, high: outcome.finalCash },
          baseRange: { low: outcome.finalCash, high: outcome.finalCash },
          offerValue: outcome.finalCash + outcome.productValue,
          ratioToLow: 1.0,
          cpvOffer: 0.5,
          cpvFair: { low: 0.5, high: 0.8 },
          giveaways: [],
          counterTarget: null,
          resetRange: null,
          flags: [],
          missingQuestions: [],
          allowedNumbers: [outcome.finalCash, outcome.productValue],
        },
        explanation: {
          headline: 'Logged outcome',
          why: [],
          giveaways: [],
          payment_note: null,
          questions_to_ask: [],
          replies: [],
          cautions: [],
        },
        status: outcome.paidYet ? 'Paid' : 'Accepted',
        profile,
        outcome,
      };
      updated = [dummyDeal, ...deals];
    }

    setDeals(updated);
    saveStoredDeals(updated);
    const newTotal = calculateTotalUplift(updated);
    setTotalUplift(newTotal);
    setSelectedDealForOutcome(null);
    setBrandForOutcome(null);
  };

  const handleTryQuickSample = (sampleText: string) => {
    setIsCheckModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        profile={profile}
        totalUplift={totalUplift}
        onOpenProfileModal={() => setIsOnboardingOpen(true)}
        runMode={runMode}
        activeTab={activeTab}
        onSelectTab={tab => setActiveTab(tab as any)}
      />

      {/* Main Content Area: Mobile-first 390px, centered max-w-xl on wider screens */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-5 space-y-5">
        {/* S1. Welcome / Onboarding Hero Banner (Promised in Section 3) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" /> Instant Commercial Pay Checker
            </span>
            <span className="text-[10px] text-slate-400 font-medium">No login required</span>
          </div>

          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
              Paste a brand offer. Know in seconds if it's fair.
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Checks deliverables, unpriced rights giveaways, reported payout days, and writes your DM reply.
            </p>
          </div>

          {/* S1: Three one-click persona buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => handleSelectProfile(SAMPLE_PROFILES[0])}
              className={`py-2 px-2 text-center rounded-xl border text-xs transition-all ${
                profile.id === 'riya'
                  ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-600'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <span className="block font-bold">Try as Riya</span>
              <span className="text-[10px] text-slate-500 font-normal">30.6K (9.2K views)</span>
            </button>

            <button
              onClick={() => handleSelectProfile(SAMPLE_PROFILES[1])}
              className={`py-2 px-2 text-center rounded-xl border text-xs transition-all ${
                profile.id === 'aman'
                  ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-600'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <span className="block font-bold">Try as Aman</span>
              <span className="text-[10px] text-slate-500 font-normal">3.8K (1.4K views)</span>
            </button>

            <button
              onClick={() => setIsOnboardingOpen(true)}
              className={`py-2 px-2 text-center rounded-xl border text-xs transition-all ${
                profile.source === 'self_reported'
                  ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-600'
                  : 'border-dashed border-slate-300 hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <span className="block font-bold">My Stats</span>
              <span className="text-[10px] text-slate-500 font-normal">Custom profile</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setIsCheckModalOpen(true)}
            className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Deal Check (Paste DM / Email)</span>
          </button>
        </div>

        {/* Tab 1: Deals Inbox & Active Verdict Screen */}
        {activeTab === 'deals' && (
          <div className="space-y-5">
            {/* S4. Active Verdict Screen (if a deal is selected or newly checked) */}
            {activeVerdictDeal ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Latest Deal Evaluation
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Checked on {new Date(activeVerdictDeal.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <VerdictCard
                  deal={activeVerdictDeal}
                  onWriteReply={deal => setSelectedDealForReply(deal)}
                  onLogOutcome={deal => setSelectedDealForOutcome(deal)}
                  onDecline={deal => handleUpdateDealStatus(deal.id, 'Declined')}
                />
              </div>
            ) : null}

            {/* S2. Deal Inbox List */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Deal Inbox ({deals.length})
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Creator: <span className="font-semibold text-slate-700">{profile.name}</span> • Rupee uplift: <span className="font-bold text-emerald-700">{formatInr(totalUplift)}</span>
                  </p>
                </div>

                <button
                  onClick={() => setIsCheckModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> New Check
                </button>
              </div>

              {deals.length === 0 ? (
                /* S2 Empty State: Two sample messages to try */
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-700">No deals checked yet</h3>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                      Paste any brand message, or try one of these realistic Indian creator DMs:
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => handleTryQuickSample(SAMPLE_MESSAGES[0].text)}
                      className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      Try GlowLeaf Beauty (₹4,000 for Reel)
                    </button>

                    <button
                      onClick={() => handleTryQuickSample(SAMPLE_MESSAGES[1].text)}
                      className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      Try UrbanKart Fashion (₹7,000 offer)
                    </button>
                  </div>
                </div>
              ) : (
                /* Deals List */
                <div className="divide-y divide-slate-100">
                  {deals.map(deal => {
                    const statusColors: Record<DealStatus, string> = {
                      Checked: 'bg-slate-100 text-slate-700',
                      Replied: 'bg-blue-50 text-blue-800 border border-blue-200',
                      Accepted: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
                      Delivered: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
                      Paid: 'bg-teal-50 text-teal-800 border border-teal-200 font-bold',
                      Declined: 'bg-rose-50 text-rose-700 border border-rose-200',
                    };

                    const isCurrent = activeVerdictDeal?.id === deal.id;

                    return (
                      <div
                        key={deal.id}
                        onClick={() => setActiveVerdictDeal(deal)}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-teal-50/60 border border-teal-200'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {deal.brandName}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[deal.status]}`}>
                              {deal.status}
                            </span>
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                deal.engine.verdict === 'TAKE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : deal.engine.verdict === 'COUNTER'
                                  ? 'bg-amber-100 text-amber-800'
                                  : deal.engine.verdict === 'PASS_OR_RESET'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {deal.engine.verdict}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {deal.originalMessage}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-slate-800 block">
                            {deal.engine.offerValue !== null ? formatInr(deal.engine.offerValue) : 'Unpriced'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(deal.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Brand Directory */}
        {activeTab === 'brands' && (
          <BrandDirectoryModal
            isOpen={true}
            onClose={() => setActiveTab('deals')}
            onAddExperience={brand => {
              setBrandForOutcome(brand.name);
              setSelectedDealForOutcome(null);
            }}
          />
        )}

        {/* Tab 3: Proof Pack */}
        {activeTab === 'proof' && (
          <ProofPackView profile={profile} />
        )}

        {/* Tab 4: Caption Helper */}
        {activeTab === 'caption' && (
          <CaptionHelperModal deals={deals} />
        )}
      </main>

      {/* Global Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentProfile={profile}
        onSelectProfile={handleSelectProfile}
      />

      <NewDealCheckModal
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        profile={profile}
        onDealChecked={handleDealChecked}
      />

      {selectedDealForReply && (
        <ReplyEditorModal
          isOpen={true}
          onClose={() => setSelectedDealForReply(null)}
          deal={selectedDealForReply}
          onUpdateStatus={status => handleUpdateDealStatus(selectedDealForReply.id, status)}
        />
      )}

      {(selectedDealForOutcome || brandForOutcome) && (
        <OutcomeLoggerModal
          isOpen={true}
          onClose={() => {
            setSelectedDealForOutcome(null);
            setBrandForOutcome(null);
          }}
          deal={selectedDealForOutcome}
          brandName={brandForOutcome || undefined}
          onSaveOutcome={handleSaveOutcome}
        />
      )}

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          DealDesk • Built for Indian Micro-Creators • All brand names and data are fictional sample data
        </p>
      </footer>
    </div>
  );
}
