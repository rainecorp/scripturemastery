/* recall.test.js — the Recall Check engine (T5). Run: node tests/recall.test.js
   No framework. Covers every ROADMAP.md §2.3 / T5 DoD line item plus the
   boundary math the grading formula depends on. */
const path = require("path");
const R = require(path.join(__dirname, "..", "js", "00-recall.js"));
const {
  isQwertyAdjacent, createRecallSession, isRecallComplete, typeLetter,
  revealHint, backspace, scoreRecallSession, recallBudgets,
  gradeRecallSession, recallMeetsGate
} = R;

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond) pass++;
  else { fail++; console.log("FAIL  " + name + (extra ? "\n      " + extra : "")); }
}
function eq(name, got, want){
  ok(name, JSON.stringify(got) === JSON.stringify(want),
     `got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`);
}

/* A fake tokenizer, so this file needs no real scripture text and no
   dependency on 00-tokenize.js loading first — it only needs tokenWords to
   exist in scope, the same contract 00-recall.js relies on at call time. */
global.tokenWords = function(text){
  return String(text).split(/\s+/).filter(Boolean).map((w, i) => ({
    index: i, firstLetter: w[0], core: w
  }));
};

function type(session, letters){
  return [...letters].map(ch => typeLetter(session, ch));
}

/* ---- QWERTY adjacency -------------------------------------------------- */
ok("q and w are adjacent (same row)", isQwertyAdjacent("q", "w"));
ok("q and e are not adjacent (two apart, same row)", !isQwertyAdjacent("q", "e"));
ok("s is adjacent to w (diagonal, row above-left)", isQwertyAdjacent("s", "w"));
ok("s is adjacent to e (diagonal, row above-right)", isQwertyAdjacent("s", "e"));
ok("a is adjacent to z (diagonal, row below)", isQwertyAdjacent("a", "z"));
ok("q and z are not adjacent (too far)", !isQwertyAdjacent("q", "z"));
ok("a letter is not adjacent to itself", !isQwertyAdjacent("q", "q"));
ok("adjacency is symmetric", isQwertyAdjacent("w", "s") === isQwertyAdjacent("s", "w"));
ok("adjacency is case-insensitive", isQwertyAdjacent("Q", "W"));

/* ---- DoD: perfect session grades easy ----------------------------------- */
{
  const s = createRecallSession("For behold this is my work");
  eq("6-word session created 6 slots", s.words.length, 6);
  const events = type(s, "fbtimw");
  ok("all six keystrokes were correct", events.every(e => e.event === "correct"));
  ok("session is complete after 6 correct letters", isRecallComplete(s));
  const grade = gradeRecallSession(s);
  eq("perfect session grades easy", grade.grade, "easy");
  eq("perfect session has zero slips", grade.slips, 0);
  eq("perfect session has zero reveals", grade.reveals, 0);
  eq("perfect session accuracy is 1", grade.accuracy, 1);
}

/* ---- DoD: one slip on 40 words -> good ---------------------------------- */
{
  const words = Array.from({length:40}, (_,i) => "w"+i+"xyz");
  const s = createRecallSession(words.join(" "));
  eq("40-word session created 40 slots", s.words.length, 40);
  // word 0 is "w0xyz" -> first letter "w". Miss once (non-adjacent to w: "q" IS
  // adjacent to w, so use a genuinely non-adjacent wrong letter: "m").
  ok("'m' is not adjacent to 'w'", !isQwertyAdjacent("m", "w"));
  const miss = typeLetter(s, "m");
  eq("wrong non-adjacent letter is a miss", miss.event, "miss");
  const recover = typeLetter(s, "w");
  eq("recovering after one miss still advances", recover.event, "correct");
  // words 1..39: first letters w,w,w... all "w" (since "w"+i+"xyz") — type them all
  for(let i = 1; i < 40; i++) typeLetter(s, "w");
  ok("40-word session complete", isRecallComplete(s));
  const score = scoreRecallSession(s);
  eq("39 clean hits, 1 slip", [score.cleanHits, score.slips], [39, 1]);
  eq("40-word good budget is 2", recallBudgets(40).good, 2);
  const grade = gradeRecallSession(s);
  eq("one recovered miss on 40 words grades good", grade.grade, "good");
}

