# Scripture Quest — AI Handoff Doc

Single-file gamified scripture-memorization app. Everything lives in `index.html` (CSS + JS inline, no build step, no dependencies). Assets are relative-path folders beside it. Open `index.html` in a browser to run; keep the folder together. (`.claude/launch.json` starts a local `python3 -m http.server 8483` for previewing — sharing-image generation needs http(s), not file://.)

> **July 18 mega-update** ("glorious" pass): WebAudio SFX engine + canvas confetti, daily check-in / habit calendar with claimable blessing chest, streak tiers + shields + milestones, 28-badge app-wide achievement system with overlay + Top-5 card, share system (canvas share-card image + Web Share/clipboard), playable quest cards (tap a quest → focused round of its type), 2 new Arena question types (Untangle the Verse, Match the Pairs), 60-second Lightning Round mode, Find-the-Error second chance, combo popups/ring-pulse/score-fly juice, redesigned header (rank XP bar, tiered flame, sound toggle, trophy button), icon tab bar (fixed bottom app-bar on phones), landscape/small-screen responsive pass. Details woven into the sections below.

## Files

- `index.html` — the entire app (~180KB: data, styles, logic)
- `relics/v_*.webp` — 25 relic art images for Book of Mormon verses, filename = verse id (e.g. `v_1_nephi_3_7.webp`)
- `chests/level-01.webp … level-25.webp` — closed chest art per floor
- `tower-bottom.png`, `tower-window-01.png`, `tower-window-repeat.png`, `tower-top-window-24.png`, `tower-roof-final-25.png` — 5-piece tower kit (640px canvases, alpha transparency); repeat piece tiles floors 2–23
- `tower-full-transparent.png` — full tower cutout, used in hero + Today card
- `iron-rod-tower.html` — original standalone tower demo (reference only, not linked)

## Core concepts / game loop

1. **Four towers**, one per volume (Book of Mormon = "The Iron Rod Tower" is the hero; also New Testament, D&C, Old Testament). 25 verses each, 100 total in `DATA`.
2. **Personal climb order**: floor N of a tower = the Nth verse the user sealed in that volume, any order (`state.climb[vol]` array of verse ids). Easy verses count anywhere.
3. **Study**: 5 memory stages (Full Text → Light Fade → Heavy Fade → First Letters → Blackout). Each stage passed reveals one **shard** of the verse's relic (5-shard clip-path overlay, `relicHTML()`). The 5-tier difficulty set (`DIFFICULTIES`, Easy…Impossible) uses weather emoji (☀️⛅🌧️⛈️🌪️), applied consistently in the difficulty strip and `libraryFilters()`.
4. **Seal**: reciting at Blackout seals the verse → **seal ceremony** overlay (`playSealCeremony`): chest shakes, light burst, relic rises + name/motto → "Climb the tower ▸" → tower page animates up one floor (`pendingClimb` consumed by `renderTowerDetail`), window lights, relic mounts beside the window, congrats banner.
5. **Review engine**: seals fade on a spaced ladder `REVIEW_LADDER = [1,3,7,14,30,90]` days. Conditions: Radiant → Dimming → Fading → Cracked; 6 successful re-seals = Eternal (never fades). Overdue >10 days slips a rung.
6. **XP/streak/ranks**: `state.xp`, `state.streak`, `RANKS` (Seeker → Keeper of the Word). Header shows a **rank progress bar** (`nextRankInfo()`) with "N XP to <next rank>".
7. **Streak v2**: `touchStreak()` also stamps `state.calendar[isoDate].a=1`, tracks `state.bestStreak`, awards a 🛡️ **Streak Shield** every 7 consecutive days (max 2, `state.shields`) that auto-saves a single missed day (gap of exactly 2 days consumes one and continues the streak), and fires milestone toasts/confetti at `STREAK_MILESTONES = [3,7,14,30,50,100]`. Flame visuals have 6 tiers (`streakTier()`, `tier-0`…`tier-5` classes — grayscale → orange → pulsing → blue (14+) → gold (30+)) applied to the header stat and the check-in card.
8. **Daily check-in**: `claimDailyGift()` (once per day, `state.calendar[iso].c=1`) awards `10 + 2×streak` XP (cap +20, 15% lucky bonus) and counts as activity. The Today card shows the flame + count, a 7-day week strip, a collapsible 28-day habit chain grid (`lastNDays()`, `view.chainOpen`), and the blessing chest — chest art level = current streak (`chests/level-NN.webp`), so the daily chest visibly upgrades as the streak grows.
9. **SFX**: `SFX.*` — tiny WebAudio synth (no audio files): `tap/pick/correct(combo)/wrong/seal/chest/fanfare/milestone/gift/whoosh/tick`. `correct()` rises in pitch with the combo. Gated by `state.sound` (toggle 🔊/🔇 in header); context lazily created on first user gesture.
10. **FX**: `FX.burst(x,y)/burstAt(el)/rain()` — dependency-free canvas confetti (`#fxCanvas`, z-220, pointer-events:none). Respects `prefers-reduced-motion`.
11. **Achievements (app-wide)**: `ACHIEVEMENTS` (28 defs, 4 categories in `ACHV_CATS`: Climb/Habit/Arena/Journey), each with a `cur()` progress fn computed from state — no per-event bookkeeping. `checkAchievements()` runs from `saveState()` (guarded by `window.__achvReady` + `_achvBusy`, loops ≤3 passes for cascades), unlocks into `state.achv.unlocked{id:ts}`, +10 XP each, toasts (batched summary toast when >2 fire at once, e.g. first load for an existing player). `openAchvPop()` = full overlay (categories, progress bars, share button); Today shows a **Top 5 closest** card via `topProgressingAchievements(5)`.
12. **Sharing**: `openSharePop(v)` for sealed verses — draws a 1000×1250 share-card PNG on canvas (`drawShareCanvas`: gold frame, relic art or emoji, ref/motto/floor/streak stats), preview + native share (`navigator.share`, files if `canShare`) + copy text + download image; degrades to text-only when canvas is tainted (file://). `shareText(text)` = share-or-clipboard helper used by Arena results + achievements overlay. Ceremony has a "share this victory ▸" link; relic popup has a Share button for sealed verses. `state.shares` counts for the Light on a Hill achievement.
7. **Multi-verse ref numbering**: refs like "Alma 34:32–34" get inline `<sup class="vnum">` verse-number markers via `verseRangeFor()`/`verseNumberMarks()`/`numberedVerseText()`. Since only combined verse text is stored (no per-verse split), boundaries are **approximated** by distributing sentences evenly across the verse range — a visual aid, not scripture-accurate. Used in the relic popup, Study's Full Text stage, and the Arena's "Peek at the words" reveal.

## Header + nav (rendered in `render()`)

- Header: trophy button (`#achvBtn`, count badge → `openAchvPop()`), sound toggle (`#soundBtn`), rank chip, 3 tappable stats (XP → achievements, streak → scrolls to check-in card, sealed → shelf), rank progress bar.
- Tabs have icons + short labels (`.tab-ico`/`.tab-txt`, library labeled "Collection"); Today's icon carries a due-count badge (`.tab-dot`). On ≤640px the nav becomes a **fixed bottom app bar** (stacked icon/label, safe-area padding; `.wrap`'s existing 86px bottom padding clears it; toast raised above it). Short-landscape (`max-height:520px`) reverts to a static inline bar.

## Tabs (view.tab)

- `today` — order: greeting strip (`greetingLine()`, time-of-day + agenda line of due seals / open quests / unclaimed blessing) → **Daily Check-in card** (`checkinCardHTML()`/`bindCheckinCard()`) → "Continue the climb" card (mini tower, progress, in-progress verse, 3 path choices: Quick win / Steady climb / Bold leap from `climbChoices()`; "Continue the Climb" navigates to the Towers tab on the user's current volume) → Fading Seals list → **Arena · Today's Quests card** (the 3 daily quests, each tappable → `startQuestRound(id)`, plus Enter-the-arena button) → **Achievements Top-5 card** → Four Towers strip → Relic Shelf strip. First-run hero ("Climb the Iron Rod Tower") still replaces the climb card for fresh users; check-in card shows for everyone.
- `towers` — tower grid → tower detail: **two-column layout** (`.tower-cols`): left = next-chest verse choices + climbed floor list; right = tall sticky tower visual (stacks on mobile, tower first). Window art shows only the lit-window glow (the earlier dark `.tv-off` overlay layer was removed).
- `shelf` — trophy room. Relics in **canonical book order** per volume (5-across grid, wood-styled rooms). States: `dark` (unstarted, dimmed), `waking` (shards showing), `claimed` (shows chest + floor number + condition icon). A relic "proven" via Prove It (see below) but not yet sealed shows a dimmer green `.proven` glow/ring even before it's earned by sealing.
- `trials` (nav-labeled "Arena") — full challenge/quiz system, see **Arena** below.
- `library` — labeled "Scripture Collection", filterable verse cards (unchanged legacy view).
- `study` — memorize screen. No edit-text (removed). Stages 1–2 have **🔀 Shuffle words** re-rolling `pickBlankSet()`. Also has a **🧩 Prove It** button (see below) and, on the Full Text stage, a **🖍️ Highlight key words** toggle (see below).

## Highlight tool (Study tab, Full Text stage only)

`view.highlightMode` toggles a per-word tap-to-highlight mode via a pill button above the verse text. When on, tapping any `.w` word span toggles a gold glow (`.hl` class) and records the word index in `state.progress[verseId].hl` (array, persisted). Highlights stay visible with the mode off; a "Clear highlights" button appears once any exist and resets `p.hl = []`. Word click handling is gated by `view.highlightMode` so it doesn't conflict with the existing tap-to-reveal-blank behavior on stages 1–2.

## Prove It (Study tab)

A word-order-building recitation puzzle, separate from the 5-stage memorize flow. `openProveIt(v)` opens a full-screen overlay (`#proveIt`, reusing the `.cer` ceremony-overlay chrome); `chunkVerse(text)` splits the verse into 3–10 word chunks; `renderProveIt()` shows the verse built so far (`.prove-built` / `.pv-chip`) plus a 3-choice picker (`.prove-options` / `.prove-opt`) for "which section comes next." The overlay content sits in a solid card (`.prove-stage`, reuses relic-popup card styling: `max-width:560px`, scrolls internally, responsive down to full-width on mobile) rather than floating directly over the blurred backdrop — an earlier `mask-image` fade on `.prove-built` visually bled the last row of chips into the prompt text below it; removed in favor of a plain background + `border`. Has an explicit `.rp-close` ✕ button (top-right) and backdrop-tap-to-close, in addition to the existing "try again later ▸" skip link. `.prove-built` auto-scrolls to the newest chip via `lastElementChild.scrollIntoView({block:"end"})` (more reliable in-app than direct `scrollTop` assignment). On completion: +15 XP, streak touch, and `progress[id].provenIt` is set (one-time toast on first proof) — this only lights the "proven" glow on the shelf, it does **not** seal the verse. `closeProveIt()` clears the module-level `proveState` and hides the overlay.

## Relic popup

`openRelicPop(v)` / `closeRelicPop()` (`#relicPop`, `.relic-pop-card`). Card has `position:relative` (required — otherwise the absolutely-positioned `.rp-close` button anchors to the full-viewport stage instead of the card) and a large `.rp-close` ✕ button, top-right. The relic image renders at up to `300px` (`.rp-relic .relic{--rsz:clamp(170px,62vw,300px)}`, tripled from the original `96px`) so the artwork's detail is actually visible; card widened to `max-width:460px` to fit. Verse text (`.rp-text`) uses `numberedVerseText(v)` so multi-verse refs show inline verse-number superscripts.

## Arena (formerly "Trial Grounds")

Nav label and user-facing copy say "Arena"; internal identifiers (`view.tab === 'trials'`, `view.trialRound`) were kept as-is. `ensureArena()` lazily initializes/migrates `state.arena`.

- **Filters**: status (Memorized / Not Yet Memorized / All Scriptures) and book (multi-select: Book of Mormon, Old Testament, New Testament, D&C, Pearl of Great Price), persisted in `state.arena.filters`, shown as an active-filters summary on setup.
- **Difficulty**: Easy/Normal/Hard via `ARENA_DIFF` — controls option count, timer, and hint cost/availability.
- **Formats** (`makeArenaRound(mode)`, `mode.kind`):
  - `quick` — short practice pull from the filtered pool.
  - `quest` — **focused round of a single question type**, launched by tapping a quest card (`startQuestRound(questId)`, works from Today and Arena setup). Round length per type via `QUEST_ROUND_LEN` (recitation 3, buildVerse 4, scramble 5, pairs 4, else 6); fullRecitation prefers the sealed pool; falls back to all verses if filters yield none. Session header shows "<emoji> Quest: <name>".
  - `blitz` — **⚡ Lightning Round**: `BLITZ_SECONDS = 60`, 30 pre-built fast questions (`BLITZ_TYPES` = the five option-based types), one global countdown (`T.blitzEnd`/`T.blitzTimer`, 150ms interval updating `#blitzSecs` + bar, `.low` pulse under 11s), shorter advance delays, session ends on expiry. Tracked in `a.blitz = {played, best}`; never counts as "perfect" (stars come from correct-count: 8/15 thresholds); feeds the Lightning Legend quest (`track:"blitz"`) and `blitz_ace` arena achievement (15+).
  - `book` — Book Mastery Challenge per volume: `bookAreas(vol)` splits into 5 areas × 5 verses (25 total), tracked in `state.arena.bookMastery[vol]`.
  - `grand` — Grand Scripture Challenge: `grandAreas()` splits all books into 10 areas × 10 verses (100 total), progressively harder, tracked in `state.arena.grand.areas`.
- **Question types** (`ARENA_TYPES` / `ARENA_TYPE_LABEL`, 11 implemented): text2ref, ref2text, theme2ref, finishVerse, buildVerse (shares Prove It's chunk-picker UI/CSS), fillBlank, findError, fullRecitation, timedRecall, **wordScramble** ("Untangle the Verse" — an ≤8-word window of the verse as shuffled tap-chips, rebuild in order; misses shake + count, `penalty = miss×2`, wrong at 5+ misses), **pairMatch** ("Match the Pairs" — 3 refs ↔ 3 themes, tap-left-then-right; slips flash + count, `penalty = miss×2`, wrong at 4+ slips). `findError` now grants a **second chance**: the first wrong tap marks the word (`.used`, strikethrough), shows a 💛 "one more try" banner and stays unlocked; a second-try success is still correct with `{penalty:5}` and a "💪 Got it on the retry!" banner. `fullRecitation`'s "👀 Peek at the words" toggles an inline, scrollable `.recite-peek` panel showing the **full** verse text (via `numberedVerseText`), tracked per-question via `q.peekOpen`. `settleAnswer(T,q,correct,opts)` accepts `opts.penalty` (floors gained at 3) and now calls `saveState()` per answer so stats/quest progress survive a closed tab.
- **Game feel**: correct = pitch-rising chime (`SFX.correct(combo)`), confetti micro-burst at the tapped control (`FX.burstAt`), green ring pulse (`.ta-ring`), score fly (`.ta-fly`); combo ≥3 pops a center stamp (`.ta-combo-pop`: "COMBO ×3!" → "ON FIRE" ≥5 → "UNSTOPPABLE" ≥8). Wrong = soft double-thud + arena shake. Results screen: rotated gold **FLAWLESS stamp** (`.tr-stamp`) on perfect, fanfare + confetti rain by star count, 📣 Share button (`shareText` with a mode-aware brag line).
- **Scoring/gamification**: live score + streak during a session (`.ta-score`, timer bar for timed types); `settleAnswer()`/`scoreForType()` award points with streak bonuses; correct answers on due verses still call `resealVerse()`. `finishArenaSession()` renders a results screen — total score, accuracy, best streak, scriptures practiced/improved/mastered, hints used, challenge-area progress, plus any quest badges earned that session.
- **Achievements & titles**: `ARENA_ACHIEVEMENTS` (11 named badges, `unlockArenaAchievement()`), `ARENA_TITLES` (8 rank names via `arenaTitleFor()`, keyed off achievement count).
- **Stats**: `a.stats = {sessions, totalAnswered, totalCorrect, hintsUsed, resealedCount, byType:{[type]:{played,correct}}}`, updated in `settleAnswer()` and `finishArenaSession()`. Surfaced in a collapsible "📊 Stats & Quest Shelf" panel on setup (`view.arenaStatsOpen`) — stat tiles + a per-question-type accuracy bar list.
- **Quests**: `ARENA_QUEST_POOL` (15 defs — one per question type incl. wordScramble/pairMatch, plus session-count/perfect-session/streak/blitz variants) drives a **daily rotating set of 3** via `ensureArenaQuests()` (reshuffles at midnight, keyed by `todayStr()`). **Quest cards are playable**: `.quest-click` + `startQuestRound(id)` (type-tracked quests spawn a `quest` round of that type; blitz quest spawns a Lightning Round; session/perfect/streak quests spawn a quick round). Cards carry a "▶ Play" chip and hover lift; the same interactive card appears on Today. Progress is bumped live from `settleAnswer()`/`finishArenaSession()` via `bumpArenaQuests()` (increment-based) / `setArenaQuestProgress()` (max-based: streak + blitz quests). Completing a quest pushes a badge onto `state.arena.questBadges` (`{id,name,emoji,chest,earnedAt}`) — rendered as a **Quest Shelf**: real chest art (`chestImg(def.chest, size)`) with the quest's emoji layered on top as a sticker.
- **Setup "Game Modes" card**: `.mode-grid` with Quick Practice + Lightning Round tiles (blitz shows lifetime best), replacing the old lone Quick Practice button. `ARENA_ACHIEVEMENTS` grew to 12 with `blitz_ace`.
- **Quit button**: a small ✕ (`.ta-quit`, top-left of the session header) lets the player bail out of an active round back to setup without a confirmation dialog — safe because score/quest progress is only persisted incrementally as each question is answered (`settleAnswer`), so nothing is lost by quitting mid-session.
- **Setup screen** (`renderArenaSetup()`): leads with a Quick Practice CTA + active-filters summary; achievement badges are labeled (no mystery emoji) and tucked behind a collapsible "Achievements" pill (`view.arenaBadgesOpen`) — tapping a badge toasts its name/description; filters/difficulty sit behind a collapsible "Step 1/2/3" section (`view.arenaSettingsOpen`) to avoid overwhelming first-time users.
- Render functions: `renderArenaSetup()`, `renderArenaSession()`, `renderArenaResults()`.

## State (localStorage)

Key `lineUponLine_v1` (or `lineUponLine_v1::<climber>` when a `?climber=` param or Daily Quest profile exists). Shape:

```
{ xp, streak, lastDay, bestStreak, shields, shares, resealsTotal, sound,
  calendar: { "YYYY-MM-DD": {a:1, c:1} },        // a = active day, c = blessing claimed
  achv: { unlocked: { [achievementId]: unlockTimestamp } },
  progress: { [verseId]: {stage, sealed, sealedAt, reviewLevel, reviews, nextReviewAt, lastReviewAt, provenIt, hl:[wordIdx,...]} },
  edits: {}, climb: { [volume]: [verseId,...] }, trials: {played, best},
  arena: { filters: {status, books}, difficulty, score, streakBest, achievements: [id,...],
           booksPracticed: {...}, bookMastery: { [volume]: {...} }, grand: {areas: {...}},
           blitz: {played, best},
           stats: {sessions, totalAnswered, totalCorrect, hintsUsed, resealedCount, byType:{...}},
           quests: {date, list:[{id,progress,goal,done}]}, questBadges: [{id,name,emoji,chest,earnedAt}] } }
```

Migrations run on load (`migrateV2()` defaults the new keys; `resealVerse()` increments `resealsTotal`). `saveState()` = `persistState()` + `checkAchievements()` (the achievement sweep is skipped until `window.__achvReady` is set after the catalog is defined, and re-entry is guarded). **Daily Quest bridge**: seal/reseal events pushed to `lul_bridge_events` in localStorage for a sibling app on the same domain (`emitBridge`).

## Conventions

- Verse id: `verseIdFor()` → `v_1_nephi_3_7` style; relic art looked up as `relics/{id}.webp`, `RELICS` map keyed by ref holds name/emoji/motto (`designed:true` = has art; others fall back to emoji).
- Difficulty = word count → 5 tiers (Easy…Impossible) with metal trims (Bronze…Teal Gold).
- All rendering is innerHTML template strings + `render()` dispatch; no framework. `view` object holds UI state (new keys: `chainOpen` for the habit grid).
- New CSS is appended at the end of the `<style>` block in commented sections (HERO, RELICS ON THE TOWER, SEAL CEREMONY, RELIC SHELF, TOWER PAGE, TODAY, ARENA SETUP, PROVE IT, GAME FEEL, HEADER V2, TABS V2, TODAY GREETING, DAILY CHECK-IN, ACHIEVEMENTS, SHARE POP, ARENA V2, FX CANVAS, RESPONSIVE POLISH).
- Static overlay divs in `<body>`: `#ceremony`, `#proveIt`, `#relicPop`, plus new `#achvPop` and `#sharePop` (all `.cer`-based; later-in-DOM wins when stacked, so the share pop can open above the ceremony).

## Known gaps / next ideas

- Chest art is closed-only; ceremony fakes opening with a light burst. Open-lid art (`chests/level-NN-open.webp`) would be a small swap in `playSealCeremony`.
- Relic art exists only for Book of Mormon; other volumes use emoji fallbacks.
- Arena reseal accepts recognition (multiple choice) as proof; recitation reseal still exists in Study — decide if Arena-reseal should be rate-limited.
- Pearl of Great Price is currently bundled with Old Testament as one "volume" (`displayVolumeName()`); could be split into its own Book Mastery Challenge/filter option if desired — not yet requested.
- Multi-verse verse-number markers (`verseNumberMarks()`) are a **sentence-distribution heuristic**, not real per-verse text boundaries — the underlying `DATA`/`VERSES` only stores one combined `text` string per ref. Exact numbering would require re-sourcing verse-by-verse text for the ~15 multi-verse refs.
- Arena quests: only a daily rotating set of 3 exists; no weekly/longer-arc quest and no reroll — but every quest is now directly playable, which removes most of the sting (a Full Recitation quest round falls back to unsealed verses only when nothing is sealed).
- No backend/accounts; state is per-browser localStorage.
- jsdom smoke tests were used during development (not shipped); syntax is valid ES2020+ (`node --check` on the extracted script passes).
- Share-card canvas taints on `file://` (relic image = distinct origin) — the popup silently drops the image preview/save and keeps text sharing. Fine over http(s).
- SFX is synthesized; if real audio assets ever land, swap the `SFX` object's internals without touching call sites.
- The daily blessing chest reuses closed-chest art keyed to streak length; a dedicated "gift" art set would slot into `checkinCardHTML()`.
