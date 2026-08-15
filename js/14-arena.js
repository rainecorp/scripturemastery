/* 14-arena.js
   arena engine: types, quests, hearts, question building, scoring
   Extracted verbatim from index.html lines 4105-4603 by T2. */
/* =========================================================
   ARENA — configurable knowledge trials: pick your filters,
   your challenge format, and your difficulty. Correct answers
   earn score + streak bonuses; due verses answered correctly
   are re-sealed; milestones unlock achievements.
   ========================================================= */
function shuffleArr(a){
  const x = a.slice();
  for(let i=x.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}
function trialPool(){
  return allPassages().filter(v=>{ const p = state.progress[v.id]; return p.sealed || (p.stage||0) > 0; });
}
function trialSnippet(text, words){
  const n = words || 14;
  const total = wordCount(text);
  /* spanByWords keeps the source punctuation between the words it spans, so a
     snippet that straddles an em dash still shows it. */
  return spanByWords(text, 0, n) + (total > n ? " …" : "");
}

function arenaTitleFor(count){
  let t = ARENA_TITLES[0][1];
  ARENA_TITLES.forEach(([n,name])=>{ if(count>=n) t=name; });
  return t;
}

function ensureArenaQuests(a){
  const today = todayStr();
  if(!a.quests || a.quests.date !== today){
    const picks = shuffleArr(ARENA_QUEST_POOL).slice(0,3);
    a.quests = {
      date: today,
      list: picks.map(t=>({id:t.id, progress:0, goal:t.goal, done:false}))
    };
  }
  a.questBadges = a.questBadges || [];
  return a.quests;
}
function questDef(id){ return ARENA_QUEST_POOL.find(t=>t.id===id); }
function bumpArenaQuests(a, matchFn, amount){
  const q = ensureArenaQuests(a);
  let anyDone = [];
  q.list.forEach(inst=>{
    if(inst.done) return;
    const def = questDef(inst.id);
    if(!def || !matchFn(def)) return;
    inst.progress = Math.min(inst.goal, inst.progress + amount);
    if(inst.progress >= inst.goal){
      inst.done = true;
      a.questBadges.push({id:def.id, name:def.name, emoji:def.emoji, chest:def.chest, earnedAt:Date.now()});
      anyDone.push(def);
    }
  });
  return anyDone;
}
function setArenaQuestProgress(a, matchFn, value){
  const q = ensureArenaQuests(a);
  let anyDone = [];
  q.list.forEach(inst=>{
    if(inst.done) return;
    const def = questDef(inst.id);
    if(!def || !matchFn(def)) return;
    inst.progress = Math.min(inst.goal, Math.max(inst.progress, value));
    if(inst.progress >= inst.goal){
      inst.done = true;
      a.questBadges.push({id:def.id, name:def.name, emoji:def.emoji, chest:def.chest, earnedAt:Date.now()});
      anyDone.push(def);
    }
  });
  return anyDone;
}
function ensureArena(){
  if(!state.arena) state.arena = {};
  const a = state.arena;
  const campaignIds = activeCampaigns().map(c=>c.id);
  a.filters = a.filters || {status:"all", campaigns:campaignIds.slice()};
  if(!a.filters.campaigns || !a.filters.campaigns.length) a.filters.campaigns = campaignIds.slice();
  a.filters.campaigns = a.filters.campaigns.filter(id=>campaignIds.includes(id));
  if(!a.filters.campaigns.length) a.filters.campaigns = campaignIds.slice();
  a.difficulty = a.difficulty || "normal";
  a.score = a.score || {total:0, best:0};
  a.streakBest = a.streakBest || 0;
  a.achievements = a.achievements || [];
  a.campaignsPracticed = a.campaignsPracticed || [];
  a.stats = a.stats || {sessions:0, totalAnswered:0, totalCorrect:0, hintsUsed:0, resealedCount:0, byType:{}};
  ARENA_TYPES.forEach(t=>{ if(!a.stats.byType[t]) a.stats.byType[t] = {played:0, correct:0}; });
  ensureArenaQuests(a);
  a.campaignMastery = a.campaignMastery || {};
  activeCampaigns().forEach(campaign=>{
    if(!a.campaignMastery[campaign.id] || !a.campaignMastery[campaign.id].areas){
      a.campaignMastery[campaign.id] = {areas:new Array(5).fill(false)};
    }
  });
  a.grand = a.grand || {};
  if(!a.grand.areas || a.grand.areas.length!==10) a.grand.areas = new Array(10).fill(false);
  a.blitz = a.blitz || {played:0, best:0};
  a.hearts = Math.max(0, Math.min(ARENA_HEART_MAX, a.hearts == null ? ARENA_HEART_MAX : a.hearts));
  return a;
}
function arenaHeartCount(){ return ensureArena().hearts; }
function refillArenaHearts(amount, label){
  const a = ensureArena();
  const before = a.hearts;
  a.hearts = Math.min(ARENA_HEART_MAX, a.hearts + (amount || ARENA_HEART_MAX));
  const gained = a.hearts - before;
  if(gained > 0 && label){
    setTimeout(()=> showToast(`💛 <strong>${label}</strong><br><span style="font-size:11.5px;color:#9db4d6;">Arena hearts refilled: ${a.hearts}/${ARENA_HEART_MAX}</span>`, true), 250);
  }
  saveState();
  return gained;
}
function arenaHeartsHTML(extra){
  const n = arenaHeartCount();
  return `<div class="arena-heart-bank" title="Arena heart hints">
    ${Array.from({length:ARENA_HEART_MAX},(_,i)=>`<span class="heart ${i<n?'':'empty'}">${i<n?'💛':'♡'}</span>`).join("")}
    <span class="heart-label">${n}/${ARENA_HEART_MAX} hints</span>${extra||""}
  </div>`;
}
function refreshArenaHeartBanks(){
  try{
    document.querySelectorAll(".arena-heart-bank").forEach(el=>{ el.outerHTML = arenaHeartsHTML(); });
  }catch(e){}
}
function spendArenaHeart(T, q, label){
  const a = ensureArena();
  if(a.hearts <= 0){
    showToast(`♡ <strong>No Arena hearts left.</strong><br><span style="font-size:11.5px;color:#9db4d6;">Refill them by opening the daily blessing, sealing a verse, or polishing a seal.</span>`, true);
    SFX.wrong();
    return false;
  }
  a.hearts -= 1;
  if(T) T.hintsUsed += 1;
  if(q) q.hinted = true;
  saveState();
  refreshArenaHeartBanks();
  showToast(`💛 ${label || "Heart hint used"} · ${a.hearts}/${ARENA_HEART_MAX} left`);
  return true;
}
function campaignAreas(campaignId){
  const campaign = campaignById(campaignId);
  if(!campaign) return [[],[],[],[],[]];
  return campaignAreasFromIds(campaign.passageIds)
    .map(ids=>ids.map(passageById).filter(Boolean));
}
function grandAreas(){
  const sorted = shuffleArr(allPassages()).sort((a,b)=>difficultyForVerse(a).index - difficultyForVerse(b).index);
  const areaSize = Math.max(1, Math.ceil(sorted.length / 10));
  const areas = [];
  for(let i=0;i<10;i++) areas.push(sorted.slice(i*areaSize, (i+1)*areaSize));
  return areas;
}
function arenaFilteredPool(){
  const a = ensureArena();
  const passageIds = new Set(a.filters.campaigns.flatMap(id=>{
    const campaign = campaignById(id);
    return campaign ? campaign.passageIds : [];
  }));
  return allPassages().filter(v=>{
    if(!passageIds.has(v.id)) return false;
    const p = state.progress[v.id];
    if(a.filters.status==="memorized") return p.sealed;
    if(a.filters.status==="not_yet") return !p.sealed;
    return true;
  });
}
function arenaDistractors(v, count){
  const passages = allPassages();
  const campaign = primaryCampaignForPassage(v.id);
  const sameCampaignIds = new Set(campaign ? campaign.passageIds : []);
  const sameCampaign = shuffleArr(passages.filter(x=>x.id!==v.id && sameCampaignIds.has(x.id)));
  const rest = shuffleArr(passages.filter(x=>x.id!==v.id && !sameCampaignIds.has(x.id)));
  return sameCampaign.concat(rest).slice(0, count);
}
function pickRandomWord(){
  const passages = allPassages();
  const v = passages[Math.floor(Math.random()*passages.length)];
  /* t.core is already the word without its surrounding punctuation, which is
     what the old trailing .replace() was approximating. */
  const words = tokenWords(v.text).filter(t=>t.core.replace(/[^a-zA-Z]/g,"").length>2);
  const t = words[Math.floor(Math.random()*words.length)];
  return t ? t.core : "thing";
}
/* `start` is a word position; the lead-in is cut from the source so its
   punctuation survives. (The second branch below is unreachable — start<14
   forces leadStart to 0 — but it is preserved as-is: T3 changes tokenizing,
   not logic.) */
function scrambleLeadIn(text, start){
  if(start <= 0) return "";
  let leadStart = Math.max(0, start - 14);
  if(start - leadStart < 6 && leadStart > 0){
    leadStart = Math.max(0, start - 20);
  }
  return `${leadStart > 0 ? "… " : ""}${spanByWords(text, leadStart, start)}`;
}
function buildArenaQuestion(v, type, diffCfg){
  const q = {v, type, ok:null, hinted:false};
  if(type==="text2ref" || type==="ref2text" || type==="theme2ref" || type==="timedRecall"){
    const distract = arenaDistractors(v, diffCfg.options-1);
    q.options = shuffleArr([v].concat(distract));
    if(type==="timedRecall") q.timeLimit = diffCfg.timer;
  } else if(type==="finishVerse"){
    const n = wordCount(v.text);
    const cut = Math.max(2, Math.floor(n*0.6));
    const tailLen = Math.max(2, n-cut);
    q.lead = spanByWords(v.text, 0, cut);
    const correctEnd = spanByWords(v.text, cut);
    const distract = arenaDistractors(v, diffCfg.options-1).map(x=>
      spanByWords(x.text, Math.max(0, wordCount(x.text)-tailLen))
    );
    q.options = shuffleArr([correctEnd].concat(distract));
    q.correctEnd = correctEnd;
  } else if(type==="buildVerse"){
    q.chunks = chunkVerse(v.text);
    q.builtIndex = 0;
  } else if(type==="fillBlank"){
    /* q.words is the DISPLAY stream (punctuation included, whitespace not) so
       the sentence still reads correctly; q.blankIndex is a WORD position.
       Keeping those two separate is the whole point of T3 — a lone em dash
       occupies a display slot but not a word index. */
    const words = displayTokens(v.text);
    const last = wordCount(v.text) - 1;
    const candidates = words.filter(t => t.isWord && t.index>0 && t.index<last &&
                                         t.core.replace(/[^a-zA-Z]/g,"").length>2);
    const pick = candidates[Math.floor(Math.random()*candidates.length)] || words.find(t=>t.isWord);
    q.blankIndex = pick ? pick.index : 0;
    q.words = words;
    const clean = pick ? pick.core : "";
    q.correctWord = clean;
    const distract = [];
    let guard = 0;
    while(distract.length < diffCfg.options-1 && guard < 40){
      guard++;
      const w = pickRandomWord();
      if(w.toLowerCase()!==clean.toLowerCase() && !distract.includes(w)) distract.push(w);
    }
    q.options = shuffleArr([clean].concat(distract));
  } else if(type==="findError"){
    /* Same split: display stream for reading, word index for the answer. Only
       real words are tappable now — you can no longer be asked whether a
       free-standing dash is the word that does not belong. */
    const n = wordCount(v.text);
    const idx = n>2 ? 1+Math.floor(Math.random()*(n-2)) : 0;
    q.words = displayTokens(v.text).map(t => ({...t}));
    q.errorIndex = idx;
    const slot = q.words.find(t => t.isWord && t.index===idx);
    if(slot) slot.raw = pickRandomWord();
    q.retryUsed = false;
  } else if(type==="wordScramble"){
    const words = tokenWords(v.text);
    const n = Math.min(8, words.length);
    const start = words.length > n ? Math.floor(Math.random()*(words.length-n+1)) : 0;
    q.scrTarget = words.slice(start, start+n).map(t=>t.raw);
    q.scrStart = start;
    q.scrLead = scrambleLeadIn(v.text, start);
    q.scrPool = shuffleArr(q.scrTarget.map((w,k)=>({w, k})));
    q.scrNext = 0;
    q.scrMiss = 0;
    q.scrUsed = [];
  } else if(type==="pairMatch"){
    const trio = [v].concat(arenaDistractors(v, 2));
    q.pairLeft = shuffleArr(trio.map(x=>({id:x.id, label:x.ref})));
    q.pairRight = shuffleArr(trio.map(x=>({id:x.id, label:x.topic})));
    q.pairDone = {};
    q.pmMiss = 0;
    q.selL = null;
  }
  // fullRecitation needs no extra fields — self-reported
  return q;
}
function poolForMode(mode){
  if(mode.kind==="quick" || mode.kind==="quest" || mode.kind==="blitz") return arenaFilteredPool();
  if(mode.kind==="campaign") return campaignAreas(mode.campaignId)[mode.area];
  if(mode.kind==="grand") return grandAreas()[mode.area];
  return [];
}
function makeArenaRound(mode){
  const a = ensureArena();
  const diffCfg = ARENA_DIFF[a.difficulty];
  let rawPool = poolForMode(mode);
  let qs;
  if(mode.kind==="quest"){
    let pool = rawPool.length ? rawPool : allPassages();
    if(mode.type==="fullRecitation"){
      const sealedPool = pool.filter(v=>state.progress[v.id].sealed);
      if(sealedPool.length) pool = sealedPool;
    }
    pool = shuffleArr(pool).slice(0, Math.min(QUEST_ROUND_LEN[mode.type]||6, pool.length));
    qs = pool.map(v=> buildArenaQuestion(v, mode.type, diffCfg));
  } else if(mode.kind==="blitz"){
    const pool = rawPool.length >= 3 ? rawPool : allPassages();
    const seq = [];
    while(seq.length < 30) seq.push(...shuffleArr(pool));
    qs = seq.slice(0,30).map((v,i)=> buildArenaQuestion(v, BLITZ_TYPES[i%BLITZ_TYPES.length], diffCfg));
  } else {
    if(mode.kind==="quick") rawPool = shuffleArr(rawPool).slice(0, Math.min(8, rawPool.length));
    const types = shuffleArr(ARENA_TYPES);
    qs = rawPool.map((v,i)=> buildArenaQuestion(v, types[i%types.length], diffCfg));
  }
  return {
    mode, diffCfg, qs, i:0, correct:0, combo:0, bestCombo:0, score:0,
    hintsUsed:0, noHintCorrect:0, heartBonus:null, resealed:[], campaignsTouched:new Set(),
    /* T7: an explicit identity + reward flag for this one round, so
       finishArenaSession() can refuse to pay out twice for the same
       session even if it were ever called twice -- belt and suspenders
       alongside the `done` guard both its call sites already check. */
    sessionId: "arena_"+Date.now()+"_"+Math.random().toString(36).slice(2,8), rewarded:false,
    done:false, locked:false, newlyUnlocked:[], newQuestBadges:[], timeLeft:null, timerHandle:null,
    blitzEnd:null, blitzTimer:null
  };
}
/* Jump straight into a quest's own challenge type — the quest card IS the game mode. */
function startQuestRound(questId){
  const def = questDef(questId);
  if(!def) return;
  const a = ensureArena();
  const quests = ensureArenaQuests(a);
  const inst = quests.list.find(q=>q.id===questId);
  if(inst && inst.done){
    view.tab = "trials";
    view.trialRound = null;
    view.arenaStatsOpen = true;
    render();
    showToast(`${def.emoji} <strong>${def.name}</strong> is already won today. Its chest is on your Quest Shelf.`);
    window.scrollTo({top:0});
    return;
  }
  let round;
  if(def.track==="type") round = makeArenaRound({kind:"quest", type:def.type, questId});
  else if(def.track==="buildStep") round = makeArenaRound({kind:"quest", type:def.type, questId});
  else if(def.track==="blitz") round = makeArenaRound({kind:"blitz", questId});
  else round = makeArenaRound({kind:"quick", questId});
  if(!round.qs.length){ showToast("No scriptures match your Arena filters yet — study one first."); return; }
  view.trialRound = round;
  view.tab = "trials";
  render();
  window.scrollTo({top:0});
}
function unlockArenaAchievement(T, id){
  const a = ensureArena();
  if(a.achievements.includes(id)) return;
  a.achievements.push(id);
  T.newlyUnlocked.push(id);
}
function finishArenaSession(T){
  /* T7: idempotency guard. Both call sites already check T.done before
     calling this, but that flag has other jobs (blocking further
     answers, driving the results screen) -- T.rewarded exists only to
     answer "has this exact session already been paid," and answering
     it here means a future call site forgetting the T.done check still
     can't double-pay. */
  if(T.rewarded) return;
  const a = ensureArena();
  if(T.blitzTimer){ clearInterval(T.blitzTimer); T.blitzTimer = null; }
  const answered = T.qs.filter(q=>q.ok!==null).length;
  const total = T.mode.kind==="blitz" ? answered : T.qs.length;
  const perfect = T.mode.kind==="blitz" ? false : (total>0 && T.correct === total);
  if(T.mode.kind==="blitz"){
    a.blitz.played += 1;
    a.blitz.best = Math.max(a.blitz.best, T.correct);
    T.newQuestBadges = T.newQuestBadges.concat(setArenaQuestProgress(a, def=>def.track==="blitz", T.correct));
    if(T.correct >= 15) unlockArenaAchievement(T, "blitz_ace");
  }
  const completedForHeartBonus = total > 0 && T.correct > 0 && (T.mode.kind==="blitz" ? answered > 0 : answered === total);
  if(completedForHeartBonus){
    if(T.hintsUsed === 0){
      T.heartBonus = {
        xp:25,
        label:"Heartstrong Finish",
        desc:"Completed without using a heart. Bonus XP!"
      };
    } else if(T.hintsUsed === 1){
      T.heartBonus = {
        xp:10,
        label:"One-Heart Climb",
        desc:"Completed using only 1 heart. Good job!"
      };
    }
    if(T.heartBonus) T.score += T.heartBonus.xp;
  }
  a.score.total += T.score;
  a.score.best = Math.max(a.score.best, T.score);
  a.streakBest = Math.max(a.streakBest, T.bestCombo);
  T.campaignsTouched.forEach(id=>{ if(!a.campaignsPracticed.includes(id)) a.campaignsPracticed.push(id); });

  unlockArenaAchievement(T, "first_session");
  if(T.bestCombo >= 10) unlockArenaAchievement(T, "streak10");
  if(perfect) unlockArenaAchievement(T, "perfect");
  if(activeCampaigns().every(c=>a.campaignsPracticed.includes(c.id))) unlockArenaAchievement(T, "all_books");

  a.stats.sessions += 1;
  a.stats.hintsUsed += T.hintsUsed;
  a.stats.resealedCount += T.resealed.length;
  T.newQuestBadges = T.newQuestBadges.concat(bumpArenaQuests(a, def=>def.track==="session", 1));
  if(perfect) T.newQuestBadges = T.newQuestBadges.concat(bumpArenaQuests(a, def=>def.track==="perfect", 1));

  if(T.mode.kind==="campaign"){
    const complete = perfect;
    if(complete){
      a.campaignMastery[T.mode.campaignId].areas[T.mode.area] = true;
      unlockArenaAchievement(T, "book_area");
      if(a.campaignMastery[T.mode.campaignId].areas.every(Boolean)) unlockArenaAchievement(T, "book_mastery");
    }
  } else if(T.mode.kind==="grand"){
    if(perfect){
      a.grand.areas[T.mode.area] = true;
      if(a.grand.areas.every(Boolean)) unlockArenaAchievement(T, "grand_mastery");
    }
  }
  const masteredCount = allPassages().filter(v=>state.progress[v.id].sealed).length;
  if(masteredCount>=25) unlockArenaAchievement(T, "mastered25");
  if(masteredCount>=50) unlockArenaAchievement(T, "mastered50");
  if(masteredCount>=100) unlockArenaAchievement(T, "mastered100");

  state.xp += T.score;
  touchStreak();
  T.rewarded = true;
  claimReward("arena:"+T.sessionId);
  saveState();
}
function scoreForType(type){
  if(type==="fullRecitation") return 25;
  if(type==="buildVerse" || type==="timedRecall" || type==="wordScramble" || type==="pairMatch") return 15;
  return 10;
}
function settleAnswer(T, q, correct, opts){
  opts = opts || {};
  q.ok = correct;
  if(q.timerHandle){ clearInterval(q.timerHandle); q.timerHandle=null; }
  campaignsForPassage(q.v.id).forEach(c=>T.campaignsTouched.add(c.id));
  const a = ensureArena();
  a.stats.totalAnswered += 1;
  a.stats.byType[q.type].played += 1;
  if(correct){
    T.combo += 1;
    T.bestCombo = Math.max(T.bestCombo, T.combo);
    T.correct += 1;
    let gained = scoreForType(q.type) + Math.min(20, (T.combo-1)*2);
    if(!q.hinted){ gained += 5; T.noHintCorrect += 1; }
    if(opts.penalty) gained = Math.max(3, gained - opts.penalty);
    T.score += gained;
    q.gained = gained;
    a.stats.totalCorrect += 1;
    a.stats.byType[q.type].correct += 1;
    T.newQuestBadges = T.newQuestBadges.concat(bumpArenaQuests(a, def=>def.track==="type" && def.type===q.type, 1));
    T.newQuestBadges = T.newQuestBadges.concat(setArenaQuestProgress(a, def=>def.track==="streak", T.combo));
    const p = state.progress[q.v.id];
    /* T6: Full Recitation is the self-report evidence type from
       ROADMAP.md §2.3's evidence table — "hard max, no peek". Peeking
       (q.hinted, set by the same spendArenaHeart() the hint button calls)
       makes this round worth Arena points but not re-seal evidence: you
       looked at the words, so it can no longer stand in for having
       recalled them. First-seal-via-self-report is already impossible
       here since isDue() requires p.sealed. */
    if(isDue(p) && !(q.type==="fullRecitation" && q.hinted)){
      const res = resealVerse(p);
      T.score += res.xp;
      T.resealed.push(q.v);
      emitBridge(res.eternal ? "eternal" : "reseal", q.v, res.xp);
    } else if(isDue(p) && q.type==="fullRecitation" && q.hinted){
      setTimeout(()=> showToast(`👀 <strong>Peeked, so it didn't count toward re-sealing.</strong><br><span style="font-size:11.5px;color:#9db4d6;">Still earned Arena points for ${q.v.ref}. Recite it without looking to refresh the seal.</span>`, true), 250);
    }
    if(q.type==="fullRecitation" && !q.hinted && p.sealed){
      const T2 = view.trialRound;
      if(T2) unlockArenaAchievement(T2, "recite_no_hints");
    }
  } else {
    T.combo = 0;
  }
  saveState(); /* persist stats + quest progress per answer, not just at session end */
}
function recordArenaQuestStep(T, matchFn, amount){
  const a = ensureArena();
  T.newQuestBadges = T.newQuestBadges.concat(bumpArenaQuests(a, matchFn, amount || 1));
  saveState();
}
function questHudHTML(T){
  const questId = T.mode.questId;
  if(!questId) return "";
  const a = ensureArena();
  const quests = ensureArenaQuests(a);
  const inst = quests.list.find(q=>q.id===questId);
  const def = questDef(questId);
  if(!inst || !def) return "";
  const pct = Math.round((inst.progress/inst.goal)*100);
  return `
    <div class="quest-hud">
      <div class="quest-hud-top"><span>${def.emoji} ${def.name}</span><span class="quest-progress">${inst.progress}/${inst.goal}</span></div>
      <div class="quest-hud-desc">${def.desc}</div>
      <span class="quest-bar"><i style="width:${pct}%"></i></span>
    </div>`;
}
function chunkVerseOptions(q){ return q.options; }

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.shuffleArr = shuffleArr;
SQ.trialPool = trialPool;
SQ.trialSnippet = trialSnippet;
SQ.arenaTitleFor = arenaTitleFor;
SQ.ensureArenaQuests = ensureArenaQuests;
SQ.questDef = questDef;
SQ.bumpArenaQuests = bumpArenaQuests;
SQ.setArenaQuestProgress = setArenaQuestProgress;
SQ.ensureArena = ensureArena;
SQ.arenaHeartCount = arenaHeartCount;
SQ.refillArenaHearts = refillArenaHearts;
SQ.arenaHeartsHTML = arenaHeartsHTML;
SQ.refreshArenaHeartBanks = refreshArenaHeartBanks;
SQ.spendArenaHeart = spendArenaHeart;
SQ.campaignAreas = campaignAreas;
SQ.grandAreas = grandAreas;
SQ.arenaFilteredPool = arenaFilteredPool;
SQ.arenaDistractors = arenaDistractors;
SQ.pickRandomWord = pickRandomWord;
SQ.scrambleLeadIn = scrambleLeadIn;
SQ.buildArenaQuestion = buildArenaQuestion;
SQ.poolForMode = poolForMode;
SQ.makeArenaRound = makeArenaRound;
SQ.startQuestRound = startQuestRound;
SQ.unlockArenaAchievement = unlockArenaAchievement;
SQ.finishArenaSession = finishArenaSession;
SQ.scoreForType = scoreForType;
SQ.settleAnswer = settleAnswer;
SQ.recordArenaQuestStep = recordArenaQuestStep;
SQ.questHudHTML = questHudHTML;
SQ.chunkVerseOptions = chunkVerseOptions;
