/* 02-relics-data.js
   Designed relic metadata and fallback emoji.
   Tower metadata moved into Campaign records in T9. */

/* =========================================================
   RELICS — designed set for the Book of Mormon (v2 doc).
   Drop WebP files in relics/{passageId}.webp and set RELIC_IMAGES
   to true to switch from emoji placeholders to real art.
   ========================================================= */
const RELIC_IMAGES = true;
const RELICS = {
"p_05aa9da7":    {name:"Trailblazer Boots",         emoji:"🥾", motto:"I will go and do"},
  "p_79aef65b":  {name:"Reflecting Scroll Case",    emoji:"📜", motto:"Liken all scriptures unto us"},
  "p_de9f74d8":   {name:"Smiling Sun Medallion",     emoji:"🌞", motto:"That they might have joy"},
  "p_214d7402":   {name:"Compass of Choice",         emoji:"🧭", motto:"Choose liberty and eternal life"},
  "p_d28728f4": {name:"Humble Scholar's Diadem",     emoji:"📖", motto:"To be learned is good if..."},
  "p_44d95f5c": {name:"Cracked Feast Goblet",      emoji:"🏺", motto:"Eat, drink, and be merry"},
  "p_4e057f38":   {name:"Scroll of Nourishment",     emoji:"🌾", motto:"Feast upon the words of Christ"},
  "p_c5ab29f6": {name:"Prayer Pendant",            emoji:"🙏", motto:"Pray always"},
  "p_e0405241":  {name:"Kingdom Key",               emoji:"🗝️", motto:"Seek ye first the kingdom of God"},
  "p_a0035b2c":    {name:"Helping Hands Medal",       emoji:"🎖️", motto:"In the service of your God"},
  "p_fe20c8c8":    {name:"Shedding Chrysalis",        emoji:"🦋", motto:"Putteth off the natural man"},
  "p_881d13f6":    {name:"Watchman's Triple Ring",    emoji:"💍", motto:"Watch your thoughts, words, deeds"},
  "p_84f05c78":     {name:"Seed of Faith Reliquary",   emoji:"🌱", motto:"Hope for things not seen"},
  "p_32640315":  {name:"Hourglass of Today",        emoji:"⏳", motto:"This life is the time to prepare"},
  "p_09def662":    {name:"Seedwork Charm",            emoji:"🌳", motto:"By small and simple things"},
  "p_a18a2a74":     {name:"Youth Scholar Satchel",     emoji:"🎒", motto:"Learn wisdom in thy youth"},
  "p_b26d10ae":     {name:"Broken Smile Mask",         emoji:"🎭", motto:"Wickedness never was happiness"},
  "p_d3fb452d":   {name:"Foundation Stone Shield",   emoji:"🛡️", motto:"Build upon my rock"},
  "p_fdb95a1a":  {name:"Shattered Contention Blade",emoji:"⚔️", motto:"Contention is not of me"},
  "p_8f3400cd":  {name:"Disciple's Mirror Shield",  emoji:"🪞", motto:"Even as I am"},
  "p_e1de7020":     {name:"Mistbridge Token",          emoji:"🌉", motto:"After the trial of your faith"},
  "p_a0936c91":    {name:"Strengthened Chain Link",   emoji:"⛓️", motto:"Weak things become strong"},
  "p_82fa62cb": {name:"Discernment Compass",       emoji:"⚖️", motto:"Judge good from evil"},
  "p_d72eb471":    {name:"Charity Heart Crown",       emoji:"👑", motto:"Charity never faileth"},
  "p_6d0e1c9a":  {name:"Witness Flame Crystal",     emoji:"🔥", motto:"He will manifest the truth"}
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
  if(RELICS[v.id]) return {...RELICS[v.id], designed:true};
  let emoji = "📜";
  for(const [re,e] of FALLBACK_EMOJI){ if(re.test(v.topic)){ emoji = e; break; } }
  return {name:v.topic, emoji, motto:v.topic, designed:false};
}

/* ---- SQ registry ---- */
SQ.RELIC_IMAGES = RELIC_IMAGES;
SQ.RELICS = RELICS;
SQ.FALLBACK_EMOJI = FALLBACK_EMOJI;
SQ.relicFor = relicFor;
