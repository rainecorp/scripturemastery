/* 00-content.js — content contracts and pure catalog assembly (T9)
   ===========================================================================
   Content files register immutable packs here before js/01-catalog.js runs.
   A pack contributes passages, campaigns, metadata for shared passages, and
   optionally a track. Those concepts stay separate in the compiled catalog:
   passages are canonical content, campaigns are ordered towers of passage
   IDs, and tracks are ordered campaign sets that may span several packs.

   Dependency tier 00: pure data functions, no state and no DOM. Node tests can
   require this file directly.
   =========================================================================== */

const CONTENT_PACKS = [];
const OPAQUE_PASSAGE_ID = /^p_[0-9a-f]{8}$/;

function isOpaquePassageId(id){
  return OPAQUE_PASSAGE_ID.test(String(id || ""));
}

function registerContentPack(pack){
  if(!pack || typeof pack !== "object") throw new TypeError("A content pack must be an object.");
  CONTENT_PACKS.push(pack);
  return pack;
}

function registeredContentPacks(){
  return CONTENT_PACKS.slice();
}

function bookFromReference(ref){
  const m = String(ref || "").match(/^(.+?)\s+\d/);
  return m ? m[1] : String(ref || "");
}

const BIBLE_BOOKS = new Set([
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalm","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah",
  "Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
  "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter",
  "1 John","2 John","3 John","Jude","Revelation"
]);

function canonFromReference(ref){
  return BIBLE_BOOKS.has(bookFromReference(ref)) ? "bible" : "restoration";
}

function contentCatalogIssues(packs){
  const issues = [];
  const passageIds = new Set();
  const campaignIds = new Set();
  const trackIds = new Set();
  const campaignTrack = new Map();

  (packs || []).forEach((pack, packIndex)=>{
    const label = pack && pack.id ? pack.id : `pack ${packIndex + 1}`;
    const passages = pack && Array.isArray(pack.passages) ? pack.passages : [];
    const campaigns = pack && Array.isArray(pack.campaigns) ? pack.campaigns : [];
    const track = pack && pack.track;

    if(!passages.length) issues.push(`${label} has no passages`);
    passages.forEach((p, i)=>{
      if(!isOpaquePassageId(p && p.id)) issues.push(`${label} passage ${i + 1} has a non-opaque ID`);
      else if(passageIds.has(p.id)) issues.push(`duplicate passage ID ${p.id}`);
      else passageIds.add(p.id);
      if(!p || !p.ref || !p.topic || !p.texts || typeof p.texts !== "object"){
        issues.push(`${label} passage ${p && p.id ? p.id : i + 1} is incomplete`);
      }
    });

    campaigns.forEach((c, i)=>{
      if(!c || !c.id) issues.push(`${label} campaign ${i + 1} has no ID`);
      else if(campaignIds.has(c.id)) issues.push(`duplicate campaign ID ${c.id}`);
      else {
        campaignIds.add(c.id);
        campaignTrack.set(c.id, c.track);
      }
      if(!c || !Array.isArray(c.passageIds) || !c.passageIds.length){
        issues.push(`${label} campaign ${c && c.id ? c.id : i + 1} has no passages`);
      } else if(new Set(c.passageIds).size !== c.passageIds.length){
        issues.push(`${c.id} repeats a passage ID`);
      }
    });

    if(track){
      if(!track.id) issues.push(`${label} has a track with no ID`);
      else if(trackIds.has(track.id)) issues.push(`duplicate track ID ${track.id}`);
      else trackIds.add(track.id);
    }
  });

  if(!trackIds.size) issues.push("catalog has no tracks");

  (packs || []).forEach(pack=>{
    (pack.campaigns || []).forEach(c=>{
      (c.passageIds || []).forEach(id=>{
        if(!passageIds.has(id)) issues.push(`${c.id} references missing passage ${id}`);
      });
      if(c.track && !trackIds.has(c.track)) issues.push(`${c.id} references missing track ${c.track}`);
    });
    const track = pack.track || {};
    (track.campaignIds || []).forEach(id=>{
      if(!campaignIds.has(id)) issues.push(`${track.id || "track"} references missing campaign ${id}`);
      else if(campaignTrack.get(id) !== track.id) issues.push(`${id} belongs to ${campaignTrack.get(id)}, not ${track.id}`);
    });
    Object.keys(pack.passageMeta || {}).forEach(id=>{
      if(!passageIds.has(id)) issues.push(`${pack.id || "content pack"} metadata references missing passage ${id}`);
    });
  });
  return issues;
}

