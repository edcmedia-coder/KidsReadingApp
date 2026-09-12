import { NextRequest, NextResponse } from "next/server";
import { Type } from "@google/genai";
import { getGenAI } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const ai = getGenAI();

    if (action === "generate_story") {
      const {
        childName = "Ellee",
        age = 7,
        topic = "magic animal adventure",
        length = "short",
      } = body;

      const ageInstruction =
        age <= 7
          ? "Target reading age 7 (Grade 1-2). Write a long, immersive story with 6 to 8 paragraphs. Use decodable sight words, clear sentence flow, fun character dialogue, and exciting puppy or magic animal moments."
          : age <= 10
          ? "Target reading age 10 (Grade 4-5). Write an exciting long adventure with 6 to 8 paragraphs. Rich plot developments, multi-syllable vocabulary, mystery clues, character dialogue, and satisfying resolution."
          : "Target reading age 11 (Grade 5-6). Write an intricate long chapter story with 6 to 8 paragraphs. Sophisticated vocabulary, vivid sensory descriptions, thought-provoking themes, expressive dialogue, and chapter pacing.";

      const prompt = `Generate a long, highly captivating, multi-paragraph children's story specifically for ${childName}, who is ${age} years old.
Theme/Topic: ${topic}.
${ageInstruction}
MUST include at least 6 to 8 distinct, well-written paragraphs in the 'paragraphs' array.
Tailor the vocabulary and phonics complexity specifically to age ${age}.`;

      let responseText = "";
      const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-2.5-flash"];
      let lastErr = null;

      for (const modelName of candidateModels) {
        try {
          const res = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: `You are an expert elementary reading specialist and children's book author. Return valid JSON only with 6 to 8 paragraphs in the story.`,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                  readingLevel: { type: Type.STRING },
                  storyText: { type: Type.STRING },
                  paragraphs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                      },
                      required: ["id", "text"],
                    },
                  },
                  vocabularyWords: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        word: { type: Type.STRING },
                        syllables: { type: Type.STRING },
                        definition: { type: Type.STRING },
                        emoji: { type: Type.STRING },
                      },
                      required: ["word", "syllables", "definition", "emoji"],
                    },
                  },
                  comprehensionQuestions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        correctIndex: { type: Type.INTEGER },
                        encouragement: { type: Type.STRING },
                      },
                      required: ["question", "options", "correctIndex", "encouragement"],
                    },
                  },
                },
                required: [
                  "title",
                  "emoji",
                  "readingLevel",
                  "storyText",
                  "paragraphs",
                  "vocabularyWords",
                  "comprehensionQuestions",
                ],
              },
            },
          });
          if (res.text) {
            responseText = res.text;
            break;
          }
        } catch (err) {
          lastErr = err;
        }
      }

      if (!responseText) {
        throw lastErr || new Error("Failed to generate story from AI models");
      }

      const parsed = JSON.parse(responseText || "{}");
      return NextResponse.json({ success: true, data: parsed });
    }

    if (action === "explain_word") {
      const { word, childName = "Reader", age = 7 } = body;
      if (!word) {
        return NextResponse.json({ error: "Word is required" }, { status: 400 });
      }

      const prompt = `Help ${childName} (age ${age}) learn the word "${word}". 
Provide:
1. Syllable breakdown with hyphens (e.g., won-der-ful)
2. Phonics sound-out tips (how to sound it out chunk by chunk)
3. A super simple, memorable definition a ${age}-year-old will instantly understand
4. A fun, relatable example sentence
5. A rhyming word or sound-alike word
6. A representative emoji`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              syllables: { type: Type.STRING },
              phonicsChunks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              soundOutGuide: { type: Type.STRING },
              simpleDefinition: { type: Type.STRING },
              funSentence: { type: Type.STRING },
              rhymesWith: { type: Type.STRING },
              emoji: { type: Type.STRING },
            },
            required: [
              "word",
              "syllables",
              "phonicsChunks",
              "soundOutGuide",
              "simpleDefinition",
              "funSentence",
              "emoji",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return NextResponse.json({ success: true, data: parsed });
    }

    if (action === "analyze_reading") {
      const { targetText, spokenText, childName = "Reader", age = 7 } = body;

      const prompt = `A ${age}-year-old child named ${childName} read this target text:
"${targetText}"
The speech recognition heard:
"${spokenText}"
Compare them gently. Provide:
1. Accuracy percentage estimate (0-100)
2. Words read beautifully
3. Words that were skipped or tricky to practice
4. Warm, joyful, constructive encouragement praising effort!`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              accuracyPercent: { type: Type.INTEGER },
              wordsPraised: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              wordsToPractice: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              coachMessage: { type: Type.STRING },
              starsAwarded: { type: Type.INTEGER },
            },
            required: [
              "accuracyPercent",
              "wordsPraised",
              "wordsToPractice",
              "coachMessage",
              "starsAwarded",
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return NextResponse.json({ success: true, data: parsed });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Reading Assistant Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process reading assistant request" },
      { status: 500 }
    );
  }
}
