'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Lock, 
  FileCode 
} from 'lucide-react';
import { 
  EXTRACTION_SYSTEM_PROMPT, 
  EXPLAIN_DRAFT_SYSTEM_PROMPT, 
  CAPTION_HELPER_SYSTEM_PROMPT,
  CHAT_QA_SYSTEM_PROMPT 
} from '@/lib/llm';

export default function HowItWorksPage() {
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [guardrailsOpen, setGuardrailsOpen] = useState(false);

  const steps = [
    {
      num: '1',
      title: 'Extract terms',
      desc: 'Parses raw DM or email text into structured deliverables, usage rights, and cash offers.',
    },
    {
      num: '2',
      title: 'Match brand',
      desc: 'Matches against verified community payout reports or falls back to category benchmarks.',
    },
    {
      num: '3',
      title: 'Deterministic pricing',
      desc: 'Calculates fair commercial ranges strictly from your verified median reel views, not AI.',
    },
    {
      num: '4',
      title: 'Decision guardrails',
      desc: 'Assigns a verdict (Take, Counter, Pass, Need Info) and flags unpriced giveaways.',
    },
    {
      num: '5',
      title: 'Reply drafting',
      desc: 'Generates Friendly and Firm negotiation drafts locked strictly to verified figures.',
    },
  ];

  const tiers = [
    {
      tier: 'Tier 1',
      label: 'High confidence (5+ reports)',
      desc: 'Specific median payout days and typical reel pay range from verified creator reports.',
    },
    {
      tier: 'Tier 2',
      label: 'Medium confidence (1–4 reports)',
      desc: 'Flagged as low-sample data; displayed alongside category benchmarks.',
    },
    {
      tier: 'Tier 3',
      label: 'Category benchmark (0 reports)',
      desc: 'No brand reports yet; uses verified category median for safe estimation.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F3F5F9] text-[#121A2B] py-6 px-4">
      <div className="max-w-[480px] mx-auto space-y-5">
        {/* Top Navigation */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6B7488] hover:text-[#121A2B] transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to chat
          </Link>
        </div>

        {/* Title Card */}
        <div className="bg-white rounded-[20px] p-5 border border-[#E3E7EF] space-y-2">
          <span className="text-[11px] font-semibold text-[#6B7488]">
            Architecture & Transparency
          </span>
          <h1 className="text-[24px] font-semibold tracking-tight text-[#121A2B]">
            How DealDesk works
          </h1>
          <p className="text-[13px] text-[#6B7488] leading-snug">
            "The AI explains and writes; deterministic code does the math."
          </p>
        </div>

        {/* 5-Step Vertical Stepper (Section 5.13) */}
        <div className="bg-white rounded-[20px] p-5 border border-[#E3E7EF] space-y-4">
          <h2 className="text-[15px] font-semibold text-[#121A2B]">
            5-step pipeline
          </h2>

          <div className="space-y-3">
            {steps.map(s => (
              <div key={s.num} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#121A2B] text-white text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {s.num}
                </span>
                <div>
                  <h3 className="text-[13px] font-semibold text-[#121A2B] leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-[13px] text-[#6B7488] leading-snug">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Confidence Tiers (Section 5.13) */}
        <div className="bg-white rounded-[20px] p-5 border border-[#E3E7EF] space-y-3">
          <h2 className="text-[15px] font-semibold text-[#121A2B]">
            Confidence tiers
          </h2>

          <div className="space-y-2">
            {tiers.map(t => (
              <div
                key={t.tier}
                className="p-3 rounded-2xl bg-[#F3F5F9] border border-[#E3E7EF] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#121A2B]">
                    {t.tier}: {t.label}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7488] leading-snug">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible Guardrails */}
        <div className="bg-white rounded-[20px] p-5 border border-[#E3E7EF] space-y-3">
          <button
            onClick={() => setGuardrailsOpen(!guardrailsOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#6B7488]" />
              <span className="text-[15px] font-semibold text-[#121A2B]">
                The top 5 guardrails
              </span>
            </div>
            {guardrailsOpen ? (
              <ChevronUp className="w-4 h-4 text-[#6B7488]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B7488]" />
            )}
          </button>

          {guardrailsOpen && (
            <div className="pt-2 space-y-2.5 text-[13px] divide-y divide-[#E3E7EF]">
              <div className="pt-2">
                <span className="font-semibold text-[#121A2B] block">G1: Honesty & confidence gate</span>
                <span className="text-[#6B7488] text-[11px] block mt-0.5">
                  Brand timeline figures render only at 5+ reports. Disclaims legal and tax advice.
                </span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-[#121A2B] block">G2: Sponsorship disclosure</span>
                <span className="text-[#6B7488] text-[11px] block mt-0.5">
                  Mandatory #ad or #gifted in commercial replies. Refuses removal requests.
                </span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-[#121A2B] block">G3: Neutral brand language</span>
                <span className="text-[#6B7488] text-[11px] block mt-0.5">
                  Denylist prevents defamation or threatening language; provides firm professional alternatives.
                </span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-[#121A2B] block">G4: Fairness guard</span>
                <span className="text-[#6B7488] text-[11px] block mt-0.5">
                  If offer is fair (≥85% of low end), verdict is Take it and counter drafts are blocked.
                </span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-[#121A2B] block">G5: Numbers allowlist</span>
                <span className="text-[#6B7488] text-[11px] block mt-0.5">
                  Drafts can only quote numbers that exist in profile or calculation engine.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Collapsible "See the prompts" Expander (Section 5.13) */}
        <div className="bg-white rounded-[20px] p-5 border border-[#E3E7EF] space-y-3">
          <button
            onClick={() => setPromptsOpen(!promptsOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#6B7488]" />
              <span className="text-[15px] font-semibold text-[#121A2B]">
                See the prompts
              </span>
            </div>
            {promptsOpen ? (
              <ChevronUp className="w-4 h-4 text-[#6B7488]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B7488]" />
            )}
          </button>

          {promptsOpen && (
            <div className="pt-2 space-y-4 text-xs">
              <div>
                <span className="text-[13px] font-semibold text-[#121A2B] block mb-1">
                  Prompt 1: Extraction
                </span>
                <pre className="p-3 bg-[#121A2B] text-slate-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                  {EXTRACTION_SYSTEM_PROMPT}
                </pre>
              </div>

              <div>
                <span className="text-[13px] font-semibold text-[#121A2B] block mb-1">
                  Prompt 2: Explain & draft
                </span>
                <pre className="p-3 bg-[#121A2B] text-slate-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                  {EXPLAIN_DRAFT_SYSTEM_PROMPT}
                </pre>
              </div>

              <div>
                <span className="text-[13px] font-semibold text-[#121A2B] block mb-1">
                  Prompt 3: Caption helper
                </span>
                <pre className="p-3 bg-[#121A2B] text-slate-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                  {CAPTION_HELPER_SYSTEM_PROMPT}
                </pre>
              </div>

              <div>
                <span className="text-[13px] font-semibold text-[#121A2B] block mb-1">
                  Prompt 4: Chat Q&A
                </span>
                <pre className="p-3 bg-[#121A2B] text-slate-100 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                  {CHAT_QA_SYSTEM_PROMPT}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
