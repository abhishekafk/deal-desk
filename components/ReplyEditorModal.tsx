'use client';

import React, { useState, useEffect } from 'react';
import { DealRecord, ReplyDraft } from '@/types';
import { extractNumbersFromText, validateNumberAllowlist } from '@/lib/guardrails';
import { 
  X, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface ReplyEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: DealRecord;
  onUpdateStatus?: (status: DealRecord['status']) => void;
}

export function ReplyEditorModal({
  isOpen,
  onClose,
  deal,
  onUpdateStatus,
}: ReplyEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'friendly' | 'firm'>('friendly');
  const [draftText, setDraftText] = useState('');
  const [copied, setCopied] = useState(false);
  const [allowlistWarning, setAllowlistWarning] = useState<string | null>(null);

  // Initialize draft text when activeTab or deal changes
  useEffect(() => {
    const found = deal.explanation.replies.find(r => r.label === activeTab);
    const text = found ? found.text : deal.explanation.replies[0]?.text || '';
    setDraftText(text);
  }, [activeTab, deal]);

  // Number allowlist validation whenever draft is edited
  useEffect(() => {
    const isValid = validateNumberAllowlist(draftText, deal.engine.allowedNumbers);
    if (!isValid) {
      setAllowlistWarning('Warning: Draft contains an unverified number not present in your profile, the brand offer, or the fair pricing engine.');
    } else {
      setAllowlistWarning(null);
    }
  }, [draftText, deal]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    onUpdateStatus?.('Replied');
    setTimeout(() => setCopied(false), 3000);
  };

  // Build the list of numbers used and where they came from
  const numbersInDraft = extractNumbersFromText(draftText);
  const numberSources = numbersInDraft.map(n => {
    let source = 'Engine calculation';
    if (n === deal.profile.followers) source = 'Profile (Followers)';
    else if (n === deal.profile.medianReelViews) source = 'Profile (Median Views)';
    else if (n === deal.profile.engagementRatePct) source = 'Profile (Engagement %)';
    else if (n === deal.extraction.cash_offer_inr) source = 'Offer (Cash Offered)';
    else if (n === deal.extraction.product_offered?.stated_value_inr) source = 'Offer (Product Value)';
    else if (n === deal.engine.counterTarget) source = 'Engine (Counter Target)';
    else if (deal.engine.fairRange && (n === deal.engine.fairRange.low || n === deal.engine.fairRange.high)) source = 'Engine (Fair Range)';
    else if (deal.engine.resetRange && (n === deal.engine.resetRange.low || n === deal.engine.resetRange.high)) source = 'Engine (Re-scope Range)';
    else if (n === 50) source = 'Engine (50% Advance Standard)';
    else if (deal.extraction.usage_rights.duration_months === n) source = 'Offer (Usage Months)';
    return { number: n, source };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Reply Draft for {deal.extraction.brand_name || 'Brand'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Aligned with {deal.engine.verdict} verdict
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Tabs: Friendly and Firm */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setActiveTab('friendly')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'friendly'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Friendly Tone
            </button>
            <button
              onClick={() => setActiveTab('firm')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'firm'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Firm Tone
            </button>
          </div>

          {/* Editable Draft Textarea */}
          <div>
            <textarea
              rows={6}
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed font-sans"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>Tone: Natural DM or WhatsApp. Under 120 words.</span>
              <span>{draftText.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          {/* Allowlist Warning if unlisted numbers present */}
          {allowlistWarning && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{allowlistWarning}</span>
            </div>
          )}

          {/* "Numbers used in this message" Panel (Guardrail G5) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Numbers used in this message:
            </div>
            {numberSources.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {numberSources.map((item, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900">{item.number.toLocaleString('en-IN')}</span>
                    <span className="block text-[10px] text-slate-500 truncate">{item.source}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">No numerical stats used in this draft.</p>
            )}
            <p className="text-[10px] text-slate-400">
              Guardrail G5 ensures that drafts never inflate numbers, invent metrics, or quote stats outside your verified data.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {copied ? 'Copied to clipboard!' : 'Ready to send via DM or email'}
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