function compileContentPacks(packs, verificationRecords){
  const issues = contentCatalogIssues(packs);
  if(issues.length) throw new Error("Invalid content catalog:\n- " + issues.join("\n- "));

  const rawCampaigns = packs.flatMap(pack=>pack.campaigns || []);
  const rawTracks = packs.map(pack=>pack.track).filter(Boolean);
  const passageMeta = new Map();
  packs.forEach(pack=>Object.entries(pack.passageMeta || {}).forEach(([id, meta])=>{
    passageMeta.set(id, {...(passageMeta.get(id) || {}), ...meta});
  }));
  const placement = new Map();
  rawCampaigns.slice().sort((a,b)=>(a.order||0)-(b.order||0)).forEach(c=>{
    c.passageIds.forEach((id, index)=>{
      if(!placement.has(id)) placement.set(id, {campaignOrder:c.order||0, index});
    });
  });

  const passageTrack = new Map();
  rawCampaigns.forEach(c=>c.passageIds.forEach(id=>{
    if(!passageTrack.has(id)) passageTrack.set(id, c.track);
  }));
  const trackById = new Map(rawTracks.map(t=>[t.id, t]));
  const seenPassages = new Set();
  const passages = [];

  packs.forEach(pack=>(pack.passages || []).forEach(raw=>{
    if(seenPassages.has(raw.id)) return;
    seenPassages.add(raw.id);
    const track = trackById.get(passageTrack.get(raw.id)) || pack.track;
    const translation = raw.translation || (track && track.defaultTranslation)
      || pack.defaultTranslation || "lds2013";
    const meta = passageMeta.get(raw.id) || {};
    const texts = Object.freeze({...raw.texts, ...(meta.texts || {})});
    const text = texts[translation] || Object.values(texts)[0] || "";
    const textVerification = {};
    Object.keys(texts).forEach(key=>{
      const rec = (verificationRecords || {})[`${raw.id}:${key}`]
        || (verificationRecords || {})[`${raw.ref}:${key}`]
        || (key === translation
          ? ((verificationRecords || {})[raw.id] || (verificationRecords || {})[raw.ref])
          : null);
      if(rec) textVerification[key] = Object.freeze({...rec});
    });
    const rec = textVerification[translation] || null;
    const pos = placement.get(raw.id) || {campaignOrder:0, index:passages.length};
    const topics = Object.freeze({...raw.topics, ...(meta.topics || {})});
    passages.push(Object.freeze({
      id: raw.id,
      canon: raw.canon || canonFromReference(raw.ref),
      book: raw.book || bookFromReference(raw.ref),
      ref: raw.ref,
      sortKey: Object.freeze((raw.sortKey || [pos.campaignOrder, pos.index, 0, 0]).slice()),
      keyPhrase: meta.keyPhrase || raw.keyPhrase || null,
      topic: meta.topic || raw.topic,
      topics,
      texts,
      text,
      translation,
      textVerification: Object.freeze(textVerification),
      textVerifiedAt: rec ? rec.verifiedAt : null,
      textHash: rec ? rec.hash : null,
      source: raw.source || "builtin"
    }));
  }));
  passages.sort((a,b)=>{
    const n = Math.max(a.sortKey.length, b.sortKey.length);
    for(let i=0;i<n;i++){
      const d = (a.sortKey[i] || 0) - (b.sortKey[i] || 0);
      if(d) return d;
    }
    return a.id.localeCompare(b.id);
  });

  const campaigns = rawCampaigns.map(raw=>Object.freeze({
    ...raw,
    passageIds: Object.freeze(raw.passageIds.slice()),
    towerArt: Object.freeze({...raw.towerArt})
  }));
  const tracks = rawTracks.map(raw=>Object.freeze({
    ...raw,
    campaignIds: Object.freeze(raw.campaignIds.slice()),
    extraPacks: Object.freeze((raw.extraPacks || []).slice())
  }));

  return Object.freeze({
    passages: Object.freeze(passages),
    campaigns: Object.freeze(campaigns),
    tracks: Object.freeze(tracks)
  });
}

