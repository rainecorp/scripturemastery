/* 23-proveit.js
   Prove It — cumulative-chaining production puzzle, with the original
   order-recognition puzzle kept as an easier rung (T14).
   chunkVerse() extracted verbatim from index.html lines 6749-6913 by T2;
   unchanged since — every mode below depends on its chunk boundaries
   never moving. */
/* =========================================================
   PROVE IT — build the verse back from memory, one chunk at a time.

   Two modes share one shell (header, ref, step counter, progress bar,
   the "Proven!" finish ceremony):

   - "production" (default, T14): the learner TYPES each chunk — first
     letter of each word, exactly the Recall Check mechanic from
     js/00-recall.js — with every already-built chunk showing as real
     text above the one they're working on. A single recall session
     spans the WHOLE passage (same engine, same grading, same gate as
     Recall Check); chunkVerse()'s boundaries are used only to decide
     how much of that one session's slots are visible at once. A
     completed chain graded good+ (first seal) or hard+ (re-seal) is
     real recall evidence and can seal or re-seal, through the exact
     same performSeal()/performReseal() Recall Check uses. If the verse
     is already sealed and not due, there is no gate to meet — chaining
     is just practice, same as it always was.

   - "recognition" (the pre-T14 puzzle, unchanged): pick the next chunk
     from three options. This is recognition, not recall — it stays
     practice evidence only, exactly as before, and is never a path to
     sealVerse()/resealVerse(). It's offered as the easier rung for a
     learner who isn't ready to type a chunk from nothing yet.

   Switching modes mid-attempt just reopens Prove It fresh in the other
   mode — mixing partial progress across two different scoring models
   would make neither trustworthy.
   ========================================================= */
let proveState = null;

function chunkVerse(text){
  const clean = String(text||"").replace(/\s+/g," ").trim();
  if(!clean) return [];
  /* Boundaries are chosen over WORD positions, but each chunk is cut out of
     the source with spanByWords() rather than rebuilt by joining words. That
     distinction matters: joining word tokens would silently delete every
     free-standing em dash from the puzzle. Spans run start-of-word to
     start-of-word, so consecutive chunks partition the text exactly. */
  const words = tokenWords(clean);
  const N = words.length;
  // Scale piece count with verse length: short verses still get ~5
  // pieces (2-3 words each), long passages never exceed 20 pieces.
  const target = Math.max(5, Math.min(20, Math.round(N/8)));
  const size = Math.max(2, Math.ceil(N/target));
  const chunks = [];
  let start = 0;
  while(start < N){
    const remain = N - start;
    if(remain <= size+1){ chunks.push(spanByWords(clean, start)); break; }
    // Prefer a natural punctuation break near the target size.
    let chosen = -1;
    const lo = start + Math.max(1, size-2);
    const hi = Math.min(start + size, N-1);
    for(let i=hi; i>=lo; i--){
      if(/[,:;.!?]$/.test(words[i].raw)){ chosen=i+1; break; }
    }
    if(chosen < 0) chosen = start + size;
    // Do not leave a one-word final fragment.
    if(N-chosen>0 && N-chosen<2) chosen = N;
    chunks.push(spanByWords(clean, start, chosen));
    start = chosen;
  }
  // Guarantee the bounds: split the longest piece while under-count…
  const minPieces = Math.min(5, Math.floor(N/2));
  while(chunks.length < minPieces){
    let li = 0;
    chunks.forEach((c,i)=>{ if(wordCount(c) > wordCount(chunks[li])) li = i; });
    const n = wordCount(chunks[li]);
    if(n < 4) break;
    const mid = Math.ceil(n/2);
    chunks.splice(li, 1, spanByWords(chunks[li], 0, mid), spanByWords(chunks[li], mid));
  }
  // …and merge the shortest neighbors while over-count.
  while(chunks.length > 20){
    let si = 0;
    chunks.forEach((c,i)=>{ if(wordCount(c) < wordCount(chunks[si])) si = i; });
    const j = (si===0 || (si<chunks.length-1 && chunks[si+1].length < chunks[si-1].length)) ? si : si-1;
    chunks.splice(j, 2, chunks[j] + " " + chunks[j+1]);
  }
  return chunks;
}

