# Roadmap Review — Critical Gaps, Verified Against Source

**Reviewed:** 2026-08-10
**Source reviewed:** `scripture-tower/index.html` @ SHA-1 `4e4251e0dda62b7fe3ee916f759fd7f9511c477b` (confirmed — matches roadmap header)
**Reviews:** `IMPLEMENTATION_ROADMAP.md`
**Method:** Full read of `index.html` (6,984 lines), plus scripted verification of tokenizer behavior, verse data, and reward paths. Competitive research on the actual incumbents.

---

## Verdict in one paragraph

The roadmap is a strong *engineering* document and a weak *product* document. Its central insight — that recognition, reconstruction, and recall are different grades of evidence, and only recall should re-seal — is correct and is the most valuable idea in it. Its data-discipline rules (bounded arrays, idempotent rewards, migration runner with recovery key, export before mutation) are correct. Its restraint (no framework migration, no leaderboards, no AI-first study screen) is correct.

But it audits the *Arena* for integrity while leaving the *primary sealing path* completely unverified; it builds a word-position data model on four mutually incompatible tokenizers that already disagree on 7 of the 100 built-in verses; it benchmarks against BibleMemory while ignoring the free first-party app that owns this exact audience; and it never asks whether the 100 passages the app teaches are the ones seminary students are actually assigned today. **They are not.**

Below: what's missing, ranked by how much damage it does if you build the roadmap as written.

---

## A. Content and market — the roadmap never questions the product's core asset

### A1 — The app teaches the retired scripture list 🔴 CRITICAL

The Church replaced **Scripture Mastery** with **Doctrinal Mastery** in 2016 (revised 2023). The app ships the pre-2016 list.

I extracted all 100 references from `DATA` (`index.html:2408`) and compared them to the 2023 Doctrinal Mastery Core Document:

| | In the app but **not** Doctrinal Mastery | In Doctrinal Mastery but **missing** from the app |
|---|---|---|
| Old Testament | Exodus 33:11, Leviticus 19:18, Deuteronomy 7:3–4, Joshua 1:8, 1 Samuel 16:7, Job 19:25–26, Isaiah 55:8–9, Jeremiah 16:16 | Abraham 2:9–11, Genesis 2:24, Isaiah 5:20, Isaiah 58:6–7, Isaiah 58:13–14, Jeremiah 1:4–5, Ezekiel 3:16–17 |
| Book of Mormon | Alma 32:21, Alma 34:32–34, Alma 37:6–7, Alma 37:35, 2 Nephi 9:28–29, 2 Nephi 28:7–9, Jacob 2:18–19, Mosiah 4:30, 3 Nephi 11:29, 3 Nephi 27:27, Moroni 7:16–17 | 2 Nephi 26:33, 2 Nephi 28:30, Mosiah 2:41, Mosiah 4:9, Mosiah 18:8–10, Alma 7:11–13, Alma 34:9–10, Alma 39:9, 3 Nephi 11:10–11, 3 Nephi 12:48, 3 Nephi 27:20, Moroni 7:45–48 |
| New Testament / D&C | Similar scale of divergence | Similar scale of divergence |

A seminary student using Scripture Quest today would memorize the wrong verses for their own class. That is a bigger competitive problem than every learning-engine issue in the roadmap combined, and it costs roughly two days to fix.

**This inverts the roadmap's sequencing.** Collections (its Release 3, P1) are the mechanism that lets both lists coexist. Collections must move to the front:

- **Doctrinal Mastery 2023** — the default campaign, ~100 passages across four courses.
- **Classic Scripture Mastery** — preserve the current 100 as a named pack. Adults who memorized these in the 90s are a real and loyal audience; don't discard the work.

