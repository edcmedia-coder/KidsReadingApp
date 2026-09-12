"use client";

import React, { useState, useEffect, useRef } from "react";
import { NieceProfile, ReadingVoiceId } from "@/types/reading";
import { playAIVoice, sfx } from "@/lib/audio-player";
import confetti from "canvas-confetti";
import { Mic, MicOff, Volume2, Sparkles, Star, RefreshCw, CheckCircle } from "lucide-react";

interface Props {
  profile: NieceProfile;
  voice: ReadingVoiceId;
  onStarsEarned: (count: number) => void;
}

export function ReadAloudPractice({ profile, voice, onStarsEarned }: Props) {
  const practiceSentencesByAge = {
    ellee: [
      "The fluffy cat sat on a bright yellow mat.",
      "Bobo the bouncy puppy loves to run in the sun.",
      "Pip the butterfly has pink and gold wings.",
      "Can you see the big red ship on blue water?",
    ],
    kaylee: [
      "Kaylee climbed up into the secret treehouse fort.",
      "The courageous dolphin leaped high into the starlight.",
      "She turned the golden cipher dial until it made a crisp click.",
      "Glowing neon sparkles danced across Emerald Cove.",
    ],
    marlee: [
      "The brass dials of the spectrograph hummed in the dark dome.",
      "Marlee discovered a melodic cadence in the distant constellation.",
      "The ancient sea captain's journal held secrets from 1842.",
      "Curious minds uncover the magnificent symphony of the stars.",
    ],
  };

  const sentences =
    practiceSentencesByAge[profile.id] || practiceSentencesByAge.ellee;

  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<{
    accuracy: number;
    message: string;
  } | null>(null);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(true);

  const recognitionRef = useRef<any>(null);
  const targetSentence = sentences[sentenceIndex];
  const targetWords = targetSentence.split(" ");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        const timer = setTimeout(() => setHasSpeechRecognition(false), 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);


  const handleHearSentence = () => {
    sfx.playPop();
    playAIVoice({
      text: targetSentence,
      voice,
      mode: "read",
      childName: profile.name,
      age: profile.age,
      playbackRate: 0.9,
    });
  };

  const handleStartListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition isn't supported in this browser, but you can listen and read along with Teacher Rosie!");
      return;
    }

    sfx.playPop();
    setTranscript("");
    setFeedback(null);

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    sfx.playPop();
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Evaluate how many target words were spoken
    const cleanSpoken = transcript
      .toLowerCase()
      .replace(/[.,!?;:"'()]/g, "")
      .split(/\s+/);

    let matchCount = 0;
    targetWords.forEach((tw) => {
      const cleanTarget = tw.toLowerCase().replace(/[.,!?;:"'()]/g, "");
      if (cleanSpoken.includes(cleanTarget)) {
        matchCount++;
      }
    });

    const accuracy = Math.min(
      100,
      Math.round((matchCount / targetWords.length) * 100)
    );

    const friendlyMessage =
      accuracy >= 80
        ? `Incredible reading, ${profile.name}! You sounded so clear and confident!`
        : accuracy >= 50
        ? `Great effort, ${profile.name}! You got ${matchCount} words spot on! Keep going!`
        : `Good try, ${profile.name}! Listen to Teacher Rosie once and try again!`;

    setFeedback({
      accuracy,
      message: friendlyMessage,
    });

    if (accuracy >= 60) {
      sfx.playSuccessFanfare();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#ec4899"],
      });
      onStarsEarned(5);

      // Play praise voice
      playAIVoice({
        text: friendlyMessage,
        voice,
        mode: "praise",
        childName: profile.name,
        age: profile.age,
      });
    } else {
      sfx.playStarChime();
    }
  };

  const handleNextSentence = () => {
    sfx.playPop();
    setTranscript("");
    setFeedback(null);
    setSentenceIndex((prev) => (prev + 1) % sentences.length);
  };

  const isWordSpoken = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:"'()]/g, "");
    return transcript
      .toLowerCase()
      .replace(/[.,!?;:"'()]/g, "")
      .split(/\s+/)
      .includes(cleanWord);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-14 sm:pb-8">
      {/* Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-teal-400 via-emerald-500 to-cyan-500 p-4 sm:p-6 text-white shadow-md text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Mic className="w-3.5 h-3.5 text-yellow-200" />
            <span>Read Aloud Practice Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Read Out Loud to the AI Tutor!
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 font-medium max-w-md mx-auto">
            Speak clearly into your microphone. Watch the words light up in green
            as you say them!
          </p>
        </div>
        <div className="absolute -right-4 -bottom-6 text-8xl opacity-25 select-none">
          🎙️
        </div>
      </div>

      {/* Target Reading Card */}
      <div
        id="read-aloud-stage"
        className="rounded-2xl sm:rounded-3xl bg-white border-3 sm:border-4 border-amber-300 p-4 sm:p-7 shadow-lg space-y-4 sm:space-y-6 text-center"
      >
        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
          <span>
            Sentence {sentenceIndex + 1} of {sentences.length}
          </span>
          <button
            id="hear-model-sentence-btn"
            onClick={handleHearSentence}
            className="flex items-center gap-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-teal-600" />
            <span>Hear AI Read First</span>
          </button>
        </div>

        {/* Big Target Words Display */}
        <div className="p-6 rounded-3xl bg-amber-50/70 border-2 border-amber-200 min-h-[120px] flex items-center justify-center flex-wrap gap-2">
          {targetWords.map((word, idx) => {
            const spoken = isWordSpoken(word);

            return (
              <span
                key={idx}
                id={`target-word-${idx}`}
                className={`text-xl sm:text-3xl font-extrabold px-2 py-1 rounded-xl transition-all duration-300 ${
                  spoken
                    ? "bg-emerald-400 text-white shadow-md scale-105"
                    : "text-gray-800 bg-white border border-amber-200"
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Live speech feedback display */}
        {isListening && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 font-semibold animate-pulse flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>Listening to {profile.name}... &quot;{transcript || "Speak clearly..."}&quot;</span>
          </div>
        )}

        {/* Recording Buttons */}
        <div className="flex items-center justify-center gap-3">
          {!isListening ? (
            <button
              id="start-mic-reading-btn"
              type="button"
              onClick={handleStartListening}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-base shadow-lg hover:shadow-xl flex items-center gap-2.5 active:scale-95 transition"
            >
              <Mic className="w-5 h-5" />
              <span>Tap to Start Reading! 🎙️</span>
            </button>
          ) : (
            <button
              id="stop-mic-reading-btn"
              type="button"
              onClick={handleStopListening}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base shadow-lg animate-pulse flex items-center gap-2.5 active:scale-95 transition"
            >
              <CheckCircle className="w-5 h-5" />
              <span>I&apos;m Finished! ✨</span>
            </button>
          )}

          <button
            id="next-practice-sentence-btn"
            type="button"
            onClick={handleNextSentence}
            className="p-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition active:scale-95"
            title="Try another sentence"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Results / Feedback Card */}
        {feedback && (
          <div
            id="reading-accuracy-result-card"
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 text-center space-y-2 animate-in fade-in"
          >
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-500" />
              <span className="text-lg font-black text-emerald-950">
                {feedback.accuracy}% Match!
              </span>
            </div>
            <p className="text-sm font-bold text-emerald-800">
              {feedback.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
