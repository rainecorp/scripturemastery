/* refmatch.test.js — reference-string matching for typed Arena answers (T15).
   Run: node tests/refmatch.test.js
   The point of this file: forgiving enough that a real learner's typing
   variance always passes, strict enough that two different references
   never accidentally match. */
const path = require("path");
const { normalizeRef, refsMatch } = require(path.join(__dirname, "..", "js", "00-refmatch.js"));

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("FAIL  " + name + (extra ? "\n      " + extra : "")); }
}
function eq(name, got, want){ ok(name, got === want, `got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`); }

/* ---- forgiveness: the variance a real learner actually types ------------ */
ok("exact match",                 refsMatch("John 3:16", "John 3:16"));
ok("case insensitive",            refsMatch("john 3:16", "John 3:16"));
ok("extra internal whitespace",   refsMatch("John  3:16", "John 3:16"));
ok("leading/trailing whitespace", refsMatch("  John 3:16  ", "John 3:16"));
ok("spaced colon",                refsMatch("John 3 : 16", "John 3:16"));
ok("en dash range vs hyphen",     refsMatch("D&C 121:34–36", "D&C 121:34-36"));
ok("em dash range vs hyphen",     refsMatch("Matthew 5:14—16", "Matthew 5:14-16"));
ok("spaced hyphen range",         refsMatch("Matthew 5:14 - 16", "Matthew 5:14-16"));
ok("ampersand spacing",           refsMatch("D & C 121:34-36", "D&C 121:34-36"));
ok("curly-vs-straight irrelevant here (no apostrophes in refs)",
   refsMatch("1 Nephi 3:7", "1 Nephi 3:7"));

/* ---- precision: things that must NOT match ------------------------------ */
ok("different verse never matches",     !refsMatch("John 3:16", "John 3:17"));
ok("different chapter never matches",   !refsMatch("John 3:16", "John 4:16"));
ok("different book never matches",      !refsMatch("John 3:16", "1 John 3:16"));
ok("colon boundary prevents digit collision",
   !refsMatch("John 3:16", "John 31:6"));
ok("range vs single verse never matches", !refsMatch("Matthew 5:14-16", "Matthew 5:14"));
ok("empty typed answer never matches anything", !refsMatch("", "John 3:16"));
ok("empty vs empty does not count as a match", !refsMatch("", ""));
ok("whitespace-only typed answer never matches", !refsMatch("   ", "John 3:16"));
ok("null typed answer never matches", !refsMatch(null, "John 3:16"));
ok("undefined typed answer never matches", !refsMatch(undefined, "John 3:16"));

/* ---- normalizeRef directly ----------------------------------------------- */
eq("normalizeRef lowercases and tightens spacing", normalizeRef("  John   3 : 16  "), "john 3:16");
eq("normalizeRef straightens dash family", normalizeRef("D&C 121:34–36"), normalizeRef("D&C 121:34-36"));
eq("normalizeRef is idempotent", normalizeRef(normalizeRef("John 3:16")), normalizeRef("John 3:16"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
