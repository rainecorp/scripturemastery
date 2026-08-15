/* 24-custom.js — persistent custom passages and personal tower manager (T11) */
function customPassageById(id){ return (state.customPassages||[]).find(v=>v.id===id) || null; }
function customCollectionById(id){ return (state.collections||[]).find(c=>c.id===id) || null; }
function customPassageMembership(id){ return (state.collections||[]).find(c=>(c.passageIds||[]).includes(id)) || null; }
function refreshCustomDerivedState(){
  state.customCampaigns = customCampaignsFromCollections(state.collections||[]);
  state.climb = state.climb || {};
  state.customCampaigns.forEach(c=>{
    const allowed=new Set(c.passageIds);
    const log=(state.climb[c.id]||[]).filter(id=>allowed.has(id));
    const missing=c.passageIds.filter(id=>state.progress[id]&&state.progress[id].sealed&&!log.includes(id))
      .sort((a,b)=>(state.progress[a].sealedAt||0)-(state.progress[b].sealedAt||0));
    state.climb[c.id]=log.concat(missing);
  });
}
function createCustomCollection(name){
  if(!canCreateCustomCollection((state.collections||[]).length,state.entitlement)) return {ok:false,error:"The free personal library includes one custom tower."};
  const checked=validateCustomCollectionName(name);
  if(!checked.ok) return checked;
  const allIds=allCampaigns().map(c=>c.id).concat((state.collections||[]).map(c=>c.id));
  const collection=makeCustomCollection(checked.value,{
    collectionId:newCustomId("collection",allIds),
    campaignId:newCustomId("campaign",allIds)
  });
  state.collections.push(collection); refreshCustomDerivedState(); saveState();
  return {ok:true,collection};
}
function renameCustomCollection(id,name){
  const collection=customCollectionById(id),checked=validateCustomCollectionName(name);
  if(!collection) return {ok:false,error:"That personal tower no longer exists."};
  if(!checked.ok) return checked;
  collection.name=checked.value; refreshCustomDerivedState(); saveState(); return {ok:true,collection};
}
function deleteCustomCollection(id,confirmFn){
  const collection=customCollectionById(id); if(!collection) return false;
  const ask=confirmFn||window.confirm.bind(window);
  if(!ask(`Delete “${collection.name}”? Its passages will stay in My Passages, but this tower and its floor order will be removed.`)) return false;
  state.collections=state.collections.filter(c=>c.id!==id);
  if(state.climb) delete state.climb[collection.campaignId];
  refreshCustomDerivedState(); saveState(); return true;
}
function saveCustomPassage(input,editingId,collectionId){
  const checked=validateCustomPassageInput(input);
  if(!checked.ok) return checked;
  let passage=editingId?customPassageById(editingId):null;
  const oldMembership=passage?customPassageMembership(passage.id):null;
  const oldMembershipIndex=oldMembership?oldMembership.passageIds.indexOf(passage.id):-1;
  if(editingId&&!passage) return {ok:false,error:"That custom passage no longer exists.",errors:{}};
  if(!passage&&!canCreateCustomPassage((state.customPassages||[]).length,state.entitlement)){
    return {ok:false,error:`Your free personal library is full at ${CUSTOM_FREE_PASSAGE_LIMIT} passages. Existing passages and towers remain fully usable.`,errors:{}};
  }
  if(passage){
    const next=editCustomPassage(passage,checked.value);
    state.customPassages[state.customPassages.findIndex(v=>v.id===passage.id)]=next;
    passage=next;
  }else{
    passage=makeCustomPassage(checked.value,newCustomId("passage",allPassages().map(v=>v.id)));
    state.customPassages.push(passage);
    state.progress[passage.id]={stage:0,sealed:false};
  }
  (state.collections||[]).forEach(c=>{ c.passageIds=(c.passageIds||[]).filter(id=>id!==passage.id); });
  const collection=customCollectionById(collectionId);
  if(collection){
    if(oldMembership && oldMembership.id===collection.id && oldMembershipIndex>=0){
      collection.passageIds.splice(Math.min(oldMembershipIndex,collection.passageIds.length),0,passage.id);
    }else collection.passageIds.push(passage.id);
  }
  refreshCustomDerivedState(); saveState();
  return {ok:true,passage};
}
function deleteCustomPassage(id,confirmFn){
  const passage=customPassageById(id); if(!passage) return false;
  const ask=confirmFn||window.confirm.bind(window);
  if(!ask(`Delete “${passage.ref}”? This removes its study progress and any floor it built.`)) return false;
  state.customPassages=state.customPassages.filter(v=>v.id!==id);
  (state.collections||[]).forEach(c=>{c.passageIds=(c.passageIds||[]).filter(pid=>pid!==id);});
  delete state.progress[id];
  Object.values(state.climb||{}).forEach(log=>{const i=log.indexOf(id);if(i>=0)log.splice(i,1);});
  refreshCustomDerivedState(); saveState(); return true;
}
function customFieldError(errors,key){ return errors&&errors[key]?`<div class="custom-field-error">${escHTML(errors[key])}</div>`:""; }

