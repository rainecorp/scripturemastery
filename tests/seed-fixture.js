/* tests/seed-fixture.js
   Writes a fixed mid-progress save to localStorage, then the caller reloads.
   Used with tests/fingerprint.js so a before/after comparison is exact:
   same XP, same streak, same seals, same due dates relative to today.

   Open /tests/seed-fixture.html, or run from the page console:
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
    schemaVersion:3, track:"seminary", translation:"lds2013", startingCampaignId:"camp_dm_bom",
    onboardingComplete:true, onboardingChoice:"seminary",
    xp:1240, streak:6, bestStreak:9, lastDay:new Date().toDateString(),
    shields:1, shares:2, resealsTotal:5, sound:true, achv:{unlocked:{}},
    calendar: Object.fromEntries([0,1,2,3,4,5].map(i=>[iso(now - i*D), {a:1,c:1}])),
    progress: {
      "p_05aa9da7": s(2,-1),   // 1 Nephi 3:7 — due now
      "p_de9f74d8": s(1, 3),   // 2 Nephi 2:25
      "p_4e057f38": s(0, 1),   // 2 Nephi 32:3
      "p_a0035b2c": s(3,12),   // Mosiah 2:17
      "p_84f05c78": {stage:2, sealed:false}, // Alma 32:21
      "p_d3fb452d": {stage:1, sealed:false}, // Helaman 5:12
      "p_fd2f227d": s(6,90),   // John 3:5 — eternal
      "p_23b0f988": s(1,-2),   // Matthew 5:14–16 — due now
      "p_66e12a62": s(0, 5),   // D&C 8:2–3
      "p_b549f0a6": {stage:3, sealed:false}  // Moses 1:39
    },
    climb: {
      "camp_dm_bom":["p_05aa9da7","p_de9f74d8","p_4e057f38","p_a0035b2c"],
      "camp_dm_nt":["p_23b0f988","p_fd2f227d"],
      "camp_dm_dc":["p_66e12a62"],
      "camp_dm_ot":[],
      "camp_aof":[],
      "camp_retired_bom":["p_05aa9da7","p_de9f74d8","p_4e057f38","p_a0035b2c"],
      "camp_retired_nt":["p_fd2f227d","p_23b0f988"],
      "camp_retired_dc":["p_66e12a62"],
      "camp_retired_ot":[]
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
