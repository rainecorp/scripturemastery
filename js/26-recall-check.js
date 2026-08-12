/* 26-recall-check.js — the Recall Check UI (T6)
   ===========================================================================
   New in T6 — not extracted from the old build. Before this file,
   "Recite & Seal ✦" called sealVerse(p) on one tap with no check of any
   kind: tap it 500 times and every verse is sealed, every relic earned,
   every metric downstream computed on a claim nobody verified
   (ROADMAP.md §2.1). This is the screen that makes the claim real.

   It is a thin renderer over js/00-recall.js, which owns every decision
   about what a keystroke means. Nothing here decides whether a letter was
   right — it only draws the result and, on a passing grade, performs the
   seal.

   THE ONE RULE THIS FILE EXISTS TO ENFORCE: sealVerse() and resealVerse()
   are reachable from here ONLY after recallMeetsGate() says yes. There is
   no other path to either function left in the study screen (js/22-study.js
   just opens this screen now) — see js/14-arena.js for the other place a
   reseal can happen (Full Recitation, which is the self-report path, gated
   the same way: never for a first seal, and only when the words were never
   peeked at).

   NEVER SHOWS THE VERSE TEXT. Slots reveal only what the session already
   revealed — a clean first letter, or a full word on an actual reveal event.
   That includes the self-report screen: it has no verse text to hide,
   because none is ever rendered here in the first place. */

let recallState = null;   // { v, mode: "first"|"reseal", session, tokens, phase }

function recallGateType(mode){ return mode === "first" ? "first" : "reseal"; }

function openRecallCheck(v, mode){
  const session = createRecallSession(v.text, { strictMode: !!state.strictMode });
  recallState = {
    v, mode, session,
    tokens: displayTokens(v.text),   // full stream incl. punctuation, for rendering
    phase: isRecallComplete(session) ? "results" : "typing",
    announce: mode === "first"
      ? "Recall Check. Type the first letter of each word from memory."
      : "Recall Check. Type the first letter of each word from memory."
  };
  document.removeEventListener("keydown", recallKeyHandler);
  document.addEventListener("keydown", recallKeyHandler);
  renderRecallCheck();
}

function closeRecallCheck(){
  const el = document.getElementById("recallCheck");
  if(el){ el.classList.remove("show"); el.innerHTML = ""; }
  recallState = null;
  document.removeEventListener("keydown", recallKeyHandler);
}

function recallKeyHandler(e){
  if(!recallState) return;
  if(e.ctrlKey || e.metaKey || e.altKey) return;

  if(recallState.phase === "results"){
    if(e.key === "Enter"){ e.preventDefault(); const b = document.getElementById("recallPrimary"); if(b) b.click(); }
    if(e.key === "Escape"){ e.preventDefault(); closeRecallCheck(); }
    return;
  }
  if(recallState.phase !== "typing") return;

  if(e.key === "Escape"){ e.preventDefault(); closeRecallCheck(); return; }
  if(e.key === "Backspace"){ e.preventDefault(); recallApplyBackspace(); return; }
  if(/^[a-zA-Z0-9]$/.test(e.key)){ e.preventDefault(); recallApplyLetter(e.key); }
}

/* ---- applying events (session mutation + SFX + a11y announce + re-render) */

function recallApplyLetter(letter){
  const { session } = recallState;
  const before = session.position;
  const r = typeLetter(session, letter);
  if(r.event === "correct"){
    SFX.correct(1);
    recallState.announce = `Correct. Word ${before + 1} of ${session.words.length}.`;
  } else if(r.event === "slip"){
    SFX.tap();
    recallState.announce = "Close — try again, that one didn't count against you.";
    recallShakeSlot(before);
  } else if(r.event === "miss"){
    SFX.wrong();
    recallState.announce = `Not quite. ${r.misses} of 3 before this word is shown for you.`;
    recallShakeSlot(before);
  } else if(r.event === "autoReveal"){
    SFX.wrong();
    const word = session.words[before];
    recallState.announce = `Revealed after three tries: ${word.core}. Moving on.`;
  }
  if(isRecallComplete(session)) recallState.phase = "results";
  renderRecallCheck();
}

function recallApplyBackspace(){
  const { session } = recallState;
  const r = backspace(session);
  if(r.event === "backspace"){
    recallState.announce = `Back to word ${session.position + 1}.`;
    renderRecallCheck();
  }
}