Verify the exact reference list and per-course counts against the [official 2023 Core Document](https://www.churchofjesuschrist.org/study/manual/doctrinal-mastery-core-document-2023/doctrinal-mastery-passages-and-key-phrases?lang=eng) before implementing — my automated read of that page returned inconsistent counts across attempts, so treat the references, not the totals, as the verified finding.

### A2 — The roadmap benchmarks the wrong competitor 🔴 CRITICAL

The roadmap's entire competitive section is BibleMemory. But the app that owns this audience is **the Church's own free Doctrinal Mastery app** (`org.lds.sm`, App Store `id413341700`).

| | Doctrinal Mastery (official) | BibleMemory | Scripture Quest |
|---|---|---|---|
| Price | Free | $9.99 PRO / $19.99 lifetime / $49.99-yr Unlimited | — |
| Ratings | 4.3★ · 231 ratings · ~28k downloads/mo | 4.8★ · ~32,000 ratings | — |
| Languages | 37 | 15+ | 1 |
| Memorize mode | Slider that progressively hides words, leaving first letters | First-letter typing | Slider-equivalent (stages 0–4) |
| Key-phrase flashcards | ✅ ref ↔ key phrase ↔ doctrine ↔ case study | — | ❌ |
| Spaced repetition | ❌ | ✅ | ✅ (ladder) |
| Streaks / progress / motivation | ❌ | Badges, ranks | ✅ (its whole identity) |
| Multi-user / groups | ❌ | ✅ | Partial (local profiles) |
| Custom content | Gospel Library import — **repeatedly reported broken in reviews** | ✅ | ❌ |

Three consequences the roadmap misses:

1. **The wedge is motivation + retention, not features.** The incumbent is free, official, translated into 37 languages, and has no spaced repetition, no streaks, and no reason to come back tomorrow. That is exactly the gap Scripture Quest already fills. The roadmap's own framing ("the more motivating journey") is right — it just never checks it against the actual incumbent.
2. **The incumbent's memorize mode is already what the roadmap calls a new feature.** Progressive word-hiding down to first letters is the official app's core mechanic, and Scripture Quest already has it (`renderVerseHTML`, stages 0–4). First-letter is table stakes, not differentiation. What's actually missing is *typed input with scoring* — a smaller job than the roadmap implies (see C2).
3. **"My Content is broken" is the incumbent's loudest complaint.** Custom passages (roadmap Release 3) are therefore a direct attack on the incumbent's weakest point, not a nice-to-have at P1.

### A3 — Doctrinal Mastery isn't primarily a memorization program 🟠 HIGH

The current curriculum is built on doctrinal *topics*, a **key scripture phrase** per passage, and "acquiring spiritual knowledge." Verbatim recall is one part of it. The official app's flashcards drill reference ↔ key phrase ↔ doctrine ↔ case study.

The roadmap puts understanding in **Release 6, priority P2/P3** — dead last. For the audience that would actually adopt this app through a seminary class, that's the curriculum's *center*.

Key phrases are also the cheapest high-value addition in the entire plan: the `theme` field (`DATA`, every entry) is already a rough approximation of one. Replacing `theme` with the canonical key scripture phrase, then adding a phrase↔reference flashcard drill, is a day of work that puts Scripture Quest at parity with the incumbent's best feature.

**Move key-phrase flashcards into the first content release.**

### A4 — Nobody has verified the scripture text 🟠 HIGH

100 passages, hand-entered, never checked against a canonical source. The entire roadmap — first-letter matching, trouble maps, speech alignment, the north-star metric — is exact-string comparison against text whose accuracy has never been established. A memory app that teaches a typo is worse than no app.

Add to the P0 gate:
- Diff all 100 texts against the official source; correct and record `textVerifiedAt` + `textHash` per passage.
- Any future import carries the same fields, defaulting to unverified with a visible marker.

Related, and stated too narrowly in the roadmap: it flags licensing only for *future* imports. The app **already ships** 100 passages. The KJV is public domain in the US; current editions of the Book of Mormon, D&C, and Pearl of Great Price are © Intellectual Reserve, Inc. Get this settled before any public distribution, not before Release 3.

### A5 — No business model, no distribution 🟠 HIGH

The roadmap plans cloud accounts, classrooms, sync, and speech recognition — all of which cost real money to run — without a single line about how the product is funded or shipped. Meanwhile the direct competitor is free and first-party.

Unresolved and blocking for Releases 4–5:
- Free, paid, or donation? A paid app competing head-on with a free official app needs an explicit answer.
- Where does it live? Today it's a local HTML file. No domain, no hosting, no app-store presence, no PWA — see C7.
- If classrooms are the channel, who pays: the teacher, the parent, nobody?

Decide this before writing a backend, not after.

---

## B. Integrity — the roadmap found the small hole and missed the big one

### B1 — Sealing requires no evidence at all 🔴 CRITICAL

`index.html:6676–6704`. The "harder → harder → seal" button:

```js
if(!p.sealed && stage<4){
  view.stage = stage+1;
  p.stage = Math.max(p.stage, view.stage);
  state.xp += 10;                 // no check of any kind
  refillArenaHearts(1);
} else if(!p.sealed){
  sealVerse(p);                   // ← seals the verse. No check of any kind.
  recordClimb(v);
  state.xp += 50;
}
```

A user can seal all 100 verses, light every tower window, unlock every relic, claim every floor, and satisfy `mastered100` by tapping one button roughly 500 times. Nothing is ever verified.

The roadmap's Release 0 carefully hardens Arena re-seals and polish XP — real problems, but comparatively small ones — while leaving the *entire mastery ladder* self-certified. Every downstream system the roadmap designs (`masteryStrength`, the Daily Path's "low-strength passages," the north-star metric, family dashboards showing what a child has mastered) is computed on a claim nobody checks.

