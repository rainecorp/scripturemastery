/* 16-shell.js
   view state, app element, render() dispatch, filter chips
   Extracted verbatim from index.html lines 5414-5519 by T2. */
/* =========================================================
   VIEW STATE + SHELL
   ========================================================= */
let view = {tab:"today", filter:"gettingStarted", campaignId:null, passageId:null, stage:0, blanked:new Set(), editing:false, reviewMode:false, stageFor:null, trialRound:null, arenaSettingsOpen:false, arenaBadgesOpen:false, arenaStatsOpen:false, highlightMode:true, chainOpen:false};
const app = document.getElementById("app");

function nextRankInfo(){
  let curT = 0, curName = RANKS[0][1], nextT = null, nextName = null;
  RANKS.forEach(([t,n])=>{ if(state.xp>=t){ curT = t; curName = n; } });
  const nxt = RANKS.find(([t])=>t>state.xp);
  if(nxt){ nextT = nxt[0]; nextName = nxt[1]; }
  const pct = nextT ? Math.round(((state.xp-curT)/(nextT-curT))*100) : 100;
  return {curName, nextT, nextName, pct};
}
function render(){
  const mastered = allPassages().filter(v=>state.progress[v.id] && state.progress[v.id].sealed).length;
  const due = dueReviews().length;
  const rk = nextRankInfo();
  const tier = streakTier(state.streak);
  const achvN = achvUnlockedCount();
  app.innerHTML = `
    <header class="top">
      <div class="hdr-btns">
        <button class="hdr-round" id="achvBtn" title="Achievements"><span>🏆</span><span class="hdr-achv-n">${achvN}</span></button>
        <button class="hdr-round" id="soundBtn" title="${state.sound!==false ? "Sound on" : "Sound off"}">${state.sound!==false ? "🔊" : "🔇"}</button>
      </div>
      <div class="brand">
        <small>Line Upon Line</small>
        <h1>Scripture Quest</h1>
        <div class="rank-chip">✦ ${rk.curName}${CLIMBER ? " · " + escHTML(CLIMBER) : ""}</div>
        ${FROM_DQ || CLIMBER ? `<div class="dq-back" id="dqBack">◂ Back to Daily Quest</div>` : ""}
      </div>
      <div class="stats">
        <div class="stat stat-tap" id="statXp">
          <div class="n">${state.xp}</div><div class="l">XP</div>
        </div>
        <div class="stat stat-tap stat-streak tier-${tier}" id="statStreak">
          <div class="n"><span class="flame">🔥</span>${state.streak}${(state.shields||0) ? `<span class="shield-mini" title="Streak shields">🛡️${state.shields>1?"×"+state.shields:""}</span>` : ""}</div>
          <div class="l">Day streak</div>
        </div>
        <div class="stat stat-tap" id="statSealed"><div class="n">${mastered}/${allPassages().length}</div><div class="l">Sealed</div></div>
      </div>
      <div class="rank-bar" title="${rk.nextT ? `${rk.nextT - state.xp} XP to ${rk.nextName}` : "Highest rank reached"}">
        <div class="rank-bar-track"><i style="width:${rk.pct}%"></i></div>
        <div class="rank-bar-label">${rk.nextT ? `${rk.nextT - state.xp} XP to <strong>${rk.nextName}</strong>` : `⭐ Highest rank achieved`}</div>
      </div>
    </header>
    <nav class="tabs">
      <button data-tab="today" class="${view.tab==='today'?'active':''}"><span class="tab-ico">🏕️${due?`<i class="tab-dot">${due}</i>`:''}</span><span class="tab-txt">Today</span></button>
      <button data-tab="towers" class="${view.tab==='towers'?'active':''}"><span class="tab-ico">🗼</span><span class="tab-txt">Towers</span></button>
      <button data-tab="shelf" class="${view.tab==='shelf'?'active':''}"><span class="tab-ico">🏺</span><span class="tab-txt">Shelf</span></button>
      <button data-tab="trials" class="${view.tab==='trials'?'active':''}"><span class="tab-ico">⚔️</span><span class="tab-txt">Arena</span></button>
      <button data-tab="library" class="${view.tab==='library'?'active':''}"><span class="tab-ico">📚</span><span class="tab-txt">Collection</span></button>
      <button data-tab="study" class="${view.tab==='study'?'active':''}"><span class="tab-ico">📖</span><span class="tab-txt">Study</span></button>
    </nav>
    ${view.tab==='library' ? `
      <div class="legend-row">
        <div class="legend-pill">🔖 Popular / often quoted</div>
        <div class="legend-pill">🎚️ Difficulty is based on scripture length</div>
      </div>
      ${renderFilterPanelHTML()}` : ''}
    <div id="body"></div>
  `;
  const dqb = document.getElementById("dqBack");
  if(dqb) dqb.onclick = ()=>{
    if(document.referrer && document.referrer.indexOf(location.origin) === 0) history.back();
    else location.href = DAILY_QUEST_URL;
  };
  document.getElementById("achvBtn").onclick = ()=>{ SFX.tap(); openAchvPop(); };
  document.getElementById("soundBtn").onclick = ()=>{
    state.sound = state.sound === false;
    saveState();
    render();
    if(state.sound !== false) SFX.correct(1);
  };
  document.getElementById("statXp").onclick = ()=> openAchvPop();
  document.getElementById("statStreak").onclick = ()=>{
    if(view.tab !== "today"){ view.tab = "today"; render(); }
    const el = document.getElementById("checkinCard");
    if(el) el.scrollIntoView({behavior:"smooth", block:"center"});
  };
  document.getElementById("statSealed").onclick = ()=>{ view.tab = "shelf"; render(); window.scrollTo({top:0}); };
  app.querySelectorAll("nav.tabs button").forEach(b=>{
    b.onclick = ()=>{
      SFX.tap();
      if(b.dataset.tab==='study' && !view.passageId){ view.passageId = recommendedVerse().id; view.stage = state.progress[view.passageId].stage; view.blanked = new Set(); view.reviewMode=false; }
      if(b.dataset.tab==='towers'){ view.campaignId = null; }
      view.tab = b.dataset.tab;
      render();
    };
  });
  bindFilterChips();
  if(view.tab==='today') renderToday();
  else if(view.tab==='towers') renderTowers();
  else if(view.tab==='shelf') renderShelf();
  else if(view.tab==='trials') renderTrials();
  else if(view.tab==='library') renderLibrary();
  else renderStudy();
  applySpot();
}
function bindFilterChips(){
  app.querySelectorAll(".filter-chip").forEach(b=>{
    b.onclick = ()=>{ view.filter = b.dataset.filter; render(); };
  });
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
Object.defineProperty(SQ,"view",{get:()=>view,set:v=>{view=v;},enumerable:true,configurable:true});
SQ.app = app;
SQ.nextRankInfo = nextRankInfo;
SQ.render = render;
SQ.bindFilterChips = bindFilterChips;
