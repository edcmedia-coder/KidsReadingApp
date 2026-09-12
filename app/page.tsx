"use client";

import React, { useState, useEffect } from "react";
import { NieceId, NieceProfile, Story, ReadingVoiceId } from "@/types/reading";
import { INITIAL_PROFILES, CURATED_STORIES, VOICE_OPTIONS, getReadingLevelInfo } from "@/lib/reading-data";
import { NieceProfileHeader } from "@/components/kids/NieceProfileHeader";
import { VoiceSelectorModal } from "@/components/kids/VoiceSelectorModal";
import { AudiobookModal } from "@/components/kids/AudiobookModal";
import { StoryLibrary } from "@/components/kids/StoryLibrary";
import { StoryReader } from "@/components/kids/StoryReader";
import { PhonicsLab } from "@/components/kids/PhonicsLab";
import { StoryMaker } from "@/components/kids/StoryMaker";
import { ReadAloudPractice } from "@/components/kids/ReadAloudPractice";
import { BadgesView } from "@/components/kids/BadgesView";
import { MobileDeviceContainer } from "@/components/kids/MobileDeviceContainer";
import { KidsBottomNav, NavTab } from "@/components/kids/KidsBottomNav";
import { sfx } from "@/lib/audio-player";
import confetti from "canvas-confetti";

