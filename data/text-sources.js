/* text-sources.js — the provenance record (T4)
   ===========================================================================
   One entry per passage that a human has actually checked against a printed
   or authoritative digital edition, keyed by reference exactly as it appears
   in data/passages.js.

   Format:

     "1 Nephi 3:7": {
       hash:       "fnv1a:…",       // textHash() of the text that was checked
       source:     "1920 Book of Mormon",
       verifiedAt: "2026-08-11",    // ISO date the check happened
       by:         "name"           // optional, but do fill it in
     },

   Get the hash line for a passage you have just checked by running this in
   the browser console:

     copy(sourceRecordFor(VERSES.find(v=>v.ref === "1 Nephi 3:7"),
                          "1920 Book of Mormon", "your name"))

   RULES:
     - Add an entry only after reading the passage against the source, word
       for word, including punctuation. This file is a claim that a person
       did that. An entry added on faith is worse than no entry, because the
       app stops warning about it.
     - Never edit a hash to make a warning go away. If the text changed, the
       passage needs re-checking; that is the entire point of the mechanism.
     - Re-verifying? Replace hash, verifiedAt and by together.

   CURRENT STATE: empty. All 100 seed passages render as `unverified`, which
   is the truth — they were assembled from mixed sources during prototyping
   and none has been checked against an edition. Filling this in is the open
   half of T4 and depends on the sourcing decision in ROADMAP.md §3.4
   (1920/1921 public-domain editions vs. seeking permission for the current
   text).
   =========================================================================== */
const TEXT_SOURCES = {
};

/* ---- SQ registry ---- */
SQ.TEXT_SOURCES = TEXT_SOURCES;