**This is ticket #1, ahead of everything else in the document.** Prove It already exists and is the natural gate; a first-letter or cumulative-recall check is better. Keep the tone generous — an honest self-report can still *advance a stage*; it just shouldn't *seal*.

### B2 — The XP farm is bigger than the roadmap's version 🟠 HIGH

The roadmap closes the +5 "Polish the seal" loop. It misses the larger one directly above it: `prevStage` (`:6670`) → `nextStage` (`:6676`) awards **+10 XP and a heart refill on every cycle, unbounded**, because `p.stage = Math.max(...)` only guards shard awards, not XP or hearts. Tap "◂ Easier" then "I've got it, harder ▸" repeatedly: infinite XP.

Prove It is a third one: `+3 XP` per correct option (`:6893`) and `+15` on completion (`:6906`), replayable forever; `p.provenIt` guards only the toast.

The roadmap's daily reward ledger is the right mechanism — it just needs to cover `stage-advance`, `prove-it`, and `polish`, not `polish` alone.

### B3 — The heart economy is already decorative 🟡 MEDIUM

Hearts cap at 3 (`ARENA_HEART_MAX`, `:4158`) and refill to full from any Study stage tap. Hearts are therefore effectively infinite today. The roadmap's §2.5 spends a section tuning heart *sinks* while the *source* is wide open. Fix B2 first, then tune.

---

## C. Engineering — the foundation has a crack the roadmap builds directly on top of

### C1 — Four tokenizers that already disagree 🔴 CRITICAL

The roadmap's central new data structure is `trouble` keyed by word position:

```js
trouble: { "12": { token: "go", misses: 2, ... } }   // "Word-position keys avoid ambiguity"
```

fed from both Study and Arena. But the app has four different notions of "word position":

| System | Location | Method |
|---|---|---|
| Study, highlights, blanks, first-letters | `:6301` `tokenize()` + `isWord()` | split on `(\s+)`, keep only tokens matching `\w` |
| Arena — finishVerse, fillBlank, findError, wordScramble | `:4342`, `:4357`, `:4373`, `:4380` | `text.trim().split(/\s+/)` |
| Prove It, chunking | `:6757`, `:6785` | `clean.split(" ")` |
| Share card renderer | `:3910` | `text.split(" ")` |

I ran the comparison across the built-in corpus. **7 of the 100 verses already produce different word counts between the Study and Arena schemes:**

```
Joseph Smith—History 1:15–20   503 vs 504
D&C 19:16–19                    89 vs 91
D&C 58:42–43                    40 vs 41
D&C 64:9–11                     75 vs 76
D&C 76:22–24                    80 vs 81
D&C 121:34–36                   74 vs 75
D&C 130:20–21                   40 vs 41
```

So a trouble position recorded in Arena and a trouble position recorded in Study refer to different words — and because the divergence accumulates mid-verse, the offset isn't even constant, so it can't be corrected after the fact. Trouble maps, phrase drills (Release 1), mode recommendation (Release 2), and speech alignment (Release 4) all inherit this silently and produce plausible-looking garbage.

