/* T10 pure key-phrase drill tests. Run: node tests/phrases.test.js */
const {PHRASE_DIRECTIONS, phrasePassages, phraseCard, phraseDeck} = require("../js/00-phrases.js");

let passed=0, failed=0;
function eq(name,actual,expected){
  const a=JSON.stringify(actual), e=JSON.stringify(expected);
  if(a===e) passed++;
  else { failed++; console.error(`FAIL: ${name}\n  expected ${e}\n  actual   ${a}`); }
}
function ok(name,value){ eq(name,!!value,true); }

const passages = [
  {id:"p_11111111",ref:"John 3:16",keyPhrase:"For God so loved the world."},
  {id:"p_22222222",ref:"James 1:5–6",keyPhrase:"If any of you lack wisdom, let him ask of God."},
  {id:"p_33333333",ref:"Unlisted 1:1",keyPhrase:null}
];

eq("two explicit directions are available", Object.keys(PHRASE_DIRECTIONS), ["phraseToRef","refToPhrase"]);
eq("only passages with official phrases enter the pool", phrasePassages(passages).map(p=>p.id), ["p_11111111","p_22222222"]);
const forward = phraseCard(passages[0],"phraseToRef");
eq("phrase-to-reference prompts with the phrase", forward.prompt, "For God so loved the world.");
eq("phrase-to-reference requires the reference", forward.answer, "John 3:16");
eq("phrase-to-reference labels the cue honestly", forward.promptLabel, "Which passage carries this key phrase?");
const reverse = phraseCard(passages[1],"refToPhrase");
eq("reference-to-phrase prompts with the reference", reverse.prompt, "James 1:5–6");
eq("reference-to-phrase requires the exact phrase", reverse.answer, "If any of you lack wisdom, let him ask of God.");
ok("cards are immutable", Object.isFrozen(forward) && Object.isFrozen(reverse));

const randomValues = [0.75,0.25];
const deck = phraseDeck(passages,"phraseToRef",10,()=>randomValues.shift() ?? 0);
eq("deck caps at eligible passage count", deck.length, 2);
eq("deck contains no passage twice", new Set(deck.map(c=>c.passageId)).size, 2);
ok("deck is immutable", Object.isFrozen(deck));
eq("zero size follows the default ten-card behavior", phraseDeck(passages,"refToPhrase",0,()=>0).length, 2);
eq("explicit one-card size is honored", phraseDeck(passages,"refToPhrase",1,()=>0).length, 1);
let badDirection=false;
try{ phraseCard(passages[0],"sideways"); }catch(error){ badDirection=/Unknown key-phrase direction/.test(error.message); }
ok("unknown directions fail loudly", badDirection);

console.log(`\n${passed} passed, ${failed} failed`);
if(failed) process.exit(1);
