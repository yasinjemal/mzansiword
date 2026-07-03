// Seed a test puzzle for today (SAST = UTC+2) and populate guess words.
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Today in SAST (UTC+2)
const now = new Date();
const sast = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const today = sast.toISOString().slice(0, 10); // "YYYY-MM-DD"

const TRACK = "en";
const ANSWER = "crane"; // 5-letter word
const LENGTH = 5;

// Common 5-letter English words for the guess dictionary
const GUESS_WORDS = [
  "crane", "slate", "trace", "blaze", "grind", "plumb", "shone", "dwelt",
  "adore", "anger", "apple", "basic", "beach", "below", "black", "blade",
  "blank", "blast", "bleed", "blend", "bless", "blind", "block", "bloom",
  "board", "boast", "bound", "brain", "brand", "brave", "bread", "break",
  "breed", "brick", "brief", "bring", "broad", "brown", "brush", "build",
  "bunch", "burst", "cabin", "carry", "catch", "cause", "chain", "chair",
  "charm", "chase", "cheap", "check", "chess", "chief", "child", "claim",
  "class", "clean", "clear", "climb", "cling", "close", "cloth", "cloud",
  "coach", "coast", "count", "cover", "crack", "craft", "crash", "cream",
  "cross", "crowd", "crush", "curve", "dance", "depth", "devil", "doubt",
  "draft", "drain", "dream", "dress", "drift", "drink", "drive", "drown",
  "earth", "elite", "email", "empty", "enemy", "enjoy", "enter", "equal",
  "error", "event", "every", "exact", "extra", "faith", "false", "fault",
  "feast", "fence", "fever", "field", "fight", "final", "first", "flame",
  "flash", "flesh", "float", "flood", "floor", "flown", "fluid", "flush",
  "focus", "force", "forge", "found", "frame", "fraud", "fresh", "front",
  "froze", "fruit", "ghost", "giant", "given", "glass", "globe", "gloom",
  "glory", "grace", "grade", "grain", "grand", "grant", "graph", "grasp",
  "grass", "grave", "great", "green", "greet", "grief", "grill", "gross",
  "group", "grove", "grown", "guard", "guess", "guide", "guilt", "happy",
  "harsh", "heart", "heavy", "hence", "honey", "honor", "horse", "hotel",
  "house", "human", "hurry", "ideal", "image", "imply", "index", "inner",
  "input", "issue", "ivory", "joint", "judge", "juice", "knife", "knock",
  "known", "label", "large", "laser", "later", "laugh", "layer", "learn",
  "least", "leave", "legal", "level", "light", "limit", "linen", "logic",
  "loose", "lover", "lower", "lucky", "lunar", "lunch", "magic", "major",
  "maker", "march", "match", "mayor", "media", "mercy", "metal", "meter",
  "might", "minor", "minus", "model", "money", "month", "moral", "motor",
  "mount", "mouse", "mouth", "movie", "music", "naive", "nerve", "never",
  "night", "noble", "noise", "north", "noted", "novel", "nurse", "ocean",
  "offer", "often", "olive", "order", "other", "outer", "owner", "oxide",
  "paint", "panel", "panic", "paper", "party", "paste", "patch", "pause",
  "peace", "pearl", "penny", "phase", "phone", "photo", "piano", "piece",
  "pilot", "pitch", "pixel", "place", "plain", "plane", "plant", "plate",
  "plaza", "plead", "point", "pound", "power", "press", "price", "pride",
  "prime", "print", "prior", "prize", "proof", "proud", "prove", "psalm",
  "pupil", "queen", "query", "queue", "quick", "quiet", "quote", "radar",
  "radio", "raise", "range", "rapid", "ratio", "reach", "react", "realm",
  "reign", "relax", "reply", "rider", "rifle", "right", "rigid", "rival",
  "river", "robot", "rocky", "roman", "rough", "round", "route", "royal",
  "rural", "saint", "salad", "scale", "scene", "scope", "score", "sense",
  "serve", "seven", "shade", "shaft", "shake", "shall", "shame", "shape",
  "share", "sharp", "sheet", "shelf", "shell", "shift", "shine", "shirt",
  "shock", "shoot", "shore", "short", "shout", "sight", "since", "sixth",
  "sixty", "skill", "sleep", "slide", "smile", "smoke", "solar", "solid",
  "solve", "sorry", "sound", "south", "space", "spare", "speak", "speed",
  "spend", "spent", "spill", "split", "spoke", "spoon", "sport", "spray",
  "squad", "stack", "staff", "stage", "stake", "stale", "stall", "stamp",
  "stand", "stare", "stark", "start", "state", "stays", "steal", "steam",
  "steel", "steep", "steer", "stick", "stiff", "still", "stock", "stone",
  "stood", "store", "storm", "story", "stove", "strip", "stuck", "study",
  "stuff", "style", "sugar", "super", "surge", "swamp", "swear", "sweep",
  "sweet", "swift", "swing", "sword", "swore", "swung", "table", "taste",
  "teach", "teeth", "tempt", "thank", "theme", "thick", "thing", "think",
  "third", "those", "three", "threw", "throw", "thumb", "tight", "tired",
  "title", "today", "total", "touch", "tough", "tower", "toxic", "track",
  "trade", "trail", "train", "trait", "treat", "trend", "trial", "tribe",
  "trick", "tried", "troop", "truck", "truly", "trump", "trunk", "trust",
  "truth", "tumor", "twice", "twist", "ultra", "uncle", "under", "union",
  "unite", "unity", "until", "upper", "upset", "urban", "usage", "usual",
  "valid", "value", "verse", "video", "virus", "visit", "vital", "vivid",
  "vocal", "voice", "voter", "wagon", "waste", "watch", "water", "weave",
  "weigh", "weird", "wheel", "where", "which", "while", "white", "whole",
  "whose", "widow", "woman", "world", "worry", "worse", "worst", "worth",
  "would", "wound", "wrist", "write", "wrong", "wrote", "yield", "young",
  "youth",
];

async function main() {
  console.log(`Seeding puzzle for ${today}, track=${TRACK}, answer="${ANSWER}"`);

  // 1. Insert the puzzle
  const { data: puzzle, error: puzzleErr } = await supabase
    .from("puzzles")
    .upsert(
      { track_code: TRACK, puzzle_date: today, answer: ANSWER, length: LENGTH },
      { onConflict: "track_code,puzzle_date" }
    )
    .select()
    .single();

  if (puzzleErr) {
    console.error("Failed to insert puzzle:", puzzleErr.message);
    process.exit(1);
  }
  console.log("Puzzle inserted:", puzzle);

  // 2. Insert guess words (upsert to avoid conflicts)
  const rows = GUESS_WORDS.map((w) => ({ track_code: TRACK, word: w }));
  const { error: guessErr } = await supabase
    .from("words_guesses")
    .upsert(rows, { onConflict: "track_code,word", ignoreDuplicates: true });

  if (guessErr) {
    console.error("Failed to insert guess words:", guessErr.message);
    process.exit(1);
  }
  console.log(`Inserted ${GUESS_WORDS.length} guess words.`);

  console.log("\nDone! Refresh the game page to play.");
}

main();
