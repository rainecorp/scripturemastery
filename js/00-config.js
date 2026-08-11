/* 00-config.js — tuning constants (T3b)
   ===========================================================================
   Every number you might want to argue about, in one place: review intervals,
   rank thresholds, streak and check-in milestones, difficulty bands, and the
   whole Arena table. Extracted verbatim from five files; nothing was retyped
   or reformatted.

   WHAT LIVES HERE: pure literals. No app state, no DOM, no localStorage, no
   `location`. That is what lets this load in tier 00, before everything.

   WHAT DELIBERATELY DOES NOT:
     CLIMBER, STORE_KEY, FROM_DQ, HAD_SAVE_AT_BOOT  read location/localStorage
       at load — runtime environment, not configuration. Still in 03-state.
     VOLUME_ORDER, POPULAR_REFS, TOWERS, RELICS      content, not tuning.
     ACHIEVEMENTS, ACHV_CATS                         carry cur() closures over
       app functions; moving them would invert a load-order dependency.
     HL_ROLES, HL_LEXICON, HL_PHRASES                highlighter data, and
       HL_PHRASES is computed at load from the tokenizer.
     SHARD_CLIPS, TV_ASSET                           render geometry. TV_ASSET
       is about to be replaced by towerGeometry() in T11 — moving it now would
       be churn against a rewrite.

   Load order: 00-namespace must come first (these SQ registrations need it),
   then this file, then 00-tokenize. Nothing here depends on the tokenizer.
   =========================================================================== */


/* ---- Time and scheduling ---- */
const DAY = 86400000;
const REVIEW_LADDER = [1,3,7,14,30,90]; // days between re-seals

/* ---- Progression: ranks and streaks ---- */
const RANKS = [
  [0,"Seeker"],[150,"Scribe"],[400,"Record Keeper"],[900,"Guardian"],[1800,"Sentinel"],[3200,"Keeper of the Word"]
];
const STREAK_MILESTONES = [3,7,14,30,50,100];
const CHECKIN_MILESTONES = [
  {day:3,  icon:"🧰", short:"Momentum", copy:"Three sparks become a flame"},
  {day:7,  icon:"🛡️", short:"Shield", copy:"One full week protected"},
  {day:14, icon:"🎁", short:"Treasure", copy:"Two weeks of steady return"},
  {day:21, icon:"👑", short:"Crown", copy:"A strong rhythm is forming"},
  {day:28, icon:"🏆", short:"Grand chest", copy:"Four weeks faithfully built"}
];

/* ---- Difficulty / rarity: one shared 5-tier system.
       Order is load-bearing — STAGES derives from DIFFICULTIES. ---- */
const DIFFICULTIES = [
  {label:"Easy", emoji:"☀️", stage:"Full Text"},
  {label:"Medium", emoji:"⛅", stage:"Light Fade"},
  {label:"Hard", emoji:"🌧️", stage:"Heavy Fade"},
  {label:"Challenge", emoji:"⛈️", stage:"First Letters"},
  {label:"Impossible", emoji:"🌪️", stage:"Blackout"}
];
const STAGES = DIFFICULTIES.map(d=>d.stage);
const TIER_TRIMS = [
  {trim:"#b0763b", glow:"rgba(176,118,59,.45)", metal:"Bronze"},
  {trim:"#9fb2c1", glow:"rgba(159,178,193,.5)", metal:"Silver"},
  {trim:"#a3b52f", glow:"rgba(163,181,47,.45)", metal:"Green Gold"},
  {trim:"#f4b942", glow:"rgba(244,185,66,.55)", metal:"Gold"},
  {trim:"#2fd4c0", glow:"rgba(47,212,192,.6)", metal:"Teal Gold"}
];

