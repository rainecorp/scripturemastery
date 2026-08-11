/* 21-highlight.js
   Scripture Intelligence highlighting: roles, lexicon, phrases
   Extracted verbatim from index.html lines 6366-6529 by T2. */
/* ---- Scripture Intelligence highlighting --------------------------
   Multi-layer system: phrase highlights, meaningful word highlights,
   stem/variant matching, priority scoring, repeated-anchor support,
   and density controls so every passage is useful but not rainbow soup. */
const HL_ROLES = {
  deity:      {label:"Jesus Christ / God", color:"#F6D77A", priority:100},
  anchor:     {label:"Remember / Pray / Ask", color:"#D7ECFF", priority:76},
  foundation: {label:"Doctrine / Foundation", color:"#E8D9C7", priority:84},
  faith:      {label:"Faith / Revelation", color:"#E6DDFF", priority:82},
  love:       {label:"Love / Charity", color:"#FFDCE8", priority:80},
  command:    {label:"Invitation / Action", color:"#DDF4D7", priority:78},
  promise:    {label:"Promise / Blessing", color:"#D6F5E7", priority:88},
  warning:    {label:"Warning / Consequence", color:"#FFE0D6", priority:86},
  agency:     {label:"Agency / Choice", color:"#FFE8BF", priority:79},
  identity:   {label:"Identity / Family / Zion", color:"#D8F3F0", priority:77},
  prophecy:   {label:"Prophecy / Vision", color:"#E9E2FF", priority:81},
  temple:     {label:"Temple / Covenant", color:"#F3F0E6", priority:83}
};

const HL_LEXICON = [
  ["deity",100,["god","lord","christ","jesus","redeemer","savior","saviour","messiah","almighty","jehovah","lamb","mediator","advocate","creator","son"]],
  ["warning",86,["sin","wicked","wickedness","iniquity","transgression","tempt","captivity","condemn","destruction","destroy","death","dead","fall","fallen","carnal","evil","hell","misery","punishment","perish","pride","contention","deceive","apostasy"]],
  ["promise",88,["bless","protect","joy","eternal","strength","peace","life","power","reward","glory","salvation","exalt","deliver","prosper","inherit","receive","comfort","heal","resurrection","immortality","restoration"]],
  ["foundation",84,["foundation","rock","truth","doctrine","law","covenant","word","commandment","gospel","scripture","precept","principle","ordinance","atonement","plan","wisdom","knowledge","understanding"]],
  ["faith",82,["faith","hope","trust","witness","revelation","testimony","believe","belief","spirit","discern","assurance","vision","dream"]],
  ["love",80,["love","charity","kind","service","compassion","forgive","mercy","grace","meek","humble","patience","longsuffering","gentle","pure"]],
  ["identity",77,["zion","child","children","father","mother","family","soul","worth","unity","brethren","sister","people","saint","disciple","heir","image","likeness"]],
  ["agency",79,["choice","choose","chose","liberty","free","freedom","agency","decide","decision","accountable","act","entice"]],
  ["command",78,["obey","repent","follow","walk","stand","build","watch","labor","diligent","serve","keep","endure","seek","knock","study","ponder","read","teach","preach","testify","forsake","confess"]],
  ["anchor",76,["remember","ask","pray","call","cry","hearken","listen","look","come","arise","awake","behold","consider"]],
  ["prophecy",81,["prophet","prophesy","reveal","vision","seer","angel","last","days","kingdom","stone","restoration"]],
  ["temple",83,["temple","priesthood","authority","keys","seal","sealed","ordinance","baptism","gift","holy","sanctify","consecrate"]]
];

/* Stems intentionally cover scriptural inflections: remember/remembrance,
   pray/prayer/prayed, bless/blessings, repent/repentance, etc. */
