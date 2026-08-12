/* T9 content architecture: opaque IDs, Campaign/Track contracts, scalable areas
   and tower geometry. Run directly: node tests/content.test.js */
const fs = require("fs");
const path = require("path");
const {
  isOpaquePassageId, contentCatalogIssues, compileContentPacks,
  campaignAreasFromIds
} = require("../js/00-content.js");
const {towerGeometry, tvLevelTop, tvLevelHeight} = require("../js/00-tower-geometry.js");

let passed = 0, failed = 0;
function ok(name, value){
  if(value){ passed++; }
  else { failed++; console.error("FAIL:", name); }
}
function eq(name, actual, expected){
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if(a === e){ passed++; }
  else { failed++; console.error(`FAIL: ${name}\n  expected ${e}\n  actual   ${a}`); }
}

const sourcePath = path.join(__dirname, "..", "data", "passages.js");
const source = fs.readFileSync(sourcePath, "utf8");
let pack = null;
global.SQ = {registerContentPack(value){ pack = value; }};
eval(source);

ok("Seminary data registers one content pack", !!pack);
eq("raw pack contains 100 passages", pack.passages.length, 100);
eq("raw pack contains four campaigns", pack.campaigns.length, 4);
ok("raw passages use the canonical topic/texts authoring shape",
  pack.passages.every(p=>p.topic && p.texts && !("theme" in p) && !("text" in p)));
eq("catalog validation passes", contentCatalogIssues([pack]), []);

const catalog = compileContentPacks([pack], {});
eq("compiled catalog contains 100 passages", catalog.passages.length, 100);
eq("compiled catalog contains four campaigns", catalog.campaigns.length, 4);
eq("compiled catalog contains one track", catalog.tracks.length, 1);
eq("track campaign order is explicit", catalog.tracks[0].campaignIds,
  ["camp_retired_bom","camp_retired_nt","camp_retired_dc","camp_retired_ot"]);

const ids = catalog.passages.map(p=>p.id);
ok("every passage ID is opaque p_<8 hex>", ids.every(isOpaquePassageId));
eq("every passage ID is unique", new Set(ids).size, 100);
ok("passage IDs are authored literals", !source.includes("verseIdFor") && !source.includes('"v_'));
const renamed = {...catalog.passages[0], ref:"A completely different reference"};
eq("editing a reference cannot change its ID", renamed.id, catalog.passages[0].id);

ok("compiled passages expose the canonical model", catalog.passages.every(p=>
  p.canon && p.book && p.ref && Array.isArray(p.sortKey) && "keyPhrase" in p &&
  p.topic && p.texts && p.text && "textVerifiedAt" in p && "textHash" in p && p.source
));
ok("legacy volume is absent from canonical passages", catalog.passages.every(p=>!("volume" in p)));
ok("builtin passages and campaign membership are immutable",
  Object.isFrozen(catalog.passages) && Object.isFrozen(catalog.passages[0]) &&
  Object.isFrozen(catalog.campaigns[0].passageIds));
eq("each current campaign has its authored height", catalog.campaigns.map(c=>c.passageIds.length), [25,25,25,25]);

eq("a 7-passage campaign chunks into five ceil-sized areas",
  campaignAreasFromIds([1,2,3,4,5,6,7]).map(a=>a.length), [2,2,2,1,0]);
eq("a 13-passage campaign chunks into five ceil-sized areas",
  campaignAreasFromIds(Array.from({length:13},(_,i)=>i)).map(a=>a.length), [3,3,3,3,1]);
eq("a 25-passage campaign keeps five equal areas",
  campaignAreasFromIds(Array.from({length:25},(_,i)=>i)).map(a=>a.length), [5,5,5,5,5]);

[3,7,25,60,120].forEach(floors=>{
  const g = towerGeometry(floors);
  eq(`${floors} floors derive repeat count`, g.repeatLevels, Math.max(0, floors-3));
  eq(`${floors} floors put the roof at the top`, tvLevelTop(floors, g), 0);
  eq(`${floors} floors give the roof its own height`, tvLevelHeight(floors, g), g.roofHeight);
});

const relicFiles = fs.readdirSync(path.join(__dirname, "..", "relics"))
  .filter(name=>name.endsWith(".webp"));
eval(fs.readFileSync(path.join(__dirname, "..", "js", "02-relics-data.js"), "utf8"));
const designedRelicIds = Object.keys(global.SQ.RELICS);
eq("all 25 designed relic assets remain present", relicFiles.length, 25);
eq("all 25 designed relic metadata records remain present", designedRelicIds.length, 25);
ok("designed relic metadata is keyed only by opaque passage IDs",
  designedRelicIds.every(isOpaquePassageId));
ok("designed relic filenames use stable passage IDs",
  relicFiles.every(name=>ids.includes(path.basename(name, ".webp"))));
eq("designed relic metadata and asset filenames stay in lockstep",
  designedRelicIds.slice().sort(), relicFiles.map(name=>path.basename(name, ".webp")).sort());

const invalidPack = {
  id:"bad", track:{id:"bad", campaignIds:["bad_campaign"], defaultTranslation:"x"},
  passages:[{id:"v_genesis_1_1", ref:"Genesis 1:1", topic:"Creation", texts:{x:"In the beginning"}}],
  campaigns:[{id:"bad_campaign", track:"bad", passageIds:["v_genesis_1_1"]}]
};
ok("reference-derived legacy IDs are rejected", contentCatalogIssues([invalidPack]).some(x=>x.includes("non-opaque ID")));

console.log(`\n${passed} passed, ${failed} failed`);
if(failed) process.exit(1);
