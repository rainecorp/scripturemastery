/* 00-verify.js — passage text verification (T4)
   ===========================================================================
   This app asks people to memorize text word for word. That makes a silent
   typo worse here than in almost any other kind of software: a learner will
   faithfully commit our mistake to memory, and the seal ceremony will
   congratulate them for it.

   So every passage carries a verification state, and the app is required to
   say when it does not actually know where a passage came from.

     verified   — the text matches, byte for byte, the text that a named
                  human checked against a named source edition.
     drifted    — someone checked this passage once, and the text has changed
                  since. This is the state that matters most: it means an
                  edit slipped in after review. Loud on purpose.
     unverified — nobody has checked it. The honest default until the sourcing
                  decision in ROADMAP.md §3.4 is made.

   The record of what was checked lives in data/text-sources.js, keyed by
   reference. It is deliberately a separate checked-in file: verification is
   a claim about provenance, and it should be reviewable as a diff on its
   own, not buried in a 500-line data literal.

   WHY A HASH AND NOT A FLAG: a boolean "verified: true" on the passage is
   worth nothing, because the next person to fix a typo leaves the flag
   sitting there. Recording the hash of the exact text that was reviewed
   means any later edit — one character, one curly quote — demotes the
   passage to `drifted` automatically, with no discipline required from
   anybody. The metadata cannot go stale without saying so.
   =========================================================================== */

/* FNV-1a with two accumulators. Not cryptographic and does not need to be —
   this defends against accident, not against an attacker. Prefixed with the
   algorithm so that changing it later invalidates old records loudly rather
   than silently comparing apples to oranges.

   Hashes the text EXACTLY as stored, with no normalization. Curly vs straight
   quotes, an en dash vs an em dash, a double space — all of it is a real
   difference in a verbatim memorization app, and all of it should demote a
   passage to `drifted` rather than pass silently. */
function textHash(text){
  const s = String(text == null ? "" : text);
  let a = 0x811c9dc5, b = 0x01000193;
  for(let i = 0; i < s.length; i++){
    const c = s.charCodeAt(i);
    a ^= c; a = Math.imul(a, 0x01000193) >>> 0;
    b = (b + c) >>> 0; b = Math.imul(b, 0x85ebca6b) >>> 0; b ^= b >>> 13;
  }
  return "fnv1a:" + (a>>>0).toString(16).padStart(8,"0")
                  + (b>>>0).toString(16).padStart(8,"0")
                  + ":" + s.length;
}

/* Computed live from v.text on every call rather than stamped onto the verse
   at build time. state.edits can replace v.text after the catalog is built
   (js/03-state.js), and T11 will let people write their own passages — a
   cached hash would be wrong in exactly the cases we most need it to be
   right. It is a few hundred characters of FNV; the cost is nothing. */
function verificationFor(v){
  const hash = textHash(v && v.text);
  const rec = (typeof TEXT_SOURCES !== "undefined" && v) ? TEXT_SOURCES[v.ref] : null;

  if(!rec){
    return {
      state: "unverified", hash, rec: null,
      label: "Source not verified",
      detail: "No source edition has been recorded for this passage. Check it against a printed edition before trusting it word for word."
    };
  }
  if(rec.hash !== hash){
    return {
      state: "drifted", hash, rec,
      label: "Text changed since it was checked",
      detail: `This passage was verified against ${rec.source} on ${rec.verifiedAt}, but the text has been edited since. It needs re-checking.`
    };
  }
  return {
    state: "verified", hash, rec,
    label: "Verified text",
    detail: `Checked word for word against ${rec.source} on ${rec.verifiedAt}${rec.by ? " by " + rec.by : ""}.`
  };
}

function isVerifiedText(v){ return verificationFor(v).state === "verified"; }

/* Counts across the whole catalog. Used by the audit line and by anyone who
   wants to know how far the sourcing work has actually got. */
function verificationSummary(list){
  const out = {verified:0, drifted:0, unverified:0, total:0};
  (list || (typeof allPassages === "function" ? allPassages() : [])).forEach(v=>{
    out[verificationFor(v).state]++; out.total++;
  });
  return out;
}

/* Regenerating data/text-sources.js by hand is error-prone, so this prints a
   ready-to-paste record for a passage you have just checked. Run it from the
   console: sourceRecordFor(allPassages().find(v=>v.ref==="1 Nephi 3:7"), "Current LDS edition", "your name") */
function sourceRecordFor(v, source, by){
  return `  ${JSON.stringify(v.ref)}: {hash:${JSON.stringify(textHash(v.text))}, `
       + `source:${JSON.stringify(source || "")}, `
       + `verifiedAt:${JSON.stringify(new Date().toISOString().slice(0,10))}`
       + (by ? `, by:${JSON.stringify(by)}` : "") + `},`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { textHash, verificationFor, isVerifiedText, verificationSummary, sourceRecordFor };
}
if (typeof SQ !== "undefined") {
  SQ.textHash = textHash;
  SQ.verificationFor = verificationFor;
  SQ.isVerifiedText = isVerifiedText;
  SQ.verificationSummary = verificationSummary;
  SQ.sourceRecordFor = sourceRecordFor;
}
