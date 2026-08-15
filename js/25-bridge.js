/* 25-bridge.js
   username-system bridge (usernames.html)
   Extracted verbatim from index.html lines 6918-6981 by T2. */
/* =========================================================
   Username-system bridge (usernames.html)
   - New visitor (no climber, no save, hasn't chosen guest):
     welcome gate → create a username or continue as guest.
   - Guest with progress: floating "Save your progress" pill →
     usernames.html?claim=1 (creates a profile and adopts the
     guest save under it).
   ========================================================= */
(function(){
  const USERNAMES_URL = "usernames.html";
  if(CLIMBER) return; // signed in — nothing to do
  const hasGuestSave = HAD_SAVE_AT_BOOT;
  const guestOk = localStorage.getItem("sq_guestOk") === "1";

  if(!hasGuestSave && !guestOk){
    const gate = document.createElement("div");
    gate.id = "userGate";
    gate.innerHTML = `
      <style>
        #userGate{position:fixed; inset:0; z-index:400; background:rgba(10,7,24,.88);
          backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:20px;}
        #userGate .gcard{max-width:420px; width:100%; background:linear-gradient(180deg,#2c2352,#221a3e);
          border:1px solid #3a2f66; border-radius:20px; padding:26px 22px; text-align:center;
          box-shadow:0 20px 60px rgba(0,0,0,.5); color:#f3eeff; font-family:inherit;}
        #userGate h2{margin:0 0 6px; font-size:20px; color:#ffdf8e;}
        #userGate p{margin:0 0 18px; font-size:13.5px; color:#a89cc8; line-height:1.5;}
        #userGate .gbtn{display:block; width:100%; border:none; border-radius:14px; padding:14px;
          font-size:15px; font-weight:800; cursor:pointer; margin:8px 0;
          background:linear-gradient(180deg,#ffdf8e,#f5c04a); color:#3a2a00;}
        #userGate .gbtn.ghost{background:none; border:1px solid #3a2f66; color:#a89cc8; font-weight:600;}
      </style>
      <div class="gcard">
        <h2>⚔️ Welcome, climber!</h2>
        <p>Pick a scripture-hero username so your climb is saved under your own name — or just start exploring.</p>
        <button class="gbtn" id="gateCreate">✨ Choose my scripture username</button>
        <button class="gbtn ghost" id="gateGuest">Continue as guest</button>
      </div>`;
    document.body.appendChild(gate);
    document.getElementById("gateCreate").onclick = ()=>{ location.href = USERNAMES_URL; };
    document.getElementById("gateGuest").onclick = ()=>{
      localStorage.setItem("sq_guestOk","1");
      gate.remove();
      addSavePill();
    };
    return;
  }
  addSavePill();

  function addSavePill(){
    const pill = document.createElement("div");
    pill.id = "savePill";
    pill.innerHTML = `
      <style>
        #savePill{position:fixed; right:12px; bottom:calc(96px + env(safe-area-inset-bottom,0px));
          z-index:120; background:linear-gradient(180deg,#ffdf8e,#f5c04a); color:#3a2a00;
          font:700 12.5px -apple-system,"Segoe UI",Roboto,sans-serif; padding:10px 14px;
          border-radius:999px; cursor:pointer; box-shadow:0 8px 24px rgba(0,0,0,.4);}
        @media(min-width:641px){ #savePill{bottom:18px;} }
        /* D4 (ROADMAP.md section 8 "Defects found in flight", found in T14 QA):
           every full-screen overlay in the app is a sibling .cer element
           at z-index:80 -- Recall Check, Prove It, the seal ceremony,
           relic/achievement/share pop. This pill sits above all of them
           (z-index:120), so on a narrow viewport it doesn't just visually
           cover whatever overlay content lands under its fixed
           bottom-right position, it genuinely eats the tap. The app is
           headed for iOS/Play too, where a blocked on-screen control is
           the whole interaction, not a keyboard-only inconvenience.
           Hiding the pill whenever any .cer is open is simpler and
           safer than auditing every overlay's own z-index, and it covers
           overlays added after this fix with no further changes. */
        body:has(.cer.show) #savePill{ display:none; }
      </style>
      💾 Save your progress`;
    pill.onclick = ()=>{ location.href = USERNAMES_URL + "?claim=1"; };
    document.body.appendChild(pill);
  }
})();