/* Aligns each chunk to a contiguous, zero-based word-index range that
   matches tokenWords(text)/createRecallSession(text).words exactly.
   chunkVerse()'s spans already partition the source start-of-word to
   start-of-word (see its own comment above), so summing wordCount() per
   chunk reproduces those same boundaries in the recall engine's index
   space — verified against every shipped passage shape, em dashes
   included, before wiring this up. */
function chunkWordRanges(chunks){
  let pos = 0;
  return chunks.map(c=>{ const n = wordCount(c); const r = {start:pos, end:pos+n}; pos += n; return r; });
}

/* Maps each word index to its position in a FULL token stream (spaces
   included). Deliberately tokenize(), not displayTokens(): the active
   chunk renders inline inside normal serif prose (.prove-reader), not
   inside a flex+gap slot row like Recall Check's .recall-slots, so the
   literal space tokens are what puts space between the words on screen. */
function tokenWordStarts(tokens){
  const starts = [];
  tokens.forEach((t,i)=>{ if(t.isWord) starts[t.index]=i; });
  return starts;
}

/* Which recall gate (if any) a completed production chain is evidence
   for — the same three-way split js/22-study.js's nextStage handler
   already makes: not yet sealed → a first seal; sealed and due → a
   re-seal; sealed and not due → no gate, chaining is just practice. */
function proveGateFor(p){
  if(!p.sealed) return "first";
  if(isDue(p)) return "reseal";
  return null;
}

function builtChunkCount(ps){
  return ps.ranges.filter(r=>ps.session.position>=r.end).length;
}

function openProveIt(v, mode){
  const chunks = chunkVerse(v.text);
  if(chunks.length < 2){ showToast("This verse is too short for Prove It."); return; }
  const useMode = mode==="recognition" ? "recognition" : "production";
  const p = state.progress[v.id];
  const tokens = tokenize(v.text);
  proveState = {
    v, chunks, mode: useMode,
    ranges: chunkWordRanges(chunks),
    tokens, wordTokenStart: tokenWordStarts(tokens),
    gate: proveGateFor(p),
    // ---- recognition-mode fields (unchanged since before T14) ----
    builtIndex:0, misses:0, chunkMisses:0, feedback:"", locked:false,
    runId:`prove:${v.id}:${Date.now()}:${Math.random().toString(36).slice(2,7)}`,
    // ---- production-mode fields (T14) ----
    session: createRecallSession(v.text, { strictMode: !!state.strictMode }),
    attemptId: `provechain:${v.id}:${Date.now()}:${Math.random().toString(36).slice(2,7)}`,
    startedAt: Date.now(),
    recorded: false
  };
  document.removeEventListener("keydown",proveKeyHandler);
  document.addEventListener("keydown",proveKeyHandler);
  renderProveIt();
}
function closeProveIt(){
  const el = document.getElementById("proveIt");
  el.classList.remove("show");
  el.innerHTML = "";
  proveState = null;
  document.removeEventListener("keydown",proveKeyHandler);
}
function proveKeyHandler(e){
  if(!proveState) return;
  if(proveState.mode==="recognition"){
    if(proveState.locked) return;
    const n=Number(e.key);
    if(n>=1 && n<=3){
      const btn=document.querySelector(`#proveIt .prove-opt[data-key="${n}"]`);
      if(btn) btn.click();
    }
    return;
  }
  // production
  if(e.ctrlKey || e.metaKey || e.altKey) return;
  const done = isRecallComplete(proveState.session);
  if(done){
    if(e.key==="Enter"){ e.preventDefault(); const b=document.getElementById("proveClose"); if(b) b.click(); }
    if(e.key==="Escape"){ e.preventDefault(); closeProveIt(); }
    return;
  }
  if(e.key==="Escape"){ e.preventDefault(); closeProveIt(); return; }
  if(e.key==="Backspace"){ e.preventDefault(); proveApplyBackspace(); return; }
  if(/^[a-zA-Z0-9]$/.test(e.key)){ e.preventDefault(); proveApplyLetter(e.key); }
}

/* ---- production: applying a keystroke (session mutation + SFX + re-render) */

