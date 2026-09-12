"use client";

import React, { useState } from "react";
import { Story, NieceProfile, ReadingVoiceId } from "@/types/reading";
import { playAIVoice, sfx } from "@/lib/audio-player";
import { BookOpen, Sparkles, Wand2, Star, Volume2, ArrowRight, Headphones } from "lucide-react";

interface Props {
  stories: Story[];
  profile: NieceProfile;
  voice: ReadingVoiceId;
  onSelectStory: (story: Story) => void;
  onGoToStoryMaker: () => void;
  onOpenAudiobook?: (story: Story) => void;
}

export function StoryLibrary({
  stories,
  profile,
  voice,
  onSelectStory,
  onGoToStoryMaker,
  onOpenAudiobook,
}: Props) {
  const [filter, setFilter] = useState<"for_niece" | "all" | "ai_custom">("for_niece");

  // Filter stories
  const displayedStories = stories.filter((s) => {
    if (filter === "for_niece") {
      return s.targetNieceId === profile.id || s.targetAge === profile.age;
    }
    if (filter === "ai_custom") {
      return s.isCustomGenerated === true;
    }
    return true;
  });

  const handleCardClick = (story: Story) => {
    sfx.playPop();
    onSelectStory(story);
  };

  const handleQuickListenTitle = (story: Story, e: React.MouseEvent) => {
    e.stopPropagation();
    sfx.playPop();
    playAIVoice({
      text: `${story.title}! ${story.summary}`,
      voice,
      mode: "story",
      childName: profile.name,
      age: profile.age,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-14 sm:pb-8">
      {/* Hero Welcome Banner for Current Niece */}
      <div
        id="niece-welcome-banner"
        className={`rounded-2xl sm:rounded-3xl ${profile.gradient} p-4 sm:p-6 text-gray-900 shadow-lg border-2 sm:border-3 ${profile.accentBorder} relative overflow-hidden`}
      >
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/70 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 text-gray-800">
            <span>Welcome to Reading Magic, {profile.name}!</span>
            <span className="text-sm">{profile.avatar}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            {profile.id === "ellee"
              ? "Let's Read Fun Rhymes & Phonics!"
              : profile.id === "kaylee"
              ? "Crack Secret Codes & Brave Adventures!"
              : "Explore Galaxies, Mysteries & Chapter Quests!"}
          </h2>

          <p className="text-xs sm:text-sm text-gray-800/90 mt-1.5 font-medium leading-relaxed">
            {profile.bio}
          </p>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <button
              id="library-create-story-cta-btn"
              onClick={onGoToStoryMaker}
              className="px-4 py-2 rounded-2xl bg-gray-900 hover:bg-black text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition active:scale-95"
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              <span>Make a New Story for {profile.name}!</span>
            </button>
          </div>
        </div>

        <div className="absolute -right-4 -bottom-4 text-8xl opacity-30 select-none pointer-events-none">
          {profile.avatar}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-amber-100/70 p-1 rounded-2xl border border-amber-200">
          <button
            id="filter-for-niece-btn"
            onClick={() => {
              sfx.playPop();
              setFilter("for_niece");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === "for_niece"
                ? "bg-white text-amber-950 shadow-xs"
                : "text-amber-800 hover:text-amber-950"
            }`}
          >
            For {profile.name} (Age {profile.age})
          </button>
          <button
            id="filter-all-stories-btn"
            onClick={() => {
              sfx.playPop();
              setFilter("all");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === "all"
                ? "bg-white text-amber-950 shadow-xs"
                : "text-amber-800 hover:text-amber-950"
            }`}
          >
            All Stories ({stories.length})
          </button>
          <button
            id="filter-custom-ai-btn"
            onClick={() => {
              sfx.playPop();
              setFilter("ai_custom");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === "ai_custom"
                ? "bg-white text-amber-950 shadow-xs"
                : "text-amber-800 hover:text-amber-950"
            }`}
          >
            AI Created ✨
          </button>
        </div>

        <span className="text-xs font-bold text-gray-500">
          Showing {displayedStories.length} stories
        </span>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayedStories.map((story) => {
          return (
            <div
              key={story.id}
              id={`story-card-${story.id}`}
              onClick={() => handleCardClick(story)}
              className="rounded-2xl sm:rounded-3xl bg-white border-2 sm:border-3 border-amber-200 hover:border-amber-400 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl group-hover:scale-110 transition shrink-0">
                    {story.emoji}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${story.colorScheme.badgeBg} ${story.colorScheme.badgeText}`}
                    >
                      {story.levelLabel}
                    </span>
                    {story.isCustomGenerated && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        AI Story
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-gray-800 group-hover:text-amber-600 transition">
                  {story.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1.5 line-clamp-2 leading-relaxed">
                  {story.summary}
                </p>
              </div>

              {/* Bottom Actions Bar */}
              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    id={`listen-preview-btn-${story.id}`}
                    type="button"
                    onClick={(e) => handleQuickListenTitle(story, e)}
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-1.5 rounded-xl border border-amber-200 transition"
                    title="Listen to summary"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  {onOpenAudiobook && (
                    <button
                      id={`audiobook-card-btn-${story.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sfx.playPop();
                        onOpenAudiobook(story);
                      }}
                      className="text-xs font-bold text-indigo-900 hover:text-indigo-950 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-1.5 rounded-xl border border-indigo-200 transition"
                      title="Play in Audiobook Mode with Ambient Sound"
                    >
                      <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Audiobook</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-extrabold text-pink-600 group-hover:translate-x-1 transition">
                  <span>Read</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayedStories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-amber-300 p-8 space-y-3">
          <span className="text-4xl">🪄</span>
          <h4 className="text-lg font-bold text-gray-800">
            No stories in this filter yet!
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Use Uncle&apos;s AI Story Magic Studio to write {profile.name}&apos;s very first custom adventure!
          </p>
          <button
            id="empty-state-create-story-btn"
            onClick={onGoToStoryMaker}
            className="px-5 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs shadow-md transition"
          >
            Create a Story Now! ✨
          </button>
        </div>
      )}
    </div>
  );
}
