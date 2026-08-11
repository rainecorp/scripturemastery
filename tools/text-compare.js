/* text-compare.js — step 3 of the T4 text verification (audit tool, not CI)
   ===========================================================================
   Compare each stored passage against the text fetched from
   churchofjesuschrist.org, and classify the difference. Run after
   tools/text-fetch-plan.js and the manual fetch step it documents.

   NOTHING IS EDITED HERE. This produces a report. The fetch goes through a
   summarizing model, so a mismatch is evidence of a possible problem, not
   proof of one — auto-applying "fixes" from it would be exactly the kind of
   silent corruption the verification system exists to prevent. */
const fs = require("fs");
const ROOT = "/Users/boss-mode/Documents/scripture mastery/scripture-tower";
const SQ = {};
eval(fs.readFileSync(ROOT + "/data/passages.js", "utf8").replace("const DATA", "global.DATA"));
const plan = require("./plan.json");
const fetched = require("./fetched-all.json");
const { textHash } = require(ROOT + "/js/00-verify.js");

/* Page artifacts that are not part of the verse: the pilcrow the KJV pages
   carry, and the bracketed editorial insertions the site renders inline. */
function stripPageArtifacts(s){
  return s.replace(/^¶\s*/, "").trim();
}
/* Cosmetic-only normalization, used ONLY to classify a difference, never to
   rewrite stored text. Straight vs curly quotes and dash width are exactly
   the differences a human proofreader would miss and the hash must catch, so
   they are reported separately rather than ignored. */
function normCosmetic(s){
  return s.replace(/[‘’]/g,"'").replace(/[“”]/g,'"')
          .replace(/[–—]/g,"-").replace(/\s+/g," ").trim();
}
function firstDiff(a, b){
  const n = Math.min(a.length, b.length);
  for(let i=0;i<n;i++) if(a[i]!==b[i]) return i;
  return a.length === b.length ? -1 : n;
}
function around(s, i, w){
  return JSON.stringify(s.slice(Math.max(0,i-w), i+w));
}

const rows = [];
plan.forEach(p=>{
  const key = p.url.replace("https://www.churchofjesuschrist.org/study/scriptures/","").replace("?lang=eng","");
  const page = fetched[key] || {};
  p.refs.forEach(r=>{
    const parts = r.verses.map(v=>{
      const t = page[String(v)];
      return t == null ? null : stripPageArtifacts(t);
    });
    if(parts.some(x=>x == null)){
      rows.push({ref:r.ref, status:"NOT FETCHED", key});
      return;
    }
    const official = parts.join(" ");
    const stored = r.text;
    let status;
    if(stored === official) status = "EXACT";
    else if(normCosmetic(stored) === normCosmetic(official)) status = "COSMETIC";
    else status = "SUBSTANTIVE";
    const i = firstDiff(stored, official);
    rows.push({
      ref: r.ref, status, key,
      storedLen: stored.length, officialLen: official.length,
      at: i,
      storedAt: i < 0 ? "" : around(stored, i, 45),
      officialAt: i < 0 ? "" : around(official, i, 45),
      stored, official,
      hash: textHash(official)
    });
  });
});

const by = s => rows.filter(r=>r.status===s);
console.log("passages compared:", rows.length);
["EXACT","COSMETIC","SUBSTANTIVE","NOT FETCHED"].forEach(s=>
  console.log("  " + s.padEnd(12), by(s).length));

console.log("\n=== COSMETIC (punctuation/whitespace only) ===");
by("COSMETIC").forEach(r=>{
  console.log(`\n${r.ref}   len ${r.storedLen} -> ${r.officialLen}, first diff at ${r.at}`);
  console.log("  stored  : " + r.storedAt);
  console.log("  official: " + r.officialAt);
});

console.log("\n=== SUBSTANTIVE (wording differs) ===");
by("SUBSTANTIVE").forEach(r=>{
  console.log(`\n${r.ref}   len ${r.storedLen} -> ${r.officialLen}, first diff at ${r.at}`);
  console.log("  stored  : " + r.storedAt);
  console.log("  official: " + r.officialAt);
});

fs.writeFileSync("compare-report.json", JSON.stringify(rows, null, 1));