export default function KidsReadingAppPage() {
  const [profiles, setProfiles] = useState<Record<NieceId, NieceProfile>>(INITIAL_PROFILES);
  const [activeNieceId, setActiveNieceId] = useState<NieceId>("ellee");
  const [activeVoice, setActiveVoice] = useState<ReadingVoiceId>("Kore");
  const [activeTab, setActiveTab] = useState<NavTab>("stories");
  const [stories, setStories] = useState<Story[]>(CURATED_STORIES);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [deviceMode, setDeviceMode] = useState<"phone" | "tablet" | "full">("phone");
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [audiobookStory, setAudiobookStory] = useState<Story | null>(null);

  // Load saved state from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedProfiles = localStorage.getItem("kids_reading_profiles");
        if (savedProfiles) {
          setProfiles(JSON.parse(savedProfiles));
        }
        const savedStories = localStorage.getItem("kids_reading_stories");
        if (savedStories) {
          const parsed = JSON.parse(savedStories);
          // Combine curated with custom
          const customOnly = parsed.filter((s: Story) => s.isCustomGenerated);
          setStories([...CURATED_STORIES, ...customOnly]);
        }
        const savedNiece = localStorage.getItem("kids_reading_active_niece") as NieceId;
        if (savedNiece && ["ellee", "kaylee", "marlee"].includes(savedNiece)) {
          setActiveNieceId(savedNiece);
          setActiveVoice(INITIAL_PROFILES[savedNiece].defaultVoice);
        }
        const savedDevice = localStorage.getItem("kids_reading_device_mode");
        if (savedDevice && ["phone", "tablet", "full"].includes(savedDevice)) {
          setDeviceMode(savedDevice as "phone" | "tablet" | "full");
        }
      } catch {
        // Ignore storage errors
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);


  // Save changes to localStorage
  const saveProfiles = (updated: Record<NieceId, NieceProfile>) => {
    setProfiles(updated);
    try {
      localStorage.setItem("kids_reading_profiles", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelectNiece = (id: NieceId) => {
    setActiveNieceId(id);
    setActiveVoice(profiles[id].defaultVoice);
    setSelectedStory(null);
    try {
      localStorage.setItem("kids_reading_active_niece", id);
    } catch {
      // ignore
    }
  };

  const handleSetDeviceMode = (mode: "phone" | "tablet" | "full") => {
    sfx.playPop();
    setDeviceMode(mode);
    try {
      localStorage.setItem("kids_reading_device_mode", mode);
    } catch {
      // ignore
    }
  };

  const handleStarsEarned = (count: number, xpBonus: number = 20) => {
    const current = profiles[activeNieceId];
    const oldLevelInfo = getReadingLevelInfo(current.xp || 0);
    const newXp = (current.xp || 0) + (count * 10) + xpBonus;
    const newLevelInfo = getReadingLevelInfo(newXp);

    if (newLevelInfo.level > oldLevelInfo.level) {
      sfx.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: ["#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6"],
      });
    }

    const updated = {
      ...profiles,
      [activeNieceId]: {
        ...current,
        stars: current.stars + count,
        xp: newXp,
        readingLevel: newLevelInfo.level,
      },
    };
    saveProfiles(updated);
  };

  const handleStoryCompleted = (storyId: string, starsEarned: number) => {
    const current = profiles[activeNieceId];
    const oldLevelInfo = getReadingLevelInfo(current.xp || 0);
    // 50 base XP for finishing story + 10 XP per star
    const earnedXp = 50 + (starsEarned * 10);
    const newXp = (current.xp || 0) + earnedXp;
    const newLevelInfo = getReadingLevelInfo(newXp);

    if (newLevelInfo.level > oldLevelInfo.level) {
      sfx.playLevelUp();
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5 },
        colors: ["#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6"],
      });
    }

    const updated = {
      ...profiles,
      [activeNieceId]: {
        ...current,
        stars: current.stars + starsEarned,
        storiesReadCount: current.storiesReadCount + 1,
        xp: newXp,
        readingLevel: newLevelInfo.level,
      },
    };
    saveProfiles(updated);
  };

  const handleStoryCreated = (newStory: Story) => {
    const updatedStories = [newStory, ...stories];
    setStories(updatedStories);
    try {
      localStorage.setItem("kids_reading_stories", JSON.stringify(updatedStories));
    } catch {
      // ignore
    }

    // Award story maker badge & 15 stars + 40 XP
    const current = profiles[activeNieceId];
    const oldLevelInfo = getReadingLevelInfo(current.xp || 0);
    const newXp = (current.xp || 0) + 40;
    const newLevelInfo = getReadingLevelInfo(newXp);

    if (newLevelInfo.level > oldLevelInfo.level) {
      sfx.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
      });
    }

    const newBadges = current.earnedBadges.includes("story_maker")
      ? current.earnedBadges
      : [...current.earnedBadges, "story_maker"];

    const updated = {
      ...profiles,
      [activeNieceId]: {
        ...current,
        stars: current.stars + 15,
        xp: newXp,
        readingLevel: newLevelInfo.level,
        earnedBadges: newBadges,
      },
    };
    saveProfiles(updated);

    // Switch directly to reading the newly created story!
    setSelectedStory(newStory);
    setActiveTab("stories");
  };

  const activeProfile = profiles[activeNieceId];

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col font-sans overflow-hidden bg-amber-50/50">
      <MobileDeviceContainer
        deviceMode={deviceMode}
        activeNieceId={activeNieceId}
      >
        {/* Kid Profile Header */}
        <NieceProfileHeader
          profiles={profiles}
          activeNieceId={activeNieceId}
          onSelectNiece={handleSelectNiece}
          activeVoice={activeVoice}
          onOpenVoiceModal={() => setVoiceModalOpen(true)}
          deviceMode={deviceMode}
          onSetDeviceMode={handleSetDeviceMode}
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2.5 sm:p-4 overscroll-y-contain">
          {activeTab === "stories" && (
            <>
              {selectedStory ? (
                <StoryReader
                  key={selectedStory.id}
                  story={selectedStory}
                  profile={activeProfile}
                  voice={activeVoice}
                  onStoryCompleted={handleStoryCompleted}
                  onSelectAnotherStory={() => setSelectedStory(null)}
                  onOpenVoiceModal={() => setVoiceModalOpen(true)}
                  onOpenAudiobookModal={() => setAudiobookStory(selectedStory)}
                />
              ) : (
                <StoryLibrary
                  stories={stories}
                  profile={activeProfile}
                  voice={activeVoice}
                  onSelectStory={(story) => setSelectedStory(story)}
                  onGoToStoryMaker={() => setActiveTab("maker")}
                  onOpenAudiobook={(story) => setAudiobookStory(story)}
                />
              )}
            </>
          )}

          {activeTab === "phonics" && (
            <PhonicsLab
              profile={activeProfile}
              voice={activeVoice}
              onStarsEarned={handleStarsEarned}
            />
          )}

          {activeTab === "maker" && (
            <StoryMaker
              profile={activeProfile}
              voice={activeVoice}
              onStoryCreated={handleStoryCreated}
            />
          )}

          {activeTab === "practice" && (
            <ReadAloudPractice
              profile={activeProfile}
              voice={activeVoice}
              onStarsEarned={handleStarsEarned}
            />
          )}

          {activeTab === "badges" && (
            <BadgesView profile={activeProfile} />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <KidsBottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (tab !== "stories") {
              setSelectedStory(null);
            }
          }}
          nieceName={activeProfile.name}
        />
      </MobileDeviceContainer>

      {/* Voice Picker Modal */}
      <VoiceSelectorModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        selectedVoice={activeVoice}
        onSelectVoice={(v) => setActiveVoice(v)}
        childName={activeProfile.name}
        childAge={activeProfile.age}
      />

      {/* Full Immersive Audiobook Player Modal */}
      {audiobookStory && (
        <AudiobookModal
          isOpen={!!audiobookStory}
          onClose={() => setAudiobookStory(null)}
          story={audiobookStory}
          profile={activeProfile}
          voice={activeVoice}
          onSelectVoice={(v) => setActiveVoice(v)}
          onStoryCompleted={handleStoryCompleted}
        />
      )}
    </div>
  );
}
