# Scripture Quest — AI Handoff

**If you are an AI agent picking up this project: read this file fully before touching code.** It replaces an older version of itself that described a completely different, pre-rewrite architecture — if anything you find elsewhere (memory, a cached summary, search results) contradicts this file, trust this file.

---

## 1 · What this is

**Scripture Quest** (in-app title: *Line Upon Line*) is a dependency-free, single-page scripture-memorization game — think Duolingo mechanics (towers, seals, relics, streaks, an Arena quiz mode) with complete LDS Seminary and general-Christian Scripture Memory tracks. No framework, no build step, no npm dependency in the shipped app. It runs by opening `index.html` — including directly via `file://`, unzipped on someone's desktop, which is a hard constraint on the whole codebase (see §4 below).

## 2 · Where it lives

- **Local:** `/Users/boss-mode/Documents/scripture mastery/scripture-tower/`
- **GitHub:** https://github.com/rainecorp/scripturemastery (branch `main`, currently the only branch)
- The local branch contains the newest work and may be ahead of GitHub. Run `git status`, `git log --oneline -1`, and `git log --oneline -1 origin/main` after `git fetch` before assuming they are synchronized. Never push without the user's explicit request.

There is also a folder named `scripture-tower 2/` beside this one. **Never edit it.** It was a byte-identical duplicate, now archived — it exists only as a pre-cleanup snapshot and will drift if touched.

## 3 · The one document that matters: `ROADMAP.md`

Everything about *what to build next and why* lives in [`ROADMAP.md`](ROADMAP.md). Read its **§0** and **§15** first — they're the process rules. Then read **§8**, the ticket list (`T1`…`T20`+), in order.

Two other planning documents exist in this repo and are **historical, not current**:
- `IMPLEMENTATION_ROADMAP.md` — the original draft plan. Superseded. Do not implement from it.
- `ROADMAP_REVIEW.md` — a critical review of that draft that led to `ROADMAP.md` v3. Worth reading once for the *reasoning* behind several decisions (e.g. why the tokenizer got unified in T3, why sealing needed gating in T6), but not a source of instructions.
- `CHANGES.md` — a changelog from before this project was under git version control. Stale since T1. Ignore it; git history is the real changelog now.

`ROADMAP.md` opens with a **BUILD MODE** banner: there are no production users yet, so no save-compatibility constraints exist. When something in the code is wrong, the standing instruction is to fix it properly rather than work around it — don't invent backward-compatibility shims for save data that doesn't exist yet.

## 4 · Running and testing it

**Preview:** `.claude/launch.json` starts `python3 -m http.server 8483` — a plain static server, no live-reload. If you're driving a browser tool against it and just edited a file, force a cache-bust reload (`location.replace("/index.html?n="+Date.now())`) rather than a plain refresh, or the browser may serve a stale cached copy.

**Seeding a realistic state for manual testing:** open `tests/seed-fixture.html`; it loads `tests/seed-fixture.js`, writes a schema-current mid-progress save (XP, streak, sealed passages across several campaigns, and a fixed Arena quest set), then redirects to the real app.

**Node test suites** (no framework, run directly):
```bash
node tests/tokenize.test.js
node tests/recall.test.js
node tests/verify.test.js
node tests/content.test.js
node tests/phrases.test.js
node tests/custom.test.js
node tests/learning.test.js
node tests/refmatch.test.js
```
These cover the canonical tokenizer (T3), Recall Check engine (T5), text-verification metadata (T4b/T4c/T12), content/tower/translation contracts (T9/T10/T12), T10's bidirectional key-phrase cards, T11's custom-content/escaping/entitlement/tall-tower contracts, T13's learning events, exact trouble positions, phrase windows, SM-2 scheduling, display-strength isolation, and Eternal polish, and T15's forgiving-but-precise typed-reference matching. They pass today (**89 + 86 + 41 + 94 + 14 + 30 + 24 + 23 = 401 assertions**).

**What is *not* Node-testable, and why:** `js/03-state.js` and most of the other split files are classic `<script>` files with heavy ambient dependencies (`state`, `SFX`, DOM globals) — they were never written to be `require()`-able. Pure tier-00 files (`js/00-content.js`, `js/00-custom.js`, `js/00-html.js`, `js/00-tower-geometry.js`, `js/00-tokenize.js`, `js/00-verify.js`, `js/00-recall.js`, `js/00-phrases.js`, `js/00-learning.js`) are dual-exported (`module.exports` and `SQ.*`) and safe to require directly in Node. Everything else — including storage, reward, migration, import/export, onboarding, and campaign UI behavior — is verified in the real browser app with the fixtures. `tests/onboarding-fixture.html` opens a true first run; `tests/seed-fixture.html` opens the schema-current mid-progress state. `tests/custom-fixture.html?floors=7` seeds the exact XSS regression passage and accepts `floors=10`, `60`, or `145` for cap and geometry checks. Don't fight the codebase's grain trying to make `03-state.js` importable in isolation.