function proveApplyLetter(letter){
  const { session, ranges } = proveState;
  const before = session.position;
  const beforeChunks = ranges.filter(rg=>before>=rg.end).length;
  const r = typeLetter(session, letter);
  const chunkAdvanced = ()=> ranges.filter(rg=>session.position>=rg.end).length > beforeChunks;
  if(r.event==="correct"){ SFX.correct(1); if(chunkAdvanced()) SFX.pick(); }
  else if(r.event==="slip"){ SFX.tap(); proveShakeSlot(before); }
  else if(r.event==="miss"){ SFX.wrong(); proveShakeSlot(before); }
  else if(r.event==="autoReveal"){ SFX.wrong(); if(chunkAdvanced()) SFX.pick(); }
  renderProveIt();
}
function proveApplyBackspace(){
  const r = backspace(proveState.session);
  if(r.event==="backspace") renderProveIt();
}
function proveApplyReveal(){
  if(!spendArenaHeart(null, null, "Prove It word revealed")) return;
  const r = revealHint(proveState.session);
  if(r.event==="reveal") renderProveIt();
}
function proveShakeSlot(index){
  requestAnimationFrame(()=>{
    const el = document.querySelector(`#proveIt .recall-slot[data-i="${index}"]`);
    if(!el) return;
    el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
  });
}

/* One learning attempt for the WHOLE chain, recorded once the session
   completes — same shape and timing as Recall Check's
   recordRecallLearning(), just under a distinct mode label so the two
   are distinguishable in the learning log. Only a re-seal-eligible
   chain schedules a new review date; a first-seal chain can't (the
   passage isn't sealed yet) and a no-gate practice chain must not
   (ROADMAP.md T14 DoD: recognition and ungated production chunks stay
   practice evidence only). */
function recordProveLearning(){
  if(!proveState || proveState.recorded) return;
  const { v, session, gate, attemptId, startedAt } = proveState;
  const grade = gradeRecallSession(session);
  const passed = gate ? recallMeetsGate(grade.grade, gate) : true;
  const wobbled = session.slots
    .map((s,i)=>({s,i}))
    .filter(({s})=>s.misses>0 || s.revealed)
    .map(({i})=>i);
  const p = state.progress[v.id];
  recordLearningAttempt(state, v.id, {
    id: attemptId,
    at: Date.now(),
    mode: "proveItChain",
    grade: grade.grade,
    correct: passed,
    troublePositions: wobbled,
    attemptedPositions: session.words.map(w=>w.index),
    durationMs: Date.now()-startedAt
  }, { wordCount: session.words.length, schedule: gate==="reseal", eternal: isEternal(p) });
  proveState.recorded = true;
  saveState();
}

/* The practice-completion reward — verbatim T7 behavior, now shared by
   recognition's finish and any production finish that didn't clear a
   seal gate. A chain that DID seal/re-seal earns its XP from
   performSeal()/performReseal() instead; paying this too would reopen
   the exact farm T7 closed. */
function claimProvePractice(v){
  const p=state.progress[v.id];
  const rewarded = claimReward("prove:"+v.id);
  if(rewarded) state.xp+=15;
  touchStreak();
  if(!p.provenIt){
    p.provenIt=true;
    showToast(`🧩 <strong>${escHTML(v.ref)}</strong> proven! Its relic now glows on the shelf.${rewarded ? " +15 XP" : ""}`);
  } else if(rewarded){
    showToast(`🧩 Proven again! +15 XP`);
  } else {
    showToast(`🧩 Proven again — practice completed. Today's Prove It reward is already claimed.`);
  }
  saveState(); SFX.fanfare(); FX.rain({count:70});
}

/* ---- recognition rendering (unchanged puzzle) ---------------------- */

