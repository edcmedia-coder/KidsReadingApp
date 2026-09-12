export type NieceId = 'ellee' | 'kaylee' | 'marlee';

export type ReadingVoiceId =
  | "Kore"
  | "Puck"
  | "Zephyr"
  | "Fenrir"
  | "Charon"
  | "Aoede"
  | "Leda"
  | "Orpheus";

export interface VoiceOption {
  id: ReadingVoiceId;
  name: string;
  role: string;
  personality: string;
  avatar: string;
  recommendedFor: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface NieceProfile {
  id: NieceId;
  name: string;
  age: number;
  stageTitle: string;
  readingFocus: string[];
  avatar: string;
  favoriteColor: string;
  gradient: string;
  accentBorder: string;
  themeName: string;
  defaultVoice: ReadingVoiceId;
  bio: string;
  stars: number;
  xp: number;
  readingLevel?: number;
  storiesReadCount: number;
  wordsLearnedCount: number;
  streakDays: number;
  earnedBadges: string[];
}

export interface ReadingLevelInfo {
  level: number;
  title: string;
  currentXp: number;
  levelMinXp: number;
  levelMaxXp: number;
  xpInCurrentLevel: number;
  xpNeededForLevel: number;
  progressPercent: number;
  badgeEmoji: string;
  nextLevelTitle: string;
}

export interface VocabularyWord {
  word: string;
  syllables: string;
  definition: string;
  emoji: string;
  soundOutGuide?: string;
  phonicsChunks?: string[];
  example?: string;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  encouragement: string;
}

export interface Story {
  id: string;
  title: string;
  emoji: string;
  targetNieceId: NieceId;
  targetAge: number;
  levelLabel: string;
  genre: string;
  colorScheme: {
    badgeBg: string;
    badgeText: string;
    cardBorder: string;
  };
  summary: string;
  paragraphs: {
    id: string;
    text: string;
  }[];
  vocabularyWords: VocabularyWord[];
  comprehensionQuestions: ComprehensionQuestion[];
  isCustomGenerated?: boolean;
}

export interface PhonicsCard {
  id: string;
  word: string;
  category: 'CVC & Short Vowels' | 'Blends & Digraphs' | 'Sight Words' | 'Multi-Syllable Power';
  targetAge: 7 | 10 | 11;
  syllables: string;
  phonicsChunks: string[];
  clue: string;
  emoji: string;
  exampleSentence: string;
}
