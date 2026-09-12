"use client";

import React, { useState } from "react";
import { PHONICS_CARDS } from "@/lib/reading-data";
import { PhonicsCard, NieceProfile, ReadingVoiceId } from "@/types/reading";
import { playAIVoice, sfx } from "@/lib/audio-player";
import confetti from "canvas-confetti";
import {
  Volume2,
  Sparkles,
  Search,
  Star,
  CheckCircle2,
  ArrowRight,
  Music,
} from "lucide-react";

interface Props {
  profile: NieceProfile;
  voice: ReadingVoiceId;
  onStarsEarned: (count: number) => void;
}

export function PhonicsLab({ profile, voice, onStarsEarned }: Props) {
  // Preselect suitable cards based on niece's age
  const defaultCategory =
    profile.age <= 7
      ? "CVC & Short Vowels"
      : profile.age <= 10
      ? "Multi-Syllable Power"
      : "Multi-Syllable Power";

  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  const [selectedCard, setSelectedCard] = useState<PhonicsCard>(
    PHONICS_CARDS.find((c) => c.targetAge === profile.age) || PHONICS_CARDS[0]
  );
  const [customWordInput, setCustomWordInput] = useState("");
  const [isPlayingChunk, setIsPlayingChunk] = useState<number | null>(null);
  const [blendedSounding, setBlendedSounding] = useState(false);
  const [tappedChunks, setTappedChunks] = useState<Set<number>>(new Set());

  const categories = [
    "CVC & Short Vowels",
    "Blends & Digraphs",
    "Multi-Syllable Power",
  ];

  const filteredCards = PHONICS_CARDS.filter(
    (c) => c.category === activeCategory
  );

  const handleSelectCard = (card: PhonicsCard) => {
    sfx.playPop();
    setSelectedCard(card);
    setTappedChunks(new Set());
  };

  const handleTapChunk = (chunk: string, idx: number) => {
    sfx.playPop();
    setIsPlayingChunk(idx);

    setTappedChunks((prev) => {
      const next = new Set(prev);
      next.add(idx);
      if (next.size === selectedCard.phonicsChunks.length) {
        // All chunks tapped!
        sfx.playStarChime();
      }
      return next;
    });

    playAIVoice({
      text: chunk,
      voice,
      mode: "read",
      childName: profile.name,
      age: profile.age,
      playbackRate: 0.8,
      onEnd: () => setIsPlayingChunk(null),
      onError: () => setIsPlayingChunk(null),
    });
  };

  const handleBlendWord = () => {
    sfx.playPop();
    setBlendedSounding(true);

    const chunksSpoken = selectedCard.phonicsChunks.join(" ... ");
    const fullPhrase = `${chunksSpoken} ... ${selectedCard.word.toUpperCase()}!`;

    playAIVoice({
      text: fullPhrase,
      voice,
      mode: "sound_out",
      childName: profile.name,
      age: profile.age,
      playbackRate: 0.85,
      onEnd: () => {
        setBlendedSounding(false);
        sfx.playSuccessFanfare();
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#ec4899", "#f59e0b", "#10b981"],
        });
        onStarsEarned(2);
      },
      onError: () => setBlendedSounding(false),
    });
  };

  const handleCustomWordSoundOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWordInput.trim()) return;

    sfx.playPop();
    const word = customWordInput.trim();

    // Create a temporary card
    const letters = word.split("");
    const newCard: PhonicsCard = {
      id: `custom-${Date.now()}`,
      word,
      category: "CVC & Short Vowels",
      targetAge: profile.age as 7 | 10 | 11,
      syllables: word,
      phonicsChunks: word.length <= 5 ? letters : [word],
      clue: `Custom word created by ${profile.name}!`,
      emoji: "🌟",
      exampleSentence: `Look at how well ${profile.name} can read ${word}!`,
    };

    setSelectedCard(newCard);
    setTappedChunks(new Set());
    setCustomWordInput("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 pb-14 sm:pb-8">
      {/* Top Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 p-4 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Phonics & Sound-It-Out Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Learn to Read Sound by Sound!
          </h2>
          <p className="text-sm text-pink-100 mt-1 font-medium">
            Tap each chunk to hear the real human voice sound it out, then blend
            them together to master reading!
          </p>
        </div>
        <div className="absolute -right-4 -bottom-6 text-8xl opacity-30 select-none">
          🔤
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`phonics-cat-${cat.replace(/\s+/g, "-")}`}
            onClick={() => {
              sfx.playPop();
              setActiveCategory(cat);
              const firstCard = PHONICS_CARDS.find((c) => c.category === cat);
              if (firstCard) setSelectedCard(firstCard);
              setTappedChunks(new Set());
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition active:scale-95 border-2 shadow-xs ${
              activeCategory === cat
                ? "bg-pink-500 text-white border-pink-600 shadow-md ring-2 ring-pink-300"
                : "bg-white text-gray-700 border-amber-200 hover:bg-amber-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Interactive Sound-It-Out Center Stage */}
      <div
        id="sound-it-out-stage"
        className="rounded-2xl sm:rounded-3xl bg-white border-3 sm:border-4 border-amber-300 p-4 sm:p-7 shadow-lg text-center relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" />
          <span>Active Word Puzzle</span>
        </div>

        {/* Word Display & Emoji */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl sm:text-5xl filter drop-shadow-xs">
            {selectedCard.emoji}
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-800 tracking-wide font-sans">
            {selectedCard.word}
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-md mx-auto mb-6">
          💡 Clue: {selectedCard.clue}
        </p>

        {/* Interactive Sound Chunks (Big Bubbly Tap Targets) */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-pink-600">
            Tap each chunk below to hear the sound:
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {selectedCard.phonicsChunks.map((chunk, idx) => {
              const isTapped = tappedChunks.has(idx);
              const isPlaying = isPlayingChunk === idx;

              return (
                <button
                  key={idx}
                  id={`phonics-chunk-btn-${idx}`}
                  type="button"
                  onClick={() => handleTapChunk(chunk, idx)}
                  className={`min-w-[64px] sm:min-w-[80px] h-16 sm:h-20 px-4 rounded-2xl font-black text-2xl sm:text-3xl flex flex-col items-center justify-center transition transform active:scale-90 border-3 shadow-md ${
                    isPlaying
                      ? "bg-pink-500 text-white border-pink-600 scale-110 animate-bounce"
                      : isTapped
                      ? "bg-emerald-100 text-emerald-800 border-emerald-400 shadow-emerald-200"
                      : "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:scale-105"
                  }`}
                >
                  <span>{chunk}</span>
                  <span className="text-[10px] font-bold text-gray-500 mt-0.5">
                    {isTapped ? "✓ Heard" : "Tap"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Blend & Read Word Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            id="blend-and-read-word-btn"
            onClick={handleBlendWord}
            disabled={blendedSounding}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-base shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            <span>
              {blendedSounding ? "Blending Sounds..." : "Blend & Say Word! ✨"}
            </span>
          </button>
        </div>

        {/* Example Sentence */}
        <div className="mt-6 p-3 bg-amber-50 rounded-2xl border border-amber-200 max-w-lg mx-auto text-xs text-amber-900 font-medium">
          <strong>In a sentence:</strong> &quot;{selectedCard.exampleSentence}&quot;
        </div>
      </div>

      {/* Grid of Other Practice Cards */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span>More {activeCategory} Words</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredCards.map((card) => {
            const isCurrent = selectedCard.id === card.id;

            return (
              <div
                key={card.id}
                id={`phonics-card-item-${card.word}`}
                onClick={() => handleSelectCard(card)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition active:scale-95 shadow-xs flex flex-col justify-between ${
                  isCurrent
                    ? "bg-amber-100 border-amber-400 ring-2 ring-amber-300"
                    : "bg-white border-amber-200 hover:border-amber-300 hover:bg-amber-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{card.emoji}</span>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">
                    {card.syllables}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-extrabold text-gray-800 text-base block">
                    {card.word}
                  </span>
                  <p className="text-[11px] text-gray-500 line-clamp-1">
                    {card.clue}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Word Sounder Box */}
      <div className="rounded-3xl bg-purple-50 border-2 border-purple-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-purple-900 font-bold">
          <Music className="w-5 h-5 text-purple-600" />
          <h4>Want to sound out any custom word?</h4>
        </div>
        <p className="text-xs text-purple-700 mb-3">
          Type any word {profile.name} wants to practice reading, and our AI tutor will sound it out!
        </p>

        <form
          onSubmit={handleCustomWordSoundOut}
          className="flex items-center gap-2"
        >
          <input
            id="custom-word-sound-input"
            type="text"
            value={customWordInput}
            onChange={(e) => setCustomWordInput(e.target.value)}
            placeholder="e.g. dinosaur, rainbow, puppy..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-sm font-medium"
          />
          <button
            id="sound-custom-word-submit-btn"
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
          >
            Sound It Out!
          </button>
        </form>
      </div>
    </div>
  );
}
