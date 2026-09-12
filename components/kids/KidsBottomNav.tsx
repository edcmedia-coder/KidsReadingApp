"use client";

import React from "react";
import { sfx } from "@/lib/audio-player";
import { BookOpen, Sparkles, Wand2, Mic, Trophy } from "lucide-react";

export type NavTab = "stories" | "phonics" | "maker" | "practice" | "badges";

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  nieceName: string;
}

export function KidsBottomNav({ activeTab, onSelectTab }: Props) {
  const tabs: { id: NavTab; label: string; icon: any; emoji: string }[] = [
    { id: "stories", label: "Stories", icon: BookOpen, emoji: "📖" },
    { id: "phonics", label: "Phonics", icon: Sparkles, emoji: "🔤" },
    { id: "maker", label: "AI Maker", icon: Wand2, emoji: "🪄" },
    { id: "practice", label: "Read Aloud", icon: Mic, emoji: "🎙️" },
    { id: "badges", label: "Badges", icon: Trophy, emoji: "🏆" },
  ];

  const handleTabClick = (id: NavTab) => {
    sfx.playPop();
    onSelectTab(id);
  };

  return (
    <nav
      id="kids-bottom-nav"
      className="flex-none w-full bg-white/95 backdrop-blur-md border-t-2 border-amber-200/90 px-1 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-lg select-none z-20"
    >
      <div className="w-full flex items-center justify-between gap-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-btn-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? "bg-amber-100/90 text-amber-950 font-black shadow-xs"
                  : "text-gray-500 hover:text-gray-800 font-bold"
              }`}
            >
              <span className="text-xl filter drop-shadow-xs block leading-none">
                {tab.emoji}
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold leading-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
