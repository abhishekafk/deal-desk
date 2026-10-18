'use client';

import React, { useState, useEffect } from 'react';
import { CreatorProfile, DealRecord, DealOutcome } from '@/types';
import { SAMPLE_PROFILES } from '@/config/profiles';
import { 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredDeals, 
  saveStoredDeals, 
  calculateTotalUplift 
} from '@/lib/storage';

import { ChatTab } from '@/components/tabs/ChatTab';
import { DealsTab } from '@/components/tabs/DealsTab';
import { BrandsTab } from '@/components/tabs/BrandsTab';
import { MeTab } from '@/components/tabs/MeTab';

import { FirstRunView } from '@/components/FirstRunView';
import { BottomTabBar, TabKey } from '@/components/BottomTabBar';

import { CoachSheet } from '@/components/sheets/CoachSheet';
import { OutcomeSheet } from '@/components/sheets/OutcomeSheet';
import { ChipDetailSheet } from '@/components/sheets/ChipDetailSheet';
import { NumbersUsedSheet } from '@/components/sheets/NumbersUsedSheet';
import { ScreenshotSheet } from '@/components/sheets/ScreenshotSheet';

export default function HomePage() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [hasChosenProfile, setHasChosenProfile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabKey>('chat');
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [totalUplift, setTotalUplift] = useState<number>(0);
  const [activeDeal, setActiveDeal] = useState<DealRecord | null>(null);

  // Sheets state
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [outcomeDeal, setOutcomeDeal] = useState<DealRecord | null>(null);
  const [screenshotSheetOpen, setScreenshotSheetOpen] = useState(false);
  const [chipSheet, setChipSheet] = useState<{
    isOpen: boolean;
    chipType: 'usage' | 'payout' | 'confidence' | null;
    deal: DealRecord | null;
  }>({
    isOpen: false,
    chipType: null,
    deal: null,
  });
  const [numbersUsedDeal, setNumbersUsedDeal] = useState<DealRecord | null>(null);
  const [runMode, setRunMode] = useState<'live' | 'demo'>('demo');

  // Load initial data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dealdesk_has_chosen_profile');
      if (stored === 'true') {
        const p = getStoredProfile();
        setProfile(p);
        setHasChosenProfile(true);
      }
      const loadedDeals = getStoredDeals();
      setDeals(loadedDeals);
      setTotalUplift(calculateTotalUplift(loadedDeals));
      if (loadedDeals.length > 0) {
        setActiveDeal(loadedDeals[0]);
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleSelectProfile = (newProfile: CreatorProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
    setHasChosenProfile(true);
    localStorage.setItem('dealdesk_has_chosen_profile', 'true');

    // Trigger coach sheet if first run
    const coachSeen = localStorage.getItem('dealdesk_coach_seen');
    if (!coachSeen) {
      setIsCoachOpen(true);
      localStorage.setItem('dealdesk_coach_seen', 'true');
    }
  };

  const handleUpdateProfile = (updated: CreatorProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  const handleSwitchProfile = () => {
    setHasChosenProfile(false);
    localStorage.removeItem('dealdesk_has_chosen_profile');
  };

  const handleDealChecked = (newDeal: DealRecord) => {
    setActiveDeal(newDeal);
    setDeals(prev => {
      const existsIndex = prev.findIndex(d => d.id === newDeal.id);
      let updated: DealRecord[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = newDeal;
      } else {
        updated = [newDeal, ...prev];
      }
      saveStoredDeals(updated);
      return updated;
    });
  };

  const handleSaveOutcome = (dealId: string | null, outcome: DealOutcome) => {
    setDeals(prev => {
      let updated: DealRecord[];
      const idx = prev.findIndex(d => d.id === dealId);
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          outcome,
          status: outcome.daysToPayment !== undefined ? 'Paid' : 'Accepted',
        };
      } else {
        // Standalone outcome (e.g. from BrandsTab)
        const brandName = outcomeDeal?.brandName || outcomeDeal?.extraction?.brand_name || 'Brand Deal';
        const stubDeal: DealRecord = {
          id: `deal_${Date.now()}`,
          profile: profile || SAMPLE_PROFILES[0],
          brandName,
          originalMessage: `Outcome recorded for ${brandName}`,
          createdAt: new Date().toISOString(),
          status: outcome.daysToPayment !== undefined ? 'Paid' : 'Accepted',
          extraction: {
            brand_name: brandName,
            deliverables: [{ type: 'reel', count: 1 }],
            cash_offer_inr: outcome.finalCash,
            product_offered: null,
            usage_rights: { duration_months: 1, paid_ads: false },
            exclusivity: { duration_months: 0, category: null },
            deadline: null,
            payment_terms: { days_after_posting: 30, advance_pct: 0 },
            sponsorship_disclosure_mentioned: true,
            red_flags: [],
            injection_attempt_detected: false,
            missing_fields: [],
          },
          engine: {
            verdict: 'TAKE',
            confidence: 'HIGH',
            brandTier: 1,
            fairRange: { low: outcome.finalCash, high: Math.round(outcome.finalCash * 1.3) },
            baseRange: { low: outcome.finalCash, high: Math.round(outcome.finalCash * 1.3) },
            offerValue: outcome.finalCash,
            ratioToLow: 1.0,
            cpvOffer: 0.5,
            cpvFair: { low: 0.5, high: 0.8 },
            giveaways: [],
            counterTarget: outcome.finalCash,
            resetRange: null,
            flags: [],
            missingQuestions: [],
            allowedNumbers: [outcome.finalCash],
          },
          brandRecord: null,
          explanation: {
            headline: `Accepted deal with ${brandName}`,
            why: [`Agreed at ₹${outcome.finalCash.toLocaleString('en-IN')}`],
            giveaways: [],
            payment_note: null,
            questions_to_ask: [],
            replies: [],
            cautions: [],
          },
          outcome,
        };
        updated = [stubDeal, ...prev];
      }
      saveStoredDeals(updated);
      setTotalUplift(calculateTotalUplift(updated));
      return updated;
    });
  };

  const handleOpenChipSheet = (chipType: 'usage' | 'payout' | 'confidence', deal: DealRecord) => {
    setChipSheet({
      isOpen: true,
      chipType,
      deal,
    });
  };

  // If first run, render fullscreen profile selector
  if (!hasChosenProfile || !profile) {
    return <FirstRunView onSelectProfile={handleSelectProfile} />;
  }

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#121A2B]">
      {/* Centered 480px app frame */}
      <main className="max-w-[480px] mx-auto min-h-screen bg-transparent relative">
        {activeTab === 'chat' && (
          <ChatTab
            profile={profile}
            totalUplift={totalUplift}
            activeDeal={activeDeal}
            onDealChecked={handleDealChecked}
            onOpenOutcomeSheet={(deal) => setOutcomeDeal(deal)}
            onOpenCoach={() => setIsCoachOpen(true)}
            onOpenScreenshotSheet={() => setScreenshotSheetOpen(true)}
            onOpenChipSheet={handleOpenChipSheet}
            onOpenNumbersUsed={(deal) => setNumbersUsedDeal(deal)}
          />
        )}

        {activeTab === 'deals' && (
          <DealsTab
            deals={deals}
            onSwitchToChat={() => setActiveTab('chat')}
            onOpenOutcome={(deal) => setOutcomeDeal(deal)}
            onOpenChipSheet={handleOpenChipSheet}
          />
        )}

        {activeTab === 'brands' && (
          <BrandsTab
            onAddExperienceForBrand={(brandName) => {
              // Create stub deal to log outcome
              setOutcomeDeal({
                id: `deal_brand_${Date.now()}`,
                profile,
                brandName,
                originalMessage: `Experience for ${brandName}`,
                createdAt: new Date().toISOString(),
                status: 'Checked',
                extraction: {
                  brand_name: brandName,
                  deliverables: [{ type: 'reel', count: 1 }],
                  cash_offer_inr: 5000,
                  product_offered: null,
                  usage_rights: { duration_months: 1, paid_ads: false },
                  exclusivity: { duration_months: 0, category: null },
                  deadline: null,
                  payment_terms: { days_after_posting: 30, advance_pct: 0 },
                  sponsorship_disclosure_mentioned: true,
                  red_flags: [],
                  injection_attempt_detected: false,
                  missing_fields: [],
                },
                engine: {
                  verdict: 'TAKE',
                  confidence: 'HIGH',
                  brandTier: 1,
                  fairRange: { low: 4000, high: 7000 },
                  baseRange: { low: 4000, high: 7000 },
                  offerValue: 5000,
                  ratioToLow: 1.25,
                  cpvOffer: 0.5,
                  cpvFair: { low: 0.4, high: 0.7 },
                  giveaways: [],
                  counterTarget: 5000,
                  resetRange: null,
                  flags: [],
                  missingQuestions: [],
                  allowedNumbers: [5000],
                },
                brandRecord: null,
                explanation: {
                  headline: `${brandName} Experience`,
                  why: ['Community report'],
                  giveaways: [],
                  payment_note: null,
                  questions_to_ask: [],
                  replies: [],
                  cautions: [],
                },
              });
            }}
          />
        )}

        {activeTab === 'me' && (
          <MeTab
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onSwitchProfile={handleSwitchProfile}
            runMode={runMode}
          />
        )}
      </main>

      {/* Persistent Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Global Bottom Sheets */}
      <CoachSheet
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
      />

      <OutcomeSheet
        isOpen={outcomeDeal !== null}
        onClose={() => setOutcomeDeal(null)}
        deal={outcomeDeal}
        onSaveOutcome={handleSaveOutcome}
      />

      <ChipDetailSheet
        isOpen={chipSheet.isOpen}
        onClose={() => setChipSheet({ isOpen: false, chipType: null, deal: null })}
        chipType={chipSheet.chipType}
        deal={chipSheet.deal}
      />

      <NumbersUsedSheet
        isOpen={numbersUsedDeal !== null}
        onClose={() => setNumbersUsedDeal(null)}
        deal={numbersUsedDeal}
      />

      <ScreenshotSheet
        isOpen={screenshotSheetOpen}
        onClose={() => setScreenshotSheetOpen(false)}
      />
    </div>
  );
}