The roadmap gets within one sentence of catching it (§7.1.3: *"Use the app's tokenizer rather than `text.split(" ")`"*) but doesn't realize there is no single app tokenizer.

**Requirement: one canonical tokenizer, unit-tested, before any Release 1 code.** It should emit a stable array of `{index, raw, norm, isWord, isVerseMark}` and every consumer — study rendering, blanking, highlights, all Arena question builders, chunking, first-letter, speech alignment — must read from it. This is the single highest-leverage engineering task in the plan and the roadmap doesn't have a ticket for it.

### C2 — First-letter mode already exists, and it's leaking answers 🟠 HIGH

The roadmap treats `firstLetter` as greenfield. Stage 3 (`renderVerseHTML:6553`) already renders it:

```js
const m = tok.match(/^(\w)(\w*)(.*)$/);
if(!m) return `${num}<span class="w">${safeTok}</span>`;   // ← renders the FULL WORD
```

Any token not beginning with a word character fails the match and **displays in full**. Verified against the corpus: 3 occurrences today (`"they`, `"Never`, `"I` in Joseph Smith—History 1:15–20). It also leaks internal structure: `it's → i…'s`, `glory—to → g…—to`, `man. → m….`

Two corrections to the roadmap:
- Scope is smaller than stated: this is "add typed input + scoring on top of an existing renderer," not a new mode.
- It's also a prerequisite fix, not a new build. Repair the regex via the canonical tokenizer (C1) first.

### C3 — The 7,000-line single file is the real blocker 🟠 HIGH

`index.html` is 362 KB / 6,984 lines with all CSS, data, and logic inline. The roadmap correctly forbids a framework migration — then conflates that with file splitting, and reduces the hardest task in the document to one sentence (§0.4: *"Extract or expose pure functions without migrating the whole app to modules"*). That sentence **is** the work.

Splitting into `index.html` + `js/*.mjs` loaded with `<script type="module">` requires no build step, no framework, and no dependency. It is the precondition for the test harness the roadmap wants in Release 0, and it materially reduces the cost and risk of every AI-driven edit that follows.

Do it as one mechanical commit with zero behavior change, verified by a byte-level UI diff. Suggested split: `data.js`, `state.js`, `review.js`, `tokenize.js`, `study.js`, `arena.js`, `render.js`, `fx.js`.

### C4 — Persistence has no guard rails 🟠 HIGH

`persistState()` (`:3125`) is a bare `localStorage.setItem` with no try/catch. A `QuotaExceededError` silently kills every subsequent save with no user-visible signal. The roadmap then adds `learningLog` (200 events), `dailyPlan`, `dailyRewards`, `collections`, and `customVerses` to the same key — meaningfully increasing quota pressure — without a write guard or a storage budget.

Add: try/catch on write, a measured size budget per climber, graceful degradation (drop the detail log before dropping progress), and a visible warning. Also honor `state.sound` — it's persisted but I found no read of it in the SFX path; worth confirming during the split.

### C5 — No XSS story before user-supplied text 🟠 HIGH

Every screen renders via template strings into `innerHTML`. `escHTML` (`:6303`) exists and is applied to the climber name, but verse text is *deliberately* rendered unescaped in several places so markup can be injected. Release 3 (custom passages) and Release 5 (class names, assignments, encouragement) pipe user- and network-supplied strings into exactly those paths. The roadmap says nothing about it.

Required before any user-supplied text ships: a single escaping discipline, an explicit allowlist of the places that intentionally emit markup, and a test that a passage containing `<img onerror>` renders inert.

### C6 — Small things the data contract gets wrong 🟡 MEDIUM

- `state.edits` is read at `:3150` but **never written** — the editing UI is gone. The roadmap's §13 contract carries it forward as if live. Symptomatic: the contract was derived from the state shape, not from the code that touches it.
- `render()` replaces `body.innerHTML` wholesale. Focus, scroll position, and text selection are destroyed on every re-render. The roadmap's §15 lists "visible focus states" but not focus *loss* — for keyboard and screen-reader users this is the more serious defect, and it gets worse once the Daily Path re-renders after every task.

### C7 — "Offline-first" isn't true yet 🟡 MEDIUM

