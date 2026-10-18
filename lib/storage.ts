import { CreatorProfile, DealRecord } from '../types';
import { SAMPLE_PROFILES } from '../config/profiles';

const PROFILE_KEY = 'dealdesk_active_profile';
const DEALS_KEY = 'dealdesk_saved_deals';

export function getStoredProfile(): CreatorProfile {
  try {
    if (typeof window === 'undefined') return SAMPLE_PROFILES[0];
    const data = localStorage.getItem(PROFILE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read profile from localStorage:', err);
  }
  return SAMPLE_PROFILES[0]; // Default to Riya
}

export function saveStoredProfile(profile: CreatorProfile): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
  } catch (err) {
    console.error('Failed to save profile to localStorage:', err);
  }
}

export function getStoredDeals(): DealRecord[] {
  try {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(DEALS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read deals from localStorage:', err);
  }
  return [];
}

export function saveStoredDeals(deals: DealRecord[]): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DEALS_KEY, JSON.stringify(deals));
    }
  } catch (err) {
    console.error('Failed to save deals to localStorage:', err);
  }
}

export function calculateTotalUplift(deals: DealRecord[]): number {
  return deals.reduce((acc, deal) => {
    if (deal.outcome?.upliftInr) {
      return acc + deal.outcome.upliftInr;
    }
    return acc;
  }, 0);
}
