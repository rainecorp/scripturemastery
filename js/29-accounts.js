/* 29-accounts.js — Billing Slice 1: accounts, profiles, auth
   ===========================================================================
   Loaded only by account.html today. index.html is not changed by this
   slice and stays 100% network-free — every path in this app must keep
   working offline and over file://, and that guarantee is easiest to keep
   by simply not giving index.html a reason to touch the network yet. When
   Slice 3 (entitlement) needs index.html to ask "does this account have
   Pro," this file is what it will load too — see the shape of Accounts
   below, kept deliberately reusable rather than account.html-specific.

   This is identity only, not sync. A signed-in account controls WHO a save
   belongs to; the save itself still lives in this browser's localStorage,
   exactly as before Slice 1. See docs/INVENTORY.md §12.
   =========================================================================== */

/* TODO(owner): replace with your real project values — Project Settings ->
   API in the Supabase dashboard (see supabase/README.md). The anon key is
   safe to embed client-side by design: every table it can reach is gated by
   the Row Level Security policies in
   supabase/migrations/0001_accounts_and_profiles.sql. The service_role key
   is a different thing entirely and must never appear in this file or any
   file that ships to a browser. */
const SUPABASE_URL = "REPLACE_WITH_YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "REPLACE_WITH_YOUR_SUPABASE_ANON_KEY";

function accountsConfigured(){
  return !/^REPLACE_WITH_/.test(SUPABASE_URL) && !/^REPLACE_WITH_/.test(SUPABASE_ANON_KEY);
}

/* window.supabase is the UMD global from the CDN script account.html loads
   before this file. Guarded so this file does nothing destructive if either
   the CDN script failed to load or the placeholders above are still in
   place — account.html checks Accounts.configured() and shows a plain
   notice instead of broken forms in that state. */
const sb = (accountsConfigured() && typeof window !== "undefined" && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const Accounts = {
  configured(){ return !!sb; },

  async session(){
    if(!sb) return null;
    const {data} = await sb.auth.getSession();
    return data.session || null;
  },

  /* Returns an unsubscribe function. Fires on sign-in, sign-out, and token
     refresh — account.html's render loop treats every call as "re-check
     where we are," not just the first one. */
  onAuthChange(fn){
    if(!sb) return function(){};
    const {data:sub} = sb.auth.onAuthStateChange((_event, session)=>fn(session));
    return function(){ sub.subscription.unsubscribe(); };
  },

  async signUpWithEmail(email, password){
    if(!sb) throw new Error("Accounts aren't set up yet.");
    const {data, error} = await sb.auth.signUp({email, password});
    if(error) throw error;
    return data;
  },

  async signInWithEmail(email, password){
    if(!sb) throw new Error("Accounts aren't set up yet.");
    const {data, error} = await sb.auth.signInWithPassword({email, password});
    if(error) throw error;
    return data;
  },

  /* Redirects away; there is nothing meaningful to return. Preserves the
     current URL's query string (in particular ?claim=1) so the guest-save
     claim flow survives the round trip to Google and back. */
  async signInWithGoogle(){
    if(!sb) throw new Error("Accounts aren't set up yet.");
    const {error} = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.href }
    });
    if(error) throw error;
  },

  async signOut(){
    if(!sb) return;
    await sb.auth.signOut();
  },

  /* Every account gets an 'adult' profile automatically at sign-up (see the
     on_auth_user_created trigger in the migration) — this lists every
     profile under the signed-in account, oldest first, so the adult profile
     sorts first. */
  async listProfiles(){
    if(!sb) return [];
    const {data, error} = await sb.from("profiles").select("*").order("created_at");
    if(error) throw error;
    return data || [];
  },

  /* displayName MUST be drawn from account.html's curated hero allowlist —
     ROADMAP.md §5.6: a child profile carries no free text, ever. That rule
     is enforced by the caller (account.html never offers a text field for a
     child's name), not by this function or by the database — see the
     KNOWN GAP note in the migration file. */
  async addChildProfile(heroId, displayName){
    if(!sb) throw new Error("Accounts aren't set up yet.");
    const {data:{session}} = await sb.auth.getSession();
    if(!session) throw new Error("Sign in first.");
    const {data, error} = await sb.from("profiles").insert({
      account_id: session.user.id, kind: "child", hero_id: heroId, display_name: displayName
    }).select().single();
    if(error) throw error;
    return data;
  },

  async renameProfile(profileId, displayName){
    if(!sb) throw new Error("Accounts aren't set up yet.");
    const {data, error} = await sb.from("profiles").update({display_name: displayName})
      .eq("id", profileId).select().single();
    if(error) throw error;
    return data;
  },

  async removeProfile(profileId){
    if(!sb) throw new Error("Accounts aren't set up yet.");
    const {error} = await sb.from("profiles").delete().eq("id", profileId);
    if(error) throw error;
  }
};

/* ---- Local-save claim ----
   Same move as usernames.html's old adoptGuestSave(), same safety guard
   (never overwrites an existing save under the target name): the guest
   save is not touched at all unless nothing already lives at the
   destination key. Slice 1 ships identity, not sync, so the save itself
   still lives only in this browser's localStorage — this just moves it
   from the anonymous key to the namespaced key for a specific profile,
   exactly like choosing a username used to. */
function claimGuestSaveFor(displayName){
  try{
    const guest = localStorage.getItem("lineUponLine_v1");
    const targetKey = "lineUponLine_v1::" + displayName;
    if(guest && !localStorage.getItem(targetKey)){
      localStorage.setItem(targetKey, guest);
      localStorage.removeItem("lineUponLine_v1");
      return true;
    }
  }catch(e){}
  return false;
}

/* index.html's CLIMBER (js/03-state.js) still reads a plain ?climber=<name>
   query param and namespaces localStorage by that literal string — this
   slice deliberately does not touch that. See docs/INVENTORY.md §11: it's a
   safe, working mechanism, and rewiring it to something account-aware
   (a profile id rather than a display name, so two children who both pick
   "Nephi" can't collide in localStorage) is real, separate work that
   deserves its own careful pass and full regression run, not a rider on
   the commit that introduces network calls to this codebase for the
   first time. */
function enterTowerAs(displayName){
  try{ localStorage.setItem("sq_activeClimber", displayName); }catch(e){}
  location.href = "index.html?climber=" + encodeURIComponent(displayName);
}
