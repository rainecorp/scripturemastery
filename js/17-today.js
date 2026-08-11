/* 17-today.js
   Today — the base camp
   Extracted verbatim from index.html lines 5520-5859 by T2. */
/* =========================================================
   TODAY — the base camp
   ========================================================= */
function greetingLine(){
  const h = new Date().getHours();
  if(h < 5)  return {word:"Burning the midnight oil", emoji:"🌙"};
  if(h < 12) return {word:"Good morning", emoji:"🌅"};
  if(h < 17) return {word:"Good afternoon", emoji:"☀️"};
  if(h < 21) return {word:"Good evening", emoji:"🌆"};
  return {word:"One more verse before bed", emoji:"🌙"};
}
/* ---- storage line (T4) ----
   There is no Settings screen yet, so this lives at the foot of Today.
   Move it wholesale when Settings exists. Quiet by default: one grey line
   you can ignore. It escalates to a full card only when the browser is
   genuinely close to full or a save has actually failed — the point is
   that a player can never be in the state of "nothing is saving" without
   the app saying so on screen. */
function fmtKB(bytes){
  if(bytes == null) return "—";
  if(bytes >= 1048576) return (bytes/1048576).toFixed(1) + " MB";
  return Math.round(bytes/1024) + " KB";
}
function storageLineHTML(){
  const r = storageReport();
  if(r.used == null) return "";
  const pct = Math.min(100, Math.round(r.pct*100));

  if(r.lastError){
    const quota = r.lastError.kind === "quota";
    return `
      <div class="home-card storage-card bad">
        <h3><span class="spark">⚠️</span> Your progress is not being saved</h3>
        <div class="storage-detail">
          ${quota
            ? `This browser is out of storage room. Everything you have done is still on screen, but it will be lost if you reload the page.
               ${(r.lastError.dropped||[]).length ? `<br><span class="storage-sub">Already cleared to try to make room: ${r.lastError.dropped.join(", ")}. Your verses, seals and streak were not touched.</span>` : ""}`
            : `This browser refused to write to storage. If you are in a private window, progress will not survive closing it.`}
        </div>
        <div class="storage-bar"><i class="over" style="width:${pct}%"></i></div>
        <div class="storage-sub">${fmtKB(r.used)} used of ${fmtKB(r.budget)} · this app is using ${fmtKB(r.mine)}</div>
      </div>`;
  }

  if(r.tight){
    return `
      <div class="home-card storage-card warn">
        <h3><span class="spark">🗄️</span> Storage is getting full</h3>
        <div class="storage-detail">Saving still works. If this browser fills completely, older history gets cleared first — never your verses, seals or streak.</div>
        <div class="storage-bar"><i class="warn" style="width:${pct}%"></i></div>
        <div class="storage-sub">${fmtKB(r.used)} used of ${fmtKB(r.budget)} · this app is using ${fmtKB(r.mine)}</div>
      </div>`;
  }

  return `<div class="storage-line">Storage used: ${fmtKB(r.used)} of ${fmtKB(r.budget)} · progress saved ✓</div>`;
}