function proveReaderHTML(chunks,builtIndex){
  const complete=escHTML(chunks.slice(0,builtIndex).join(" "));
  const upcoming=escHTML(chunks.slice(builtIndex).join(" "));
  return `${complete?`<span class="prove-complete">${complete}</span> `:""}<span class="prove-cursor" id="proveCursor" aria-label="next phrase"></span>${upcoming?` <span class="prove-upcoming">${upcoming}</span>`:""}`;
}
function proveRecognitionActiveHTML(){
  const { chunks, builtIndex } = proveState;
  const correct=chunks[builtIndex];
  const pool=chunks.filter((c,i)=>i!==builtIndex && c!==correct);
  const distractors=shuffleArr(pool).slice(0,2);
  const options=shuffleArr([correct,...distractors]);
  return `
    <div class="prove-instruction"><span>Read what you have built.</span><strong> Choose the phrase that follows.</strong></div>
    <div class="prove-reader-wrap"><div class="prove-reader" id="proveReader">${proveReaderHTML(chunks,builtIndex)}</div></div>
    <div class="prove-action">
      <div class="prove-prompt">What comes next?</div>
      <div class="prove-options">
        ${options.map((o,i)=>`<button class="btn prove-opt" data-key="${i+1}" data-opt="${encodeURIComponent(o)}">${escHTML(o)}</button>`).join("")}
      </div>
      <div class="prove-feedback" id="proveFeedback">${proveState.feedback||""}</div>
      <div class="prove-tools">
        <button class="prove-tool" id="proveUndo" ${builtIndex===0?"disabled":""}>↶ Undo last</button>
        <button class="prove-tool" id="proveSkip">Finish later</button>
      </div>
      <div class="prove-mode-link" id="proveModeSwitch">Ready to try it from memory instead? Switch to production ▸</div>
    </div>`;
}
function wireProveRecognitionActive(el){
  const { v, chunks } = proveState;
  requestAnimationFrame(()=>{
    const reader=document.getElementById("proveReader");
    const cursor=document.getElementById("proveCursor");
    if(reader&&cursor) reader.scrollTop=Math.max(0,cursor.offsetTop-reader.clientHeight*.42);
  });
  el.querySelectorAll(".prove-opt").forEach(btn=>{
    btn.onclick=()=>{
      if(proveState.locked) return;
      const val=decodeURIComponent(btn.dataset.opt);
      if(val===chunks[proveState.builtIndex]){
        const start=chunks.slice(0,proveState.builtIndex).reduce((n,c)=>n+wordCount(c),0);
        const positions=tokenWords(chunks[proveState.builtIndex]).map((_,i)=>start+i);
        recordLearningAttempt(state,v.id,{
          id:`${proveState.runId}:${proveState.builtIndex}`,
          mode:"proveItChunk",
          grade:proveState.chunkMisses?"hard":"good",
          correct:true,
          troublePositions:proveState.chunkMisses?positions:[],
          attemptedPositions:positions
        },{wordCount:wordCount(v.text),schedule:false,eternal:isEternal(state.progress[v.id])});
        proveState.locked=true; btn.classList.add("correct"); SFX.pick();
        const opts=el.querySelector(".prove-options");
        if(opts) opts.classList.add("resolving");
        el.querySelectorAll(".prove-opt").forEach(b=>b.disabled=true);
        state.xp+=3; saveState();
        setTimeout(()=>{ proveState.builtIndex++; proveState.chunkMisses=0; proveState.feedback=""; proveState.locked=false; renderProveIt(); },95);
      }else{
        proveState.misses++; proveState.chunkMisses++; proveState.feedback=proveState.misses===1?"Not quite. Follow the meaning and rhythm of the sentence.":"Look at the final words you completed, then test which option connects naturally.";
        SFX.wrong(); btn.classList.add("wrong");
        const fb=document.getElementById("proveFeedback"); if(fb) fb.textContent=proveState.feedback;
        setTimeout(()=>btn.classList.remove("wrong"),420);
      }
    };
  });
  document.getElementById("proveUndo").onclick=()=>{ if(proveState.builtIndex>0){proveState.builtIndex--;proveState.feedback="Previous phrase removed.";renderProveIt();} };
  document.getElementById("proveSkip").onclick=closeProveIt;
  const modeSwitch=document.getElementById("proveModeSwitch");
  if(modeSwitch) modeSwitch.onclick=()=> openProveIt(proveState.v,"production");
}

/* ---- production rendering (T14) ------------------------------------ */

