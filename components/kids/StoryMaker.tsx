"use client";

import React, { useState } from "react";
import { Story, NieceProfile, ReadingVoiceId } from "@/types/reading";
import { sfx } from "@/lib/audio-player";
import confetti from "canvas-confetti";
import { Sparkles, Wand2, BookOpen, Star, Loader2 } from "lucide-react";

interface Props {
  profile: NieceProfile;
  voice: ReadingVoiceId;
  onStoryCreated: (newStory: Story) => void;
}

export function StoryMaker({ profile, voice, onStoryCreated }: Props) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const presetsByNiece = {
    ellee: [
      { text: "A baby unicorn that bakes strawberry cupcakes", emoji: "🦄" },
      { text: "A fluffy puppy who learns to ride a skateboard", emoji: "🐶" },
      { text: "A friendly dragon who loves silly rhyming words", emoji: "🐲" },
      { text: "A magical garden where rainbow lollipops grow", emoji: "🍭" },
    ],
    kaylee: [
      { text: "Kaylee investigates a glowing secret map in the attic", emoji: "🔍" },
      { text: "Rescuing a baby sea otter in a hidden emerald lagoon", emoji: "🦦" },
      { text: "The mystery of the soccer ball that could float in air", emoji: "⚽" },
      { text: "Building a supersonic treehouse with solar wings", emoji: "🌲" },
    ],
    marlee: [
      { text: "Marlee uncovers a forgotten clockwork star map on Mars", emoji: "🚀" },
      { text: "The secret code of the bioluminescent coral temple", emoji: "🌊" },
      { text: "An ancient library where book characters come to life", emoji: "📚" },
      { text: "The aeronaut girl who built a glider from phoenix feathers", emoji: "🦅" },
    ],
  };

  const currentPresets =
    presetsByNiece[profile.id] || presetsByNiece.ellee;

  const handleCreateStory = async (topicToUse: string) => {
    if (!topicToUse.trim()) return;

    sfx.playPop();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/reading-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_story",
          childName: profile.name,
          age: profile.age,
          topic: topicToUse,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate story");
      }

      const resData = await res.json();
      if (resData.data) {
        const raw = resData.data;
        const newStory: Story = {
          id: `custom-story-${Date.now()}`,
          title: raw.title || `The Adventures of ${profile.name}`,
          emoji: raw.emoji || "✨",
          targetNieceId: profile.id,
          targetAge: profile.age,
          levelLabel: raw.readingLevel || `Custom for ${profile.name}`,
          genre: "AI Personalized Tale",
          colorScheme: {
            badgeBg: "bg-purple-100",
            badgeText: "text-purple-800",
            cardBorder: "border-purple-300",
          },
          summary: `A special story created for ${profile.name} about ${topicToUse}.`,
          paragraphs: raw.paragraphs || [
            { id: "p1", text: raw.storyText || "Once upon a time..." },
          ],
          vocabularyWords: raw.vocabularyWords || [],
          comprehensionQuestions: raw.comprehensionQuestions || [],
          isCustomGenerated: true,
        };

        sfx.playSuccessFanfare();
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#ec4899", "#8b5cf6", "#f59e0b", "#10b981"],
        });

        onStoryCreated(newStory);
        return;
      }
      throw new Error("No story data returned");
    } catch {
      // Create a joyful fallback story tailored to the child's topic so they are never blocked
      const fallbackStory: Story = {
        id: `custom-story-${Date.now()}`,
        title: `${profile.name} & The Wonder of ${topicToUse.slice(0, 25)}`,
        emoji: "⭐",
        targetNieceId: profile.id,
        targetAge: profile.age,
        levelLabel: `Special Tale for ${profile.name}`,
        genre: "Adventure Tale",
        colorScheme: {
          badgeBg: "bg-purple-100",
          badgeText: "text-purple-800",
          cardBorder: "border-purple-300",
        },
        summary: `A special adventure about ${topicToUse} starring ${profile.name}!`,
        paragraphs: [
          {
            id: "p1",
            text: `One sunny morning, ${profile.name} woke up with a giant smile. Today was the day to explore ${topicToUse}!`,
          },
          {
            id: "p2",
            text: `${profile.name} stepped outside into the fresh air. Every step brought a new surprise and wonderful colors all around.`,
          },
          {
            id: "p3",
            text: `"Reading and exploring is my superpower!" cheered ${profile.name} with joyful pride. What an unforgettable day!`,
          },
        ],
        vocabularyWords: [
          {
            word: "explore",
            syllables: "ex-plore",
            definition: "To travel around a new place to learn all about it.",
            emoji: "🧭",
          },
          {
            word: "superpower",
            syllables: "su-per-pow-er",
            definition: "A wonderful special strength that makes you unique!",
            emoji: "⚡",
          },
        ],
        comprehensionQuestions: [
          {
            question: `How did ${profile.name} feel when starting this adventure?`,
            options: ["Happy and smiling", "Sleepy", "Bored"],
            correctIndex: 0,
            encouragement: "Fantastic reading! You got it right!",
          },
        ],
        isCustomGenerated: true,
      };

      sfx.playSuccessFanfare();
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ec4899", "#8b5cf6", "#f59e0b", "#10b981"],
      });
      onStoryCreated(fallbackStory);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-14 sm:pb-8">
      {/* Header */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 p-4 sm:p-6 text-white shadow-md text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span>AI Story Magic Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Create a Story for {profile.name}!
          </h2>
          <p className="text-xs sm:text-sm text-pink-100 mt-1 font-medium max-w-md mx-auto">
            Choose what {profile.name} wants to read about, and our AI storyteller
            will write an adventure at her exact age level (Age {profile.age})!
          </p>
        </div>
        <div className="absolute -right-4 -bottom-6 text-8xl opacity-25 select-none">
          🪄
        </div>
      </div>

      {/* Main Generator Form Card */}
      <div
        id="story-maker-card"
        className="rounded-2xl sm:rounded-3xl bg-white border-3 sm:border-4 border-amber-300 p-4 sm:p-7 shadow-lg space-y-4"
      >
        {/* Preset Idea Chips */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">
            💡 Quick Ideas for {profile.name} (Age {profile.age}):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentPresets.map((preset, idx) => (
              <button
                key={idx}
                id={`preset-topic-btn-${idx}`}
                type="button"
                onClick={() => {
                  sfx.playPop();
                  setSelectedPreset(preset.text);
                  setTopic(preset.text);
                }}
                className={`p-3 rounded-2xl text-left border-2 transition active:scale-98 flex items-start gap-2.5 text-xs font-bold ${
                  selectedPreset === preset.text
                    ? "bg-pink-100 border-pink-500 text-pink-950 shadow-xs ring-2 ring-pink-300"
                    : "bg-amber-50/60 border-amber-200 hover:border-amber-300 text-gray-700 hover:bg-amber-50"
                }`}
              >
                <span className="text-xl shrink-0">{preset.emoji}</span>
                <span className="leading-snug">{preset.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block mb-2">
            Or type any custom adventure idea:
          </label>
          <textarea
            id="custom-story-topic-textarea"
            rows={3}
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setSelectedPreset(null);
            }}
            placeholder={`e.g. ${profile.name} and the talking owl who solves animal riddles...`}
            className="w-full p-4 rounded-2xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-300 outline-none text-sm font-medium bg-amber-50/30"
          />
        </div>

        {/* Generate Button */}
        <button
          id="spark-story-generate-btn"
          type="button"
          onClick={() => handleCreateStory(topic)}
          disabled={isGenerating || !topic.trim()}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Weaving Magic Story for {profile.name}... ✨</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Spark Story with AI! ✨</span>
            </>
          )}
        </button>

        {/* Footer info */}
        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center text-xs text-purple-900 font-medium flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>
            Includes real human AI voice narration, interactive tap-to-read words, and reading comprehension questions!
          </span>
        </div>
      </div>
    </div>
  );
}
