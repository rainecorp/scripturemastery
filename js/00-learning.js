/* 00-learning.js — graded learning events, SM-2 scheduling, trouble positions
   ==========================================================================
   Pure enough for Node tests; loaded after 00-tokenize.js in the browser.

   Scheduling follows Piotr Wozniak's published SM-2 algorithm: response
   grades map to the original 0–5 quality scale, the first intervals are 1
   and 6 days, later intervals multiply by the E-Factor, and failed recall
   resets repetitions. Source: https://www.super-memory.com/english/ol/sm2.htm

   `displayStrength()` is intentionally NOT used by the scheduler. It is a
   friendly accuracy/experience display only. The scheduler reads `p.srs`;
   the seal ladder reads stability buckets; neither reads display strength.
   ========================================================================== */

const LEARNING_LOG_LIMIT = 200;
const ETERNAL_POLISH_DAYS = 180;
const LEARNING_GRADES = Object.freeze(["again","hard","good","easy"]);
const SM2_QUALITY = Object.freeze({again:1, hard:3, good:4, easy:5});

const LearningTokens = (typeof tokenWords === "function")
  ? {tokenWords, normWords, spanByWords}
  : (typeof require === "function" ? require("./00-tokenize.js") : null);

function learningAggregate(){
  return {total:0,correct:0,byGrade:{again:0,hard:0,good:0,easy:0},byMode:{},firstAt:null,lastAt:null};
}
function normalizeLearningGrade(grade){
  return LEARNING_GRADES.includes(grade) ? grade : "again";
}
function normalizeSrs(srs){
  const value=srs||{};
  return {
    algorithm:"sm2",
    repetitions:Math.max(0,Number(value.repetitions)||0),
    intervalDays:Math.max(0,Number(value.intervalDays)||0),
    easeFactor:Math.max(1.3,Number(value.easeFactor)||2.5),
    stabilityDays:Math.max(0,Number(value.stabilityDays)||Number(value.intervalDays)||0),
    lastGrade:value.lastGrade||null,
    lastReviewedAt:Number(value.lastReviewedAt)||null,
    dueAt:Number(value.dueAt)||null
  };
}
function sm2Review(previous, grade, now){
  const prior=normalizeSrs(previous);
  const normalized=normalizeLearningGrade(grade);
  const quality=SM2_QUALITY[normalized];
  let repetitions=prior.repetitions;
  let intervalDays=prior.intervalDays;
  if(quality<3){
    repetitions=0;
    intervalDays=1;
  }else{
    if(repetitions===0) intervalDays=1;
    else if(repetitions===1) intervalDays=6;
    else intervalDays=Math.ceil(Math.max(1,intervalDays)*prior.easeFactor);
    repetitions+=1;
  }
  const easeFactor=Math.max(1.3,prior.easeFactor+(0.1-(5-quality)*(0.08+(5-quality)*0.02)));
  const at=Number(now)||Date.now();
  /* SM-2 asks failed items again in the same session. T15 owns intra-session
     spacing, so `again` remains due now instead of falsely polishing a seal. */
  const dueAt=normalized==="again" ? at : at+intervalDays*86400000;
  return {algorithm:"sm2",repetitions,intervalDays,easeFactor,
    stabilityDays:intervalDays,lastGrade:normalized,lastReviewedAt:at,dueAt};
}
function reviewLevelForStability(stabilityDays, ladder){
  const days=Math.max(0,Number(stabilityDays)||0);
  return (ladder||[]).reduce((count,threshold)=>days>=threshold?count+1:count,0);
}
function ensurePassageLearning(progress){
  if(!progress.learning || typeof progress.learning!=="object") progress.learning=learningAggregate();
  if(!progress.learning.byGrade) progress.learning.byGrade={again:0,hard:0,good:0,easy:0};
  if(!progress.learning.byMode) progress.learning.byMode={};
  if(!progress.trouble || typeof progress.trouble!=="object") progress.trouble={};
  if(progress.sealed && !progress.srs){
    const legacyInterval=Math.max(1,Math.round(((progress.nextReviewAt||Date.now())-Date.now())/86400000));
    progress.srs=normalizeSrs({repetitions:progress.reviews||0,intervalDays:legacyInterval,
      stabilityDays:legacyInterval,lastReviewedAt:progress.lastReviewAt||progress.sealedAt,
      dueAt:progress.nextReviewAt});
  }
  return progress;
}
function updateAggregate(aggregate,grade,mode,correct,at){
  aggregate.total=(aggregate.total||0)+1;
  aggregate.correct=(aggregate.correct||0)+(correct?1:0);
  aggregate.byGrade=aggregate.byGrade||{again:0,hard:0,good:0,easy:0};
  aggregate.byGrade[grade]=(aggregate.byGrade[grade]||0)+1;
  aggregate.byMode=aggregate.byMode||{};
  aggregate.byMode[mode]=(aggregate.byMode[mode]||0)+1;
  aggregate.firstAt=aggregate.firstAt||at;
  aggregate.lastAt=at;
}
function validPositions(values,max){
  return [...new Set((values||[]).map(Number).filter(n=>Number.isInteger(n)&&n>=0&&(max==null||n<max)))];
}
function updateTrouble(progress,troublePositions,attemptedPositions,at,max){
  ensurePassageLearning(progress);
  const trouble=new Set(validPositions(troublePositions,max));
  const attempted=new Set(validPositions(attemptedPositions,max));
  trouble.forEach(index=>attempted.add(index));
  attempted.forEach(index=>{
    const key=String(index);
    const prior=progress.trouble[key];
    if(trouble.has(index)){
      progress.trouble[key]={misses:(prior?.misses||0)+1,successes:prior?.successes||0,
        weight:Math.min(9,(prior?.weight||0)+1),lastAt:at};
    }else if(prior){
      const weight=(prior.weight||0)*0.72;
      if(weight<0.12) delete progress.trouble[key];
      else progress.trouble[key]={...prior,successes:(prior.successes||0)+1,weight,lastAt:at};
    }
  });
}
function recordLearningAttempt(state,passageId,attempt,options){
  options=options||{}; attempt=attempt||{};
  const progress=state&&state.progress&&state.progress[passageId];
  if(!progress) throw new Error(`Cannot record learning for missing passage ${passageId}`);
  ensurePassageLearning(progress);
  if(!Array.isArray(state.learningLog)) state.learningLog=[];
  if(!state.learningLifetime || typeof state.learningLifetime!=="object") state.learningLifetime=learningAggregate();
  const id=String(attempt.id||"");
  if(id && (progress.learning.lastAttemptId===id || state.learningLog.some(e=>e.id===id))) return {recorded:false};
  const at=Number(attempt.at)||Date.now();
  const grade=normalizeLearningGrade(attempt.grade);
  const correct=attempt.correct==null ? grade!=="again" : !!attempt.correct;
  const mode=String(attempt.mode||"practice");
  const max=Number.isInteger(options.wordCount)?options.wordCount:null;
  const troublePositions=validPositions(attempt.troublePositions,max);
  const attemptedPositions=validPositions(attempt.attemptedPositions,max);
  const event={id:id||`la_${at}_${Math.random().toString(36).slice(2,8)}`,at,passageId,mode,grade,correct,
    troublePositions,durationMs:Math.max(0,Number(attempt.durationMs)||0)};
  state.learningLog.push(event);
  if(state.learningLog.length>LEARNING_LOG_LIMIT) state.learningLog.splice(0,state.learningLog.length-LEARNING_LOG_LIMIT);
  updateAggregate(state.learningLifetime,grade,mode,correct,at);
  updateAggregate(progress.learning,grade,mode,correct,at);
  progress.learning.lastAttemptId=event.id;
  updateTrouble(progress,troublePositions,attemptedPositions,at,max);
  let schedule=null;
  if(progress.sealed && options.schedule!==false){
    if(options.eternal){
      progress.nextPolishAt=at+ETERNAL_POLISH_DAYS*86400000;
    }else{
      schedule=sm2Review(progress.srs,grade,at);
      progress.srs=schedule;
      progress.nextReviewAt=schedule.dueAt;
    }
  }
  return {recorded:true,event,schedule};
}
function displayStrength(progress){
  const a=progress&&progress.learning;
  if(!a||!a.total) return 0;
  const accuracy=(a.correct||0)/a.total;
  const experience=1-Math.exp(-a.total/8);
  return Math.round(100*accuracy*(0.55+0.45*experience));
}
function troubleHighlightsFor(progress){
  const selected=new Map();
  Object.entries((progress&&progress.trouble)||{}).forEach(([key,value])=>{
    const index=Number(key),weight=Number(value&&value.weight)||0;
    if(Number.isInteger(index)&&index>=0&&weight>=0.12){
      selected.set(index,{type:"trouble",role:"trouble",priority:Math.min(100,55+weight*8),weight});
    }
  });
  return {selected};
}
function troublePhraseWindow(text,index,radius){
  const words=LearningTokens.tokenWords(text);
  const target=Math.max(0,Math.min(words.length-1,Number(index)||0));
  const side=Math.max(3,Math.min(5,Number(radius)||4));
  const start=Math.max(0,target-side),end=Math.min(words.length,target+side+1);
  const phrase=LearningTokens.spanByWords(text,start,end).trim();
  const cue=words.slice(start,end).map(t=>`${t.firstLetter}…`).join(" ");
  return {start,end,target,positions:words.slice(start,end).map(t=>t.index),phrase,cue};
}
function troublePositionsForPhraseAttempt(window,input){
  const expected=LearningTokens.normWords(window.phrase);
  const actual=LearningTokens.normWords(input);
  const out=[];
  for(let i=0;i<expected.length;i++) if(expected[i]!==actual[i]) out.push(window.start+i);
  return out;
}

if(typeof module!=="undefined"&&module.exports){
  module.exports={LEARNING_LOG_LIMIT,ETERNAL_POLISH_DAYS,LEARNING_GRADES,SM2_QUALITY,
    learningAggregate,normalizeLearningGrade,normalizeSrs,sm2Review,reviewLevelForStability,
    ensurePassageLearning,recordLearningAttempt,displayStrength,troubleHighlightsFor,
    troublePhraseWindow,troublePositionsForPhraseAttempt};
}
if(typeof SQ!=="undefined"){
  Object.assign(SQ,{LEARNING_LOG_LIMIT,ETERNAL_POLISH_DAYS,LEARNING_GRADES,SM2_QUALITY,
    learningAggregate,normalizeLearningGrade,normalizeSrs,sm2Review,reviewLevelForStability,
    ensurePassageLearning,recordLearningAttempt,displayStrength,troubleHighlightsFor,
    troublePhraseWindow,troublePositionsForPhraseAttempt});
}
