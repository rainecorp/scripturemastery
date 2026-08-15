/* 05-relics.js
   shard rendering, relic art/HTML, condition badge, relic popup, chests
   Extracted verbatim from index.html lines 3311-3427 by T2. */
/* =========================================================
   RELIC RENDERING — 5 shards over a silhouette
   ========================================================= */
const SHARD_CLIPS = [
  "polygon(0% 0%,100% 0%,70% 26%,30% 30%,0% 20%)",
  "polygon(0% 20%,30% 30%,22% 64%,0% 70%)",
  "polygon(0% 70%,22% 64%,46% 78%,40% 100%,0% 100%)",
  "polygon(100% 0%,100% 100%,40% 100%,46% 78%,76% 62%,70% 26%)",
  "polygon(30% 30%,70% 26%,76% 62%,46% 78%,22% 64%)"
];
function shardsFor(p){ return p.sealed ? 5 : Math.min(4, p.stage||0); }
function relicArt(v, r){
  const img = (RELIC_IMAGES && r.designed)
    ? `<img src="relics/${v.id}.webp" alt="" loading="lazy" onerror="this.closest('.relic').classList.add('no-img')">`
    : "";
  return `<div class="rl-art">${img}<span class="rl-emoji">${r.emoji}</span></div>`;
}
function relicHTML(v, size){
  size = size || 72;
  const p = state.progress[v.id];
  const shards = shardsFor(p);
  const r = relicFor(v);
  const d = difficultyForVerse(v);
  const cond = sealCondition(p);
  let layers = `<div class="rl-base">${relicArt(v,r)}</div>`;
  for(let i=0;i<5;i++){
    layers += `<div class="rl-shard ${i<shards?'on':''}" style="clip-path:${SHARD_CLIPS[i]}">${relicArt(v,r)}</div>`;
  }
  const cls = [
    "relic",
    r.designed ? "" : "relic-fallback",
    (RELIC_IMAGES && r.designed) ? "img-mode" : "",
    p.sealed ? "sealed" : "",
    p.provenIt ? "proven" : "",
    cond ? cond.cls : ""
  ].filter(Boolean).join(" ");
  return `<div class="${cls}" style="--rsz:${size}px;--trim:${d.trim.trim};--trimglow:${d.trim.glow}">${layers}${(p.sealed || p.provenIt)?'<div class="rl-ring"></div>':''}</div>`;
}
function scriptureSourceLink(v){
  if(v.translation === "bsb") return {url:"https://ebible.org/engbsb/", label:"Read in the Berean Standard Bible ↗"};
  if(v.translation === "kjv") return {url:"https://ebible.org/Scriptures/details.php?id=eng-kjv2006", label:"Read in the King James Version ↗"};
  return {
    url:`https://www.churchofjesuschrist.org/study/scriptures?lang=eng&query=${encodeURIComponent(v.ref)}`,
    label:`Read ${v.ref} on ChurchofJesusChrist.org ↗`
  };
}
function condBadgeHTML(p){
  const c = sealCondition(p);
  if(!c) return "";
  const icon = {radiant:"✦", eternal:"♾️", dimming:"🕯️", fading:"🌫️", cracked:"💔"}[c.id] || "";
  return `<span class="cond-badge ${c.cls}">${icon} ${c.label}</span>`;
}

/* =========================================================
   RELIC POPUP — tap any relic to see its verse, reference,
   and status without leaving the current page.
   ========================================================= */
