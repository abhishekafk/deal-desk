import { NextRequest, NextResponse } from 'next/server';
import { CreatorProfile, DealRecord } from '@/types';
import { orchestrateChatMessage } from '@/lib/chat/orchestrator';
import { checkRateLimit } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 20 checks per hour.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { message, profile, activeDeal } = body as {
      message: string;
      profile: CreatorProfile;
      activeDeal?: DealRecord | null;
    };

    if (!message || !profile) {
      return NextResponse.json({ error: 'Message and profile are required' }, { status: 400 });
    }

    const response = await orchestrateChatMessage(message, profile, activeDeal);
    return NextResponse.json(response);
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({
      type: 'text',
      text: "I couldn't read that one. Try pasting it again.",
      chips: ["Try a sample offer", "What should I charge?", "Is a brand safe to work with?"],
      runMode: 'demo',
    });
  }
}