The roadmap lists offline-first as something to preserve. Currently: Google Fonts is a hard external `<link>` (`:9`), and there is no service worker and no manifest (verified: zero matches). Hosted, this app is not offline-capable and not installable.

A PWA shell — manifest, service worker, self-hosted Cinzel subset — is roughly half a day and is the actual "it's on my kid's phone, it works in the church parking lot" story. The roadmap never mentions PWA.

---

## D. Learning science — right instincts, missing the strongest techniques

### D1 — No within-session spacing 🟠 HIGH

The ladder starts at 1 day. The highest-leverage window for verbatim text is the first twenty minutes: three successful retrievals *within one session*, separated by other material, at expanding gaps. `makeArenaRound` (`:4410`) gives each verse exactly one question per session. Adding expanding intra-session intervals is a change to round construction, not a new feature, and it is probably the cheapest real retention win available.

### D2 — No cumulative chaining 🟠 HIGH

For long verbatim passages, cumulative chaining — learn phrase 1; then produce 1→2; then 1→2→3 — is the strongest known technique, and it's absent.

`chunkVerse()` (`:6754`) already produces the chunks. Prove It already walks them in order. But Prove It is *recognition*: pick the right phrase from three options (`:6862`). Converting it to cumulative **production** (type it, or first-letter it, with the built text visible above) is a modest change to an existing screen with the largest learning payoff in the plan. The roadmap's evidence table even classifies `buildVerse` as "reconstruction" — correctly — without noticing that the fix is one step away.

### D3 — Reference recall is never drilled in Study 🟠 HIGH

Half of scripture mastery is knowing the reference. Study (`renderStudy:6573`) never asks for it. Arena has `text2ref` and `theme2ref`, but both are multiple choice — recognition. Recall is cue-specific: recognizing "1 Nephi 3:7" in a list is not the same skill as producing it from a phrase, and neither is the same as producing the text from the reference.

Add production drills in both directions: reference → text, and key phrase → reference. The second is exactly what the official app's flashcards do and what a seminary teacher quizzes.

### D4 — Don't hand-roll the retention math 🟡 MEDIUM

§7.2 proposes a `masteryStrength` of 45% / 25% / 15% / 10% / 5%. Those numbers are invented, and the roadmap then proposes measuring the product's success with metrics derived from them. It also conflates two different things: a *display* metric ("how solid is this?") and a *scheduling* metric ("when should this come back?").

Better: drive scheduling from a published algorithm (FSRS, or SM-2 if you want something you can implement in 40 lines), and keep `REVIEW_LADDER` as the visual skin over it — rung = a bucket of stability, so seals, ladders, and the Eternal Seal all survive untouched. Keep a separate, clearly-labeled display strength. The roadmap's quality grades (`again`/`hard`/`good`/`easy`) already map onto both.

### D5 — Typo strictness is the roadmap's most questionable call 🟡 MEDIUM

§7.1.3: *"Do not implement BibleMemory's adjacent-key forgiveness in the first version; accuracy is easier to explain."*

BibleMemory has 4.8★ across ~32,000 ratings, and its most-praised trait in reviews is precisely that graceful typo handling — reviewers describe it as "instructional rather than testing." A separate complaint thread wants *more* strictness, so both segments exist. For a twelve-year-old on a phone keyboard, strict matching is the difference between a game and a chore.

Recommendation: forgive near-misses by default, count them, surface them in the trouble map, and ship a "Strict mode" setting for the competitive crowd. This is a one-line config, not a philosophy.

---

## E. Audience and go-to-market

### E1 — Class mode is the distribution channel, and it's behind speech 🟠 HIGH

The roadmap puts families/classes at Release 5, P2, behind speech recognition (Release 4, P1, effort 5/5).

One seminary teacher who adopts the app brings 25 students. Speech recognition brings zero students and costs the most of anything in the plan. The champion for a scripture-mastery product is the teacher and the parent, and what they need is: assign a passage set, see who's done it, run a review together.

**Swap the priority.** The roadmap's own §5.1 local family dashboard is the right cheap first step and it's buried.

### E2 — No classroom projector mode 🟠 HIGH

The single highest-frequency real-world use of scripture mastery is a teacher running a five-minute review game with the whole class on a projector. It is not in the roadmap at all — not even in "deliberately deferred."

