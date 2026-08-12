/* 23-proveit.js
   Prove It — order-recall puzzle
   Extracted verbatim from index.html lines 6749-6913 by T2. */
/* =========================================================
   PROVE IT — order-recall puzzle. Break the verse into
   clickable sections and rebuild it in the correct order.
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
function openProveIt(v){
  const chunks = chunkVerse(v.text);
  if(chunks.length < 2){ showToast("This verse is too short for Prove It."); return; }
  proveState = { v, chunks, builtIndex:0, misses:0, feedback:"", locked:false };
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
  if(!proveState || proveState.locked) return;
  const n=Number(e.key);
  if(n>=1 && n<=3){
    const btn=document.querySelector(`#proveIt .prove-opt[data-key="${n}"]`);
    if(btn) btn.click();
  }
}
function proveReaderHTML(chunks,builtIndex){
  const complete=chunks.slice(0,builtIndex).join(" ");
  const upcoming=chunks.slice(builtIndex).join(" ");
  return `${complete?`<span class="prove-complete">${complete}</span> `:""}<span class="prove-cursor" id="proveCursor" aria-label="next phrase"></span>${upcoming?` <span class="prove-upcoming">${upcoming}</span>`:""}`;
}
function renderProveIt(){
  const el = document.getElementById("proveIt");
  const {v,chunks,builtIndex}=proveState;
  const done=builtIndex>=chunks.length;
  const pct=Math.round((builtIndex/chunks.length)*100);
  let options=[];
  if(!done){
    const correct=chunks[builtIndex];
    const pool=chunks.filter((c,i)=>i!==builtIndex && c!==correct);
    const distractors=shuffleArr(pool).slice(0,2);
    options=shuffleArr([correct,...distractors]);
  }
  el.innerHTML=`
    <div class="cer-backdrop" id="proveItBackdrop"></div>
    <div class="relic-pop-stage">
      <div class="cer-stage prove-stage" role="dialog" aria-modal="true" aria-label="Prove It ${v.ref}">
        <button class="rp-close" id="proveItClose" aria-label="Close">✕</button>
        <div class="prove-head">
          <div class="cer-kicker">🧩 Prove It</div>
          <div class="prove-title-row"><div class="prove-ref">${v.ref}</div><div class="prove-step">${builtIndex} of ${chunks.length}</div></div>
          <div class="prove-progress" style="--pct:${pct}%"><i></i></div>
        </div>
        ${done?`
          <div class="prove-instruction">Complete scripture rebuilt in order</div>
          <div class="prove-finish">
            <div><div class="prove-finish-glyph">✦</div><div class="cer-name">Proven!</div><div class="cer-motto">You followed the scripture from beginning to end.</div></div>
            <div class="prove-finish-text">${v.text}</div>
            <button class="btn primary cer-btn show" id="proveClose">Claim victory ▸</button>
          </div>
          <div></div>
        `:`
          <div class="prove-instruction"><span>Read what you have built.</span><strong> Choose the phrase that follows.</strong></div>
          <div class="prove-reader-wrap"><div class="prove-reader" id="proveReader">${proveReaderHTML(chunks,builtIndex)}</div></div>
          <div class="prove-action">
            <div class="prove-prompt">What comes next?</div>
            <div class="prove-options">
              ${options.map((o,i)=>`<button class="btn prove-opt" data-key="${i+1}" data-opt="${encodeURIComponent(o)}">${o}</button>`).join("")}
            </div>
            <div class="prove-feedback" id="proveFeedback">${proveState.feedback||""}</div>
            <div class="prove-tools">
              <button class="prove-tool" id="proveUndo" ${builtIndex===0?"disabled":""}>↶ Undo last</button>
              <button class="prove-tool" id="proveSkip">Finish later</button>
            </div>
          </div>
        `}
      </div>
    </div>`;
  el.classList.add("show");
  document.getElementById("proveItClose").onclick=closeProveIt;
  document.getElementById("proveItBackdrop").onclick=closeProveIt;
  document.removeEventListener("keydown",proveKeyHandler);
  document.addEventListener("keydown",proveKeyHandler);
  if(!done){
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
          proveState.locked=true; btn.classList.add("correct"); SFX.pick();
          const opts=el.querySelector(".prove-options");
          if(opts) opts.classList.add("resolving");
          el.querySelectorAll(".prove-opt").forEach(b=>b.disabled=true);
          state.xp+=3; saveState();
          setTimeout(()=>{ proveState.builtIndex++; proveState.feedback=""; proveState.locked=false; renderProveIt(); },95);
        }else{
          proveState.misses++; proveState.feedback=proveState.misses===1?"Not quite. Follow the meaning and rhythm of the sentence.":"Look at the final words you completed, then test which option connects naturally.";
          SFX.wrong(); btn.classList.add("wrong");
          const fb=document.getElementById("proveFeedback"); if(fb) fb.textContent=proveState.feedback;
          setTimeout(()=>btn.classList.remove("wrong"),420);
        }
      };
    });
    document.getElementById("proveUndo").onclick=()=>{ if(proveState.builtIndex>0){proveState.builtIndex--;proveState.feedback="Previous phrase removed.";renderProveIt();} };
    document.getElementById("proveSkip").onclick=closeProveIt;
  }else{
    /* T7: Prove It was replayable forever for +15 XP every single
       completion, no cap -- the puzzle itself resets fresh each open, so
       nothing here ever remembered it had already paid out. p.provenIt
       is a separate, genuinely one-time flag (the relic-glow unlock);
       the XP is now capped at once per verse per day, keyed off it. */
    const p=state.progress[v.id];
    const rewarded = claimReward("prove:"+v.id);
    if(rewarded) state.xp+=15;
    touchStreak();
    if(!p.provenIt){
      p.provenIt=true;
      showToast(`🧩 <strong>${v.ref}</strong> proven! Its relic now glows on the shelf.${rewarded ? " +15 XP" : ""}`);
    } else if(rewarded){
      showToast(`🧩 Proven again! +15 XP`);
    } else {
      showToast(`🧩 Proven again — practice completed. Today's Prove It reward is already claimed.`);
    }
    saveState(); SFX.fanfare(); FX.rain({count:70});
    document.getElementById("proveClose").onclick=closeProveIt;
  }
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
Object.defineProperty(SQ,"proveState",{get:()=>proveState,set:v=>{proveState=v;},enumerable:true,configurable:true});
SQ.chunkVerse = chunkVerse;
SQ.openProveIt = openProveIt;
SQ.closeProveIt = closeProveIt;
SQ.proveKeyHandler = proveKeyHandler;
SQ.proveReaderHTML = proveReaderHTML;
SQ.renderProveIt = renderProveIt;
