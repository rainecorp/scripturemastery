/* 00-custom.js — pure custom-passage and collection contracts (T11)
   No state and no DOM. UI mutations live in js/24-custom.js. */
const CUSTOM_FREE_PASSAGE_LIMIT = 10;
const CUSTOM_FREE_COLLECTION_LIMIT = 1;
const CUSTOM_MAX_IMPORT_PASSAGES = 500;
const CUSTOM_MAX_IMPORT_COLLECTIONS = 50;
const CUSTOM_PASSAGE_ID = /^p_[0-9a-f]{8}$/;
const CUSTOM_COLLECTION_ID = /^col_[0-9a-f]{8}$/;
const CUSTOM_CAMPAIGN_ID = /^camp_custom_[0-9a-f]{8}$/;

function customRandomHex(randomFn){
  if(!randomFn && typeof crypto !== "undefined" && crypto.getRandomValues){
    const bytes = new Uint8Array(4); crypto.getRandomValues(bytes);
    return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
  }
  const random = randomFn || Math.random;
  return Math.floor(random()*0x100000000).toString(16).padStart(8,"0").slice(-8);
}
function newCustomId(kind, existingIds, randomFn){
  const prefix = kind === "passage" ? "p_" : (kind === "collection" ? "col_" : "camp_custom_");
  const used = new Set(existingIds || []);
  for(let tries=0; tries<1000; tries++){
    const id = prefix + customRandomHex(randomFn);
    if(!used.has(id)) return id;
  }
  throw new Error("Could not create a unique custom-content ID.");
}
function compactPlain(value){ return String(value == null ? "" : value).trim().replace(/\s+/g," "); }
function preservePlain(value){ return String(value == null ? "" : value).replace(/\r\n?/g,"\n").trim(); }

