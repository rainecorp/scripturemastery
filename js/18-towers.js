/* 18-towers.js
   campaign overview, scalable tower geometry, tower visual, tower detail */
/* =========================================================
   CAMPAIGN TOWER RENDERING — each active Campaign is one tower
   ========================================================= */
function renderTowers(){
  if(view.campaignId) return renderTowerDetail(view.campaignId);
  const body = document.getElementById("body");
  const campaigns = activeCampaigns();
  const groups = [
    {id:"doctrinal", title:"Current Doctrinal Mastery", desc:"The official current Seminary curriculum—24 passages in each course."},
    {id:"articles", title:"Articles of Faith", desc:"Thirteen declarations of belief, built as their own climb."},
    {id:"custom", title:"My Personal Towers", desc:"Each passage you add raises the roof by one floor."},
    {id:"retired", title:"The Heritage Collection", desc:"The verses a generation grew up on. Still worth carrying."}
  ];
  const cardHTML = campaign=>{
        const s = towerStats(campaign.id);
        const safe = safeCampaignHTML(campaign);
        const segs = 10, filled = Math.round(s.pct*segs);
        return `
          <div class="tower-card" data-campaign="${safe.id}" style="--thue:${campaign.hue};--tsoft:${campaign.soft}">
            <div class="tc-preview${s.sealed>=s.total?' full':''}"><img src="${towerArtPrefix(campaign)}assembled-preview.png" alt="" loading="lazy"></div>
            <div class="mini-tower">${Array.from({length:segs},(_,i)=>`<i class="${i<filled?'f':''}"></i>`).join("")}</div>
            <div class="tc-name">${safe.name}</div>
            <div class="tc-vol">${safe.shortName}</div>
            <div class="tc-tag">${safe.tag}</div>
            <div class="tc-stats">
              <span class="tc-pill">${s.sealed}/${s.total} sealed</span>
              ${s.eternal?`<span class="tc-pill">♾️ ${s.eternal} eternal</span>`:''}
              ${s.due?`<span class="tc-pill warn">🕯️ ${s.due} fading</span>`:''}
            </div>
          </div>`;
  };
  body.innerHTML = `
    ${groups.map(group=>{
      const members = campaigns.filter(c=>(c.group || "doctrinal") === group.id);
      if(!members.length) return "";
      return `<section class="campaign-section ${group.id}">
        <div class="campaign-section-head"><h2>${group.title}</h2><p>${group.desc}</p></div>
        <div class="tower-grid">${members.map(cardHTML).join("")}</div>
      </section>`;
    }).join("")}
    <footer class="hint">Each floor guards one passage and one treasure chest. Seal the passage to open the chest and light the floor.</footer>`;
  body.querySelectorAll(".tower-card").forEach(el=>{
    el.onclick = ()=>{ view.campaignId = el.dataset.campaign; render(); };
  });
}

/* =========================================================
   TOWER VISUAL — five art pieces, N floors
   ---------------------------------------------------------
   The source PNG filenames still describe the original art positions
   (roof-final-25 and top-window-24), but those numbers are filenames, not
   geometry. Campaign passage count is now the only source of tower height.
   ========================================================= */
function tvLevelOffset(viewportEl, scale, level, geometry){
  const g = geometry || towerGeometry(1);
  if(level === 1) return 0;
  const viewportHeight = viewportEl.clientHeight;
  const viewportTarget = viewportHeight * 0.58;
  const dist = g.worldHeight - (tvLevelTop(level, g) + tvLevelHeight(level, g) / 2);
  const raw = dist - (viewportTarget / scale);
  const minOffset = 0;
  const maxOffset = Math.max(0, (g.worldHeight * scale - viewportHeight) / scale);
  return Math.max(minOffset, Math.min(maxOffset, raw));
}