/* ---- Arena ---- */
const ARENA_DIFF = {
  easy:   {key:"easy",   label:"Easy",   emoji:"😌", options:3, timer:40, hintFree:true},
  normal: {key:"normal", label:"Normal", emoji:"🙂", options:3, timer:25, hintFree:false},
  hard:   {key:"hard",   label:"Hard",   emoji:"🥵", options:4, timer:15, hintFree:false}
};
const ARENA_TYPES = ["text2ref","ref2text","theme2ref","finishVerse","buildVerse","fillBlank","findError","fullRecitation","timedRecall","wordScramble","pairMatch"];
const ARENA_TYPE_LABEL = {
  text2ref:"Reference Match", ref2text:"First Words", theme2ref:"Keyword Match",
  finishVerse:"Finish the Verse", buildVerse:"Build the Verse", fillBlank:"Fill in the Blank",
  findError:"Find the Error", fullRecitation:"Full Recitation", timedRecall:"Timed Recall",
  wordScramble:"Untangle the Verse", pairMatch:"Match the Pairs"
};
const ARENA_ACHIEVEMENTS = [
  {id:"first_session",  emoji:"🌱", name:"Scripture Seeker",   desc:"Complete your first Arena session"},
  {id:"streak10",       emoji:"🔥", name:"Verse Builder",      desc:"Ten correct answers in a row"},
  {id:"perfect",        emoji:"✨", name:"Iron Rod Disciple",  desc:"A perfect Arena session"},
  {id:"all_books",      emoji:"🛡️", name:"Scripture Defender", desc:"Practiced scriptures from every book"},
  {id:"recite_no_hints",emoji:"🎤", name:"Master Reciter",     desc:"Recited a memorized scripture without hints"},
  {id:"book_area",      emoji:"📖", name:"Keeper of the Word", desc:"Completed one Book Mastery area"},
  {id:"book_mastery",   emoji:"🏆", name:"Arena Champion",     desc:"Completed an entire Book Mastery Challenge"},
  {id:"grand_mastery",  emoji:"👑", name:"Scripture Master",   desc:"Completed the Grand Scripture Challenge"},
  {id:"mastered25",     emoji:"🥉", name:"25 Mastered",        desc:"Mastered 25 scriptures"},
  {id:"mastered50",     emoji:"🥈", name:"50 Mastered",        desc:"Mastered 50 scriptures"},
  {id:"mastered100",    emoji:"🥇", name:"100 Mastered",       desc:"Mastered 100 scriptures"},
  {id:"blitz_ace",      emoji:"⚡", name:"Lightning Ace",      desc:"15 correct in one Lightning Round"}
];
const ARENA_TITLES = [
  [0,"Scripture Seeker"],[2,"Verse Builder"],[4,"Iron Rod Disciple"],[6,"Scripture Defender"],
  [8,"Master Reciter"],[9,"Keeper of the Word"],[10,"Arena Champion"],[11,"Scripture Master"]
];
const ARENA_HEART_MAX = 3;
/* ---- Arena Quests: three rotating daily challenges, rewarded with a
   chest-badge on the Quest Shelf. Progress is tracked live as the
   player answers questions and finishes sessions. ---- */