function checkinCardHTML(){
  const claimed = hasClaimedToday();
  const week = currentJourneyWeek();
  const chain = journeyDays(28);
  const activeDays = checkinCount();
  const m = nextStreakMilestone();
  const nextReward = nextJourneyReward();
  const currentStep = Math.max(1,state.streak || (claimed?1:0));
  const chestLevel = Math.min(25, Math.max(1, state.streak || 1));
  const giftXp = 10 + Math.min(20, (claimed ? state.streak : state.streak+ (state.lastDay===todayStr()?0:1))*2);
  const weekStart = week[0]?.step || 1;
  const weekEnd = week[week.length-1]?.step || 7;
  const encouragement = state.streak <= 1
    ? "This is not an empty week. This is the first flame in a brand-new path."
    : state.streak < 7
      ? "Your path is filling behind you, and every open space ahead is an invitation."
      : "You have already built proof that you return. Keep carrying the flame forward.";
  return `
    <div class="home-card checkin-card tier-${streakTier(state.streak)}" id="checkinCard">
      <h3><span class="spark">🔥</span> Daily Check-in <span class="ci-shields">${(state.shields||0) ? `🛡️×${state.shields}` : ""}</span></h3>
      <div class="ci-top">
        <div class="ci-flame-wrap">
          <div class="ci-flame">🔥</div>
          <div class="ci-streak-n">${state.streak}</div>
          <div class="ci-streak-l">day${state.streak===1?"":"s"}</div>
        </div>
        <div class="ci-main">
          ${claimed ? `
            <div class="ci-title">✓ You began today with a win.</div>
            <div class="ci-sub">${encouragement}${m ? ` <strong>${m - state.streak} day${m-state.streak===1?"":"s"}</strong> until your ${m}-day milestone.` : ""}</div>
          ` : `
            <div class="ci-title">Today is ready to become part of your story.</div>
            <div class="ci-sub">Open your blessing and place today’s flame on the path${m ? ` — only ${Math.max(1,m-state.streak)} day${Math.max(1,m-state.streak)===1?"":"s"} to the ${m}-day milestone` : ""}.</div>
          `}
          <div class="ci-week-wrap">
            <div class="ci-week-label"><strong>Your 7-day path</strong><span>Days ${weekStart}–${weekEnd}</span></div>
            <div class="ci-week">
              ${week.map(d=>{
                const lit=!!(d.rec && (d.rec.a||d.rec.c));
                const icon=lit?"🔥":(d.milestone?d.milestone.icon:(d.isToday?"✨":"·"));
                return `<div class="ci-day ${lit?"lit":""} ${d.isToday?"today":""} ${d.isFuture?"future":""} ${d.milestone?"reward":""}" title="${d.milestone?`Day ${d.step}: ${d.milestone.short}`:`Day ${d.step}`}">
                  <span class="ci-dow">${d.dow}</span><span class="ci-step">Day ${d.step}</span><span class="ci-dot">${icon}</span>
                </div>`;
              }).join("")}
            </div>
          </div>
        </div>
        <div class="ci-gift ${claimed ? "claimed" : ""}" id="ciGift" title="${claimed ? "Claimed — tomorrow holds the next flame" : "Open today's blessing"}">
          ${chestImg(chestLevel, 74)}
          ${claimed ? `<div class="ci-gift-tag done">✓ Today won</div>` : `<div class="ci-gift-tag">+${giftXp} XP<br>💛 refill<br>Open ▸</div>`}
        </div>
      </div>
      <div class="ci-chain-toggle" id="ciChainToggle">${view.chainOpen ? "Hide" : "See"} the treasures ahead on your 4-week path ${view.chainOpen ? "▴" : "▾"}</div>
      ${view.chainOpen ? `
        <div class="ci-journey-head">
          <div><div class="ci-journey-title">Your 28-day treasure trail</div><div class="ci-journey-sub">Completed days glow behind you. Rewards wait ahead.</div></div>
          ${nextReward ? `<div class="ci-next-reward">${nextReward.icon} Day ${nextReward.day}: ${nextReward.short}</div>` : `<div class="ci-next-reward">🏆 Path completed</div>`}
        </div>
        <div class="ci-chain">
          ${chain.map(d=>{
            const lit=!!(d.rec && (d.rec.a||d.rec.c));
            const icon=d.milestone?d.milestone.icon:(lit?"🔥":"");
            return `<div class="ci-chain-day ${lit?"lit":""} ${d.isToday?"today":""} ${d.isFuture?"future":""} ${d.milestone?"milestone":""}" title="${d.milestone?`Day ${d.step}: ${d.milestone.copy}`:`Day ${d.step}`}"><span class="day-num">${d.step}</span>${icon}</div>`;
          }).join("")}
        </div>
        <div class="ci-milestones">
          ${CHECKIN_MILESTONES.map(x=>`<div class="ci-mile ${(state.streak||0)>=x.day?"reached":""}"><div class="mi-icon">${x.icon}</div><div class="mi-day">Day ${x.day} · ${x.short}</div><div class="mi-copy">${x.copy}</div></div>`).join("")}
        </div>
        <div class="ci-chain-foot">You are not behind. You are on day ${Math.max(1,state.streak||1)} of the path you started. · best streak ${state.bestStreak||0} 🔥 · every 7-day run earns a 🛡️ Streak Shield</div>
      ` : ""}
    </div>`;
}
function bindCheckinCard(body){
  const gift = document.getElementById("ciGift");
  if(gift && !hasClaimedToday()){
    gift.onclick = ()=>{
      SFX.chest();
      gift.classList.add("opening");
      setTimeout(()=>{
        const res = claimDailyGift();
        if(!res) return;
        render(); /* full render so the header streak/XP update too */
        SFX.gift();
        FX.rain({count:70});
        showToast(`🎁 <strong>+${res.xp} XP${res.lucky ? " — lucky blessing! 🍀" : ""}</strong><br><span style="font-size:11.5px;color:#9db4d6;">Day ${state.streak} of your climb. ${res.hearts ? `Arena hearts refilled +${res.hearts}.` : "Arena hearts already full."}</span>`, true);
      }, 650);
    };
  }
  const ct = document.getElementById("ciChainToggle");
  if(ct) ct.onclick = ()=>{ view.chainOpen = !view.chainOpen; renderToday(); };
}
function renderToday(){
  const body = document.getElementById("body");
  const started = VERSES.some(v=>{const p=state.progress[v.id]; return p.sealed || (p.stage||0)>0;});
  const due = dueReviews();
  const greet = greetingLine();
  let html = "";

  if(started){
    const a0 = ensureArena();
    const quests0 = ensureArenaQuests(a0);
    const questsLeft = quests0.list.filter(q=>!q.done).length;
    const bits = [];
    if(due.length) bits.push(`${due.length} seal${due.length===1?"":"s"} to rescue 🕯️`);
    if(questsLeft) bits.push(`${questsLeft} quest${questsLeft===1?"":"s"} to win 🎁`);
    if(!hasClaimedToday()) bits.push(`a blessing to open 🎁`);
    html += `
      <div class="today-greet">
        <div class="tg-word">${greet.emoji} ${greet.word}, ${CLIMBER ? escHTML(CLIMBER) : "climber"}!</div>
        <div class="tg-sub">${bits.length ? "Waiting for you today: " + bits.join(" · ") : "All caught up — every extra verse today is pure treasure. ✨"}</div>
      </div>`;
  }

  html += checkinCardHTML();

  if(!started){
    const first = recommendedVerse();
    const heroStats = towerStats("Book of Mormon");
    html += `
      <div class="hero-start">
        <div class="hero-flex">
          <div class="hero-tower${heroStats.sealed>=heroStats.total?' full':''}"><img src="temple-towers/ancient-america-temple-assembled-preview.png" alt="The Ancient America Tower"></div>
          <div class="hero-copy">
            <h2>Climb the<br>Ancient America Tower</h2>
            <p>Twenty-five dark windows. Twenty-five locked chests. Behind each one, a verse worth carrying forever. Memorize your first scripture — easy ones absolutely count — and the first window lights up with your relic shining inside.</p>
            <div class="hero-steps">
              <div class="hero-step"><div class="hs-icon">🧗</div><div class="hs-t">Climb</div><div class="hs-d">5 stages, each a little harder</div></div>
              <div class="hero-step"><div class="hs-icon">🗝️</div><div class="hs-t">Unlock</div><div class="hs-d">Recite it — the chest opens</div></div>
              <div class="hero-step"><div class="hs-icon">🏺</div><div class="hs-t">Collect</div><div class="hs-d">Relics fill your shelf</div></div>
            </div>
            <button class="btn primary" id="beginBtn" style="max-width:300px;margin:0 auto;">Light the first window ▸</button>
            <div class="hero-alt" id="heroTower">or gaze up at the tower first ▸</div>
          </div>
        </div>
      </div>`;
  } else {
    const q = recommendedVerse();
    const qp = state.progress[q.id];
    const qr = relicFor(q);
    const shards = shardsFor(qp);
    const qt = TOWERS[q.volume];
    const qs = towerStats(q.volume);
    const qlog = climbLog(q.volume);
    const choices = climbChoices(q.volume);
    html += `
      <div class="home-card climb-card" style="--thue:${qt.hue};--tsoft:${qt.soft}">
        <h3><span class="spark">🗼</span> Continue the climb</h3>
        <div class="climb-now">
          <div class="cn-tower${qs.sealed>=qs.total?' full':''}"><img src="${qt.art.prefix}assembled-preview.png" alt=""></div>
          <div class="cn-info">
            <div class="cn-name">${qt.name}</div>
            <div class="cn-floor">Floor ${qlog.length+1} awaits · ${qs.sealed}/${qs.total} windows lit</div>
            <div class="ts-bar"><i style="width:${Math.round(qs.pct*100)}%"></i></div>
            <div class="cn-current">${(qp.stage||0)>0 ? `⛏️ In progress: <strong>${q.ref}</strong> · ${qr.name} · ${shards}/5 shards` : `Suggested next: <strong>${q.ref}</strong> · ${qr.name}`}</div>
          </div>
        </div>
        <button class="btn primary" id="questBtn">${(qp.stage||0)>0 ? "Continue the climb ▸" : "Start this verse ▸"}</button>
        <div class="cn-or">— or pick your own path to Floor ${qlog.length+1} —</div>
        <div class="choice-grid">
          ${choices.map(c=>{
            const d = difficultyForVerse(c.v);
            const cp = state.progress[c.v.id];
            const cStarted = (cp.stage||0) > 0;
            return `
              <div class="choice-card ${c.cls}" data-id="${c.v.id}">
                <div class="cc-tag">${c.tag}</div>
                ${relicHTML(c.v, 62)}
                <div class="cc-info">
                  <div class="cc-ref">${c.v.ref}</div>
                  <div class="cc-theme">${c.v.theme}</div>
                  <div class="cc-meta">${d.emoji} ${d.label} · ${d.words} words${cStarted ? ` · ${shardsFor(cp)}/5 shards` : ""}</div>
                </div>
              </div>`;
          }).join("")}
        </div>
        <div class="qalt" id="questAlt">see the full tower ▸</div>
      </div>`;
  }

  html += `
    ${sealedTotal()>=3 ? `<div class="home-card">
      <h3><span class="spark">🕯️</span> Fading Seals ${due.length?`· ${due.length} due`:''}</h3>
      ${due.length ? due.slice(0,6).map(v=>{
        const p = state.progress[v.id];
        const r = relicFor(v);
        return `
          <div class="review-item" data-id="${v.id}">
            ${relicHTML(v, 46)}
            <div class="ri-info">
              <div class="ri-ref">${v.ref}</div>
              <div class="ri-name">${r.name}</div>
            </div>
            ${condBadgeHTML(p)}
            <div class="ri-go">Re-seal ▸</div>
          </div>`;
      }).join("") : `<div class="all-lit">✦ Every seal is burning bright. Nothing to review today.</div>`}
    </div>` : ''}

    ${trialPool().length ? (()=>{
      const a = ensureArena();
      const quests = ensureArenaQuests(a);
      const questsDone = quests.list.filter(q=>q.done).length;
      return `
    <div class="home-card trial-tease">
      <h3><span class="spark">⚔️</span> The Arena · Today's Quests <span class="tt-count">${questsDone}/3</span></h3>
      ${arenaHeartsHTML(`<span class="heart-refill">refill in Study/Towers</span>`)}
      <div class="quest-list quest-list-light">
        ${quests.list.map(inst=>{
          const def = questDef(inst.id);
          const pct = Math.round((inst.progress/inst.goal)*100);
          return `<div class="quest-item ${inst.done?'done quest-done-card':'quest-click'}" data-quest="${inst.id}" title="${inst.done ? def.name+" — chest claimed" : "Play a round of "+def.name}">
            <div class="quest-chest">${chestImg(def.chest,38)}</div>
            <div class="quest-info">
              <div class="quest-name">${def.emoji} ${def.name}${inst.done?" ✓":""}</div>
              <div class="quest-desc">${def.desc}</div>
              <div class="quest-bar"><i style="width:${pct}%"></i></div>
            </div>
            <div class="quest-side">
              <div class="quest-progress">${inst.progress}/${inst.goal}</div>
              ${inst.done ? `<div class="quest-won">✓ Won</div>` : `<div class="quest-play">▶ Play</div>`}
            </div>
          </div>`;
        }).join("")}
      </div>
      <div class="tt-sub" style="margin:10px 0;">Tap a quest to jump straight into that challenge${due.length ? ` · victory restores ${due.length} fading seal${due.length===1?"":"s"} 🕯️` : ""}.</div>
      <button class="btn primary" id="trialBtn">Enter the arena ▸</button>
    </div>`;
    })() : ""}

    <div class="home-card achv-home">
      <h3><span class="spark">🏆</span> Achievements <span class="tt-count">${achvUnlockedCount()}/${ACHIEVEMENTS.length}</span></h3>
      ${(()=>{
        const tops = topProgressingAchievements(5);
        if(!tops.length) return `<div class="all-lit">🌟 Every achievement earned. You are legend.</div>`;
        return `<div class="achv-top-list">` + tops.map(t=>`
          <div class="achv-top achv-link" data-achv="${t.a.id}" title="Tap to go earn ${t.a.name}">
            <div class="achv-badge sm">${t.a.emoji}</div>
            <div class="achv-info">
              <div class="achv-name">${t.a.name}</div>
              <div class="achv-desc">${t.a.desc}</div>
              <div class="achv-bar"><i style="width:${Math.round(t.pct*100)}%"></i></div>
            </div>
            <div class="achv-prog">${t.cur}/${t.a.goal} ▸</div>
          </div>`).join("") + `</div>
          <div class="tt-sub" style="margin:8px 0 0;">Tap an achievement to jump straight to where you earn it.</div>`;
      })()}
      <div class="qalt" id="achvAll">See all achievements 🏆 ▸</div>
    </div>

    <div class="home-card">
      <h3><span class="spark">🗼</span> The Four Towers</h3>
      <div class="tower-strip">
        ${VOLUME_ORDER.map(vol=>{
          const t = TOWERS[vol];
          const s = towerStats(vol);
          return `
            <div class="tstrip" data-vol="${vol}" style="--thue:${t.hue}">
              <div class="ts-info">
                <div class="ts-name">${t.name}</div>
                <div class="ts-count">${s.sealed}/${s.total} floors sealed${s.due?` · ${s.due} fading`:''}</div>
                <div class="ts-bar"><i style="width:${Math.round(s.pct*100)}%"></i></div>
              </div>
              <div class="ts-preview${s.sealed>=s.total?' full':''}"><img src="${t.art.prefix}assembled-preview.png" alt="" loading="lazy"></div>
            </div>`;
        }).join("")}
      </div>
    </div>`;

  const recent = VERSES.filter(v=>state.progress[v.id].sealed)
    .sort((a,b)=>(state.progress[b.id].sealedAt||0)-(state.progress[a.id].sealedAt||0))
    .slice(0,6);
  html += `
    <div class="home-card">
      <h3><span class="spark">🏺</span> The Relic Shelf</h3>
      ${recent.length
        ? `<div class="shelf-strip">${recent.map(v=>`<div class="shelf-strip-item" data-id="${v.id}">${relicHTML(v,46)}</div>`).join("")}</div>
           <div class="qalt" id="shelfGo">Visit the trophy room ▸</div>`
        : `<div class="all-lit">Your shelf is empty — every relic still waits in the dark. Seal your first verse to claim one.</div>
           <button class="btn" id="shelfGo" style="margin-top:10px;">🏺 Go to the Relic Shelf ▸</button>`}
    </div>`;

  html += storageLineHTML();

  body.innerHTML = html;
  bindCheckinCard(body);
  body.querySelectorAll(".quest-click").forEach(el=>{
    el.onclick = ()=>{ SFX.pick(); startQuestRound(el.dataset.quest); };
  });
  body.querySelectorAll(".quest-done-card").forEach(el=>{
    el.onclick = ()=>{
      const def = questDef(el.dataset.quest);
      SFX.pick();
      view.tab = "trials";
      view.trialRound = null;
      view.arenaStatsOpen = true;
      render();
      showToast(`${def ? def.emoji+" <strong>"+def.name+"</strong>" : "Quest"} chest is already on your Quest Shelf.`);
      window.scrollTo({top:0});
    };
  });
  const achvAll = document.getElementById("achvAll");
  if(achvAll) achvAll.onclick = ()=> openAchvPop();
  body.querySelectorAll(".achv-top[data-achv]").forEach(el=>{
    el.onclick = ()=> achvGo(el.dataset.achv);
  });
  const begin = document.getElementById("beginBtn");
  if(begin) begin.onclick = ()=> openStudy(recommendedVerse().id, false);
  const heroTower = document.getElementById("heroTower");
  if(heroTower) heroTower.onclick = ()=>{ view.tab = "towers"; view.volume = "Book of Mormon"; render(); window.scrollTo({top:0}); };
  const shelfGo = document.getElementById("shelfGo");
  if(shelfGo) shelfGo.onclick = ()=>{ view.tab = "shelf"; render(); window.scrollTo({top:0}); };
  body.querySelectorAll(".shelf-strip-item").forEach(el=>{
    el.onclick = ()=> openRelicPop(VERSES.find(v=>v.id===el.dataset.id));
  });
  const trialBtn = document.getElementById("trialBtn");
  if(trialBtn) trialBtn.onclick = ()=>{ view.tab = "trials"; view.trialRound = null; render(); window.scrollTo({top:0}); };
  body.querySelectorAll(".choice-card").forEach(el=>{
    el.onclick = ()=> openStudy(el.dataset.id, false);
  });
  const qb = document.getElementById("questBtn");
  if(qb) qb.onclick = ()=>{ view.tab = "towers"; view.volume = recommendedVerse().volume; render(); window.scrollTo({top:0}); };
  const qa = document.getElementById("questAlt");
  if(qa) qa.onclick = ()=>{ view.volume = recommendedVerse().volume; view.tab = "towers"; render(); };
  body.querySelectorAll(".review-item").forEach(el=>{
    el.onclick = ()=> openStudy(el.dataset.id, true);
  });
  body.querySelectorAll(".tstrip").forEach(el=>{
    el.onclick = ()=>{ view.volume = el.dataset.vol; view.tab = "towers"; render(); };
  });
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.greetingLine = greetingLine;
SQ.fmtKB = fmtKB;
SQ.storageLineHTML = storageLineHTML;
SQ.checkinCardHTML = checkinCardHTML;
SQ.bindCheckinCard = bindCheckinCard;
SQ.renderToday = renderToday;