function buildTowerVisual(container, campaignId){
  const campaign = campaignById(campaignId);
  const plan = towerRenderPlan(campaign.passageIds.length);
  const geometry = towerGeometry(plan.renderedFloors);
  const prefix = towerArtPrefix(campaign);
  const baseWidth = campaign.towerArt.baseWidth || 640;
  container._tvGeometry = geometry;
  container._tvPlan = plan;
  container._tvCampaignId = campaignId;
  container.innerHTML = `
    <div class="tv-viewport">
      <div class="tv-caption"><span>Floor</span><strong id="tvCaptionNum">1</strong></div>
      <div class="tv-floorinfo" id="tvFloorInfo"></div>
      <div class="tv-nav">
        <button type="button" class="tv-nav-btn" id="tvUp" title="Climb up">▲</button>
        <button type="button" class="tv-nav-btn" id="tvHere" title="Jump to your floor">⌖</button>
        <button type="button" class="tv-nav-btn" id="tvDown" title="Climb down">▼</button>
      </div>
      <div class="tv-world" id="tvWorld">
        <img class="tv-piece" src="${prefix}roof-final-25.png" alt="">
        ${plan.logicalFloors>=3?`<img class="tv-piece" src="${prefix}top-window-24.png" alt="">`:""}
        <div id="tvRepeatStack"></div>
        ${plan.logicalFloors>=2?`<img class="tv-piece" src="${prefix}window-01.png" alt="">`:""}
        <img class="tv-piece tv-base" src="${prefix}bottom.png" alt="" style="width:${baseWidth}px">
        <div id="tvLevelLayers"></div>
      </div>
      ${plan.compressed?`<div class="tv-compressed-note">Distant view · ${plan.compressedCount} lower floors compressed. The newest 25 remain detailed.</div>`:""}
      <label class="tv-jump" title="Jump to any floor"><span>Jump</span><input id="tvRange" type="range" min="1" max="${Math.max(1,plan.logicalFloors)}" value="1"></label>
    </div>`;
  const repeatStack = container.querySelector("#tvRepeatStack");
  for(let i=0; i<geometry.repeatLevels; i++){
    const img = document.createElement("img");
    img.className = "tv-piece tv-repeat";
    img.src = `${prefix}window-repeat.png`;
    img.alt = "";
    repeatStack.appendChild(img);
  }
  const levelLayers = container.querySelector("#tvLevelLayers");
  plan.detailedLevels.forEach(level=>{
    const physicalLevel=physicalTowerLevel(level,plan);
    const layer = document.createElement("div");
    layer.className = "tv-layer";
    layer.style.top = `${tvLevelTop(physicalLevel, geometry)}px`;
    layer.style.height = `${tvLevelHeight(physicalLevel, geometry)}px`;
    layer.dataset.level = String(level);

    const glow = document.createElement("div");
    glow.className = "tv-glow";
    glow.style.top = `${tvGlowTop(physicalLevel, geometry)}px`;
    if(physicalLevel === geometry.floors){
      glow.style.width = "96px"; glow.style.height = "74px"; glow.style.borderRadius = "18px";
    }

    const badge = document.createElement("div");
    badge.className = "tv-badge";
    badge.textContent = String(level);

    const relic = document.createElement("div");
    relic.className = "tv-relic " + (level % 2 ? "tv-relic-right" : "tv-relic-left");
    layer.append(glow, relic, badge);
    levelLayers.appendChild(layer);
  });
}

