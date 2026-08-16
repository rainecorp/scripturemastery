/* 28-classroom.js — Classroom Mode (T18)
   ===========================================================================
   "The highest-frequency real use of scripture mastery is a teacher running
   a five-minute review game on a projector, and it's the distribution
   channel: one teacher brings 25 students." (ROADMAP.md T18)

   This is a full-screen takeover, not a `.cer` popup and not routed through
   the normal view.tab -> render() pipeline: a teacher projecting this wants
   ONLY the game on screen, not the header, XP bar, or nav tabs. It owns its
   own state (`classroomState`, module-local, deliberately NOT persisted —
   a live game is a one-time event, not progress to resume) and its own
   render loop.

   THE GAME: the room answers a prompt out loud together, the teacher (at
   the keyboard, watching the same screen) reveals the correct answer, then
   presses which team got it — or that nobody did. There is no per-student
   input device and no way to know who spoke first except by the person
   running the room, so scoring is teacher-judged by design, not typed or
   tapped by individual students. "Reference-and-phrase rounds" (ROADMAP's
   own words) map onto the three existing RECOGNITION reference types --
   text2ref, ref2text, theme2ref -- reused here as bare prompt/answer pairs.
   The newer typed-production types (refFromText/refFromTheme, T15) and the
   multi-step puzzle types (buildVerse, wordScramble, pairMatch) all assume
   one individual working a keyboard or tapping through steps, which has no
   meaning for a room answering in chorus -- wrong shape for this screen,
   not merely unused.

   GROUPS (the ticket's second half, "local group assignment with
   completion tracking"): this app has no accounts and no per-student
   devices, so there is no way to *automatically* know whether a group
   finished its assigned work. What's built is what's honestly buildable
   without that: a small local roster the teacher maintains and checks off
   by hand, persisted in state.classroom.groups so it survives a reload
   the same way everything else in this app does. */

const CLASSROOM_ROUND_LEN = 12;
const CLASSROOM_PROMPT_SECONDS = 20;
const CLASSROOM_TYPES = ["text2ref", "ref2text", "theme2ref"];
const CLASSROOM_TEAM_COLORS = ["#f4b942", "#22d3ee", "#a78bfa", "#34d399"];

let classroomState = null; // {phase, teamCount, teams, qs, i, timeLeft, timerHandle}

/* ---- question generation: bare prompt/answer, no options to click ------- */

function buildClassroomQuestion(v, type){
  if(type === "ref2text"){
    return { type, v, promptLabel: "How does it begin?", prompt: v.ref, answerLabel: v.topic, answer: trialSnippet(v.text, 20) };
  }
  if(type === "theme2ref"){
    return { type, v, promptLabel: "Which scripture teaches…", prompt: `“${v.topic}”`, answerLabel: "Reference", answer: v.ref };
  }
  return { type, v, promptLabel: "Whose words are these?", prompt: `“${trialSnippet(v.text, 26)}”`, answerLabel: "Reference", answer: v.ref };
}

function makeClassroomRound(){
  const pool = trialPool().length ? trialPool() : activePassages();
  const seq = shuffleArr(pool).slice(0, Math.min(CLASSROOM_ROUND_LEN, pool.length));
  return seq.map((v, i) => buildClassroomQuestion(v, CLASSROOM_TYPES[i % CLASSROOM_TYPES.length]));
}

/* ---- groups: a local, hand-maintained roster ----------------------------- */

