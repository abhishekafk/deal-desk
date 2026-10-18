'use client';

import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface ScreenshotSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScreenshotSheet({ isOpen, onClose }: ScreenshotSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in">
      <div className="w-full max-w-[480px] bg-white bottom-sheet p-6 space-y-4 border-t border-[#E3E7EF] shadow-float">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-semibold text-[#121A2B] tracking-tight">
            Screenshot upload
          </h3>
          <button onClick={onClose} className="text-[#6B7488] hover:text-[#121A2B]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#F3F5F9] border border-[#E3E7EF] text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-white border border-[#E3E7EF] flex items-center justify-center mx-auto text-[#6B7488]">
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="text-[15px] font-semibold text-[#121A2B]">
            Screenshot reading is coming soon
          </p>
          <p className="text-[13px] text-[#6B7488] leading-relaxed">
            Please paste the message text directly into the chat for now. DealDesk extracts all terms instantly.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#121A2B] hover:bg-[#1f2b45] text-white font-semibold text-[15px] rounded-full transition-colors"
        >
          Got it, I'll paste the text
        </button>
      </div>
    </div>
  );
}
