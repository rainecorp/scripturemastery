/* translations.js — the translation registry (Slice 2)
   ===========================================================================
   Every translation the app knows about is described here and nowhere else.
   Adding one is a change to this file only: no renderer, no content pack, and
   no engine contains a translation id. `tests/content.test.js` proves that by
   registering a fourth translation at runtime and asserting the code picks it
   up with no other change — if that test ever fails, someone has hardcoded an
   id somewhere and the abstraction has quietly stopped being real.

   The fields are defined in js/00-content.js (registerTranslation). The two
   that are easy to get wrong:

     usesChristianTopics    — the passage carries `topics.christian`, a
                              separate topic authored for the Christian track.
     hasAuthoredKeyPhrases  — key phrases (T10) were written against this
                              translation's exact wording. False means the
                              passage renders without one rather than with a
                              phrase that doesn't match the text on screen.

   ON RIGHTS: `isPublicDomain` is a claim, and `rightsBasis` is why we believe
   it. `counselReviewed` says whether a lawyer has actually agreed, and it is
   `false` on every entry below because that review has not happened yet —
   ROADMAP.md §10 decision 4 tracks it as required before a *paid* launch, and
   the paid launch is now real work (see docs/INVENTORY.md). Do not flip any
   of these to true to make a warning go away; the flag exists precisely so
   that the difference between "we think" and "we checked" survives contact
   with a future reader.
   =========================================================================== */
SQ.registerTranslation({
  id: "lds2013",
  label: "Latter-day Saint edition (2013)",
  short: "LDS",
  isPublicDomain: true,
  rightsBasis:
    "Scripture text only. The underlying text of the standard works is public " +
    "domain; the modern published edition's apparatus — footnotes, chapter " +
    "headings, study aids, versification notes — is not, and none of it is " +
    "reproduced here. Owner confirmed use of current-edition wording " +
    "(ROADMAP.md §10 decision 2, resolved 2026-08-11).",
  counselReviewed: false,
  licensor: null,
  attribution: null,
  requiresEntitlement: false,
  usesChristianTopics: false,
  hasAuthoredKeyPhrases: true
});

SQ.registerTranslation({
  id: "kjv",
  label: "King James Version",
  short: "KJV",
  isPublicDomain: true,
  rightsBasis:
    "Published 1611; public domain in the United States. Note the one real " +
    "wrinkle: in the United Kingdom the Crown holds a perpetual letters " +
    "patent in the KJV, which constrains printing and distribution there but " +
    "not in the US or Canada — the only launch geographies today.",
  counselReviewed: false,
  licensor: null,
  attribution: null,
  requiresEntitlement: false,
  usesChristianTopics: true,
  hasAuthoredKeyPhrases: false
});

SQ.registerTranslation({
  id: "bsb",
  label: "Berean Standard Bible",
  short: "BSB",
  isPublicDomain: true,
  rightsBasis:
    "Dedicated to the public domain by its publisher, which asks (but does " +
    "not require) that the translation be credited where it is quoted.",
  counselReviewed: false,
  licensor: null,
  attribution: "Berean Standard Bible",
  requiresEntitlement: false,
  usesChristianTopics: true,
  hasAuthoredKeyPhrases: false
});

/* A licensed translation looks like this. ESV is expected later and is
   licensed per-use or per-seat depending on the agreement — handoff §8 open
   item 2 — so the shape is recorded now, while it costs nothing, rather than
   discovered under deadline:

   SQ.registerTranslation({
     id: "esv",
     label: "English Standard Version",
     short: "ESV",
     isPublicDomain: false,
     rightsBasis: "Licensed. See the executed agreement, not this file.",
     counselReviewed: true,
     licensor: "Crossway",
     attribution: "Scripture quotations are from the ESV® Bible…",
     requiresEntitlement: true,      // paid tier only, per the agreement
     usesChristianTopics: true,
     hasAuthoredKeyPhrases: false
   });

   Note what the registry refuses: translationIssues() rejects any entry that
   is not public domain and names no licensor, so a licensed translation
   cannot be added without recording who licensed it. */
