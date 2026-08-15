/* 01-catalog.js
   Compiled passage / campaign / track accessors, popular markers, difficulty
   Extracted from the original single-file catalog by T2; rebuilt for T9. */
const CONTENT_CATALOG = compileContentPacks(registeredContentPacks(), TEXT_SOURCES);
const BUILTIN_PASSAGES = CONTENT_CATALOG.passages;
const BUILTIN_CAMPAIGNS = CONTENT_CATALOG.campaigns;
const BUILTIN_TRACKS = CONTENT_CATALOG.tracks;

/* These are the public catalog boundaries. Builtin arrays are frozen and are
   never handed out for mutation; custom content joins through state only. */
function allPassages(){
  const custom = (typeof state !== "undefined" && Array.isArray(state.customPassages))
    ? state.customPassages : [];
  return BUILTIN_PASSAGES.concat(custom);
}
function allCampaigns(){
  /* Collections are the editable source of truth. Campaigns are derived so a
     rename or membership edit cannot leave a second stale copy behind. */
  const custom = (typeof state !== "undefined" && Array.isArray(state.collections))
    ? customCampaignsFromCollections(state.collections) : [];
  return BUILTIN_CAMPAIGNS.concat(custom);
}
function allTracks(){ return BUILTIN_TRACKS.slice(); }
function passageById(id){ return allPassages().find(p=>p.id===id) || null; }
function campaignById(id){ return allCampaigns().find(c=>c.id===id) || null; }
function trackById(id){ return allTracks().find(t=>t.id===id) || null; }
function activeTrack(){
  const id = (typeof state !== "undefined" && state.track) || BUILTIN_TRACKS[0].id;
  return trackById(id) || BUILTIN_TRACKS[0];
}
function activeCampaigns(trackId){
  const track = trackById(trackId || activeTrack().id);
  if(!track) return [];
  const wanted = new Set(track.campaignIds);
  return allCampaigns()
    .filter(c=>(wanted.has(c.id) || (c.source === "user" && c.track === track.id))
      && (c.status === "active" || c.status === "custom"))
    .sort((a,b)=>(a.order||0)-(b.order||0));
}
function campaignPassages(campaignId){
  const c = campaignById(campaignId);
  if(!c) return [];
  return c.passageIds.map(passageById).filter(Boolean);
}
function campaignsForPassage(passageId){
  return activeCampaigns().filter(c=>c.passageIds.includes(passageId));
}
function primaryCampaignForPassage(passageId, preferredCampaignId){
  const choices = campaignsForPassage(passageId);
  return choices.find(c=>c.id===preferredCampaignId) || choices[0] || activeCampaigns()[0] || null;
}
function displayCampaignName(campaignId){
  const c = campaignById(campaignId);
  return c ? c.shortName : "Unknown campaign";
}
function towerArtPrefix(campaign){
  const c = typeof campaign === "string" ? campaignById(campaign) : campaign;
  const kit = c && c.towerArt && c.towerArt.kit ? c.towerArt.kit : "restoration-temple";
  return `temple-towers/${kit}-`;
}

