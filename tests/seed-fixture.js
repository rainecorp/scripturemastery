/* tests/seed-fixture.js
   Writes a fixed mid-progress save to localStorage, then the caller reloads.
   Used with tests/fingerprint.js so a before/after comparison is exact:
   same XP, same streak, same seals, same due dates relative to today.

   Run from the page console (or via javascript_tool):
     (function(){const x=new XMLHttpRequest();x.open("GET","/tests/seed-fixture.js",false);x.send();return eval(x.responseText);})()
   then reload. */
(function(){
  const D = 86400000, now = Date.now();
  const iso = d => new Date(d - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const s = (lvl, offDays) => ({
    stage:4, sealed:true, sealedAt: now - 20*D, reviewLevel:lvl, reviews:lvl,
    nextReviewAt: now + offDays*D, provenIt: lvl > 1
  });
  const st = {
    xp:1240, streak:6, bestStreak:9, lastDay:new Date().toDateString(),
    shields:1, shares:2, resealsTotal:5, sound:true, achv:{unlocked:{}},
    calendar: Object.fromEntries([0,1,2,3,4,5].map(i=>[iso(now - i*D), {a:1,c:1}])),
    progress: {
      "v_1_nephi_3_7":     s(2,-1),   // due now
      "v_2_nephi_2_25":    s(1, 3),
      "v_2_nephi_32_3":    s(0, 1),
      "v_mosiah_2_17":     s(3,12),
      "v_alma_32_21":      {stage:2, sealed:false},
      "v_helaman_5_12":    {stage:1, sealed:false},
      "v_john_3_5":        s(6,90),   // eternal
      "v_matthew_5_14_16": s(1,-2),   // due now
      "v_dandc_6_36":      s(0, 5),
      "v_moses_1_39":      {stage:3, sealed:false}
    },
    climb: {
      "Book of Mormon":["v_1_nephi_3_7","v_2_nephi_2_25","v_2_nephi_32_3","v_mosiah_2_17"],
      "New Testament":["v_john_3_5","v_matthew_5_14_16"],
      "Doctrine and Covenants":["v_dandc_6_36"],
      "Old Testament":[]
    },
    /* Pin today's Arena quests. ensureArenaQuests() otherwise picks three at
       random on every fresh day, which makes Today and the Arena setup screen
       differ between runs for reasons that have nothing to do with the code
       under test. Pinning them is what makes the fingerprint deterministic. */
    arena: {
      difficulty:"normal",
      hearts:3,
      quests: {
        date: new Date().toDateString(),
        list: [
          {id:"ref_hunter", progress:2, goal:5, done:false},
          {id:"builder",    progress:8, goal:8, done:true},
          {id:"onfire",     progress:3, goal:8, done:false}
        ]
      },
      questBadges: [{id:"builder", name:"Verse Builder", emoji:"🧩", chest:9, earnedAt: now - 3600000}],
      score:{total:2400, best:610}, streakBest:7,
      stats:{sessions:4, totalAnswered:52, totalCorrect:41, hintsUsed:3, resealedCount:2, byType:{}},
      blitz:{played:2, best:14}
    }
  };
  localStorage.setItem("sq_guestOk","1");
  localStorage.setItem("lineUponLine_v1", JSON.stringify(st));
  return "seeded — now reload";
})();
