/* 24-daily-plan.js — the Daily Path (T16)
   ===========================================================================
   Today used to be a stack of independent cards -- Fading Seals, Continue
   the Climb, Arena Quests -- each true on its own but none of them saying
   "do these, in this order, and you're done for today." This file builds
   that single ordered list.

   ensureDailyPlan() decides WHICH tasks and WHAT ORDER exactly once per
   local calendar day and persists that choice to state.dailyPlan, so a
   re-render (or a reload) never reshuffles what's already been decided —
   ROADMAP.md T16's "persisted task IDs so re-render doesn't reshuffle".
   dailyPlanFor() then re-derives each task's live STATUS from the real,
   current passage/quest state on every call. That split matters: identity
   and order are a one-time decision, but completion must reflect reality
   no matter which screen the learner actually did the work on — sealing a
   verse through Recall Check from Study, not just from tapping the Daily
   Path card, should still check the box.

   Task kinds, in priority order:
     rescue      up to 3 due seals, oldest first — required
     climb       one in-progress or recommended verse — required
     strengthen  up to 2 passages with real recorded trouble — optional
     victory     one of today's rotating Arena quests — optional

   Only rescue + climb count toward the visible finish line. Both route to
   a heart-free activity by default (Recall Check's typing is free; a study
   stage-advance pays a heart, never costs one) — ROADMAP.md T16's "required
   path completable without spending hearts" is true by construction, not
   by a special case here. */

const DAILY_REVIEW_LIMIT_DEFAULT = 10;
const DAILY_PLAN_RESCUE_MAX = 3;
const DAILY_PLAN_STRENGTHEN_MAX = 2;
const TROUBLE_WEIGHT_FLOOR = 0.12; // matches troubleHighlightsFor()'s own cutoff, js/00-learning.js

function ensureSettings(){
  if(!state.settings || typeof state.settings !== "object") state.settings = {};
  if(!Number.isFinite(state.settings.dailyReviewLimit) || state.settings.dailyReviewLimit < 1){
    state.settings.dailyReviewLimit = DAILY_REVIEW_LIMIT_DEFAULT;
  }
  return state.settings;
}

function troubleWeight(p){
  return Object.values((p && p.trouble) || {}).reduce((n, t) => n + (t.weight || 0), 0);
}

/* Passages with real, current trouble — not just "not sealed" — favoring
   whatever's been missed the most recently and the most often. */
function troublePassages(limit){
  return activePassages()
    .map(v => ({ v, weight: troubleWeight(state.progress[v.id]) }))
    .filter(x => x.weight >= TROUBLE_WEIGHT_FLOOR)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map(x => x.v);
}

/* What form of retrieval actually helps THIS passage right now. Not "how
   hard should this be" — how strong the evidence already is decides how
   much support to still offer:
     recognize  not sealed, early stage    — pick from options, low stakes
     build      not sealed, later stage    — reconstruct it, more support
     recall     sealed and due             — first-letter production, no cues
     recite     sealed, strong, not due    — the hardest honest test there is
   Used to route the Daily Path's own tasks to the right screen/mode, and
   to label them with a copy line that says why, not just what. Does not
   reach into Arena's own type rotation — that stays its own concern. */
function recommendedModeFor(v, p){
  if(!p.sealed) return (p.stage || 0) < 2 ? "recognize" : "build";
  return isDue(p) ? "recall" : "recite";
}

function buildDailyTasks(){
  const tasks = [];
  const limit = ensureSettings().dailyReviewLimit;
  dueReviews().slice(0, Math.min(DAILY_PLAN_RESCUE_MAX, limit)).forEach(v => {
    tasks.push({ id: `rescue:${v.id}:${localISODate()}`, kind: "rescue", passageId: v.id, required: true });
  });

  const climbTarget = recommendedVerse();
  if(climbTarget){
    const p = state.progress[climbTarget.id];
    tasks.push({
      id: `climb:${climbTarget.id}:${localISODate()}`, kind: "climb", passageId: climbTarget.id, required: true,
      startStage: p.stage || 0, startSealed: !!p.sealed
    });
  }

  troublePassages(DAILY_PLAN_STRENGTHEN_MAX).forEach(v => {
    tasks.push({
      id: `strengthen:${v.id}:${localISODate()}`, kind: "strengthen", passageId: v.id, required: false,
      startWeight: troubleWeight(state.progress[v.id])
    });
  });

  if(trialPool().length){
    const openQuest = ensureArenaQuests(ensureArena()).list.find(q => !q.done);
    if(openQuest){
      tasks.push({ id: `victory:${openQuest.id}:${localISODate()}`, kind: "victory", questId: openQuest.id, required: false });
    }
  }
  return tasks;
}

function ensureDailyPlan(){
  const today = localISODate();
  if(!state.dailyPlan || state.dailyPlan.date !== today){
    state.dailyPlan = { date: today, tasks: buildDailyTasks() };
  }
  return state.dailyPlan;
}

/* Live view of today's plan: same tasks, same order, fresh status. A task
   whose target no longer exists (a deleted custom passage, a quest that
   somehow vanished) is dropped from what's RETURNED, not from storage —
   the stored plan for today is otherwise left exactly as chosen. */
function dailyPlanFor(){
  return ensureDailyPlan().tasks.map(t => {
    if(t.kind === "victory"){
      const def = questDef(t.questId);
      if(!def) return null;
      const inst = ensureArenaQuests(ensureArena()).list.find(q => q.id === t.questId);
      return { ...t, status: (inst && inst.done) ? "complete" : "ready", def };
    }
    const v = passageById(t.passageId);
    if(!v) return null;
    const p = state.progress[v.id];
    let status = "ready";
    if(t.kind === "rescue") status = isDue(p) ? "ready" : "complete";
    else if(t.kind === "climb") status = ((p.sealed && !t.startSealed) || (p.stage || 0) > t.startStage) ? "complete" : "ready";
    else if(t.kind === "strengthen") status = troubleWeight(p) < t.startWeight ? "complete" : "ready";
    return { ...t, status, v, p, mode: t.kind !== "victory" ? recommendedModeFor(v, p) : null };
  }).filter(Boolean);
}

/* ---- SQ registry (see ROADMAP.md §7) ---- */
SQ.ensureSettings = ensureSettings;
SQ.troubleWeight = troubleWeight;
SQ.troublePassages = troublePassages;
SQ.recommendedModeFor = recommendedModeFor;
SQ.buildDailyTasks = buildDailyTasks;
SQ.ensureDailyPlan = ensureDailyPlan;
SQ.dailyPlanFor = dailyPlanFor;