function updateTowerVisual(container, litCount, activeLevel, campaignId){
  const viewportEl = container.querySelector(".tv-viewport");
  const world = container.querySelector("#tvWorld");
  const campaign = campaignById(campaignId);
  const geometry = container._tvGeometry || towerGeometry(campaign.passageIds.length);
  const plan = container._tvPlan || towerRenderPlan(campaign.passageIds.length);
  if(!viewportEl || !world) return;
  activeLevel = Math.max(1, Math.min(plan.logicalFloors, activeLevel));
  const physicalActive=physicalTowerLevel(activeLevel,plan);
  const scale = Math.min(0.86, Math.max(0.4, (viewportEl.clientWidth / 640) * 0.94));
  world.style.setProperty("--tv-scale", scale);
  world.style.setProperty("--tv-y", `${tvLevelOffset(viewportEl, scale, physicalActive, geometry)}px`);
  const log = climbLog(campaignId);
  container.querySelectorAll(".tv-layer").forEach(layer=>{
    const lvl = Number(layer.dataset.level);
    layer.classList.toggle("is-active", lvl === activeLevel);
    layer.classList.toggle("is-complete", lvl <= litCount && lvl !== activeLevel);
    const slot = layer.querySelector(".tv-relic");
    if(slot){
      const id = (lvl <= litCount) ? log[lvl-1] : null;
      const v = id ? passageById(id) : null;
      if(v){
        if(layer.dataset.verse !== v.id){
          const r = relicFor(v);
          slot.innerHTML = (RELIC_IMAGES && r.designed)
            ? `<img src="relics/${v.id}.webp" alt="" loading="lazy">`
            : `<span>${r.emoji}</span>`;
          slot.title = `${v.ref} · ${r.name}`;
          layer.dataset.verse = v.id;
        }
        slot.classList.add("on");
        layer.classList.add("tv-clickable");
      } else {
        slot.classList.remove("on");
        layer.classList.remove("tv-clickable");
        delete layer.dataset.verse;
      }
    }
  });
  const info = container.querySelector("#tvFloorInfo");
  if(info){
    const fid = log[activeLevel-1];
    let inner;
    if(fid){
      const fv = passageById(fid);
      const fr = relicFor(fv);
      const fp = state.progress[fv.id];
      inner = `<strong>${escHTML(fv.ref)}</strong><span>${escHTML(fr.name)}${isEternal(fp) ? " ♾️" : (isDue(fp) ? " 🕯️" : " ✦")}</span>`;
    } else if(activeLevel === log.length + 1){
      inner = `<strong>🗝️ Floor ${activeLevel}</strong><span>Seal a passage to light this window</span>`;
    } else {
      inner = `<strong>🌫️ Floor ${activeLevel}</strong><span>Still hidden in the mist</span>`;
    }
    if(info.innerHTML !== inner){
      info.innerHTML = inner;
      info.classList.remove("pop"); void info.offsetWidth; info.classList.add("pop");
    }
    info.classList.add("show");
  }
  const cap = container.querySelector("#tvCaptionNum");
  if(cap) cap.textContent = String(activeLevel);
  const range=container.querySelector("#tvRange");
  if(range) range.value=String(activeLevel);
  container._tvLast = {lit:litCount, active:activeLevel, campaignId};
}

window.addEventListener("resize", ()=>{
  const tv = document.getElementById("towerVisual");
  if(tv && tv._tvLast) updateTowerVisual(tv, tv._tvLast.lit, tv._tvLast.active, tv._tvLast.campaignId);
});

