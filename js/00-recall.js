/* 00-recall.js — the Recall Check engine (T5)
   ===========================================================================
   Pure logic for First-Letter Recall (ROADMAP.md §2.3). New in T5 — not
   extracted from the old build, because the old build never checked recall
   at all: `sealVerse()` fires off one button tap, no verification of any
   kind. This is the engine T6 gates sealing on.

   NO RENDERING. Nothing here touches the DOM, a timer, or a sound. A
   session is a plain mutable object; every function either reads it or
   mutates it and returns an event descriptor. T6 owns turning that into
   slots on screen, shake animations, and the 1.2s pause before an
   auto-reveal — this file only owns the decision of WHAT happened.

   THE MODEL: one slot per word. Typing a slot's first letter fills it and
   advances. A wrong, non-adjacent letter is a genuine miss; three misses on
   one slot auto-reveals it (a valve against getting stuck, not a punishment
   — see ROADMAP.md §2.2). A wrong letter that is a QWERTY neighbor of the
   right one is a "slip": with strictMode off it costs nothing at all, on
   the theory that a reflex mistype is not evidence the learner doesn't know
   the word. Backspace fully resets the slot behind you, not just its fill
   state — "go back and try that one again" should mean exactly that.

   Grading is on an ERROR BUDGET, not a raw percentage, because a 7-word
   verse cannot survive one slip at a 95% threshold while a 90-word verse
   shrugs off four. See recallBudgets().
   =========================================================================== */

/* ---- QWERTY adjacency -----------------------------------------------------
   Modeled as a physical key grid (three staggered rows) rather than a
   hand-typed table, so the geometry is checkable instead of asserted. Row
   offsets match a real keyboard: the home row sits half a key right of the
   top row, the bottom row half a key right of that — which is why, say, `s`
   reads as adjacent to both `w` and `e` above it, not just one. */
function buildQwertyAdjacency(){
  const rows = [
    { y: 0, keys: "qwertyuiop", offset: 0 },
    { y: 1, keys: "asdfghjkl",  offset: 0.5 },
    { y: 2, keys: "zxcvbnm",    offset: 1 }
  ];
  const pos = {};
  rows.forEach(r => {
    [...r.keys].forEach((ch, i) => { pos[ch] = { x: i + r.offset, y: r.y }; });
  });
  const letters = Object.keys(pos);
  const adj = {};
  letters.forEach(a => { adj[a] = new Set(); });
  /* Threshold just above sqrt(1^2 + 0.5^2) ≈ 1.118, the distance between a
     key and the diagonal neighbor one row away — the widest gap that still
     counts as "adjacent" on a real keyboard. */
  const THRESHOLD = 1.12;
  for(let i = 0; i < letters.length; i++){
    for(let j = i + 1; j < letters.length; j++){
      const a = letters[i], b = letters[j];
      const dx = pos[a].x - pos[b].x, dy = pos[a].y - pos[b].y;
      if(Math.sqrt(dx * dx + dy * dy) <= THRESHOLD){ adj[a].add(b); adj[b].add(a); }
    }
  }
  return adj;
}
const QWERTY_ADJACENCY = buildQwertyAdjacency();

function isQwertyAdjacent(a, b){
  a = String(a || "").toLowerCase();
  b = String(b || "").toLowerCase();
  return !!(QWERTY_ADJACENCY[a] && QWERTY_ADJACENCY[a].has(b));
}

/* ---- session ---------------------------------------------------------- */

/* One slot per canonical word (tokenWords — the one word count, T3). Only
   what recall needs survives into session.words; nothing here is derived
   from a display concern. */
function createRecallSession(text, opts){
  opts = opts || {};
  const words = tokenWords(text).map(t => ({
    index: t.index, firstLetter: t.firstLetter, core: t.core
  }));
  return {
    text: String(text == null ? "" : text),
    words,
    strictMode: !!opts.strictMode,
    position: 0,
    slots: words.map(() => ({ filled: false, revealed: false, misses: 0, letter: null }))
  };
}

function isRecallComplete(session){
  return session.position >= session.words.length;
}

/* One keystroke at the current slot. Returns an event descriptor; never
   throws on a completed or empty session — it just reports "complete". */