function proveActiveChunkHTML(){
  const { tokens, wordTokenStart, ranges, session } = proveState;
  const idx = builtChunkCount(proveState);
  const from = wordTokenStart[ranges[idx].start];
  const to = idx+1 < ranges.length ? wordTokenStart[ranges[idx+1].start] : tokens.length;
  return tokens.slice(from,to).map(t => t.isWord ? recallSlotHTML(session,t) : escHTML(t.raw)).join("");
}
function proveReaderProductionHTML(){
  const { chunks } = proveState;
  const builtN = builtChunkCount(proveState);
  const complete = escHTML(chunks.slice(0,builtN).join(" "));
  const upcoming = escHTML(chunks.slice(builtN+1).join(" "));
  return `${complete?`<span class="prove-complete">${complete}</span> `:""}<span class="prove-current" id="proveActiveChunk">${proveActiveChunkHTML()}</span>${upcoming?` <span class="prove-upcoming">${upcoming}</span>`:""}`;
}
function proveLiveStatsHTML(){
  const { session } = proveState;
  const pos = session.position;
  if(pos===0) return `<div class="recall-live">Word 1 of ${session.words.length}</div>`;
  let clean=0;
  for(let i=0;i<pos;i++){ const s=session.slots[i]; if(s.filled && s.misses===0 && !s.revealed) clean++; }
  const pct=Math.round((clean/pos)*100);
  return `<div class="recall-live">Word ${Math.min(pos+1,session.words.length)} of ${session.words.length} · ${pct}% clean so far</div>`;
}
const PROVE_KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
function provePadHTML(){
  const hearts = arenaHeartCount();
  return `
    <div class="recall-pad">
      ${PROVE_KEY_ROWS.map((row,i) => `<div class="recall-pad-row${i===2?' last':''}">${
        [...row].map(k=>`<button class="recall-key" data-k="${k}" type="button">${k}</button>`).join("")
      }${i===2 ? `<button class="recall-key recall-key-back" id="proveBackKey" type="button" aria-label="Backspace">⌫</button>` : ""}</div>`).join("")}
      <button class="recall-key recall-key-hint" id="proveHintKey" type="button" ${hearts<=0?'disabled':''}>
        💛 Reveal this word (${hearts}/${ARENA_HEART_MAX})
      </button>
    </div>`;
}
function proveProductionActiveHTML(){
  return `
    <div class="prove-instruction"><span>Type the first letter of each word in this chunk.</span><strong> Finished chunks stay above.</strong></div>
    <div class="prove-reader-wrap"><div class="prove-reader" id="proveReader">${proveReaderProductionHTML()}</div></div>
    <div class="prove-action">
      ${proveLiveStatsHTML()}
      <div id="proveStatus" class="sr-only" role="status" aria-live="polite"></div>
      ${provePadHTML()}
      <div class="prove-mode-link" id="proveModeSwitch">This one's tough right now — switch to multiple choice ▸</div>
    </div>`;
}
function wireProveProductionActive(el){
  requestAnimationFrame(()=>{
    const reader=document.getElementById("proveReader");
    const active=document.getElementById("proveActiveChunk");
    if(reader&&active) reader.scrollTop=Math.max(0,active.offsetTop-reader.clientHeight*.42);
  });
  el.querySelectorAll(".recall-key[data-k]").forEach(btn=>{ btn.onclick=()=> proveApplyLetter(btn.dataset.k); });
  const backKey=document.getElementById("proveBackKey");
  if(backKey) backKey.onclick=proveApplyBackspace;
  const hintKey=document.getElementById("proveHintKey");
  if(hintKey) hintKey.onclick=proveApplyReveal;
  const modeSwitch=document.getElementById("proveModeSwitch");
  if(modeSwitch) modeSwitch.onclick=()=> openProveIt(proveState.v,"recognition");
}

/* ---- shared finish ceremony ----------------------------------------- */