function validateCustomPassageInput(input){
  const value = {
    ref:compactPlain(input && input.ref),
    topic:compactPlain(input && input.topic),
    text:preservePlain(input && input.text)
  };
  const errors = {};
  if(!value.ref) errors.ref = "Add a reference or title.";
  else if(value.ref.length > 120) errors.ref = "Keep the reference under 120 characters.";
  if(!value.topic) errors.topic = "Add a short theme or memory cue.";
  else if(value.topic.length > 180) errors.topic = "Keep the theme under 180 characters.";
  if(!value.text) errors.text = "Add the passage text you want to memorize.";
  else if(value.text.length > 10000) errors.text = "Keep one passage under 10,000 characters.";
  return {ok:Object.keys(errors).length===0, errors, value};
}
function customBookFromRef(ref){
  const m = String(ref || "").match(/^(.+?)\s+\d/);
  return m ? m[1] : "Personal";
}
function makeCustomPassage(input, id, now){
  const checked = validateCustomPassageInput(input);
  if(!checked.ok) throw new Error("Invalid custom passage: " + Object.values(checked.errors).join(" "));
  if(!CUSTOM_PASSAGE_ID.test(id)) throw new Error("Custom passages require an opaque p_<8 hex> ID.");
  const at = Number(now) || Date.now();
  return {
    id, canon:"custom", book:customBookFromRef(checked.value.ref), ref:checked.value.ref,
    sortKey:[90,at,0,0], keyPhrase:null, topic:checked.value.topic,
    texts:{custom:checked.value.text}, text:checked.value.text,
    translation:"custom", textVerifiedAt:null, textHash:null, source:"user",
    createdAt:at, updatedAt:at
  };
}
function editCustomPassage(existing, input, now){
  const next = makeCustomPassage(input, existing.id, existing.createdAt || now);
  next.sortKey = Array.isArray(existing.sortKey) ? existing.sortKey.slice() : next.sortKey;
  next.createdAt = existing.createdAt || next.createdAt;
  next.updatedAt = Number(now) || Date.now();
  return next;
}
function validateCustomCollectionName(name){
  const value = compactPlain(name);
  if(!value) return {ok:false,error:"Give your tower a name.",value};
  if(value.length>80) return {ok:false,error:"Keep the tower name under 80 characters.",value};
  return {ok:true,error:null,value};
}
function makeCustomCollection(name, ids, now){
  const checked = validateCustomCollectionName(name);
  if(!checked.ok) throw new Error(checked.error);
  if(!CUSTOM_COLLECTION_ID.test(ids.collectionId) || !CUSTOM_CAMPAIGN_ID.test(ids.campaignId)){
    throw new Error("Custom collections require stable opaque IDs.");
  }
  return {id:ids.collectionId,campaignId:ids.campaignId,name:checked.value,passageIds:[],source:"user",createdAt:Number(now)||Date.now()};
}
function customCampaignFromCollection(collection, index){
  return {
    id:collection.campaignId, collectionId:collection.id, track:"seminary",
    name:collection.name, shortName:collection.name, subtitle:"Personal Scripture Tower",
    passageIds:Array.from(new Set(collection.passageIds || [])),
    towerArt:{kit:"restoration-temple",baseWidth:585},
    hue:"#c084fc",soft:"rgba(192,132,252,.22)",icon:"🛠️",
    tag:"A personal tower that grows with every passage.",order:1000+(index||0),
    status:"custom",group:"custom",source:"user"
  };
}
function customCampaignsFromCollections(collections){
  return (collections || [])
    .filter(c=>c && CUSTOM_COLLECTION_ID.test(c.id) && CUSTOM_CAMPAIGN_ID.test(c.campaignId))
    .map(customCampaignFromCollection);
}
function canCreateCustomPassage(count, entitlement){
  const tier = entitlement && entitlement.tier;
  return tier && tier !== "free" ? true : Number(count||0) < CUSTOM_FREE_PASSAGE_LIMIT;
}
function canCreateCustomCollection(count, entitlement){
  const tier = entitlement && entitlement.tier;
  return tier && tier !== "free" ? true : Number(count||0) < CUSTOM_FREE_COLLECTION_LIMIT;
}
function towerRenderPlan(floorCount){
  const logicalFloors = Math.max(0,Math.floor(Number(floorCount)||0));
  const renderedFloors = Math.max(1,Math.min(120,logicalFloors || 1));
  const compressed = logicalFloors > 120;
  const firstDetailed = compressed ? logicalFloors - 24 : 1;
  return Object.freeze({
    logicalFloors,renderedFloors,compressed,compressedCount:compressed ? logicalFloors-25 : 0,
    detailedLevels:Object.freeze(Array.from({length:compressed?25:logicalFloors},(_,i)=>firstDetailed+i))
  });
}
function physicalTowerLevel(logicalLevel, plan){
  const p = plan || towerRenderPlan(1);
  if(!p.compressed) return Math.max(1,Math.min(p.renderedFloors,logicalLevel));
  return Math.max(1,p.renderedFloors-(p.logicalFloors-logicalLevel));
}
function validateCustomContentPayload(payload,reserved){
  const passages = payload && payload.customPassages;
  const collections = payload && payload.collections;
  if(passages != null && !Array.isArray(passages)) return {ok:false,error:"Custom passages must be a list."};
  if(collections != null && !Array.isArray(collections)) return {ok:false,error:"Custom collections must be a list."};
  if((passages||[]).length>CUSTOM_MAX_IMPORT_PASSAGES) return {ok:false,error:`Imports support at most ${CUSTOM_MAX_IMPORT_PASSAGES} custom passages.`};
  if((collections||[]).length>CUSTOM_MAX_IMPORT_COLLECTIONS) return {ok:false,error:`Imports support at most ${CUSTOM_MAX_IMPORT_COLLECTIONS} custom collections.`};
  const reservedPassageIds=new Set((reserved&&reserved.passageIds)||[]);
  const reservedCampaignIds=new Set((reserved&&reserved.campaignIds)||[]);
  const ids = new Set();
  for(const p of passages||[]){
    if(!p || !CUSTOM_PASSAGE_ID.test(p.id) || ids.has(p.id) || reservedPassageIds.has(p.id)) return {ok:false,error:"A custom passage ID is invalid, repeated, or collides with built-in content."};
    ids.add(p.id);
    if(p.source!=="user" || !validateCustomPassageInput(p).ok) return {ok:false,error:`Custom passage ${p.id} is incomplete or malformed.`};
  }
  const collectionIds = new Set(), campaignIds = new Set();
  for(const c of collections||[]){
    if(!c || !CUSTOM_COLLECTION_ID.test(c.id) || collectionIds.has(c.id) ||
       !CUSTOM_CAMPAIGN_ID.test(c.campaignId) || campaignIds.has(c.campaignId) || reservedCampaignIds.has(c.campaignId)){
      return {ok:false,error:"A custom collection ID is invalid or repeated."};
    }
    collectionIds.add(c.id); campaignIds.add(c.campaignId);
    if(c.source!=="user" || !validateCustomCollectionName(c.name).ok || !Array.isArray(c.passageIds) ||
       new Set(c.passageIds).size!==c.passageIds.length || c.passageIds.some(id=>!ids.has(id))){
      return {ok:false,error:`Custom collection ${c.id} is malformed.`};
    }
  }
  return {ok:true,error:null};
}

if(typeof module!=="undefined" && module.exports){
  module.exports={CUSTOM_FREE_PASSAGE_LIMIT,CUSTOM_FREE_COLLECTION_LIMIT,CUSTOM_PASSAGE_ID,CUSTOM_COLLECTION_ID,CUSTOM_CAMPAIGN_ID,
    newCustomId,validateCustomPassageInput,makeCustomPassage,editCustomPassage,validateCustomCollectionName,makeCustomCollection,
    customCampaignFromCollection,customCampaignsFromCollections,canCreateCustomPassage,canCreateCustomCollection,
    towerRenderPlan,physicalTowerLevel,validateCustomContentPayload};
}
if(typeof SQ!=="undefined") Object.assign(SQ,{CUSTOM_FREE_PASSAGE_LIMIT,CUSTOM_FREE_COLLECTION_LIMIT,CUSTOM_PASSAGE_ID,CUSTOM_COLLECTION_ID,CUSTOM_CAMPAIGN_ID,
  newCustomId,validateCustomPassageInput,makeCustomPassage,editCustomPassage,validateCustomCollectionName,makeCustomCollection,
  customCampaignFromCollection,customCampaignsFromCollections,canCreateCustomPassage,canCreateCustomCollection,
  towerRenderPlan,physicalTowerLevel,validateCustomContentPayload});
