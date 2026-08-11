/* 02-towers-data.js
   TOWERS per volume, RELICS, fallback emoji
   Extracted verbatim from index.html lines 2991-3055 by T2. */
/* =========================================================
   TOWERS — one per volume. Floor N = verse N in book order.
   ========================================================= */
const TOWERS = {
  "Book of Mormon":        {name:"The Ancient America Tower", icon:"🌴", tag:"Hold the rod. Climb to the tree.", hue:"#34d399", soft:"rgba(52,211,153,.22)",
                            art:{prefix:"temple-towers/ancient-america-temple-", baseWidth:640}},
  "New Testament":         {name:"The Jerusalem Tower",       icon:"🕊️", tag:"Walk where the Master walked.",    hue:"#60a5fa", soft:"rgba(96,165,250,.22)",
                            art:{prefix:"temple-towers/jerusalem-temple-tower-", baseWidth:640}},
  "Doctrine and Covenants":{name:"The Restoration Tower",     icon:"🗝️", tag:"Line upon line, key by key.",      hue:"#f4b942", soft:"rgba(244,185,66,.22)",
                            art:{prefix:"temple-towers/restoration-temple-", baseWidth:585}},
  "Old Testament":         {name:"The Tabernacle Tower",       icon:"🔥", tag:"Ancient fire, written in stone.",  hue:"#fb923c", soft:"rgba(251,146,60,.22)",
                            art:{prefix:"temple-towers/tabernacle-tower-", baseWidth:640}}
};

/* =========================================================
   RELICS — designed set for the Book of Mormon (v2 doc).
   Drop PNGs in relics/{verseId}.png and set RELIC_IMAGES
   to true to switch from emoji placeholders to real art.
   ========================================================= */
const RELIC_IMAGES = true;
const RELICS = {
  "1 Nephi 3:7":    {name:"Trailblazer Boots",         emoji:"🥾", motto:"I will go and do"},
  "1 Nephi 19:23":  {name:"Reflecting Scroll Case",    emoji:"📜", motto:"Liken all scriptures unto us"},
  "2 Nephi 2:25":   {name:"Smiling Sun Medallion",     emoji:"🌞", motto:"That they might have joy"},
  "2 Nephi 2:27":   {name:"Compass of Choice",         emoji:"🧭", motto:"Choose liberty and eternal life"},
  "2 Nephi 9:28–29":{name:"Humble Scholar's Diadem",   emoji:"📖", motto:"To be learned is good if..."},
  "2 Nephi 28:7–9": {name:"Cracked Feast Goblet",      emoji:"🏺", motto:"Eat, drink, and be merry"},
  "2 Nephi 32:3":   {name:"Scroll of Nourishment",     emoji:"🌾", motto:"Feast upon the words of Christ"},
  "2 Nephi 32:8–9": {name:"Prayer Pendant",            emoji:"🙏", motto:"Pray always"},
  "Jacob 2:18–19":  {name:"Kingdom Key",               emoji:"🗝️", motto:"Seek ye first the kingdom of God"},
  "Mosiah 2:17":    {name:"Helping Hands Medal",       emoji:"🎖️", motto:"In the service of your God"},
  "Mosiah 3:19":    {name:"Shedding Chrysalis",        emoji:"🦋", motto:"Putteth off the natural man"},
  "Mosiah 4:30":    {name:"Watchman's Triple Ring",    emoji:"💍", motto:"Watch your thoughts, words, deeds"},
  "Alma 32:21":     {name:"Seed of Faith Reliquary",   emoji:"🌱", motto:"Hope for things not seen"},
  "Alma 34:32–34":  {name:"Hourglass of Today",        emoji:"⏳", motto:"This life is the time to prepare"},
  "Alma 37:6–7":    {name:"Seedwork Charm",            emoji:"🌳", motto:"By small and simple things"},
  "Alma 37:35":     {name:"Youth Scholar Satchel",     emoji:"🎒", motto:"Learn wisdom in thy youth"},
  "Alma 41:10":     {name:"Broken Smile Mask",         emoji:"🎭", motto:"Wickedness never was happiness"},
  "Helaman 5:12":   {name:"Foundation Stone Shield",   emoji:"🛡️", motto:"Build upon my rock"},
  "3 Nephi 11:29":  {name:"Shattered Contention Blade",emoji:"⚔️", motto:"Contention is not of me"},
  "3 Nephi 27:27":  {name:"Disciple's Mirror Shield",  emoji:"🪞", motto:"Even as I am"},
  "Ether 12:6":     {name:"Mistbridge Token",          emoji:"🌉", motto:"After the trial of your faith"},
  "Ether 12:27":    {name:"Strengthened Chain Link",   emoji:"⛓️", motto:"Weak things become strong"},
  "Moroni 7:16–17": {name:"Discernment Compass",       emoji:"⚖️", motto:"Judge good from evil"},
  "Moroni 7:45":    {name:"Charity Heart Crown",       emoji:"👑", motto:"Charity never faileth"},
  "Moroni 10:4–5":  {name:"Witness Flame Crystal",     emoji:"🔥", motto:"He will manifest the truth"}
};
const FALLBACK_EMOJI = [
  [/pray/i,"🙏"],[/charity|love/i,"❤️"],[/faith/i,"🌱"],[/spirit|ghost|revelation|vision/i,"🕊️"],
  [/wisdom|learn|knowledge|intelligence|meditate/i,"📖"],[/light|shine|candle/i,"🕯️"],
  [/priesthood|key/i,"🗝️"],[/choose|serve|liberty/i,"🧭"],[/forgive/i,"🤝"],
  [/joy|happiness/i,"🌞"],[/marriage|family|elijah|hearts of/i,"💍"],[/tith|sacrifice/i,"🪙"],
  [/heart/i,"💛"],[/redeemer|liveth|testimony|glory|he lives/i,"✨"],[/resurrect/i,"🌅"],
  [/baptiz|water|born/i,"💧"],[/sabbath|rest/i,"🛖"],[/temple|house/i,"🏛️"],
  [/command|law|word|book/i,"📜"],[/gather|fisher|missionary|souls/i,"🕸️"],
  [/kingdom|stone|mountain/i,"⛰️"],[/angel|heaven/i,"😇"],[/image of god|created/i,"🌍"],
  [/rock|foundation/i,"🛡️"],[/tempt/i,"⚔️"]
];
function relicFor(v){
  if(RELICS[v.ref]) return {...RELICS[v.ref], designed:true};
  let emoji = "📜";
  for(const [re,e] of FALLBACK_EMOJI){ if(re.test(v.theme)){ emoji = e; break; } }
  return {name:v.theme, emoji, motto:v.theme, designed:false};
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.TOWERS = TOWERS;
SQ.RELIC_IMAGES = RELIC_IMAGES;
SQ.RELICS = RELICS;
SQ.FALLBACK_EMOJI = FALLBACK_EMOJI;
SQ.relicFor = relicFor;
