/* tests/tokenize.test.js — T3
   Run:  node tests/tokenize.test.js
   No framework, no dependencies, no build. Exits non-zero on failure. */

const path = require("path");
const fs   = require("fs");
const T    = require(path.join(__dirname, "..", "js", "00-tokenize.js"));
const { tokenize, tokenWords, wordCount, tokenText, normWords, normalizePunct } = T;

let pass = 0, fail = 0;
const failures = [];

function eq(actual, expected, label){
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if(a === e){ pass++; return true; }
  fail++; failures.push(`${label}\n      expected ${e}\n      actual   ${a}`);
  return false;
}
function ok(cond, label){ return eq(!!cond, true, label); }
function section(name){ console.log("\n" + name); }

/* ---------------------------------------------------------------- basics -- */
section("round-trip and coverage");

const RT = [
  "In the beginning God created the heaven and the earth.",
  "  leading and trailing space  ",
  "double  space and\ttab and\nnewline",
  "",
  "—",
  "one",
  "“Behold,” he said — and it was so."
];
RT.forEach(s => ok(tokenText(tokenize(s)) === s, `round-trips exactly: ${JSON.stringify(s)}`));

eq(tokenize("").length, 0, "empty string yields no tokens");
eq(tokenize(null).length, 0, "null yields no tokens");
eq(tokenize(undefined).length, 0, "undefined yields no tokens");

/* index is dense, 0-based, and word-only */
{
  const toks = tokenize("A b — c");
  eq(toks.filter(t=>t.isWord).map(t=>t.index), [0,1,2], "index is dense over words only");
  /* "A b — c" is 7 tokens: 3 words, 3 spaces, 1 dash */
  eq(toks.length, 7, "whitespace is tokenized too, so the stream covers the string");
  eq(toks.filter(t=>!t.isWord).map(t=>t.index), [-1,-1,-1,-1], "non-words all carry index -1");
  eq(tokenWords("A b — c").map(t=>t.core), ["A","b","c"], "em dash is not a word");
}

/* ------------------------------------------------------- the DoD examples -- */
section("punctuation, quotes and dashes");

function shape(raw){
  const t = tokenWords(raw)[0] || tokenize(raw).find(x=>!x.isSpace);
  return [t.leadPunct, t.core, t.tailPunct, t.firstLetter, t.norm, t.isWord];
}

eq(shape('“Behold,”'), ["“", "Behold", ",”", "B", "behold", true],  "curly double quotes strip to core");
eq(shape('"Behold,"'), ['"', "Behold", ',"', "B", "behold", true],  "straight double quotes strip to core");
eq(shape("(Behold)"),  ["(", "Behold", ")",  "B", "behold", true],  "parenthesis strips to core");
eq(shape("wo’s"),      ["", "wo’s", "", "w", "wos", true],          "curly apostrophe stays in core, gone from norm");
eq(shape("wo's"),      ["", "wo's", "", "w", "wos", true],          "straight apostrophe normalizes the same way");
eq(shape("well-being"),["", "well-being", "", "w", "wellbeing", true], "hyphenate is ONE word");
eq(shape("earth."),    ["", "earth", ".", "e", "earth", true],      "trailing period");
eq(shape("him;"),      ["", "him", ";", "h", "him", true],          "trailing semicolon");

/* the same word written three ways must compare equal */
eq(new Set([shape("wo’s")[4], shape("wo's")[4], shape("wos")[4]]).size, 1,
   "curly, straight and bare apostrophe all share one norm");

/* dashes */
{
  const lone = tokenize("a — b").filter(t=>!t.isSpace);
  eq(lone.map(t=>t.isWord), [true, false, true], "free-standing em dash is not a word");
  eq(lone[1].leadPunct, "—", "lone dash is carried as punctuation");
  eq(normalizePunct("– — ‒ ―"), "- - - -", "the dash family normalizes to hyphen-minus");
  eq(normalizePunct("‘x’ “y”"), "'x' \"y\"", "curly quotes normalize");
}

/* numerals: real content, must stay words */
section("numerals and verse marks");
eq(tokenWords("ye are 1 in me").map(t=>t.core), ["ye","are","1","in","me"], "a bare numeral is a word by default");
eq(tokenWords("ye are 1 in me")[2].norm, "1", "numeral norm keeps the digit");
eq(tokenWords("3 And it came to pass", {verseMarks:true}).map(t=>t.core),
   ["And","it","came","to","pass"], "verseMarks:true demotes a leading number");
