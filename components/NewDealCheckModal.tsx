'use client';

import React, { useState } from 'react';
import { CreatorProfile, DeliverableType, DealCheckResponse } from '@/types';
import { SAMPLE_MESSAGES } from '@/config/samples';
import { 
  X, 
  Sparkles, 
  Upload, 
  ArrowRight, 
  Calculator, 
  FileText, 
  Loader2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface NewDealCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CreatorProfile;
  onDealChecked: (result: DealCheckResponse, originalMessage: string) => void;
}

export function NewDealCheckModal({
  isOpen,
  onClose,
  profile,
  onDealChecked,
}: NewDealCheckModalProps) {
  const [mode, setMode] = useState<'offer' | 'rate'>('offer');
  const [message, setMessage] = useState('');
  const [sampleIdx, setSampleIdx] = useState(0);
  const [screenshotNotice, setScreenshotNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rate Form fields
  const [rateType, setRateType] = useState<DeliverableType>('reel');
  const [rateCount, setRateCount] = useState(1);
  const [rateUsageMonths, setRateUsageMonths] = useState(0);
  const [rateExclusivityMonths, setRateExclusivityMonths] = useState(0);
  const [ratePaidAds, setRatePaidAds] = useState(false);

  // Conditional fill-in state (S3b)
  const [pendingResponse, setPendingResponse] = useState<DealCheckResponse | null>(null);
  const [productCostInput, setProductCostInput] = useState('');
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  // Reset state whenever modal is opened
  React.useEffect(() => {
    if (isOpen) {
      setPendingResponse(null);
      setIsLoading(false);
      setErrorMessage(null);
      setProductCostInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCycleSample = () => {
    const s = SAMPLE_MESSAGES[sampleIdx % SAMPLE_MESSAGES.length];
    setMessage(s.text);
    setSampleIdx(prev => prev + 1);
    setErrorMessage(null);
  };

  const handleScreenshotClick = () => {
    setScreenshotNotice(true);
    setTimeout(() => setScreenshotNotice(false), 5000);
  };

  const handleSubmit = async (overrideConfirmedProductValue?: number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        mode,
        profile,
        message: mode === 'offer' ? message : undefined,
        rateForm: mode === 'rate' ? {
          type: rateType,
          count: rateCount,
          usageMonths: rateUsageMonths,
          exclusivityMonths: rateExclusivityMonths,
          paidAds: ratePaidAds,
        } : undefined,
        confirmedProductValueInr: overrideConfirmedProductValue,
      };

      const res = await fetch('/api/deal-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Server returned an error. Using demo mode calculation.');
      }

      const data = (await res.json()) as DealCheckResponse;

      // Check S3b condition: Product offered with no stated value and not yet confirmed
      if (
        data.extraction.product_offered &&
        (data.extraction.product_offered.stated_value_inr === null || data.extraction.product_offered.stated_value_inr === undefined) &&
        overrideConfirmedProductValue === undefined
      ) {
        setPendingResponse(data);
        setIsLoading(false);
        return;
      }

      onDealChecked(data, mode === 'offer' ? message : `Rate check: ${rateCount} ${rateType}`);
      onClose();
    } catch (err: any) {
      console.error('Deal check fetch error:', err);
      // Graceful local engine fallback
      setErrorMessage(err.message || 'Something went wrong, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProductValue = () => {
    const val = parseInt(productCostInput.replace(/,/g, ''), 10);
    if (!isNaN(val) && val >= 0) {
      handleSubmit(val);
      setPendingResponse(null);
    }
  };

  const copyMissingQuestions = () => {
    if (!pendingResponse) return;
    const questionsText = pendingResponse.engine.missingQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    const msg = `Hi team, thanks for reaching out! Could you please clarify these points so I can give you an accurate quote:\n${questionsText}`;
    navigator.clipboard.writeText(msg);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold">
              DD
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'offer' ? 'New Deal Check' : 'Rate Calculator'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Checking for {profile.name} ({profile.medianReelViews.toLocaleString('en-IN')} median views)
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Skeleton Loader during check */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-teal-700 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Reading the offer, checking your numbers...
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Running fair commercial pricing from {profile.name}'s verified median views
                </p>
              </div>
            </div>
          ) : pendingResponse ? (
            /* S3b Fill-in Step */
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Barter or Product Value Needed
                </div>
                <p className="text-xs leading-relaxed">
                  We noticed this offer includes a product or perk (
                  <span className="font-semibold">{pendingResponse.extraction.product_offered?.description}</span>
                  ) without a stated monetary value. What would this cost in a shop?
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      placeholder="e.g. 2500"
                      value={productCostInput}
                      onChange={e => setProductCostInput(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                  </div>
                  <button
                    onClick={handleConfirmProductValue}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-colors"
                  >
                    Confirm & Calculate
                  </button>
                </div>
              </div>

              {pendingResponse.engine.verdict === 'NEED_INFO' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Questions to ask the brand:
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                    {pendingResponse.engine.missingQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                  <button
                    onClick={copyMissingQuestions}
                    className="mt-2 w-full py-2 px-3 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedQuestions ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied questions to clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy questions to ask brand
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'offer' ? (
            /* S3 Offer paste mode */
            <div className="space-y-4">
              {screenshotNotice && (
                <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Screenshot reading coming soon</span>
                    Please paste the text of the message directly into the box below.
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMessage}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Paste the brand's DM or email message
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Max 2,000 chars • Untrusted text parsed safely
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Paste Instagram DM, WhatsApp text or brand email here... (e.g. 'Hi, we offer Rs 4,000 for 1 reel with 3-month usage rights...')"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400 font-sans"
                />
              </div>

              {/* Utility action row */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleScreenshotClick}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  Upload screenshot
                </button>

                <button
                  type="button"
                  onClick={handleCycleSample}
                  className="inline-flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 font-semibold py-1.5 px-2.5 rounded-lg border border-teal-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Try a sample ({sampleIdx % SAMPLE_MESSAGES.length + 1}/4)
                </button>
              </div>

              {/* Switch to rate mode */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setMode('rate')}
                  className="text-xs text-teal-700 hover:text-teal-900 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  No offer yet? What should I charge?
                </button>
              </div>
            </div>
          ) : (
            /* S3 Short Rate Form mode */
            <div className="space-y-4">
              <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl text-teal-900 text-xs">
                Calculate your fair commercial rate based on your verified {profile.medianReelViews.toLocaleString('en-IN')} median reel views.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deliverable Format
                  </label>
                  <select
                    value={rateType}
                    onChange={e => setRateType(e.target.value as DeliverableType)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="reel">Reel (1.0x baseline)</option>
                    <option value="carousel">Carousel (0.6x)</option>
                    <option value="static_post">Static Post (0.5x)</option>
                    <option value="story_set">Story Set (0.4x)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Deliverable Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={rateCount}
                    onChange={e => setRateCount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Digital Usage Rights
                  </label>
                  <select
                    value={rateUsageMonths}
                    onChange={e => setRateUsageMonths(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value={0}>None / Organic only</option>
                    <option value={3}>Up to 3 months (+20%)</option>
                    <option value={6}>6 months (+40%)</option>
                    <option value={12}>12 months (+80%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Exclusivity
                  </label>
                  <select
                    value={rateExclusivityMonths}
                    onChange={e => setRateExclusivityMonths(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value={0}>None / Non-exclusive</option>
                    <option value={3}>3 months (+30%)</option>
                    <option value={6}>6 months (+60%)</option>
                    <option value={12}>12 months (+120%)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ratePaidAds"
                  checked={ratePaidAds}
                  onChange={e => setRatePaidAds(e.target.checked)}
                  className="rounded text-teal-700 focus:ring-teal-500 w-4 h-4"
                />
                <label htmlFor="ratePaidAds" className="text-xs text-slate-700">
                  Include paid ad boosting / Spark ads / whitelisting (+40%)
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setMode('offer')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  ← Back to paste brand message
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!pendingResponse && !isLoading && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={mode === 'offer' && !message.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <span>{mode === 'offer' ? 'Check this deal' : 'Calculate Fair Rate'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
