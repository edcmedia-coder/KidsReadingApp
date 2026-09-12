"use client";

import React, { useState, useEffect, useRef } from "react";
import { Story, ReadingVoiceId, NieceProfile } from "@/types/reading";
import { playAIVoice, stopAudio, sfx } from "@/lib/audio-player";
import { WordExplainerModal } from "./WordExplainerModal";
import confetti from "canvas-confetti";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Trophy,
  ArrowRight,
  BookOpen,
  VolumeX,
  Headphones,
} from "lucide-react";

interface Props {
  story: Story;
  profile: NieceProfile;
  voice: ReadingVoiceId;
  onStoryCompleted: (storyId: string, starsEarned: number) => void;
  onSelectAnotherStory: () => void;
  onOpenVoiceModal: () => void;
  onOpenAudiobookModal?: () => void;
}

export function StoryReader({
  story,
  profile,
  voice,
  onStoryCompleted,
  onSelectAnotherStory,
  onOpenVoiceModal,
  onOpenAudiobookModal,
}: Props) {
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const isPlayingStoryRef = useRef(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [fontSize, setFontSize] = useState<"md" | "lg" | "xl">("lg");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isExplainingWord, setIsExplainingWord] = useState(false);

  // Comprehension questions state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      isPlayingStoryRef.current = false;
      stopAudio();
    };
  }, []);

  const handlePlayWholeStory = async () => {
    if (isPlayingStory) {
      isPlayingStoryRef.current = false;
      stopAudio();
      setIsPlayingStory(false);
      setActiveParagraphIndex(null);
      return;
    }

    sfx.playPop();
    isPlayingStoryRef.current = true;
    setIsPlayingStory(true);

    // Read paragraphs sequentially
    for (let i = 0; i < story.paragraphs.length; i++) {
      if (!isPlayingStoryRef.current) break;

      setActiveParagraphIndex(i);
      const text = story.paragraphs[i].text;

      await new Promise<void>((resolve) => {
        playAIVoice({
          text,
          voice,
          mode: "story",
          childName: profile.name,
          age: profile.age,
          playbackRate: playbackSpeed,
          onEnd: () => resolve(),
          onError: () => resolve(),
        });
      });

      if (!isPlayingStoryRef.current) break;
    }

    if (isPlayingStoryRef.current) {
      setIsPlayingStory(false);
      isPlayingStoryRef.current = false;
      setActiveParagraphIndex(null);
      sfx.playSuccessFanfare();
    }
  };

  const handlePlayParagraph = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    isPlayingStoryRef.current = false;
    sfx.playPop();
    setActiveParagraphIndex(idx);
    setIsPlayingStory(true);

    playAIVoice({
      text: story.paragraphs[idx].text,
      voice,
      mode: "story",
      childName: profile.name,
      age: profile.age,
      playbackRate: playbackSpeed,
      onEnd: () => {
        setIsPlayingStory(false);
        setActiveParagraphIndex(null);
      },
      onError: () => {
        setIsPlayingStory(false);
        setActiveParagraphIndex(null);
      },
    });
  };

  const handleWordClick = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    isPlayingStoryRef.current = false;
    sfx.playPop();
    const cleanWord = word.replace(/[.,!?;:"'()]/g, "").trim();
    setSelectedWord(cleanWord);

    // Quick single-word pronunciation audio
    playAIVoice({
      text: cleanWord,
      voice,
      mode: "read",
      childName: profile.name,
      age: profile.age,
      playbackRate: playbackSpeed,
    });
  };

  const handleAnswerSelect = (questionIdx: number, optionIdx: number) => {
    sfx.playPop();
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleCheckQuiz = () => {
    setQuizSubmitted(true);
    let allCorrect = true;

    story.comprehensionQuestions.forEach((q, idx) => {
      if (userAnswers[idx] !== q.correctIndex) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      setQuizCompleted(true);
      sfx.playSuccessFanfare();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ec4899", "#f59e0b", "#10b981", "#8b5cf6"],
      });
      onStoryCompleted(story.id, 10);
    } else {
      sfx.playStarChime();
    }
  };

  const fontSizeClasses = {
    md: "text-base sm:text-lg leading-relaxed",
    lg: "text-lg sm:text-xl leading-relaxed tracking-wide",
    xl: "text-xl sm:text-2xl leading-loose tracking-wider",
  };

  const matchedVocab = (w: string) => {
    const clean = w.toLowerCase().replace(/[.,!?;:"'()]/g, "");
    return story.vocabularyWords.find((vw) => vw.word.toLowerCase() === clean);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 pb-14 sm:pb-8">
      {/* Story Header Card */}
      <div
        id="story-detail-card"
        className="rounded-2xl sm:rounded-3xl bg-white border-2 sm:border-3 border-amber-200 p-4 sm:p-6 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shadow-inner">
              {story.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${story.colorScheme.badgeBg} ${story.colorScheme.badgeText}`}
                >
                  {story.levelLabel}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                  {story.genre}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight mt-1">
                {story.title}
              </h1>
            </div>
          </div>

          <button
            id="back-to-library-btn"
            onClick={onSelectAnotherStory}
            className="self-start sm:self-auto text-xs font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition active:scale-95"
          >
            ← Stories Library
          </button>
        </div>

        {/* Audio Floating Controller Bar */}
        <div
          id="audio-controls-bar"
          className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 border-2 border-amber-200 flex flex-wrap items-center justify-between gap-3"
        >
          {/* Main Play / Pause Button */}
          <div className="flex items-center gap-2">
            <button
              id="story-play-all-btn"
              onClick={handlePlayWholeStory}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-md transition active:scale-95 ${
                isPlayingStory
                  ? "bg-pink-500 hover:bg-pink-600 text-white animate-pulse"
                  : "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-amber-950"
              }`}
            >
              {isPlayingStory ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause Story</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Read Story Aloud</span>
                </>
              )}
            </button>

            {isPlayingStory && (
              <button
                id="stop-story-btn"
                onClick={() => {
                  stopAudio();
                  setIsPlayingStory(false);
                  setActiveParagraphIndex(null);
                }}
                className="p-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                title="Stop Audio"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Speed & Voice Controls */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {onOpenAudiobookModal && (
              <button
                id="open-audiobook-mode-reader-btn"
                onClick={() => {
                  stopAudio();
                  setIsPlayingStory(false);
                  sfx.playPop();
                  onOpenAudiobookModal();
                }}
                className="px-3 py-1.5 rounded-xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 text-amber-300 hover:text-amber-200 border border-indigo-700 shadow-xs flex items-center gap-1.5 transition active:scale-95"
                title="Listen in Audiobook Mode with Ambient Soundscapes"
              >
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                <span>Audiobook Mode</span>
              </button>
            )}

            {/* Speed pills */}
            <div className="flex items-center bg-white rounded-xl p-1 border border-amber-200 shadow-xs">
              {[0.8, 1.0, 1.2].map((spd) => (
                <button
                  key={spd}
                  id={`speed-btn-${spd}`}
                  onClick={() => {
                    sfx.playPop();
                    setPlaybackSpeed(spd);
                  }}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    playbackSpeed === spd
                      ? "bg-amber-400 text-amber-950 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {spd === 0.8 ? "Slow" : spd === 1.0 ? "Normal" : "Fast"}
                </button>
              ))}
            </div>

            {/* Font size picker */}
            <div className="flex items-center bg-white rounded-xl p-1 border border-amber-200 shadow-xs">
              {(["md", "lg", "xl"] as const).map((sz) => (
                <button
                  key={sz}
                  id={`fontsize-btn-${sz}`}
                  onClick={() => {
                    sfx.playPop();
                    setFontSize(sz);
                  }}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    fontSize === sz
                      ? "bg-pink-400 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Text Size"
                >
                  {sz === "md" ? "A" : sz === "lg" ? "A+" : "A++"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tip helper banner */}
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 bg-amber-100/60 px-3 py-1.5 rounded-xl border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>Kid Tip:</strong> Tap <em>any single word</em> to hear Teacher Rosie sound it out, or tap the speaker button on any paragraph!
          </span>
        </div>

        {/* Story Text Book Layout */}
        <div className="mt-6 space-y-4 font-sans">
          {story.paragraphs.map((p, pIdx) => {
            const isParagraphActive = activeParagraphIndex === pIdx;
            const words = p.text.split(" ");

            return (
              <div
                key={p.id}
                id={`story-paragraph-${pIdx}`}
                className={`p-4 sm:p-5 rounded-2xl transition-all border-2 relative group ${
                  isParagraphActive
                    ? "bg-amber-100/80 border-amber-400 shadow-md ring-2 ring-amber-300"
                    : "bg-amber-50/30 hover:bg-amber-50/70 border-transparent hover:border-amber-200"
                }`}
              >
                {/* Paragraph Read Button */}
                <button
                  id={`read-paragraph-btn-${pIdx}`}
                  type="button"
                  onClick={(e) => handlePlayParagraph(pIdx, e)}
                  className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/80 hover:bg-amber-400 text-amber-800 hover:text-amber-950 flex items-center justify-center shadow-xs transition active:scale-90"
                  title="Read this paragraph"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Words with individual tap interactive wrappers */}
                <p className={`${fontSizeClasses[fontSize]} text-gray-800 select-none pr-8`}>
                  {words.map((w, wIdx) => {
                    const vocab = matchedVocab(w);
                    const isSelected =
                      selectedWord?.toLowerCase() ===
                      w.toLowerCase().replace(/[.,!?;:"'()]/g, "");

                    return (
                      <span
                        key={wIdx}
                        onClick={(e) => handleWordClick(w, e)}
                        className={`inline-block mr-1.5 px-1 py-0.5 rounded-lg cursor-pointer transition-all active:scale-95 ${
                          isSelected
                            ? "bg-amber-300 text-amber-950 font-bold underline"
                            : vocab
                            ? "bg-pink-100/90 text-pink-900 border-b-2 border-pink-400 font-semibold hover:bg-pink-200"
                            : "hover:bg-amber-200/60 hover:text-amber-950"
                        }`}
                        title={
                          vocab
                            ? `Power Word: ${vocab.definition}`
                            : "Tap to hear this word"
                        }
                      >
                        {w}
                        {vocab && (
                          <span className="text-[10px] ml-0.5 opacity-80">
                            {vocab.emoji}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Word Helper Banner (if a word is selected) */}
        {selectedWord && (
          <div
            id="selected-word-quick-bar"
            className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-pink-100 via-amber-100 to-purple-100 border-2 border-pink-300 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <div>
                <span className="text-xs font-bold text-gray-600 block uppercase">
                  Tapped Word
                </span>
                <span className="text-xl font-extrabold text-gray-900">
                  {selectedWord}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="open-word-wonder-lab-btn"
                onClick={() => {
                  sfx.playPop();
                  setIsExplainingWord(true);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Word Wonder Lab</span>
              </button>
            </div>
          </div>
        )}

        {/* Story Vocabulary Power Cards */}
        {story.vocabularyWords.length > 0 && (
          <div className="mt-8 border-t-2 border-amber-100 pt-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span>Story Power Words</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {story.vocabularyWords.map((vw) => (
                <div
                  key={vw.word}
                  id={`vocab-card-${vw.word}`}
                  onClick={() => {
                    setSelectedWord(vw.word);
                    setIsExplainingWord(true);
                  }}
                  className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 hover:border-amber-400 cursor-pointer transition active:scale-98 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-800 text-sm">
                      {vw.word}
                    </span>
                    <span className="text-lg">{vw.emoji}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                    {vw.syllables}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {vw.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comprehension Quiz Challenge */}
        {story.comprehensionQuestions.length > 0 && (
          <div
            id="comprehension-quiz-container"
            className="mt-8 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-3 border-purple-200 p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-extrabold text-purple-950">
                  Reading Detective Quest!
                </h3>
              </div>
              <span className="text-xs font-bold bg-purple-200 text-purple-900 px-3 py-1 rounded-full">
                Earn 10 Stars ⭐
              </span>
            </div>

            <p className="text-xs text-purple-800 mb-4">
              Let&apos;s see what you discovered in this story, {profile.name}!
            </p>

            <div className="space-y-4">
              {story.comprehensionQuestions.map((q, qIdx) => {
                const selectedOpt = userAnswers[qIdx];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = isAnswered && selectedOpt === q.correctIndex;

                return (
                  <div
                    key={qIdx}
                    id={`quiz-question-${qIdx}`}
                    className="p-4 rounded-2xl bg-white border border-purple-200 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <p className="text-sm font-bold text-gray-800">
                        {q.question}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-1.5 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        let optionStyles =
                          "bg-gray-50 border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-300";

                        if (isChosen) {
                          if (quizSubmitted) {
                            optionStyles =
                              optIdx === q.correctIndex
                                ? "bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-300"
                                : "bg-rose-100 border-rose-500 text-rose-950 font-bold";
                          } else {
                            optionStyles =
                              "bg-purple-100 border-purple-500 text-purple-950 font-bold ring-2 ring-purple-200";
                          }
                        } else if (quizSubmitted && optIdx === q.correctIndex) {
                          optionStyles =
                            "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold";
                        }

                        return (
                          <button
                            key={optIdx}
                            id={`quiz-q${qIdx}-opt${optIdx}`}
                            onClick={() => handleAnswerSelect(qIdx, optIdx)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs sm:text-sm font-medium transition active:scale-99 flex items-center justify-between ${optionStyles}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback message */}
                    {quizSubmitted && (
                      <div
                        className={`text-xs p-2.5 rounded-xl font-medium mt-2 flex items-center gap-2 ${
                          isCorrect
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>{q.encouragement}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Check answers button */}
            <div className="mt-5 text-center">
              {!quizCompleted ? (
                <button
                  id="check-quiz-answers-btn"
                  onClick={handleCheckQuiz}
                  disabled={
                    Object.keys(userAnswers).length <
                    story.comprehensionQuestions.length
                  }
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-extrabold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition active:scale-95"
                >
                  <span>Check My Answers! ✨</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 font-bold text-center space-y-2">
                  <p className="text-base">
                    🎉 Fantastic job, {profile.name}! You mastered this story!
                  </p>
                  <button
                    id="finish-story-next-btn"
                    onClick={onSelectAnotherStory}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition"
                  >
                    <span>Read Next Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Word Explainer Popup Modal */}
      {selectedWord && isExplainingWord && (
        <WordExplainerModal
          word={selectedWord}
          initialData={matchedVocab(selectedWord)}
          isOpen={isExplainingWord}
          onClose={() => setIsExplainingWord(false)}
          voice={voice}
          childName={profile.name}
          childAge={profile.age}
          onWordMastered={(w) => {
            // Already handled
          }}
        />
      )}
    </div>
  );
}
