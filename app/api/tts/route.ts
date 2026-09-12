import { NextRequest, NextResponse } from "next/server";
import { Modality } from "@google/genai";
import { getGenAI } from "@/lib/gemini";
import { pcmBase64ToWavDataUrl } from "@/lib/audio-utils";

// Server-side in-memory cache for audio WAV data URLs
const serverTtsCache = new Map<string, string>();
const MAX_CACHE_ITEMS = 500;

// Gemini TTS prebuilt voices
const GEMINI_TTS_VOICES: Record<string, string> = {
  Kore: "Kore",       // Teacher Rosie: Warm, soothing female storyteller
  Puck: "Puck",       // Storyteller Oliver: Playful, animated, cheerful
  Zephyr: "Zephyr",   // Coach Leo: Calm, gentle, friendly
  Fenrir: "Fenrir",   // Professor Penny: Deep, rich narrative voice
  Charon: "Charon",   // Captain Orion: Confident, steady, resonant
  Aoede: "Aoede",     // Miss Maya: Melodic, bright storyteller
  Leda: "Leda",       // Story Weaver Luna: Soft, cozy bedtime tone
  Orpheus: "Orpheus", // Ranger Rex: Bold, adventurous explorer
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      voice = "Kore",
      childName = "Ellee",
      age = 7,
    } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required for speech synthesis" },
        { status: 400 }
      );
    }

    const cleanText = text.trim();
    const geminiVoice = GEMINI_TTS_VOICES[voice] || "Kore";
    const cacheKey = `${geminiVoice}:${cleanText.toLowerCase()}`;

    // Return cached audio immediately if available
    if (serverTtsCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        audioUrl: serverTtsCache.get(cacheKey),
        voice: geminiVoice,
        text: cleanText,
        cached: true,
      });
    }

    const ai = getGenAI();

    let pcmBase64: string | undefined = undefined;
    let isQuotaExceeded = false;
    let errorMessage = "";

    // Sequential candidate models to guarantee Gemini native premium voice output
    const candidateModels = [
      "gemini-2.5-flash-preview-tts",
      "gemini-3.1-flash-tts-preview",
      "gemini-flash-latest",
    ];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ parts: [{ text: cleanText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: geminiVoice },
              },
            },
          },
        });

        if (response.candidates && response.candidates.length > 0) {
          for (const candidate of response.candidates) {
            for (const part of candidate.content?.parts || []) {
              if (part.inlineData?.data) {
                pcmBase64 = part.inlineData.data;
                break;
              }
            }
            if (pcmBase64) break;
          }
        }

        if (pcmBase64) {
          break; // Successfully synthesized audio
        }
      } catch (err: any) {
        errorMessage = err?.message || String(err);
        if (
          err?.status === 429 ||
          errorMessage.includes("429") ||
          errorMessage.includes("RESOURCE_EXHAUSTED")
        ) {
          isQuotaExceeded = true;
        }
      }
    }

    if (!pcmBase64) {
      return NextResponse.json({
        success: false,
        fallback: true,
        quotaExceeded: isQuotaExceeded,
        voice: geminiVoice,
        text: cleanText,
        error: errorMessage || "Gemini TTS voice generation returned empty audio",
      });
    }

    // Convert raw 24kHz PCM to standard playable WAV data URL
    const audioUrl = pcmBase64ToWavDataUrl(pcmBase64, 24000);

    // Save to server-side cache
    if (serverTtsCache.size >= MAX_CACHE_ITEMS) {
      const firstKey = serverTtsCache.keys().next().value;
      if (firstKey) serverTtsCache.delete(firstKey);
    }
    serverTtsCache.set(cacheKey, audioUrl);

    return NextResponse.json({
      success: true,
      audioUrl,
      voice: geminiVoice,
      text: cleanText,
      quotaExceeded: false,
    });
  } catch (error: any) {
    const isQuota = error?.status === 429 || String(error?.message).includes("429");
    return NextResponse.json({
      success: false,
      fallback: true,
      quotaExceeded: isQuota,
      message: "AI Voice synthesis error",
    });
  }
}
