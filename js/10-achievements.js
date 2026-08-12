/* 10-achievements.js
   achievement definitions, progress, sweep, overlay
   Extracted verbatim from index.html lines 3644-3849 by T2. */
/* =========================================================
   ACHIEVEMENTS — app-wide, computed from state. Encouraging
   by design: every locked badge shows live progress.
   ========================================================= */
function sealedTotal(){ return allPassages().filter(v=>state.progress[v.id].sealed).length; }
function eternalTotal(){ return allPassages().filter(v=>isEternal(state.progress[v.id])).length; }
function provenTotal(){ return allPassages().filter(v=>state.progress[v.id].provenIt).length; }
function hasCrownedCampaign(){
  return activeCampaigns().some(c=>{
    const s = towerStats(c.id);
    return s.total > 0 && s.sealed === s.total;
  }) ? 1 : 0;
}
const ACHIEVEMENTS = [
  {id:"first_shard", cat:"climb", emoji:"✨", name:"First Light",        desc:"Uncover your first relic shard", goal:1,
    cur:()=> allPassages().some(v=>{const p=state.progress[v.id]; return p.sealed||(p.stage||0)>0;}) ? 1 : 0},
  {id:"first_seal", cat:"climb", emoji:"🏺", name:"Relic Keeper",       desc:"Seal your first verse", goal:1, cur:sealedTotal},
  {id:"seals_5",    cat:"climb", emoji:"🗼", name:"Five Floors High",   desc:"Seal 5 verses", goal:5, cur:sealedTotal},
  {id:"seals_10",   cat:"climb", emoji:"🌄", name:"Above the Mist",     desc:"Seal 10 verses", goal:10, cur:sealedTotal},
  {id:"seals_25",   cat:"climb", emoji:"🏰", name:"Tower Heart",        desc:"Seal 25 verses", goal:25, cur:sealedTotal},
  {id:"seals_50",   cat:"climb", emoji:"⛰️", name:"Summit Seeker",      desc:"Seal 50 verses", goal:50, cur:sealedTotal},
  {id:"seals_100",  cat:"climb", emoji:"🌟", name:"Keeper of All Words",desc:"Seal all 100 verses", goal:100, cur:sealedTotal},
  {id:"crowned",    cat:"climb", emoji:"👑", name:"Crowned Tower",      desc:"Complete every floor of one tower", goal:1, cur:hasCrownedCampaign},
  {id:"eternal_1",  cat:"climb", emoji:"♾️", name:"Written on the Heart", desc:"Earn your first Eternal Seal", goal:1, cur:eternalTotal},
  {id:"eternal_5",  cat:"climb", emoji:"💎", name:"Unfading Five",      desc:"Hold 5 Eternal Seals", goal:5, cur:eternalTotal},
  {id:"proven_5",   cat:"climb", emoji:"🧩", name:"Proof Positive",     desc:"Prove 5 verses in perfect order", goal:5, cur:provenTotal},
  {id:"reseal_10",  cat:"climb", emoji:"🕯️", name:"Flame Tender",       desc:"Restore 10 fading seals", goal:10, cur:()=>state.resealsTotal||0},

  {id:"streak_3",   cat:"habit", emoji:"🔥", name:"Kindled",            desc:"Reach a 3-day streak", goal:3, cur:()=>state.bestStreak||0},
  {id:"streak_7",   cat:"habit", emoji:"🛡️", name:"Week of Fire",       desc:"Reach a 7-day streak", goal:7, cur:()=>state.bestStreak||0},
  {id:"streak_14",  cat:"habit", emoji:"⚡", name:"Fortnight Flame",    desc:"Reach a 14-day streak", goal:14, cur:()=>state.bestStreak||0},
  {id:"streak_30",  cat:"habit", emoji:"🌋", name:"Unquenchable",       desc:"Reach a 30-day streak", goal:30, cur:()=>state.bestStreak||0},
  {id:"checkin_3",  cat:"habit", emoji:"🌱", name:"Showing Up",         desc:"Check in on 3 different days", goal:3, cur:checkinCount},
  {id:"checkin_7",  cat:"habit", emoji:"🌿", name:"Rooted",             desc:"Check in on 7 different days", goal:7, cur:checkinCount},
  {id:"checkin_30", cat:"habit", emoji:"🌳", name:"Deep Roots",         desc:"Check in on 30 different days", goal:30, cur:checkinCount},

  {id:"arena_1",    cat:"arena", emoji:"⚔️", name:"First Blood… er, Verse", desc:"Finish an Arena session", goal:1, cur:()=>ensureArena().stats.sessions},
  {id:"arena_20",   cat:"arena", emoji:"🏟️", name:"Arena Veteran",      desc:"Finish 20 Arena sessions", goal:20, cur:()=>ensureArena().stats.sessions},
  {id:"quests_5",   cat:"arena", emoji:"🎁", name:"Quest Collector",    desc:"Win 5 daily quest chests", goal:5, cur:()=>(ensureArena().questBadges||[]).length},
  {id:"quests_15",  cat:"arena", emoji:"🛖", name:"Chest Hoarder",      desc:"Win 15 daily quest chests", goal:15, cur:()=>(ensureArena().questBadges||[]).length},
  {id:"blitz_1",    cat:"arena", emoji:"⚡", name:"Storm Chaser",       desc:"Survive a Lightning Round", goal:1, cur:()=>(ensureArena().blitz||{}).played||0},

  {id:"rank_scribe",   cat:"journey", emoji:"🖋️", name:"Scribe",        desc:"Reach 150 XP", goal:150, cur:()=>state.xp},
  {id:"rank_guardian", cat:"journey", emoji:"🛡️", name:"Guardian",      desc:"Reach 900 XP", goal:900, cur:()=>state.xp},
  {id:"rank_keeper",   cat:"journey", emoji:"📜", name:"Keeper of the Word", desc:"Reach 3200 XP", goal:3200, cur:()=>state.xp},
  {id:"share_1",       cat:"journey", emoji:"📣", name:"Light on a Hill", desc:"Share your progress once", goal:1, cur:()=>state.shares||0}
];
const ACHV_CATS = [
  {id:"climb",  label:"🗼 The Climb"},
  {id:"habit",  label:"🔥 The Habit"},
  {id:"arena",  label:"⚔️ The Arena"},
  {id:"journey",label:"🧭 The Journey"}
];
function achvCur(a){ try{ return Math.min(a.goal, a.cur()); }catch(e){ return 0; } }
/* Tap an achievement → jump to the screen (and button) that earns it. */
function applySpot(){
  const sel = view.spot; if(!sel) return; view.spot = null;
  const el = document.getElementById(sel) || document.querySelector(sel);
  if(!el) return;
  el.classList.add("spotlit");
  setTimeout(()=>{ try{ el.scrollIntoView({behavior:"smooth", block:"center"}); }catch(e){} }, 250);
  setTimeout(()=>el.classList.remove("spotlit"), 6500);
}
function achvGo(id){
  SFX.tap();
  const goTab = (tab, spot)=>{
    view.spot = spot || null;
    if(tab==="trials") view.trialRound = null;
    if(tab==="towers") view.campaignId = null;
    view.tab = tab; render(); window.scrollTo({top:0});
  };
  const goVerse = (v, review, spot)=>{ view.spot = spot || null; openStudy(v.id, !!review); };
  const dueV = allPassages().find(v=>isDue(state.progress[v.id]));
  switch(id){
    case "first_shard": case "rank_scribe": case "rank_guardian": case "rank_keeper":
      goVerse(recommendedVerse(), false); break;
    case "first_seal":
      goVerse(recommendedVerse(), false, "nextStage"); break;
    case "seals_5": case "seals_10": case "seals_25": case "seals_50": case "seals_100": case "crowned":
      goTab("towers"); break;
    case "proven_5": {
      const t = allPassages().find(v=>state.progress[v.id].sealed && !state.progress[v.id].provenIt) || recommendedVerse();
      goVerse(t, isDue(state.progress[t.id]), "proveItBtn"); break;
    }
    case "eternal_1": case "eternal_5": case "reseal_10":
      if(dueV) goVerse(dueV, true, "nextStage");
      else goTab("towers");
      break;
    case "streak_3": case "streak_7": case "streak_14": case "streak_30":
    case "checkin_3": case "checkin_7": case "checkin_30":
      goTab("today", "checkinCard"); break;
    case "blitz_1":
      goTab("trials", "arenaBlitz"); break;
    case "arena_1": case "arena_20":
      goTab("trials", "arenaQuick"); break;
    case "quests_5": case "quests_15":
      goTab("trials", ".quest-list"); break;
    case "share_1":
      openAchvPop(); view.spot = "achvShare"; applySpot(); break;
    default:
      goTab("today");
  }
}
function achvUnlockedCount(){ return Object.keys((state.achv||{}).unlocked||{}).length; }
function topProgressingAchievements(n){
  return ACHIEVEMENTS
    .filter(a=>!state.achv.unlocked[a.id])
    .map(a=>({a, cur:achvCur(a), pct:achvCur(a)/a.goal}))
    .sort((x,y)=> y.pct - x.pct || x.a.goal - y.a.goal)
    .slice(0, n||5);
}
let _achvBusy = false;
function checkAchievements(){
  if(_achvBusy) return [];
  _achvBusy = true;
  const fresh = [];
  try{
    for(let pass=0; pass<3; pass++){
      let any = false;
      ACHIEVEMENTS.forEach(a=>{
        if(state.achv.unlocked[a.id]) return;
        if(achvCur(a) >= a.goal){
          state.achv.unlocked[a.id] = Date.now();
          state.xp += 10;
          fresh.push(a);
          any = true;
        }
      });
      if(!any) break;
    }
    if(fresh.length){
      persistState();
      if(fresh.length > 2){
        setTimeout(()=>{ showToast(`🏆 <strong>${fresh.length} achievements unlocked!</strong><br><span style="font-size:11.5px;color:#9db4d6;">Tap the 🏆 trophy up top to see them all.</span>`, true); SFX.milestone(); FX.rain({count:80}); }, 350);
      } else {
        fresh.forEach((a,i)=> setTimeout(()=>{
          showToast(`🏆 Achievement unlocked: <strong>${a.emoji} ${a.name}</strong><br><span style="font-size:11.5px;color:#9db4d6;">${a.desc} · +10 XP</span>`, true);
          SFX.milestone(); FX.rain({count:55});
        }, 350 + i*2600));
      }
      const hdr = document.querySelector(".hdr-achv-n");
      if(hdr) hdr.textContent = achvUnlockedCount();
    }
  } finally { _achvBusy = false; }
  return fresh;
}

