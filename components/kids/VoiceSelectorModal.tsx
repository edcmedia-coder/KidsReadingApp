"use client";

import React, { useState } from "react";
import { VOICE_OPTIONS } from "@/lib/reading-data";
import { ReadingVoiceId, VoiceOption } from "@/types/reading";
import { playAIVoice, stopAudio } from "@/lib/audio-player";
import { Volume2, Check, Sparkles, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: ReadingVoiceId;
  onSelectVoice: (voiceId: ReadingVoiceId) => void;
  childName: string;
  childAge: number;
}

export function VoiceSelectorModal({
  isOpen,
  onClose,
  selectedVoice,
  onSelectVoice,
  childName,
  childAge,
}: Props) {
  const [testingVoice, setTestingVoice] = useState<ReadingVoiceId | null>(null);

  if (!isOpen) return null;

  const handlePreviewVoice = (v: VoiceOption, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestingVoice(v.id);
    const samplePhrase =
      v.id === "Kore"
        ? `Hi ${childName}! I'm Teacher Rosie. Let's read wonderful stories together today!`
        : v.id === "Puck"
        ? `Woohoo! Hello ${childName}! Ready for the most exciting story adventure ever?`
        : v.id === "Zephyr"
        ? `Hey ${childName}! Coach Leo here. You are going to do amazing reading today!`
        : v.id === "Fenrir"
        ? `Greetings ${childName}. I am Professor Penny. Let us uncover the secrets in every book.`
        : v.id === "Charon"
        ? `Welcome aboard ${childName}! I am Captain Orion. Prepare for a cosmic space journey.`
        : v.id === "Aoede"
        ? `Tra-la-la! Hello ${childName}, I'm Miss Maya! Reading stories is pure magic music.`
        : v.id === "Leda"
        ? `Shh... Hello ${childName}. I am Story Weaver Luna. Cozy up for a soft bedtime tale.`
        : `Greetings adventurer ${childName}! I am Ranger Rex. Let's explore wild stories together!`;

    playAIVoice({
      text: samplePhrase,
      voice: v.id,
      mode: "story",
      childName,
      age: childAge,
      onEnd: () => setTestingVoice(null),
      onError: () => setTestingVoice(null),
    });
  };

  return (
    <div
      id="voice-selector-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="voice-selector-modal"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border-4 border-amber-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🎙️</span>
            <div>
              <h3 className="text-xl font-bold tracking-wide">Choose AI Voice</h3>
              <p className="text-xs text-amber-100 font-medium">
                High-quality real human sounding voices for {childName}
              </p>
            </div>
          </div>
          <button
            id="close-voice-modal-btn"
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition active:scale-95"
            aria-label="Close voice picker"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Voice List */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto bg-amber-50/50">
          {VOICE_OPTIONS.map((voice) => {
            const isSelected = selectedVoice === voice.id;
            const isPlaying = testingVoice === voice.id;

            return (
              <div
                key={voice.id}
                id={`voice-option-${voice.id}`}
                onClick={() => {
                  onSelectVoice(voice.id);
                  onClose();
                }}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border-2 transition cursor-pointer shadow-xs ${
                  isSelected
                    ? "bg-amber-100/90 border-amber-500 shadow-md ring-2 ring-amber-300"
                    : "bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-200/70 border border-amber-300 flex items-center justify-center text-2xl shadow-inner">
                    {voice.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 text-base">
                        {voice.name}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-900 font-semibold">{voice.role}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                      {voice.recommendedFor}
                    </p>
                  </div>
                </div>

                <button
                  id={`preview-voice-btn-${voice.id}`}
                  type="button"
                  onClick={(e) => handlePreviewVoice(voice, e)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs ${
                    isPlaying
                      ? "bg-pink-500 text-white animate-pulse"
                      : "bg-amber-200 hover:bg-amber-300 text-amber-900"
                  }`}
                  title="Test voice sample"
                >
                  <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-bounce" : ""}`} />
                  {isPlaying ? "Speaking..." : "Preview"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="p-3.5 bg-amber-100/80 border-t border-amber-200 text-center text-xs text-amber-900 font-medium flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Each niece can choose their own favorite storyteller voice anytime!</span>
        </div>
      </div>
    </div>
  );
}