const ARENA_QUEST_POOL = [
  {id:"ref_hunter",   name:"Reference Ranger", desc:"Answer 5 Reference Match questions correctly", track:"type", type:"text2ref",     goal:5, emoji:"🧭", chest:4},
  {id:"first_words",  name:"Quick Starter",    desc:"Answer 5 First Words questions correctly",      track:"type", type:"ref2text",     goal:5, emoji:"🏁", chest:4},
  {id:"keyword",      name:"Keyword Hunter",   desc:"Answer 5 Keyword Match questions correctly",     track:"type", type:"theme2ref",    goal:5, emoji:"🔑", chest:4},
  {id:"finisher",     name:"Verse Finisher",   desc:"Finish the Verse correctly 5 times",             track:"type", type:"finishVerse",  goal:5, emoji:"🏹", chest:4},
  {id:"builder",      name:"Verse Builder",    desc:"Correctly place 8 sections in Build the Verse",  track:"buildStep", type:"buildVerse", goal:8, emoji:"🧩", chest:9},
  {id:"blanker",      name:"Blank Filler",     desc:"Fill in the Blank correctly 5 times",            track:"type", type:"fillBlank",    goal:5, emoji:"✏️", chest:4},
  {id:"detective",    name:"Error Spotter",    desc:"Find the Error correctly 5 times",               track:"type", type:"findError",    goal:5, emoji:"🕵️", chest:9},
  {id:"reciter",      name:"Bold Reciter",     desc:"Complete a Full Recitation successfully",        track:"type", type:"fullRecitation",goal:1, emoji:"🎤", chest:14},
  {id:"clockbeater",  name:"Clock Beater",     desc:"Beat 3 Timed Recall questions",                  track:"type", type:"timedRecall",   goal:3, emoji:"⏱️", chest:9},
  {id:"regular",      name:"Arena Regular",    desc:"Complete 3 Arena sessions today",                track:"session", goal:3, emoji:"⚔️", chest:9},
  {id:"flawless",     name:"Flawless Victory", desc:"Finish a session with 100% accuracy",            track:"perfect", goal:1, emoji:"✨", chest:19},
  {id:"onfire",       name:"On Fire",          desc:"Reach a combo streak of 8 in one session",       track:"streak", goal:8, emoji:"🔥", chest:14},
  {id:"untangler",    name:"Thread Weaver",    desc:"Untangle 3 scrambled verses",                    track:"type", type:"wordScramble", goal:3, emoji:"🧵", chest:9},
  {id:"matchmaker",   name:"Pair Matcher",     desc:"Win 3 Match the Pairs rounds",                   track:"type", type:"pairMatch",    goal:3, emoji:"🎴", chest:9},
  {id:"lightning",    name:"Lightning Legend", desc:"Get 10 correct in one Lightning Round",          track:"blitz", goal:10, emoji:"⚡", chest:19}
];
const QUEST_ROUND_LEN = {fullRecitation:3, buildVerse:4, wordScramble:5, pairMatch:4};
const BLITZ_TYPES = ["text2ref","ref2text","theme2ref","fillBlank","finishVerse"];
const BLITZ_SECONDS = 60;

/* ---- External surfaces ---- */
const DAILY_QUEST_URL = "/daily/"; // Daily Quest lives at myrateplace.com/daily
const BRIDGE_KEY = "lul_bridge_events";

/* ---- SQ registry ---- */
SQ.DAY = DAY;
SQ.REVIEW_LADDER = REVIEW_LADDER;
SQ.RANKS = RANKS;
SQ.STREAK_MILESTONES = STREAK_MILESTONES;
SQ.CHECKIN_MILESTONES = CHECKIN_MILESTONES;
SQ.DIFFICULTIES = DIFFICULTIES;
SQ.STAGES = STAGES;
SQ.TIER_TRIMS = TIER_TRIMS;
SQ.ARENA_DIFF = ARENA_DIFF;
SQ.ARENA_TYPES = ARENA_TYPES;
SQ.ARENA_TYPE_LABEL = ARENA_TYPE_LABEL;
SQ.ARENA_ACHIEVEMENTS = ARENA_ACHIEVEMENTS;
SQ.ARENA_TITLES = ARENA_TITLES;
SQ.ARENA_HEART_MAX = ARENA_HEART_MAX;
SQ.ARENA_QUEST_POOL = ARENA_QUEST_POOL;
SQ.QUEST_ROUND_LEN = QUEST_ROUND_LEN;
SQ.BLITZ_TYPES = BLITZ_TYPES;
SQ.BLITZ_SECONDS = BLITZ_SECONDS;
SQ.DAILY_QUEST_URL = DAILY_QUEST_URL;
SQ.BRIDGE_KEY = BRIDGE_KEY;