function proveFinishHTML(){
  const { v, mode } = proveState;
  const safe=safePassageHTML(v);
  if(mode!=="production"){
    return `
      <div class="prove-instruction">Complete scripture rebuilt in order</div>
      <div class="prove-finish">
        <div><div class="prove-finish-glyph">✦</div><div class="cer-name">Proven!</div><div class="cer-motto">You followed the scripture from beginning to end.</div></div>
        <div class="prove-finish-text">${safe.text}</div>
        <button class="btn primary cer-btn show" id="proveClose">Claim victory ▸</button>
      </div>
      <div></div>`;
  }
  const grade = gradeRecallSession(proveState.session);
  const gate = proveState.gate;
  const passed = gate ? recallMeetsGate(grade.grade, gate) : true;
  const pct = Math.round(grade.accuracy*100);
  const motto = !gate
    ? "You produced the whole passage from memory."
    : gate==="first"
      ? (passed ? "You produced it from memory, start to finish — that's a real seal." : "You built the whole thing. It's not quite seal-clean yet, and that's what practice is for.")
      : (passed ? "A clean rebuild from memory. That's evidence enough to re-seal." : "You rebuilt it — a re-seal needs a steadier pass, so this one counts as practice.");
  const ctaLabel = (gate && passed) ? (gate==="first" ? "Seal it ✦" : "Re-seal it ✦") : "Claim victory ▸";
  return `
    <div class="prove-instruction">Complete scripture rebuilt in order — from memory</div>
    <div class="prove-finish">
      <div><div class="prove-finish-glyph">✦</div><div class="cer-name">Proven!</div><div class="cer-motto">${motto}</div></div>
      <div class="prove-grade-line">${pct}% clean${gate && !passed ? " · not gate-ready yet" : ""}</div>
      <div class="prove-finish-text">${safe.text}</div>
      <button class="btn primary cer-btn show" id="proveClose">${ctaLabel}</button>
      ${gate && !passed ? `<button class="prove-tool" id="proveRetryChain">↻ Try the chain again</button>` : ``}
    </div>
    <div></div>`;
}
function wireProveFinish(){
  const { v, mode } = proveState;
  if(mode!=="production"){
    /* T7 (unchanged): the claim fires as soon as this screen renders,
       not on the button click — the click only closes the modal. */
    claimProvePractice(v);
    document.getElementById("proveClose").onclick=closeProveIt;
    return;
  }
  recordProveLearning();
  const grade = gradeRecallSession(proveState.session);
  const gate = proveState.gate;
  const passed = gate ? recallMeetsGate(grade.grade, gate) : false;
  const retry=document.getElementById("proveRetryChain");
  if(retry) retry.onclick=()=> openProveIt(v,"production");
  if(!(gate && passed)) claimProvePractice(v);
  document.getElementById("proveClose").onclick=()=>{
    if(gate && passed){
      closeProveIt();
      if(gate==="first") performSeal(v,grade.grade);
      else performReseal(v,{grade:grade.grade,scheduled:true});
    } else {
      closeProveIt();
    }
  };
}

/* ---- shell (shared by both modes) ----------------------------------- */

function renderProveIt(){
  const el = document.getElementById("proveIt");
  const { v, chunks, mode } = proveState;
  const safe=safePassageHTML(v);
  const done = mode==="recognition" ? proveState.builtIndex>=chunks.length : isRecallComplete(proveState.session);
  const builtN = mode==="recognition" ? proveState.builtIndex : builtChunkCount(proveState);
  const pct = Math.round((builtN/chunks.length)*100);
  const kicker = mode==="recognition" ? "🧩 Prove It — recognize the order" : "🧩 Prove It — build it from memory";

  el.innerHTML=`
    <div class="cer-backdrop" id="proveItBackdrop"></div>
    <div class="relic-pop-stage">
      <div class="cer-stage prove-stage" role="dialog" aria-modal="true" aria-label="Prove It ${safe.ref}">
        <button class="rp-close" id="proveItClose" aria-label="Close">✕</button>
        <div class="prove-head">
          <div class="cer-kicker">${kicker}</div>
          <div class="prove-title-row"><div class="prove-ref">${safe.ref}</div><div class="prove-step">${builtN} of ${chunks.length}</div></div>
          <div class="prove-progress" style="--pct:${pct}%"><i></i></div>
        </div>
        ${done ? proveFinishHTML() : (mode==="recognition" ? proveRecognitionActiveHTML() : proveProductionActiveHTML())}
      </div>
    </div>`;
  el.classList.add("show");
  document.getElementById("proveItClose").onclick=closeProveIt;
  document.getElementById("proveItBackdrop").onclick=closeProveIt;
  document.removeEventListener("keydown",proveKeyHandler);
  document.addEventListener("keydown",proveKeyHandler);

  if(done){ wireProveFinish(); return; }
  if(mode==="recognition") wireProveRecognitionActive(el);
  else wireProveProductionActive(el);
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
Object.defineProperty(SQ,"proveState",{get:()=>proveState,set:v=>{proveState=v;},enumerable:true,configurable:true});
SQ.chunkVerse = chunkVerse;
SQ.chunkWordRanges = chunkWordRanges;
SQ.openProveIt = openProveIt;
SQ.closeProveIt = closeProveIt;
SQ.proveKeyHandler = proveKeyHandler;
SQ.proveReaderHTML = proveReaderHTML;
SQ.renderProveIt = renderProveIt;