The Arena engine already has everything needed: question types, timers, scoring, Lightning Round. What's missing is a large-type, no-login, team-scoring presentation mode. It is close to free given what exists, and it is the most shareable thing the product could ship.

### E3 — Nothing about languages 🟡 MEDIUM

The official app supports 37. Scripture Quest supports 1, with English UI strings baked into template literals throughout and `DATA` keyed by English volume names.

Not a Release-1 concern. But the decision to separate content from code costs nearly nothing now and becomes a rewrite later. At minimum: keep passage data in its own module keyed by stable IDs (already true via `verseIdFor`), and don't add new user-facing strings inline without a second thought.

### E4 — Child privacy is named too vaguely 🟠 HIGH

§5.2 lists "child privacy policy and data deletion." For this product the relevant frameworks have names and teeth: **COPPA** (US, under-13, verifiable parental consent before collecting personal information) and **FERPA** if the app is ever adopted through an educational institution. Speech recordings and a class roster of minors are both regulated data.

And the framing is backwards: for a seminary app, minors are the *primary* user, not an edge case. Cloud accounts (Release 5) should not begin until this has a documented answer.

---

## F. What the roadmap gets right

Stated plainly so it isn't lost above:

- **Recognition / reconstruction / recall as distinct grades of evidence, with only recall able to re-seal.** This is the correct core idea and worth protecting through every later decision.
- Bounded event log with separate lifetime aggregates. Correct, and the kind of thing that's painful to retrofit.
- Sequential migration runner, idempotent migrations, timestamped recovery key on parse failure, export/import before broad state changes. All correct.
- Persisting daily-plan task IDs so re-rendering doesn't reshuffle the plan. Frequently missed; good catch.
- Not cracking the Eternal Seal on a missed polish. Right call — the reward was earned.
- The restraint list in §18. Correct, and the discipline to write it down matters more than the contents.
- Release-gated acceptance criteria and the handoff-report requirement in §17.

---

## G. Recommended resequencing

The roadmap's release order optimizes for engine quality. It should optimize for *being the right app first, then a well-built one*. Concretely:

### R-1 · Foundations (new — before anything in the roadmap)
1. `git init`, one dated backup, delete or clearly mark `scripture-tower 2` (verified byte-identical today — it will drift and someone will edit the wrong one).
2. Mechanical module split. Zero behavior change.
3. **One canonical tokenizer.** Unit-tested. All consumers migrated. *(C1)*
4. Verify all 100 scripture texts against source; add `textVerifiedAt` + `textHash`. *(A4)*
5. try/catch + quota guard on `persistState`. *(C4)*

### R0 · Integrity — revised order
1. **Gate sealing on real recall evidence.** *(B1 — the actual first ticket)*
2. Close all three reward farms: stage-toggle, Prove It, polish. *(B2)*
3. Then the roadmap's Release 0 as written: `ARENA_EVIDENCE`, `canResealFromAttempt`, `dailyRewards` ledger, idempotent `finishArenaSession`, schema versioning, export/import.

