/* 15-arena-views.js
   arena screens: trials, setup, session, results
   Extracted verbatim from index.html lines 4604-5413 by T2. */
function renderTrials(){
  const body = document.getElementById("body");
  const pool = trialPool();
  const a = ensureArena();
  const T = view.trialRound;
  const hasKeyPhrases = phrasePassages(activePassages()).length > 0;
  if(view.phraseRound) return renderPhraseDrill();
  if(!pool.length){
    body.innerHTML = `
      <div class="trial-hall">
        <div class="th-glyph">⚔️</div>
        <h2>The Arena</h2>
        <p>The arena gates are sealed. Begin memorizing your first verse, then return here to prove it under pressure.</p>
        <button class="btn primary trial-start" id="trialLockedBtn">Find a verse to memorize ▸</button>
        ${hasKeyPhrases ? `<div class="phrase-note">Key scripture phrases are ready even before your first seal.</div>
        <div class="phrase-actions">
          <button class="btn" id="lockedPhraseRef">Phrase → Reference</button>
          <button class="btn" id="lockedRefPhrase">Reference → Phrase</button>
        </div>` : ""}
      </div>`;
    document.getElementById("trialLockedBtn").onclick = ()=>{ view.tab = "today"; render(); };
    if(hasKeyPhrases){
      document.getElementById("lockedPhraseRef").onclick = ()=> startPhraseDrill("phraseToRef");
      document.getElementById("lockedRefPhrase").onclick = ()=> startPhraseDrill("refToPhrase");
    }
    return;
  }
  if(!T) return renderArenaSetup();
  if(T.done) return renderArenaResults();
  return renderArenaSession();
}