// Hand-picked “popular / often quoted” marker.
// These were chosen from scripture-mastery/doctrinal-mastery lists, missionary-teaching references,
// and commonly cited/favorite Book of Mormon references. It is intentionally a visual hint, not a ranked dataset.
const POPULAR_REFS = new Set([
"Moses 1:39", "Moses 7:18", "Abraham 3:22–23", "Genesis 39:9", "Joshua 1:8–9", "Isaiah 1:18", "Amos 3:7", "Malachi 3:8–10", "Matthew 5:14–16", "Matthew 6:24", "John 3:5", "John 14:15", "John 17:3", "Romans 1:16", "Galatians 5:22–23", "Ephesians 2:19–20", "Articles of Faith 1:13", "1 Nephi 3:7", "1 Nephi 19:23", "2 Nephi 2:25", "2 Nephi 2:27", "2 Nephi 32:3", "Mosiah 2:17", "Mosiah 3:19", "Alma 32:21", "Alma 37:6–7", "Alma 41:10", "Helaman 5:12", "3 Nephi 11:29", "3 Nephi 27:27", "Ether 12:6", "Ether 12:27", "Moroni 7:45", "Moroni 10:4–5", "D&C 1:37–38", "D&C 6:36", "D&C 8:2–3", "D&C 18:10–11", "D&C 18:15–16", "D&C 76:22–24", "D&C 82:10", "D&C 88:124", "D&C 121:34–36", "D&C 121:45–46", "D&C 130:22–23", "D&C 131:1–4", "Joseph Smith—History 1:15–20", "D&C 10:5", "D&C 14:7", "D&C 18:10, 15–16", "D&C 19:16–19", "D&C 25:12", "D&C 58:26–27", "D&C 58:42–43", "D&C 64:9–11", "D&C 64:23", "D&C 76:22–24", "D&C 82:3", "D&C 84:33–39", "D&C 88:123–24", "D&C 89:18–21", "D&C 130:18–19", "D&C 130:20–21", "D&C 137:7–10", "Matthew 25:40", "Luke 24:36–39", "John 10:16", "Acts 7:55–56", "1 Corinthians 10:13", "1 Corinthians 15:29", "2 Timothy 3:16–17", "James 1:5–6", "James 2:17–18", "Revelation 14:6–7", "Revelation 20:12–13", "2 Timothy 3:1–5", "Hebrews 5:4", "Genesis 1:26–27", "Exodus 20:3–17", "Exodus 33:11", "Leviticus 19:18", "Joshua 1:8", "Joshua 24:15", "1 Samuel 16:7", "Job 19:25–26", "Psalm 24:3–4", "Proverbs 3:5–6", "Isaiah 53:3–5", "Isaiah 55:8–9", "Ezekiel 37:15–17", "Daniel 2:44–45", "Malachi 4:5–6"
]);
function isPopularVerse(v){ return POPULAR_REFS.has(v.ref); }

/* wordCount() used to be defined here as trim().split(/\s+/), which counted a
   free-standing em dash as a word and so disagreed with the study screen on 7
   passages. It is now the canonical one in js/00-tokenize.js. */
function difficultyIndexForText(text){
  const words = wordCount(text);
  if(words <= 25) return 0;
  if(words <= 55) return 1;
  if(words <= 90) return 2;
  if(words <= 145) return 3;
  return 4;
}
function difficultyForVerse(v){
  const idx = difficultyIndexForText(v.text);
  return {...DIFFICULTIES[idx], index:idx, words:wordCount(v.text), trim:TIER_TRIMS[idx]};
}
function difficultyLabelForVerse(v){
  const d = difficultyForVerse(v);
  return `<span class="emoji">${d.emoji}</span><span>${d.label} scripture · ${d.words} words</span>`;
}
function stageLabel(stage){
  const d = DIFFICULTIES[stage] || DIFFICULTIES[0];
  return `${d.stage}`;
}

/* ---- SQ registry ---- */
SQ.allPassages = allPassages;
SQ.allCampaigns = allCampaigns;
SQ.allTracks = allTracks;
SQ.passageById = passageById;
SQ.campaignById = campaignById;
SQ.trackById = trackById;
SQ.activeTrack = activeTrack;
SQ.activeCampaigns = activeCampaigns;
SQ.campaignPassages = campaignPassages;
SQ.campaignsForPassage = campaignsForPassage;
SQ.primaryCampaignForPassage = primaryCampaignForPassage;
SQ.displayCampaignName = displayCampaignName;
SQ.towerArtPrefix = towerArtPrefix;
SQ.POPULAR_REFS = POPULAR_REFS;
SQ.isPopularVerse = isPopularVerse;
SQ.difficultyIndexForText = difficultyIndexForText;
SQ.difficultyForVerse = difficultyForVerse;
SQ.difficultyLabelForVerse = difficultyLabelForVerse;
SQ.stageLabel = stageLabel;
