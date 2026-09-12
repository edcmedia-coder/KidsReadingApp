"use client";

import React, { useState, useEffect } from "react";
import { playAIVoice, sfx } from "@/lib/audio-player";
import { ReadingVoiceId } from "@/types/reading";
import { Volume2, Sparkles, X, Star, BookOpen } from "lucide-react";
import confetti from "canvas-confetti";

interface WordExplanationData {
  word: string;
  syllables?: string;
  phonicsChunks?: string[];
  simpleDefinition?: string;
  funSentence?: string;
  emoji?: string;
}

interface Props {
  word: string;
  initialData?: WordExplanationData;
  isOpen: boolean;
  onClose: () => void;
  voice: ReadingVoiceId;
  childName: string;
  childAge: number;
  onWordMastered?: (word: string) => void;
}

export function WordExplainerModal({
  word,
  initialData,
  isOpen,
  onClose,
  voice,
  childName,
  childAge,
  onWordMastered,
}: Props) {
  const [data, setData] = useState<WordExplanationData | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number | null>(null);

  // Clean word from punctuation
  const cleanWord = word.replace(/[.,!?;:"'()]/g, "").trim();

  useEffect(() => {
    if (!isOpen || !cleanWord) return;

    // If initial data is provided with definition, use it
    if (initialData && initialData.word.toLowerCase() === cleanWord.toLowerCase()) {
      const timer = setTimeout(() => setData(initialData), 0);
      return () => clearTimeout(timer);
    }

    // Otherwise fetch AI explanation from server
    let isMounted = true;
    const timer = setTimeout(() => {
      setLoading(true);

      fetch("/api/reading-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "explain_word",
          word: cleanWord,
          childName,
          age: childAge,
        }),
      })
        .then((res) => res.json())
        .then((resData) => {
          if (isMounted) {
            if (resData.data) {
              setData(resData.data);
            } else {
              // Graceful instant fallback so modal is never blank
              setData({
                word: cleanWord,
                syllables: cleanWord.length > 5 ? `${cleanWord.slice(0, 3)}-${cleanWord.slice(3)}` : cleanWord,
                phonicsChunks: [cleanWord],
                simpleDefinition: `A wonderful word from our story! Great job discovering it.`,
                funSentence: `We can read "${cleanWord}" together with confidence!`,
                emoji: "✨",
              });
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            setData({
              word: cleanWord,
              syllables: cleanWord,
              phonicsChunks: [cleanWord],
              simpleDefinition: `A wonderful reading word from our story!`,
              funSentence: `Look at you reading "${cleanWord}"!`,
              emoji: "🌟",
            });
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, cleanWord, initialData, childName, childAge]);

  if (!isOpen || !cleanWord) return null;

  const syllablesList = data?.syllables
    ? data.syllables.split("-")
    : [cleanWord];

  const handleSayWord = () => {
    sfx.playPop();
    setIsPlayingAudio(true);
    playAIVoice({
      text: cleanWord,
      voice,
      mode: "read",
      childName,
      age: childAge,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleSoundItOut = () => {
    sfx.playPop();
    setIsPlayingAudio(true);

    // If we have phonics chunks or syllables, format with slow pauses
    const chunks = data?.phonicsChunks?.length
      ? data.phonicsChunks
      : syllablesList;

    const slowSpoken = `${chunks.join(" ... ")} ... ${cleanWord}!`;

    playAIVoice({
      text: slowSpoken,
      voice,
      mode: "sound_out",
      childName,
      age: childAge,
      playbackRate: 0.85,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleTapChunk = (chunk: string, idx: number) => {
    sfx.playPop();
    setActiveChunkIndex(idx);
    playAIVoice({
      text: chunk,
      voice,
      mode: "read",
      childName,
      age: childAge,
      onEnd: () => setActiveChunkIndex(null),
    });
  };

  const handleGotIt = () => {
    sfx.playStarChime();
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#f59e0b", "#ec4899", "#3b82f6", "#10b981"],
    });
    onWordMastered?.(cleanWord);
    onClose();
  };

  return (
    <div
      id="word-explainer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="word-explainer-card"
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border-4 border-amber-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-pink-400 to-purple-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{data?.emoji || "📖"}</span>
            <span className="text-sm font-bold tracking-wider uppercase text-amber-100">
              Word Wonder Lab
            </span>
          </div>
          <button
            id="close-word-explainer-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-95"
            aria-label="Close word details"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-4">
          {/* Big Word Display */}
          <div className="text-center bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
            <h2 className="text-4xl font-extrabold text-gray-800 tracking-wide font-sans">
              {cleanWord}
            </h2>

            {/* Syllable Buttons */}
            <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
              {syllablesList.map((chunk, idx) => (
                <button
                  key={idx}
                  id={`syllable-chunk-${idx}`}
                  type="button"
                  onClick={() => handleTapChunk(chunk, idx)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-sm transition transform active:scale-90 border shadow-xs ${
                    activeChunkIndex === idx
                      ? "bg-pink-500 text-white border-pink-600 scale-105"
                      : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                  }`}
                  title="Tap to hear this chunk"
                >
                  {chunk}
                  <span className="text-[10px] ml-1 opacity-70">🔊</span>
                </button>
              ))}
            </div>

            {/* Listen / Sound Out Actions */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                id="word-listen-btn"
                onClick={handleSayWord}
                disabled={isPlayingAudio}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <Volume2 className="w-4 h-4" />
                <span>Say Word</span>
              </button>

              <button
                id="word-sound-out-btn"
                onClick={handleSoundItOut}
                disabled={isPlayingAudio}
                className="flex-1 py-2 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sound It Out!</span>
              </button>
            </div>
          </div>

          {/* Meaning / Definition */}
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500 animate-pulse bg-gray-50 rounded-2xl">
              Teacher Rosie is looking up this word for {childName}... 💭
            </div>
          ) : (
            <div className="space-y-2.5">
              {data?.simpleDefinition && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>What it means</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-1 leading-snug">
                    {data.simpleDefinition}
                  </p>
                </div>
              )}

              {data?.funSentence && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>In a fun sentence</span>
                  </div>
                  <p className="text-sm italic text-gray-700 mt-1 leading-snug">
                    &quot;{data.funSentence}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mastered Button */}
          <button
            id="word-mastered-btn"
            onClick={handleGotIt}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-white font-bold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-98 transition"
          >
            <Star className="w-5 h-5 fill-yellow-200 text-yellow-100 animate-spin" />
            <span>I Learned This Word! ⭐</span>
          </button>
        </div>
      </div>
    </div>
  );
}
