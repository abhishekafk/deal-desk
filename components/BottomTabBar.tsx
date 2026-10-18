'use client';

import React from 'react';
import { MessageSquare, TrendingUp, Building2, User } from 'lucide-react';

export type TabKey = 'chat' | 'deals' | 'brands' | 'me';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export function BottomTabBar({ activeTab, onSelectTab }: BottomTabBarProps) {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'deals', label: 'Deals', icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'brands', label: 'Brands', icon: <Building2 className="w-5 h-5" /> },
    { key: 'me', label: 'Me', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E3E7EF] pointer-events-auto">
      <div className="max-w-[480px] mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map(t => {
          const isActive = activeTab === t.key;
          return (
            <button
              type="button"
              key={t.key}
              id={`tab-${t.key}`}
              aria-label={t.label}
              onClick={() => onSelectTab(t.key)}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] cursor-pointer ${
                isActive ? 'text-[#121A2B] font-semibold' : 'text-[#6B7488] font-normal hover:text-[#121A2B]'
              }`}
            >
              <div className={isActive ? 'text-[#121A2B]' : 'text-[#6B7488]'}>
                {t.icon}
              </div>
              <span className="text-[11px] leading-none">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
