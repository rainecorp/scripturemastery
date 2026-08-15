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

/* ---- the Daily Path (T16) ----
   Replaces the old standalone "Fading Seals" card. Rescue and Climb are
   required and drive the visible finish line; Strengthen and Victory Lap
   are bonus, shown underneath and never counted against it. */
function dpReasonFor(t){
  if(t.kind==="rescue") return t.status==="complete" ? "Re-sealed — nicely done" : `Seal is ${sealCondition(t.p).label.toLowerCase()} — re-seal it`;
  if(t.kind==="climb") return t.status==="complete" ? "You stepped forward today" : (t.p.sealed ? "Ready for a polish" : ((t.p.stage||0)>0 ? "Continue climbing" : "Begin this verse"));
  if(t.kind==="strengthen") return t.status==="complete" ? "That trouble spot is cooling down" : "A recent trouble spot — reinforce it";
  return "";
}
function dpTaskRowHTML(t){
  const done = t.status==="complete";
  if(t.kind==="victory"){
    const def = t.def;
    return `<div class="dp-row ${done?'done':''}" data-task="${escHTML(t.id)}">
      <div class="dp-icon">${done?"✓":def.emoji}</div>
      <div class="dp-info">
        <div class="dp-title">${escHTML(def.name)}</div>
        <div class="dp-reason">${done?"Quest already won today":def.desc}</div>
      </div>
      <div class="dp-go">${done?"Won":"Play ▸"}</div>
    </div>`;
  }
  const safeV = safePassageHTML(t.v);
  return `<div class="dp-row ${done?'done':''}" data-task="${escHTML(t.id)}">
    ${relicHTML(t.v, 40)}
    <div class="dp-info">
      <div class="dp-title">${safeV.ref}</div>
      <div class="dp-reason">${dpReasonFor(t)}</div>
    </div>
    <div class="dp-go">${done?"✓":"Go ▸"}</div>
  </div>`;
}
function dailyPathCardHTML(){
  const plan = dailyPlanFor();
  const required = plan.filter(t=>t.required);
  const optional = plan.filter(t=>!t.required);
  const doneRequired = required.filter(t=>t.status==="complete").length;
  const allDone = required.length>0 && doneRequired===required.length;
  const shownRescueIds = new Set(plan.filter(t=>t.kind==="rescue").map(t=>t.passageId));
  const dueBeyond = dueReviews().filter(v=>!shownRescueIds.has(v.id))
    .slice(0, Math.max(0, ensureSettings().dailyReviewLimit - shownRescueIds.size));
  return `
    <div class="home-card daily-path-card">
      <h3><span class="spark">🗺️</span> Your Daily Path ${required.length?`<span class="tt-count">${doneRequired}/${required.length}</span>`:""}</h3>
      <div class="tt-sub">${allDone ? "Today's required path is complete — anything below is a bonus. ✦" : "A short, focused route. Finish these and today counts."}</div>
      <div class="dp-list">${required.map(dpTaskRowHTML).join("")}</div>
      ${dueBeyond.length ? `<div class="dp-more" id="dpSeeAllDue">${view.dpShowAllDue?"Hide the rest ▴":`+${dueBeyond.length} more seal${dueBeyond.length===1?"":"s"} due — see all ▸`}</div>` : ""}
      ${view.dpShowAllDue && dueBeyond.length ? `<div class="dp-list dp-extra">${dueBeyond.map(v=>dpTaskRowHTML({id:`extra:${v.id}`, kind:"rescue", v, p:state.progress[v.id], status:"ready"})).join("")}</div>` : ""}
      ${optional.length ? `
        <div class="dp-optional-label">Optional today</div>
        <div class="dp-list dp-optional">${optional.map(dpTaskRowHTML).join("")}</div>
      ` : ""}
    </div>`;
}
function bindDailyPathCard(body){
  const plan = dailyPlanFor();
  body.querySelectorAll(".daily-path-card .dp-row[data-task]").forEach(el=>{
    el.onclick = ()=>{
      const id = el.dataset.task;
      if(id.startsWith("extra:")){
        const v = passageById(id.slice(6));
        if(v) openRecallCheck(v, "reseal");
        return;
      }
      const t = plan.find(x=>x.id===id);
      if(!t || t.status==="complete") return;
      if(t.kind==="rescue") openRecallCheck(t.v, "reseal");
      else if(t.kind==="climb") openStudy(t.v.id, false);
      else if(t.kind==="strengthen"){ view.studyMode="trouble"; openStudy(t.v.id, false); }
      else if(t.kind==="victory") startQuestRound(t.questId);
    };
  });
  const seeAll = document.getElementById("dpSeeAllDue");
  if(seeAll) seeAll.onclick = ()=>{ view.dpShowAllDue = !view.dpShowAllDue; renderToday(); };
}

