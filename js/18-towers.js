/* 18-towers.js
   towers overview, TV_ASSET geometry, tower visual, tower detail
   Extracted verbatim from index.html lines 5860-6196 by T2. */
/* =========================================================
   TOWERS — overview + single tower climb
   ========================================================= */
function renderTowers(){
  if(view.volume) return renderTowerDetail(view.volume);
  const body = document.getElementById("body");
  body.innerHTML = `
    <div class="tower-grid">
      ${VOLUME_ORDER.map(vol=>{
        const t = TOWERS[vol];
        const s = towerStats(vol);
        const segs = 10, filled = Math.round(s.pct*segs);
        return `
          <div class="tower-card" data-vol="${vol}" style="--thue:${t.hue};--tsoft:${t.soft}">
            <div class="tc-preview${s.sealed>=s.total?' full':''}"><img src="${t.art.prefix}assembled-preview.png" alt="" loading="lazy"></div>
            <div class="mini-tower">${Array.from({length:segs},(_,i)=>`<i class="${i<filled?'f':''}"></i>`).join("")}</div>
            <div class="tc-name">${t.name}</div>
            <div class="tc-vol">${displayVolumeName(vol)}</div>
            <div class="tc-tag">${t.tag}</div>
            <div class="tc-stats">
              <span class="tc-pill">${s.sealed}/${s.total} sealed</span>
              ${s.eternal?`<span class="tc-pill">♾️ ${s.eternal} eternal</span>`:''}
              ${s.due?`<span class="tc-pill warn">🕯️ ${s.due} fading</span>`:''}
            </div>
          </div>`;
      }).join("")}
    </div>
    <footer class="hint">Each floor guards one verse and one treasure chest. Seal the verse to open the chest and light the floor.</footer>`;
  body.querySelectorAll(".tower-card").forEach(el=>{
    el.onclick = ()=>{ view.volume = el.dataset.vol; render(); };
  });
}

/* =========================================================
   TOWER VISUAL — the climbable tower art (25 floors, 5 pieces).
   Each volume has its own kit in temple-towers/ (see TOWERS[vol].art):
   <prefix>bottom.png (ground), <prefix>window-01.png (floor 1),
   <prefix>window-repeat.png (floors 2-23), <prefix>top-window-24.png
   (floor 24), and <prefix>roof-final-25.png (floor 25, the crown).
   All kits share the same piece geometry (640w · 251/87/94/302).
   ========================================================= */
const TV_ASSET = { repeatLevels:22, roofHeight:251, topHeight:87, windowHeight:94, baseHeight:302 };
TV_ASSET.worldHeight = TV_ASSET.roofHeight + TV_ASSET.topHeight
  + (TV_ASSET.repeatLevels * TV_ASSET.windowHeight) + TV_ASSET.windowHeight + TV_ASSET.baseHeight;

function tvLevelTop(level){
  const {roofHeight:R, topHeight:T, windowHeight:W, repeatLevels:REP} = TV_ASSET;
  if(level === 25) return 0;
  if(level === 24) return R;
  if(level >= 2) return R + T + ((23 - level) * W);
  return R + T + (REP * W);
}
function tvLevelHeight(level){
  if(level === 25) return TV_ASSET.roofHeight;
  if(level === 24) return TV_ASSET.topHeight;
  return TV_ASSET.windowHeight;
}
// Each art piece's window sits at a slightly different offset within its tile —
// measured directly from the PNGs rather than guessed from tile height.
function tvGlowTop(level){
  if(level === 25) return 163;
  if(level === 1) return 36;
  if(level === 24) return 32;
  return 31;
}
function tvLevelOffset(viewportEl, scale, level){
  if(level === 1) return 0;
  const viewportHeight = viewportEl.clientHeight;
  const viewportTarget = viewportHeight * 0.58;
  const dist = TV_ASSET.worldHeight - (tvLevelTop(level) + tvLevelHeight(level) / 2);
  const raw = dist - (viewportTarget / scale);
  const minOffset = 0;
  const maxOffset = (TV_ASSET.worldHeight * scale - viewportHeight) / scale;
  return Math.max(minOffset, Math.min(maxOffset, raw));
}