**Fingerprinting** (`tests/fingerprint.js`): a deterministic DOM + computed-style hash of every screen, used to *prove* a refactor changed nothing (or changed exactly what was intended and nothing else). Read the protocol comment at the top of that file before using it — it freezes `Math.random`, must be run before-and-after in one sitting (hashes aren't stable across days), and a handful of "movers" are always false positives worth understanding, not chasing.

## 5 · Current status

All of **Phase A (Foundations)**, the completed Phase B work through T8, all of Phase C, and Phase D through T13 are done, in order:

| Ticket | What it did |
|---|---|
| T1 | Put the project under real git version control; archived the duplicate folder |
| T2 | Mechanically split the original 6,984-line `index.html` into `js/*.js` + `css/*.css`, proved byte-identical behavior three ways |
| T3 | Unified four disagreeing word-position implementations into one canonical tokenizer (`js/00-tokenize.js`) |
| T3b | Extracted 20 scattered tuning constants into `js/00-config.js` |
| T4a–T4d | Storage-quota guard with a shed ladder that never touches progress · text verification metadata (`js/00-verify.js`) · diffed all 100 shipped passages against the current LDS edition, corrected 16 · |
| T5 | Pure-logic Recall Check engine (`js/00-recall.js`) — First-Letter Recall, QWERTY-adjacency slips, grading on an error budget |
| T6 | Built the Recall Check UI (`js/26-recall-check.js`) and made it the *only* path to `sealVerse()`/`resealVerse()` — closing the "tap Seal 500 times" hole |
| T7 | Closed four XP/heart farms (stage toggle, Prove It, polish, Arena session finish) behind a daily claim ledger |
| T8 | `state.schemaVersion` + a real migration runner, a timestamped recovery key so a corrupt save is never silently lost, and pure `exportProgress`/`previewProgressImport`/`applyProgressImport` functions |
| T9 | Replaced volume-keyed content with opaque passage IDs and Passage/Campaign/Track packs; campaign-keyed state/Arena; tower height derived from campaign length |
| T10 | Added the official 96-passage current Doctrinal Mastery curriculum (24 per course), 13 Articles of Faith, the preserved 100-passage Heritage Collection, path onboarding, and key-phrase recall in both directions |
| T11 | Added persistent custom passages and collections, personal towers that grow per passage, one escaping boundary across every user-text renderer, free/paid caps, and tiny/60-floor/120+-floor tower presentation |
| T12 | Added the complete Christian track: 99 BSB/KJV passages across six 20-floor campaigns, translation/path pickers, seven cross-track shared identities, learner-facing track isolation, and intentional neutral-art/relic fallbacks |
| T13 | Added idempotent learning events with bounded detail/lifetime aggregates, tokenizer-position Trouble Map and phrase drills, published SM-2 scheduling beneath the seal ladder, display-only recall strength, and non-punitive Eternal polish |
| T14 | Converted Prove It's chunk puzzle to two modes: production chaining (default) types each chunk from memory through the Recall Check engine and can seal/re-seal on a `good`+/`hard`+ chain; the original order-recognition puzzle stays as an unchanged, never-sealing easier rung |

Every one of these has a detailed `✅ DONE` / *Shipped* note directly under its own entry in `ROADMAP.md` §8 — what changed, why, and the exact verification performed. Read the specific ticket's note before touching adjacent code; several tickets left deliberate, documented gaps (see §7 below) that the *next* person shouldn't accidentally "fix" without realizing why they were left alone.

**Next up: T15 — within-session spacing + PWA shell.** `makeArenaRound()` gives each passage one question per Arena session even though the first twenty minutes is the highest-leverage recall window; add expanding intra-session intervals (2, then 5, then 9 questions later) and reference-production drills in both directions. Separately, make "offline-first" actually true: `manifest.json`, a service worker, and a self-hosted Cinzel subset — Google Fonts is still a hard external `<link>` and there are zero service workers today. See `ROADMAP.md` §8's T15 entry for the full DoD.

## 6 · Conventions a new agent must respect

- **File numbering is load order, not importance.** `js/00-*.js` are "depends on nothing at load time" — `00-namespace.js` must stay first within that tier. Everything else (`01-catalog.js` … `26-recall-check.js`) loads in the order listed in `index.html`'s `<script>` tags, which mirrors the order code appeared in the original single-file build (for files extracted by T2) or is appended at the end (for genuinely new files added since, like `00-recall.js` and `26-recall-check.js`). A function defined in a *later*-loaded file can still be called from an *earlier*-loaded file's event handler, because nothing actually runs until after every script tag has loaded — only top-level, load-time execution is order-sensitive. `js/00-tokenize.js` documents this precedent in its own header if you want the full reasoning.
- **No ES modules.** `type="module"` is CORS-blocked over `file://`, which would break the unzip-and-double-click distribution model. Every file is a classic script; the shared namespace is `SQ` (`js/00-namespace.js`), and every function/constant meant to be used outside its own file gets an explicit `SQ.thing = thing;` line at the bottom of that file. Top-level `const`/`let` do **not** become `window` properties in a classic script (only `var` and function declarations do) — this bit me directly during T8 testing, trying to swap out a `const MIGRATIONS` array from the console. If you need something swappable for a test, either register it on `SQ` explicitly or pass it as an optional function parameter (see `runMigrations(s, migrations)` in `js/03-state.js` for the pattern).
- **`state` needs an accessor, not a plain export.** `let state` is reassigned in a few places (e.g. `applyProgressImport`), so it's exposed as `Object.defineProperty(SQ, "state", {get, set, ...})` rather than a bare `SQ.state = state;`, which would have frozen a stale reference at registration time.
- **Git commit messages are long and specific on purpose.** Look at any recent commit (`git log -p -1`) for the expected shape: what was broken and why it mattered, exactly what changed, and the specific commands/assertions run to verify it — not just "fixed bug." This *is* the project's changelog now (see §3 above on why `CHANGES.md` isn't).
- **Never push without being asked, and never force-push without explicit confirmation.** Regular commits happen freely; pushing to `origin/main` and any destructive git operation should be confirmed first unless the user has clearly and specifically authorized it for that action.