function renderToday(){
  const body = document.getElementById("body");
  const christian = activeTrack().id === "christian";
  const started = activePassages().some(v=>{const p=state.progress[v.id]; return p.sealed || (p.stage||0)>0;});
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

  if(started) html += dailyPathCardHTML();

  const keyPhraseCount = phrasePassages(activePassages()).length;
  if(keyPhraseCount){
    html += `
      <div class="home-card phrase-home">
        <h3><span class="spark">🔑</span> Key Scripture Phrases <span class="tt-count">${keyPhraseCount}</span></h3>
        <div class="tt-sub">Practice the official Doctrinal Mastery cues as real recall: produce the reference from the phrase, or the phrase from the reference.</div>
        <div class="phrase-actions">
          <button class="btn" id="todayPhraseRef">Phrase → Reference</button>
          <button class="btn" id="todayRefPhrase">Reference → Phrase</button>
        </div>
      </div>`;
  }

  if(!started){
    const first = recommendedVerse();
    const campaign = campaignById(state.startingCampaignId) || activeCampaigns()[0];
    const safeCampaign = safeCampaignHTML(campaign);
    const heroStats = towerStats(campaign.id);
    const campaignTotal = campaign.passageIds.length;
    html += `
      <div class="hero-start">
        <div class="hero-flex">
          <div class="hero-tower${heroStats.sealed>=heroStats.total?' full':''}"><img src="${towerArtPrefix(campaign)}assembled-preview.png" alt="${safeCampaign.name}"></div>
          <div class="hero-copy">
            <h2>Climb<br>${safeCampaign.name}</h2>
            <p>${campaignTotal} dark windows. ${campaignTotal} locked chests. Behind each one, a verse worth carrying forever. Memorize your first scripture — easy ones absolutely count — and the first window lights up with your relic shining inside.</p>
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
    const campaign = primaryCampaignForPassage(q.id, view.campaignId || state.startingCampaignId);
    const safeCampaign = safeCampaignHTML(campaign);
    const safeQ = safePassageHTML(q);
    const qs = towerStats(campaign.id);
    const qlog = climbLog(campaign.id);
    const choices = climbChoices(campaign.id);
    html += `
      <div class="home-card climb-card" style="--thue:${campaign.hue};--tsoft:${campaign.soft}">
        <h3><span class="spark">🗼</span> Continue the climb</h3>
        <div class="climb-now">
          <div class="cn-tower${qs.sealed>=qs.total?' full':''}"><img src="${towerArtPrefix(campaign)}assembled-preview.png" alt=""></div>
          <div class="cn-info">
            <div class="cn-name">${safeCampaign.name}</div>
            <div class="cn-floor">Floor ${qlog.length+1} awaits · ${qs.sealed}/${qs.total} windows lit</div>
            <div class="ts-bar"><i style="width:${Math.round(qs.pct*100)}%"></i></div>
            <div class="cn-current">${(qp.stage||0)>0 ? `⛏️ In progress: <strong>${safeQ.ref}</strong> · ${escHTML(qr.name)} · ${shards}/5 shards` : `Suggested next: <strong>${safeQ.ref}</strong> · ${escHTML(qr.name)}`}</div>
          </div>
        </div>
        <button class="btn primary" id="questBtn">${(qp.stage||0)>0 ? "Continue the climb ▸" : "Start this verse ▸"}</button>
        <div class="cn-or">— or pick your own path to Floor ${qlog.length+1} —</div>
        <div class="choice-grid">
          ${choices.map(c=>{
            const d = difficultyForVerse(c.v);
            const cp = state.progress[c.v.id];
            const cStarted = (cp.stage||0) > 0;
            const safeV = safePassageHTML(c.v);
            return `
              <div class="choice-card ${c.cls}" data-id="${safeV.id}">
                <div class="cc-tag">${escHTML(c.tag)}</div>
                ${relicHTML(c.v, 62)}
                <div class="cc-info">
                  <div class="cc-ref">${safeV.ref}</div>
                  <div class="cc-theme">${safeV.topic}</div>
                  <div class="cc-meta">${d.emoji} ${d.label} · ${d.words} words${cStarted ? ` · ${shardsFor(cp)}/5 shards` : ""}</div>
                </div>
              </div>`;
          }).join("")}
        </div>
        <div class="qalt" id="questAlt">see the full tower ▸</div>
      </div>`;
  }

  html += `
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
            <div class="achv-prog">${t.cur}/${t.goal} ▸</div>
          </div>`).join("") + `</div>
          <div class="tt-sub" style="margin:8px 0 0;">Tap an achievement to jump straight to where you earn it.</div>`;
      })()}
      <div class="qalt" id="achvAll">See all achievements 🏆 ▸</div>
    </div>

    <div class="home-card">
      <h3><span class="spark">🗼</span> ${christian ? "Christian Scripture Paths" : "Current Seminary Paths"}</h3>
      <div class="tower-strip">
        ${activeCampaigns().filter(campaign=>christian || ["doctrinal","articles"].includes(campaign.group)).map(campaign=>{
          const s = towerStats(campaign.id);
          const safeCampaign = safeCampaignHTML(campaign);
          return `
            <div class="tstrip" data-campaign="${safeCampaign.id}" style="--thue:${campaign.hue}">
              <div class="ts-info">
                <div class="ts-name">${safeCampaign.name}</div>
                <div class="ts-count">${s.sealed}/${s.total} floors sealed${s.due?` · ${s.due} fading`:''}</div>
                <div class="ts-bar"><i style="width:${Math.round(s.pct*100)}%"></i></div>
              </div>
              <div class="ts-preview${s.sealed>=s.total?' full':''}"><img src="${towerArtPrefix(campaign)}assembled-preview.png" alt="" loading="lazy"></div>
            </div>`;
        }).join("")}
      </div>
      ${christian ? "" : `<div class="heritage-tease" id="heritageTowers"><strong>📜 The Heritage Collection</strong><br>The verses a generation grew up on. Still worth carrying. Explore all four retired Scripture Mastery towers ▸</div>`}
    </div>`;

  const recent = activePassages().filter(v=>state.progress[v.id].sealed)
    .sort((a,b)=>(state.progress[b.id].sealedAt||0)-(state.progress[a.id].sealedAt||0))
    .slice(0,6);
  html += `
    <div class="home-card">
      <h3><span class="spark">🏺</span> The Relic Shelf</h3>
      ${recent.length
        ? `<div class="shelf-strip">${recent.map(v=>`<div class="shelf-strip-item" data-id="${safePassageHTML(v).id}">${relicHTML(v,46)}</div>`).join("")}</div>
           <div class="qalt" id="shelfGo">Visit the trophy room ▸</div>`
        : `<div class="all-lit">Your shelf is empty — every relic still waits in the dark. Seal your first verse to claim one.</div>
           <button class="btn" id="shelfGo" style="margin-top:10px;">🏺 Go to the Relic Shelf ▸</button>`}
    </div>`;

  html += storageLineHTML();

  body.innerHTML = html;
  bindCheckinCard(body);
  if(started) bindDailyPathCard(body);
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
  if(heroTower) heroTower.onclick = ()=>{ view.tab = "towers"; view.campaignId = state.startingCampaignId; render(); window.scrollTo({top:0}); };
  const shelfGo = document.getElementById("shelfGo");
  if(shelfGo) shelfGo.onclick = ()=>{ view.tab = "shelf"; render(); window.scrollTo({top:0}); };
  body.querySelectorAll(".shelf-strip-item").forEach(el=>{
    el.onclick = ()=> openRelicPop(passageById(el.dataset.id));
  });
  const trialBtn = document.getElementById("trialBtn");
  if(trialBtn) trialBtn.onclick = ()=>{ view.tab = "trials"; view.trialRound = null; render(); window.scrollTo({top:0}); };
  const todayPhraseRef = document.getElementById("todayPhraseRef");
  if(todayPhraseRef) todayPhraseRef.onclick = ()=>{ view.tab="trials"; startPhraseDrill("phraseToRef"); };
  const todayRefPhrase = document.getElementById("todayRefPhrase");
  if(todayRefPhrase) todayRefPhrase.onclick = ()=>{ view.tab="trials"; startPhraseDrill("refToPhrase"); };
  body.querySelectorAll(".choice-card").forEach(el=>{
    el.onclick = ()=> openStudy(el.dataset.id, false);
  });
  const qb = document.getElementById("questBtn");
  if(qb) qb.onclick = ()=>{ const c = primaryCampaignForPassage(recommendedVerse().id, view.campaignId); view.tab = "towers"; view.campaignId = c.id; render(); window.scrollTo({top:0}); };
  const qa = document.getElementById("questAlt");
  if(qa) qa.onclick = ()=>{ const c = primaryCampaignForPassage(recommendedVerse().id, view.campaignId); view.campaignId = c.id; view.tab = "towers"; render(); };
  body.querySelectorAll(".review-item").forEach(el=>{
    el.onclick = ()=> openStudy(el.dataset.id, true);
  });
  body.querySelectorAll(".tstrip").forEach(el=>{
    el.onclick = ()=>{ view.campaignId = el.dataset.campaign; view.tab = "towers"; render(); };
  });
  const heritageTowers = document.getElementById("heritageTowers");
  if(heritageTowers) heritageTowers.onclick = ()=>{ view.campaignId=null; view.tab="towers"; render(); window.scrollTo({top:0}); };
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.greetingLine = greetingLine;
SQ.fmtKB = fmtKB;
SQ.storageLineHTML = storageLineHTML;
SQ.checkinCardHTML = checkinCardHTML;
SQ.bindCheckinCard = bindCheckinCard;
SQ.dpReasonFor = dpReasonFor;
SQ.dpTaskRowHTML = dpTaskRowHTML;
SQ.dailyPathCardHTML = dailyPathCardHTML;
SQ.bindDailyPathCard = bindDailyPathCard;
SQ.renderToday = renderToday;
