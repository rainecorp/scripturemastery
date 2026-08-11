/* 03-state.js
   climber, STORE_KEY, load/persist/save, boot migrations, personal climb, streak
   Extracted verbatim from index.html lines 3056-3250 by T2. */
/* =========================================================
   STATE — persisted in localStorage (same key, migrated)
   ========================================================= */
/* =========================================================
   DAILY QUEST BRIDGE — climber identity + reward events.
   When this app lives on the SAME DOMAIN as Daily Quest,
   localStorage is shared: we read who is playing and write
   seal events that Daily Quest converts into XP and a
   completed scriptures daily.
   ========================================================= */
const CLIMBER = (function(){
  const q = new URLSearchParams(location.search).get("climber");
  if(q && q.trim()){
    try{ localStorage.setItem("sq_activeClimber", q.trim()); }catch(e){}
    return q.trim();
  }
  try{
    const dq = JSON.parse(localStorage.getItem("dailyUnlocks_v1"));
    if(dq && dq.selectedProfile) return dq.selectedProfile;
  }catch(e){}
  // profile chosen earlier via usernames.html (persists across visits)
  try{
    const a = localStorage.getItem("sq_activeClimber");
    if(a && a.trim()) return a.trim();
  }catch(e){}
  return null;
})();
const FROM_DQ = new URLSearchParams(location.search).has("from");
function localISODate(){
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10);
}
function emitBridge(type, v, xp){
  if(!CLIMBER) return;
  try{
    const q = JSON.parse(localStorage.getItem(BRIDGE_KEY) || "[]");
    q.push({
      id: "lul_" + Date.now() + "_" + Math.random().toString(36).slice(2,7),
      ts: new Date().toISOString(),
      date: localISODate(),
      climber: CLIMBER,
      type, ref: v.ref, xp
    });
    while(q.length > 200) q.shift();
    localStorage.setItem(BRIDGE_KEY, JSON.stringify(q));
    // Close the loop for Daily Quest kids: remind them the daily +100 XP
    // bonus is now claimable. (Delayed so it lands after the seal ceremony
    // starts; harmless if the ceremony is still up — toasts float above.)
    setTimeout(()=>{
      try{ showToast(`🎁 <strong>Daily Quest bonus unlocked!</strong><br><span style="font-size:11.5px;color:#9db4d6;">Head back to Daily Quest and claim your +100 XP for memorizing.</span>`, true); }catch(e){}
    }, 4500);
  }catch(e){}
}

const STORE_KEY = CLIMBER ? "lineUponLine_v1::" + CLIMBER : "lineUponLine_v1";
// snapshot before boot writes an empty save (username-gate uses this)
const HAD_SAVE_AT_BOOT = !!localStorage.getItem("lineUponLine_v1");

