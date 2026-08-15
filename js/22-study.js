/* 22-study.js
   renderVerseHTML, blank picking, the study screen
   Extracted verbatim from index.html lines 6530-6748 by T2. */
function renderVerseHTML(text, stage, blanked, marks, smart){
  return tokenize(text).map(t=>{
    if(!t.isWord) return escHTML(t.raw);
    const tok=t.raw;
    const myIdx=t.index;
    const safeTok=escHTML(tok);
    const hideThis=blanked.has(myIdx);
    const num=marks&&marks.has(myIdx)?`<sup class="vnum">${marks.get(myIdx)}</sup>`:"";
    let hl="",style="",meta="";
    const hit=smart?.selected?.get(myIdx);
    if(hit){
      const role=HL_ROLES[hit.role];
      hl=" hlc";
      const strength=hit.priority>=95?"0 0 0 1px rgba(30,41,59,.10) inset":"none";
      style=` style="background:${role.color};box-shadow:${strength}"`;
      meta=` data-role="${hit.role}" data-priority="${hit.priority}" title="${role.label}"`;
    }
    if(stage===0) return `${num}<span class="w${hl}" data-i="${myIdx}"${meta}${style}>${safeTok}</span>`;
    if(stage===1||stage===2){
      if(hideThis) return `${num}<span class="w blank" data-i="${myIdx}">${safeTok}</span>`;
      return `${num}<span class="w${hl}" data-i="${myIdx}"${meta}${style}>${safeTok}</span>`;
    }
    if(stage===3){
      const m=tok.match(/^(\w)(\w*)(.*)$/);
      if(!m) return `${num}<span class="w">${safeTok}</span>`;
      const stub=escHTML(m[1]+"…"+m[3]);
      return `${num}<span class="w letter" data-i="${myIdx}" data-full="${safeTok}">${stub}</span>`;
    }
    if(stage===4) return `${num}<span class="w blank" data-i="${myIdx}">${safeTok}</span>`;
    return `${num}<span class="w${hl}" data-i="${myIdx}"${meta}${style}>${safeTok}</span>`;
  }).join("");
}
function pickBlankSet(text, fraction){
  const wordIdxs = tokenWords(text).map(t=>t.index);
  const n = Math.round(wordIdxs.length * fraction);
  const shuffled = wordIdxs.slice().sort(()=>Math.random()-0.5);
  return new Set(shuffled.slice(0,n));
}

/* ---- text verification note (T4) ----
   Sits directly under the passage, because that is the text the reader is
   about to commit to memory and this is a statement about that text.
   Deliberately quiet for `unverified` — a caveat, not an error — and
   deliberately loud for `drifted`, which
   means a passage was edited after someone reviewed it. */
function verificationNoteHTML(v){
  if(!SHOW_TEXT_VERIFICATION) return "";
  if(v && v.source === "user"){
    return `<div class="verify-note">📝 Personal wording — you supplied this text. Compare it with your source before memorizing.</div>`;
  }
  const vr = verificationFor(v);
  if(vr.state === "verified"){
    return `<div class="verify-note ok" title="${escHTML(vr.detail)}">✓ ${escHTML(vr.label)} · ${escHTML(vr.rec.source)}</div>`;
  }
  if(vr.state === "drifted"){
    return `<div class="verify-note drift"><strong>⚠️ ${escHTML(vr.label)}</strong><span>${escHTML(vr.detail)}</span></div>`;
  }
  return `<div class="verify-note" title="${escHTML(vr.detail)}">⚑ ${escHTML(vr.label)} — check it against a printed edition before memorizing it word for word.</div>`;
}

