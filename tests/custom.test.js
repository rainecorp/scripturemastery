/* T11 custom content, safety boundary, limits, IDs, and tall-tower planning. */
const {
  escHTML,safePassageHTML,safeCampaignHTML,TRUSTED_MARKUP_HELPERS
} = require("../js/00-html.js");
const {
  CUSTOM_FREE_PASSAGE_LIMIT,newCustomId,validateCustomPassageInput,makeCustomPassage,editCustomPassage,
  makeCustomCollection,customCampaignsFromCollections,canCreateCustomPassage,canCreateCustomCollection,
  towerRenderPlan,physicalTowerLevel,validateCustomContentPayload
} = require("../js/00-custom.js");

let passed=0,failed=0;
function eq(name,actual,expected){
  const a=JSON.stringify(actual),e=JSON.stringify(expected);
  if(a===e) passed++; else{failed++;console.error(`FAIL: ${name}\n  expected ${e}\n  actual   ${a}`);}
}
function ok(name,value){eq(name,!!value,true);}

const attack='<img src=x onerror=alert(1)> "quoted" & ready';
eq("plain-text boundary escapes active markup",escHTML(attack),'&lt;img src=x onerror=alert(1)&gt; &quot;quoted&quot; &amp; ready');
const safeP=safePassageHTML({id:"p_12345678",ref:attack,topic:attack,book:attack,keyPhrase:attack,text:attack});
ok("every display passage field is escaped",Object.values(safeP).every(v=>!v.includes("<img")));
const safeC=safeCampaignHTML({id:"camp_custom_12345678",name:attack,shortName:attack,subtitle:attack,tag:attack,icon:attack});
ok("every display campaign field is escaped",Object.values(safeC).every(v=>!v.includes("<img")));
eq("intentional markup helpers are explicitly allowlisted",TRUSTED_MARKUP_HELPERS.length,8);

const input={ref:"  Family Promise 1  ",topic:"  Hope   at home ",text:`Line one\r\n${attack}`};
const checked=validateCustomPassageInput(input);
eq("valid input preserves passage line breaks and active-looking text",checked.value,{ref:"Family Promise 1",topic:"Hope at home",text:`Line one\n${attack}`});
ok("the XSS regression payload is valid plain content",checked.ok);
ok("missing custom fields fail validation",!validateCustomPassageInput({ref:"",topic:"",text:""}).ok);

const id=newCustomId("passage",[],()=>0x12345678/0x100000000);
eq("passage IDs are opaque and generated once",id,"p_12345678");
const passage=makeCustomPassage(input,id,1000);
eq("custom passage stores raw text for memorization",passage.text,`Line one\n${attack}`);
eq("custom passage is marked user-authored",passage.source,"user");
const edited=editCustomPassage(passage,{ref:"Renamed 2",topic:"New cue",text:"New text"},2000);
eq("editing a reference preserves passage identity",edited.id,passage.id);
eq("editing preserves creation time and updates edit time",[edited.createdAt,edited.updatedAt],[1000,2000]);

const collection=makeCustomCollection("  Family Tower  ",{collectionId:"col_abcdef12",campaignId:"camp_custom_1234abcd"},3000);
collection.passageIds.push(id);
const campaigns=customCampaignsFromCollections([collection]);
eq("one collection derives one custom tower",campaigns.length,1);
eq("derived tower carries the collection membership",campaigns[0].passageIds,[id]);
eq("derived tower uses fixed safe presentation metadata",[campaigns[0].group,campaigns[0].status,campaigns[0].towerArt.kit],["custom","custom","restoration-temple"]);

ok("free passage one through ten can be created",canCreateCustomPassage(CUSTOM_FREE_PASSAGE_LIMIT-1,{tier:"free"}));
ok("free passage eleven is blocked",!canCreateCustomPassage(CUSTOM_FREE_PASSAGE_LIMIT,{tier:"free"}));
ok("non-free future entitlement is not capped",canCreateCustomPassage(999,{tier:"quest-plus"}));
ok("free tier permits exactly one collection",canCreateCustomCollection(0,{tier:"free"})&&!canCreateCustomCollection(1,{tier:"free"}));

eq("7-floor tower details all seven floors",towerRenderPlan(7),{
  logicalFloors:7,renderedFloors:7,compressed:false,compressedCount:0,detailedLevels:[1,2,3,4,5,6,7]
});
eq("60-floor tower remains fully navigable",towerRenderPlan(60).detailedLevels.length,60);
const tall=towerRenderPlan(145);
eq("very tall tower caps its rendered height",[tall.logicalFloors,tall.renderedFloors,tall.compressedCount],[145,120,120]);
eq("very tall tower details its top 25 logical floors",[tall.detailedLevels.length,tall.detailedLevels[0],tall.detailedLevels[24]],[25,121,145]);
eq("top logical floor maps to capped physical roof",physicalTowerLevel(145,tall),120);
eq("first detailed logical floor maps 24 levels below roof",physicalTowerLevel(121,tall),96);

const payload={customPassages:[passage],collections:[collection]};
ok("import accepts inert XSS regression payload as plain text",validateCustomContentPayload(payload).ok);
ok("import rejects a collection pointing at an unknown passage",!validateCustomContentPayload({customPassages:[passage],collections:[{...collection,passageIds:["p_deadbeef"]}]}).ok);
ok("import rejects duplicate passage IDs",!validateCustomContentPayload({customPassages:[passage,passage],collections:[]}).ok);
ok("import rejects a custom ID colliding with built-in content",!validateCustomContentPayload(payload,{passageIds:[passage.id]}).ok);
ok("import rejects duplicate membership within one collection",!validateCustomContentPayload({customPassages:[passage],collections:[{...collection,passageIds:[passage.id,passage.id]}]}).ok);

console.log(`\n${passed} passed, ${failed} failed`);
if(failed) process.exit(1);
