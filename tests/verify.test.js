/* verify.test.js — text verification (T4). Run: node tests/verify.test.js
   No framework. The point of this file is that the drift detection actually
   detects drift, including the kinds of drift that are invisible on screen. */
const path = require("path");
const V = require(path.join(__dirname, "..", "js", "00-verify.js"));
const { textHash, verificationFor, isVerifiedText, verificationSummary, sourceRecordFor } = V;

let pass = 0, fail = 0;
function ok(name, cond, extra){
  if(cond){ pass++; }
  else { fail++; console.log("FAIL  " + name + (extra ? "\n      " + extra : "")); }
}
function eq(name, got, want){ ok(name, got === want, `got  ${JSON.stringify(got)}\n      want ${JSON.stringify(want)}`); }

/* ---- textHash ---------------------------------------------------------- */
const TEXT = "And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded.";

eq("stable across calls", textHash(TEXT), textHash(TEXT));
eq("carries the algorithm name", textHash(TEXT).slice(0,6), "fnv1a:");
eq("carries the length", textHash(TEXT).split(":")[2], String(TEXT.length));
eq("empty is not an error", typeof textHash(""), "string");
eq("null and empty agree", textHash(null), textHash(""));
eq("undefined and empty agree", textHash(undefined), textHash(""));

/* The differences that a verbatim memorization app must not ignore. Every one
   of these is nearly invisible on screen and all of them are real edits. */
ok("curly vs straight apostrophe differs",
   textHash("the Lord’s word") !== textHash("the Lord's word"));
ok("en dash vs em dash differs",
   textHash("Alma 34–35") !== textHash("Alma 34—35"));
ok("double space differs",
   textHash("go and  do") !== textHash("go and do"));
ok("trailing space differs",
   textHash("go and do ") !== textHash("go and do"));
ok("case differs",
   textHash("The Lord") !== textHash("the Lord"));
ok("one dropped comma differs",
   textHash("I, Nephi, said") !== textHash("I Nephi, said"));
ok("transposition differs",
   textHash("go and do") !== textHash("do and go"));

/* Length is in the hash, so any same-length collision still has to beat the
   two accumulators. Cheap sanity sweep over single-character mutations. */
(function(){
  const seen = new Set([textHash(TEXT)]);
  let collisions = 0;
  for(let i = 0; i < TEXT.length; i++){
    const mutated = TEXT.slice(0,i) + (TEXT[i] === "x" ? "y" : "x") + TEXT.slice(i+1);
    const h = textHash(mutated);
    if(seen.has(h)) collisions++;
    seen.add(h);
  }
  eq("no collision across every single-character mutation", collisions, 0);
})();

/* ---- verificationFor --------------------------------------------------- */
const verse = {ref:"1 Nephi 3:7", text:TEXT};

global.TEXT_SOURCES = {};
eq("no record at all -> unverified", verificationFor(verse).state, "unverified");
eq("unverified is not verified", isVerifiedText(verse), false);
ok("unverified still reports a hash", /^fnv1a:/.test(verificationFor(verse).hash));
ok("unverified explains itself", verificationFor(verse).detail.length > 20);

global.TEXT_SOURCES = {
  "1 Nephi 3:7": {hash: textHash(TEXT), source:"1920 Book of Mormon", verifiedAt:"2026-08-11", by:"tester"}
};
eq("matching hash -> verified", verificationFor(verse).state, "verified");
eq("isVerifiedText agrees", isVerifiedText(verse), true);
ok("verified names the source", verificationFor(verse).detail.includes("1920 Book of Mormon"));
ok("verified names the date", verificationFor(verse).detail.includes("2026-08-11"));
ok("verified names the person", verificationFor(verse).detail.includes("tester"));

/* The case the whole mechanism exists for: someone edited the text after it
   was reviewed. Nobody has to remember to clear a flag. */
eq("text edited after review -> drifted",
   verificationFor({ref:"1 Nephi 3:7", text: TEXT + " Amen."}).state, "drifted");
eq("one curly quote swapped -> drifted",
   verificationFor({ref:"1 Nephi 3:7", text: TEXT.replace("father:", "father’s:")}).state, "drifted");
eq("a single dropped comma -> drifted",
   verificationFor({ref:"1 Nephi 3:7", text: TEXT.replace("I, Nephi,", "I Nephi,")}).state, "drifted");
ok("drifted still names the original review",
   verificationFor({ref:"1 Nephi 3:7", text: TEXT + "!"}).detail.includes("1920 Book of Mormon"));

/* A record for a different reference must not vouch for this one. */
eq("record keyed to another ref does not apply",
   verificationFor({ref:"2 Nephi 2:25", text:TEXT}).state, "unverified");

/* A record whose hash was hand-edited to silence a warning still has to match
   the text; there is no way to assert verification without the real text. */
global.TEXT_SOURCES = {
  "1 Nephi 3:7": {hash:"fnv1a:0000000000000000:0", source:"made up", verifiedAt:"2026-01-01"}
};
eq("a bogus hash does not grant verification", verificationFor(verse).state, "drifted");

/* ---- verificationSummary ----------------------------------------------- */
global.TEXT_SOURCES = {
  "a": {hash: textHash("aaa"), source:"s", verifiedAt:"2026-08-11"},
  "b": {hash: textHash("BBB"), source:"s", verifiedAt:"2026-08-11"}   // b's text is "bbb" -> drifted
};
const summary = verificationSummary([
  {ref:"a", text:"aaa"},
  {ref:"b", text:"bbb"},
  {ref:"c", text:"ccc"}
]);
eq("summary verified",   summary.verified,   1);
eq("summary drifted",    summary.drifted,    1);
eq("summary unverified", summary.unverified, 1);
eq("summary total",      summary.total,      3);

/* ---- sourceRecordFor --------------------------------------------------- */
const rec = sourceRecordFor(verse, "1920 Book of Mormon", "tester");
ok("record line quotes the ref", rec.includes('"1 Nephi 3:7"'));
ok("record line carries the real hash", rec.includes(textHash(TEXT)));
ok("record line names the source", rec.includes("1920 Book of Mormon"));
ok("record line ends ready to paste", rec.trim().endsWith("},"));
/* And it must round-trip: paste it in, and the passage verifies. */
global.TEXT_SOURCES = eval("({" + rec + "})");
eq("pasted record verifies the passage", verificationFor(verse).state, "verified");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
