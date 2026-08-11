/* 00-tokenize.js — THE CANONICAL TOKENIZER (T3)
   ===========================================================================
   One meaning of "word position" for the whole app.

   Before this file there were four, and they already disagreed on 7 of the
   100 shipped passages — every one of them because of a free-standing em
   dash. The study screen skipped it (no \w); the Arena, chunkVerse and
   wordCount counted it as a word. So "word 41" meant two different words
   depending on which screen asked, and the drift accumulates mid-passage,
   which means it cannot be corrected after the fact. Trouble maps,
   first-letter recall, phrase drills and speech alignment all key off word
   position, so all four would have silently corrupted.

   THE RULE: `index` counts word tokens only, and it is the one and only
   meaning of word position. Anything that stores, compares, or displays a
   position uses it. Nothing splits text on whitespace by hand ever again.

   Tokens cover the WHOLE string, whitespace included, so a renderer can walk
   them and reproduce the source exactly:

       tokenize(text).map(t => t.raw).join("") === text     // always

   Token shape
   -----------
     raw          exact source substring, verbatim
     isSpace      this token is a run of whitespace
     isWord       a unit the learner has to produce (letters and/or digits)
     isVerseMark  an inline verse number, not a word — see the note below
     index        word position, 0-based; -1 for anything that is not a word
     core         raw minus leading/trailing punctuation ("Behold" of "“Behold,”")
     leadPunct    punctuation before core ("“")
     tailPunct    punctuation after core (",”")
     firstLetter  first letter/digit of core ("B") — drives the §6 bold-initial
                  stages and the first-letter Recall Check in T5/T6
     norm         lowercased, curly punctuation straightened, all punctuation
                  stripped ("behold"). USE THIS FOR EVERY COMPARISON, so that
                  "wo's" and "wo’s" and "wos" are the same answer.

   Dependency tier 00: pure string functions, no app state, no DOM.

   A note on placement: the filename numbers in js/ are LOAD order. This file
   is 00 because it depends on nothing. Files that load earlier than a
   function they call are fine as long as the call happens at runtime rather
   than at load — that pattern already exists (14-arena calls chunkVerse from
   23-proveit). Only load-time execution constrains placement.

   A note on isVerseMark: no shipped passage contains a single digit today, so
   this is inert and always false. It is opt-in (`tokenize(text, {verseMarks:
   true})`) rather than "a run of digits is a verse number", because guessing
   would silently demote real numerals in a passage to non-words and drop them
   out of the index — exactly the class of bug this file exists to end. T10
   turns it on for text that actually carries inline numbering.
   =========================================================================== */

/* Straighten what a keyboard cannot easily type, so comparison is forgiving:
   curly quotes and apostrophes, and the whole dash family. */
