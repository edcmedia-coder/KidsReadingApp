import { NieceProfile, Story, VoiceOption, PhonicsCard, Badge, ReadingLevelInfo } from "@/types/reading";

export function getReadingLevelInfo(xp: number = 0): ReadingLevelInfo {
  const levels = [
    { level: 1, title: "Rising Reader", minXp: 0, maxXp: 150, emoji: "🐣" },
    { level: 2, title: "Phonics Explorer", minXp: 150, maxXp: 350, emoji: "🔍" },
    { level: 3, title: "Sentence Star", minXp: 350, maxXp: 650, emoji: "🌟" },
    { level: 4, title: "Story Detective", minXp: 650, maxXp: 1050, emoji: "🕵️‍♀️" },
    { level: 5, title: "Word Wizard", minXp: 1050, maxXp: 1550, emoji: "🪄" },
    { level: 6, title: "Chapter Ace", minXp: 1550, maxXp: 2200, emoji: "📚" },
    { level: 7, title: "Master Storyteller", minXp: 2200, maxXp: 3000, emoji: "🏰" },
    { level: 8, title: "Literary Legend", minXp: 3000, maxXp: 4000, emoji: "👑" },
  ];

  let current = levels[0];
  let next = levels[1];

  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].minXp && (i === levels.length - 1 || xp < levels[i + 1].minXp)) {
      current = levels[i];
      next = levels[i + 1] || {
        level: levels[i].level + 1,
        title: "Grand Scholar",
        minXp: levels[i].maxXp,
        maxXp: levels[i].maxXp + 1000,
        emoji: "🏆",
      };
      break;
    }
  }

  const xpInCurrentLevel = Math.max(0, xp - current.minXp);
  const xpNeededForLevel = current.maxXp - current.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)));

  return {
    level: current.level,
    title: current.title,
    currentXp: xp,
    levelMinXp: current.minXp,
    levelMaxXp: current.maxXp,
    xpInCurrentLevel,
    xpNeededForLevel,
    progressPercent,
    badgeEmoji: current.emoji,
    nextLevelTitle: next.title,
  };
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "Kore",
    name: "Teacher Rosie",
    role: "Warm Reading Specialist",
    personality: "Gentle, super clear, patient & maternal",
    avatar: "👩‍🏫",
    recommendedFor: "Best for Ellee (Age 7) & Phonics sounding out",
  },
  {
    id: "Puck",
    name: "Storyteller Oliver",
    role: "Animated Character Voice",
    personality: "Playful, theatrical, joyful & energetic",
    avatar: "🎭",
    recommendedFor: "Fun story-time and humorous dialogue",
  },
  {
    id: "Zephyr",
    name: "Coach Leo",
    role: "Encouraging Reading Cheerleader",
    personality: "Upbeat, lively, high-fives and positive vibes",
    avatar: "🦁",
    recommendedFor: "Best for Kaylee (Age 10) & reading confidence",
  },
  {
    id: "Fenrir",
    name: "Professor Penny",
    role: "Expressive Narrative Guide",
    personality: "Articulate, rich, soothing & atmospheric",
    avatar: "🦉",
    recommendedFor: "Best for Marlee (Age 11) & chapter mysteries",
  },
  {
    id: "Charon",
    name: "Captain Orion",
    role: "Deep Space & Mystery Explorer",
    personality: "Steady, confident, calm & commanding",
    avatar: "🚀",
    recommendedFor: "Sci-fi adventures & deep space mysteries",
  },
  {
    id: "Aoede",
    name: "Miss Maya",
    role: "Melodic Rhyme & Phonics Singer",
    personality: "Cheerful, musical, expressive & bright",
    avatar: "🎵",
    recommendedFor: "Rhyming word games & phonics lab",
  },
  {
    id: "Leda",
    name: "Story Weaver Luna",
    role: "Tranquil Bedtime Reader",
    personality: "Soft, soothing, quiet & peaceful",
    avatar: "🌙",
    recommendedFor: "Evening reading & quiet bedtime stories",
  },
  {
    id: "Orpheus",
    name: "Ranger Rex",
    role: "Wilderness Expedition Guide",
    personality: "Bold, curious, enthusiastic & outdoor lover",
    avatar: "🏕️",
    recommendedFor: "Nature exploration & outdoor adventures",
  },
];

