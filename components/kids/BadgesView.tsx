"use client";

import React from "react";
import { BADGES_LIST } from "@/lib/reading-data";
import { NieceProfile } from "@/types/reading";
import { Star, Flame, Trophy, BookOpen, Award, Check } from "lucide-react";

interface Props {
  profile: NieceProfile;
}

export function BadgesView({ profile }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-14 sm:pb-8">
      {/* Niece Champion Card */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 p-4 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-20 h-20 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-5xl shadow-inner shrink-0">
          {profile.avatar}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.name}&apos;s Trophy Room
            </h2>
            <span className="text-xs font-bold bg-white/25 px-2.5 py-0.5 rounded-full">
              Age {profile.age}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-pink-100 font-medium">
            {profile.stageTitle}
          </p>
          <p className="text-xs text-amber-100 italic pt-1">{profile.bio}</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-yellow-50 border-2 border-yellow-200 text-center shadow-xs">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-400 mx-auto mb-1" />
          <span className="text-2xl font-black text-yellow-900 block">
            {profile.stars}
          </span>
          <span className="text-xs font-bold text-yellow-700">Stars Earned</span>
        </div>

        <div className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-200 text-center shadow-xs">
          <Flame className="w-6 h-6 text-orange-500 fill-orange-400 mx-auto mb-1" />
          <span className="text-2xl font-black text-orange-900 block">
            {profile.streakDays} Days
          </span>
          <span className="text-xs font-bold text-orange-700">Daily Streak</span>
        </div>

        <div className="p-4 rounded-2xl bg-pink-50 border-2 border-pink-200 text-center shadow-xs">
          <BookOpen className="w-6 h-6 text-pink-500 mx-auto mb-1" />
          <span className="text-2xl font-black text-pink-900 block">
            {profile.storiesReadCount}
          </span>
          <span className="text-xs font-bold text-pink-700">Stories Read</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center shadow-xs">
          <Trophy className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
          <span className="text-2xl font-black text-emerald-900 block">
            {profile.wordsLearnedCount}
          </span>
          <span className="text-xs font-bold text-emerald-700">Words Mastered</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="rounded-3xl bg-white border-3 border-amber-200 p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
          <Award className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-extrabold text-gray-800">
            Reading Badges & Stickers
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {BADGES_LIST.map((badge) => {
            const isUnlocked = profile.earnedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                id={`badge-card-${badge.id}`}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 transition ${
                  isUnlocked
                    ? "bg-amber-50/80 border-amber-300 shadow-xs"
                    : "bg-gray-50/80 border-gray-200 opacity-60 grayscale-50"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${
                    isUnlocked
                      ? "bg-amber-200 border-amber-300 shadow-sm"
                      : "bg-gray-200 border-gray-300"
                  }`}
                >
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-gray-800 text-sm">
                      {badge.title}
                    </h4>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
