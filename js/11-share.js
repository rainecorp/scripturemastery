/* 11-share.js
   share text, canvas share card, share popup
   Extracted verbatim from index.html lines 3850-4003 by T2. */
/* =========================================================
   SHARE — share a sealed relic (image card when possible),
   or plain victory text. Everything degrades gracefully:
   Web Share API → clipboard copy → manual.
   ========================================================= */
function bumpShares(){ state.shares = (state.shares||0)+1; saveState(); }
async function shareText(text){
  try{
    if(navigator.share){ await navigator.share({text}); bumpShares(); return true; }
  }catch(e){ if(e && e.name === "AbortError") return false; }
  try{
    await navigator.clipboard.writeText(text);
    showToast("📋 <strong>Copied!</strong> Paste it anywhere to share.", true);
    bumpShares();
    return true;
  }catch(e){}
  showToast("Couldn't open sharing on this device.");
  return false;
}
function shareTextForVerse(v){
  const r = relicFor(v);
  const fl = floorOf(v);
  return `✦ I memorized ${v.ref} in Scripture Quest! “${r.motto}” — that's ${sealedTotal()} verse${sealedTotal()===1?"":"s"} sealed${fl?` and Floor ${fl} of ${TOWERS[v.volume].name} lit`:""}. 🏰🔥`;
}
function drawShareCanvas(v, done){
  const r = relicFor(v);
  const d = difficultyForVerse(v);
  const fl = floorOf(v);
  const W = 1000, H = 1250;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  const finish = ()=>{
    /* frame + text over whatever art landed */
    x.strokeStyle = "rgba(244,185,66,.85)"; x.lineWidth = 6;
    x.strokeRect(28, 28, W-56, H-56);
    x.strokeStyle = "rgba(244,185,66,.35)"; x.lineWidth = 2;
    x.strokeRect(44, 44, W-88, H-88);
    x.textAlign = "center";
    x.fillStyle = "#f4b942";
    x.font = "900 34px Georgia, serif";
    x.fillText("✦ SCRIPTURE QUEST ✦", W/2, 118);
    x.fillStyle = "#ffffff";
    x.font = "800 72px Georgia, serif";
    x.fillText(v.ref, W/2, 800);
    x.fillStyle = "#fde68a";
    x.font = "italic 700 40px Georgia, serif";
    wrapText(x, `“${r.motto}”`, W/2, 875, W-200, 52);
    x.fillStyle = "#9db4d6";
    x.font = "800 30px Georgia, serif";
    x.fillText(`${r.name} · ${d.trim.metal} relic`, W/2, 1010);
    x.fillStyle = "#aabbd8";
    x.font = "800 28px Georgia, serif";
    x.fillText(`✦ Sealed${fl ? ` · Floor ${fl} of ${TOWERS[v.volume].name}` : ""}`, W/2, 1062);
    x.fillStyle = "#f4b942";
    x.font = "900 30px Georgia, serif";
    x.fillText(`${sealedTotal()} verses sealed · ${state.streak}-day streak 🔥`, W/2, 1150);
    done(c);
  };
  const wrapText = (ctx, text, cx2, cy, maxW, lh)=>{
    const words = text.split(" ");
    let line = "", lines = [];
    words.forEach(w=>{
      const t = line ? line+" "+w : w;
      if(ctx.measureText(t).width > maxW && line){ lines.push(line); line = w; }
      else line = t;
    });
    if(line) lines.push(line);
    lines.forEach((l,i)=> ctx.fillText(l, cx2, cy + i*lh));
  };
  /* backdrop */
  const g = x.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#070d1f"); g.addColorStop(.55,"#0b2d42"); g.addColorStop(1,"#134e6b");
  x.fillStyle = g; x.fillRect(0,0,W,H);
  const rad = x.createRadialGradient(W/2, 440, 40, W/2, 440, 420);
  rad.addColorStop(0,"rgba(244,185,66,.35)"); rad.addColorStop(1,"rgba(244,185,66,0)");
  x.fillStyle = rad; x.fillRect(0,0,W,H);
  if(RELIC_IMAGES && r.designed){
    const img = new Image();
    img.onload = ()=>{ try{ x.drawImage(img, W/2-260, 180, 520, 520); }catch(e){} finish(); };
    img.onerror = ()=>{ x.font = "300px serif"; x.textAlign="center"; x.fillText(r.emoji, W/2, 560); finish(); };
    img.src = `relics/${v.id}.webp`;
  } else {
    x.font = "300px serif"; x.textAlign = "center"; x.fillText(r.emoji, W/2, 560);
    finish();
  }
}
function openSharePop(v){
  const pop = document.getElementById("sharePop");
  if(!pop) return;
  const text = shareTextForVerse(v);
  pop.innerHTML = `
    <div class="cer-backdrop" id="shareBackdrop"></div>
    <div class="relic-pop-stage">
      <div class="relic-pop-card share-card">
        <button class="rp-close" id="shareClose" aria-label="Close">✕</button>
        <div class="rp-ref" style="margin-top:4px;">📣 Share your victory</div>
        <div class="share-preview" id="sharePreview">${relicHTML(v, 150)}</div>
        <div class="share-text">${escHTML(text)}</div>
        <div class="rp-btns">
          ${navigator.share ? `<button class="btn primary" id="shareNative">📤 Share ▸</button>` : ``}
          <button class="btn ${navigator.share?'':'primary'}" id="shareCopy">📋 Copy the text</button>
          <button class="btn" id="shareSave" style="display:none;">💾 Save the image</button>
        </div>
      </div>
    </div>`;
  pop.classList.add("show");
  const close = ()=>{ pop.classList.remove("show"); pop.innerHTML = ""; };
  document.getElementById("shareClose").onclick = close;
  document.getElementById("shareBackdrop").onclick = close;
  let cardBlob = null, cardURL = null;
  drawShareCanvas(v, (canvas)=>{
    try{
      canvas.toBlob(blob=>{
        if(!blob) return;
        cardBlob = blob;
        cardURL = URL.createObjectURL(blob);
        const prev = document.getElementById("sharePreview");
        if(prev) prev.innerHTML = `<img class="share-img" src="${cardURL}" alt="Share card">`;
        const save = document.getElementById("shareSave");
        if(save){
          save.style.display = "";
          save.onclick = ()=>{
            const a = document.createElement("a");
            a.href = cardURL; a.download = `scripture-quest-${v.id}.png`; a.click();
            bumpShares();
            showToast("💾 <strong>Image saved!</strong> Send it to someone who'd cheer for you.", true);
          };
        }
      }, "image/png");
    }catch(e){ /* canvas tainted (file://) — text sharing still works */ }
  });
  const nat = document.getElementById("shareNative");
  if(nat) nat.onclick = async ()=>{
    try{
      const payload = {text};
      if(cardBlob && navigator.canShare){
        const file = new File([cardBlob], "scripture-quest.png", {type:"image/png"});
        if(navigator.canShare({files:[file]})) payload.files = [file];
      }
      await navigator.share(payload);
      bumpShares();
      close();
    }catch(e){ if(!e || e.name !== "AbortError") shareText(text); }
  };
  document.getElementById("shareCopy").onclick = async ()=>{
    try{
      await navigator.clipboard.writeText(text);
      showToast("📋 <strong>Copied!</strong> Paste it anywhere to share.", true);
      bumpShares();
    }catch(e){ showToast("Couldn't copy on this device."); }
  };
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.bumpShares = bumpShares;
SQ.shareText = shareText;
SQ.shareTextForVerse = shareTextForVerse;
SQ.drawShareCanvas = drawShareCanvas;
SQ.openSharePop = openSharePop;
