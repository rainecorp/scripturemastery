/* 16-shell.js
   view state, app element, render() dispatch, filter chips
   Extracted verbatim from index.html lines 5414-5519 by T2. */
/* =========================================================
   VIEW STATE + SHELL
   ========================================================= */
let view = {tab:"today", filter:"gettingStarted", campaignId:null, passageId:null, stage:0, blanked:new Set(), editing:false, reviewMode:false, stageFor:null, trialRound:null, phraseRound:null, customOpen:false, customFormOpen:false, customEditingId:null, arenaSettingsOpen:false, arenaBadgesOpen:false, arenaStatsOpen:false, highlightMode:true, studyMode:"meaning", troubleDrill:null, troubleFeedback:null, chainOpen:false};
const app = document.getElementById("app");

function chooseOnboardingPath(choice){
  if(!["seminary","christian","explore"].includes(choice)) return;
  const trackId = choice === "christian" ? "christian" : "seminary";
  const track = trackById(trackId);
  state.track = trackId;
  state.translation = track.defaultTranslation;
  state.startingCampaignId = track.startingCampaignId
    || (trackId === "seminary" ? "camp_dm_bom" : track.campaignIds[0]);
  state.onboardingChoice = choice;
  state.onboardingComplete = true;
  saveState();
  view.tab = "today";
  view.campaignId = null;
  render();
  window.scrollTo({top:0});
}

function renderOnboarding(){
  app.innerHTML = `
    <main class="path-onboarding">
      <div class="path-mark">✦ LINE UPON LINE</div>
      <div class="path-glyph">🗼</div>
      <h1>Which path are you climbing?</h1>
      <p class="path-intro">Choose the scripture path you want in front of you first. Progress belongs to each passage, so adding another path later never erases what you have learned.</p>
      <div class="path-grid">
        <button class="path-card path-ready" data-path="seminary">
          <span class="path-icon">🎓</span>
          <strong>Seminary</strong>
          <b>Doctrinal Mastery</b>
          <small>The official current curriculum, key scripture phrases, Articles of Faith, and the heritage Scripture Mastery collection.</small>
          <em>Begin this path ▸</em>
        </button>
        <button class="path-card path-ready" data-path="christian">
          <span class="path-icon">✝️</span>
          <strong>Christian Scripture Memory</strong>
          <b>Six complete starter paths</b>
          <small>Foundations, the Gospel, comfort, spiritual armor, Psalms, and verses for kids in the public-domain BSB or KJV.</small>
          <em>Begin this path ▸</em>
        </button>
        <button class="path-card" disabled aria-disabled="true">
          <span class="path-icon">🏡</span>
          <strong>Family / Kids</strong>
          <b>Coming with family content</b>
          <small>A gentler shared path designed for children and family practice.</small>
          <em>Coming soon</em>
        </button>
        <button class="path-card path-ready path-explore" data-path="explore">
          <span class="path-icon">🧭</span>
          <strong>Just show me around</strong>
          <b>Explore before deciding</b>
          <small>Open the Seminary collection for now and wander through every tower at your own pace.</small>
          <em>Enter Scripture Quest ▸</em>
        </button>
      </div>
      <div class="path-note">You can add more paths later. Memorizing a shared passage once counts everywhere it appears.</div>
    </main>`;
  app.querySelectorAll(".path-ready[data-path]").forEach(button=>{
    button.onclick = ()=> chooseOnboardingPath(button.dataset.path);
  });
}

function nextRankInfo(){
  let curT = 0, curName = RANKS[0][1], nextT = null, nextName = null;
  RANKS.forEach(([t,n])=>{ if(state.xp>=t){ curT = t; curName = n; } });
  const nxt = RANKS.find(([t])=>t>state.xp);
  if(nxt){ nextT = nxt[0]; nextName = nxt[1]; }
  const pct = nextT ? Math.round(((state.xp-curT)/(nextT-curT))*100) : 100;
  return {curName, nextT, nextName, pct};
}
function switchTrack(trackId){
  const track = trackById(trackId);
  if(!track || track.id === state.track) return;
  state.track = track.id;
  state.translation = track.defaultTranslation;
  state.startingCampaignId = track.startingCampaignId || track.campaignIds[0];
  state.climb = state.climb || {};
  activeCampaigns().forEach(c=>{ if(!state.climb[c.id]) state.climb[c.id] = []; });
  view = {...view, tab:"today", campaignId:null, passageId:null, trialRound:null, phraseRound:null};
  saveState(); render(); window.scrollTo({top:0});
}
function switchTranslation(translation){
  if(!translationOptionsForTrack().includes(translation) || translation === state.translation) return;
  state.translation = translation;
  saveState(); render();
}
function pathControlsHTML(){
  const translations = translationOptionsForTrack();
  const names = {bsb:"BSB",kjv:"KJV"};
  return `<div class="path-controls" aria-label="Scripture path and translation">
    <label><span>Path</span><select id="trackPicker">${allTracks().map(t=>`<option value="${escHTML(t.id)}" ${t.id===activeTrack().id?"selected":""}>${escHTML(t.id==="seminary"?"Seminary":t.name)}</option>`).join("")}</select></label>
    ${translations.length>1?`<label><span>Translation</span><select id="translationPicker">${translations.map(id=>`<option value="${id}" ${id===state.translation?"selected":""}>${names[id]||id.toUpperCase()}</option>`).join("")}</select></label>`:""}
  </div>`;
}
function render(){
  if(!state.onboardingComplete){ renderOnboarding(); return; }
  const mastered = activePassages().filter(v=>state.progress[v.id] && state.progress[v.id].sealed).length;
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
        <div class="stat stat-tap" id="statSealed"><div class="n">${mastered}/${activePassages().length}</div><div class="l">Sealed</div></div>
      </div>
      <div class="rank-bar" title="${rk.nextT ? `${rk.nextT - state.xp} XP to ${rk.nextName}` : "Highest rank reached"}">
        <div class="rank-bar-track"><i style="width:${rk.pct}%"></i></div>
        <div class="rank-bar-label">${rk.nextT ? `${rk.nextT - state.xp} XP to <strong>${rk.nextName}</strong>` : `⭐ Highest rank achieved`}</div>
      </div>
      ${pathControlsHTML()}
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
  document.getElementById("trackPicker").onchange = event=>switchTrack(event.target.value);
  const translationPicker = document.getElementById("translationPicker");
  if(translationPicker) translationPicker.onchange = event=>switchTranslation(event.target.value);
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
SQ.switchTrack = switchTrack;
SQ.switchTranslation = switchTranslation;
SQ.pathControlsHTML = pathControlsHTML;
SQ.chooseOnboardingPath = chooseOnboardingPath;
SQ.renderOnboarding = renderOnboarding;
SQ.render = render;
SQ.bindFilterChips = bindFilterChips;
