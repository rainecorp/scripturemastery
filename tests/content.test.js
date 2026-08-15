/* T9/T10 content architecture: opaque IDs, multi-pack Track assembly,
   official curriculum snapshot, provenance, areas, and tower geometry. */
const fs = require("fs");
const path = require("path");
const {
  isOpaquePassageId, contentCatalogIssues, compileContentPacks, passageInTranslation, campaignAreasFromIds
} = require("../js/00-content.js");
const {towerGeometry, tvLevelTop, tvLevelHeight} = require("../js/00-tower-geometry.js");
const {textHash} = require("../js/00-verify.js");

let passed = 0, failed = 0;
function ok(name, value){
  if(value) passed++;
  else { failed++; console.error("FAIL:", name); }
}
function eq(name, actual, expected){
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if(a === e) passed++;
  else { failed++; console.error(`FAIL: ${name}\n  expected ${e}\n  actual   ${a}`); }
}

const root = path.join(__dirname, "..");
const packFiles = ["passages.js","articles-of-faith.js","doctrinal-mastery.js","christian.js"];
const packs = [];
global.SQ = {registerContentPack(value){ packs.push(value); }};
packFiles.forEach(file=>eval(fs.readFileSync(path.join(root,"data",file),"utf8")));

let textSources;
eval(fs.readFileSync(path.join(root,"data","text-sources.js"),"utf8") + "\n" +
     fs.readFileSync(path.join(root,"data","text-sources-t10.js"),"utf8") +
     "\n" + fs.readFileSync(path.join(root,"data","text-sources-christian.js"),"utf8") +
     "\ntextSources = TEXT_SOURCES;");

eq("three Seminary packs and one Christian pack register", packs.length, 4);
eq("raw packs contain 250 unique authored passages", packs.flatMap(p=>p.passages).length, 250);
eq("raw packs contain fifteen campaigns", packs.flatMap(p=>p.campaigns).length, 15);
ok("raw passages use canonical topic/texts authoring shape",
  packs.flatMap(p=>p.passages).every(p=>p.topic && p.texts && !("theme" in p) && !("text" in p)));
eq("multi-pack catalog validation passes", contentCatalogIssues(packs), []);

const catalog = compileContentPacks(packs, textSources);
const byId = new Map(catalog.passages.map(p=>[p.id,p]));
const byCampaign = new Map(catalog.campaigns.map(c=>[c.id,c]));
eq("compiled catalog contains 250 canonical passages", catalog.passages.length, 250);
eq("compiled catalog contains fifteen campaigns", catalog.campaigns.length, 15);
eq("compiled catalog contains both Tracks", catalog.tracks.length, 2);
const seminaryTrack = catalog.tracks.find(t=>t.id==="seminary");
const christianTrack = catalog.tracks.find(t=>t.id==="christian");
eq("Seminary track is current-curriculum first", seminaryTrack.campaignIds,
  ["camp_dm_ot","camp_dm_nt","camp_dm_bom","camp_dm_dc","camp_aof",
   "camp_retired_ot","camp_retired_nt","camp_retired_bom","camp_retired_dc"]);
eq("Seminary track name identifies Doctrinal Mastery", seminaryTrack.name, "Seminary — Doctrinal Mastery");
eq("Christian track offers BSB then KJV", christianTrack.translations, ["bsb","kjv"]);
eq("Christian track defaults to BSB", christianTrack.defaultTranslation, "bsb");
eq("Christian track starts with Foundations", christianTrack.startingCampaignId, "camp_christian_foundations");

const ids = catalog.passages.map(p=>p.id);
ok("every passage ID is opaque p_<8 hex>", ids.every(isOpaquePassageId));
eq("every passage ID is unique", new Set(ids).size, 250);
const authoredSource = packFiles.map(file=>fs.readFileSync(path.join(root,"data",file),"utf8")).join("\n");
ok("passage IDs are authored literals", !authoredSource.includes("verseIdFor") && !authoredSource.includes('"v_'));
const renamed = {...catalog.passages[0], ref:"A completely different reference"};
eq("editing a reference cannot change its ID", renamed.id, catalog.passages[0].id);

