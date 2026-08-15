/* 00-refmatch.js — reference-string matching for typed-answer Arena questions (T15)
   ===========================================================================
   T15 adds two Arena question types that ask the learner to TYPE a scripture
   reference from memory rather than pick it from a list ("recall is
   cue-specific; recognizing a reference in a list is not producing one" --
   ROADMAP.md's own framing for why this was missing). Typed input needs a
   forgiving comparison: nobody should lose credit over "1 Nephi 3:7" vs
   "1 nephi 3 : 7" vs "1 Nephi  3:7".

   Forgiving, but not loose enough to collide two different references.
   normalizeRef() only strips COSMETIC variation -- case, extra whitespace,
   dash style (via normalizePunct, the same dash-family straightening the
   tokenizer already uses), and spacing around ":" and "&". It deliberately
   does NOT strip the colon itself the way normWords()-style comparisons
   strip all punctuation: "John 3:16" and "John 31:6" must never match.
   =========================================================================== */

const RefTokens = (typeof normalizePunct === "function")
  ? { normalizePunct }
  : (typeof require === "function" ? require("./00-tokenize.js") : null);

function normalizeRef(str){
  return RefTokens.normalizePunct(String(str == null ? "" : str))
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s*&\s*/g, "&")
    .trim();
}

function refsMatch(a, b){
  const na = normalizeRef(a);
  return na !== "" && na === normalizeRef(b);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { normalizeRef, refsMatch };
}
if (typeof SQ !== "undefined") {
  SQ.normalizeRef = normalizeRef;
  SQ.refsMatch = refsMatch;
}
