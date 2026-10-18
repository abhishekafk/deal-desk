'use client';

import React, { useState } from 'react';
import { DealRecord, CaptionResponse } from '@/types';
import { 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  HelpCircle,
  X
} from 'lucide-react';

interface CaptionHelperModalProps {
  deals: DealRecord[];
  onClose?: () => void;
}

export function CaptionHelperModal({ deals }: CaptionHelperModalProps) {
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || 'custom');
  const [brandName, setBrandName] = useState(deals[0]?.extraction.brand_name || 'GlowLeaf Beauty');
  const [relationship, setRelationship] = useState<'paid' | 'gifted' | 'barter' | 'unknown'>('paid');
  const [brief, setBrief] = useState('write a natural caption about the GlowLeaf serum, don\'t make it feel like an ad');
  const [isLoading, setIsLoading] = useState(false);
  const [captionResult, setCaptionResult] = useState<CaptionResponse | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [removalRefusedMessage, setRemovalRefusedMessage] = useState<string | null>(null);

  const handleGenerate = async (requestRemoval = false) => {
    setIsLoading(true);
    setRemovalRefusedMessage(null);

    try {
      const res = await fetch('/api/caption-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          brandName,
          relationship,
          requestedRemoval: requestRemoval,
        }),
      });

      const data = (await res.json()) as CaptionResponse;
      if (requestRemoval && data.disclosureRefused) {
        setRemovalRefusedMessage(data.note);
      } else {
        setCaptionResult(data);
      }
    } catch (err) {
      console.error('Caption generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCaption = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 3000);
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Sponsored Caption Helper (Lite)
              </h2>
              <p className="text-xs text-slate-500">
                Compliant, engaging Instagram captions with enforced Indian ASCI disclosure
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Guardrail G2
          </span>
        </div>

        {/* Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Deal or Brand
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedDealId}
                onChange={e => {
                  setSelectedDealId(e.target.value);
                  const d = deals.find(item => item.id === e.target.value);
                  if (d) {
                    setBrandName(d.extraction.brand_name || 'Brand');
                  }
                }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {deals.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.extraction.brand_name || 'Checked Deal'}
                  </option>
                ))}
                <option value="custom">Custom Brand Name...</option>
              </select>

              <input
                type="text"
                placeholder="Brand Name (e.g. GlowLeaf Beauty)"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Commercial Relationship (Mandatory)
            </label>
            <select
              value={relationship}
              onChange={e => setRelationship(e.target.value as any)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="paid">Paid Collaboration (Requires #ad)</option>
              <option value="gifted">Gifted Product (Requires #gifted)</option>
              <option value="barter">Barter / Passes (Requires #ad #gifted)</option>
              <option value="unknown">Unknown / Not specified (Triggers clarification check)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              One-line Creative Brief
            </label>
            <input
              type="text"
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder="e.g. write a natural caption about the GlowLeaf serum, don't make it feel like an ad"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => handleGenerate(false)}
              disabled={isLoading || !brief.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate 2 Captions
            </button>

            {captionResult && captionResult.captions.length > 0 && (
              <button
                onClick={() => handleGenerate(true)}
                className="text-[11px] text-rose-700 hover:text-rose-900 font-semibold underline"
                title="Test Guardrail G2 refusal behavior"
              >
                Simulate: "Remove the #ad"
              </button>
            )}
          </div>
        </div>

        {/* Refusal Notice when user asks to remove disclosure */}
        {removalRefusedMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Removal Refused (Guardrail G2):</span>
              <p className="leading-relaxed">{removalRefusedMessage}</p>
            </div>
          </div>
        )}

        {/* Caption Results */}
        {captionResult && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            {captionResult.missingRelationship ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <span className="font-bold block mb-1">Relationship Clarification Needed:</span>
                {captionResult.note}
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 block">
                    Generated Compliant Options:
                  </span>
                  {captionResult.captions.map((cap, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2"
                    >
                      <p className="leading-relaxed">{cap}</p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCopyCaption(cap, i)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded text-slate-700 flex items-center gap-1 transition-colors"
                        >
                          {copiedIdx === i ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Caption
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-900 text-[11px] leading-relaxed">
                  <strong>Compliance Note:</strong> {captionResult.note}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
