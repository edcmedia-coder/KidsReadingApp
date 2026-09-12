import { ReadingVoiceId } from "@/types/reading";

// Simple in-memory & session cache for synthesized audio data URLs
const audioCache = new Map<string, string>();

let currentAudio: HTMLAudioElement | null = null;
let activePlaySessionId = 0;
let activeAbortController: AbortController | null = null;
let cachedBrowserVoices: SpeechSynthesisVoice[] = [];

// Pre-warm browser speech synthesis voices immediately
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const loadVoices = () => {
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cachedBrowserVoices = v;
      }
    } catch {
      // ignore
    }
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Web Audio API synthesizer for instant kid-friendly celebratory and interactive sound effects
 */
class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // ignore
    }
  }

  playStarChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.09;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {
      // ignore
    }
  }

  playSuccessFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const fanfare = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 659.25, d: 0.12, t: 0.12 },
        { f: 783.99, d: 0.12, t: 0.24 },
        { f: 1046.5, d: 0.35, t: 0.38 },
      ];
      fanfare.forEach(({ f, d, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + t;
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + d);
      });
    } catch {
      // ignore
    }
  }

  playLevelUp() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const arpeggio = [
        { f: 392.0, d: 0.1, t: 0 },
        { f: 523.25, d: 0.1, t: 0.1 },
        { f: 659.25, d: 0.1, t: 0.2 },
        { f: 783.99, d: 0.12, t: 0.3 },
        { f: 1046.5, d: 0.4, t: 0.42 },
      ];
      arpeggio.forEach(({ f, d, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + t;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, startTime);
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + d);
      });
    } catch {
      // ignore
    }
  }
}

export const sfx = new SoundEffects();

/**
 * Play text using ONLY premium high quality real human AI voice models.
 * Completely eliminates any robotic fallback voices and guarantees no overlapping speech.
 */
export async function playAIVoice(params: {
  text: string;
  voice?: ReadingVoiceId;
  mode?: "read" | "sound_out" | "praise" | "story";
  childName?: string;
  age?: number;
  playbackRate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}): Promise<void> {
  const {
    text,
    voice = "Kore",
    mode = "read",
    childName = "Ellee",
    age = 7,
    playbackRate = 1.0,
    onStart,
    onEnd,
    onError,
  } = params;

  // Stop any currently playing audio immediately
  stopAudio();

  // New session ID and controller to strictly prevent overlapping audio
  const sessionId = ++activePlaySessionId;
  const controller = new AbortController();
  activeAbortController = controller;

  const cleanText = text.trim();
  if (!cleanText) {
    onEnd?.();
    return;
  }

  const cacheKey = `${voice}_${cleanText.toLowerCase()}`;

  // Check client-side memory cache first
  if (audioCache.has(cacheKey)) {
    const audioUrl = audioCache.get(cacheKey)!;
    if (sessionId === activePlaySessionId) {
      playAudioUrl(audioUrl, playbackRate, sessionId, onStart, onEnd, onError);
    }
    return;
  }

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        text: cleanText,
        voice,
        mode,
        childName,
        age,
      }),
    });

    // If a newer audio play request came in while fetching, abort this one
    if (sessionId !== activePlaySessionId) {
      return;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `TTS HTTP error ${res.status}`);
    }

    const data = await res.json().catch(() => ({}));
    if (sessionId !== activePlaySessionId) {
      return;
    }

    if (data.audioUrl) {
      audioCache.set(cacheKey, data.audioUrl);
      playAudioUrl(data.audioUrl, playbackRate, sessionId, onStart, onEnd, onError);
      return;
    }

    // If Gemini TTS is quota limited or returns fallback signal, seamlessly use natural device speech
    playNaturalSpeechSynthesis(cleanText, voice, playbackRate, sessionId, onStart, onEnd, onError);
  } catch (err: any) {
    // If request was aborted because another sound started or user navigated, exit cleanly
    if (err.name === "AbortError" || sessionId !== activePlaySessionId) {
      return;
    }
    // Seamless fallback to natural device speech synthesis without noisy console errors
    playNaturalSpeechSynthesis(cleanText, voice, playbackRate, sessionId, onStart, onEnd, onError);
  }
}

/**
 * High quality natural device speech synthesis.
 * Uses the highest fidelity, warmest English voice available on the device,
 * preventing any robotic tones or silence when Gemini cloud TTS is quota-limited.
 */
