import { NextRequest, NextResponse } from 'next/server';
import { CaptionRequest, CaptionResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CaptionRequest;
    const { brief, brandName, relationship, requestedRemoval } = body;

    // Rule: If user asks to remove disclosure, decline politely
    if (requestedRemoval) {
      return NextResponse.json<CaptionResponse>({
        captions: [],
        note: 'I cannot remove the sponsorship disclosure. Indian ASCI guidelines and consumer protection laws require clear tags (#ad or #gifted), and keeping them protects your account from penalties.',
        disclosureRefused: true,
      });
    }

    // Rule: If relationship is unknown, ask first
    if (!relationship || relationship === 'unknown') {
      return NextResponse.json<CaptionResponse>({
        captions: [],
        note: 'Is this paid, gifted, or neither? Please specify so we can attach the compliant disclosure tag.',
        missingRelationship: true,
      });
    }

    // Enforce disclosure tag based on relationship
    let tag = '#ad';
    if (relationship === 'gifted') tag = '#gifted';
    if (relationship === 'barter') tag = '#ad #gifted';

    const brand = brandName || 'the brand';
    const cleanBrief = brief.trim() || 'Excited to try out new essentials';

    // Generate two compliant caption options
    const caption1 = `${cleanBrief}. Honestly impressed with how seamlessly it fits into my daily routine! Have you tried anything from ${brand} yet? Let me know in the comments below! ${tag}`;
    const caption2 = `Sharing a genuine favorite: ${cleanBrief}. Loving the results from ${brand} so far! Drop your questions below if you want details. ${tag}`;

    const note = `Remember to toggle Instagram's native "Paid partnership" label in Advanced Settings before publishing. Clear disclosure (${tag}) protects your profile and maintains audience trust.`;

    return NextResponse.json<CaptionResponse>({
      captions: [caption1, caption2],
      note,
      disclosureRefused: false,
      missingRelationship: false,
    });
  } catch (error) {
    console.error('Caption helper error:', error);
    return NextResponse.json({ error: 'Failed to generate captions' }, { status: 500 });
  }
}