function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {xp:0, streak:0, lastDay:null, progress:{}, edits:{}};
}
function persistState(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function saveState(){
  persistState();
  if(window.__achvReady) checkAchievements();
}

let state = loadState();
/* v2 migrations: habit calendar, streak shields, achievements, sharing, sound */
(function migrateV2(){
  let ch = false;
  const def = (k, val)=>{ if(state[k] == null){ state[k] = val; ch = true; } };
  def("calendar", {});
  def("bestStreak", state.streak||0);
  def("shields", 0);
  def("achv", {unlocked:{}});
  def("shares", 0);
  def("resealsTotal", 0);
  def("sound", true);
  if(state.lastDay === todayStr()){
    const iso = localISODate();
    if(!state.calendar[iso]){ state.calendar[iso] = {a:1}; ch = true; }
  }
  if(ch) persistState();
})();
VERSES.forEach(v=>{
  if(v.id in (state.edits||{})) v.text = state.edits[v.id];
  if(!state.progress[v.id]) state.progress[v.id] = {stage:0, sealed:false};
});
/* migrate old sealed verses into the review system */
(function migrate(){
  const now = Date.now();
  let changed = false;
  Object.values(state.progress).forEach(p=>{
    if(p.sealed && p.sealedAt == null){
      p.sealedAt = now; p.reviewLevel = 0; p.reviews = 0;
      p.nextReviewAt = now + REVIEW_LADDER[0]*DAY;
      changed = true;
    }
  });
  if(changed) saveState();
})();

/* =========================================================
   PERSONAL CLIMB — each tower floor is a verse YOU sealed,
   in the order you sealed it. Every climber's tower differs.
   ========================================================= */
function versesInVolumeEarly(vol){ return VERSES.filter(v=>v.volume===vol); }
(function migrateClimb(){
  if(!state.climb) state.climb = {};
  let changed = false;
  VOLUME_ORDER.forEach(vol=>{
    if(!state.climb[vol]){ state.climb[vol] = []; changed = true; }
    const missing = versesInVolumeEarly(vol)
      .filter(v=>state.progress[v.id].sealed && !state.climb[vol].includes(v.id))
      .sort((a,b)=>(state.progress[a.id].sealedAt||0)-(state.progress[b.id].sealedAt||0));
    missing.forEach(v=>{ state.climb[vol].push(v.id); changed = true; });
  });
  if(changed) saveState();
})();
function climbLog(vol){ return state.climb[vol] || []; }
function floorOf(v){ const i = climbLog(v.volume).indexOf(v.id); return i === -1 ? null : i+1; }
function recordClimb(v){
  const arr = state.climb[v.volume];
  if(!arr.includes(v.id)) arr.push(v.id);
  return arr.indexOf(v.id)+1;
}
function climbChoices(vol){
  const un = versesInVolume(vol).filter(v=>!state.progress[v.id].sealed);
  const inProg = un.filter(v=>(state.progress[v.id].stage||0)>0);
  const fresh = un.filter(v=>(state.progress[v.id].stage||0)===0)
    .sort((a,b)=>wordCount(a.text)-wordCount(b.text) || (isPopularVerse(b)?1:0)-(isPopularVerse(a)?1:0));
  const picks = [];
  if(inProg.length) picks.push({v:inProg[0], tag:"⛏️ In progress", cls:"prog"});
  if(fresh.length) picks.push({v:fresh[0], tag:"😌 Quick win", cls:"quick"});
  if(fresh.length > 2) picks.push({v:fresh[Math.floor(fresh.length/2)], tag:"🙂 Steady climb", cls:"steady"});
  if(fresh.length > 1) picks.push({v:fresh[fresh.length-1], tag:"🥵 Bold leap", cls:"bold"});
  const seen = new Set();
  return picks.filter(p=>{ if(seen.has(p.v.id)) return false; seen.add(p.v.id); return true; }).slice(0,3);
}

function todayStr(){ return new Date().toDateString(); }
/* ---- streak v2: calendar check-ins, shields, milestones ---- */
function calDay(iso){ return state.calendar[iso] || (state.calendar[iso] = {}); }
function checkinCount(){ return Object.values(state.calendar||{}).filter(d=>d.a||d.c).length; }
function nextStreakMilestone(){ return STREAK_MILESTONES.find(m=>m>state.streak) || null; }
function streakTier(n){
  if(n>=30) return 5;
  if(n>=14) return 4;
  if(n>=7) return 3;
  if(n>=3) return 2;
  if(n>=1) return 1;
  return 0;
}
function touchStreak(){
  const t = todayStr();
  calDay(localISODate()).a = 1;
  if(state.lastDay === t) return;
  const y = new Date(); y.setDate(y.getDate()-1);
  const y2 = new Date(); y2.setDate(y2.getDate()-2);
  const prev = state.streak||0;
  if(state.lastDay === y.toDateString()){
    state.streak = prev+1;
  } else if(state.lastDay === y2.toDateString() && (state.shields||0) > 0){
    state.shields -= 1;
    state.streak = prev+1;
    setTimeout(()=>{ showToast(`🛡️ <strong>Streak Shield used!</strong><br><span style="font-size:11.5px;color:#9db4d6;">Your ${state.streak}-day flame survived the missed day.</span>`, true); }, 400);
  } else {
    state.streak = 1;
  }
  state.lastDay = t;
  state.bestStreak = Math.max(state.bestStreak||0, state.streak);
  if(state.streak > prev && state.streak % 7 === 0 && (state.shields||0) < 2){
    state.shields = (state.shields||0) + 1;
    setTimeout(()=>{ showToast(`🛡️ <strong>Streak Shield earned!</strong><br><span style="font-size:11.5px;color:#9db4d6;">A missed day won't break your flame. (${state.shields}/2 held)</span>`, true); SFX.milestone(); }, 900);
  }
  if(state.streak > prev && STREAK_MILESTONES.includes(state.streak)){
    const s = state.streak;
    setTimeout(()=>{
      showToast(`🔥 <strong>${s}-day streak!</strong><br><span style="font-size:11.5px;color:#9db4d6;">Your flame burns brighter than ever. Keep climbing!</span>`, true);
      SFX.fanfare(); FX.rain({count:70});
    }, 1600);
  }
  saveState();
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.CLIMBER = CLIMBER;
SQ.FROM_DQ = FROM_DQ;
SQ.localISODate = localISODate;
SQ.emitBridge = emitBridge;
SQ.STORE_KEY = STORE_KEY;
SQ.HAD_SAVE_AT_BOOT = HAD_SAVE_AT_BOOT;
SQ.loadState = loadState;
SQ.persistState = persistState;
SQ.saveState = saveState;
Object.defineProperty(SQ,"state",{get:()=>state,set:v=>{state=v;},enumerable:true,configurable:true});
SQ.versesInVolumeEarly = versesInVolumeEarly;
SQ.climbLog = climbLog;
SQ.floorOf = floorOf;
SQ.recordClimb = recordClimb;
SQ.climbChoices = climbChoices;
SQ.todayStr = todayStr;
SQ.calDay = calDay;
SQ.checkinCount = checkinCount;
SQ.nextStreakMilestone = nextStreakMilestone;
SQ.streakTier = streakTier;
SQ.touchStreak = touchStreak;