function lexicalRoot(word){
  let w = word.toLowerCase().replace(/[^a-z']/g,"");
  const irregular = {men:"man",women:"woman",children:"child",fathers:"father",brethren:"brother",souls:"soul",chose:"choose",chosen:"choose",kept:"keep",built:"build",thoughts:"thought"};
  if(irregular[w]) return irregular[w];
  const special = [
    [/^remember/,"remember"],[/^prayer|^pray/,"pray"],[/^repent/,"repent"],
    [/^forgiv/,"forgive"],[/^believ/,"believe"],[/^bless/,"bless"],
    [/^command/,"commandment"],[/^scriptur/,"scripture"],[/^covenant/,"covenant"],
    [/^foundat/,"foundation"],[/^redeem/,"redeemer"],[/^salvat/,"salvation"],
    [/^resurrect/,"resurrection"],[/^revelat|^reveal/,"revelation"],
    [/^obedien|^obey/,"obey"],[/^tempt/,"tempt"],[/^destroy/,"destroy"],
    [/^condemn/,"condemn"],[/^exalt/,"exalt"],[/^deliver/,"deliver"],
    [/^strength/,"strength"],[/^serv/,"serve"],[/^endure/,"endure"],
    [/^testif/,"testify"],[/^prophe/,"prophecy"],[/^sanctif/,"sanctify"]
  ];
  for(const [re,root] of special) if(re.test(w)) return root;
  if(w.length>5 && w.endsWith("ing")) w=w.slice(0,-3);
  else if(w.length>4 && w.endsWith("ed")) w=w.slice(0,-2);
  else if(w.length>4 && w.endsWith("es")) w=w.slice(0,-2);
  else if(w.length>3 && w.endsWith("s")) w=w.slice(0,-1);
  return w;
}

const HL_WORD_MAP = (()=>{
  const m=new Map();
  HL_LEXICON.forEach(([role,priority,words])=>words.forEach(word=>{
    const root=lexicalRoot(word);
    const prior=m.get(root);
    if(!prior || priority>prior.priority) m.set(root,{role,priority});
  }));
  return m;
})();

/* Longest and most doctrinally meaningful phrases win. */
const HL_PHRASES = [
  ["the worth of souls is great in the sight of god","identity",100],
  ["by small and simple things are great things brought to pass","promise",98],
  ["the natural man is an enemy to god","warning",98],
  ["wickedness never was happiness","warning",98],
  ["rock of our redeemer who is christ","deity",100],
  ["whereon if men build they cannot fall","promise",97],
  ["it shall have no power over you","promise",97],
  ["ask of god that giveth to all men liberally","faith",96],
  ["faith without works is dead","faith",96],
  ["men are that they might have joy","promise",96],
  ["trust in the lord with all thine heart","faith",96],
  ["he shall direct thy paths","promise",94],
  ["weak things become strong","promise",94],
  ["keep my commandments","command",92],
  ["pray always","command",92],
  ["choose you this day whom ye will serve","agency",94],
  ["spirit of contention is not of me","warning",95],
  ["sure foundation","foundation",92],
  ["rock of our redeemer","deity",98],
  ["ask of god","faith",91],
  ["no other name","deity",94],
  ["condescension of god","deity",94],
  ["plan of salvation","foundation",94],
  ["atonement of jesus christ","deity",100],
  ["line upon line","foundation",90],
  ["precept upon precept","foundation",90],
  ["study it out in your mind","command",91],
  ["will of the father","deity",91],
  ["endure to the end","anchor",94],
  ["families can be together forever","identity",95],
  ["foundation of god","foundation",92],
  ["remember remember","anchor",93],
  ["mighty winds","warning",82],
  ["shafts in the whirlwind","warning",84],
  ["hail and mighty storm","warning",84]
].map(([phrase,role,priority])=>({raw:phrase, words:phrase.split(" "), role, priority})).sort((a,b)=>b.words.length-a.words.length || b.priority-a.priority);

function classifyVerse(text){
  const toks=tokenize(text);
  const words=[];
  let wIdx=0;
  toks.forEach(tok=>{ if(isWord(tok)){ words.push({idx:wIdx,clean:tok.toLowerCase().replace(/[^a-z']/g,""),root:lexicalRoot(tok)}); wIdx++; } });

  const candidates=[];
  words.forEach(w=>{
    const hit=HL_WORD_MAP.get(w.root);
    if(hit) candidates.push({start:w.idx,end:w.idx,role:hit.role,priority:hit.priority,type:"word"});
  });

  const occupiedByPhrase=new Set();
  HL_PHRASES.forEach(p=>{
    for(let i=0;i<=words.length-p.words.length;i++){
      let ok=true;
      for(let j=0;j<p.words.length;j++){
        if(words[i+j].root!==lexicalRoot(p.words[j])){ok=false;break;}
      }
      if(ok){
        const idxs=words.slice(i,i+p.words.length).map(w=>w.idx);
        if(idxs.some(x=>occupiedByPhrase.has(x))) continue;
        idxs.forEach(x=>occupiedByPhrase.add(x));
        candidates.push({start:idxs[0],end:idxs[idxs.length-1],role:p.role,priority:p.priority,type:"phrase"});
      }
    }
  });

  const count=words.length;
  const maxHighlighted=Math.max(2,Math.min(Math.ceil(count*.45), count<12?4:count<28?9:14));
  const selected=new Map();

  /* Phrase spans always receive first consideration. */
  candidates.filter(c=>c.type==="phrase").sort((a,b)=>b.priority-a.priority || (b.end-b.start)-(a.end-a.start)).forEach(c=>{
    for(let i=c.start;i<=c.end;i++) selected.set(i,{role:c.role,priority:c.priority,type:"phrase"});
  });

  /* Preserve repeated structural anchors, especially remember/foundation. */
  const repeats=new Map();
  words.forEach(w=>repeats.set(w.root,(repeats.get(w.root)||0)+1));
  candidates.filter(c=>c.type==="word").sort((a,b)=>b.priority-a.priority).forEach(c=>{
    if(selected.has(c.start)) return;
    const root=words.find(w=>w.idx===c.start)?.root;
    const structural=root && ["remember","foundation","rock","pray","ask","choose","serve"].includes(root);
    if(selected.size<maxHighlighted || (structural && repeats.get(root)>1)) selected.set(c.start,{role:c.role,priority:c.priority,type:"word"});
  });

  /* Coverage safeguard: every passage gets at least one meaningful span. */
  if(!selected.size && words.length){
    const stop=new Set(["the","and","of","to","a","in","that","is","it","for","with","on","be","ye","shall","unto","his","he","they","them","this"]);
    const fallback=words.find(w=>!stop.has(w.clean) && w.clean.length>3) || words[0];
    selected.set(fallback.idx,{role:"anchor",priority:55,type:"fallback"});
  }
  return {selected};
}

/* ---- SQ registry (generated by T2 split; see ROADMAP.md §7) ---- */
SQ.HL_ROLES = HL_ROLES;
SQ.HL_LEXICON = HL_LEXICON;
SQ.lexicalRoot = lexicalRoot;
SQ.HL_WORD_MAP = HL_WORD_MAP;
SQ.HL_PHRASES = HL_PHRASES;
SQ.classifyVerse = classifyVerse;