function normalizePunct(s){
  return String(s == null ? "" : s)
    .replace(/[‘’‚‛ʼʹ`´]/g, "'")
    .replace(/[“”„‟«»]/g, '"')
    .replace(/[‐‑‒–—―−⁃]/g, "-")
    .replace(/[…]/g, "...")
    .replace(/[   ]/g, " ");
}

const TOK_ALNUM      = /[\p{L}\p{N}]/u;
const TOK_LEAD_PUNCT = /^[^\p{L}\p{N}]*/u;
const TOK_TAIL_PUNCT = /[^\p{L}\p{N}]*$/u;
const TOK_DIGITS     = /^\p{N}+$/u;
const TOK_SCAN       = /(\s+)|(\S+)/gu;

/* The whole point of the file. Returns every token in source order,
   whitespace included. Word tokens carry a stable 0-based `index`. */
function tokenize(text, opts){
  const src = String(text == null ? "" : text);
  const wantVerseMarks = !!(opts && opts.verseMarks);
  const out = [];
  let wordIndex = 0, m;

  TOK_SCAN.lastIndex = 0;
  while((m = TOK_SCAN.exec(src)) !== null){
    if(m[1] !== undefined){
      out.push({
        raw: m[1], isSpace: true, isWord: false, isVerseMark: false, index: -1,
        core: "", leadPunct: "", tailPunct: "", firstLetter: "", norm: "",
        start: m.index, end: m.index + m[1].length
      });
      continue;
    }
    const raw  = m[2];
    const lead = raw.match(TOK_LEAD_PUNCT)[0];
    const rest = raw.slice(lead.length);
    const tail = rest.match(TOK_TAIL_PUNCT)[0];
    const core = tail.length ? rest.slice(0, rest.length - tail.length) : rest;

    const isVerseMark = wantVerseMarks && core !== "" && TOK_DIGITS.test(core);
    const isWord      = core !== "" && !isVerseMark && TOK_ALNUM.test(core);

    out.push({
      raw,
      isSpace: false,
      isWord,
      isVerseMark,
      index: isWord ? wordIndex++ : -1,
      core,
      leadPunct: lead,
      tailPunct: tail,
      firstLetter: isWord ? (core.match(TOK_ALNUM) || [""])[0] : "",
      norm: isWord ? normalizePunct(core).toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") : "",
      start: m.index,
      end: m.index + raw.length
    });
  }
  return out;
}

/* Word tokens only. words[i].index === i, always. */
function tokenWords(text, opts){
  return tokenize(text, opts).filter(t => t.isWord);
}

/* The one word count. Replaces the old trim().split(/\s+/) in 01-catalog. */
function wordCount(text, opts){
  return tokenWords(text, opts).length;
}

/* Reassemble a token list into source text. Round-trips exactly. */
function tokenText(tokens){
  return (tokens || []).map(t => t.raw).join("");
}

/* Plain lowercase words, for comparison. Never for display. */
function normWords(text, opts){
  return tokenWords(text, opts).map(t => t.norm);
}

/* The word tokens at a position range, inclusive of `from`, exclusive of `to`. */
function wordSlice(text, from, to, opts){
  const w = tokenWords(text, opts);
  return w.slice(from, to === undefined ? w.length : to);
}

/* Non-whitespace tokens: what a renderer draws, in order. Includes
   punctuation-only tokens (a free-standing dash), which is the whole reason
   this exists — drop them and the dash vanishes from the screen. */
function displayTokens(text, opts){
  return tokenize(text, opts).filter(t => !t.isSpace);
}

/* The SOURCE TEXT spanning word positions [from, to), verbatim.

   Spans run from the start of word `from` to the start of word `to`, so
   consecutive spans partition the text and nothing between two words can be
   lost — which is exactly what would happen to a free-standing em dash if we
   rebuilt text by joining word tokens with spaces. Use this whenever a slice
   of a passage has to be shown to a human. */
function spanByWords(text, from, to, opts){
  const src   = String(text == null ? "" : text);
  const words = tokenWords(src, opts);
  if(!words.length) return "";
  const lo = Math.max(0, Math.min(from | 0, words.length));
  if(lo >= words.length) return "";
  const a = words[lo].start;
  const b = (to === undefined || to === null || to >= words.length) ? src.length : words[to].start;
  return src.slice(a, Math.max(a, b)).replace(/\s+$/, "");
}

/* Node can require this file directly — it depends on nothing else, which is
   what makes tests/tokenize.test.js possible without a browser. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { tokenize, tokenWords, wordCount, tokenText, normWords,
                     wordSlice, displayTokens, spanByWords, normalizePunct };
}

/* ---- SQ registry ---- */
if (typeof SQ !== "undefined") {
  SQ.normalizePunct = normalizePunct;
  SQ.tokenize = tokenize;
  SQ.tokenWords = tokenWords;
  SQ.wordCount = wordCount;
  SQ.tokenText = tokenText;
  SQ.normWords = normWords;
  SQ.wordSlice = wordSlice;
  SQ.displayTokens = displayTokens;
  SQ.spanByWords = spanByWords;
}