/* ---- setup screen: filters, difficulty, challenge formats ---- */
function renderArenaSetup(){
  const body = document.getElementById("body");
  const a = ensureArena();
  const campaigns = activeCampaigns().filter(c=>c.passageIds.length);
  const due = dueReviews().length;
  const campaignLabel = a.filters.campaigns.length===campaigns.length
    ? "All campaigns"
    : a.filters.campaigns.map(id=>displayCampaignName(id)).join(", ");
  const statusLabel = {all:"All scriptures", memorized:"Memorized", not_yet:"Not yet memorized"}[a.filters.status];
  const rankCount = a.achievements.length;
  const settingsOpen = !!view.arenaSettingsOpen;
  const badgesOpen = !!view.arenaBadgesOpen;
  const statsOpen = !!view.arenaStatsOpen;
  const quests = ensureArenaQuests(a);
  const questsDone = quests.list.filter(q=>q.done).length;
  const s = a.stats;
  const overallAcc = s.totalAnswered ? Math.round((s.totalCorrect/s.totalAnswered)*100) : 0;
  body.innerHTML = `
    <div class="trial-hall arena-setup">
      <div class="th-glyph">⚔️</div>
      <h2>The Arena</h2>
      <p>Jump straight in, or fine-tune what you're practicing first.</p>
      <div class="arena-stats">
        <span class="tc-pill">🏅 Best score: ${a.score.best}</span>
        <span class="tc-pill">🔥 Best streak: ×${a.streakBest}</span>
        <span class="tc-pill">💛 Hearts: ${arenaHeartCount()}/${ARENA_HEART_MAX}</span>
        <span class="tc-pill" id="arenaBadgeToggle" style="cursor:pointer;">🎖️ ${rankCount} achievement${rankCount===1?"":"s"} ${badgesOpen?"▴":"▾"}</span>
        <span class="tc-pill" id="arenaStatsToggle" style="cursor:pointer;">📊 Stats &amp; Quest Shelf ${statsOpen?"▴":"▾"}</span>
        ${due ? `<span class="tc-pill warn">🕯️ ${due} fading — victory re-seals them</span>` : ""}
      </div>
      <div class="arena-rank">${arenaTitleFor(rankCount)}</div>
      ${badgesOpen ? `
      <div class="arena-badges">
        ${ARENA_ACHIEVEMENTS.map(ac=>`
          <div class="arena-badge-wrap">
            <div class="arena-badge ${a.achievements.includes(ac.id)?'on':''}" data-ac="${ac.id}" title="${ac.name} — ${ac.desc}">${ac.emoji}</div>
            <div class="arena-badge-label">${ac.name}</div>
          </div>`).join("")}
      </div>` : ""}
      ${statsOpen ? `
      <div class="arena-card" style="text-align:left; margin-bottom:16px;">
        <h4>📊 Lifetime Stats</h4>
        <div class="stat-grid">
          <div class="stat-tile"><div class="st-n">${s.sessions}</div><div class="st-l">Sessions</div></div>
          <div class="stat-tile"><div class="st-n">${overallAcc}%</div><div class="st-l">Accuracy</div></div>
          <div class="stat-tile"><div class="st-n">${s.totalAnswered}</div><div class="st-l">Answered</div></div>
          <div class="stat-tile"><div class="st-n">${s.resealedCount}</div><div class="st-l">Reseals</div></div>
          <div class="stat-tile"><div class="st-n">${s.hintsUsed}</div><div class="st-l">Hints used</div></div>
          <div class="stat-tile"><div class="st-n">${a.questBadges.length}</div><div class="st-l">Quests won</div></div>
        </div>
        <div class="af-title" style="margin-top:14px;">By question type</div>
        <div class="type-stat-list">
          ${ARENA_TYPES.map(t=>{
            const ts = s.byType[t];
            const acc = ts.played ? Math.round((ts.correct/ts.played)*100) : 0;
            return `<div class="type-stat-row">
              <span class="ts-label">${ARENA_TYPE_LABEL[t]}</span>
              <span class="ts-bar"><i style="width:${acc}%"></i></span>
              <span class="ts-val">${ts.played ? acc+"%" : "—"}</span>
            </div>`;
          }).join("")}
        </div>
        <div class="af-title" style="margin-top:14px;">🏆 Quest Shelf (${a.questBadges.length} earned)</div>
        ${a.questBadges.length ? `
          <div class="quest-shelf-grid">
            ${a.questBadges.slice().reverse().map(b=>`
              <div class="quest-shelf-badge" title="${b.name}">
                ${chestImg(b.chest,40)}
                <div class="qsb-emoji">${b.emoji}</div>
              </div>`).join("")}
          </div>` : `<p style="margin:6px 0 0;">Complete Today's Quests below to start filling this shelf.</p>`}
      </div>` : ""}

      <div class="arena-card" style="margin-bottom:16px;">
        <h4>🎮 Game Modes</h4>
        <div class="mode-grid">
          <div class="mode-card" id="arenaQuick">
            <div class="mc-ico">⚔️</div>
            <div class="mc-name">Quick Practice</div>
            <div class="mc-sub">8 mixed questions from your filters</div>
            <div class="mc-play">▶ Play</div>
          </div>
          <div class="mode-card blitz" id="arenaBlitz">
            <div class="mc-ico">⚡</div>
            <div class="mc-name">Lightning Round</div>
            <div class="mc-sub">60 seconds · answer everything you can${a.blitz.best ? ` · best ${a.blitz.best}` : ""}</div>
            <div class="mc-play">▶ Play</div>
          </div>
          ${hasKeyPhrases ? `<div class="mode-card phrase-mode" id="phraseToRef">
            <div class="mc-ico">🔑</div>
            <div class="mc-name">Phrase → Reference</div>
            <div class="mc-sub">Recall the passage from its official key phrase</div>
            <div class="mc-play">▶ Practice</div>
          </div>
          <div class="mode-card phrase-mode" id="refToPhrase">
            <div class="mc-ico">📜</div>
            <div class="mc-name">Reference → Phrase</div>
            <div class="mc-sub">Produce the official key phrase from its reference</div>
            <div class="mc-play">▶ Practice</div>
          </div>` : ""}
        </div>
        <div class="af-active-line" style="margin:12px 0 0;">Practicing: <strong>${escHTML(statusLabel)}</strong> · <strong>${escHTML(campaignLabel)}</strong> · difficulty <strong>${ARENA_DIFF[a.difficulty].label}</strong></div>
      </div>

      <div class="arena-card" style="margin-bottom:16px; text-align:left;">
        <h4 style="text-align:center;">🗺️ Today's Quests <span style="font-weight:800; color:#b9aef2; font-size:12px;">(${questsDone}/3)</span></h4>
        <p style="text-align:center;">Fresh challenges every day — <strong>tap one to play it</strong> and win its chest.</p>
        <div class="quest-list">
          ${quests.list.map(inst=>{
            const def = questDef(inst.id);
            const pct = Math.round((inst.progress/inst.goal)*100);
            return `<div class="quest-item ${inst.done?'done quest-done-card':'quest-click'}" data-quest="${inst.id}" title="${inst.done ? def.name+" — chest claimed" : "Play a round of "+def.name}">
              <div class="quest-chest">${chestImg(def.chest,36)}</div>
              <div class="quest-info">
                <div class="quest-name">${def.emoji} ${def.name}${inst.done?" ✓":""}</div>
                <div class="quest-desc">${def.desc}</div>
                <div class="quest-bar"><i style="width:${pct}%"></i></div>
              </div>
              <div class="quest-side">
                <div class="quest-progress">${inst.progress}/${inst.goal}</div>
                ${inst.done ? `<div class="quest-won">✓ Won</div>` : `<div class="quest-play">▶ Play</div>`}
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="af-toggle" id="arenaSettingsToggle">⚙️ ${settingsOpen ? "Hide" : "Customize"} your filters &amp; difficulty ${settingsOpen?"▴":"▾"}</div>
      ${settingsOpen ? `
      <div class="af-steps">
        <div class="af-section">
          <div class="af-title">Step 1 · Pick your scripture source</div>
          <div class="af-row" id="afStatus">
            <button class="af-chip ${a.filters.status==='memorized'?'active':''}" data-status="memorized">Memorized</button>
            <button class="af-chip ${a.filters.status==='not_yet'?'active':''}" data-status="not_yet">Not Yet Memorized</button>
            <button class="af-chip ${a.filters.status==='all'?'active':''}" data-status="all">All Scriptures</button>
          </div>
        </div>
        <div class="af-section">
          <div class="af-title">Step 2 · Which campaign(s)</div>
          <div class="af-row" id="afCampaigns">
            ${campaigns.map(c=>`<button class="af-chip ${a.filters.campaigns.includes(c.id)?'active':''}" data-campaign="${safeCampaignHTML(c).id}">${safeCampaignHTML(c).shortName}</button>`).join("")}
          </div>
        </div>
        <div class="af-section">
          <div class="af-title">Step 3 · Difficulty</div>
          <div class="af-row" id="afDiff">
            ${Object.values(ARENA_DIFF).map(d=>`<button class="af-chip ${a.difficulty===d.key?'active':''}" data-diff="${d.key}">${d.emoji} ${d.label}</button>`).join("")}
          </div>
        </div>
      </div>` : ""}

      <div class="arena-formats">
        <div class="arena-card">
          <h4>📖 Campaign Mastery Challenges</h4>
          <p>Every tower is divided into five areas sized to its passage count — clear every area to master the campaign.</p>
          <div class="arena-book-grid">
            ${campaigns.map(campaign=>{
              const mastery = a.campaignMastery[campaign.id];
              const doneAreas = mastery.areas.filter(Boolean).length;
              const s = towerStats(campaign.id);
              const safe = safeCampaignHTML(campaign);
              return `
                <div class="arena-book-card" data-campaign="${safe.id}" style="--thue:${campaign.hue}">
                  <div class="abc-name">${safe.icon} ${safe.shortName}</div>
                  <div class="abc-sub">${doneAreas}/5 areas · ${s.sealed}/${s.total} mastered</div>
                  <div class="abc-areas">${mastery.areas.map(d=>`<div class="abc-area-dot ${d?'done':''}"></div>`).join("")}</div>
                </div>`;
            }).join("")}
          </div>
        </div>
        <div class="arena-card">
          <h4>👑 Grand Scripture Challenge</h4>
          <p>Ten areas spanning every campaign and growing harder as you climb. ${a.grand.areas.filter(Boolean).length}/10 areas complete.</p>
          <div class="abc-areas">${a.grand.areas.map(d=>`<div class="abc-area-dot ${d?'done':''}"></div>`).join("")}</div>
          <button class="btn primary" id="arenaGrand" style="margin-top:10px;">${a.grand.areas.every(Boolean) ? "Replay from Area 1 ▸" : `Start Area ${a.grand.areas.findIndex(x=>!x)+1} ▸`}</button>
        </div>
      </div>
    </div>`;

  const badgeToggle = document.getElementById("arenaBadgeToggle");
  if(badgeToggle) badgeToggle.onclick = ()=>{ view.arenaBadgesOpen = !badgesOpen; renderArenaSetup(); };
  const statsToggle = document.getElementById("arenaStatsToggle");
  if(statsToggle) statsToggle.onclick = ()=>{ view.arenaStatsOpen = !statsOpen; renderArenaSetup(); };
  body.querySelectorAll(".arena-badge").forEach(el=>{
    el.onclick = ()=>{
      const ac = ARENA_ACHIEVEMENTS.find(x=>x.id===el.dataset.ac);
      showToast(`${ac.emoji} <strong>${ac.name}</strong><br><span style="font-size:11.5px;color:#9db4d6;">${a.achievements.includes(ac.id) ? ac.desc : "Locked — " + ac.desc}</span>`);
    };
  });
  const settingsToggle = document.getElementById("arenaSettingsToggle");
  if(settingsToggle) settingsToggle.onclick = ()=>{ view.arenaSettingsOpen = !settingsOpen; renderArenaSetup(); };
  body.querySelectorAll("#afStatus .af-chip").forEach(b=>{
    b.onclick = ()=>{ a.filters.status = b.dataset.status; saveState(); renderArenaSetup(); };
  });
  body.querySelectorAll("#afCampaigns .af-chip").forEach(b=>{
    b.onclick = ()=>{
      const campaignId = b.dataset.campaign;
      const idx = a.filters.campaigns.indexOf(campaignId);
      if(idx>=0){ if(a.filters.campaigns.length>1) a.filters.campaigns.splice(idx,1); }
      else a.filters.campaigns.push(campaignId);
      saveState(); renderArenaSetup();
    };
  });
  body.querySelectorAll("#afDiff .af-chip").forEach(b=>{
    b.onclick = ()=>{ a.difficulty = b.dataset.diff; saveState(); renderArenaSetup(); };
  });
  document.getElementById("arenaQuick").onclick = ()=>{
    SFX.pick();
    view.trialRound = makeArenaRound({kind:"quick"});
    if(!view.trialRound.qs.length){ showToast("No scriptures match your filters yet."); view.trialRound = null; return; }
    renderTrials(); window.scrollTo({top:0});
  };
  document.getElementById("arenaBlitz").onclick = ()=>{
    SFX.whoosh();
    view.trialRound = makeArenaRound({kind:"blitz"});
    if(!view.trialRound.qs.length){ showToast("No scriptures match your filters yet."); view.trialRound = null; return; }
    renderTrials(); window.scrollTo({top:0});
  };
  if(hasKeyPhrases){
    document.getElementById("phraseToRef").onclick = ()=> startPhraseDrill("phraseToRef");
    document.getElementById("refToPhrase").onclick = ()=> startPhraseDrill("refToPhrase");
  }
  body.querySelectorAll(".quest-click").forEach(el=>{
    el.onclick = ()=>{ SFX.pick(); startQuestRound(el.dataset.quest); };
  });
  body.querySelectorAll(".quest-done-card").forEach(el=>{
    el.onclick = ()=>{
      const def = questDef(el.dataset.quest);
      SFX.pick();
      view.arenaStatsOpen = true;
      renderArenaSetup();
      showToast(`${def ? def.emoji+" <strong>"+def.name+"</strong>" : "Quest"} chest is already on your Quest Shelf.`);
    };
  });
  body.querySelectorAll(".arena-book-card").forEach(el=>{
    el.onclick = ()=>{
      const campaignId = el.dataset.campaign;
      const mastery = a.campaignMastery[campaignId];
      const area = mastery.areas.every(Boolean) ? 0 : mastery.areas.findIndex(x=>!x);
      view.trialRound = makeArenaRound({kind:"campaign", campaignId, area});
      renderTrials(); window.scrollTo({top:0});
    };
  });
  document.getElementById("arenaGrand").onclick = ()=>{
    const area = a.grand.areas.every(Boolean) ? 0 : a.grand.areas.findIndex(x=>!x);
    view.trialRound = makeArenaRound({kind:"grand", area});
    renderTrials(); window.scrollTo({top:0});
  };
}

/* ---- key scripture phrase recall: production in both directions ---- */
function makePhraseRound(direction){
  const cards = phraseDeck(activePassages(), direction, 10);
  return {direction, cards:Array.from(cards), originalTotal:cards.length, i:0, got:0, missed:0, revealed:false, done:false};
}
function startPhraseDrill(direction){
  SFX.pick();
  view.trialRound = null;
  view.phraseRound = makePhraseRound(direction);
  view.tab = "trials";
  render();
  window.scrollTo({top:0});
}
function renderPhraseDrill(){
  const body = document.getElementById("body");
  const round = view.phraseRound;
  if(!round || !round.cards.length){
    view.phraseRound = null;
    body.innerHTML = `<div class="empty">No key scripture phrases are available for this path yet.</div>`;
    return;
  }
  if(round.done || round.i >= round.cards.length){
    round.done = true;
    const retryCount = Math.max(0, round.cards.length - round.originalTotal);
    body.innerHTML = `
      <div class="phrase-drill">
        <div class="phrase-finish">
          <div class="big">🏆</div>
          <h2>Key-phrase round complete</h2>
          <p>You recalled <strong>${round.got}</strong> card${round.got===1?"":"s"} cleanly${retryCount ? ` and gave ${retryCount} another look` : ""}.</p>
          <div class="phrase-actions">
            <button class="btn primary" id="phraseAgain">Practice this direction again ▸</button>
            <button class="btn" id="phraseSwitch">Switch direction</button>
            <button class="btn" id="phraseDone">Back to the Arena</button>
          </div>
        </div>
      </div>`;
    document.getElementById("phraseAgain").onclick = ()=> startPhraseDrill(round.direction);
    document.getElementById("phraseSwitch").onclick = ()=> startPhraseDrill(round.direction === "phraseToRef" ? "refToPhrase" : "phraseToRef");
    document.getElementById("phraseDone").onclick = ()=>{ view.phraseRound=null; renderTrials(); };
    return;
  }
  const card = round.cards[round.i];
  body.innerHTML = `
    <div class="phrase-drill">
      <div class="phrase-topline">
        <span class="phrase-back" id="phraseBack">◂ Arena</span>
        <span class="phrase-progress">Card ${Math.min(round.i+1,round.originalTotal)}/${round.originalTotal}</span>
      </div>
      <div class="phrase-card-main">
        <div class="phrase-direction">${escHTML(card.label)}</div>
        <h2>${escHTML(card.promptLabel)}</h2>
        <div class="phrase-prompt">${escHTML(card.prompt)}</div>
        ${round.revealed ? `
          <div class="phrase-answer"><small>${escHTML(card.answerLabel)}</small><strong>${escHTML(card.answer)}</strong></div>
          <div class="phrase-actions">
            <button class="btn" id="phraseAgainCard">Again</button>
            <button class="btn primary" id="phraseGot">I recalled it ▸</button>
          </div>` : `<div class="phrase-actions"><button class="btn primary" id="phraseReveal">Reveal answer</button></div>`}
        <p class="phrase-note">Say the answer before revealing it. These cards pay no XP—the win is producing the phrase from memory.</p>
      </div>
    </div>`;
  document.getElementById("phraseBack").onclick = ()=>{ view.phraseRound=null; renderTrials(); };
  const reveal = document.getElementById("phraseReveal");
  if(reveal) reveal.onclick = ()=>{ round.revealed=true; SFX.pick(); renderPhraseDrill(); };
  const got = document.getElementById("phraseGot");
  if(got) got.onclick = ()=>{ round.got++; round.i++; round.revealed=false; SFX.correct(1); renderPhraseDrill(); };
  const again = document.getElementById("phraseAgainCard");
  if(again) again.onclick = ()=>{
    round.missed++;
    if(!card.retry) round.cards.push({...card,retry:true});
    round.i++; round.revealed=false; SFX.tap(); renderPhraseDrill();
  };
}

/* ---- active session: renders one question at a time ---- */
function renderArenaSession(){
  const body = document.getElementById("body");
  const T = view.trialRound;
  const q = T.qs[T.i];
  const isBlitz = T.mode.kind==="blitz";
  let modeLabel;
  if(T.mode.kind==="quick") modeLabel = "Quick Practice";
  else if(T.mode.kind==="campaign") modeLabel = `${campaignById(T.mode.campaignId).name} · Area ${T.mode.area+1}/5`;
  else if(T.mode.kind==="grand") modeLabel = `Grand Challenge · Area ${T.mode.area+1}/10`;
  else if(isBlitz) modeLabel = "⚡ Lightning Round";
  else if(T.mode.kind==="quest"){
    const def = questDef(T.mode.questId);
    modeLabel = def ? `${def.emoji} Quest: ${def.name}` : "Quest Round";
  } else modeLabel = "Arena";
  if(isBlitz && !T.blitzEnd) T.blitzEnd = Date.now() + BLITZ_SECONDS*1000;

  const shell = (innerHTML)=>{
    const blitzLeft = isBlitz ? Math.max(0, T.blitzEnd - Date.now()) : 0;
    body.innerHTML = `
      <div class="trial-arena">
        <div class="ta-top">
          <button class="ta-quit" id="arenaQuitBtn" title="Quit this round">✕</button>
          ${isBlitz
            ? `<div class="blitz-head"><span class="blitz-secs" id="blitzSecs">${Math.ceil(blitzLeft/1000)}</span><span class="blitz-label">seconds</span><span class="blitz-count">⚡ ${T.correct} correct</span></div>`
            : `<div class="ta-pips">${T.qs.map((x,i)=>`<div class="ta-pip ${i<T.i?(x.ok?'hit':'miss'):(i===T.i?'now':'')}"></div>`).join("")}</div>`}
          <div class="ta-score">✦ ${T.score}</div>
          <div class="ta-combo ${T.combo>1?'hot':''}">🔥 ×${T.combo}</div>
        </div>
        ${isBlitz ? `<div class="ta-timer-wrap blitz-track"><span class="ta-timer-bar" id="blitzTimerBar" style="width:${(blitzLeft/(BLITZ_SECONDS*1000))*100}%; transition:none;"></span></div>` : ""}
        <div class="tc-pill" style="margin-bottom:10px;">${escHTML(modeLabel)} · ${ARENA_TYPE_LABEL[q.type]}</div>
        ${questHudHTML(T)}
        ${arenaHeartsHTML()}
        ${innerHTML}
        <div class="ta-foot">${isBlitz ? `Answer as many as you can before the storm passes ⚡` : `Question ${T.i+1} of ${T.qs.length}`}</div>
      </div>`;
    const quitBtn = document.getElementById("arenaQuitBtn");
    if(quitBtn) quitBtn.onclick = ()=>{
      if(q.timerHandle){ clearInterval(q.timerHandle); q.timerHandle=null; }
      if(T.blitzTimer){ clearInterval(T.blitzTimer); T.blitzTimer = null; }
      view.trialRound = null;
      showToast("Round left — nothing lost, come back anytime.");
      renderTrials();
      window.scrollTo({top:0});
    };
    if(isBlitz){
      if(T.blitzTimer) clearInterval(T.blitzTimer);
      T.blitzTimer = setInterval(()=>{
        if(view.trialRound !== T || T.done){ clearInterval(T.blitzTimer); T.blitzTimer = null; return; }
        const left = Math.max(0, T.blitzEnd - Date.now());
        const bar = document.getElementById("blitzTimerBar");
        const secs = document.getElementById("blitzSecs");
        if(bar) bar.style.width = (left/(BLITZ_SECONDS*1000))*100 + "%";
        if(secs){
          secs.textContent = Math.ceil(left/1000);
          if(left < 11000) secs.classList.add("low");
        }
        if(left <= 0){
          clearInterval(T.blitzTimer); T.blitzTimer = null;
          if(q.timerHandle){ clearInterval(q.timerHandle); q.timerHandle=null; }
          T.locked = true;
          T.done = true;
          finishArenaSession(T);
          SFX.whoosh();
          render();
        }
      }, 150);
    }
  };

  const advance = ()=>{
    setTimeout(()=>{
      if(view.trialRound !== T || T.done) return;
      T.locked = false;
      T.i += 1;
      if(T.i >= T.qs.length){
        T.done = true;
        finishArenaSession(T);
        render();
      } else {
        renderArenaSession();
      }
    }, isBlitz ? (q.ok ? 380 : 750) : (q.ok ? 950 : 1600));
  };
  const shake = ()=>{
    SFX.wrong();
    const arena = body.querySelector(".trial-arena");
    if(arena){ arena.classList.remove("shake"); void arena.offsetWidth; arena.classList.add("shake"); }
  };
  const flash = (btn, gained)=>{
    SFX.correct(T.combo);
    if(!btn){ FX.rain({count:24}); comboPop(); return; }
    const fx = document.createElement("div");
    fx.className = "ta-fly";
    fx.textContent = `+${gained} ✦`;
    btn.appendChild(fx);
    const ring = document.createElement("div");
    ring.className = "ta-ring";
    btn.appendChild(ring);
    setTimeout(()=>{ ring.remove(); }, 700);
    FX.burstAt(btn, {count: Math.min(40, 16 + T.combo*3)});
    comboPop();
  };
  const comboPop = ()=>{
    if(T.combo < 3) return;
    const arena = body.querySelector(".trial-arena");
    if(!arena) return;
    const pop = document.createElement("div");
    pop.className = "ta-combo-pop";
    pop.textContent = T.combo >= 8 ? `UNSTOPPABLE ×${T.combo} 🔥` : T.combo >= 5 ? `ON FIRE ×${T.combo} 🔥` : `COMBO ×${T.combo}!`;
    arena.appendChild(pop);
    setTimeout(()=>pop.remove(), 1100);
  };
  const withHint = ()=>{
    const hearts = arenaHeartCount();
    return `<div class="hint-row"><button class="hint-btn" id="hintBtn" ${hearts<=0?'disabled':''}>💛 Use a heart hint (${hearts}/${ARENA_HEART_MAX})</button></div>`;
  };

  if(q.type==="text2ref" || q.type==="ref2text" || q.type==="theme2ref" || q.type==="timedRecall"){
    const optLabel = (x)=>{
      if(q.type==="ref2text") return `<span class="to-text">"${escHTML(trialSnippet(x.text,16))}"</span>`;
      if(q.type==="theme2ref") return `<span class="to-ref">${escHTML(x.ref)}</span><span class="to-theme">Choose the matching reference</span>`;
      if(q.type==="timedRecall") return `<span class="to-ref">${escHTML(x.ref)}</span><span class="to-theme">Recall under pressure</span>`;
      return `<span class="to-ref">${escHTML(x.ref)}</span>`;
    };
    let prompt;
    if(q.type==="text2ref" || q.type==="timedRecall"){
      prompt = `<div class="tq-kicker">Whose words are these?</div><div class="tq-text">"${escHTML(trialSnippet(q.v.text,26))}"</div>`;
    } else if(q.type==="ref2text"){
      prompt = `<div class="tq-kicker">How does it begin?</div><div class="tq-ref">${escHTML(q.v.ref)}</div><div class="tq-theme">${escHTML(q.v.topic)}</div>`;
    } else {
      prompt = `<div class="tq-kicker">Which scripture teaches…</div><div class="tq-text">"${escHTML(q.v.topic)}"</div>`;
    }
    shell(`
      ${q.type==="timedRecall" ? `<div class="ta-timer-wrap"><span class="ta-timer-bar" id="taTimerBar" style="width:100%"></span></div>` : ""}
      <div class="tq-card">${prompt}</div>
      <div class="ta-opts">${q.options.map((x,i)=>`<button class="t-opt" data-i="${i}">${optLabel(x)}</button>`).join("")}</div>
      ${withHint()}
    `);
    const answer = (idx, btn, timedOut)=>{
      if(T.locked) return;
      T.locked = true;
      if(q.timerHandle){ clearInterval(q.timerHandle); q.timerHandle=null; }
      const pick = timedOut ? null : q.options[idx];
      const right = !timedOut && pick.id === q.v.id;
      settleAnswer(T, q, right);
      body.querySelectorAll(".t-opt").forEach((b,bi)=>{
        if(q.options[bi].id === q.v.id) b.classList.add("correct");
        else if(b===btn) b.classList.add("wrong");
        b.disabled = true;
      });
      if(right) flash(btn, q.gained); else shake();
      advance();
    };
    body.querySelectorAll(".t-opt").forEach(btn=>{
      btn.onclick = ()=> answer(Number(btn.dataset.i), btn, false);
    });
    const hintBtn = document.getElementById("hintBtn");
    if(hintBtn) hintBtn.onclick = ()=>{
      if(q.hinted) return;
      if(!spendArenaHeart(T, q, "One wrong answer faded away")) return;
      const wrongBtns = [...body.querySelectorAll(".t-opt")].filter((b,bi)=> q.options[bi].id !== q.v.id && !b.disabled);
      if(wrongBtns.length>1) { wrongBtns[0].disabled = true; wrongBtns[0].style.opacity = ".35"; }
      hintBtn.disabled = true; hintBtn.textContent = "💛 Heart used";
    };
    if(q.type==="timedRecall"){
      T.timeLeft = q.timeLimit;
      const bar = document.getElementById("taTimerBar");
      q.timerHandle = setInterval(()=>{
        T.timeLeft -= 1;
        if(bar) bar.style.width = Math.max(0, (T.timeLeft/q.timeLimit)*100) + "%";
        if(T.timeLeft<=0){ clearInterval(q.timerHandle); q.timerHandle=null; answer(-1, null, true); }
      }, 1000);
    }
  } else if(q.type==="finishVerse"){
    shell(`
      <div class="tq-card"><div class="tq-kicker">Finish the verse</div><div class="tq-text">"${escHTML(q.lead)} …"</div></div>
      <div class="ta-opts">${q.options.map((o,i)=>`<button class="t-opt" data-i="${i}"><span class="to-text">${escHTML(o)}</span></button>`).join("")}</div>
      ${withHint()}
    `);
    body.querySelectorAll(".t-opt").forEach(btn=>{
      btn.onclick = ()=>{
        if(T.locked) return;
        T.locked = true;
        const pick = q.options[Number(btn.dataset.i)];
        const right = pick === q.correctEnd;
        settleAnswer(T, q, right);
        body.querySelectorAll(".t-opt").forEach((b,bi)=>{
          if(q.options[bi]===q.correctEnd) b.classList.add("correct");
          else if(b===btn) b.classList.add("wrong");
          b.disabled = true;
        });
        if(right) flash(btn, q.gained); else shake();
        advance();
      };
    });
    const hintBtn = document.getElementById("hintBtn");
    if(hintBtn) hintBtn.onclick = ()=>{
      if(q.hinted) return;
      if(!spendArenaHeart(T, q, "One ending choice faded away")) return;
      const wrongBtns = [...body.querySelectorAll(".t-opt")].filter((b,bi)=> q.options[bi]!==q.correctEnd && !b.disabled);
      if(wrongBtns.length>1){ wrongBtns[0].disabled=true; wrongBtns[0].style.opacity=".35"; }
      hintBtn.disabled = true; hintBtn.textContent = "💛 Heart used";
    };
  } else if(q.type==="fillBlank"){
    /* q.words is the display stream; the blank is keyed on WORD index, so
       punctuation-only tokens can never be blanked out. */
    const shown = q.words.map(t => t.isWord && t.index===q.blankIndex
      ? `<span class="blank-slot">&nbsp;</span>` : escHTML(t.raw)).join(" ");
    shell(`
      <div class="tq-card"><div class="tq-kicker">Fill in the blank</div><div class="tq-lead">${shown}</div><div class="tq-theme" style="margin-top:6px;">${escHTML(q.v.ref)}</div></div>
      <div class="ta-opts">${q.options.map((o,i)=>`<button class="t-opt" data-i="${i}"><span class="to-text">${escHTML(o)}</span></button>`).join("")}</div>
      ${withHint()}
    `);
    body.querySelectorAll(".t-opt").forEach(btn=>{
      btn.onclick = ()=>{
        if(T.locked) return;
        T.locked = true;
        const pick = q.options[Number(btn.dataset.i)];
        const right = pick.toLowerCase() === q.correctWord.toLowerCase();
        settleAnswer(T, q, right);
        body.querySelectorAll(".t-opt").forEach((b,bi)=>{
          if(q.options[bi].toLowerCase()===q.correctWord.toLowerCase()) b.classList.add("correct");
          else if(b===btn) b.classList.add("wrong");
          b.disabled = true;
        });
        if(right) flash(btn, q.gained); else shake();
        advance();
      };
    });
    const hintBtn = document.getElementById("hintBtn");
    if(hintBtn) hintBtn.onclick = ()=>{
      if(q.hinted) return;
      if(!spendArenaHeart(T, q, "One blank choice faded away")) return;
      const wrongBtns = [...body.querySelectorAll(".t-opt")].filter((b,bi)=> q.options[bi].toLowerCase()!==q.correctWord.toLowerCase() && !b.disabled);
      if(wrongBtns.length>1){ wrongBtns[0].disabled=true; wrongBtns[0].style.opacity=".35"; }
      hintBtn.disabled = true; hintBtn.textContent = "💛 Heart used";
    };
  } else if(q.type==="findError"){
    shell(`
      <div class="tq-card"><div class="tq-kicker">Tap the word that doesn't belong</div><div class="fe-words">${q.words.map(t => t.isWord
        ? `<span class="fe-word ${q.retryUsed && Number(q.firstMissIdx)===t.index ? "picked-wrong used" : ""}" data-i="${t.index}">${escHTML(t.raw)}</span>`
        : escHTML(t.raw)).join(" ")}</div><div class="tq-theme" style="margin-top:6px;">${escHTML(q.v.ref)}</div></div>
      ${q.retryUsed ? `<div class="fe-retry" id="feRetry">💛 Not that one — you get <strong>one more try</strong>. Look closer…</div>` : `<div class="fe-lives">❤️❤️ two tries</div>`}
    `);
    body.querySelectorAll(".fe-word").forEach(sp=>{
      sp.onclick = ()=>{
        if(T.locked || sp.classList.contains("used")) return;
        const idx = Number(sp.dataset.i);
        const right = idx === q.errorIndex;
        if(!right && !q.retryUsed){
          /* second chance: mark the miss, invite another look */
          q.retryUsed = true;
          q.firstMissIdx = idx;
          sp.classList.add("picked-wrong","used");
          SFX.wrong();
          const arena = body.querySelector(".trial-arena");
          if(arena){ arena.classList.remove("shake"); void arena.offsetWidth; arena.classList.add("shake"); }
          const card = body.querySelector(".tq-card");
          const lives = body.querySelector(".fe-lives");
          if(lives) lives.remove();
          if(card && !document.getElementById("feRetry")){
            const note = document.createElement("div");
            note.className = "fe-retry";
            note.id = "feRetry";
            note.innerHTML = `💛 Not that one — you get <strong>one more try</strong>. Look closer…`;
            card.after(note);
          }
          return;
        }
        T.locked = true;
        settleAnswer(T, q, right, right && q.retryUsed ? {penalty:5} : {});
        sp.classList.add(right ? "picked-right" : "picked-wrong");
        const correctSpan = body.querySelector(`.fe-word[data-i="${q.errorIndex}"]`);
        if(correctSpan) correctSpan.classList.add("picked-right");
        if(right){
          const note = document.getElementById("feRetry");
          if(note) note.innerHTML = q.retryUsed ? `💪 <strong>Got it on the retry!</strong> That's how climbers learn.` : "";
          flash(sp, q.gained);
        } else shake();
        advance();
      };
    });
  } else if(q.type==="wordScramble"){
    const remaining = q.scrPool.filter(c=>!q.scrUsed.includes(c.k));
    shell(`
      <div class="tq-card">
        <div class="tq-kicker">Untangle the verse · tap the words in order</div>
        <div class="tq-theme">${escHTML(q.v.ref)}${q.scrStart>0 ? " · starting mid-verse…" : ""}</div>
        ${q.scrLead ? `<div class="scr-context"><strong>Previous words</strong><span class="fade-tail">${escHTML(q.scrLead)}</span></div>` : `<div class="scr-context"><strong>Start here</strong><span class="fade-tail">Begin at the first word of this verse.</span></div>`}
        <div class="scr-built">${q.scrTarget.slice(0,q.scrNext).map(w=>`<span class="pv-chip done">${escHTML(w)}</span>`).join(" ")}${q.scrNext<q.scrTarget.length ? `<span class="pv-chip next">?</span>` : ""}</div>
      </div>
      <div class="scr-hint-row"><button class="hint-btn" id="scrHeartHint" ${arenaHeartCount()<=0?'disabled':''}>💛 Place next word (${arenaHeartCount()}/${ARENA_HEART_MAX})</button></div>
      <div class="scr-pool">
        ${remaining.map(c=>`<button class="scr-chip" data-k="${c.k}">${escHTML(c.w)}</button>`).join("")}
      </div>
    `);
    const finishOrContinueScramble = (anchor)=>{
      if(q.scrNext >= q.scrTarget.length){
        T.locked = true;
        const right = q.scrMiss < 5;
        settleAnswer(T, q, right, {penalty:q.scrMiss*2});
        renderArenaSession();
        const card = body.querySelector(".tq-card") || anchor;
        if(right) flash(card, q.gained); else shake();
        advance();
      } else {
        renderArenaSession();
      }
    };
    body.querySelectorAll(".scr-chip").forEach(btn=>{
      btn.onclick = ()=>{
        if(T.locked) return;
        const k = Number(btn.dataset.k);
        const chip = q.scrPool.find(c=>c.k===k);
        if(chip.w === q.scrTarget[q.scrNext]){
          q.scrUsed.push(k);
          q.scrNext += 1;
          SFX.pick();
          finishOrContinueScramble(btn);
        } else {
          q.scrMiss += 1;
          SFX.wrong();
          btn.classList.add("wrong");
          setTimeout(()=> btn.classList.remove("wrong"), 380);
        }
      };
    });
    const scrHeartHint = document.getElementById("scrHeartHint");
    if(scrHeartHint) scrHeartHint.onclick = ()=>{
      if(T.locked || q.scrNext >= q.scrTarget.length) return;
      if(!spendArenaHeart(T, q, "Next Untangle word placed")) return;
      const nextChip = remaining.find(c=>c.k === q.scrNext);
      if(!nextChip) return;
      q.scrUsed.push(nextChip.k);
      q.scrNext += 1;
      SFX.pick();
      finishOrContinueScramble(scrHeartHint);
    };
  } else if(q.type==="pairMatch"){
    const matchedN = Object.keys(q.pairDone).length;
    shell(`
      <div class="tq-card">
        <div class="tq-kicker">Match each reference to its teaching</div>
        <div class="pm-grid">
          <div class="pm-col">
            ${q.pairLeft.map(o=>`<button class="pm-chip pm-l ${q.pairDone[o.id]?'matched':''} ${q.selL===o.id?'sel':''}" data-id="${escHTML(o.id)}"><span class="to-ref" style="font-size:13px;">${escHTML(o.label)}</span></button>`).join("")}
          </div>
          <div class="pm-col">
            ${q.pairRight.map(o=>`<button class="pm-chip pm-r ${q.pairDone[o.id]?'matched':''}" data-id="${escHTML(o.id)}"><span class="to-theme" style="font-size:11.5px;">${escHTML(o.label)}</span></button>`).join("")}
          </div>
        </div>
        <div class="pm-foot">${matchedN}/3 matched${q.pmMiss ? ` · ${q.pmMiss} slip${q.pmMiss===1?"":"s"}` : ""}</div>
      </div>
    `);
    const settlePairs = ()=>{
      T.locked = true;
      const right = q.pmMiss <= 3;
      settleAnswer(T, q, right, {penalty:q.pmMiss*2});
      const card = body.querySelector(".tq-card");
      if(right) flash(card, q.gained); else shake();
      advance();
    };
    body.querySelectorAll(".pm-l").forEach(btn=>{
      btn.onclick = ()=>{
        if(T.locked || btn.classList.contains("matched")) return;
        q.selL = btn.dataset.id;
        body.querySelectorAll(".pm-l").forEach(b=>b.classList.toggle("sel", b===btn));
        SFX.tap();
      };
    });
    body.querySelectorAll(".pm-r").forEach(btn=>{
      btn.onclick = ()=>{
        if(T.locked || btn.classList.contains("matched") || !q.selL) return;
        if(btn.dataset.id === q.selL){
          q.pairDone[q.selL] = true;
          q.selL = null;
          SFX.pick();
          if(Object.keys(q.pairDone).length >= 3){
            renderArenaSession();
            settlePairs();
          } else {
            renderArenaSession();
          }
        } else {
          q.pmMiss += 1;
          SFX.wrong();
          const selBtn = body.querySelector(".pm-l.sel");
          [btn, selBtn].forEach(b=>{ if(b){ b.classList.add("miss"); setTimeout(()=>b.classList.remove("miss"), 380); } });
          const foot = body.querySelector(".pm-foot");
          if(foot) foot.textContent = `${Object.keys(q.pairDone).length}/3 matched · ${q.pmMiss} slip${q.pmMiss===1?"":"s"}`;
        }
      };
    });
  } else if(q.type==="buildVerse"){
    const done = q.builtIndex >= q.chunks.length;
    let options = [];
    if(!done){
      const correct = q.chunks[q.builtIndex];
      const distract = shuffleArr(q.chunks.filter((c,i)=>i!==q.builtIndex)).slice(0,2);
      options = shuffleArr([correct].concat(distract));
    }
    shell(`
      <div class="tq-card"><div class="tq-kicker">Build the verse · ${escHTML(q.v.ref)}</div>
        <div class="prove-built">${q.chunks.slice(0,q.builtIndex).map(c=>`<span class="pv-chip done">${escHTML(c)}</span>`).join(" ")}${done ? "" : `<span class="pv-chip next">?</span>`}</div>
      </div>
      ${done ? "" : `<div class="prove-options">${options.map(o=>`<button class="btn prove-opt" data-opt="${encodeURIComponent(o)}">${escHTML(o)}</button>`).join("")}</div>`}
    `);
    const builtBox = body.querySelector(".prove-built");
    if(builtBox && builtBox.lastElementChild) builtBox.lastElementChild.scrollIntoView({block:"end", inline:"nearest"});
    if(!done){
      body.querySelectorAll(".prove-opt").forEach(btn=>{
        btn.onclick = ()=>{
          const val = decodeURIComponent(btn.dataset.opt);
          if(val === q.chunks[q.builtIndex]){
            const opts = body.querySelector(".prove-options");
            if(opts) opts.classList.add("resolving");
            body.querySelectorAll(".prove-opt").forEach(b=>b.disabled = true);
            btn.classList.add("correct");
            recordArenaQuestStep(T, def=>def.track==="buildStep" && def.type===q.type, 1);
            q.builtIndex++;
            if(q.builtIndex>=q.chunks.length){
              settleAnswer(T, q, true);
              flash(btn, q.gained);
              advance();
            } else {
              SFX.pick();
              setTimeout(()=> renderArenaSession(), 95);
            }
          } else {
            SFX.wrong();
            btn.classList.add("wrong");
            setTimeout(()=> btn.classList.remove("wrong"), 400);
          }
        };
      });
    }
  } else if(q.type==="fullRecitation"){
    shell(`
      <div class="tq-card"><div class="tq-kicker">Full recitation</div><div class="tq-ref">${escHTML(q.v.ref)}</div><div class="tq-theme">${escHTML(q.v.topic)}</div>
        <p style="margin-top:10px;color:#b9aef2;font-size:12.5px;font-weight:700;">Recite the entire scripture aloud from memory, then be honest with yourself.</p>
      </div>
      ${q.peekOpen ? `<div class="recite-peek">"${numberedVerseText(q.v)}"</div>` : ``}
      <div class="recite-btns">
        <button class="btn primary" id="reciteGood">✓ I recited it fully</button>
        <button class="btn" id="reciteHint">${q.peekOpen ? "🙈 Hide the words" : "👀 Peek at the words"}</button>
        <button class="btn" id="reciteMiss">✗ I need more practice</button>
      </div>
    `);
    document.getElementById("reciteGood").onclick = ()=>{
      if(T.locked) return; T.locked = true;
      settleAnswer(T, q, true);
      flash(document.getElementById("reciteGood"), q.gained);
      advance();
    };
    document.getElementById("reciteMiss").onclick = ()=>{
      if(T.locked) return; T.locked = true;
      settleAnswer(T, q, false);
      shake();
      advance();
    };
    document.getElementById("reciteHint").onclick = ()=>{
      if(!q.peekOpen && !spendArenaHeart(T, q, "Scripture words revealed")) return;
      q.peekOpen = !q.peekOpen;
      renderArenaSession();
    };
  }
}