eq(tokenize("3 And", {verseMarks:true}).find(t=>t.isVerseMark).core, "3", "the verse mark is still in the stream");
eq(tokenize("3 And").find(t=>t.isVerseMark), undefined, "verse marks are OFF unless asked for");

/* references, which are not passage text but flow through the same helpers */
section("reference strings");
eq(tokenWords("D&C 121:34–36").map(t=>t.core), ["D&C", "121:34–36"], "D&C and a verse range each stay one token");
eq(tokenWords("D&C 121:34–36")[0].norm, "dc", "ampersand drops out of norm");
eq(tokenWords("Joseph Smith—History 1:15–20").map(t=>t.core),
   ["Joseph", "Smith—History", "1:15–20"], "em dash INSIDE a word does not split it");
eq(tokenWords("Joseph Smith—History")[1].norm, "smithhistory", "internal em dash drops out of norm");

/* --------------------------------------------------- the real passage set -- */
section("all 100 shipped passages");

global.SQ = {}; global.window = { SQ: global.SQ };
eval(fs.readFileSync(path.join(__dirname, "..", "data", "passages.js"), "utf8"));
const DATA = global.SQ.DATA;
const VOLUMES = ["Book of Mormon","New Testament","Doctrine and Covenants","Old Testament"];
const ALL = [];
VOLUMES.forEach(vol => DATA[vol].forEach(v => ALL.push(v)));

eq(ALL.length, 100, "100 passages loaded");

/* every passage round-trips */
{
  const broken = ALL.filter(v => tokenText(tokenize(v.text)) !== v.text).map(v=>v.ref);
  eq(broken, [], "every passage round-trips through the tokenizer");
}

/* THE POINT OF THE TICKET: one index, everywhere.
   The old study path skipped non-\w chunks; the old arena path did not.
   Both now resolve to tokenWords(), so they cannot drift again. */
{
  const studyIndex = v => tokenize(v.text).filter(t=>t.isWord).length;
  const arenaIndex = v => tokenWords(v.text).length;
  const countHelper = v => wordCount(v.text);
  const disagree = ALL.filter(v => !(studyIndex(v) === arenaIndex(v) && arenaIndex(v) === countHelper(v)))
                      .map(v => v.ref);
  eq(disagree, [], "study index === arena index === wordCount, for all 100 passages");
}

/* the seven that used to disagree, pinned to the corrected count */
section("the seven known divergences");
const KNOWN = {
  "Joseph Smith—History 1:15–20": 503,
  "D&C 19:16–19":  89,
  "D&C 58:42–43":  40,
  "D&C 64:9–11":   75,
  "D&C 76:22–24":  80,
  "D&C 121:34–36": 74,
  "D&C 130:20–21": 40
};
Object.entries(KNOWN).forEach(([ref, expected]) => {
  const v = ALL.find(x => x.ref === ref);
  if(!v){ fail++; failures.push(`missing passage ${ref}`); return; }
  eq(wordCount(v.text), expected, `${ref} counts ${expected} words (the em dash is not one)`);

  /* the old splitter counted every whitespace-delimited chunk, so it was over
     by exactly the number of free-standing dashes. Derive that rather than
     assuming one — D&C 19:16–19 has two. */
  const strays = v.text.trim().split(/\s+/).filter(w => !/[\p{L}\p{N}]/u.test(w));
  ok(strays.length > 0, `${ref} does contain ${strays.length} free-standing dash(es)`);
  eq(v.text.trim().split(/\s+/).length, expected + strays.length,
     `${ref}: the old splitter counted ${expected + strays.length} — that was the bug`);
});

/* indices must be usable as stable keys: same text, same answer, every time */
section("stability");
{
  const v = ALL.find(x => x.ref === "D&C 121:34–36");
  const a = tokenWords(v.text).map(t=>[t.index, t.norm]);
  const b = tokenWords(v.text).map(t=>[t.index, t.norm]);
  eq(a, b, "tokenizing twice gives identical indices");
  eq(a[0][0], 0, "first word is index 0");
  eq(a[a.length-1][0], a.length-1, "last word index === count-1");
  eq(normWords(v.text).length, wordCount(v.text), "normWords and wordCount agree");
}