function buildTowerVisual(container, vol){
  const art = (TOWERS[vol] && TOWERS[vol].art) || {prefix:"temple-towers/restoration-temple-", baseWidth:585};
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
        <img class="tv-piece" src="${art.prefix}roof-final-25.png" alt="">
        <img class="tv-piece" src="${art.prefix}top-window-24.png" alt="">
        <div id="tvRepeatStack"></div>
        <img class="tv-piece" src="${art.prefix}window-01.png" alt="">
        <img class="tv-piece tv-base" src="${art.prefix}bottom.png" alt="" style="width:${art.baseWidth}px">
        <div id="tvLevelLayers"></div>
      </div>
    </div>`;
  const repeatStack = container.querySelector("#tvRepeatStack");
  for(let i=0; i<TV_ASSET.repeatLevels; i++){
    const img = document.createElement("img");
    img.className = "tv-piece tv-repeat";
    img.src = `${art.prefix}window-repeat.png`;
    img.alt = "";
    repeatStack.appendChild(img);
  }
  const levelLayers = container.querySelector("#tvLevelLayers");
  for(let level=1; level<=25; level++){
    const layer = document.createElement("div");
    layer.className = "tv-layer";
    layer.style.top = `${tvLevelTop(level)}px`;
    layer.style.height = `${tvLevelHeight(level)}px`;
    layer.dataset.level = String(level);

    const glow = document.createElement("div");
    glow.className = "tv-glow";
    glow.style.top = `${tvGlowTop(level)}px`;

    if(level === 25){
      glow.style.width = "96px"; glow.style.height = "74px"; glow.style.borderRadius = "18px";
    }

    const badge = document.createElement("div");
    badge.className = "tv-badge";
    badge.textContent = String(level);

    const relic = document.createElement("div");
    relic.className = "tv-relic " + (level % 2 ? "tv-relic-right" : "tv-relic-left");
    layer.append(glow, relic, badge);
    levelLayers.appendChild(layer);
  }
}

function updateTowerVisual(container, litCount, activeLevel, vol){
  const viewportEl = container.querySelector(".tv-viewport");
  const world = container.querySelector("#tvWorld");
  if(!viewportEl || !world) return;
  const scale = Math.min(0.86, Math.max(0.4, (viewportEl.clientWidth / 640) * 0.94));
  world.style.setProperty("--tv-scale", scale);
  world.style.setProperty("--tv-y", `${tvLevelOffset(viewportEl, scale, activeLevel)}px`);
  const log = vol ? climbLog(vol) : [];
  container.querySelectorAll(".tv-layer").forEach(layer=>{
    const lvl = Number(layer.dataset.level);
    layer.classList.toggle("is-active", lvl === activeLevel);
    layer.classList.toggle("is-complete", lvl <= litCount && lvl !== activeLevel);
    const slot = layer.querySelector(".tv-relic");
    if(slot){
      const id = (lvl <= litCount) ? log[lvl-1] : null;
      const v = id ? VERSES.find(x=>x.id===id) : null;
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
  if(info && vol){
    const fid = log[activeLevel-1];
    let inner;
    if(fid){
      const fv = VERSES.find(x=>x.id===fid);
      const fr = relicFor(fv);
      const fp = state.progress[fv.id];
      inner = `<strong>${fv.ref}</strong><span>${fr.name}${isEternal(fp) ? " ♾️" : (isDue(fp) ? " 🕯️" : " ✦")}</span>`;
    } else if(activeLevel === log.length + 1){
      inner = `<strong>🗝️ Floor ${activeLevel}</strong><span>Seal a verse to light this window</span>`;
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
  container._tvLast = { lit: litCount, active: activeLevel, vol };
}

window.addEventListener("resize", ()=>{
  const tv = document.getElementById("towerVisual");
  if(tv && tv._tvLast) updateTowerVisual(tv, tv._tvLast.lit, tv._tvLast.active, tv._tvLast.vol);
});

function renderTowerDetail(vol){
  const body = document.getElementById("body");
  const t = TOWERS[vol];
  const vs = versesInVolume(vol);
  const s = towerStats(vol);
  const log = climbLog(vol);
  const nextFloor = log.length + 1;
  const complete = log.length >= vs.length;

  /* --- next floor: pick your verse, open the next chest --- */
  let nextHTML = "";
  if(!complete){
    const choices = climbChoices(vol);
    nextHTML = `
      <div class="next-floor" style="--thue:${t.hue};--tsoft:${t.soft}">
        <div class="nf-chest">
          ${chestImg(nextFloor, 92)}
          <div class="nf-chest-label">Chest ${nextFloor}</div>
        </div>
        <div class="nf-body">
          <div class="nf-title">Floor ${nextFloor} · choose your verse</div>
          <div class="nf-sub">Seal any one of these and this chest opens. The climb is yours: every climber's tower is different.</div>
          <div class="choice-grid">
            ${choices.map(c=>{
              const d = difficultyForVerse(c.v);
              const p = state.progress[c.v.id];
              const started = (p.stage||0) > 0;
              return `
                <div class="choice-card ${c.cls}" data-id="${c.v.id}">
                  <div class="cc-tag">${c.tag}</div>
                  ${relicHTML(c.v, 62)}
                  <div class="cc-info">
                    <div class="cc-ref">${c.v.ref}</div>
                    <div class="cc-theme">${c.v.theme}</div>
                    <div class="cc-meta">${d.emoji} ${d.label} · ${d.words} words${started ? ` · ${shardsFor(p)}/5 shards` : ""}</div>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>
      </div>
      ${vs.length - log.length > 1 ? `<div class="mist-note">🌫️ ${vs.length - log.length - 1} more chests wait in the mist above.</div>` : ""}`;
  } else {
    nextHTML = `<div class="crowned">👑 <strong>${t.name} is crowned!</strong><br><span>Every chest opened, every relic claimed. Keep your seals burning to keep it lit.</span></div>`;
  }

  /* --- climbed floors, highest first --- */
  const rows = log.map((id, i)=>{
    const v = VERSES.find(x=>x.id===id);
    if(!v) return "";
    const p = state.progress[v.id];
    const r = relicFor(v);
    return `
      <div class="floor lit" data-id="${v.id}">
        <div class="fl-num">${i+1}</div>
        <div class="fl-chestimg">${chestImg(i+1, 48)}</div>
        <div style="position:relative;flex-shrink:0;">${relicHTML(v, 58)}</div>
        <div class="fl-info">
          <div class="fl-ref">${v.ref} <span class="fl-torch">🔥</span></div>
          <div class="fl-name">${r.name}</div>
          <div class="fl-meta">${condBadgeHTML(p)} <span>${nextReviewText(p)}</span></div>
        </div>
        ${isDue(p) ? `<div class="fl-here" style="background:linear-gradient(180deg,#fdba74,#f97316);box-shadow:0 2px 0 #c2410c;">Re-seal</div>` : ""}
      </div>`;
  }).reverse().join("");

  body.innerHTML = `
    <div class="tower-head" style="--thue:${t.hue};--tsoft:${t.soft}">
      <span class="th-back" id="backTowers">◂ All towers</span>
      <div class="th-name">${t.icon} ${t.name}</div>
      <div class="th-vol">${displayVolumeName(vol)} · your climb: ${log.length}/${vs.length} floors</div>
      <div class="th-stats">
        <span class="tc-pill">${s.sealed}/${s.total} chests opened</span>
        ${s.eternal?`<span class="tc-pill">♾️ ${s.eternal} eternal</span>`:''}
        ${s.due?`<span class="tc-pill warn">🕯️ ${s.due} fading</span>`:''}
      </div>
      <div class="th-bar"><i style="width:${Math.round(s.pct*100)}%"></i></div>
    </div>
    <div class="tower-cols">
      <div class="tower-col-main">
        ${nextHTML}
        ${rows ? `<div class="floors">${rows}</div>` : `<footer class="hint">No floors climbed yet. Pick a verse; sealing it builds Floor 1 of your tower.</footer>`}
        ${rows ? `<footer class="hint">Your tower is built one memorized verse at a time, in your order. Re-seal before a floor cracks to keep it lit.</footer>` : ""}
      </div>
      <div class="tower-col-side">
        <div class="tower-visual" id="towerVisual" style="--thue:${t.hue};--tsoft:${t.soft}"></div>
      </div>
    </div>`;

  const towerVisual = document.getElementById("towerVisual");
  buildTowerVisual(towerVisual, vol);
  const climbing = (pendingClimb && pendingClimb.vol === vol) ? pendingClimb : null;
  pendingClimb = null;
  if(climbing){
    /* arrive one floor below, then ride up as the new window lights */
    updateTowerVisual(towerVisual, climbing.floor - 1, Math.max(1, climbing.floor - 1), vol);
    const climbedId = log[climbing.floor - 1];
    const climbedV = climbedId ? VERSES.find(x=>x.id===climbedId) : null;
    const ban = document.createElement("div");
    ban.className = "tv-congrats";
    ban.innerHTML = `🎉 <strong>Floor ${climbing.floor} conquered!</strong><br><span>${climbedV ? relicFor(climbedV).name + " now shines in the window." : "The tower grows."}</span>`;
    towerVisual.querySelector(".tv-viewport").appendChild(ban);
    setTimeout(()=>{
      updateTowerVisual(towerVisual, log.length, Math.min(25, climbing.floor), vol);
      ban.classList.add("show");
    }, 750);
    setTimeout(()=>{ ban.classList.remove("show"); }, 7200);
  } else {
    updateTowerVisual(towerVisual, log.length, complete ? 25 : Math.min(25, nextFloor), vol);
  }
  towerVisual.querySelectorAll(".tv-layer").forEach(layer=>{
    layer.onclick = ()=>{
      const id = layer.dataset.verse;
      if(id) openStudy(id, isDue(state.progress[id]));
    };
  });
  const tvNav = (delta)=>{
    const cur = towerVisual._tvLast || {active: 1, lit: log.length};
    const target = delta === 0
      ? (complete ? 25 : Math.min(25, nextFloor))
      : Math.max(1, Math.min(25, cur.active + delta));
    updateTowerVisual(towerVisual, cur.lit, target, vol);
  };
  const tvUp = towerVisual.querySelector("#tvUp");
  const tvDown = towerVisual.querySelector("#tvDown");
  const tvHere = towerVisual.querySelector("#tvHere");
  if(tvUp) tvUp.onclick = (e)=>{ e.stopPropagation(); tvNav(1); };
  if(tvDown) tvDown.onclick = (e)=>{ e.stopPropagation(); tvNav(-1); };
  if(tvHere) tvHere.onclick = (e)=>{ e.stopPropagation(); tvNav(0); };

  document.getElementById("backTowers").onclick = ()=>{ view.volume = null; render(); };
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

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.renderTowers = renderTowers;
SQ.TV_ASSET = TV_ASSET;
SQ.tvLevelTop = tvLevelTop;
SQ.tvLevelHeight = tvLevelHeight;
SQ.tvGlowTop = tvGlowTop;
SQ.tvLevelOffset = tvLevelOffset;
SQ.buildTowerVisual = buildTowerVisual;
SQ.updateTowerVisual = updateTowerVisual;
SQ.renderTowerDetail = renderTowerDetail;