/* ---- DoD: one slip on 6 words -> good (budget floor) -------------------- */
{
  eq("6-word good budget floors at 1", recallBudgets(6).good, 1);
  const s = createRecallSession("aaa bbb ccc ddd eee fff");
  typeLetter(s, "m");           // miss on word 0 ('a'), non-adjacent
  typeLetter(s, "a");           // recover
  type(s, "bcdef");             // the rest clean
  ok("6-word session complete", isRecallComplete(s));
  const score = scoreRecallSession(s);
  eq("5 clean hits, 1 slip on 6 words", [score.cleanHits, score.slips], [5, 1]);
  const grade = gradeRecallSession(s);
  eq("one recovered miss at the 1-word budget floor still grades good", grade.grade, "good");
}

/* one more slip than the floor allows must NOT grade good */
{
  const s = createRecallSession("aaa bbb ccc ddd eee fff");
  typeLetter(s, "m"); typeLetter(s, "a");   // slip on word 0
  typeLetter(s, "m"); typeLetter(s, "b");   // slip on word 1 -- exceeds budget of 1
  type(s, "cdef");
  const grade = gradeRecallSession(s);
  ok("two recovered misses on 6 words is NOT good", grade.grade !== "good");
}

/* ---- DoD: 3 misses -> auto-reveal + advance ----------------------------- */
{
  const s = createRecallSession("for behold this");
  eq("first word's letter is f", s.words[0].firstLetter, "f");
  const e1 = typeLetter(s, "m");
  const e2 = typeLetter(s, "x");
  eq("first two non-adjacent misses do not advance", s.position, 0);
  eq("misses accumulate", [e1.event, e1.misses, e2.event, e2.misses],
     ["miss", 1, "miss", 2]);
  const e3 = typeLetter(s, "q");
  eq("third miss auto-reveals and advances", e3.event, "autoReveal");
  eq("position advanced past the auto-revealed slot", s.position, 1);
  eq("the slot is filled", s.slots[0].filled, true);
  eq("the slot is marked revealed", s.slots[0].revealed, true);
  eq("the slot holds the correct letter despite three wrong keystrokes",
     s.slots[0].letter, "f");
}

/* ---- DoD: reveal disqualifies good --------------------------------------- */
{
  // 20 clean words, all correct, but the LAST word is revealed via the heart
  // hint rather than typed. Nothing else went wrong.
  const words = Array.from({length:20}, (_,i) => "w"+i);
  const s = createRecallSession(words.join(" "));
  for(let i = 0; i < 19; i++) typeLetter(s, "w");
  const r = revealHint(s);
  eq("revealHint fires a reveal event", r.event, "reveal");
  ok("session complete after the reveal", isRecallComplete(s));
  const score = scoreRecallSession(s);
  eq("19 clean hits, 1 slip, 1 reveal", [score.cleanHits, score.slips, score.reveals], [19, 1, 1]);
  const grade = gradeRecallSession(s);
  ok("a single reveal disqualifies easy", grade.grade !== "easy");
  ok("a single reveal disqualifies good even though the numeric slip count "
     + "would pass the good budget on its own", grade.grade !== "good");
  eq("one reveal, otherwise clean, grades hard", grade.grade, "hard");
}
{
  // Two reveals on an otherwise-clean 20-word session exceeds the "reveals
  // <= 1" ceiling for hard, so it must fall all the way to again.
  const words = Array.from({length:20}, (_,i) => "w"+i);
  const s = createRecallSession(words.join(" "));
  for(let i = 0; i < 18; i++) typeLetter(s, "w");
  revealHint(s); revealHint(s);
  const grade = gradeRecallSession(s);
  eq("two reveals exceed the hard ceiling and grade again", grade.grade, "again");
}

/* ---- DoD: adjacent-key slip -- no miss off, miss on ---------------------- */
{
  // word "was" -> first letter "w". "q" is QWERTY-adjacent to "w".
  const off = createRecallSession("was here", { strictMode: false });
  ok("'q' is adjacent to 'w'", isQwertyAdjacent("q", "w"));
  const slip = typeLetter(off, "q");
  eq("adjacent wrong letter is a slip, not a miss, with strictMode off", slip.event, "slip");
  eq("a slip does not advance position", off.position, 0);
  eq("a slip records no miss", off.slots[0].misses, 0);
  const recover = typeLetter(off, "w");
  eq("the correct letter afterward still advances", recover.event, "correct");
  eq("the slot is a clean hit despite the earlier adjacent slip", off.slots[0].misses, 0);

  const on = createRecallSession("was here", { strictMode: true });
  const miss = typeLetter(on, "q");
  eq("the same adjacent letter IS a miss with strictMode on", miss.event, "miss");
  eq("strictMode records the miss", on.slots[0].misses, 1);
  eq("a miss (even adjacent, in strict mode) does not advance", on.position, 0);
}