export const INITIAL_PROFILES: Record<string, NieceProfile> = {
  ellee: {
    id: "ellee",
    name: "Ellee",
    age: 7,
    stageTitle: "Early Explorer & Phonics Star",
    readingFocus: [
      "Sounding out letters & blends",
      "Short vowel CVC words (cat, sun, hop)",
      "High-frequency sight words",
      "Read-along confidence with pictures",
    ],
    avatar: "🦄",
    favoriteColor: "from-pink-500 to-rose-400",
    gradient: "bg-gradient-to-br from-pink-400 via-rose-300 to-amber-200",
    accentBorder: "border-pink-300",
    themeName: "Cotton Candy Carnival",
    defaultVoice: "Kore",
    bio: "Ellee loves unicorns, fluffy animals, sparkly rhymes, and sounding out big new words with pride!",
    stars: 35,
    xp: 220,
    readingLevel: 2,
    storiesReadCount: 4,
    wordsLearnedCount: 18,
    streakDays: 3,
    earnedBadges: ["star_starter", "phonics_champ", "animal_lover"],
  },
  kaylee: {
    id: "kaylee",
    name: "Kaylee",
    age: 10,
    stageTitle: "Adventure Detective & Fluent Reader",
    readingFocus: [
      "Multi-syllable word chunking",
      "Prefixes and suffixes (un-, re-, -ful)",
      "Reading rhythm & expressive dialogue",
      "Solving comprehension clue riddles",
    ],
    avatar: "🐬",
    favoriteColor: "from-emerald-500 to-teal-400",
    gradient: "bg-gradient-to-br from-emerald-400 via-teal-300 to-cyan-200",
    accentBorder: "border-emerald-300",
    themeName: "Emerald Explorer",
    defaultVoice: "Zephyr",
    bio: "Kaylee loves secret treehouses, mysterious clues, dolphins, soccer, and reading books that keep her guessing!",
    stars: 62,
    xp: 780,
    readingLevel: 4,
    storiesReadCount: 8,
    wordsLearnedCount: 42,
    streakDays: 5,
    earnedBadges: ["star_starter", "syllable_sleuth", "bookworm_5", "mystery_solver"],
  },
  marlee: {
    id: "marlee",
    name: "Marlee",
    age: 11,
    stageTitle: "Master Storyteller & Chapter Ace",
    readingFocus: [
      "Advanced vocabulary & idioms",
      "Reading with emotion and character voices",
      "Inference & deep comprehension",
      "Creative storytelling & world-building",
    ],
    avatar: "🚀",
    favoriteColor: "from-purple-600 to-indigo-500",
    gradient: "bg-gradient-to-br from-purple-500 via-indigo-400 to-amber-200",
    accentBorder: "border-purple-300",
    themeName: "Starlight Galaxy",
    defaultVoice: "Fenrir",
    bio: "Marlee is the big sister ace reader who loves astronomy, sci-fi inventions, epic quests, and expressive chapter novels!",
    stars: 94,
    xp: 1680,
    readingLevel: 6,
    storiesReadCount: 14,
    wordsLearnedCount: 85,
    streakDays: 7,
    earnedBadges: ["star_starter", "chapter_champ", "vocab_virtuoso", "streak_7", "super_speaker"],
  },
};

export const BADGES_LIST: Badge[] = [
  {
    id: "star_starter",
    title: "First Reader Star",
    description: "Read your very first story in the app!",
    icon: "⭐",
  },
  {
    id: "phonics_champ",
    title: "Phonics Champion",
    description: "Sounded out 10 words chunk by chunk!",
    icon: "🔤",
  },
  {
    id: "syllable_sleuth",
    title: "Syllable Sleuth",
    description: "Tapped and chunked 5 multi-syllable puzzle words!",
    icon: "🔍",
  },
  {
    id: "vocab_virtuoso",
    title: "Word Wizard",
    description: "Discovered and mastered 20 new power words!",
    icon: "🪄",
  },
  {
    id: "chapter_champ",
    title: "Chapter Ace",
    description: "Completed full comprehension questions without missing a clue!",
    icon: "🏆",
  },
  {
    id: "streak_7",
    title: "7-Day Reading Fire",
    description: "Practiced reading 7 days in a row!",
    icon: "🔥",
  },
  {
    id: "story_maker",
    title: "AI Story Creator",
    description: "Created your own personalized story with Uncle!",
    icon: "✨",
  },
];