function typeLetter(session, letter){
  if(isRecallComplete(session)) return { event: "complete" };

  const typed = String(letter || "").slice(0, 1).toLowerCase();
  if(typed === "") return { event: "noop" };

  const word = session.words[session.position];
  const slot = session.slots[session.position];
  const correct = String(word.firstLetter || "").toLowerCase();

  if(typed === correct){
    slot.filled = true; slot.revealed = false; slot.letter = word.firstLetter;
    session.position++;
    return { event: "correct", position: session.position - 1 };
  }

  if(!session.strictMode && isQwertyAdjacent(typed, correct)){
    /* No miss recorded, no advance — the spec's "gentle shake, no combo
       break". The learner retries the same slot. */
    return { event: "slip", position: session.position };
  }

  slot.misses++;
  if(slot.misses >= 3){
    /* Anti-stuck valve, not a heart spend — see ROADMAP.md §2.3. */
    slot.filled = true; slot.revealed = true; slot.letter = word.firstLetter;
    session.position++;
    return { event: "autoReveal", position: session.position - 1, misses: slot.misses };
  }
  return { event: "miss", position: session.position, misses: slot.misses };
}

/* Heart hint: reveals the current slot outright. Spending the heart is the
   caller's concern — this only records that a reveal happened. */
function revealHint(session){
  if(isRecallComplete(session)) return { event: "complete" };
  const word = session.words[session.position];
  const slot = session.slots[session.position];
  slot.filled = true; slot.revealed = true; slot.letter = word.firstLetter;
  session.position++;
  return { event: "reveal", position: session.position - 1 };
}

/* Steps back one slot and clears it completely — misses, reveal and fill
   all reset, so retrying that word is a clean attempt, not a patched-over
   one. */
function backspace(session){
  if(session.position === 0) return { event: "noop" };
  session.position--;
  const slot = session.slots[session.position];
  slot.filled = false; slot.revealed = false; slot.misses = 0; slot.letter = null;
  return { event: "backspace", position: session.position };
}

/* ---- scoring and grading ----------------------------------------------- */

function scoreRecallSession(session){
  const words = session.words.length;
  const cleanHits = session.slots.filter(s => s.filled && s.misses === 0 && !s.revealed).length;
  const reveals = session.slots.filter(s => s.revealed).length;
  const slips = words - cleanHits;
  /* A zero-word session is vacuously perfect rather than undefined — there
     is nothing to have gotten wrong. */
  const accuracy = words === 0 ? 1 : cleanHits / words;
  return { words, cleanHits, slips, reveals, accuracy };
}

/* A 7-word verse cannot reach 95% on one slip; a naive percentage threshold
   makes short verses harder than long ones. The floor keeps every verse,
   however short, at least one free wobble. */
function recallBudgets(words){
  return {
    good: Math.max(1, Math.round(words * 0.05)),
    hard: Math.max(2, Math.round(words * 0.15))
  };
}

const RECALL_GRADE_COPY = {
  easy:  "Flawless. Not one stumble.",
  good:  "Sealed. A word or two wobbled — here they are.",
  hard:  "Sealed, but it's fragile. We'll bring this back sooner.",
  again: "Not yet — and that's fine. Here's exactly what tripped you."
};

function gradeRecallSession(session){
  const score = scoreRecallSession(session);
  const budgets = recallBudgets(score.words);
  let grade;
  if(score.slips === 0 && score.reveals === 0) grade = "easy";
  else if(score.slips <= budgets.good && score.reveals === 0) grade = "good";
  else if(score.slips <= budgets.hard && score.reveals <= 1) grade = "hard";
  else grade = "again";
  return Object.assign({ grade, copy: RECALL_GRADE_COPY[grade], budgets }, score);
}

/* ROADMAP.md §2.3 "Evidence table": first seal needs good+, re-seal needs
   hard+. Ranked so "meets or exceeds" is one comparison. */
const RECALL_GRADE_RANK = { again: 0, hard: 1, good: 2, easy: 3 };
function recallMeetsGate(grade, gate){
  const rank = RECALL_GRADE_RANK[grade];
  if(rank === undefined) return false;
  if(gate === "first")  return rank >= RECALL_GRADE_RANK.good;
  if(gate === "reseal") return rank >= RECALL_GRADE_RANK.hard;
  return false;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isQwertyAdjacent, createRecallSession, isRecallComplete, typeLetter,
    revealHint, backspace, scoreRecallSession, recallBudgets,
    gradeRecallSession, recallMeetsGate, RECALL_GRADE_COPY, RECALL_GRADE_RANK
  };
}
if (typeof SQ !== "undefined") {
  SQ.isQwertyAdjacent = isQwertyAdjacent;
  SQ.createRecallSession = createRecallSession;
  SQ.isRecallComplete = isRecallComplete;
  SQ.typeLetter = typeLetter;
  SQ.revealHint = revealHint;
  SQ.recallBackspace = backspace;
  SQ.scoreRecallSession = scoreRecallSession;
  SQ.recallBudgets = recallBudgets;
  SQ.gradeRecallSession = gradeRecallSession;
  SQ.recallMeetsGate = recallMeetsGate;
  SQ.RECALL_GRADE_COPY = RECALL_GRADE_COPY;
}