function renderTowerDetail(campaignId){
  const body = document.getElementById("body");
  const campaign = campaignById(campaignId);
  const passages = campaignPassages(campaignId);
  const s = towerStats(campaignId);
  const log = climbLog(campaignId);
  const floorCount = passages.length;
  const nextFloor = log.length + 1;
  const complete = log.length >= floorCount;

  if(floorCount===0){
    const safe=safeCampaignHTML(campaign);
    body.innerHTML=`<div class="tower-head" style="--thue:${campaign.hue};--tsoft:${campaign.soft}"><span class="th-back" id="backTowers">◂ All towers</span><div class="th-name">${safe.icon} ${safe.name}</div><div class="th-vol">Personal Scripture Tower · 0 floors</div></div><div class="custom-empty"><span>🛠️</span><strong>Your foundation is ready.</strong><p>Add the first passage and this tower will rise one floor.</p><button class="btn primary" id="emptyTowerManage">Add a passage ▸</button></div>`;
    document.getElementById("backTowers").onclick=()=>{view.campaignId=null;render();};
    document.getElementById("emptyTowerManage").onclick=()=>{view.tab="library";view.customOpen=true;view.customFormOpen=true;view.campaignId=null;render();};
    return;
  }

  let nextHTML = "";
  if(!complete){
    const choices = climbChoices(campaignId);
    nextHTML = `
      <div class="next-floor" style="--thue:${campaign.hue};--tsoft:${campaign.soft}">
        <div class="nf-chest">
          ${chestImg(nextFloor, 92)}
          <div class="nf-chest-label">Chest ${nextFloor}</div>
        </div>
        <div class="nf-body">
          <div class="nf-title">Floor ${nextFloor} · choose your passage</div>
          <div class="nf-sub">Seal any one of these and this chest opens. The climb is yours: every climber's tower is different.</div>
          <div class="choice-grid">
            ${choices.map(c=>{
              const d = difficultyForVerse(c.v);
              const p = state.progress[c.v.id];
              const started = (p.stage||0) > 0;
              const safeV = safePassageHTML(c.v);
              return `
                <div class="choice-card ${c.cls}" data-id="${safeV.id}">
                  <div class="cc-tag">${escHTML(c.tag)}</div>
                  ${relicHTML(c.v, 62)}
                  <div class="cc-info">
                    <div class="cc-ref">${safeV.ref}</div>
                    <div class="cc-theme">${safeV.topic}</div>
                    <div class="cc-meta">${d.emoji} ${d.label} · ${d.words} words${started ? ` · ${shardsFor(p)}/5 shards` : ""}</div>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>
      </div>
      ${floorCount - log.length > 1 ? `<div class="mist-note">🌫️ ${floorCount - log.length - 1} more chests wait in the mist above.</div>` : ""}`;
  } else {
    nextHTML = `<div class="crowned">👑 <strong>${safeCampaignHTML(campaign).name} is crowned!</strong><br><span>Every chest opened, every relic claimed. Keep your seals burning to keep it lit.</span></div>`;
  }

  const rows = log.map((id, i)=>{
    const v = passageById(id);
    if(!v) return "";
    const p = state.progress[v.id];
    const r = relicFor(v);
    const safeV = safePassageHTML(v);
    return `
      <div class="floor lit" data-id="${safeV.id}">
        <div class="fl-num">${i+1}</div>
        <div class="fl-chestimg">${chestImg(i+1, 48)}</div>
        <div style="position:relative;flex-shrink:0;">${relicHTML(v, 58)}</div>
        <div class="fl-info">
          <div class="fl-ref">${safeV.ref} <span class="fl-torch">🔥</span></div>
          <div class="fl-name">${escHTML(r.name)}</div>
          <div class="fl-meta">${condBadgeHTML(p)} <span>${nextReviewText(p)}</span></div>
        </div>
        ${isDue(p) ? `<div class="fl-here" style="background:linear-gradient(180deg,#fdba74,#f97316);box-shadow:0 2px 0 #c2410c;">Re-seal</div>` : ""}
      </div>`;
  }).reverse().join("");

  const safeCampaign = safeCampaignHTML(campaign);
  body.innerHTML = `
    <div class="tower-head" style="--thue:${campaign.hue};--tsoft:${campaign.soft}">
      <span class="th-back" id="backTowers">◂ All towers</span>
      <div class="th-name">${safeCampaign.icon} ${safeCampaign.name}</div>
      <div class="th-vol">${safeCampaign.shortName} · your climb: ${log.length}/${floorCount} floors</div>
      <div class="th-stats">
        <span class="tc-pill">${s.sealed}/${s.total} chests opened</span>
        ${s.eternal?`<span class="tc-pill">♾️ ${s.eternal} eternal</span>`:''}
        ${s.due?`<span class="tc-pill warn">🕯️ ${s.due} fading</span>`:''}
      </div>
      <div class="th-bar"><i style="width:${Math.round(s.pct*100)}%"></i></div>
      ${campaign.source==="user"?`<button class="btn tower-custom-manage" id="towerCustomManage">Manage passages</button>`:""}
    </div>
    <div class="tower-cols">
      <div class="tower-col-main">
        ${nextHTML}
        ${rows ? `<div class="floors">${rows}</div>` : `<footer class="hint">No floors climbed yet. Pick a passage; sealing it builds Floor 1 of your tower.</footer>`}
        ${rows ? `<footer class="hint">Your tower is built one memorized passage at a time, in your order. Re-seal before a floor cracks to keep it lit.</footer>` : ""}
      </div>
      <div class="tower-col-side">
        <div class="tower-visual" id="towerVisual" style="--thue:${campaign.hue};--tsoft:${campaign.soft}"></div>
      </div>
    </div>`;

  const towerVisual = document.getElementById("towerVisual");
  buildTowerVisual(towerVisual, campaignId);
  const climbing = (pendingClimb && pendingClimb.campaignId === campaignId) ? pendingClimb : null;
  pendingClimb = null;
  if(climbing){
    updateTowerVisual(towerVisual, climbing.floor - 1, Math.max(1, climbing.floor - 1), campaignId);
    const climbedId = log[climbing.floor - 1];
    const climbedV = climbedId ? passageById(climbedId) : null;
    const ban = document.createElement("div");
    ban.className = "tv-congrats";
    ban.innerHTML = `🎉 <strong>Floor ${climbing.floor} conquered!</strong><br><span>${climbedV ? escHTML(relicFor(climbedV).name) + " now shines in the window." : "The tower grows."}</span>`;
    towerVisual.querySelector(".tv-viewport").appendChild(ban);
    setTimeout(()=>{
      updateTowerVisual(towerVisual, log.length, Math.min(floorCount, climbing.floor), campaignId);
      ban.classList.add("show");
    }, 750);
    setTimeout(()=>{ ban.classList.remove("show"); }, 7200);
  } else {
    updateTowerVisual(towerVisual, log.length, complete ? floorCount : Math.min(floorCount, nextFloor), campaignId);
  }
  towerVisual.querySelectorAll(".tv-layer").forEach(layer=>{
    layer.onclick = ()=>{
      const id = layer.dataset.verse;
      if(id) openStudy(id, isDue(state.progress[id]));
    };
  });
  const tvNav = (delta)=>{
    const cur = towerVisual._tvLast || {active:1, lit:log.length};
    const target = delta === 0
      ? (complete ? floorCount : Math.min(floorCount, nextFloor))
      : Math.max(1, Math.min(floorCount, cur.active + delta));
    updateTowerVisual(towerVisual, cur.lit, target, campaignId);
  };
  const tvUp = towerVisual.querySelector("#tvUp");
  const tvDown = towerVisual.querySelector("#tvDown");
  const tvHere = towerVisual.querySelector("#tvHere");
  const tvRange = towerVisual.querySelector("#tvRange");
  if(tvUp) tvUp.onclick = e=>{ e.stopPropagation(); tvNav(1); };
  if(tvDown) tvDown.onclick = e=>{ e.stopPropagation(); tvNav(-1); };
  if(tvHere) tvHere.onclick = e=>{ e.stopPropagation(); tvNav(0); };
  if(tvRange) tvRange.oninput=()=>updateTowerVisual(towerVisual,(towerVisual._tvLast||{}).lit||log.length,Number(tvRange.value),campaignId);

  document.getElementById("backTowers").onclick = ()=>{ view.campaignId = null; render(); };
  const customManage=document.getElementById("towerCustomManage");
  if(customManage)customManage.onclick=()=>{view.tab="library";view.customOpen=true;view.customFormOpen=false;view.campaignId=null;render();window.scrollTo({top:0});};
  body.querySelectorAll(".choice-card").forEach(el=>{
    el.onclick = ()=> openStudy(el.dataset.id, false);
  });
  body.querySelectorAll(".floor").forEach(el=>{
    el.onclick = ()=>{
      const p = state.progress[el.dataset.id];
      openStudy(el.dataset.id, isDue(p));
    };
  });
}

/* ---- SQ registry ---- */
SQ.renderTowers = renderTowers;
SQ.tvLevelOffset = tvLevelOffset;
SQ.buildTowerVisual = buildTowerVisual;
SQ.updateTowerVisual = updateTowerVisual;
SQ.renderTowerDetail = renderTowerDetail;