export const CURATED_STORIES: Story[] = [
  // ELLE'S STORIES (Age 7)
  {
    id: "ellee-marshmallow-pup",
    title: "Ellee & the Bouncy Marshmallow Pup",
    emoji: "🐶",
    targetNieceId: "ellee",
    targetAge: 7,
    levelLabel: "Level 1: Phonics & Sight Words",
    genre: "Silly Animal Tale",
    colorScheme: {
      badgeBg: "bg-pink-100",
      badgeText: "text-pink-700",
      cardBorder: "border-pink-300",
    },
    summary: "Ellee finds a puppy that bounces like a fluffy white marshmallow across the sunny yard on a magical morning!",
    paragraphs: [
      {
        id: "p1",
        text: "One bright sunny morning, Ellee put on her pink sneakers and opened her front door. A small white puppy sat on the green grass right by the porch steps.",
      },
      {
        id: "p2",
        text: "The puppy was round, fluffy, and white like a giant sweet marshmallow! He tilted his tiny head and let out a friendly little 'Yip!'",
      },
      {
        id: "p3",
        text: "Boing! The puppy jumped high into the air like a rubber ball. He spun around in a silly circle and landed back on his paws with a happy wag.",
      },
      {
        id: "p4",
        text: "'Oh my goodness!' laughed Ellee. 'You are not a normal puppy. You are a bouncy marshmallow pup!'",
      },
      {
        id: "p5",
        text: "Ellee found a bright red ball in her pocket and tossed it across the yard. The puppy went tap, tap, tap on his little paws as he zipped over the yellow flowers.",
      },
      {
        id: "p6",
        text: "He caught the ball right in his mouth! Then he bounced back over the sandbox and gently dropped the red ball right onto Ellee's shoe.",
      },
      {
        id: "p7",
        text: "Ellee gave the puppy a soft pat on his fluffy white head. 'I will name you Bobo,' she smiled big. 'We are going to be best friends and read stories together every single day!'",
      },
    ],
    vocabularyWords: [
      {
        word: "marshmallow",
        syllables: "marsh-mal-low",
        definition: "A soft, fluffy, sweet candy that is squishy to hold.",
        emoji: "🍬",
        example: "The puppy was as squishy as a marshmallow.",
      },
      {
        word: "bouncy",
        syllables: "boun-cy",
        definition: "Able to spring or hop up and down easily.",
        emoji: "🦘",
        example: "The rubber ball is super bouncy.",
      },
      {
        word: "sneakers",
        syllables: "sneak-ers",
        definition: "Comfortable shoes made for running, playing, and jumping.",
        emoji: "👟",
        example: "Ellee tied her bright pink sneakers.",
      },
    ],
    comprehensionQuestions: [
      {
        question: "What did the puppy look like to Ellee?",
        options: ["A soft marshmallow", "A prickly cactus", "A cold snowman"],
        correctIndex: 0,
        encouragement: "Spot on, Ellee! The puppy was fluffy and white like a marshmallow!",
      },
      {
        question: "What color was the ball Ellee threw?",
        options: ["Blue", "Bright red", "Purple"],
        correctIndex: 1,
        encouragement: "Fantastic memory! It was a bright red ball!",
      },
      {
        question: "What name did Ellee give to her new puppy?",
        options: ["Bobo", "Spot", "Barnaby"],
        correctIndex: 0,
        encouragement: "Hooray! Bobo the bouncy puppy is your best friend!",
      },
    ],
  },
  {
    id: "ellee-rainbow-butterfly",
    title: "The Rainbow Butterfly Garden",
    emoji: "🦋",
    targetNieceId: "ellee",
    targetAge: 7,
    levelLabel: "Level 1: Phonics & Sight Words",
    genre: "Magical Nature",
    colorScheme: {
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-700",
      cardBorder: "border-amber-300",
    },
    summary: "A tiny butterfly with glowing wings invites Ellee to solve rhyming word riddles to unlock the secret garden.",
    paragraphs: [
      {
        id: "p1",
        text: "Flutter, flutter went two glittery wings in the warm summer breeze. A tiny, glowing butterfly landed softly right on Ellee's thumb.",
      },
      {
        id: "p2",
        text: "Its wings sparkled with pink, purple, and sunshine gold sparkles. Ellee held her breath so she would not startle the little friend.",
      },
      {
        id: "p3",
        text: "'Hello Ellee!' whispered the butterfly in a gentle musical hum. 'I am Pip. The magical flower garden is waiting for a super reader like you!'",
      },
      {
        id: "p4",
        text: "Pip flew to a big wooden garden door wrapped in leafy vines. 'If you can read three magic rhyming words, the golden lock will open!' Pip chirped.",
      },
      {
        id: "p5",
        text: "Ellee looked closely at the shiny flower petals. She sounded out each word out loud: 'C-A-T... Cat! H-A-T... Hat! M-A-T... Mat!'",
      },
      {
        id: "p6",
        text: "Each word glowed with a bright warm yellow sparkle as she read it. Next, she read the second rhyming set: 'S-U-N... Sun! F-U-N... Fun! R-U-N... Run!'",
      },
      {
        id: "p7",
        text: "Click! The garden door swung open with a gentle chime. Giant bluebells and pink sunflowers bloomed all around the garden path in a rainbow display.",
      },
      {
        id: "p8",
        text: "'Hooray, Ellee!' cheered Pip, dancing in circles above her head. 'You unlocked the garden! You are a master word explorer!'",
      },
    ],
    vocabularyWords: [
      {
        word: "glittery",
        syllables: "glit-ter-y",
        definition: "Sparkling with tiny flashes of bright light.",
        emoji: "✨",
      },
      {
        word: "whispered",
        syllables: "whis-pered",
        definition: "Spoken very softly and quietly.",
        emoji: "🤫",
      },
      {
        word: "bloom",
        syllables: "bloom",
        definition: "When a flower opens up its pretty petals.",
        emoji: "🌸",
      },
    ],
    comprehensionQuestions: [
      {
        question: "Where did Pip the butterfly land?",
        options: ["On Ellee's thumb", "On a baseball cap", "In a tree"],
        correctIndex: 0,
        encouragement: "Super star reading! Pip landed right on Ellee's thumb!",
      },
      {
        question: "What kind of words did Ellee read to help the flowers open?",
        options: ["Rhyming words", "Math numbers", "Recipe ingredients"],
        correctIndex: 0,
        encouragement: "Awesome job! Cat, hat, mat, sun, fun, run are rhyming words!",
      },
    ],
  },

  // KAYLEE'S STORIES (Age 10)
  {
    id: "kaylee-treehouse-decoder",
    title: "Kaylee & the Secret Treehouse Decoder",
    emoji: "🌲",
    targetNieceId: "kaylee",
    targetAge: 10,
    levelLabel: "Level 2: Fluency & Adventure",
    genre: "Mystery Detective",
    colorScheme: {
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-700",
      cardBorder: "border-emerald-300",
    },
    summary: "Kaylee uncovers a brass decoder wheel hidden inside the floorboards of her treehouse fort.",
    paragraphs: [
      {
        id: "p1",
        text: "High up in the leafy branches of the giant oak tree, afternoon sunlight streamed through the wooden window of Kaylee's secret fort. While searching for her lost soccer whistle beneath the desk, she noticed a hollow thud under her left boot.",
      },
      {
        id: "p2",
        text: "Kaylee knelt down and carefully slid aside an old cedar floor plank. Tucked inside a dusty blue velvet pouch was a heavy brass cipher wheel, engraved with ancient letters and mystery symbols.",
      },
      {
        id: "p3",
        text: "A carved wooden tag attached to the wheel read: 'Only an observant and brave reader can decipher the hidden message to unlock the secret path.'",
      },
      {
        id: "p4",
        text: "Kaylee inspected the outer ring. The riddle asked for a vocabulary word that meant 'courageous and bold under pressure.' She broke down the syllable clues in her head: daunt-less.",
      },
      {
        id: "p5",
        text: "'D-a-u-n-t-l-e-s-s... Dauntless!' Kaylee whispered triumphantly. She rotated the golden brass dials until the letters aligned along the center arrow.",
      },
      {
        id: "p6",
        text: "Click! A secret side drawer popped outward from the treehouse wall. Inside was a rolled parchment map showing secret hidden trails leading through Whispering Hill forest!",
      },
      {
        id: "p7",
        text: "Kaylee tucked the parchment into her adventure satchel and unhooked her binoculars. With a smile of pure excitement, she knew her great detective mission was officially underway.",
      },
    ],
    vocabularyWords: [
      {
        word: "cipher",
        syllables: "ci-pher",
        definition: "A secret code or key used to disguise words and messages.",
        emoji: "🔐",
      },
      {
        word: "observant",
        syllables: "ob-ser-vant",
        definition: "Quick to notice things around you; paying keen attention.",
        emoji: "👀",
      },
      {
        word: "dauntless",
        syllables: "daunt-less",
        definition: "Showing fearlessness and determination in tough situations.",
        emoji: "🛡️",
      },
      {
        word: "concealed",
        syllables: "con-cealed",
        definition: "Kept out of sight; hidden away carefully.",
        emoji: "📦",
      },
    ],
    comprehensionQuestions: [
      {
        question: "What alerted Kaylee that something was hidden under the floor?",
        options: ["A hollow thud beneath her boot", "A squeaking mouse", "A flashing light bulb"],
        correctIndex: 0,
        encouragement: "Sharp detective work, Kaylee! The hollow thud gave it away!",
      },
      {
        question: "What word did Kaylee decode to open the secret drawer?",
        options: ["Dauntless", "Spectacular", "Treehouse"],
        correctIndex: 0,
        encouragement: "Brilliant! Dauntless means brave and fearless!",
      },
      {
        question: "What treasure was inside the concealed drawer?",
        options: ["A parchment map of Whispering Hill trails", "A bag of gold coins", "A secret compass"],
        correctIndex: 0,
        encouragement: "Excellent reading! The map revealed hidden trails for the next expedition!",
      },
    ],
  },
  {
    id: "kaylee-dolphin-reef",
    title: "Rescue at the Bioluminescent Reef",
    emoji: "🐬",
    targetNieceId: "kaylee",
    targetAge: 10,
    levelLabel: "Level 2: Fluency & Adventure",
    genre: "Ocean Adventure",
    colorScheme: {
      badgeBg: "bg-teal-100",
      badgeText: "text-teal-700",
      cardBorder: "border-teal-300",
    },
    summary: "Kaylee navigates a sea kayak through glowing turquoise waves to guide a stranded baby dolphin home.",
    paragraphs: [
      {
        id: "p1",
        text: "Dusk fell peacefully over Emerald Cove as the dark ocean water began to spark with shimmering neon light. Kaylee dipped her lightweight paddle into the sea, fascinated by the glowing spirals of blue bioluminescence that trailed behind her kayak.",
      },
      {
        id: "p2",
        text: "The evening breeze carried the cool scent of salt spray and pine. Up ahead, near the shallow coral reef, a sharp squeaking sound chirped through the calm water.",
      },
      {
        id: "p3",
        text: "Kaylee adjusted her headlamp beam. Trapped in a shallow sand pocket was a young spotted dolphin, splashing nervously as the tide pulled back into deeper water.",
      },
      {
        id: "p4",
        text: "'Hold steady, little guy,' Kaylee spoke softly, keeping her voice calm and reassuring so the dolphin would know she was a friend.",
      },
      {
        id: "p5",
        text: "She unrolled her waterproof marine map and located a deep tidal channel just fifteen yards to the north. Kaylee paddled in smooth, deliberate movements alongside the reef.",
      },
      {
        id: "p6",
        text: "Using her kayak to gently shield the wind, she guided the young dolphin toward the clear channel opening.",
      },
      {
        id: "p7",
        text: "With a swift flick of its powerful tail fin, the dolphin glided through the deep channel into open water! It did a high jump out of the glowing waves before joining its family pod in the distance.",
      },
    ],
    vocabularyWords: [
      {
        word: "bioluminescent",
        syllables: "bi-o-lu-mi-nes-cent",
        definition: "Living creatures producing their own natural glowing light.",
        emoji: "💡",
      },
      {
        word: "reassuring",
        syllables: "re-as-sur-ing",
        definition: "Saying or doing something that removes fear and restores confidence.",
        emoji: "🤝",
      },
      {
        word: "deliberate",
        syllables: "de-lib-er-ate",
        definition: "Done on purpose with careful thought and steady calm.",
        emoji: "🎯",
      },
    ],
    comprehensionQuestions: [
      {
        question: "Why was the ocean glowing around Kaylee's kayak?",
        options: ["Bioluminescent organisms in the water", "Underwater flashlights", "Reflection from fireworks"],
        correctIndex: 0,
        encouragement: "Nailed it! Bioluminescent plankton light up when moved by waves!",
      },
      {
        question: "How did Kaylee help the young dolphin reach safety?",
        options: ["She guided it toward a deeper tidal channel", "She carried it in a net", "She called a helicopter"],
        correctIndex: 0,
        encouragement: "Superb reading! She located the deep channel on her marine chart!",
      },
    ],
  },

  // MARLEE'S STORIES (Age 11)
  {
    id: "marlee-starlight-observatory",
    title: "Marlee and the Starlight Observatory",
    emoji: "🔭",
    targetNieceId: "marlee",
    targetAge: 11,
    levelLabel: "Level 3: Chapter Mastery & Expression",
    genre: "Science Mystery & Wonder",
    colorScheme: {
      badgeBg: "bg-purple-100",
      badgeText: "text-purple-700",
      cardBorder: "border-purple-300",
    },
    summary: "At the mountaintop observatory, Marlee detects an unexpected celestial signal that sounds like harmonic music.",
    paragraphs: [
      {
        id: "p1",
        text: "Perched high atop the craggy granite peak of Mount Solitude, the great silver dome of the observatory hummed like a slumbering titan in the night sky. Eleven-year-old Marlee adjusted the brass focus knobs of the spectrograph, her eyes wide as ancient starlight millions of years old illuminated the monitor screens.",
      },
      {
        id: "p2",
        text: "Outside, the temperature hovered near freezing, but inside the control room, Marlee was warm in her favorite space hoodie, intently monitoring the digital telemetry signals.",
      },
      {
        id: "p3",
        text: "'System calibration complete,' Marlee stated with practiced confidence, taking note of the glowing spectral waves shifting across the monitors in shades of emerald and deep ultraviolet.",
      },
      {
        id: "p4",
        text: "While scanning the Pegasus constellation, an anomalous acoustic frequency caught her attention. Unlike standard radio static, this signal had clear cadence, structured tempo, and distinct musical intervals.",
      },
      {
        id: "p5",
        text: "Her heart beat faster as she analyzed the waveform. Cosmic background noise was usually chaotic crackling, but this pattern repeated in precise Fibonacci mathematical ratios.",
      },
      {
        id: "p6",
        text: "She cross-referenced the astronomical coordinates with the star database, realizing the signal originated from a newly discovered exoplanet orbiting a distant binary star system.",
      },
      {
        id: "p7",
        text: "Marlee recorded her detailed findings in her leather-bound astronomy notebook, sketching the harmonic wave frequencies alongside her calculations.",
      },
      {
        id: "p8",
        text: "Marlee smiled with quiet wonder, looking up at the majestic rotating dome of stars above. 'The universe isn't just vast and silent,' she whispered softly. 'It is a magnificent symphony waiting for curious minds to listen.'",
      },
    ],
    vocabularyWords: [
      {
        word: "spectrograph",
        syllables: "spec-tro-graph",
        definition: "An instrument that splits light into different wavelengths to study stars.",
        emoji: "🌈",
      },
      {
        word: "anomalous",
        syllables: "a-nom-a-lous",
        definition: "Deviating from what is standard, normal, or expected; unusual.",
        emoji: "❓",
      },
      {
        word: "cadence",
        syllables: "ca-dence",
        definition: "A rhythmic flow or sequence of sounds; musical inflection.",
        emoji: "🎶",
      },
      {
        word: "meticulous",
        syllables: "me-tic-u-lous",
        definition: "Showing great attention to detail; very careful and precise.",
        emoji: "🔬",
      },
    ],
    comprehensionQuestions: [
      {
        question: "What was unusual about the celestial signal Marlee discovered?",
        options: [
          "It had musical cadence and a mathematical Fibonacci pattern",
          "It was spoken in English words",
          "It made the telescope shake violently",
        ],
        correctIndex: 0,
        encouragement: "Outstanding reading and inference, Marlee! It had clear harmonic intervals!",
      },
      {
        question: "What does the word 'anomalous' mean in this context?",
        options: ["Unusual or unexpected", "Very hot", "Extremely loud"],
        correctIndex: 0,
        encouragement: "Masterful vocabulary skill! Anomalous means deviating from normal expectations!",
      },
      {
        question: "What metaphorical realization does Marlee conclude with?",
        options: [
          "The universe is a magnificent symphony waiting to be heard",
          "Space is too scary to explore",
          "Telescopes should only be used in daylight",
        ],
        correctIndex: 0,
        encouragement: "Beautiful comprehension! You captured the expressive tone of the passage!",
      },
    ],
  },
  {
    id: "marlee-chronos-island",
    title: "The Lost Journal of Chronos Island",
    emoji: "🗺️",
    targetNieceId: "marlee",
    targetAge: 11,
    levelLabel: "Level 3: Chapter Mastery & Expression",
    genre: "Historical Adventure & Mystery",
    colorScheme: {
      badgeBg: "bg-indigo-100",
      badgeText: "text-indigo-700",
      cardBorder: "border-indigo-300",
    },
    summary: "Marlee translates an antique nautical journal containing clues to an ancient sunken clocktower.",
    paragraphs: [
      {
        id: "p1",
        text: "The archive room smelled of old cedar, worn leather bindings, and historical ocean voyages. Marlee carefully turned the delicate vellum pages of an antique nautical journal discovered inside a 19th-century sea captain's chest.",
      },
      {
        id: "p2",
        text: "The faded sepia handwriting featured intricate diagrams of tidal movements, celestial astrolabes, and a mysterious island named Chronos.",
      },
      {
        id: "p3",
        text: "'When the solstice moon aligns with Neptune's crest, the tide yields what time had concealed,' Marlee read aloud, pronouncing each word with rich expression and deliberate clarity.",
      },
      {
        id: "p4",
        text: "The captain's notes described a submerged clockwork mechanism built centuries ago that used water pressure to keep perfect time and track ocean tides.",
      },
      {
        id: "p5",
        text: "Applying her knowledge of historical navigation terms, Marlee deciphered the encoded latitude lines.",
      },
      {
        id: "p6",
        text: "This was not a simple hunt for gold coins—it was an intellectual quest to restore a forgotten marvel of ancient engineering.",
      },
      {
        id: "p7",
        text: "She carefully cataloged every clue in her notebook, connecting historical sea maps with modern satellite charts.",
      },
      {
        id: "p8",
        text: "Adjusting her reading light, Marlee felt the unforgettable spark that every reader experiences: history comes alive when you have the curiosity to read its untold secrets.",
      },
    ],
    vocabularyWords: [
      {
        word: "astrolabe",
        syllables: "as-tro-labe",
        definition: "An ancient instrument used by sailors to calculate latitude by measuring star angles.",
        emoji: "🧭",
      },
      {
        word: "submerged",
        syllables: "sub-merged",
        definition: "Completely covered or sunk beneath the surface of water.",
        emoji: "🌊",
      },
      {
        word: "hydraulic",
        syllables: "hy-drau-lic",
        definition: "Operated by the pressure or movement of water or other liquids.",
        emoji: "⚙️",
      },
    ],
    comprehensionQuestions: [
      {
        question: "What kind of antique artifact was Marlee examining?",
        options: ["An 1842 sea captain's nautical journal", "A stone tablet", "A silver coin"],
        correctIndex: 0,
        encouragement: "Spot on! The leather-bound journal held the key!",
      },
      {
        question: "What was the purpose of the mechanism hidden on Chronos Island?",
        options: ["An ancient hydraulic clockwork that predicted ocean tides", "A gold minting factory", "A pirate radio"],
        correctIndex: 0,
        encouragement: "Terrific comprehension! It was an ancient engineering marvel!",
      },
    ],
  },
];