/* =========================================================
   ACHIEVEMENTS OVERLAY — every badge, grouped, with live
   progress bars so the next win always feels close.
   ========================================================= */
function openAchvPop(){
  const pop = document.getElementById("achvPop");
  if(!pop) return;
  const total = ACHIEVEMENTS.length;
  const got = achvUnlockedCount();
  const pct = Math.round((got/total)*100);
  pop.innerHTML = `
    <div class="cer-backdrop" id="achvBackdrop"></div>
    <div class="relic-pop-stage">
      <div class="relic-pop-card achv-card">
        <button class="rp-close" id="achvClose" aria-label="Close">✕</button>
        <div class="achv-head">
          <div class="achv-trophy">🏆</div>
          <div class="rp-ref">Achievements</div>
          <div class="achv-count">${got} of ${total} earned</div>
          <div class="achv-total-bar"><i style="width:${pct}%"></i></div>
        </div>
        ${ACHV_CATS.map(cat=>{
          const items = ACHIEVEMENTS.filter(a=>a.cat===cat.id);
          return `
            <div class="achv-cat">
              <div class="achv-cat-title">${cat.label} <span>${items.filter(a=>state.achv.unlocked[a.id]).length}/${items.length}</span></div>
              ${items.map(a=>{
                const un = state.achv.unlocked[a.id];
                const cur = achvCur(a);
                const p = Math.round((cur/a.goal)*100);
                return `
                  <div class="achv-item ${un?'won':'achv-link'}" ${un?'':`data-achv="${a.id}" title="Tap to go earn ${a.name}"`}>
                    <div class="achv-badge">${a.emoji}</div>
                    <div class="achv-info">
                      <div class="achv-name">${a.name} ${un?'<span class="achv-check">✓</span>':''}</div>
                      <div class="achv-desc">${a.desc}</div>
                      ${un ? '' : `<div class="achv-bar"><i style="width:${p}%"></i></div>`}
                    </div>
                    <div class="achv-prog">${un ? new Date(un).toLocaleDateString(undefined,{month:"short",day:"numeric"}) : `${cur}/${a.goal}`}</div>
                  </div>`;
              }).join("")}
            </div>`;
        }).join("")}
        <div class="rp-btns">
          <button class="btn primary" id="achvShare">📣 Share my badges</button>
        </div>
      </div>
    </div>`;
  pop.classList.add("show");
  const close = ()=>{ pop.classList.remove("show"); pop.innerHTML = ""; };
  document.getElementById("achvClose").onclick = close;
  document.getElementById("achvBackdrop").onclick = close;
  pop.querySelectorAll(".achv-item[data-achv]").forEach(el=>{
    el.onclick = ()=>{
      const id = el.dataset.achv;
      if(id==="share_1"){ view.spot = "achvShare"; applySpot(); return; }
      close(); achvGo(id);
    };
  });
  document.getElementById("achvShare").onclick = ()=>{
    shareText(`🏆 I've earned ${got} of ${total} achievements in Scripture Quest — ${sealedTotal()} verses sealed and a ${state.streak}-day streak! 🔥`);
  };
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.sealedTotal = sealedTotal;
SQ.eternalTotal = eternalTotal;
SQ.provenTotal = provenTotal;
SQ.hasCrownedCampaign = hasCrownedCampaign;
SQ.ACHIEVEMENTS = ACHIEVEMENTS;
SQ.ACHV_CATS = ACHV_CATS;
SQ.achvCur = achvCur;
SQ.applySpot = applySpot;
SQ.achvGo = achvGo;
SQ.achvUnlockedCount = achvUnlockedCount;
SQ.topProgressingAchievements = topProgressingAchievements;
Object.defineProperty(SQ,"_achvBusy",{get:()=>_achvBusy,set:v=>{_achvBusy=v;},enumerable:true,configurable:true});
SQ.checkAchievements = checkAchievements;
SQ.openAchvPop = openAchvPop;
