/* T13 learning-event, SM-2, trouble-position, and strength contracts. */
const L=require("../js/00-learning.js");
let passed=0,failed=0;
function ok(name,value){if(value)passed++;else{failed++;console.error("FAIL:",name);}}
function eq(name,actual,expected){const a=JSON.stringify(actual),e=JSON.stringify(expected);if(a===e)passed++;else{failed++;console.error(`FAIL: ${name}\n expected ${e}\n actual   ${a}`);}}

const DAY=86400000, t0=1700000000000;
let s=L.sm2Review(null,"good",t0);
eq("SM-2 first successful interval is one day",s.intervalDays,1);
s=L.sm2Review(s,"good",t0+DAY);
eq("SM-2 second successful interval is six days",s.intervalDays,6);
const established=s;
const hard=L.sm2Review(established,"hard",t0+7*DAY);
const good=L.sm2Review(established,"good",t0+7*DAY);
const easy=L.sm2Review(established,"easy",t0+7*DAY);
/* In canonical SM-2 the current interval uses the prior E-Factor; the grade
   updates E-Factor and therefore changes the following interval. */
const afterHard=L.sm2Review(hard,"good",t0+20*DAY);
const afterGood=L.sm2Review(good,"good",t0+20*DAY);
const afterEasy=L.sm2Review(easy,"good",t0+20*DAY);
ok("next interval varies by prior grade",afterHard.intervalDays<afterGood.intervalDays&&afterGood.intervalDays<afterEasy.intervalDays);
const again=L.sm2Review(established,"again",t0+7*DAY);
eq("again resets successful repetitions",again.repetitions,0);
eq("again remains due for same-session relearning",again.dueAt,t0+7*DAY);
ok("SM-2 ease never falls below 1.3",Array.from({length:30}).reduce(v=>L.sm2Review(v,"again",t0),established).easeFactor>=1.3);
eq("stability maps through the visual ladder",[1,6,15,95].map(n=>L.reviewLevelForStability(n,[1,3,7,14,30,90])),[1,2,4,6]);

const state={progress:{p_test:{stage:4,sealed:true,reviewLevel:0}},learningLog:[],learningLifetime:L.learningAggregate()};
for(let i=0;i<205;i++) L.recordLearningAttempt(state,"p_test",{id:`q${i}`,at:t0+i,mode:"arena",grade:i%2?"good":"again",correct:i%2===1,
  troublePositions:i===0?[2]:[],attemptedPositions:[2]},{wordCount:5});
eq("learning log is bounded at 200",state.learningLog.length,200);
eq("bounded log drops oldest event",state.learningLog[0].id,"q5");
eq("lifetime aggregate never drops events",state.learningLifetime.total,205);
eq("per-passage aggregate never drops events",state.progress.p_test.learning.total,205);
eq("one event ID updates aggregates once",L.recordLearningAttempt(state,"p_test",{id:"q204",mode:"arena",grade:"easy"},{wordCount:5}).recorded,false);
eq("duplicate event leaves lifetime count unchanged",state.learningLifetime.total,205);
ok("trouble is keyed by numeric word position",Object.keys(state.progress.p_test.trouble).every(k=>/^\d+$/.test(k)));

const repeated={progress:{p_repeat:{sealed:false}},learningLog:[],learningLifetime:L.learningAggregate()};
L.recordLearningAttempt(repeated,"p_repeat",{id:"repeat",mode:"recall",grade:"hard",correct:true,
  troublePositions:[1],attemptedPositions:[0,1,2]},{wordCount:3,schedule:false});
eq("only the exact repeated-word position is marked",Object.keys(repeated.progress.p_repeat.trouble),["1"]);
eq("trouble highlight keeps the exact position",[...L.troubleHighlightsFor(repeated.progress.p_repeat).selected.keys()],[1]);

const window=L.troublePhraseWindow("one faith two faith three faith four faith five",3,4);
eq("phrase drill keeps 3–5 words on either side when available",window.phrase,"one faith two faith three faith four faith");
eq("phrase window targets the requested repeated occurrence",window.target,3);
eq("exact phrase has no trouble positions",L.troublePositionsForPhraseAttempt(window,window.phrase),[]);
eq("wrong repeated occurrence maps by position",L.troublePositionsForPhraseAttempt(window,"one faith two hope three faith four faith"),[3]);

const weak={learning:{total:1,correct:1}},strong={learning:{total:12,correct:12}};
ok("display strength grows with clean experience",L.displayStrength(strong)>L.displayStrength(weak));
const before=L.sm2Review(established,"good",t0);
L.displayStrength({learning:{total:999,correct:999}});
eq("display strength cannot alter scheduling",L.sm2Review(established,"good",t0),before);

const eternal={progress:{p_e:{sealed:true,reviewLevel:6,srs:established}},learningLog:[],learningLifetime:L.learningAggregate()};
L.recordLearningAttempt(eternal,"p_e",{id:"polish",at:t0,mode:"polish",grade:"again",correct:false},{wordCount:0,eternal:true});
eq("Eternal miss schedules only optional polish",eternal.progress.p_e.nextPolishAt,t0+180*DAY);
eq("Eternal miss never lowers visual rung",eternal.progress.p_e.reviewLevel,6);

console.log(`\n${passed} passed, ${failed} failed`);
if(failed)process.exit(1);