/* every word token has a usable first letter — the §6 bold-initial feature
   and the T5 recall check both depend on this never being empty */
{
  const empty = [];
  ALL.forEach(v => tokenWords(v.text).forEach(t => {
    if(!t.firstLetter) empty.push(`${v.ref} #${t.index} ${JSON.stringify(t.raw)}`);
  }));
  eq(empty, [], "every word token has a non-empty firstLetter");
}

/* norm must never be empty for a word, or comparison silently matches everything */
{
  const empty = [];
  ALL.forEach(v => tokenWords(v.text).forEach(t => {
    if(!t.norm) empty.push(`${v.ref} #${t.index} ${JSON.stringify(t.raw)}`);
  }));
  eq(empty, [], "every word token has a non-empty norm");
}

/* ------------------------------------------------- spans lose nothing ----- */
section("spanByWords partitions text without losing punctuation");

const { spanByWords, displayTokens } = T;

/* A span runs start-of-word[from] .. start-of-word[to]. So punctuation sitting
   between two words rides with the EARLIER span. That is the rule that makes
   consecutive spans lossless; which side the dash lands on matters less than
   the guarantee that it lands somewhere. */
eq(spanByWords("a b — c d", 0, 2), "a b —", "punctuation between words rides with the earlier span");
eq(spanByWords("a b — c d", 2, 4), "c d",   "the next span starts at its first word");
eq(spanByWords("a b — c d", 2),    "c d",   "open-ended span runs to the end");
eq(spanByWords("a b — c d", 0, 2) + " " + spanByWords("a b — c d", 2), "a b — c d",
   "the two halves rejoin to the original, dash included");
eq(spanByWords("a b c", 0) , "a b c", "whole-text span");
eq(spanByWords("", 0, 2), "", "empty text yields empty span");
eq(spanByWords("a b c", 9, 12), "", "out-of-range span yields empty");

/* consecutive spans must reconstruct the passage exactly — this is the
   invariant that stops chunkVerse from silently deleting em dashes */
{
  const lost = [];
  ALL.forEach(v=>{
    const clean = v.text.replace(/\s+/g," ").trim();
    const n = wordCount(clean);
    for(const step of [3, 7, 13]){
      const parts = [];
      for(let i=0; i<n; i+=step) parts.push(spanByWords(clean, i, Math.min(i+step, n)));
      if(parts.join(" ") !== clean) lost.push(`${v.ref} step=${step}`);
    }
  });
  eq(lost, [], "spans at several step sizes rejoin to the original text, for all 100 passages");
}

/* every em-dash passage keeps its dash through a span partition */
{
  const dashed = ALL.filter(v => / — /.test(v.text));
  eq(dashed.length, 7, "seven passages contain a free-standing em dash");
  const dropped = dashed.filter(v=>{
    const clean = v.text.replace(/\s+/g," ").trim();
    const n = wordCount(clean);
    const parts = [];
    for(let i=0;i<n;i+=5) parts.push(spanByWords(clean, i, Math.min(i+5, n)));
    const before = (clean.match(/—/g)||[]).length;
    const after  = (parts.join(" ").match(/—/g)||[]).length;
    return before !== after;
  }).map(v=>v.ref);
  eq(dropped, [], "no em dash is lost when text is cut into spans");
}

/* displayTokens keeps punctuation-only tokens; tokenWords does not */
{
  const v = ALL.find(x => x.ref === "D&C 121:34–36");
  ok(displayTokens(v.text).some(t=>t.raw==="—"), "displayTokens keeps the lone dash");
  ok(!tokenWords(v.text).some(t=>t.raw==="—"), "tokenWords drops the lone dash");
  eq(displayTokens(v.text).filter(t=>t.isWord).length, wordCount(v.text),
     "display stream and word count agree on how many words there are");
}

/* ------------------------------------------------------------------ done -- */
console.log(`\n${pass} passed, ${fail} failed`);
if(fail){
  console.log("\nfailures:");
  failures.forEach(f => console.log("  ✗ " + f));
  process.exit(1);
}
console.log("ok");
