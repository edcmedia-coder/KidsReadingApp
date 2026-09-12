"use client";

import React, { useState } from "react";
import { NieceId, NieceProfile, ReadingVoiceId } from "@/types/reading";
import { VOICE_OPTIONS, getReadingLevelInfo } from "@/lib/reading-data";
import { sfx } from "@/lib/audio-player";
import { Star, Flame, Volume2, Smartphone, Tablet, Monitor, Trophy, Sparkles, X, ChevronRight, Award } from "lucide-react";

interface Props {
  profiles: Record<NieceId, NieceProfile>;
  activeNieceId: NieceId;
  onSelectNiece: (id: NieceId) => void;
  activeVoice: ReadingVoiceId;
  onOpenVoiceModal: () => void;
  deviceMode: "phone" | "tablet" | "full";
  onSetDeviceMode: (mode: "phone" | "tablet" | "full") => void;
}

export function NieceProfileHeader({
  profiles,
  activeNieceId,
  onSelectNiece,
  activeVoice,
  onOpenVoiceModal,
  deviceMode,
  onSetDeviceMode,
}: Props) {
  const [showXpModal, setShowXpModal] = useState(false);
  const currentProfile = profiles[activeNieceId];
  const levelInfo = getReadingLevelInfo(currentProfile.xp || 0);
  const voiceObj =
    VOICE_OPTIONS.find((v) => v.id === activeVoice) || VOICE_OPTIONS[0];

  const handleNieceClick = (id: NieceId) => {
    if (id !== activeNieceId) {
      sfx.playPop();
      onSelectNiece(id);
    }
  };

  const themeColors = {
    ellee: {
      bar: "from-pink-500 to-rose-400",
      badge: "bg-pink-100 text-pink-700 border-pink-300",
      pill: "bg-pink-500 text-white",
    },
    kaylee: {
      bar: "from-teal-500 to-emerald-400",
      badge: "bg-teal-100 text-teal-700 border-teal-300",
      pill: "bg-teal-600 text-white",
    },
    marlee: {
      bar: "from-purple-600 to-indigo-500",
      badge: "bg-purple-100 text-purple-700 border-purple-300",
      pill: "bg-purple-600 text-white",
    },
  }[activeNieceId];

  return (
    <header
      id="kids-app-header"
      className="flex-none w-full bg-white/95 backdrop-blur-md border-b-2 border-amber-200/80 px-2.5 py-2 sm:px-4 sm:py-2.5 z-20 select-none shadow-xs"
    >
      <div className="w-full flex flex-col gap-1.5">
        {/* Top: 3 Nieces Profile Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 w-full">
          {(["ellee", "kaylee", "marlee"] as NieceId[]).map((id) => {
            const profile = profiles[id];
            const isActive = activeNieceId === id;
            const profileLevel = getReadingLevelInfo(profile.xp || 0);

            return (
              <button
                key={id}
                id={`niece-profile-btn-${id}`}
                onClick={() => handleNieceClick(id)}
                className={`flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-1.5 py-1.5 sm:px-2.5 sm:py-2 rounded-2xl transition-all active:scale-95 border-2 ${
                  isActive
                    ? id === "ellee"
                      ? "bg-pink-500 text-white border-pink-600 shadow-md ring-2 ring-pink-300 font-black"
                      : id === "kaylee"
                      ? "bg-teal-600 text-white border-teal-700 shadow-md ring-2 ring-teal-300 font-black"
                      : "bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300 font-black"
                    : "bg-amber-50/80 text-gray-700 border-amber-200 hover:bg-amber-100 font-bold"
                }`}
              >
                <span className="text-lg sm:text-xl filter drop-shadow-xs shrink-0">
                  {profile.avatar}
                </span>
                <div className="text-left overflow-hidden min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm leading-none font-black truncate">
                      {profile.name}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] block leading-none mt-0.5 truncate font-semibold ${
                      isActive ? "text-white/90" : "text-amber-800/80"
                    }`}
                  >
                    Lvl {profileLevel.level} • {profileLevel.title.split(" ")[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Middle: Reading Level & XP Progress Bar */}
        <button
          id="reading-level-xp-bar-btn"
          onClick={() => {
            sfx.playPop();
            setShowXpModal(true);
          }}
          className="w-full flex flex-col gap-1 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-1.5 sm:p-2 rounded-xl border border-amber-200 hover:border-amber-400 transition cursor-pointer group shadow-2xs"
          title="Click to view Reading Level details"
        >
          <div className="flex items-center justify-between text-[11px] font-black leading-none">
            <div className="flex items-center gap-1.5 truncate">
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider shrink-0 shadow-2xs">
                Lvl {levelInfo.level}
              </span>
              <span className="text-amber-950 truncate font-extrabold flex items-center gap-1">
                {levelInfo.badgeEmoji} {levelInfo.title}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-800 shrink-0 font-extrabold">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-300" />
              <span>{levelInfo.currentXp} XP</span>
              <span className="text-amber-500 font-normal">({levelInfo.progressPercent}%)</span>
              <ChevronRight className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition" />
            </div>
          </div>

          {/* XP Bar track */}
          <div className="w-full bg-amber-200/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-amber-300/60 relative">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${themeColors.bar} transition-all duration-700 ease-out relative shadow-2xs`}
              style={{ width: `${Math.max(5, levelInfo.progressPercent)}%` }}
            >
              {/* Animated glossy highlight */}
              <div className="absolute inset-0 bg-white/25 rounded-full animate-pulse" />
            </div>
          </div>
        </button>

        {/* Bottom controls row: Voice, Stars, Streak, and Device toggle */}
        <div className="flex items-center justify-between gap-1 w-full text-xs">
          {/* Active Real AI Voice Button */}
          <button
            id="voice-picker-pill-btn"
            onClick={() => {
              sfx.playPop();
              onOpenVoiceModal();
            }}
            className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold px-2 py-1 rounded-xl border border-amber-300 transition active:scale-95 shadow-xs max-w-[135px] sm:max-w-none"
            title="Choose AI Voice Storyteller"
          >
            <span className="text-sm shrink-0">{voiceObj.avatar}</span>
            <span className="text-[11px] font-extrabold truncate">
              {voiceObj.name}
            </span>
            <Volume2 className="w-3 h-3 text-amber-700 ml-0.5 shrink-0" />
          </button>

          {/* Quick Stats: Stars & Streak */}
          <div className="flex items-center gap-1">
            {/* Stars Count */}
            <div
              id="user-stars-badge"
              className="flex items-center gap-1 bg-yellow-100 text-yellow-900 font-black px-2 py-1 rounded-xl border border-yellow-300 shadow-xs"
              title={`${currentProfile.stars} Stars collected`}
            >
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500 shrink-0" />
              <span className="text-[11px] font-black">{currentProfile.stars}</span>
            </div>

            {/* Streak Days */}
            <div
              id="user-streak-badge"
              className="flex items-center gap-1 bg-orange-100 text-orange-900 font-black px-2 py-1 rounded-xl border border-orange-300 shadow-xs"
              title={`${currentProfile.streakDays} Day Reading Streak`}
            >
              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-500 shrink-0" />
              <span className="text-[11px] font-black">{currentProfile.streakDays}d</span>
            </div>
          </div>

          {/* Device Mockup Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 shrink-0">
            <button
              id="device-mode-phone-btn"
              onClick={() => onSetDeviceMode("phone")}
              className={`p-1 rounded-lg transition ${
                deviceMode === "phone"
                  ? "bg-white text-pink-600 shadow-xs font-bold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Mobile Phone View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              id="device-mode-tablet-btn"
              onClick={() => onSetDeviceMode("tablet")}
              className={`p-1 rounded-lg transition ${
                deviceMode === "tablet"
                  ? "bg-white text-teal-600 shadow-xs font-bold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              id="device-mode-full-btn"
              onClick={() => onSetDeviceMode("full")}
              className={`p-1 rounded-lg transition ${
                deviceMode === "full"
                  ? "bg-white text-purple-600 shadow-xs font-bold"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              title="Full Screen View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reading Level & XP Info Modal */}
      {showXpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border-4 border-amber-300 relative text-gray-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowXpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-3xl mx-auto shadow-md border-2 border-white ring-4 ring-amber-100">
                {levelInfo.badgeEmoji}
              </div>
              <h3 className="text-xl font-black text-amber-950 flex items-center justify-center gap-1.5">
                <span>{currentProfile.name}&apos;s Reading Level</span>
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-sm">
                <span>Level {levelInfo.level}: {levelInfo.title}</span>
              </div>
            </div>

            {/* XP Progress Card */}
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex justify-between text-xs font-black text-amber-950">
                <span>Level {levelInfo.level} Progress</span>
                <span>{levelInfo.currentXp} / {levelInfo.levelMaxXp} XP</span>
              </div>
              <div className="w-full bg-amber-200/90 rounded-full h-3 overflow-hidden p-0.5 border border-amber-300 relative">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${themeColors.bar} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.max(5, levelInfo.progressPercent)}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-800 font-bold text-center pt-1">
                Earn <span className="font-black text-amber-950">{levelInfo.levelMaxXp - levelInfo.currentXp} more XP</span> to reach <span className="font-black text-amber-950">Level {levelInfo.level + 1}: {levelInfo.nextLevelTitle}</span>!
              </p>
            </div>

            {/* How to Earn XP List */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                How to Earn XP & Level Up
              </h4>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-pink-50 border border-pink-200">
                  <div className="flex items-center gap-2 font-bold text-pink-950">
                    <span className="text-base">📖</span>
                    <span>Complete a Story</span>
                  </div>
                  <span className="font-black text-pink-700 bg-white px-2 py-0.5 rounded-lg border border-pink-300">
                    +50 XP
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <span className="text-base">🎯</span>
                    <span>Ace Comprehension Quiz</span>
                  </div>
                  <span className="font-black text-amber-700 bg-white px-2 py-0.5 rounded-lg border border-amber-300">
                    +25 XP
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50 border border-teal-200">
                  <div className="flex items-center gap-2 font-bold text-teal-950">
                    <span className="text-base">🔤</span>
                    <span>Phonics Lab Sound-Out</span>
                  </div>
                  <span className="font-black text-teal-700 bg-white px-2 py-0.5 rounded-lg border border-teal-300">
                    +20 XP
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2 font-bold text-purple-950">
                    <span className="text-base">🎙️</span>
                    <span>Read-Aloud Voice Practice</span>
                  </div>
                  <span className="font-black text-purple-700 bg-white px-2 py-0.5 rounded-lg border border-purple-300">
                    +30 XP
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="flex items-center gap-2 font-bold text-indigo-950">
                    <span className="text-base">✨</span>
                    <span>Create AI Custom Story</span>
                  </div>
                  <span className="font-black text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-300">
                    +40 XP
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowXpModal(false)}
              className="w-full py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm transition shadow-md active:scale-95"
            >
              Awesome! Let&apos;s Keep Reading
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