function renderCustomContent(formErrors,formMessage,formDraft){
  const body=document.getElementById("body");
  const passages=state.customPassages||[],collections=state.collections||[];
  const editing=view.customEditingId?customPassageById(view.customEditingId):null;
  const membership=editing?customPassageMembership(editing.id):null;
  const freeTier=!(state.entitlement&&state.entitlement.tier)||state.entitlement.tier==="free";
  const atLimit=!canCreateCustomPassage(passages.length,state.entitlement);
  const showForm=!!editing||view.customFormOpen;
  const canAddTower=canCreateCustomCollection(collections.length,state.entitlement);
  const towerFormHTML=canAddTower?`<form class="custom-create-tower" id="customTowerForm">
      <label for="customTowerName">${collections.length?"Add another personal tower":"Name your first personal tower"}</label>
      <div class="custom-inline"><input id="customTowerName" maxlength="80" placeholder="Family Scripture Tower" autocomplete="off"><button class="btn primary" type="submit">Create tower</button></div>
      <p>A collection becomes a tower. Every passage you add raises its roof by one floor.</p>
    </form>`:"";
  let towerHTML="";
  if(!collections.length){
    towerHTML=towerFormHTML;
  }else{
    towerHTML=collections.map(c=>{
      const name=escHTML(c.name),campaign=customCampaignsFromCollections([c])[0];
      return `<article class="custom-tower-card">
        <div class="custom-tower-icon">🛠️</div><div class="custom-tower-copy"><strong>${name}</strong><span>${c.passageIds.length} passage${c.passageIds.length===1?"":"s"} · ${c.passageIds.length} floor${c.passageIds.length===1?"":"s"}</span></div>
        <div class="custom-tower-actions"><button class="btn primary custom-view-tower" data-campaign="${escHTML(campaign.id)}">View tower</button><button class="btn custom-rename-tower" data-id="${escHTML(c.id)}">Rename</button><button class="btn custom-delete-tower" data-id="${escHTML(c.id)}">Delete</button></div>
      </article>`;
    }).join("")+towerFormHTML;
  }
  const formValues=formDraft||editing||{ref:"",topic:"",text:""};
  const selectedCollectionId=formDraft&&Object.prototype.hasOwnProperty.call(formDraft,"collectionId")
    ? formDraft.collectionId : (membership?membership.id:(!editing&&collections.length===1?collections[0].id:""));
  const formHTML=showForm?`<form class="custom-passage-form" id="customPassageForm">
    <div class="custom-form-head"><div><span>${editing?"Edit passage":"New passage"}</span><strong>${editing?escHTML(editing.ref):"Add words worth carrying"}</strong></div><button class="custom-x" id="customFormClose" type="button" aria-label="Close passage form">✕</button></div>
    ${formMessage?`<div class="custom-form-message">${escHTML(formMessage)}</div>`:""}
    <label for="customRef">Reference or title</label><input id="customRef" maxlength="120" value="${escHTML(formValues.ref)}" placeholder="Psalm 46:10 or Family Proclamation"><div class="custom-help">This label can change later without losing progress.</div>${customFieldError(formErrors,"ref")}
    <label for="customTopic">Theme or memory cue</label><input id="customTopic" maxlength="180" value="${escHTML(formValues.topic)}" placeholder="Be still, and know"><div class="custom-help">A short cue appears on cards and the relic shelf.</div>${customFieldError(formErrors,"topic")}
    <label for="customText">Exact text to memorize</label><textarea id="customText" maxlength="10000" rows="9" placeholder="Paste or type the exact wording you want to learn.">${escHTML(formValues.text)}</textarea>${customFieldError(formErrors,"text")}
    <label for="customCollection">Personal tower</label><select id="customCollection"><option value="" ${selectedCollectionId?"":"selected"}>Keep unassigned for now</option>${collections.map(c=>`<option value="${escHTML(c.id)}" ${selectedCollectionId===c.id?"selected":""}>${escHTML(c.name)}</option>`).join("")}</select>
    <div class="custom-source-note">You supply and verify custom wording. The app stores it locally and treats it strictly as plain text.</div>
    <div class="custom-form-actions"><button class="btn primary" type="submit">${editing?"Save changes":"Add passage & grow tower"}</button><button class="btn" id="customFormCancel" type="button">Cancel</button></div>
  </form>`:"";
  const passageHTML=passages.length?`<div class="custom-passage-list">${passages.map(v=>{
    const safe=safePassageHTML(v),c=customPassageMembership(v.id);
    return `<article class="custom-passage-row" data-id="${safe.id}"><div class="custom-passage-main"><strong>${safe.ref}</strong><span>${safe.topic}</span><small>${c?`🗼 ${escHTML(c.name)}`:"Unassigned"} · ${wordCount(v.text)} words</small></div><div class="custom-row-actions"><button class="btn custom-edit" data-id="${safe.id}">Edit</button><button class="btn custom-delete" data-id="${safe.id}">Delete</button></div></article>`;
  }).join("")}</div>`:`<div class="custom-empty"><span>📜</span><strong>No personal passages yet</strong><p>Add one exact passage, assign it to your tower, and watch the roof rise.</p></div>`;
  body.innerHTML=`<div class="custom-manager">
    <div class="custom-manager-head"><button class="custom-back" id="customBack">◂ Collection</button><div class="custom-kicker">PERSONAL SCRIPTURE BUILDER</div><h2>My Passages & Towers</h2><p>Write your own collection into the skyline—one honestly memorized floor at a time.</p><div class="custom-meter"><span>${freeTier?`${passages.length}/${CUSTOM_FREE_PASSAGE_LIMIT} free passages`:`${passages.length} personal passage${passages.length===1?"":"s"}`}</span>${freeTier?`<i><b style="width:${Math.min(100,passages.length/CUSTOM_FREE_PASSAGE_LIMIT*100)}%"></b></i>`:""}</div></div>
    <section class="custom-section"><div class="custom-section-title"><div><span>🗼 Personal tower</span><small>${freeTier?`${collections.length}/${CUSTOM_FREE_COLLECTION_LIMIT} included`:`${collections.length} personal tower${collections.length===1?"":"s"}`}</small></div></div>${towerHTML}</section>
    <section class="custom-section"><div class="custom-section-title"><div><span>📖 My passages</span><small>${passages.length} saved locally</small></div>${!showForm&&!atLimit?`<button class="btn primary" id="customAdd">＋ Add passage</button>`:""}</div>
      ${atLimit?`<div class="custom-limit"><strong>Your free personal library is full.</strong><span>All ${CUSTOM_FREE_PASSAGE_LIMIT} passages remain editable, studyable, and reviewable. Quest+ will add unlimited passages and towers when accounts and purchases ship.</span></div>`:""}
      ${formHTML}${passageHTML}
    </section>
  </div>`;
  document.getElementById("customBack").onclick=()=>{view.customOpen=false;view.customFormOpen=false;view.customEditingId=null;renderLibrary();};
  const towerForm=document.getElementById("customTowerForm");
  if(towerForm)towerForm.onsubmit=e=>{e.preventDefault();const res=createCustomCollection(document.getElementById("customTowerName").value);if(!res.ok)showToast(`⚠️ ${escHTML(res.error)}`,true);renderCustomContent();};
  const add=document.getElementById("customAdd");if(add)add.onclick=()=>{view.customFormOpen=true;view.customEditingId=null;renderCustomContent();};
  const closeForm=()=>{view.customFormOpen=false;view.customEditingId=null;renderCustomContent();};
  const close=document.getElementById("customFormClose"),cancel=document.getElementById("customFormCancel");if(close)close.onclick=closeForm;if(cancel)cancel.onclick=closeForm;
  const passageForm=document.getElementById("customPassageForm");
  if(passageForm)passageForm.onsubmit=e=>{e.preventDefault();const draft={ref:document.getElementById("customRef").value,topic:document.getElementById("customTopic").value,text:document.getElementById("customText").value,collectionId:document.getElementById("customCollection").value};const res=saveCustomPassage(draft,view.customEditingId,draft.collectionId);if(!res.ok){renderCustomContent(res.errors,res.error,draft);return;}view.customFormOpen=false;view.customEditingId=null;showToast(`🛠️ <strong>${escHTML(res.passage.ref)}</strong> saved. Your personal tower is ready to grow.`,true);renderCustomContent();};
  body.querySelectorAll(".custom-edit").forEach(el=>el.onclick=()=>{view.customEditingId=el.dataset.id;view.customFormOpen=true;renderCustomContent();});
  body.querySelectorAll(".custom-delete").forEach(el=>el.onclick=()=>{if(deleteCustomPassage(el.dataset.id)){view.customEditingId=null;renderCustomContent();}});
  body.querySelectorAll(".custom-view-tower").forEach(el=>el.onclick=()=>{view.customOpen=false;view.campaignId=el.dataset.campaign;view.tab="towers";render();window.scrollTo({top:0});});
  body.querySelectorAll(".custom-rename-tower").forEach(el=>el.onclick=()=>{const c=customCollectionById(el.dataset.id);const name=window.prompt("Rename your personal tower",c.name);if(name!=null){const res=renameCustomCollection(c.id,name);if(!res.ok)showToast(`⚠️ ${escHTML(res.error)}`,true);renderCustomContent();}});
  body.querySelectorAll(".custom-delete-tower").forEach(el=>el.onclick=()=>{if(deleteCustomCollection(el.dataset.id))renderCustomContent();});
}

Object.assign(SQ,{customPassageById,customCollectionById,customPassageMembership,refreshCustomDerivedState,createCustomCollection,renameCustomCollection,deleteCustomCollection,saveCustomPassage,deleteCustomPassage,renderCustomContent});
