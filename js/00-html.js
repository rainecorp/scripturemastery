/* 00-html.js — the single boundary for plain text entering HTML (T11)
   ==========================================================================
   Builtin content is reviewed, but custom content and imported saves are not.
   Every passage/campaign string interpolated into innerHTML must pass through
   escHTML(), safePassageHTML(), or safeCampaignHTML(). Raw text is retained in
   state so tokenization, recall, editing, and export remain exact.

   Explicit markup allowlist: these helpers may intentionally return HTML.
   - renderVerseHTML / numberedVerseText: escape every source token themselves.
   - relicHTML / chestImg / condBadgeHTML / difficultyLabelForVerse: emit only
     app-owned markup and fixed metadata; they never interpolate user strings.
   - renderFilterPanelHTML / arenaHeartsHTML: emit only app-owned controls.
   All other user-authored values are plain text and use this file's boundary.
   ========================================================================= */
function escHTML(value){
  return String(value == null ? "" : value)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function safePassageHTML(passage){
  const p = passage || {};
  return Object.freeze({
    id:escHTML(p.id), ref:escHTML(p.ref), topic:escHTML(p.topic),
    book:escHTML(p.book), keyPhrase:escHTML(p.keyPhrase), text:escHTML(p.text)
  });
}

function safeCampaignHTML(campaign){
  const c = campaign || {};
  return Object.freeze({
    id:escHTML(c.id), name:escHTML(c.name), shortName:escHTML(c.shortName),
    subtitle:escHTML(c.subtitle), tag:escHTML(c.tag), icon:escHTML(c.icon)
  });
}

const TRUSTED_MARKUP_HELPERS = Object.freeze([
  "renderVerseHTML","numberedVerseText","relicHTML","chestImg",
  "condBadgeHTML","difficultyLabelForVerse","renderFilterPanelHTML","arenaHeartsHTML"
]);

if(typeof module !== "undefined" && module.exports){
  module.exports = {escHTML, safePassageHTML, safeCampaignHTML, TRUSTED_MARKUP_HELPERS};
}
if(typeof SQ !== "undefined"){
  SQ.escHTML = escHTML;
  SQ.safePassageHTML = safePassageHTML;
  SQ.safeCampaignHTML = safeCampaignHTML;
  SQ.TRUSTED_MARKUP_HELPERS = TRUSTED_MARKUP_HELPERS;
}