### R1 · Content correctness — pulled forward from roadmap Release 3
1. Collections infrastructure (roadmap §9.1, as written — it's good).
2. **Doctrinal Mastery 2023** as the default campaign; **Classic Scripture Mastery** preserved as a pack. *(A1)*
3. **Key scripture phrases** + phrase↔reference flashcard drill. *(A3)*
4. Articles of Faith pack.
5. Resolve text licensing before any public deploy. *(A4)*

### R2 · Memory engine — roadmap Release 1, plus what it's missing
1. `recordLearningAttempt` and aggregates (as written).
2. First-letter *typed input*, on the repaired stage-3 renderer. *(C2)*
3. **Cumulative chaining** — convert Prove It from recognition to production. *(D2)*
4. **Within-session expanding intervals.** *(D1)*
5. Reference-production drills, both cue directions. *(D3)*
6. Trouble map (now safe, because C1 shipped).
7. Graded scheduling — FSRS or SM-2 under the ladder. *(D4)*

### R3 · The Daily Climb
Roadmap Release 2, essentially as written. It's the strongest section of the document.

### R4 · Climb Together — pulled forward from Release 5
Local family dashboard → classroom projector mode *(E2)* → assignments. COPPA answer before any cloud account exists. *(E4)*

### R5 · Speak, sync, understand
Speech, personal audio, cloud sync, AI. Everything here is expensive, and none of it decides whether the product wins.

**Also, before R3:** PWA shell — manifest, service worker, self-hosted font. *(C7)* Half a day, and it's what turns this from a file into an app.

---

## H. Rewritten first ticket

Replacing §19 of the roadmap.

### Ticket: Canonical Tokenizer + Verified Text + Honest Sealing

**Scope**
1. `git init`; commit current state; one dated zip; mark `scripture-tower 2` as archive-only.
2. Extract `tokenize.js` — one tokenizer emitting `{index, raw, norm, isWord, isVerseMark}`. Migrate **every** consumer: `renderVerseHTML`, `pickBlankSet`, `classifyVerse`, `verseNumberMarks`, all four Arena question builders, `chunkVerse`, `wordCount`, the share renderer.
3. Fix the stage-3 first-letter regex so tokens starting with punctuation are masked, and internal punctuation does not leak. *(C2)*
4. Verify all 100 texts against the official source; record `textVerifiedAt` and `textHash`.
5. **Gate `sealVerse()` behind a real recall check.** Minimum viable gate: successful Prove It on that passage, no reveals. Keep the tone generous — an honest self-report still advances a stage; it just doesn't seal.
6. Close the stage-toggle, Prove It, and polish reward farms with the daily ledger. *(B2)*
7. `try/catch` + quota guard on `persistState`.
8. Tests: tokenizer index stability across all 100 verses (Study index == Arena index, asserted); first-letter masking with quotes, apostrophes, em dashes, verse numbers; seal cannot occur without evidence; each reward path awards at most once per day.

**Explicitly not in this ticket:** first-letter typed input, trouble map, Daily Path, collections, speech.

**Definition of done**
- One tokenizer; the 7 known divergent verses now agree; a regression test asserts agreement across the full corpus.
- All 100 texts verified against source, with provenance recorded in state.
- A verse cannot be sealed without a passing recall check, and the UI says so encouragingly.
- No repeated interaction produces unbounded XP or hearts.
- Existing saves migrate with zero loss; smoke tests clean at 320 / 390 / 768 / 1024 / wide.

---

## I. Open questions only you can answer

1. **Who is the primary user — a current seminary student, or an adult/family?** This decides whether Doctrinal Mastery becomes the default campaign or an added pack. My recommendation is Doctrinal Mastery default, Classic preserved.
2. **Is this free, paid, or donation-supported?** Everything in Releases 4–5 has a running cost and the incumbent is free.
3. **Where does it ship — web app, PWA, or app stores?** This gates speech recognition (browser support is uneven) and sync architecture.
4. **Are you willing to compete with the Church's official app, or is the goal to be the thing a teacher uses alongside it?** Both are viable; they imply different products.
5. **Do you have rights to redistribute the scripture text you're shipping?** Blocking for public distribution.

---

## Sources

- [Doctrinal Mastery Scripture Passages and Key Phrases (2023 Core Document)](https://www.churchofjesuschrist.org/study/manual/doctrinal-mastery-core-document-2023/doctrinal-mastery-passages-and-key-phrases?lang=eng)
- [Church News — New Doctrinal Mastery program is replacing Scripture Mastery (2016)](https://www.thechurchnews.com/2016/6/2/23222426/new-doctrinal-mastery-program-is-replacing-scripture-mastery-for-seminary-students/)
- [Doctrinal Mastery app — App Store](https://apps.apple.com/us/app/doctrinal-mastery/id413341700)
- [Doctrinal Mastery app — Google Play](https://play.google.com/store/apps/details?id=org.lds.sm&hl=en_US)
- [The Bible Memory App — App Store](https://apps.apple.com/us/app/the-bible-memory-app/id496790833)
- [Bible Memory — scripture memory techniques](https://biblememory.com/scripture-memory-techniques)
- [Introduction to Doctrinal Mastery — seminary teacher manual](https://www.churchofjesuschrist.org/study/manual/new-testament-seminary-teacher-manual-2023/introduction-to-doctrinal-mastery?lang=eng)