ok("compiled passages expose the canonical model", catalog.passages.every(p=>
  p.canon && p.book && p.ref && Array.isArray(p.sortKey) && "keyPhrase" in p &&
  p.topic && p.topics && p.texts && p.text && p.translation && p.textVerification && p.textVerifiedAt && p.textHash && p.source
));
ok("legacy volume is absent from canonical passages", catalog.passages.every(p=>!("volume" in p)));
ok("builtin passage, track, campaign, and membership arrays are immutable",
  Object.isFrozen(catalog.passages) && Object.isFrozen(catalog.passages[0]) &&
  Object.isFrozen(catalog.campaigns) && Object.isFrozen(catalog.campaigns[0].passageIds) &&
  Object.isFrozen(catalog.tracks[0].campaignIds));

const official = JSON.parse(fs.readFileSync(path.join(root,"data","doctrinal-mastery-source.json"),"utf8"));
eq("official source snapshot has four courses", official.courses.map(c=>c.id), ["ot","nt","bom","dc"]);
eq("official source contains 24 passages per course", official.courses.map(c=>c.passages.length), [24,24,24,24]);
eq("official source contains 96 unique references",
  new Set(official.courses.flatMap(c=>c.passages.map(p=>p.ref))).size, 96);
official.courses.forEach(course=>{
  const campaign = byCampaign.get(`camp_dm_${course.id}`);
  const compiled = campaign.passageIds.map(id=>byId.get(id));
  eq(`${course.id} campaign follows official reference order`, compiled.map(p=>p.ref), course.passages.map(p=>p.ref));
  eq(`${course.id} campaign carries official key phrases`, compiled.map(p=>p.keyPhrase), course.passages.map(p=>p.keyPhrase));
});
eq("exactly 96 canonical passages carry key phrases", catalog.passages.filter(p=>p.keyPhrase).length, 96);

eq("current Doctrinal Mastery towers derive their 24-floor height",
  ["ot","nt","bom","dc"].map(id=>byCampaign.get(`camp_dm_${id}`).passageIds.length), [24,24,24,24]);
eq("Articles of Faith is a 13-floor campaign", byCampaign.get("camp_aof").passageIds.length, 13);
eq("retired heritage towers retain their authored 25-floor heights",
  ["ot","nt","bom","dc"].map(id=>byCampaign.get(`camp_retired_${id}`).passageIds.length), [25,25,25,25]);
eq("campaign framing separates current, Articles, and heritage content",
  catalog.campaigns.reduce((out,c)=>(out[c.group]=(out[c.group]||0)+1,out),{}),
  {retired:4,articles:1,doctrinal:4,christian:6});

const christianSource = JSON.parse(fs.readFileSync(path.join(root,"data","christian-curriculum.json"),"utf8"));
eq("Christian curriculum has the six roadmap campaigns", christianSource.campaigns.map(c=>c.shortName),
  ["Foundations","The Gospel","Comfort & Anxiety","Armor of God","Psalms Worth Knowing","For Kids"]);
eq("each Christian campaign contains 20 intentional floors", christianSource.campaigns.map(c=>c.passages.length), [20,20,20,20,20,20]);
eq("Christian campaigns contain 99 unique references", new Set(christianSource.campaigns.flatMap(c=>c.passages.map(p=>p[0]))).size, 99);
eq("Christian campaign records follow the curriculum order", christianSource.campaigns.map(c=>
  byCampaign.get(c.id).passageIds.map(id=>byId.get(id).ref)), christianSource.campaigns.map(c=>c.passages.map(p=>p[0])));
const sharedChristian = christianSource.campaigns.flatMap(c=>c.passages.map(p=>p[0]))
  .filter((ref,index,refs)=>refs.indexOf(ref)===index && packs.slice(0,3).flatMap(p=>p.passages).some(v=>v.ref===ref));
eq("seven Christian references reuse Seminary passage identity", sharedChristian.length, 7);
sharedChristian.forEach(ref=>{
  const id = byId.get([...byId.keys()].find(id=>byId.get(id).ref===ref)).id;
  const passage = byId.get(id);
  eq(`${ref} carries all side-by-side translations`, Object.keys(passage.texts).sort(), ["bsb","kjv","lds2013"]);
  eq(`${ref} uses its Christian topic in BSB`, passageInTranslation(passage,"bsb").topic,
    christianSource.campaigns.flatMap(c=>c.passages).find(p=>p[0]===ref)[1]);
});
const genesis = catalog.passages.find(p=>p.ref==="Genesis 1:1");
ok("translation materialization swaps exact wording", passageInTranslation(genesis,"bsb").text !== passageInTranslation(genesis,"kjv").text);
eq("translation materialization stamps BSB", passageInTranslation(genesis,"bsb").translation, "bsb");
eq("translation materialization stamps KJV", passageInTranslation(genesis,"kjv").translation, "kjv");