function renderStudy(){
  const body = document.getElementById("body");
  if(!view.passageId){ view.passageId = recommendedVerse().id; view.stage = state.progress[view.passageId].stage; }
  const v = passageById(view.passageId);
  const p = state.progress[v.id];
  const stage = view.stage;
  const diff = difficultyForVerse(v);
  const r = relicFor(v);
  const safe=safePassageHTML(v);
  const due = isDue(p);
  const shards = shardsFor(p);

  if(stage===1 && (view.blanked.size===0 || view.stageFor!==1)){ view.blanked = pickBlankSet(v.text, 0.3); view.stageFor=1; }
  if(stage===2 && (view.blanked.size===0 || view.stageFor!==2)){ view.blanked = pickBlankSet(v.text, 0.65); view.stageFor=2; }
  if(stage!==1 && stage!==2) view.stageFor=null;

  const marks = verseNumberMap(v);
  const smart = classifyVerse(v.text);
  const verseHTML = renderVerseHTML(v.text, stage, view.blanked, marks, smart);

  let primaryLabel;
  if(!p.sealed) primaryLabel = stage<4 ? "I've got it, harder ▸" : "Recite &amp; Seal ✦";
  else if(due) primaryLabel = "Recite &amp; Re-seal ✦";
  else primaryLabel = "Polish the seal ✦";

  body.innerHTML = `
    <div class="study level-${diff.index}">
      <div class="difficulty-badge" title="${p.sealed ? 'Sealed' : `${diff.label} · ${diff.words} words`}">${p.sealed ? '✨' : diff.emoji}</div>

      <div class="study-relic">
        ${relicHTML(v, 84)}
        <div class="sr-info">
          <div class="sr-name">${escHTML(r.name)}</div>
          <div class="sr-tier" style="color:${diff.trim.trim}">${diff.trim.metal} relic · ${shards}/5 shards</div>
          <div class="sr-cond">${p.sealed ? `${condBadgeHTML(p)} <span style="color:#9db4d6;font-size:11px;font-weight:800;margin-left:4px;">${nextReviewText(p)}</span>` : `<span style="color:#9db4d6;font-size:11px;font-weight:800;">Each stage you pass reveals a shard</span>`}</div>
        </div>
      </div>

      ${due && view.reviewMode ? `<div class="review-banner">🕯️ <span>This seal is <strong>${sealCondition(p).label.toLowerCase()}</strong>. One honest recitation restores its shine and climbs the ladder toward an Eternal Seal.</span></div>` : ''}

      <div class="study-head">
        <div class="ref">${safe.ref}</div>
        ${popularPillHTML(v)}
        <div class="theme">${safe.topic} &nbsp;·&nbsp; ${safe.book}</div>
        ${v.keyPhrase ? `<div class="study-key-phrase"><span>Key scripture phrase</span>${escHTML(v.keyPhrase)}</div>` : ""}
      </div>
      <div class="stage-label">${p.sealed ? '<span class="emoji">🏆</span><span>Sealed ✦</span>' : difficultyLabelForVerse(v)}</div>
      <div class="difficulty-strip">
        ${DIFFICULTIES.map((d,i)=>`<div class="difficulty-chip ${i<diff.index?'done':(i===diff.index?'current':'')}"><span>${d.emoji}</span><span class="label">${d.label}</span></div>`).join("")}
      </div>
      <div class="stage-label" style="margin-top:8px;color:var(--muted);letter-spacing:.12em;"><span>Memory stage: ${stageLabel(stage)}</span></div>
      ${stage===0 ? `
        <div class="hl-toolbar">
          <button class="btn hl-toggle ${view.highlightMode?'active':''}" id="hlToggle">🖍️ Smart highlights ${view.highlightMode?'· on':'· off'}</button>
        </div>
        ${view.highlightMode ? `<div class="hl-hint">Colors reveal repeated anchor words, key phrases, doctrine, invitations, promises, and warnings.</div>
        <div class="hl-legend">${["deity","anchor","foundation","faith","love","command","promise","warning","agency","identity"].map(k=>`<span class="hl-key"><i class="hl-swatch" style="background:${HL_ROLES[k].color}"></i>${HL_ROLES[k].label}</span>`).join("")}</div>` : ``}
      ` : ``}
      <div class="verse-text ${stage===0 && !view.highlightMode ? 'hl-off' : ''}" id="verseText">${verseHTML}</div>
      ${verificationNoteHTML(v)}

      <div class="stage-progress">
        ${STAGES.map((s,i)=>`<div class="stage-dot ${i<stage?'done':(i===stage?'current':'')}"></div>`).join("")}
      </div>

      <div class="controls">
        <button class="btn" id="prevStage" ${stage===0?'disabled':''}>◂ Easier</button>
        ${(stage===1||stage===2) ? `<button class="btn shuffle-btn" id="shuffleBtn">🔀 Shuffle words</button>` : ``}
        <button class="btn" id="proveItBtn">🧩 Prove It</button>
        <button class="btn primary" id="nextStage">${primaryLabel}</button>
      </div>


      <div class="nav-verse">
        <span id="prevVerse">◂ Previous verse</span>
        <span id="nextVerse">Next verse ▸</span>
      </div>
    </div>
    <footer class="hint">Tap a blanked word to peek. Tapping costs nothing, but honest recitation is what seals it.</footer>
  `;

  body.querySelectorAll(".w.blank, .w.letter").forEach(el=>{
    el.onclick = ()=>{
      if(el.classList.contains("letter")) el.textContent = el.dataset.full;
      else { el.classList.remove("blank"); el.classList.add("revealed"); }
    };
  });

  const hlToggle = document.getElementById("hlToggle");
  if(hlToggle) hlToggle.onclick = ()=>{ view.highlightMode = !view.highlightMode; renderStudy(); };

  const shuffleBtn = document.getElementById("shuffleBtn");
  if(shuffleBtn) shuffleBtn.onclick = ()=>{
    view.blanked = pickBlankSet(v.text, stage===1 ? 0.3 : 0.65);
    view.stageFor = stage;
    renderStudy();
    const vt = document.getElementById("verseText");
    if(vt){ vt.classList.remove("reshuffled"); void vt.offsetWidth; vt.classList.add("reshuffled"); }
  };

  document.getElementById("prevStage").onclick = ()=>{
    view.stage = Math.max(0, view.stage-1);
    view.blanked = new Set(); view.stageFor=null;
    renderStudy();
  };

  document.getElementById("nextStage").onclick = ()=>{
    if(!p.sealed && stage<4){
      view.stage = stage+1;
      view.blanked = new Set(); view.stageFor=null;
      const prevShards = shardsFor(p);
      p.stage = Math.max(p.stage, view.stage);
      /* T7: shard reveal is keyed on p.stage's all-time high (never
         re-fires once a shard is out) — independent of the DAILY reward
         claim below, which resets every day. Toggling Easier/Harder
         within the same day past a stage you already claimed today
         pays neither XP nor a heart; coming back tomorrow and passing
         through it again still can. */
      const rewarded = claimReward("stage:"+v.id+":"+view.stage);
      let heartGain = 0;
      if(rewarded){ state.xp += 10; heartGain = refillArenaHearts(1); }
      touchStreak();
      saveState();
      renderStudy();
      if(shardsFor(p) > prevShards){
        SFX.correct(2);
        const sr = body.querySelector(".study-relic .relic");
        if(sr) FX.burstAt(sr, {count:22});
        showToast(`✦ A shard breaks away! <strong>${escHTML(r.name)}</strong> · ${shardsFor(p)}/5 revealed${heartGain ? ` · 💛 +${heartGain}` : ""}`);
      } else if(rewarded){
        SFX.tap();
        showToast(`Nice review. +10 XP${heartGain ? ` · 💛 +${heartGain}` : ""}`);
      } else {
        SFX.tap();
      }
    } else if(!p.sealed){
      /* T6: sealVerse() is no longer reachable from a bare button tap.
         This opens the Recall Check; sealVerse() only fires from there,
         and only on a passing grade. See js/26-recall-check.js. */
      openRecallCheck(v, "first");
    } else if(due){
      openRecallCheck(v, "reseal");
    } else {
      /* T7: polishing an already-sealed, not-due verse used to pay +5 XP
         and a heart on every single tap, forever -- the cheapest farm in
         the app. Once per verse per day now; the polish itself (and the
         reassurance of nextReviewText) still happens every time. */
      const rewarded = claimReward("polish:"+v.id);
      let heartGain = 0;
      if(rewarded){ state.xp += 5; heartGain = refillArenaHearts(1); }
      touchStreak();
      saveState();
      renderStudy();
      SFX.tap();
      if(rewarded){
        showToast(`✦ Seal polished. +5 XP${heartGain ? " · 💛 +1" : ""} · ${nextReviewText(p)}`);
      } else {
        showToast(`✦ Polished again — practice completed. Today's polish reward is already claimed. ${nextReviewText(p)}`);
      }
    }
  };

  const proveItBtn = document.getElementById("proveItBtn");
  if(proveItBtn) proveItBtn.onclick = ()=> openProveIt(v);

  document.getElementById("prevVerse").onclick = ()=> jumpVerse(-1);
  document.getElementById("nextVerse").onclick = ()=> jumpVerse(1);
  function jumpVerse(dir){
    const passages = allPassages();
    const idx = passages.findIndex(x=>x.id===view.passageId);
    const next = (idx+dir+passages.length)%passages.length;
    view.passageId = passages[next].id;
    view.stage = state.progress[view.passageId].stage;
    view.blanked = new Set(); view.stageFor=null;
    view.editing = false;
    view.reviewMode = isDue(state.progress[view.passageId]);
    render();
  }
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.renderVerseHTML = renderVerseHTML;
SQ.pickBlankSet = pickBlankSet;
SQ.verificationNoteHTML = verificationNoteHTML;
SQ.renderStudy = renderStudy;