function openRelicPop(v){
  const pop = document.getElementById("relicPop");
  if(!pop) return;
  const p = state.progress[v.id];
  const fl = floorOf(v);
  const cond = p.sealed ? sealCondition(p) : null;
  const condIcon = cond ? ({radiant:"✦", eternal:"♾️", dimming:"🕯️", fading:"🌫️", cracked:"💔"}[cond.id] || "") : "";
  const statusChips = [
    p.sealed ? `<span class="tc-pill">✦ Sealed${fl?` · Floor ${fl}`:""}</span>` : "",
    cond ? `<span class="tc-pill">${condIcon} ${cond.label}</span>` : "",
    !p.sealed && p.provenIt ? `<span class="tc-pill">🧩 Proven — not yet sealed</span>` : "",
    !p.sealed && !p.provenIt ? `<span class="tc-pill">${shardsFor(p)}/5 shards uncovered</span>` : ""
  ].filter(Boolean).join("");
  const scriptureLink = scriptureSourceLink(v);
  const safe = safePassageHTML(v);
  pop.innerHTML = `
    <div class="cer-backdrop" id="relicPopBackdrop"></div>
    <div class="relic-pop-stage">
      <div class="relic-pop-card">
        <button class="rp-close" id="relicPopClose" aria-label="Close">✕</button>
        <div class="rp-relic">${relicHTML(v, 300)}</div>
        <div class="rp-ref">${safe.ref}</div>
        <div class="rp-theme">${safe.topic}</div>
        <div class="rp-status">${statusChips}</div>
        <div class="rp-text">"${numberedVerseText(v)}"</div>
        <div class="rp-btns">
          <button class="btn primary" id="relicPopStudy">${p.sealed ? "Review this verse ▸" : "Study this verse ▸"}</button>
          ${p.sealed ? `<button class="btn" id="relicPopShare">📣 Share this relic</button>` : ""}
          ${v.source==="user"?"":`<a class="rp-link" href="${scriptureLink.url}" target="_blank" rel="noopener noreferrer">${escHTML(scriptureLink.label)}</a>`}
        </div>
      </div>
    </div>`;
  pop.classList.add("show");
  const close = closeRelicPop;
  document.getElementById("relicPopClose").onclick = close;
  document.getElementById("relicPopBackdrop").onclick = close;
  document.getElementById("relicPopStudy").onclick = ()=>{ close(); openStudy(v.id, isDue(p)); };
  const rpShare = document.getElementById("relicPopShare");
  if(rpShare) rpShare.onclick = ()=>{ close(); openSharePop(v); };
}
function closeRelicPop(){
  const pop = document.getElementById("relicPop");
  if(!pop) return;
  pop.classList.remove("show");
  pop.innerHTML = "";
}
function chestImg(level, size){
  const n = Math.max(1, Math.min(25, level));
  const nn = String(n).padStart(2,"0");
  return `<img class="chest-img" src="chests/level-${nn}.webp" alt="Chest level ${n}" loading="lazy" style="width:${size||64}px;height:${size||64}px;">`;
}
function chestSVG(open){
  if(open){
    return `<svg class="chest open" viewBox="0 0 48 42" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="14" rx="16" ry="7" fill="#fde68a" opacity=".55"/>
      <path d="M7 4 Q9 -3 24 -1 Q40 1 41 6 L40 12 L8 10 Z" fill="#a06a33" stroke="#5d3a17" stroke-width="1.6" transform="rotate(-14 24 6)"/>
      <rect x="6" y="16" width="36" height="22" rx="4" fill="#8a5a2b" stroke="#5d3a17" stroke-width="1.6"/>
      <rect x="8" y="18" width="32" height="8" rx="3" fill="#3a2205" opacity=".8"/>
      <rect x="20" y="24" width="8" height="10" rx="2" fill="#f4b942" stroke="#b45309" stroke-width="1.4"/>
    </svg>`;
  }
  return `<svg class="chest" viewBox="0 0 48 42" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="16" width="36" height="22" rx="4" fill="#8a5a2b" stroke="#5d3a17" stroke-width="1.6"/>
    <path d="M6 20 Q6 6 24 6 Q42 6 42 20 Z" fill="#a06a33" stroke="#5d3a17" stroke-width="1.6"/>
    <line x1="6" y1="20" x2="42" y2="20" stroke="#5d3a17" stroke-width="1.4"/>
    <rect x="20" y="17" width="8" height="11" rx="2" fill="#f4b942" stroke="#b45309" stroke-width="1.4"/>
    <circle cx="24" cy="22" r="1.6" fill="#7c4a12"/>
  </svg>`;
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.SHARD_CLIPS = SHARD_CLIPS;
SQ.shardsFor = shardsFor;
SQ.relicArt = relicArt;
SQ.relicHTML = relicHTML;
SQ.condBadgeHTML = condBadgeHTML;
SQ.openRelicPop = openRelicPop;
SQ.closeRelicPop = closeRelicPop;
SQ.chestImg = chestImg;
SQ.chestSVG = chestSVG;