function recallApplyReveal(){
  const { session } = recallState;
  if(!spendArenaHeart(null, null, "Recall Check word revealed")) return;
  const before = session.position;
  const r = revealHint(session);
  if(r.event === "reveal"){
    const word = session.words[before];
    recallState.announce = `Revealed: ${word.core}.`;
    if(isRecallComplete(session)) recallState.phase = "results";
    renderRecallCheck();
  }
}

/* Slot shake is a transient visual, not session state — handled as a CSS
   class toggled on the live DOM node rather than a full re-render, so a
   rapid run of misses doesn't fight its own animation. */
function recallShakeSlot(index){
  requestAnimationFrame(()=>{
    const el = document.querySelector(`#recallCheck .recall-slot[data-i="${index}"]`);
    if(!el) return;
    el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
  });
}

/* ---- rendering ---------------------------------------------------------- */

function recallSlotHTML(session, tok){
  const slot = session.slots[tok.index];
  const isCurrent = tok.index === session.position && !isRecallComplete(session);
  let fill, cls;
  if(slot.revealed){
    fill = escHTML(session.words[tok.index].core);
    cls = "revealed";
  } else if(slot.filled){
    fill = escHTML(slot.letter) + "_".repeat(Math.max(0, tok.core.length - 1));
    cls = "filled";
  } else {
    fill = "_".repeat(tok.core.length);
    cls = isCurrent ? "current" : "pending";
  }
  const label = slot.revealed ? `word ${tok.index+1}, revealed: ${session.words[tok.index].core}`
    : slot.filled ? `word ${tok.index+1}, correct`
    : isCurrent ? `word ${tok.index+1}, current, ${tok.core.length} letters`
    : `word ${tok.index+1}, not yet reached, ${tok.core.length} letters`;
  return `<span class="recall-slot ${cls}" data-i="${tok.index}" style="--len:${tok.core.length}" aria-label="${escHTML(label)}">`
       + `${escHTML(tok.leadPunct)}<span class="rs-fill">${fill}</span>${escHTML(tok.tailPunct)}</span>`;
}

function recallSlotsHTML(){
  const { session, tokens } = recallState;
  return tokens.map(t => t.isWord ? recallSlotHTML(session, t) : escHTML(t.raw)).join("");
}

function recallLiveStatsHTML(){
  const { session } = recallState;
  const pos = session.position;
  if(pos === 0) return `<div class="recall-live">Word 1 of ${session.words.length}</div>`;
  let clean = 0;
  for(let i=0;i<pos;i++){ const s = session.slots[i]; if(s.filled && s.misses===0 && !s.revealed) clean++; }
  const pct = Math.round((clean/pos)*100);
  return `<div class="recall-live">Word ${Math.min(pos+1, session.words.length)} of ${session.words.length} · ${pct}% clean so far</div>`;
}

const RECALL_KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
function recallPadHTML(){
  const hearts = arenaHeartCount();
  return `
    <div class="recall-pad">
      ${RECALL_KEY_ROWS.map((row,i) => `<div class="recall-pad-row${i===2?' last':''}">${
        [...row].map(k=>`<button class="recall-key" data-k="${k}" type="button">${k}</button>`).join("")
      }${i===2 ? `<button class="recall-key recall-key-back" id="recallBackKey" type="button" aria-label="Backspace">⌫</button>` : ""}</div>`).join("")}
      <button class="recall-key recall-key-hint" id="recallHintKey" type="button" ${hearts<=0?'disabled':''}>
        💛 Reveal this word (${hearts}/${ARENA_HEART_MAX})
      </button>
    </div>`;
}