/* ===========================================================================
   TRANSLATION REGISTRY (Slice 2 of CLAUDE-CODE-HANDOFF.md)
   ===========================================================================
   Translations used to be bare strings — "bsb", "kjv", "lds2013" — with the
   knowledge about them scattered across the code that consumed them: a label
   map hardcoded in a UI file, and two `["bsb","kjv"].includes(key)` tests
   inside passageInTranslation() below. That meant adding a translation was a
   code change in several files, and forgetting one of them failed silently
   and wrongly rather than loudly.

   This registry is the one place a translation is described. Adding one is a
   data change in data/translations.js and nothing else. There is a test that
   proves that claim by adding a fourth translation at runtime and asserting
   the code picks it up untouched — if a future change reintroduces a
   hardcoded translation id anywhere, that test is what should catch it.

   Why the rights fields are shaped this way: the handoff asks for
   is_public_domain, requires_entitlement and licensor. A bare boolean for
   "public domain" would record the conclusion and throw away the reasoning,
   and this codebase already rejects that pattern once — data/text-sources.js
   stores *why* a passage's text is trusted, not merely that it is, on the
   stated grounds that an entry added on faith is worse than no entry. Same
   principle here: `rightsBasis` says why we believe we can ship the text, and
   `counselReviewed` records whether a lawyer has actually agreed, which is
   still open (ROADMAP.md §10 decision 4) and must not be quietly laundered
   into a `true` that later code trusts.
   =========================================================================== */
const TRANSLATIONS = [];
const TRANSLATION_ID = /^[a-z][a-z0-9]{1,15}$/;

function registerTranslation(raw){
  if(!raw || typeof raw !== "object") throw new TypeError("A translation must be an object.");
  if(!raw.id) throw new TypeError("A translation must have an id.");
  const t = Object.freeze({
    id: String(raw.id),
    label: String(raw.label || raw.id),
    short: String(raw.short || String(raw.id).toUpperCase()),
    /* Rights. */
    isPublicDomain: raw.isPublicDomain === true,
    rightsBasis: String(raw.rightsBasis || ""),
    counselReviewed: raw.counselReviewed === true,
    licensor: raw.licensor || null,
    attribution: raw.attribution || null,
    /* Entitlement. Declared now, enforced when the paywall ships — see
       ROADMAP.md §5.2, which puts "all translations" behind Quest+. Setting
       this true today would gate something that is free today. */
    requiresEntitlement: raw.requiresEntitlement === true,
    /* Content behaviour, replacing the old hardcoded id checks. */
    usesChristianTopics: raw.usesChristianTopics === true,
    hasAuthoredKeyPhrases: raw.hasAuthoredKeyPhrases === true
  });
  TRANSLATIONS.push(t);
  return t;
}

function registeredTranslations(){ return TRANSLATIONS.slice(); }

function translationById(id, list){
  const all = Array.isArray(list) ? list : TRANSLATIONS;
  return all.find(t=>t.id === id) || null;
}

/* The short display name. Falls back to the uppercased id so an unregistered
   translation renders as something readable rather than blank. */