/* ---- results screen ---- */
function renderArenaResults(){
  const body = document.getElementById("body");
  const T = view.trialRound;
  const a = ensureArena();
  const isBlitz = T.mode.kind==="blitz";
  const answered = T.qs.filter(q=>q.ok!==null).length;
  const total = isBlitz ? answered : T.qs.length;
  const perfect = isBlitz ? false : (total>0 && T.correct === total);
  const stars = isBlitz
    ? (T.correct >= 15 ? 3 : (T.correct >= 8 ? 2 : (T.correct > 0 ? 1 : 0)))
    : (perfect ? 3 : (T.correct >= Math.ceil(total*0.6) ? 2 : (T.correct > 0 ? 1 : 0)));
  const accuracy = total ? Math.round((T.correct/total)*100) : 0;
  const practiced = [...new Set(T.qs.filter(q=>q.ok!==null).map(q=>q.v.id))];
  const improved = [...new Set(T.qs.filter(q=>q.ok && !state.progress[q.v.id].sealed).map(q=>q.v.id))];
  const mastered = [...new Set(T.qs.filter(q=>q.ok && state.progress[q.v.id].sealed).map(q=>q.v.id))];
  let challengeLine = "Quick Practice session";
  if(T.mode.kind==="campaign") challengeLine = `${campaignById(T.mode.campaignId).name} · Area ${T.mode.area+1}/5 ${perfect ? "— cleared ✦" : "(clear all questions to master this area)"}`;
  if(T.mode.kind==="grand") challengeLine = `Grand Scripture Challenge · Area ${T.mode.area+1}/10 ${perfect ? "— cleared ✦" : "(clear all questions to master this area)"}`;
  if(T.mode.kind==="quest"){ const qd = questDef(T.mode.questId); challengeLine = qd ? `${qd.emoji} Quest round · ${qd.name}` : "Quest round"; }
  if(isBlitz) challengeLine = `⚡ Lightning Round · ${T.correct} correct in ${BLITZ_SECONDS}s${T.correct >= a.blitz.best && T.correct>0 ? " — new best!" : ""}`;
  let headline, subline;
  if(isBlitz){
    headline = T.correct >= 15 ? "⚡ Lightning Ace!" : T.correct >= 8 ? "⚡ Storm Rider!" : T.correct > 0 ? "The Storm Passes" : "The Storm Humbles All";
    subline = `${T.correct} correct in ${BLITZ_SECONDS} seconds · best streak ×${T.bestCombo}`;
  } else {
    headline = perfect ? "Flawless Victory!" : (T.correct ? "Trial Complete" : "The Arena Humbles All");
    subline = `${T.correct} of ${total} struck true · best streak ×${T.bestCombo}`;
  }
  const shareLine = isBlitz
    ? `⚡ I scored ${T.correct} correct in a ${BLITZ_SECONDS}-second Lightning Round in Scripture Quest! Best combo ×${T.bestCombo}. Think you can beat me? 🏰`
    : `⚔️ Arena victory in Scripture Quest: ${T.correct}/${total} correct (${accuracy}%)${perfect ? " — FLAWLESS ✨" : ""}, best combo ×${T.bestCombo}.${T.heartBonus ? ` ${T.heartBonus.label} +${T.heartBonus.xp} XP!` : ""} ${sealedTotal()} verses sealed and climbing! 🏰`;
  body.innerHTML = `
    <div class="trial-hall trial-results">
      ${perfect ? `<div class="tr-stamp">FLAWLESS</div>` : ""}
      <div class="tr-stars">${[1,2,3].map(i=>`<span class="tr-star ${i<=stars?'lit':''}" style="animation-delay:${i*0.2}s">★</span>`).join("")}</div>
      <h2>${headline}</h2>
      <p>${subline}</p>
      <div class="tr-xp">+${T.score} score${perfect ? " · flawless" : ""}${T.heartBonus ? ` · ${T.heartBonus.label}` : ""}</div>
      ${T.heartBonus ? `
        <div class="tr-resealed" style="max-width:400px;">
          <div class="trr-title">💛 ${T.heartBonus.label}</div>
          <div class="trr-item"><span>${T.heartBonus.desc}</span><span style="margin-left:auto;">+${T.heartBonus.xp} XP</span></div>
        </div>` : ""}
      <div class="tr-resealed" style="max-width:400px;">
        <div class="trr-title">Session summary</div>
        <div class="trr-item"><span>🎯 Accuracy</span><span style="margin-left:auto;">${accuracy}%</span></div>
        <div class="trr-item"><span>🔥 Best streak</span><span style="margin-left:auto;">×${T.bestCombo}</span></div>
        <div class="trr-item"><span>📚 Scriptures practiced</span><span style="margin-left:auto;">${practiced.length}</span></div>
        <div class="trr-item"><span>📈 Scriptures improved</span><span style="margin-left:auto;">${improved.length}</span></div>
        <div class="trr-item"><span>🏺 Scriptures mastered</span><span style="margin-left:auto;">${mastered.length}</span></div>
        <div class="trr-item"><span>💛 Hearts used</span><span style="margin-left:auto;">${T.hintsUsed}</span></div>
        <div class="trr-item"><span>🗺️ Challenge</span><span style="margin-left:auto;text-align:right;">${escHTML(challengeLine)}</span></div>
      </div>
      ${T.resealed.length ? `
        <div class="tr-resealed">
          <div class="trr-title">🕯️ Seals restored by your victory</div>
          ${T.resealed.map(v=>`<div class="trr-item">${relicHTML(v, 40)}<span>${escHTML(v.ref)}</span></div>`).join("")}
        </div>` : ""}
      ${T.newlyUnlocked.length ? `
        <div class="tr-resealed">
          <div class="trr-title">🎖️ New achievements</div>
          ${T.newlyUnlocked.map(id=>{
            const ac = ARENA_ACHIEVEMENTS.find(x=>x.id===id);
            return `<div class="trr-item"><span>${ac.emoji}</span><span>${ac.name} — ${ac.desc}</span></div>`;
          }).join("")}
        </div>` : ""}
      ${T.newQuestBadges.length ? `
        <div class="tr-resealed">
          <div class="trr-title">🎁 Quests completed</div>
          ${T.newQuestBadges.map(def=>`<div class="trr-item">${chestImg(def.chest,28)}<span>${def.emoji} ${def.name} — ${def.desc}</span></div>`).join("")}
        </div>` : ""}
      <div class="tr-btns">
        <button class="btn primary" id="trAgain">Another round ▸</button>
        ${T.mode.questId ? `<button class="btn" id="trQuests">Today's quests</button>` : ""}
        <button class="btn" id="trShare">📣 Share</button>
        <button class="btn" id="trHome">Back to camp</button>
      </div>
    </div>`;
  document.getElementById("trAgain").onclick = ()=>{ SFX.pick(); view.trialRound = makeArenaRound(T.mode); renderTrials(); window.scrollTo({top:0}); };
  const trQuests = document.getElementById("trQuests");
  if(trQuests) trQuests.onclick = ()=>{ SFX.pick(); view.trialRound = null; view.tab = "trials"; render(); window.scrollTo({top:0}); };
  document.getElementById("trShare").onclick = ()=> shareText(shareLine);
  document.getElementById("trHome").onclick = ()=>{ view.trialRound = null; view.tab = "today"; render(); window.scrollTo({top:0}); };
  setTimeout(()=>{
    if(perfect){ SFX.fanfare(); FX.rain({count:130}); }
    else if(stars >= 2){ SFX.milestone(); FX.rain({count:70}); }
    else if(T.correct > 0){ SFX.correct(2); }
    else { SFX.wrong(); }
  }, 250);
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.renderTrials = renderTrials;
SQ.renderArenaSetup = renderArenaSetup;
SQ.renderArenaSession = renderArenaSession;
SQ.renderArenaResults = renderArenaResults;
SQ.makePhraseRound = makePhraseRound;
SQ.startPhraseDrill = startPhraseDrill;
SQ.renderPhraseDrill = renderPhraseDrill;