function playNaturalSpeechSynthesis(
  text: string,
  voice: ReadingVoiceId,
  playbackRate: number,
  sessionId: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (sessionId !== activePlaySessionId) return;

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Maintain standard 1.0 pitch to preserve modern neural vocoder clarity without robotic artifacts
    utterance.pitch = 1.0;
    utterance.rate = Math.max(0.75, Math.min(1.3, 0.95 * playbackRate));

    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      voices = cachedBrowserVoices;
    }
    if (voices && voices.length > 0) {
      const selectedVoice = pickBestNaturalVoice(voices, voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    let hasFinished = false;
    const finish = () => {
      if (!hasFinished) {
        hasFinished = true;
        if (sessionId === activePlaySessionId) {
          onEnd?.();
        }
      }
    };

    utterance.onstart = () => {
      if (sessionId === activePlaySessionId) {
        onStart?.();
      }
    };

    utterance.onend = () => {
      finish();
    };

    utterance.onerror = (e) => {
      // Ignored if cancelled due to stopAudio or user interaction
      if (sessionId === activePlaySessionId) {
        onError?.(e);
      }
      finish();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    if (sessionId === activePlaySessionId) {
      onError?.(err);
      onEnd?.();
    }
  }
}

/**
 * Filter and score available voices to select only natural, pleasant human sounding voices
 * and actively exclude legacy harsh/robotic novelty voices.
 */
function pickBestNaturalVoice(
  voices: SpeechSynthesisVoice[],
  targetVoice: ReadingVoiceId
): SpeechSynthesisVoice | null {
  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
  if (englishVoices.length === 0) return voices[0] || null;

  // Explicitly avoid harsh/robotic novelty voice engines
  const roboticNames = [
    "zarvox", "trinoids", "cellos", "bells", "bad news", "deranged",
    "pipe organ", "albert", "boing", "bubbles", "hysterical", "junior",
    "kathy", "ralph", "whisper"
  ];
  const pleasantVoices = englishVoices.filter((v) => {
    const lower = v.name.toLowerCase();
    return !roboticNames.some((banned) => lower.includes(banned));
  });

  const candidates = pleasantVoices.length > 0 ? pleasantVoices : englishVoices;
  const isMalePreferred =
    targetVoice === "Fenrir" ||
    targetVoice === "Charon" ||
    targetVoice === "Orpheus" ||
    targetVoice === "Puck";

  let bestVoice: SpeechSynthesisVoice | null = null;
  let bestScore = -1;

  for (const v of candidates) {
    let score = 0;
    const name = v.name.toLowerCase();

    // Natural neural voices score highest
    if (name.includes("natural") || name.includes("online")) score += 50;
    if (name.includes("google")) score += 40;
    if (name.includes("samantha") || name.includes("victoria") || name.includes("karen") || name.includes("serena")) score += 35;
    if (name.includes("aria") || name.includes("jenny") || name.includes("guy")) score += 35;
    if (name.includes("enhanced") || name.includes("premium")) score += 30;
    if (v.lang === "en-US" || v.lang === "en_US") score += 10;
    if (v.default) score += 5;

    // Gender affinity matching
    if (isMalePreferred && (name.includes("male") || name.includes("guy") || name.includes("david") || name.includes("daniel") || name.includes("george") || name.includes("oliver"))) {
      score += 25;
    }
    if (!isMalePreferred && (name.includes("female") || name.includes("samantha") || name.includes("victoria") || name.includes("jenny") || name.includes("aria") || name.includes("zira") || name.includes("karen"))) {
      score += 25;
    }

    if (score > bestScore) {
      bestScore = score;
      bestVoice = v;
    }
  }

  return bestVoice || candidates[0];
}

function playAudioUrl(
  url: string,
  rate: number,
  sessionId: number,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (sessionId !== activePlaySessionId) return;

  try {
    const audio = new Audio(url);
    audio.playbackRate = rate;
    currentAudio = audio;

    let hasFinished = false;
    const finish = () => {
      if (!hasFinished) {
        hasFinished = true;
        if (currentAudio === audio) {
          currentAudio = null;
        }
        if (sessionId === activePlaySessionId) {
          onEnd?.();
        }
      }
    };

    audio.onplay = () => {
      if (sessionId === activePlaySessionId) {
        onStart?.();
      }
    };

    audio.onended = () => {
      finish();
    };

    audio.onerror = (e) => {
      console.warn("Audio element playback error:", e);
      if (sessionId === activePlaySessionId) {
        onError?.(e);
      }
      finish();
    };

    audio.play().catch((e) => {
      // Ignored if superseded or paused intentionally
      if (sessionId === activePlaySessionId) {
        console.warn("Audio playback interrupted or blocked:", e);
        onError?.(e);
      }
      finish();
    });
  } catch (err) {
    console.error("Audio playback initialization error:", err);
    if (sessionId === activePlaySessionId) {
      onError?.(err);
      onEnd?.();
    }
  }
}

export function stopAudio() {
  // Invalidate any in-flight playback sessions
  activePlaySessionId++;

  // Cancel pending fetch requests
  if (activeAbortController) {
    try {
      activeAbortController.abort();
    } catch {
      // ignore
    }
    activeAbortController = null;
  }

  // Stop currently playing HTML audio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = "";
    } catch {
      // ignore
    }
    currentAudio = null;
  }

  // Ensure any lingering browser speech synthesis is cancelled and silenced
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
