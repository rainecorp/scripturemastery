(function(){
  // Deterministic DOM + computed-style fingerprint of every screen.
  //
  // Purpose: prove a refactor changed nothing. Written for T2 (the mechanical
  // split) and kept because every later ticket wants the same guarantee.
  //
  // Protocol — run from the page console, or javascript_tool:
  //
  //   1. seed:    (function(){const x=new XMLHttpRequest();
  //               x.open("GET","/tests/seed-fixture.js",false);x.send();
  //               return eval(x.responseText);})()
  //   2. reload   (cache-bust: location.replace("/index.html?n="+Date.now()))
  //   3. capture: sessionStorage.setItem("__fpBEFORE", <run this file>)
  //   4. make the change
  //   5. seed + reload again, run this file, diff against __fpBEFORE.
  //
  // Every key must match. `_meta.scripts` and `_meta.sheets` are the only
  // legitimate exceptions when the change is a file split.
  //
  // Steps 1 and 2 are not optional: this harness mutates state as it renders
  // (Prove It awards XP), so a second run over a first run's state will differ
  // for reasons that have nothing to do with the code under test.
  //
  // NOTE: results are only comparable within the same day. The fixture's
  // review due-dates are relative to now, so hashes shift at midnight. Capture
  // the before and the after in one sitting; do not check a baseline in.

  function h(s){                       // FNV-1a, two offsets, 64-bit-ish
    let a = 0x811c9dc5, b = 0x01000193;
    for(let i=0;i<s.length;i++){
      const c = s.charCodeAt(i);
      a ^= c; a = Math.imul(a, 0x01000193) >>> 0;
      b = (b + c) >>> 0; b = Math.imul(b, 0x85ebca6b) >>> 0; b ^= b >>> 13;
    }
    return (a>>>0).toString(16).padStart(8,"0") + (b>>>0).toString(16).padStart(8,"0");
  }

  // Freeze randomness so arena question generation is reproducible.
  let seed = 123456789;
  const realRandom = Math.random;
  Math.random = function(){ seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

  // Freeze measured storage. T4 put a live "Storage used: N KB" line at the
  // foot of Today, and N depends on whatever else is in localStorage at the
  // moment of capture — including this harness's own baseline blobs. Left
  // alone it changes the Today hash for reasons that have nothing to do with
  // the code under test, and worse, it often changes it WITHOUT changing the
  // length, which is exactly the kind of drift that looks like a real
  // regression. Same treatment as Math.random: pin it, restore it after.
  const realStorageUsed = window.storageUsedBytes;
  if(typeof realStorageUsed === "function") window.storageUsedBytes = function(){ return 123456; };

  const out = {};
  const APP = document.getElementById("app");
  const grab = (el) => el ? h(el.innerHTML) + ":" + el.innerHTML.length : "ABSENT";

  function snap(name, fn, el){
    try { fn(); out[name] = grab(el || APP); }
    catch(e){ out[name] = "ERROR: " + e.message; }
  }

  const passages = allPassages();
  const V = ref => passages.find(v=>v.ref===ref) || passages[0];

  // ---- main tabs ----------------------------------------------------------
  snap("today",        ()=>{ view.tab="today";  view.campaignId=null; render(); });
  snap("towers",       ()=>{ view.tab="towers"; view.campaignId=null; render(); });
  snap("tower.bom",    ()=>{ view.tab="towers"; view.campaignId="camp_retired_bom"; render(); });
  snap("tower.nt",     ()=>{ view.tab="towers"; view.campaignId="camp_retired_nt"; render(); });
  snap("tower.dc",     ()=>{ view.tab="towers"; view.campaignId="camp_retired_dc"; render(); });
  snap("tower.ot",     ()=>{ view.tab="towers"; view.campaignId="camp_retired_ot"; render(); });
  snap("shelf",        ()=>{ view.tab="shelf";  view.campaignId=null; render(); });

  // ---- collection, every filter ------------------------------------------
  libraryFilters().forEach(f=>{
    snap("library."+f.id, ()=>{ view.tab="library"; view.filter=f.id; render(); });
  });

  // ---- study, every stage, sealed + unsealed + review mode ----------------
  ["1 Nephi 3:7","Alma 32:21","John 3:5","D&C 121:34–36"].forEach(ref=>{
    const v = V(ref);
    [0,1,2,3,4].forEach(stg=>{
      snap(`study.${v.id}.s${stg}`, ()=>{
        view.tab="study"; view.passageId=v.id; view.stage=stg;
        view.blanked=new Set(); view.reviewMode=false; view.highlightMode=true;
        render();
      });
    });
    snap(`study.${v.id}.hl-off`, ()=>{
      view.tab="study"; view.passageId=v.id; view.stage=1;
      view.blanked=new Set(); view.highlightMode=false; render();
    });
    snap(`study.${v.id}.review`, ()=>{
      view.tab="study"; view.passageId=v.id; view.stage=4;
      view.blanked=new Set(); view.reviewMode=true; view.highlightMode=true; render();
    });
  });

  // ---- arena --------------------------------------------------------------
  snap("arena.setup", ()=>{ view.tab="trials"; view.trialRound=null; render(); });
  snap("arena.setup.settings", ()=>{ view.tab="trials"; view.arenaSettingsOpen=true; render(); });
  snap("arena.setup.stats",    ()=>{ view.tab="trials"; view.arenaSettingsOpen=false; view.arenaStatsOpen=true; render(); });
  snap("arena.setup.badges",   ()=>{ view.tab="trials"; view.arenaStatsOpen=false; view.arenaBadgesOpen=true; render(); });
  view.arenaBadgesOpen=false;

  // one question of every type, rendered in a live session
  ARENA_TYPES.forEach(type=>{
    snap("arena.q."+type, ()=>{
      seed = 987654321;
      const T = makeArenaRound({kind:"quick", label:"Quick"});
      T.qs = [buildArenaQuestion(V("1 Nephi 3:7"), type, ARENA_DIFF[ensureArena().difficulty])];
      T.i = 0;
      view.tab="trials"; view.trialRound = T; render();
    });
  });

  snap("arena.results", ()=>{
    seed = 55555;
    const T = makeArenaRound({kind:"quick", label:"Quick"});
    T.done = true; T.correct = 5; T.score = 420; T.bestCombo = 4;
    T.campaignsTouched = new Set(["camp_retired_bom"]);
    view.tab="trials"; view.trialRound = T; render();
  });
  view.trialRound = null;

  // ---- overlays -----------------------------------------------------------
  snap("overlay.achv",  ()=>{ openAchvPop(); },  document.getElementById("achvPop"));
  snap("overlay.relic", ()=>{ openRelicPop(V("1 Nephi 3:7")); }, document.getElementById("relicPop"));
  snap("overlay.prove", ()=>{
    seed = 24680;
    openProveIt ? openProveIt(V("1 Nephi 3:7")) : startProveIt(V("1 Nephi 3:7"));
  }, document.getElementById("proveIt"));

  // ---- pure functions over every passage ---------------------------------
  let vHTML = "", chunks = "", tokens = "", nums = "", cls = "";
  passages.forEach(v=>{
    const marks = verseNumberMap(v);
    [0,1,2,3].forEach(s=>{ vHTML += renderVerseHTML(v.text, s, new Set(), marks, true); });
    vHTML  += renderVerseHTML(v.text, 1, pickBlankSet(v.text, .3), marks, false);
    chunks += JSON.stringify(chunkVerse(v.text));
    tokens += tokenize(v.text).length + "|" + v.text.split(/\s+/).length + ";";
    nums   += JSON.stringify(marks) + numberedVerseText(v);
    cls    += JSON.stringify(classifyVerse(v.text));
  });
  out["fn.renderVerseHTML"] = h(vHTML) + ":" + vHTML.length;
  out["fn.chunkVerse"]      = h(chunks) + ":" + chunks.length;
  out["fn.tokenize"]        = h(tokens) + ":" + tokens.length;
  out["fn.verseNumbers"]    = h(nums) + ":" + nums.length;
  out["fn.classifyVerse"]   = h(cls) + ":" + cls.length;
  out["fn.difficulty"]      = h(passages.map(v=>difficultyLabelForVerse(v)+difficultyForVerse(v).tier).join("|"));
  out["fn.passageIds"]      = h(passages.map(v=>v.id).join("|"));
  out["fn.relicHTML"]       = h(passages.map(v=>relicHTML(v,64)).join(""));

  // ---- computed styles ----------------------------------------------------
  // Rule COUNT alone would not catch a cascade-order regression, and splitting
  // one <style> into several <link>s is exactly the change that could cause
  // one. So resolve real styles on real elements, on the screens that own them.
  const PROBE_PROPS = ["display","position","color","background-color","background-image",
    "font-family","font-size","font-weight","line-height","letter-spacing","padding","margin",
    "border-radius","border","box-shadow","width","height","flex-direction","grid-template-columns",
    "gap","z-index","opacity","transform","overflow","text-align","white-space"];

  function probe(label, setup, selectors){
    try { setup(); } catch(e){ out["css."+label] = "SETUP ERROR: "+e.message; return; }
    let acc = "";
    selectors.forEach(sel=>{
      const el = document.querySelector(sel);
      if(!el){ acc += sel + "=MISSING;"; return; }
      const cs = getComputedStyle(el);
      acc += sel + "{" + PROBE_PROPS.map(p=>p+":"+cs.getPropertyValue(p)).join(";") + "}";
    });
    out["css."+label] = h(acc) + ":" + acc.length;
  }

  probe("today", ()=>{ view.tab="today"; view.campaignId=null; render(); },
    ["header.top",".brand h1",".rank-chip",".rank-bar-track i","nav.tabs","nav.tabs button",
     "nav.tabs button.active",".stat",".stat .n","#body",".wrap"]);
  probe("towers", ()=>{ view.tab="towers"; view.campaignId=null; render(); }, ["#body",".card","#body > *"]);
  probe("tower.detail", ()=>{ view.tab="towers"; view.campaignId="camp_retired_bom"; render(); },
    [".tower-cols",".tv-layer",".tv-viewport","#body img"]);
  probe("shelf",  ()=>{ view.tab="shelf";  view.campaignId=null; render(); }, [".shelf-head","#body",".relic"]);
  probe("library",()=>{ view.tab="library"; view.filter="all"; render(); },
    [".legend-row",".legend-pill",".filter-chip","#body"]);
  probe("study",  ()=>{ view.tab="study"; view.passageId=V("1 Nephi 3:7").id; view.stage=1;
                        view.blanked=new Set(); render(); },
    ["#body",".w",".btn",".btn.primary"]);
  probe("arena",  ()=>{ view.tab="trials"; view.trialRound=null; render(); },
    [".arena-setup",".mode-grid",".btn.primary","#body"]);
  probe("overlays", ()=>{ openAchvPop(); openRelicPop(V("1 Nephi 3:7")); },
    ["#achvPop",".relic-pop-stage","#relicPop",".cer"]);
  try { closeRelicPop(); } catch(e){}
  document.querySelectorAll(".cer").forEach(el=>el.style.display="");

  // ---- inventory ----------------------------------------------------------
  out["_meta.verses"]  = String(passages.length);
  out["_meta.scripts"] = String(document.scripts.length);
  out["_meta.sheets"]  = String(document.styleSheets.length);
  out["_meta.cssRules"] = String([...document.styleSheets].reduce((n,s)=>{
    try { return n + s.cssRules.length; } catch(e){ return n; }
  },0));

  Math.random = realRandom;
  if(typeof realStorageUsed === "function") window.storageUsedBytes = realStorageUsed;
  view.tab = "today"; view.campaignId = null; view.trialRound = null;
  return JSON.stringify(out, Object.keys(out).sort(), 1);
})();