/* ---- DoD: backspace restores prior state --------------------------------- */
{
  const s = createRecallSession("for behold this");
  const before = JSON.parse(JSON.stringify(s.slots[0]));
  typeLetter(s, "f");
  eq("position advanced after a correct letter", s.position, 1);
  const back = backspace(s);
  eq("backspace fires a backspace event", back.event, "backspace");
  eq("position stepped back", s.position, 0);
  eq("the slot is restored to its pristine pre-attempt state",
     s.slots[0], before);

  // backspace after misses AND a reveal must also fully clear the slot
  typeLetter(s, "m"); typeLetter(s, "x"); typeLetter(s, "q"); // 3 misses -> autoReveal
  eq("auto-revealed and advanced", [s.slots[0].revealed, s.position], [true, 1]);
  backspace(s);
  eq("backspace clears misses too", s.slots[0].misses, 0);
  eq("backspace clears a reveal too", s.slots[0].revealed, false);
  eq("backspace clears the fill too", s.slots[0].filled, false);

  eq("backspace at position 0 is a no-op", backspace(createRecallSession("a b")).event, "noop");
}

/* ---- DoD: accuracy correct at every boundary ----------------------------- */
{
  const one = createRecallSession("alpha");
  typeLetter(one, "a");
  eq("1-word session, clean, accuracy 1", scoreRecallSession(one).accuracy, 1);

  const oneMiss = createRecallSession("alpha");
  typeLetter(oneMiss, "m"); typeLetter(oneMiss, "x"); typeLetter(oneMiss, "q");
  eq("1-word session, auto-revealed, accuracy 0", scoreRecallSession(oneMiss).accuracy, 0);

  const three = createRecallSession("alpha beta gamma");
  typeLetter(three, "a"); typeLetter(three, "m"); typeLetter(three, "b"); typeLetter(three, "g");
  const s3 = scoreRecallSession(three);
  eq("3-word session, 2 clean of 3", s3.cleanHits, 2);
  ok("2/3 accuracy is exactly two-thirds", Math.abs(s3.accuracy - 2/3) < 1e-12);

  const empty = createRecallSession("");
  eq("empty session has 0 words", empty.words.length, 0);
  ok("empty session is complete on creation", isRecallComplete(empty));
  eq("empty session accuracy is vacuously 1", scoreRecallSession(empty).accuracy, 1);
  eq("empty session grades easy", gradeRecallSession(empty).grade, "easy");
}

/* ---- recallBudgets: floor behavior across sizes -------------------------- */
{
  eq("1-word budgets floor at good=1, hard=2", recallBudgets(1), {good:1, hard:2});
  eq("6-word budgets floor at good=1, hard=2", recallBudgets(6), {good:1, hard:2});
  eq("13-word budgets", recallBudgets(13), {good:1, hard:2});
  eq("40-word budgets scale up", recallBudgets(40), {good:2, hard:6});
  eq("100-word budgets scale up", recallBudgets(100), {good:5, hard:15});
}

/* ---- safety: complete/empty sessions never throw ------------------------- */
{
  const s = createRecallSession("a");
  typeLetter(s, "a");
  eq("typing after completion reports complete, does not throw", typeLetter(s, "a").event, "complete");
  eq("revealing after completion reports complete, does not throw", revealHint(s).event, "complete");
  eq("typing an empty string is a safe no-op", typeLetter(createRecallSession("a"), "").event, "noop");
  eq("multi-character input uses only the first character",
     typeLetter(createRecallSession("alpha"), "az").event, "correct");
}

/* ---- gates: first seal needs good+, re-seal needs hard+ ------------------ */
{
  eq("easy meets the first-seal gate", recallMeetsGate("easy", "first"), true);
  eq("good meets the first-seal gate", recallMeetsGate("good", "first"), true);
  eq("hard does not meet the first-seal gate", recallMeetsGate("hard", "first"), false);
  eq("again does not meet the first-seal gate", recallMeetsGate("again", "first"), false);
  eq("hard meets the re-seal gate", recallMeetsGate("hard", "reseal"), true);
  eq("again does not meet the re-seal gate", recallMeetsGate("again", "reseal"), false);
  eq("easy meets the re-seal gate", recallMeetsGate("easy", "reseal"), true);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