function translationLabel(id, list){
  const t = translationById(id, list);
  return t ? t.short : String(id || "").toUpperCase();
}

/* Same shape and spirit as contentCatalogIssues(): returns a list of human
   sentences, empty when the registry is sound. */
function translationIssues(list){
  const all = Array.isArray(list) ? list : TRANSLATIONS;
  const issues = [];
  const seen = new Set();
  all.forEach((t, i)=>{
    const label = t && t.id ? t.id : `translation ${i + 1}`;
    if(!t || !t.id){ issues.push(`${label} has no id.`); return; }
    if(!TRANSLATION_ID.test(t.id)) issues.push(`${label} is not a valid translation id (lowercase letters and digits, 2-16 characters).`);
    if(seen.has(t.id)) issues.push(`${label} is registered more than once.`);
    seen.add(t.id);
    if(!t.label) issues.push(`${label} has no label.`);
    if(!t.isPublicDomain && !t.licensor) issues.push(`${label} is not public domain and names no licensor.`);
    if(t.isPublicDomain && !t.rightsBasis) issues.push(`${label} claims public domain without stating the basis.`);
  });
  return issues;
}

function passageInTranslation(passage, translation){
  if(!passage || passage.source === "user" || !passage.texts) return passage;
  const key = passage.texts[translation] ? translation : passage.translation;
  if(!key || passage.translation === key) return passage;
  const rec = (passage.textVerification || {})[key] || null;
  /* An unregistered translation keeps the passage's own topic and key phrase,
     which is exactly what the old ["bsb","kjv"] tests did for any id outside
     that pair. Registration changes behaviour; absence of it never does. */
  const meta = translationById(key);
  const christianTopics = !!(meta && meta.usesChristianTopics);
  const keepKeyPhrase = !meta || meta.hasAuthoredKeyPhrases;
  return Object.freeze({
    ...passage,
    text: passage.texts[key],
    topic: christianTopics && passage.topics && passage.topics.christian
      ? passage.topics.christian : passage.topic,
    keyPhrase: keepKeyPhrase ? passage.keyPhrase : null,
    translation: key,
    textVerifiedAt: rec ? rec.verifiedAt : null,
    textHash: rec ? rec.hash : null
  });
}

/* Always returns five areas. For a non-multiple of five, earlier areas fill
   first and the final area may be shorter (or empty for a tiny campaign). */
function campaignAreasFromIds(passageIds){
  const ids = Array.isArray(passageIds) ? passageIds : [];
  const areaSize = Math.max(1, Math.ceil(ids.length / 5));
  return Array.from({length:5}, (_, i)=>ids.slice(i * areaSize, (i + 1) * areaSize));
}

if(typeof module !== "undefined" && module.exports){
  module.exports = {
    isOpaquePassageId, registerContentPack, registeredContentPacks,
    bookFromReference, canonFromReference, contentCatalogIssues,
    compileContentPacks, passageInTranslation, campaignAreasFromIds,
    registerTranslation, registeredTranslations, translationById,
    translationLabel, translationIssues
  };
}

if(typeof SQ !== "undefined"){
  SQ.isOpaquePassageId = isOpaquePassageId;
  SQ.registerContentPack = registerContentPack;
  SQ.registeredContentPacks = registeredContentPacks;
  SQ.bookFromReference = bookFromReference;
  SQ.canonFromReference = canonFromReference;
  SQ.contentCatalogIssues = contentCatalogIssues;
  SQ.compileContentPacks = compileContentPacks;
  SQ.passageInTranslation = passageInTranslation;
  SQ.campaignAreasFromIds = campaignAreasFromIds;
  SQ.registerTranslation = registerTranslation;
  SQ.registeredTranslations = registeredTranslations;
  SQ.translationById = translationById;
  SQ.translationLabel = translationLabel;
  SQ.translationIssues = translationIssues;
}