export const PHONICS_CARDS: PhonicsCard[] = [
  // Age 7 (Ellee)
  {
    id: "ph-cat",
    word: "cat",
    category: "CVC & Short Vowels",
    targetAge: 7,
    syllables: "cat",
    phonicsChunks: ["c", "a", "t"],
    clue: "A furry friend that says meow!",
    emoji: "🐱",
    exampleSentence: "The fluffy cat took a nap.",
  },
  {
    id: "ph-sun",
    word: "sun",
    category: "CVC & Short Vowels",
    targetAge: 7,
    syllables: "sun",
    phonicsChunks: ["s", "u", "n"],
    clue: "Bright and warm in the sky!",
    emoji: "☀️",
    exampleSentence: "The sun shines warm and bright.",
  },
  {
    id: "ph-hop",
    word: "hop",
    category: "CVC & Short Vowels",
    targetAge: 7,
    syllables: "hop",
    phonicsChunks: ["h", "o", "p"],
    clue: "What little bunnies and frogs love to do!",
    emoji: "🐰",
    exampleSentence: "Can you hop like a little frog?",
  },
  {
    id: "ph-ship",
    word: "ship",
    category: "Blends & Digraphs",
    targetAge: 7,
    syllables: "ship",
    phonicsChunks: ["sh", "i", "p"],
    clue: "A big boat that sails across the ocean.",
    emoji: "🚢",
    exampleSentence: "The big ship sails on blue water.",
  },
  {
    id: "ph-bright",
    word: "bright",
    category: "Blends & Digraphs",
    targetAge: 7,
    syllables: "bright",
    phonicsChunks: ["b-r", "igh", "t"],
    clue: "Giving off lots of light, like stars!",
    emoji: "⭐",
    exampleSentence: "Look at that bright twinkle star.",
  },

  // Age 10 (Kaylee)
  {
    id: "ph-adventure",
    word: "adventure",
    category: "Multi-Syllable Power",
    targetAge: 10,
    syllables: "ad-ven-ture",
    phonicsChunks: ["ad", "ven", "ture"],
    clue: "An exciting, bold trip or journey!",
    emoji: "🗺️",
    exampleSentence: "Kaylee packed her backpack for the big adventure.",
  },
  {
    id: "ph-mystery",
    word: "mystery",
    category: "Multi-Syllable Power",
    targetAge: 10,
    syllables: "mys-ter-y",
    phonicsChunks: ["mys", "ter", "y"],
    clue: "Something secret that needs clues to solve!",
    emoji: "🔎",
    exampleSentence: "The secret treehouse held an unsolved mystery.",
  },
  {
    id: "ph-courageous",
    word: "courageous",
    category: "Multi-Syllable Power",
    targetAge: 10,
    syllables: "cour-a-geous",
    phonicsChunks: ["cour", "a", "geous"],
    clue: "Brave when facing a big challenge!",
    emoji: "🦁",
    exampleSentence: "The courageous explorer stepped into the cave.",
  },

  // Age 11 (Marlee)
  {
    id: "ph-constellation",
    word: "constellation",
    category: "Multi-Syllable Power",
    targetAge: 11,
    syllables: "con-stel-la-tion",
    phonicsChunks: ["con", "stel", "la", "tion"],
    clue: "A group of stars forming a pattern in the night sky.",
    emoji: "🌌",
    exampleSentence: "Marlee traced Orion's Belt in the clear constellation.",
  },
  {
    id: "ph-harmonious",
    word: "harmonious",
    category: "Multi-Syllable Power",
    targetAge: 11,
    syllables: "har-mo-ni-ous",
    phonicsChunks: ["har", "mo", "ni", "ous"],
    clue: "Pleasantly combined and blended, like music chords.",
    emoji: "🎵",
    exampleSentence: "The birds sang a harmonious song at dawn.",
  },
];
