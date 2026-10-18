'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CoachSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoachSheet({ isOpen, onClose }: CoachSheetProps) {
  const [slide, setSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "Paste a brand's message",
      illustration: (
        <div className="w-full h-32 bg-[#F3F5F9] rounded-2xl flex items-center justify-center p-3 border border-[#E3E7EF]">
          <div className="bubble-user px-4 py-2 text-[13px] text-white">
            "We offer ₹4,000 for 1 reel with 3-month usage..."
          </div>
        </div>
      ),
    },
    {
      title: "See if it's fair",
      illustration: (
        <div className="w-full h-32 bg-[#F3F5F9] rounded-2xl flex flex-col items-center justify-center p-3 border border-[#E3E7EF] space-y-2">
          <span className="text-[24px] font-semibold text-[#D98A00] leading-none">
            Counter
          </span>
          <div className="w-44 h-2 bg-[#D98A00]20 rounded-full border border-[#D98A00] relative">
            <div className="w-3 h-3 rounded-full bg-[#121A2B] absolute -top-0.5 left-1/4" />
          </div>
          <span className="text-[11px] text-[#6B7488]">Fair: ₹5,500 – ₹10,000</span>
        </div>
      ),
    },
    {
      title: "Send a reply that gets you paid",
      illustration: (
        <div className="w-full h-32 bg-[#F3F5F9] rounded-2xl flex items-center justify-center p-3 border border-[#E3E7EF]">
          <div className="bg-white border border-[#E3E7EF] rounded-full px-4 py-2 text-[13px] font-semibold text-[#121A2B] shadow-sm flex items-center gap-2">
            <span>Copy drafted reply</span>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[slide];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in">
      <div className="w-full max-w-[480px] bg-white bottom-sheet p-6 space-y-5 border-t border-[#E3E7EF] shadow-float">
        {/* Top bar with dots indicator & skip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  slide === i ? 'w-6 bg-[#121A2B]' : 'w-1.5 bg-[#E3E7EF]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="text-[13px] text-[#6B7488] hover:text-[#121A2B]"
          >
            Skip
          </button>
        </div>

        {/* Real UI illustration */}
        {current.illustration}

        {/* Title: 1 line of copy, max 8 words */}
        <h3 className="text-[20px] font-semibold text-[#121A2B] text-center tracking-tight">
          {current.title}
        </h3>

        {/* Action Buttons */}
        <div className="pt-2">
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[15px] rounded-full transition-colors"
          >
            {slide === slides.length - 1 ? 'Start' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
