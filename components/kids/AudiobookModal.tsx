"use client";

import React, { useState, useEffect, useRef } from "react";
import { Story, ReadingVoiceId, NieceProfile } from "@/types/reading";
import { VOICE_OPTIONS } from "@/lib/reading-data";
import { playAIVoice, stopAudio, sfx } from "@/lib/audio-player";
import { ambientSound, AMBIENT_TRACKS, AmbientSoundType } from "@/lib/ambient-sound";
import confetti from "canvas-confetti";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Headphones,
  Sliders,
  Moon,
  Clock,
  Star,
  CheckCircle2,
  Flame,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
  profile: NieceProfile;
  voice: ReadingVoiceId;
  onSelectVoice: (voiceId: ReadingVoiceId) => void;
  onStoryCompleted: (storyId: string, starsEarned: number) => void;
}

const SPEED_OPTIONS = [
  { label: "0.75x", value: 0.75, desc: "Gentle" },
  { label: "1.0x", value: 1.0, desc: "Normal" },
  { label: "1.25x", value: 1.25, desc: "Brisk" },
  { label: "1.5x", value: 1.5, desc: "Fast" },
];

export function AudiobookModal({
  isOpen,
  onClose,
  story,
  profile,
  voice,
  onSelectVoice,
  onStoryCompleted,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const speedRef = useRef(1.0);

  const [activeAmbient, setActiveAmbient] = useState<AmbientSoundType>("rain");
  const [ambientVolume, setAmbientVolume] = useState(0.25);
  const [isAmbientMuted, setIsAmbientMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Auto-scroll ref
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Keep speedRef updated
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Sync ambient sound when modal opens or ambient track changes
  useEffect(() => {
    if (isOpen) {
      ambientSound.setVolume(isAmbientMuted ? 0 : ambientVolume);
      ambientSound.play(activeAmbient);
    }
    return () => {
      ambientSound.stop();
    };
  }, [isOpen, activeAmbient, isAmbientMuted, ambientVolume]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      ambientSound.stop();
      stopAudio();
    };
  }, []);

  // Auto-scroll to active paragraph
  useEffect(() => {
    if (isOpen && activeParagraphIndex >= 0) {
      const el = document.getElementById(`audiobook-para-${activeParagraphIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeParagraphIndex, isOpen]);

  if (!isOpen) return null;

  const currentVoiceObj = VOICE_OPTIONS.find((v) => v.id === voice) || VOICE_OPTIONS[0];

  const startPlaybackFrom = async (startIndex: number) => {
    stopAudio();
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsCompleted(false);

    for (let i = startIndex; i < story.paragraphs.length; i++) {
      if (!isPlayingRef.current) break;

      setActiveParagraphIndex(i);
      const text = story.paragraphs[i].text;

      await new Promise<void>((resolve) => {
        playAIVoice({
          text,
          voice,
          mode: "story",
          childName: profile.name,
          age: profile.age,
          playbackRate: speedRef.current,
          onEnd: () => resolve(),
          onError: () => resolve(),
        });
      });

      if (!isPlayingRef.current) break;
    }

    if (isPlayingRef.current) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setIsCompleted(true);
      sfx.playLevelUp();
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5 },
      });
      onStoryCompleted(story.id, 3);
    }
  };

  const handleTogglePlay = () => {
    sfx.playPop();
    if (isPlaying) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      stopAudio();
    } else {
      if (isCompleted) {
        startPlaybackFrom(0);
      } else {
        startPlaybackFrom(activeParagraphIndex);
      }
    }
  };

  const handleSkipNext = () => {
    sfx.playPop();
    const nextIdx = Math.min(story.paragraphs.length - 1, activeParagraphIndex + 1);
    setActiveParagraphIndex(nextIdx);
    if (isPlaying) {
      startPlaybackFrom(nextIdx);
    }
  };

  const handleSkipPrev = () => {
    sfx.playPop();
    const prevIdx = Math.max(0, activeParagraphIndex - 1);
    setActiveParagraphIndex(prevIdx);
    if (isPlaying) {
      startPlaybackFrom(prevIdx);
    }
  };

  const handleRestart = () => {
    sfx.playPop();
    setActiveParagraphIndex(0);
    startPlaybackFrom(0);
  };

  const progressPercent = Math.round(
    ((activeParagraphIndex + (isCompleted ? 1 : 0)) / story.paragraphs.length) * 100
  );

  return (
    <div
      id="audiobook-player-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="audiobook-player-card"
        className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white relative"
      >
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900/90 border-b border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              <Headphones className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-500/30">
                  Audiobook Mode
                </span>
                <span className="text-xs text-indigo-300 font-medium">
                  Hands-Free Autoplay
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-wide truncate max-w-[240px] sm:max-w-md">
                {story.emoji} {story.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="audiobook-settings-toggle-btn"
              onClick={() => {
                sfx.playPop();
                setShowSettings(!showSettings);
              }}
              className={`p-2.5 rounded-2xl border transition ${
                showSettings
                  ? "bg-amber-400 text-slate-950 border-amber-300"
                  : "bg-indigo-900/60 text-indigo-200 border-indigo-700/50 hover:bg-indigo-800/80"
              }`}
              title="Ambient sound & speed controls"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              id="close-audiobook-modal-btn"
              onClick={() => {
                stopAudio();
                ambientSound.stop();
                onClose();
              }}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              aria-label="Close audiobook"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings & Ambient Panel (Collapsible) */}
        {showSettings && (
          <div className="bg-slate-900/95 border-b border-amber-500/30 p-4 space-y-3.5 animate-in slide-in-from-top-2 duration-150">
            {/* Ambient Sound Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <span>🌧️ Ambient Background Soundscape</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAmbientMuted(!isAmbientMuted)}
                    className="text-xs text-indigo-300 hover:text-white flex items-center gap-1"
                  >
                    {isAmbientMuted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-400 font-bold">Muted</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Vol: {Math.round(ambientVolume * 100)}%</span>
                      </>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isAmbientMuted ? 0 : ambientVolume}
                    onChange={(e) => {
                      setIsAmbientMuted(false);
                      setAmbientVolume(parseFloat(e.target.value));
                    }}
                    className="w-20 accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {AMBIENT_TRACKS.map((track) => {
                  const isSelected = activeAmbient === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        sfx.playPop();
                        setActiveAmbient(track.id);
                      }}
                      className={`p-2 rounded-xl text-center border transition flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold ring-1 ring-amber-400"
                          : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700/80"
                      }`}
                    >
                      <span className="text-lg">{track.emoji}</span>
                      <span className="text-[11px] truncate max-w-[80px]">
                        {track.name.split(" ")[1] || track.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Narrator Voice Switcher */}
            <div>
              <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-1.5">
                🎙️ Gemini Live AI Narrator
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {VOICE_OPTIONS.map((v) => {
                  const isSelected = voice === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        sfx.playPop();
                        onSelectVoice(v.id);
                        if (isPlaying) {
                          startPlaybackFrom(activeParagraphIndex);
                        }
                      }}
                      className={`px-2.5 py-1.5 rounded-xl border text-left flex items-center gap-2 transition ${
                        isSelected
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300 text-slate-950 font-bold shadow-md"
                          : "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-base">{v.avatar}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{v.name}</div>
                        <div className="text-[10px] opacity-80 truncate">{v.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Story Text Stream View */}
        <div
          ref={textContainerRef}
          className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 bg-gradient-to-b from-indigo-950/30 to-slate-950/60 scroll-smooth"
        >
          {story.paragraphs.map((para, idx) => {
            const isActive = activeParagraphIndex === idx && isPlaying;
            const isRead = activeParagraphIndex > idx || isCompleted;

            return (
              <div
                key={para.id || idx}
                id={`audiobook-para-${idx}`}
                onClick={() => {
                  sfx.playPop();
                  setActiveParagraphIndex(idx);
                  startPlaybackFrom(idx);
                }}
                className={`p-4 sm:p-5 rounded-2xl transition duration-300 cursor-pointer border relative leading-relaxed ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-amber-400 text-amber-100 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/50 scale-[1.01]"
                    : isRead
                    ? "bg-slate-900/40 border-indigo-900/30 text-slate-300 hover:bg-slate-900/70"
                    : "bg-slate-900/20 border-transparent text-slate-400 hover:bg-slate-900/40"
                }`}
              >
                {isActive && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-amber-400 rounded-r-md animate-pulse shadow-md" />
                )}
                <div className="flex items-start gap-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md shrink-0 mt-1 ${
                      isActive
                        ? "bg-amber-400 text-slate-950 font-black"
                        : isRead
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-base sm:text-lg font-medium text-slate-100">
                    {para.text}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Story Completion Banner */}
          {isCompleted && (
            <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-3xl text-slate-950 text-center space-y-2 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="text-4xl">🎉 ⭐ 🏆</div>
              <h3 className="text-2xl font-black">Audiobook Completed!</h3>
              <p className="text-sm font-bold text-amber-950">
                Super job, {profile.name}! You finished this entire story with {currentVoiceObj.name}.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                >
                  <RotateCcw className="w-4 h-4" /> Listen Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Playback Deck */}
        <div className="bg-slate-900/95 border-t border-indigo-800/40 p-4 sm:p-5 space-y-3">
          {/* Progress Bar & Counter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Paragraph {activeParagraphIndex + 1} of {story.paragraphs.length}
              </span>
              <span className="text-amber-400 font-extrabold">{progressPercent}% complete</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-indigo-900/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 transition-all duration-300 relative"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Main Control Buttons */}
          <div className="flex items-center justify-between gap-2">
            {/* Speed Options */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    sfx.playPop();
                    setSpeed(opt.value);
                  }}
                  className={`px-2 py-1 rounded-xl text-xs font-bold transition ${
                    speed === opt.value
                      ? "bg-amber-400 text-slate-950 shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title={`${opt.desc} reading speed`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Core Play / Skip Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                id="audiobook-prev-btn"
                onClick={handleSkipPrev}
                disabled={activeParagraphIndex <= 0}
                className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-white border border-slate-700 transition active:scale-95"
                title="Previous paragraph"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                id="audiobook-play-toggle-btn"
                onClick={handleTogglePlay}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-slate-950 font-black flex items-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 transition"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-slate-950" />
                    <span className="text-sm">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span className="text-sm">{isCompleted ? "Replay" : "Play Full Story"}</span>
                  </>
                )}
              </button>

              <button
                id="audiobook-next-btn"
                onClick={handleSkipNext}
                disabled={activeParagraphIndex >= story.paragraphs.length - 1}
                className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center text-white border border-slate-700 transition active:scale-95"
                title="Next paragraph"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Current Narrator Voice Pill */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 rounded-2xl border border-slate-700 transition active:scale-95"
              title="Voice Narrator"
            >
              <span className="text-sm">{currentVoiceObj.avatar}</span>
              <span className="text-xs font-bold text-amber-300 hidden sm:inline">
                {currentVoiceObj.name}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