function renderRecallCheck(){
  const el = document.getElementById("recallCheck");
  if(!el || !recallState) return;
  const { v, mode, phase } = recallState;

  if(phase === "typing"){
    el.innerHTML = `
      <div class="cer-backdrop" id="recallBackdrop"></div>
      <div class="relic-pop-stage">
        <div class="cer-stage recall-stage" role="dialog" aria-modal="true" aria-label="Recall Check, ${escHTML(v.ref)}">
          <button class="rp-close" id="recallClose" aria-label="Close">✕</button>
          <div class="recall-head">
            <div class="cer-kicker">${mode === "first" ? "✦ Recall Check — first seal" : "✦ Recall Check — re-seal"}</div>
            <div class="recall-ref">${escHTML(v.ref)}</div>
            <div class="recall-theme">${escHTML(v.topic)}</div>
          </div>
          <p class="recall-instruction">Type the <strong>first letter</strong> of each word, in order, from memory. A near-miss on the keyboard costs nothing — only a real miss counts, and even three of those just reveal the word and move you on.</p>
          <div class="recall-slots-wrap"><div class="recall-slots">${recallSlotsHTML()}</div></div>
          ${recallLiveStatsHTML()}
          <div id="recallStatus" class="sr-only" role="status" aria-live="polite">${escHTML(recallState.announce||"")}</div>
          ${recallPadHTML()}
          ${mode === "reseal" ? `<div class="recall-selfreport-link" id="recallSelfReportOpen">Can't type right now? Self-report instead ▸</div>` : ""}
        </div>
      </div>`;
    document.getElementById("recallClose").onclick = closeRecallCheck;
    document.getElementById("recallBackdrop").onclick = closeRecallCheck;
    el.querySelectorAll(".recall-key[data-k]").forEach(btn=>{
      btn.onclick = ()=> recallApplyLetter(btn.dataset.k);
    });
    const backKey = document.getElementById("recallBackKey");
    if(backKey) backKey.onclick = recallApplyBackspace;
    const hintKey = document.getElementById("recallHintKey");
    if(hintKey) hintKey.onclick = recallApplyReveal;
    const srOpen = document.getElementById("recallSelfReportOpen");
    if(srOpen) srOpen.onclick = ()=>{ recallState.phase = "selfReport"; renderRecallCheck(); };
    el.classList.add("show");
    return;
  }

  if(phase === "selfReport"){
    el.innerHTML = `
      <div class="cer-backdrop" id="recallBackdrop"></div>
      <div class="relic-pop-stage">
        <div class="cer-stage recall-stage" role="dialog" aria-modal="true" aria-label="Self-report, ${escHTML(v.ref)}">
          <button class="rp-close" id="recallClose" aria-label="Close">✕</button>
          <div class="recall-head">
            <div class="cer-kicker">✦ Self-report</div>
            <div class="recall-ref">${escHTML(v.ref)}</div>
          </div>
          <div class="recall-selfreport-body">
            <p>This is the accessibility path for anyone who can't type right now — no words are shown here, same as the typed check.</p>
            <p><strong>Without looking anything up</strong>, did you just recite ${escHTML(v.ref)} correctly, start to finish, from memory?</p>
          </div>
          <div class="recall-selfreport-btns">
            <button class="btn primary" id="recallSelfYes">✓ Yes — I recited it correctly</button>
            <button class="btn" id="recallSelfBack">◂ Back to typing</button>
          </div>
        </div>
      </div>`;
    document.getElementById("recallClose").onclick = closeRecallCheck;
    document.getElementById("recallBackdrop").onclick = closeRecallCheck;
    document.getElementById("recallSelfBack").onclick = ()=>{ recallState.phase = "typing"; renderRecallCheck(); };
    document.getElementById("recallSelfYes").onclick = ()=>{
      closeRecallCheck();
      performReseal(v, { selfReported: true });
    };
    el.classList.add("show");
    return;
  }

  /* ---- results ---------------------------------------------------------- */
  const { session } = recallState;
  const grade = gradeRecallSession(session);
  const gate = recallGateType(mode);
  const passed = recallMeetsGate(grade.grade, gate);
  const wobbled = recallState.tokens.filter(t => t.isWord).filter(t=>{
    const s = session.slots[t.index];
    return s.misses > 0 || s.revealed;
  }).map(t => t.raw);

  const pct = Math.round(grade.accuracy * 100);
  const primaryLabel = passed
    ? (mode === "first" ? "Seal it ✦" : "Re-seal it ✦")
    : "Try again";

  el.innerHTML = `
    <div class="cer-backdrop" id="recallBackdrop"></div>
    <div class="relic-pop-stage">
      <div class="cer-stage recall-stage recall-results" role="dialog" aria-modal="true" aria-label="Recall Check results, ${escHTML(v.ref)}">
        <button class="rp-close" id="recallClose" aria-label="Close">✕</button>
        <div class="recall-head">
          <div class="cer-kicker">${escHTML(v.ref)}</div>
        </div>
        <div class="recall-grade recall-grade-${grade.grade}">
          <div class="recall-pct">${pct}%</div>
          <div class="recall-grade-copy">${escHTML(grade.copy)}</div>
          ${!passed ? `<div class="recall-gate-note">${mode === "first"
              ? "A first seal needs a clean or nearly-clean recitation. Not there yet — and that's exactly what practice is for."
              : "A re-seal needs at least a solid, mostly-clean pass. Give it another go whenever you're ready."}</div>` : ``}
        </div>
        ${wobbled.length ? `
          <div class="recall-wobble">
            <div class="recall-wobble-label">${wobbled.length === 1 ? "The word that wobbled" : "The words that wobbled"}</div>
            <div class="recall-wobble-list">${wobbled.map(w=>`<span class="recall-wobble-word">${escHTML(w)}</span>`).join("")}</div>
          </div>` : `<div class="recall-wobble-none">Every word landed clean. ✦</div>`}
        <div id="recallStatus" class="sr-only" role="status" aria-live="polite">
          Recall check complete. ${escHTML(grade.copy)} ${pct} percent clean.
        </div>
        <div class="recall-result-btns">
          <button class="btn primary" id="recallPrimary">${primaryLabel}</button>
          <div class="recall-result-secondary">
            <button class="recall-tool" id="recallRetry">↻ Try again</button>
            <button class="recall-tool" id="recallStudyMore">📖 Study this one more</button>
          </div>
        </div>
      </div>
    </div>`;
  document.getElementById("recallClose").onclick = closeRecallCheck;
  document.getElementById("recallBackdrop").onclick = closeRecallCheck;
  document.getElementById("recallRetry").onclick = ()=> openRecallCheck(v, mode);
  document.getElementById("recallStudyMore").onclick = ()=>{ closeRecallCheck(); renderStudy(); };
  document.getElementById("recallPrimary").onclick = ()=>{
    if(passed){
      closeRecallCheck();
      if(mode === "first") performSeal(v); else performReseal(v);
    } else {
      openRecallCheck(v, mode);   // "Try again" — free, unlimited, no cost either way
    }
  };
  el.classList.add("show");
}

/* ---- the actual seal / reseal side effects ------------------------------
   Moved here verbatim from js/22-study.js's nextStage handler — same XP,
   same heart refill, same ceremony, same toasts. The only thing that
   changed is WHERE it's called from: only after recallMeetsGate() says
   yes, never from a bare button tap. */

function performSeal(v){
  const p = state.progress[v.id];
  sealVerse(p);
  const climb = recordClimb(v, view.campaignId);
  emitBridge("seal", v, 25);
  state.xp += 50;
  const heartGain = refillArenaHearts(1);
  touchStreak();
  saveState();
  if(heartGain) setTimeout(()=> showToast(`💛 Arena heart restored by sealing ${v.ref}.`, true), 2600);
  playSealCeremony(v, climb.floor, climb.campaignId);
}

function performReseal(v, opts){
  opts = opts || {};
  const p = state.progress[v.id];
  const res = resealVerse(p);
  emitBridge(res.eternal ? "eternal" : "reseal", v, res.eternal ? 40 : 10);
  state.xp += res.xp;
  const heartGain = refillArenaHearts(1);
  touchStreak();
  saveState();
  view.reviewMode = false;
  render();
  if(res.eternal){
    SFX.fanfare(); FX.rain({count:120});
    showToast(`♾️ <strong>ETERNAL SEAL</strong> · ${v.ref}<br><span style="color:#9db4d6;font-size:11.5px;">${relicFor(v).name} will never fade again. +${res.xp} XP${heartGain ? " · 💛 +1" : ""}</span>`, true);
  } else {
    SFX.seal(); FX.rain({count:50});
    showToast(`✦ Re-sealed! Ladder rung ${res.lvl}/${REVIEW_LADDER.length}. +${res.xp} XP${heartGain ? " · 💛 +1" : ""} · ${nextReviewText(p)}${opts.selfReported ? " · self-reported" : ""}`);
  }
}

/* ---- SQ registry ---- */
SQ.openRecallCheck = openRecallCheck;
SQ.closeRecallCheck = closeRecallCheck;
SQ.recallKeyHandler = recallKeyHandler;
SQ.performSeal = performSeal;
SQ.performReseal = performReseal;
Object.defineProperty(SQ, "recallState", { get:()=>recallState, set:v=>{recallState=v;}, enumerable:true, configurable:true });