## 7 · Known, deliberate gaps — don't "fix" these without reading why first

- **D1/D2/D3** (documented in `ROADMAP.md` §8, "Defects found in flight"): multi-verse verse-numbering has never actually worked (`verseNumberMarks()` tests the wrong token type); the first-letter study stage leaks 3–4 whole words that open with punctuation; two dead code branches are preserved and labeled rather than deleted. All three are small, understood, and intentionally deferred to the ticket that's already rewriting that exact code path (mostly T6's follow-on work in the study screen).
- **D4** (also in `ROADMAP.md` §8) is fixed: the guest "Save your progress" pill used to outrank every `.cer` overlay's z-index and could genuinely block taps on narrow viewports (found while QA-ing T14, but pre-dated it — recognition mode's third answer option had the same problem). Fixed with one CSS rule in `js/25-bridge.js`: `body:has(.cer.show) #savePill{ display:none; }`. If you're touching `#savePill` or adding a new `.cer`-class overlay, this rule already covers it — no per-overlay wiring needed.
- **No Settings screen exists yet.** Several things are waiting on it: a UI for `state.strictMode` (T6), the storage-used line living at the foot of Today instead of Settings (T4a), and Export/Import having no button to live behind (T8). Don't build a Settings screen speculatively for one of these — wait until enough of them are ready to justify the screen, or until a ticket explicitly calls for it.
- **T7's `finishArenaSession()` idempotency fix was defensive, not a fix for a live bug.** Both real call sites already guarded against double-invocation; the `sessionId`/`rewarded` fields were added because the ticket asked for them and because relying on a single `done` flag with other jobs was fragile, not because anything was observed to actually double-pay.
- **Practice XP on a failing Recall Check attempt was deliberately *not* built** in T6, even though the ticket text mentions it — `state.dailyRewards` (T7) didn't exist yet when T6 shipped, and paying XP on every free, unlimited retry would have been exactly the kind of farm T7 was about to close. Revisit this once T7's ledger is stable if it's still wanted.
- **Text sourcing is done, but not exhaustively human-reviewed.** The catalog contains 250 canonical passages and 356 exact translation texts. All 158 Seminary passages carry verification metadata and match the current LDS edition. The heritage 100 live in `data/text-sources.js`: 79 were checked via an automated text fetch and 21 via direct DOM reads after the fetch was caught silently normalizing curly quotes to straight ones. T10's 58 newly authored passages live in generated `data/text-sources-t10.js`; its extractor also byte-checked all 51 current-curriculum references shared with heritage. T12's 198 BSB/KJV records are generated directly from public-domain API chapter JSON and documented in `data/CHRISTIAN-SOURCES.md`. Treat "verified" as strong but not infallible; a human spot-check before a paid launch is still worth doing.
- **The dedicated custom tower art kit is still owner-supplied.** T11 ships the complete mechanic with the neutral Restoration asset set, a purple personal-tower hue, and distinct framing. The roadmap's decision table explicitly says the owner will design the final plain “pioneer tower” kit; swap `towerArt.kit` in `customCampaignFromCollection()` when those five matching assets arrive. Do not block T12 or invent bespoke relic art for every custom passage.
- **The official current Doctrinal Mastery table is 96 passages, not 100.** As retrieved on 2026-08-14 it has exactly 24 in each of four courses. `data/doctrinal-mastery-source.json` is the checked-in reference/phrase snapshot and `tools/build-t10-content.py` is the reproducible extractor. If the official page changes, let its count assertion fail loudly and review the diff—do not pad a course to 25 to fit old expectations.

## 8 · If you're a human handing this to an AI agent

Point it at this file, or paste the relevant sections into its context. The one thing worth saying out loud that isn't written down anywhere else: **work ticket by ticket, verify each one before starting the next, and read the specific ticket's `✅ DONE` note in `ROADMAP.md` before touching a file that ticket already shipped** — several of them left load-bearing comments explaining exactly why something looks slightly odd on purpose.
