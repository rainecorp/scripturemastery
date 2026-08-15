/* 00-phrases.js — pure bidirectional key-phrase drill logic (T10)
   No state or DOM. The UI in 15-arena-views.js consumes these immutable
   prompt cards, and Node tests exercise both directions directly. */

const PHRASE_DIRECTIONS = Object.freeze({
  phraseToRef: Object.freeze({
    id:"phraseToRef", label:"Phrase → Reference", promptLabel:"Which passage carries this key phrase?",
    answerLabel:"Reference"
  }),
  refToPhrase: Object.freeze({
    id:"refToPhrase", label:"Reference → Phrase", promptLabel:"What is the official key scripture phrase?",
    answerLabel:"Key scripture phrase"
  })
});

function phrasePassages(passages){
  return (passages || []).filter(p=>p && p.keyPhrase && p.ref);
}

function phraseCard(passage, direction){
  const config = PHRASE_DIRECTIONS[direction];
  if(!config) throw new Error(`Unknown key-phrase direction: ${direction}`);
  return Object.freeze({
    passageId:passage.id,
    direction,
    label:config.label,
    promptLabel:config.promptLabel,
    prompt:direction === "phraseToRef" ? passage.keyPhrase : passage.ref,
    answerLabel:config.answerLabel,
    answer:direction === "phraseToRef" ? passage.ref : passage.keyPhrase
  });
}

function phraseDeck(passages, direction, size, randomFn){
  const random = randomFn || Math.random;
  const pool = phrasePassages(passages).slice();
  for(let i=pool.length-1;i>0;i--){
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const count = Math.max(0, Math.min(Number(size) || 10, pool.length));
  return Object.freeze(pool.slice(0, count).map(p=>phraseCard(p, direction)));
}

if(typeof module !== "undefined" && module.exports){
  module.exports = {PHRASE_DIRECTIONS, phrasePassages, phraseCard, phraseDeck};
}
if(typeof SQ !== "undefined"){
  SQ.PHRASE_DIRECTIONS = PHRASE_DIRECTIONS;
  SQ.phrasePassages = phrasePassages;
  SQ.phraseCard = phraseCard;
  SQ.phraseDeck = phraseDeck;
}