function ensureClassroomGroups(){
  if(!state.classroom || typeof state.classroom !== "object") state.classroom = {};
  if(!Array.isArray(state.classroom.groups)) state.classroom.groups = [];
  return state.classroom.groups;
}
function addClassroomGroup(){
  const groups = ensureClassroomGroups();
  groups.push({ id: "grp_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name: `Group ${groups.length+1}`, campaignId: null, complete: false });
  saveState();
}
function removeClassroomGroup(id){
  const groups = ensureClassroomGroups();
  const idx = groups.findIndex(g => g.id === id);
  if(idx >= 0) groups.splice(idx, 1);
  saveState();
}
function renameClassroomGroup(id, name){
  const g = ensureClassroomGroups().find(x => x.id === id);
  if(g) g.name = String(name || "").slice(0, 40) || g.name;
  saveState();
}
function assignClassroomGroup(id, campaignId){
  const g = ensureClassroomGroups().find(x => x.id === id);
  if(g) g.campaignId = campaignId || null;
  saveState();
}
function toggleClassroomGroupComplete(id){
  const g = ensureClassroomGroups().find(x => x.id === id);
  if(g) g.complete = !g.complete;
  saveState();
}

/* ---- lifecycle ------------------------------------------------------------ */

function openClassroom(){
  classroomState = { phase: "setup", teamCount: 2 };
  document.removeEventListener("keydown", classroomKeyHandler);
  document.addEventListener("keydown", classroomKeyHandler);
  renderClassroom();
}
function closeClassroom(){
  if(classroomState && classroomState.timerHandle) clearInterval(classroomState.timerHandle);
  const el = document.getElementById("classroom");
  if(el){ el.classList.remove("show"); el.innerHTML = ""; }
  classroomState = null;
  document.removeEventListener("keydown", classroomKeyHandler);
}
function startClassroomGame(teamCount){
  if(classroomState && classroomState.timerHandle) clearInterval(classroomState.timerHandle);
  classroomState = {
    phase: "live", teamCount,
    teams: Array.from({length: teamCount}, (_, i) => ({ name: `Team ${i+1}`, score: 0, color: CLASSROOM_TEAM_COLORS[i] })),
    qs: makeClassroomRound(), i: 0, timeLeft: CLASSROOM_PROMPT_SECONDS, timerHandle: null
  };
  classroomStartTimer();
  renderClassroom();
}
function classroomStartTimer(){
  if(classroomState.timerHandle) clearInterval(classroomState.timerHandle);
  classroomState.timeLeft = CLASSROOM_PROMPT_SECONDS;
  classroomState.timerHandle = setInterval(() => {
    if(!classroomState || classroomState.phase !== "live") return;
    classroomState.timeLeft -= 1;
    if(classroomState.timeLeft <= 0){ classroomReveal(); return; }
    const bar = document.getElementById("roomTimerBar");
    if(bar) bar.style.width = Math.max(0, (classroomState.timeLeft / CLASSROOM_PROMPT_SECONDS) * 100) + "%";
  }, 1000);
}
function classroomReveal(){
  if(!classroomState || classroomState.qs[classroomState.i].revealed) return;
  if(classroomState.timerHandle){ clearInterval(classroomState.timerHandle); classroomState.timerHandle = null; }
  classroomState.qs[classroomState.i].revealed = true;
  SFX.pick();
  renderClassroom();
}
function classroomAward(teamIndex){
  if(!classroomState || !classroomState.qs[classroomState.i].revealed) return;
  if(teamIndex != null && classroomState.teams[teamIndex]){
    classroomState.teams[teamIndex].score += 1;
    SFX.correct(1);
  } else {
    SFX.tap();
  }
  classroomAdvance();
}
function classroomAdvance(){
  classroomState.i += 1;
  if(classroomState.i >= classroomState.qs.length){ classroomFinish(); return; }
  classroomStartTimer();
  renderClassroom();
}
function classroomFinish(){
  if(classroomState.timerHandle){ clearInterval(classroomState.timerHandle); classroomState.timerHandle = null; }
  classroomState.phase = "end";
  SFX.fanfare(); FX.rain({count:90});
  renderClassroom();
}

function classroomKeyHandler(e){
  if(!classroomState) return;
  if(e.ctrlKey || e.metaKey || e.altKey) return;
  if(classroomState.phase === "setup"){
    if(e.key >= "2" && e.key <= "4"){ classroomState.teamCount = Number(e.key); renderClassroom(); return; }
    if(e.key === "Enter"){ e.preventDefault(); startClassroomGame(classroomState.teamCount); return; }
    if(e.key === "Escape"){ e.preventDefault(); closeClassroom(); }
    return;
  }
  if(classroomState.phase === "groups"){
    if(e.key === "Escape"){ e.preventDefault(); classroomState.phase = "setup"; renderClassroom(); }
    return;
  }
  if(classroomState.phase === "live"){
    if(e.key === "Escape"){ e.preventDefault(); classroomFinish(); return; }
    const q = classroomState.qs[classroomState.i];
    if(!q.revealed){
      if(e.key === " " || e.key === "Enter"){ e.preventDefault(); classroomReveal(); }
      return;
    }
    if(e.key === "0"){ e.preventDefault(); classroomAward(null); return; }
    const n = Number(e.key);
    if(Number.isInteger(n) && n >= 1 && n <= classroomState.teamCount){ e.preventDefault(); classroomAward(n-1); }
    return;
  }
  if(classroomState.phase === "end"){
    if(e.key === "Escape" || e.key === "Enter"){ e.preventDefault(); closeClassroom(); }
  }
}

/* ---- rendering ------------------------------------------------------------ */

function renderClassroom(){
  const el = document.getElementById("classroom");
  if(!el || !classroomState) return;
  el.classList.add("show");
  if(classroomState.phase === "setup") return renderClassroomSetup(el);
  if(classroomState.phase === "groups") return renderClassroomGroups(el);
  if(classroomState.phase === "live") return renderClassroomLive(el);
  if(classroomState.phase === "end") return renderClassroomEnd(el);
}

function renderClassroomSetup(el){
  const n = classroomState.teamCount;
  el.innerHTML = `
    <div class="room-stage room-setup">
      <button class="room-exit" id="roomExit" aria-label="Exit classroom mode">✕</button>
      <div class="room-kicker">🏫 Classroom Mode</div>
      <h1>How many teams?</h1>
      <div class="room-team-picker" role="group" aria-label="Number of teams">
        ${[2,3,4].map(c => `<button class="room-team-btn ${c===n?'active':''}" data-count="${c}">${c}</button>`).join("")}
      </div>
      <button class="room-start" id="roomStart">Start the review ▸</button>
      <div class="room-groups-link" id="roomGroupsLink">Manage local groups ▸</div>
      <div class="room-hint">Press 2–4 to choose, Enter to start, Esc to exit</div>
    </div>`;
  document.getElementById("roomExit").onclick = closeClassroom;
  document.getElementById("roomStart").onclick = () => startClassroomGame(classroomState.teamCount);
  document.getElementById("roomGroupsLink").onclick = () => { classroomState.phase = "groups"; renderClassroom(); };
  el.querySelectorAll(".room-team-btn").forEach(btn => {
    btn.onclick = () => { classroomState.teamCount = Number(btn.dataset.count); renderClassroom(); };
  });
}

function renderClassroomGroups(el){
  const groups = ensureClassroomGroups();
  const campaigns = activeCampaigns();
  el.innerHTML = `
    <div class="room-stage room-groups">
      <button class="room-exit" id="roomExit" aria-label="Back to classroom setup">✕</button>
      <div class="room-kicker">🏫 Local Groups</div>
      <h1>Track who's working on what</h1>
      <p class="room-groups-note">Kept on this device only — add a group, point it at a campaign, and check it off when you've seen their work.</p>
      <div class="room-group-list">
        ${groups.length ? groups.map(g => `
          <div class="room-group-row ${g.complete?'complete':''}" data-id="${escHTML(g.id)}">
            <input class="room-group-name" data-id="${escHTML(g.id)}" value="${escHTML(g.name)}" maxlength="40">
            <select class="room-group-assign" data-id="${escHTML(g.id)}">
              <option value="">No assignment</option>
              ${campaigns.map(c => `<option value="${escHTML(c.id)}" ${g.campaignId===c.id?"selected":""}>${escHTML(c.name)}</option>`).join("")}
            </select>
            <button class="room-group-done" data-id="${escHTML(g.id)}">${g.complete ? "✓ Done" : "Mark done"}</button>
            <button class="room-group-remove" data-id="${escHTML(g.id)}" aria-label="Remove group">✕</button>
          </div>`).join("") : `<div class="room-groups-empty">No groups yet.</div>`}
      </div>
      <button class="btn" id="roomAddGroup">+ Add group</button>
      <div class="room-hint">Esc to go back</div>
    </div>`;
  document.getElementById("roomExit").onclick = () => { classroomState.phase = "setup"; renderClassroom(); };
  document.getElementById("roomAddGroup").onclick = () => { addClassroomGroup(); renderClassroomGroups(el); };
  el.querySelectorAll(".room-group-name").forEach(input => {
    input.onchange = () => { renameClassroomGroup(input.dataset.id, input.value); };
  });
  el.querySelectorAll(".room-group-assign").forEach(sel => {
    sel.onchange = () => { assignClassroomGroup(sel.dataset.id, sel.value); };
  });
  el.querySelectorAll(".room-group-done").forEach(btn => {
    btn.onclick = () => { toggleClassroomGroupComplete(btn.dataset.id); renderClassroomGroups(el); };
  });
  el.querySelectorAll(".room-group-remove").forEach(btn => {
    btn.onclick = () => { removeClassroomGroup(btn.dataset.id); renderClassroomGroups(el); };
  });
}

function roomScoreboardHTML(){
  return `<div class="room-scoreboard">
    ${classroomState.teams.map(t => `<div class="room-team-score" style="--tc:${t.color}"><span class="room-team-name">${escHTML(t.name)}</span><span class="room-team-n">${t.score}</span></div>`).join("")}
  </div>`;
}

function renderClassroomLive(el){
  const { qs, i, teams } = classroomState;
  const q = qs[i];
  el.innerHTML = `
    <div class="room-stage room-live">
      <button class="room-exit" id="roomExit" aria-label="End the review">✕</button>
      ${roomScoreboardHTML()}
      <div class="room-progress">Question ${i+1} of ${qs.length}</div>
      <div class="room-timer-wrap"><div class="room-timer-bar" id="roomTimerBar" style="width:${Math.max(0,(classroomState.timeLeft/CLASSROOM_PROMPT_SECONDS)*100)}%"></div></div>
      <div class="room-prompt-label">${escHTML(q.promptLabel)}</div>
      <div class="room-prompt">${escHTML(q.prompt)}</div>
      ${q.revealed ? `
        <div class="room-answer-label">${escHTML(q.answerLabel)}</div>
        <div class="room-answer">${escHTML(q.answer)}</div>
        <div class="room-award-row">
          ${teams.map((t,ti) => `<button class="room-award-btn" data-team="${ti}" style="--tc:${t.color}">${escHTML(t.name)}</button>`).join("")}
          <button class="room-award-btn room-award-none" data-team="none">No one</button>
        </div>
        <div class="room-hint">Press 1–${teams.length} for the team, 0 for no one</div>
      ` : `
        <button class="room-reveal-btn" id="roomReveal">Reveal the answer ▸</button>
        <div class="room-hint">Space or Enter to reveal · Esc to end early</div>
      `}
    </div>`;
  document.getElementById("roomExit").onclick = classroomFinish;
  const reveal = document.getElementById("roomReveal");
  if(reveal) reveal.onclick = classroomReveal;
  el.querySelectorAll(".room-award-btn[data-team]").forEach(btn => {
    btn.onclick = () => classroomAward(btn.dataset.team === "none" ? null : Number(btn.dataset.team));
  });
}

function renderClassroomEnd(el){
  const ranked = classroomState.teams.map((t,i) => ({...t, i})).sort((a,b) => b.score - a.score);
  const top = ranked[0].score;
  const winners = ranked.filter(t => t.score === top);
  el.innerHTML = `
    <div class="room-stage room-end">
      <button class="room-exit" id="roomExit" aria-label="Exit classroom mode">✕</button>
      <div class="room-kicker">🏆 Review complete</div>
      <h1>${winners.length>1 ? "It's a tie!" : escHTML(winners[0].name) + " wins!"}</h1>
      <div class="room-final-scores">
        ${ranked.map(t => `<div class="room-final-row ${t.score===top?'winner':''}" style="--tc:${t.color}"><span>${escHTML(t.name)}</span><span>${t.score}</span></div>`).join("")}
      </div>
      <div class="room-end-btns">
        <button class="room-start" id="roomAgain">Play again ▸</button>
        <button class="btn" id="roomExitBtn">Exit to Arena</button>
      </div>
      <div class="room-hint">Enter or Esc to exit</div>
    </div>`;
  const exit = () => closeClassroom();
  document.getElementById("roomExit").onclick = exit;
  document.getElementById("roomExitBtn").onclick = exit;
  document.getElementById("roomAgain").onclick = () => startClassroomGame(classroomState.teamCount);
}

/* ---- SQ registry (see ROADMAP.md §7) ---- */
SQ.buildClassroomQuestion = buildClassroomQuestion;
SQ.makeClassroomRound = makeClassroomRound;
SQ.ensureClassroomGroups = ensureClassroomGroups;
SQ.addClassroomGroup = addClassroomGroup;
SQ.removeClassroomGroup = removeClassroomGroup;
SQ.renameClassroomGroup = renameClassroomGroup;
SQ.assignClassroomGroup = assignClassroomGroup;
SQ.toggleClassroomGroupComplete = toggleClassroomGroupComplete;
SQ.openClassroom = openClassroom;
SQ.closeClassroom = closeClassroom;
SQ.startClassroomGame = startClassroomGame;
SQ.classroomReveal = classroomReveal;
SQ.classroomAward = classroomAward;
SQ.classroomKeyHandler = classroomKeyHandler;
SQ.renderClassroom = renderClassroom;
Object.defineProperty(SQ, "classroomState", { get:()=>classroomState, set:v=>{classroomState=v;}, enumerable:true, configurable:true });
