/* Browser fixture for T11 tower-scale and escaping checks.
   Open custom-fixture.html?floors=7 (also 60 or 145). */
(function(){
  const requested=Number(new URLSearchParams(location.search).get("floors"));
  const floors=[7,10,60,145].includes(requested)?requested:7;
  const payload="<img src=x onerror=alert(1)>";
  const customPassages=Array.from({length:floors},(_,i)=>{
    const id=`p_a${String(i+1).padStart(7,"0")}`;
    return {
      id,canon:"custom",book:"Personal",
      ref:i===0?payload:`Personal Passage ${i+1}`,
      sortKey:[90,1700000000000+i,0,0],keyPhrase:null,
      topic:i===0?payload:`Memory cue ${i+1}`,
      texts:{custom:i===0?payload:`These are the exact personal words for floor ${i+1}.`},
      text:i===0?payload:`These are the exact personal words for floor ${i+1}.`,
      translation:"custom",textVerifiedAt:null,textHash:null,source:"user",
      createdAt:1700000000000+i,updatedAt:1700000000000+i
    };
  });
  const progress=Object.fromEntries(customPassages.map(v=>[v.id,{stage:0,sealed:false}]));
  const state={
    schemaVersion:3,track:"seminary",translation:"lds2013",startingCampaignId:"camp_dm_bom",
    onboardingComplete:true,onboardingChoice:"seminary",xp:0,streak:0,bestStreak:0,lastDay:null,
    shields:0,shares:0,resealsTotal:0,sound:false,strictMode:false,calendar:{},achv:{unlocked:{}},
    progress,customPassages,
    collections:[{id:"col_b0000001",campaignId:"camp_custom_c0000001",name:`Fixture Tower ${floors}`,passageIds:customPassages.map(v=>v.id),source:"user",createdAt:1700000000000}],
    customCampaigns:[],climb:{camp_custom_c0000001:[]},
    entitlement:{tier:floors>10?"quest-plus":"free",source:"fixture",expiresAt:null}
  };
  localStorage.setItem("sq_guestOk","1");
  localStorage.setItem("lineUponLine_v1",JSON.stringify(state));
})();