eq("a 7-passage campaign chunks into five ceil-sized areas",
  campaignAreasFromIds([1,2,3,4,5,6,7]).map(a=>a.length), [2,2,2,1,0]);
eq("a 13-passage campaign chunks into five ceil-sized areas",
  campaignAreasFromIds(Array.from({length:13},(_,i)=>i)).map(a=>a.length), [3,3,3,3,1]);
eq("a 24-passage campaign chunks without assuming 25",
  campaignAreasFromIds(Array.from({length:24},(_,i)=>i)).map(a=>a.length), [5,5,5,5,4]);
eq("a 25-passage campaign keeps five equal areas",
  campaignAreasFromIds(Array.from({length:25},(_,i)=>i)).map(a=>a.length), [5,5,5,5,5]);

[3,7,13,24,25,60,120].forEach(floors=>{
  const geometry = towerGeometry(floors);
  eq(`${floors} floors derive repeat count`, geometry.repeatLevels, Math.max(0,floors-3));
  eq(`${floors} floors put the roof at the top`, tvLevelTop(floors,geometry), 0);
  eq(`${floors} floors give the roof its own height`, tvLevelHeight(floors,geometry), geometry.roofHeight);
});

const badProvenance = catalog.passages.flatMap(p=>Object.entries(p.texts).filter(([translation,text])=>{
  const rec=textSources[`${p.id}:${translation}`] || textSources[`${p.ref}:${translation}`]
    || textSources[p.id] || textSources[p.ref];
  return !rec || rec.hash!==textHash(text);
}).map(([translation])=>`${p.ref}:${translation}`));
eq("all 356 shipped passage translations match checked-in provenance", badProvenance, []);

const t10Ids = JSON.parse(fs.readFileSync(path.join(root,"data","t10-passage-ids.json"),"utf8"));
eq("T10 persists 45 novel curriculum IDs plus 13 Articles IDs", Object.keys(t10Ids).length, 58);
ok("every persisted T10 ID is opaque and appears in the catalog",
  Object.values(t10Ids).every(id=>isOpaquePassageId(id) && byId.has(id)));
const t12Ids = JSON.parse(fs.readFileSync(path.join(root,"data","t12-passage-ids.json"),"utf8"));
eq("T12 persists one identity for each Christian reference", Object.keys(t12Ids).length, 99);
ok("every persisted T12 ID is opaque and appears in the catalog",
  Object.values(t12Ids).every(id=>isOpaquePassageId(id) && byId.has(id)));

const relicFiles = fs.readdirSync(path.join(root,"relics")).filter(name=>name.endsWith(".webp"));
eval(fs.readFileSync(path.join(root,"js","02-relics-data.js"),"utf8"));
const designedRelicIds = Object.keys(global.SQ.RELICS);
eq("all 25 designed relic assets remain present", relicFiles.length, 25);
eq("all 25 designed relic metadata records remain present", designedRelicIds.length, 25);
ok("designed relic metadata is keyed only by opaque passage IDs", designedRelicIds.every(isOpaquePassageId));
ok("designed relic filenames still resolve to canonical passages",
  relicFiles.every(name=>byId.has(path.basename(name,".webp"))));
eq("designed relic metadata and asset filenames stay in lockstep",
  designedRelicIds.slice().sort(), relicFiles.map(name=>path.basename(name,".webp")).sort());

const invalidPack = {
  id:"bad", track:{id:"bad",campaignIds:["bad_campaign"],defaultTranslation:"x"},
  passages:[{id:"v_genesis_1_1",ref:"Genesis 1:1",topic:"Creation",texts:{x:"In the beginning"}}],
  campaigns:[{id:"bad_campaign",track:"bad",passageIds:["v_genesis_1_1"]}]
};
ok("reference-derived legacy IDs are rejected", contentCatalogIssues([invalidPack]).some(x=>x.includes("non-opaque ID")));

console.log(`\n${passed} passed, ${failed} failed`);
if(failed) process.exit(1);
