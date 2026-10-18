import { CreatorProfile } from '../types';

export function getSampleProfiles(): CreatorProfile[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'riya',
      name: 'Riya',
      niche: 'lifestyle',
      followers: 30600,
      medianReelViews: 9200,
      engagementRatePct: 3.1,
      source: 'sample',
      updatedAt: now,
      verified: true,
    },
    {
      id: 'aman',
      name: 'Aman',
      niche: 'lifestyle',
      followers: 3800,
      medianReelViews: 1400,
      engagementRatePct: 4.2,
      source: 'sample',
      updatedAt: now,
      verified: true,
    },
  ];
}

export const SAMPLE_PROFILES = getSampleProfiles();
