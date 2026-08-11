# Scripture Quest Competitive Implementation Roadmap

**Prepared:** 2026-08-10  
**Implementation source of truth:** `scripture-tower/index.html`  
**Current source SHA-1:** `4e4251e0dda62b7fe3ee916f759fd7f9511c477b`  
**Audience:** A developer or coding AI taking over implementation  
**Product intent:** Make Scripture Quest a genuinely effective scripture-memory system while preserving its distinctive Towers, relics, seals, Arena, quests, and Latter-day Saint scripture-mastery identity.

---

## 1. Read This First

Scripture Quest is already much more than a prototype. It is a dependency-free, single-page app with all CSS, scripture data, state management, rendering, and game logic inside `index.html`. It has 100 built-in scripture-mastery passages, five study stages, four towers, relics, spaced seal reviews, Daily Check-in, achievements, quests, Arena modes, statistics, three heart hints, and local climber profiles.

Do **not** rebuild the product, replace the game world, or begin with a framework migration. The next work should strengthen the learning system underneath the existing experience.

The strategic order is:

1. Make mastery and rewards trustworthy.
2. Record what each learner struggles with.
3. Add a rigorous first-letter recall mode.
4. Turn reviews and weaknesses into one clear Daily Path.
5. Let users add and organize more passages.
6. Add voice and audio practice.
7. Add family/classroom accounts and sync.
8. Add guided understanding and carefully bounded intelligence.

The flagship product loop should become:

> **Rescue fading seals -> strengthen trouble spots -> climb one study step -> prove recall in the Arena -> return tomorrow.**

That loop is more important than adding another quiz type, another currency, or more decorative content.

---

## 2. Product Position

### What Scripture Quest should keep

- The adventure vocabulary: towers, floors, seals, shards, relics, hearts, quests, and the Arena.
- The four-volume scripture-mastery campaign and personal tower climb order.
- Short, rewarding sessions that work well for children, youth, families, and adults.
- Offline-first behavior and a useful no-account experience.
- Honest self-assessment as a fallback where browser capabilities are limited.
- A warm, encouraging tone. Difficulty should feel invitational, not punitive.

### Where BibleMemory.com sets the competitive baseline

BibleMemory currently emphasizes first-letter typing, automatic spaced review, trouble-word heat maps, custom passage import, audio recording/playback, speech recognition, progress history, groups, multi-user support, and cross-device sync. Scripture Quest does not need to copy its presentation, but it does need equivalent learning depth in the highest-value areas.

Relevant sources for future implementers:

- [Bible Memory getting started and spaced-review flow](https://biblememory.com/pages/getting-started)
- [Bible Memory game and first-letter practice overview](https://biblememory.com/bible-memory-games)
- [Bible Memory App Store feature listing](https://apps.apple.com/us/app/the-bible-memory-app/id496790833)
- [Bible Memory groups](https://biblememory.com/bible-memory-groups)
- [Bible Memory Unlimited](https://biblememory.com/unlimited)

### Scripture Quest's defensible difference

BibleMemory is a mature memorization utility. Scripture Quest can be the more motivating *journey*: a learner does not merely maintain a list of verses; they climb towers, rescue seals, reveal relics, complete meaningful challenges, and share progress with a family or class. The learning engine must become as credible as the world wrapped around it.

---

## 3. Current Technical Baseline

### Architecture

- No build step and no framework.
- `index.html` contains the app's styles, built-in data, rendering, event binding, and state logic.
- Rendering uses template strings and `innerHTML`.
- `view` contains transient UI state.
- `state` is persisted to localStorage.
- Primary storage key: `lineUponLine_v1`, or `lineUponLine_v1::<climber>` for named climbers.
- Daily Quest integration uses `lul_bridge_events` in localStorage.
- `VERSES` is a mutable array constructed from `DATA` and used throughout the app.

### Existing systems to extend, not duplicate

- Review ladder: `REVIEW_LADDER`, `sealVerse()`, `resealVerse()`, `isDue()`, `dueReviews()`.
- Study: `renderStudy()`, `pickBlankSet()`, `renderVerseHTML()`, `openProveIt()`.
- Arena: `ensureArena()`, `buildArenaQuestion()`, `makeArenaRound()`, `settleAnswer()`, `finishArenaSession()`, `renderArenaSession()`, `renderArenaResults()`.
- Daily experience: `renderToday()`, `checkinCardHTML()`, `claimDailyGift()`.
- State persistence: `loadState()`, `persistState()`, `saveState()`, current ad hoc migrations.
- Meaning colors: `classifyVerse()` and Smart Highlights already use word background colors.
- Existing Arena question types: recognition, reconstruction, self-reported recall, Untangle, Pair Match, and Lightning Round.

### Constraints

- The app is not currently inside a Git repository. Before implementation, initialize source control or create a dated backup zip. Never modify both `scripture-tower` and `scripture-tower 2`; they are currently byte-identical, and `scripture-tower` should be treated as the working source.
- localStorage size is limited. Do not store unlimited attempt logs or audio blobs there.
- Built-in towers assume 25 passages per volume. Custom passages must not silently alter tower-floor math.
- Relic art exists only for built-in Book of Mormon passages. Custom passages need an intentional fallback visual.
- Scripture text licensing and translation rights must be validated before adding automatic imports or bundled translations.

---

## 4. Priority Scorecard

Scores use 1-5, where 5 is highest. `Priority` accounts for learning impact, competitive importance, dependencies, and implementation risk.

| Feature | Learning impact | Retention impact | Competitive need | Effort | Priority |
|---|---:|---:|---:|---:|---:|
| Mastery/reward integrity fixes | 5 | 4 | 5 | 2 | **P0** |
| Attempt recording and trouble-word model | 5 | 5 | 5 | 3 | **P0** |
| First-letter recall | 5 | 4 | 5 | 3 | **P0** |
| Review Rescue Queue | 5 | 5 | 5 | 3 | **P0** |
| Guided Daily Path | 5 | 5 | 4 | 3 | **P0** |
| Adaptive difficulty and confidence | 4 | 4 | 4 | 3 | **P1** |
| Custom passages and collections | 4 | 4 | 5 | 4 | **P1** |
| Come, Follow Me / campaign packs | 4 | 5 | 5 | 2 after collections | **P1** |
| Speech recitation | 5 | 4 | 5 | 5 | **P1** |
| Personal audio loop | 3 | 4 | 4 | 4 | **P2** |
| Local family dashboard | 3 | 5 | 4 | 3 | **P2** |
| Cloud accounts, sync, and classes | 4 | 5 | 5 | 5 | **P2** |
| Guided context and application cards | 4 | 3 | 4 | 3 | **P2** |
| Generative AI study assistant | 2 | 2 | 3 | 5 | **P3** |
| Public leaderboards/social feed | 1 | 2 | 2 | 5 | **Do later or omit** |

---

## 5. Release Plan at a Glance

| Release | Name | Required outcome |
|---|---|---|
| 0 | Stable Foundations | Existing saves survive; rewards and re-seals cannot be falsely earned or farmed. |
| 1 | Memory Engine | The app records attempts, identifies trouble spots, and has verified first-letter recall. |
| 2 | The Daily Climb | Every learner sees one clear, adaptive 5-8 minute path for today. |
| 3 | Your Scriptures | Users can create collections and safely add passages beyond the built-in 100. |
| 4 | Speak the Word | Supported devices can score spoken recitation; all devices retain a good fallback. |
| 5 | Climb Together | Families and classes can assign, monitor, and encourage without exposing children publicly. |
| 6 | Understand and Apply | Context and reflection strengthen meaning without replacing memorization. |

Do not begin Release 3 until Releases 0-2 pass their acceptance tests. Do not begin backend work until the local learning data model has stabilized.

---

## 6. Release 0: Stable Foundations

### Goal

Protect existing users and make the app's claims about mastery, XP, and hearts trustworthy.

### 0.1 Add explicit schema migrations

Current migrations are scattered and check for missing fields. Add:

```js
state.schemaVersion = 3;
```

Create a sequential migration runner:

```js
const CURRENT_SCHEMA_VERSION = 3;
const MIGRATIONS = {
  2: migrateToV2,
  3: migrateToV3
};
function migrateState(rawState) { /* clone, migrate in order, validate */ }
```

Requirements:

- Never delete unknown fields.
- Make each migration idempotent.
- On parse or migration failure, preserve the original localStorage string under a timestamped recovery key before falling back.
- Add `exportProgress()` and `importProgress()` using a versioned JSON file before making broad state changes.
- Import must validate structure, show a summary, and require confirmation before replacing current progress.

### 0.2 Classify learning evidence

Add an evidence map:

```js
const ARENA_EVIDENCE = {
  text2ref: "recognition",
  ref2text: "recognition",
  theme2ref: "recognition",
  pairMatch: "recognition",
  finishVerse: "reconstruction",
  fillBlank: "reconstruction",
  findError: "reconstruction",
  buildVerse: "reconstruction",
  wordScramble: "reconstruction",
  timedRecall: "recognition",
  firstLetter: "recall",
  fullRecitation: "recall"
};
```

Rules:

- Recognition earns Arena score, quest progress, and practice history.
- Reconstruction can improve the weakness score and earn Arena rewards.
- Only recall evidence can re-seal a due verse.
- A recall completed after revealing words or spending a reveal hint does **not** re-seal. It remains useful practice.
- Self-reported Full Recitation may re-seal only when the learner chooses a passing confidence and did not peek.
- Later, verified speech may re-seal when its score passes the configured threshold.

Modify `settleAnswer()` so `isDue(p)` is not enough by itself. Add a pure helper such as:

```js
function canResealFromAttempt(event) {
  return event.correct &&
    event.evidence === "recall" &&
    event.hintsUsed === 0 &&
    event.confidence >= 2;
}
```

### 0.3 Close repeat-reward exploits

The current non-due “Polish the seal” path can be repeated to earn XP and refill hearts. Add a daily reward ledger:

```js
state.dailyRewards = {
  date: "YYYY-MM-DD",
  claimed: {
    "polish:<verseId>": true,
    "shard:<verseId>:<stage>": true,
    "arena:<sessionId>": true
  }
};
```

Rules:

- A non-due verse may award polish XP and a heart at most once per local day.
- A shard reward is once per stage forever.
- A seal or legitimate re-seal is rewarded once per state transition.
- Every Arena round gets a `sessionId` and `rewarded` flag; `finishArenaSession()` must be idempotent.
- Repeating practice is allowed, but the UI must distinguish “Practice completed” from “Reward earned.”

### 0.4 Add minimal automated checks

Create a small test harness outside `index.html`. A suitable first structure is:

```text
scripture-tower/
  index.html
  tests/
    state-migrations.test.mjs
    review-engine.test.mjs
    learning-events.test.mjs
    arena-rewards.test.mjs
    smoke.test.mjs
```

Extract or expose pure functions without migrating the whole app to modules. Tests must cover:

- Loading a pristine state.
- Loading a current save and preserving all progress.
- Loading malformed JSON and creating a recovery copy.
- Recognition cannot re-seal.
- Peeked recitation cannot re-seal.
- Clean recall can re-seal.
- `finishArenaSession()` cannot award twice.
- Polish cannot award twice in one day.
- Daily rollover restores eligibility without altering progress.

### Release 0 acceptance criteria

- Existing test saves retain XP, streak, seals, climb order, relic status, achievements, Arena quests, stats, hearts, and highlights.
- No repeated click or duplicate finish call creates duplicate XP, hearts, badges, or re-seals.
- Arena results clearly say whether a fading seal was restored or merely practiced.
- JavaScript syntax check passes.
- Desktop and mobile smoke tests have zero console errors.

---

## 7. Release 1: Memory Engine

### Goal

Make Scripture Quest learn from the learner. A mistake should affect what is practiced next.

### 1.1 Add a bounded learning-event recorder

Add one normalized path for all Study and Arena attempts:

```js
function recordLearningAttempt(attempt) { /* validate, aggregate, persist */ }
```

Event shape:

```js
{
  id: "attempt_<timestamp>_<random>",
  verseId: "v_1_nephi_3_7",
  mode: "firstLetter",
  evidence: "recall", // recognition | reconstruction | recall
  correct: true,
  quality: 2,         // 0 again, 1 hard, 2 good, 3 easy
  hintsUsed: 0,
  errors: 1,
  elapsedMs: 18200,
  missedPositions: [12],
  timestamp: 1786400000000
}
```

Persist only the latest 200 detailed events per climber. Keep lifetime aggregates separately. Never allow an unbounded array in localStorage.

Extend each `state.progress[verseId]` record with:

```js
{
  attempts: {
    total: 0,
    correct: 0,
    recallTotal: 0,
    recallCorrect: 0,
    currentRecallStreak: 0
  },
  trouble: {
    // Word-position keys avoid ambiguity when a word repeats.
    "12": { token: "go", misses: 2, successes: 1, lastMissAt: 0 }
  },
  strength: 0,       // normalized 0..1
  lapseCount: 0,
  lastAttemptAt: 0,
  lastQuality: null
}
```

`recordLearningAttempt()` must be called from:

- First-letter recall.
- Full Recitation.
- Prove It completion or abandonment.
- Every Arena question settled by `settleAnswer()`.
- Study stage completion where a meaningful check occurred.

Do not count opening a screen, revealing a word, or tapping “harder” without a check as a successful recall attempt.

### 1.2 Calculate mastery strength

Add a pure `masteryStrength(v, p, now)` function returning 0-1. It should combine:

- 45% recent recall accuracy.
- 25% review-ladder position.
- 15% recency decay.
- 10% no-hint completion rate.
- 5% current clean-recall streak.

Initial implementation can use bounded heuristics; do not introduce machine learning. The output must be deterministic and covered by tests.

Suggested labels:

- 0.00-0.24: `Needs a foothold`
- 0.25-0.49: `Taking shape`
- 0.50-0.74: `Growing strong`
- 0.75-0.94: `Recall-ready`
- 0.95-1.00: `Deeply rooted`

Do not replace seal condition with strength. Seal condition answers “when is review due?” Strength answers “how reliably can this learner recall it?” Show both where useful.

### 1.3 Implement first-letter recall

Add `firstLetter` to `ARENA_TYPES`, `ARENA_TYPE_LABEL`, quest definitions, stats initialization, scoring, and question rendering. Also expose it from Study as a prominent practice action at Memory Stage 3 and beyond.

Behavior:

- Prompt with the reference and optional theme, never the answer text.
- Convert each scripture word to its first alphanumeric character.
- Ignore punctuation and verse-number markers for input matching.
- Display one stable slot per word so the layout does not shift.
- Accept keyboard input and provide an on-screen letter input for mobile.
- Backspace removes the learner's latest entered letter.
- A wrong letter marks the position as a miss but does not reveal the full remaining answer.
- A heart hint reveals the current word and advances one position.
- On completion, show accuracy, errors, hearts used, elapsed time, and trouble words.
- A perfect, no-heart completion is recall evidence and may re-seal a due verse.
- A completion with small errors can be graded `hard` or `good` but should not silently count as perfect.

Normalization details:

- Use the app's tokenizer rather than `text.split(" ")` so punctuation and curly apostrophes behave consistently.
- Compare case-insensitively.
- Treat em dash and verse markers as separators, not input characters.
- Preserve the canonical text for display.
- Do not implement BibleMemory's adjacent-key forgiveness in the first version; accuracy is easier to explain without it.

### 1.4 Add a Trouble Map

The Study screen already has Smart Highlights, which uses background colors. Do not overlay a second color system at the same time. Replace the single toggle with a compact segmented control:

- `Meaning`
- `Trouble spots`
- `Plain`

Trouble-map behavior:

- Shade by word-position miss ratio, using a restrained yellow -> coral scale.
- Words with fewer than two observations remain neutral.
- Tapping a trouble word opens a short phrase drill containing 3-5 words before and after it.
- Include a `Practice trouble spots` command when at least one meaningful trouble position exists.
- After a clean recall, cool the highlight gradually; do not erase all history after one success.
- Use encouraging copy such as “These words need another pass,” not “Your failures.”

### 1.5 Improve the review scheduler without discarding seals

Keep `REVIEW_LADDER = [1,3,7,14,30,90]` for continuity, but grade reviews:

| Quality | Meaning | Schedule action |
|---|---|---|
| 0 `again` | Could not recall | Decrease one rung; return to Rescue Queue later today or tomorrow. |
| 1 `hard` | Recalled with errors or a hint | Keep current rung; next interval is shorter. |
| 2 `good` | Clean recall | Advance one rung. |
| 3 `easy` | Fast, clean, no-hint recall | Advance up to two rungs. |

Preserve the Eternal Seal as a visual achievement. Instead of claiming memory can never fade, add a non-punitive `nextPolishAt` around 180 days. Missing an Eternal polish must never crack the seal or remove the reward.

### Release 1 acceptance criteria

- Every completed Arena question creates exactly one attempt aggregate update.
- Trouble positions correspond to actual word positions, including repeated words.
- First-letter recall works with short verses, long passages, punctuation, apostrophes, em dashes, and multi-verse references.
- A heart hint records both the hint and the revealed word position.
- Recognition questions improve practice stats but never re-seal.
- Trouble Map and Meaning colors never render simultaneously.
- A due verse's next review changes according to quality, not just a binary correct flag.

---

## 8. Release 2: The Daily Climb

### Goal

Remove the “what should I do?” decision. The Today screen should offer one short, personalized route with a visible finish line.

### 2.1 Build `dailyPlanFor()`

Add a deterministic daily-plan generator:

```js
function dailyPlanFor(state, date, options) { /* returns ordered tasks */ }
```

Default plan should take approximately 5-8 minutes:

1. **Rescue**: up to 3 due or cracked seals, oldest due first.
2. **Strengthen**: 1-2 low-strength passages, favoring recent trouble spots.
3. **Climb**: one meaningful Study step on an in-progress verse, or begin one recommended verse.
4. **Victory Lap**: one short Arena challenge as an optional bonus.

Task shape:

```js
{
  id: "rescue:v_1_nephi_3_7",
  kind: "rescue",
  verseId: "v_1_nephi_3_7",
  mode: "firstLetter",
  required: true,
  status: "ready", // ready | active | complete
  reason: "Seal is 2 days overdue"
}
```

Persist the selected task IDs for the day so rerendering does not reshuffle the plan. Regenerate only at local-day rollover or when every candidate becomes invalid.

### 2.2 Turn Fading Seals into the Review Rescue Queue

Rename the actionable experience, while keeping seal-condition language:

- Home heading: `Review Rescue`.
- Supporting copy: `3 seals need you today`.
- Primary action: `Begin rescue`.
- Each task opens directly into an eligible recall mode.
- After each review, advance automatically to the next rescue with a clear `1 of 3` indicator.
- Finish with a concise ceremony showing seals restored, strength gained, hearts used, and next review timing.

Add a user setting `dailyReviewLimit`, default 10. The Daily Path should show at most 3 required reviews, while `See all due` exposes the full queue. This prevents a returning user from being greeted by an intimidating wall.

### 2.3 Add confidence input where objective scoring is unavailable

After self-reported Full Recitation, ask:

- `Again`
- `Hard`
- `Good`
- `Easy`

Use a segmented control, not four large cards. Keep it to one tap. If the user peeked, cap quality at `hard` and explain why in one short line.

### 2.4 Adapt difficulty by verse

Keep the existing global Easy/Normal/Hard Arena control, but let `recommendedModeFor(v, p)` choose the question type:

- New or weak: Finish Verse, Fill Blank, phrase drill.
- Developing: Build Verse, Untangle, first-letter with optional reference cue.
- Strong and due: first-letter or Full Recitation.
- Deeply rooted: faster recall, fewer cues, or speech verification.

Never choose a mode solely because it is difficult. Choose it because it supplies the next useful form of retrieval.

### 2.5 Balance hearts around learning

Hearts should remain help, not lives. Keep the no-heart and one-heart bonus language already implemented.

Refill rules after Release 0:

- Daily blessing: refill to 3.
- New shard: +1, once per stage.
- New seal: +1.
- Legitimate re-seal: +1.
- Completed Daily Path: refill to 3 for tomorrow or grant one streak shield fragment.
- Repeated non-due polishing: no repeat refill.

The UI should always say where the next refill comes from. Never block required review because hearts are empty.

### 2.6 Clarify Home and Arena responsibilities

- Today is the coach: it says what to do next.
- Study teaches and drills one passage.
- Arena tests and mixes skills.
- Towers show campaign progression.
- Shelf celebrates and inspects rewards.
- Collection finds and organizes passages.

Do not put every statistic on Today. Keep deep Arena stats in Arena and deep passage history in passage detail.

### Release 2 acceptance criteria

- A returning learner can begin the correct next activity from Today in one tap.
- Daily task selection remains stable across reloads.
- Completing Arena quests from Home still updates and returns to a useful destination.
- The required Daily Path can be completed without spending hearts.
- Overdue backlogs are capped visually but remain accessible.
- A learner with no due reviews receives a sensible Strengthen/Climb path.
- A brand-new learner receives a first-verse onboarding path, not an empty queue.

---

## 9. Release 3: Your Scriptures

### Goal

Allow Scripture Quest to grow beyond its fixed 100 passages without breaking tower progression or scripture rights.

### 3.1 Add collections first

Create user collections before custom passage import. Collections can immediately organize built-in content and later own custom passages.

State:

```js
state.collections = [
  {
    id: "col_<uuid>",
    name: "Come, Follow Me - August",
    description: "",
    verseIds: [],
    createdAt: 0,
    updatedAt: 0,
    source: "user" // user | builtInPack | assignment
  }
];
```

Collection capabilities:

- Create, rename, reorder, duplicate, and archive.
- Add/remove passages.
- Start Study, Daily Path, or Arena filtered to a collection.
- Show progress: unstarted, learning, sealed, due, and strong.
- Export a collection without exporting unrelated personal history.

### 3.2 Add manual custom passages

State:

```js
state.customVerses = [
  {
    id: "custom_<uuid>",
    ref: "Mosiah 2:17",
    text: "...",
    theme: "Service",
    volume: "Custom",
    sourceUrl: "",
    translation: "User supplied",
    createdAt: 0,
    updatedAt: 0
  }
];
```

Implementation rules:

- Introduce `allVerses()` or a similarly explicit selector instead of mutating built-in `DATA`.
- Built-in tower functions must continue to use built-in verses only.
- Study, review, Arena filters, attempts, and collections may use built-in plus custom verses.
- Custom passages use fallback relic visuals and do not add floors to the four towers.
- Validate non-empty reference and text, normalize whitespace, warn on likely duplicates, and provide edit/delete controls.
- Deleting a custom passage with progress must offer Archive or Delete; default to Archive.
- IDs never derive only from the editable reference.

### 3.3 Add source-safe import

First version: manual paste and JSON/CSV collection import. Do not scrape a scripture website.

Before automatic lookup is implemented, decide:

- Which translations/content sets may legally be stored and redistributed.
- Whether lookup requires a licensed API.
- Whether imported text can remain offline.
- How source attribution and translation name are shown.

An official-source link can be generated independently of storing copyrighted text.

### 3.4 Ship built-in quest packs

Once collections exist, add curated read-only packs such as:

- Current Come, Follow Me passages.
- Articles of Faith.
- Mission preparation.
- Christlike attributes.
- Comfort and anxiety.
- Family scripture challenge.
- Seminary term review.

Each pack should include a title, audience, passage list, recommended order, and optional completion reward. Packs should reuse the same Study and review engine rather than creating a separate game.

### Release 3 acceptance criteria

- Existing 100-verse tower counts remain exactly unchanged.
- A custom passage can be created, studied, reviewed, added to a collection, and used in Arena.
- Archived custom content retains history and can be restored.
- Import rejects malformed or dangerously large input without damaging state.
- Export/import round-trip preserves Unicode punctuation and multi-verse references.
- No automatic content source is used without documented rights or terms.

---

## 10. Release 4: Speak the Word

### Goal

Let learners practice real recitation aloud, while remaining honest about browser support and transcription uncertainty.

### 4.1 Add feature-detected speech recitation

Build a `SpeechRecitationController` wrapper around supported browser speech recognition. Do not scatter browser-specific calls through render functions.

States:

- unsupported
- permission-needed
- listening
- processing
- result
- permission-denied
- error

Requirements:

- Microphone activation must always follow an explicit user tap.
- Explain that speech may be processed by the device/browser provider before permission is requested.
- Never record in the background.
- Do not retain audio by default.
- Unsupported or denied devices fall back to self-reported recitation without blocking progress.

### 4.2 Score words, not punctuation

Normalize canonical and transcribed text:

- Lowercase.
- Normalize curly apostrophes and dashes.
- Remove punctuation and verse numbers.
- Preserve meaningful word order.
- Use token-level edit distance to align transcript to scripture.

Result should show:

- Overall word accuracy.
- Missed words.
- Extra words.
- Longest clean phrase.
- Trouble positions sent to `recordLearningAttempt()`.

Suggested initial thresholds:

- 95%+ with no hint: `easy`.
- 88-94%: `good`.
- 75-87%: `hard`.
- Below 75%: `again`.

Make thresholds constants and test them. Do not claim perfect accuracy from browser speech recognition.

### 4.3 Add optional personal recording later

Personal audio recording/playback is separate from speech scoring. If added:

- Store audio in IndexedDB, not localStorage.
- Show storage usage and allow deletion.
- Support loop playback and a sleep-safe stop control.
- Never upload without explicit opt-in.
- Keep recording controls visually distinct from “Score my recitation.”

### Release 4 acceptance criteria

- Supported browsers can start, stop, and cancel recognition cleanly.
- Permission denial produces a useful fallback.
- Transcript scoring correctly handles punctuation and repeated words.
- Speech misses feed the same Trouble Map as typed recall.
- No microphone activity occurs before an explicit tap.
- No audio is retained without an explicit recording action.

---

## 11. Release 5: Climb Together

### Goal

Support parents, families, seminary classes, and youth groups without exposing children to public social mechanics.

### 5.1 Start with a local family dashboard

Use the existing climber-specific localStorage keys to create a device-local dashboard:

- Switch climbers.
- See today's completion, current streak, due count, verses sealed, and recent encouragement-worthy wins.
- Set a daily review limit and select assigned collections.
- Keep detailed recitation text and mistakes private by default.

This validates the dashboard before backend work.

### 5.2 Define backend boundaries before implementation

A cloud release needs:

- Authentication and account recovery.
- Parent/guardian and child roles.
- Classroom owner, leader, and learner roles.
- Invite codes with expiration and revocation.
- Row-level authorization.
- Sync conflict rules.
- Child privacy policy and data deletion.
- Encrypted transport and protected secrets.
- Abuse-resistant group discovery; ideally no public child profiles.

Do not put backend credentials or admin keys in `index.html`.

### 5.3 Sync compact state, not UI state

Sync:

- Passage definitions and collections.
- Progress aggregates and review schedule.
- Attempt summaries needed for learning decisions.
- Assignments and completion status.
- Earned rewards.

Do not sync:

- Open panels, current scroll, animations, or transient `view` state.
- Raw audio by default.
- Every keystroke.

Use stable IDs and an `updatedAt` timestamp per syncable record. Document conflict resolution before writing the API.

### 5.4 Build assignments and encouragement

Teacher/parent features:

- Assign a collection with a target date and optional daily pace.
- See participation and mastery evidence separately.
- Send preset encouragement, not unrestricted public chat in the first version.
- Celebrate personal improvement, consistency, and completion.
- Keep leaderboards private, optional, and based on more than raw XP.

Recommended group measures:

- Daily Path completion.
- Reviews completed on time.
- New seals.
- Personal-best recall improvement.

Avoid ranking children by total minutes, total mistakes, or paid advantages.

### Release 5 acceptance criteria

- A parent can tell who needs encouragement without seeing sensitive transcript detail.
- A teacher can assign a collection and see completion/mastery separately.
- One learner cannot read or alter another learner's private state without authorization.
- Offline progress syncs without duplicating rewards.
- Account deletion removes cloud data and leaves a clear local-data choice.

---

## 12. Release 6: Understand and Apply

### Goal

Help learners understand the passage they are memorizing, because meaning creates stronger memory hooks and more useful discipleship.

### 6.1 Add authored passage cards

Start with curated fields, not generative AI:

```js
{
  context: "Who is speaking and what is happening?",
  doctrine: "One concise central teaching.",
  anchors: ["important phrase", "repeated idea"],
  applicationPrompt: "One age-appropriate reflection question.",
  relatedRefs: ["..."]
}
```

Use a collapsible `Understand` section in Study. It should support memorization rather than turn the screen into a commentary page.

### 6.2 Use understanding as a memory activity

Possible low-risk modes:

- Choose the best one-sentence meaning.
- Match a key phrase to its doctrine.
- Put a passage in its story/context.
- Write or record a personal memory hook.
- Connect two related scriptures.

These activities can recommend a verse or improve engagement, but they must not re-seal it. Understanding and verbatim recall are distinct forms of evidence.

### 6.3 Add AI only behind strict boundaries

If an AI assistant is later added:

- Use it for optional explanations, memory hooks, or reflection prompts.
- Ground answers in the selected passage and approved source material.
- Clearly label generated content.
- Never let generated text replace canonical scripture text.
- Never use AI judgment as the only source of recitation mastery.
- Do not send a child's name, audio, attempt history, or personal notes without explicit, informed consent.
- Provide a non-AI path for every core learning task.

### Release 6 acceptance criteria

- Authored context is source-reviewed and visually secondary to the scripture.
- Understanding activities never falsely alter verbatim recall strength.
- Generated content, if present, is labeled and removable.
- Core Study and Arena remain fully usable with AI disabled.

---

## 13. Cross-Release Data Contract

Target state shape after Releases 0-3:

```js
{
  schemaVersion: 3,
  xp: 0,
  streak: 0,
  lastDay: null,
  bestStreak: 0,
  shields: 0,
  calendar: {},
  settings: {
    dailyReviewLimit: 10,
    sound: true,
    reducedMotion: false,
    defaultRecallMode: "firstLetter"
  },
  progress: {
    "<verseId>": {
      stage: 0,
      sealed: false,
      sealedAt: null,
      reviewLevel: 0,
      reviews: 0,
      nextReviewAt: null,
      lastReviewAt: null,
      nextPolishAt: null,
      provenIt: false,
      hl: [],
      attempts: {},
      trouble: {},
      strength: 0,
      lapseCount: 0,
      lastAttemptAt: null,
      lastQuality: null
    }
  },
  learningLog: [],
  dailyPlan: {
    date: "YYYY-MM-DD",
    tasks: []
  },
  dailyRewards: {
    date: "YYYY-MM-DD",
    claimed: {}
  },
  customVerses: [],
  collections: [],
  climb: {},
  arena: {},
  achv: {},
  edits: {}
}
```

Rules for all future fields:

- State is data, not rendered HTML.
- Persist dates as epoch milliseconds except keys intentionally based on local calendar dates.
- Arrays with user activity must have an explicit maximum length.
- IDs are stable and never based only on editable labels.
- Every reward-producing operation must be idempotent.
- Every state migration must have a fixture from the previous version.

---

## 14. Analytics and Success Measures

Instrumentation should answer whether learners are remembering scripture, not merely tapping more screens. Begin with local summaries; add consent-based product analytics only after a privacy decision.

### North-star measure

**Weekly successful delayed recalls per active learner.**

A delayed recall is a no-reveal recall attempt completed at least one day after the previous successful attempt.

### Supporting learning measures

- Due-review completion rate.
- Seven-day delayed-recall accuracy.
- Trouble positions that improve after focused practice.
- Percentage of re-seals supported by recall evidence.
- Average hints/hearts per successful recall.
- New seals that are still recallable 7 and 30 days later.

### Product measures

- Time to first meaningful Study action.
- First Daily Path completion.
- Day 1, Day 7, and Day 30 return rates.
- Percentage of sessions started from the Daily Path.
- Quest completion and Arena return rate.
- Custom collection creation and completion.
- Parent/class assignment completion after those features exist.

### Guardrails

- Do not optimize raw XP if XP can be farmed.
- Do not count self-reported recognition as verified recall.
- Do not use child-facing public rankings as a retention metric.
- Track permission denials and unsupported speech locally so the fallback can be improved.

---

## 15. UX and Accessibility Rules

- The primary action on each screen must be visually obvious and singular.
- Use icons for familiar tools, but include accessible labels and tooltips.
- Keep cards at the app's existing radius and visual language; do not redesign the product into a generic dashboard.
- Never show answer-bearing themes inside answer options when the theme identifies the correct reference.
- Reset transient selection classes before the next question renders. Reusing the same option position must not look preselected.
- Keep fixed dimensions for answer slots, pips, heart rows, and word tiles to prevent layout shifts.
- Support keyboard input for recall modes and visible focus states throughout.
- Honor `prefers-reduced-motion`; do not require animation to understand success.
- Never use color alone to communicate correct, wrong, due, or selected state.
- Test at 320px, 390px, 768px, 1024px, and a wide desktop viewport.
- Long passages must keep the current prompt and actions reachable without text overlap.
- Preserve a no-sound path and never autoplay voice/audio.

---

## 16. Test Matrix for Every Release

### Automated

- JavaScript syntax extraction and `node --check`.
- State migration fixtures.
- Review scheduling at boundary dates.
- Duplicate reward prevention.
- Token normalization and repeated-word alignment.
- Daily-plan determinism with fixed date and random seed.
- Custom passage import validation.
- Attempt aggregation and log truncation.

### Browser smoke tests

- Brand-new guest.
- Returning guest with in-progress verse.
- Named climber profile.
- Learner with 20+ overdue reviews.
- Learner with all hearts spent.
- Learner with all 100 built-in passages sealed.
- Unsupported speech browser.
- Microphone permission denied.
- Mobile portrait, mobile landscape, tablet, and desktop.
- Reload or close the page during an Arena round and after a settled answer.

### Regression checks

- Tower floor order remains personal and stable.
- Relic popup, Study link, share action, and official scripture link still work.
- Home quest progress survives leaving Arena.
- Daily quests rotate once per local date.
- Prove It options do not retain old selected styling.
- Untangle shows prior phrase context for mid-verse windows.
- Hearts decrement once per hint and result bonuses use the actual count.
- No console errors or missing asset requests.

---

## 17. Implementation Discipline for an AI Agent

For each release:

1. Read `HANDOFF.md`, `CHANGES.md`, this roadmap, and the relevant functions in `index.html`.
2. Verify the working source and create a recoverable checkpoint.
3. Write or update the state migration before UI code that depends on it.
4. Implement pure logic and tests before binding it to rendered controls.
5. Reuse the existing `state`, `view`, rendering, SFX, FX, toast, and card conventions.
6. Keep changes scoped to one release; do not opportunistically redesign unrelated screens.
7. Test with old-state fixtures and a clean localStorage state.
8. Run browser verification at desktop and mobile widths.
9. Update `CHANGES.md` with Changed, Why, State Migration, and Verification sections.
10. Export a dated zip containing the whole `scripture-tower` folder.

Every implementation handoff must report:

- Files changed.
- State fields added or migrated.
- User-visible behavior.
- Exact tests run and their results.
- Known limitations.
- The dated export path.

---

## 18. Features Deliberately Deferred

Do not prioritize these until the Memory Engine and Daily Climb are working and measured:

- More generic multiple-choice Arena modes.
- A second virtual currency.
- Public profiles or global leaderboards.
- A public social feed or child-to-child direct messages.
- Large decorative redesigns.
- More achievement catalogs without stronger learning evidence.
- Generative AI chat as the default Study interface.
- Full native-app rewrites.
- Automatic scripture scraping.
- New tower art for every possible custom passage.

They may add novelty, but they do not solve the core success problem: helping someone remember the right words days and months later.

---

## 19. First Implementation Ticket

The next AI should begin with this bounded ticket, not the entire roadmap at once.

### Ticket: Learning Integrity and Reward Guardrails

**Scope**

- Add `schemaVersion` and a safe sequential migration runner.
- Add export/import progress controls in a low-emphasis Settings section.
- Add `ARENA_EVIDENCE` and `canResealFromAttempt()`.
- Prevent recognition, hinted recall, and peeked recitation from re-sealing.
- Add a daily reward ledger.
- Limit non-due polish XP/heart to once per verse per day.
- Make `finishArenaSession()` idempotent.
- Add focused tests for all behaviors above.
- Update `CHANGES.md` and export a dated zip.

**Do not include yet**

- First-letter UI.
- Trouble Map UI.
- Daily Path redesign.
- Custom passages.
- Speech recognition.

**Definition of done**

- All current saves migrate without loss.
- False re-seals and repeat reward farming are closed.
- Users still receive encouraging practice feedback when an attempt is not eligible to re-seal.
- Tests and browser smoke checks pass.

After that ticket is complete, implement Release 1 in this order:

1. `recordLearningAttempt()` and aggregate state.
2. First-letter normalization and pure tests.
3. First-letter Study mode.
4. First-letter Arena mode and quest.
5. Trouble-position updates.
6. Trouble Map and phrase drills.
7. Graded review scheduling.

---

## 20. Final Product Principle

The app should never confuse *recognizing a scripture* with *being able to recall it*. Recognition is useful practice. Reconstruction is stronger practice. Recall is mastery evidence. Scripture Quest becomes truly competitive when its game rewards make that distinction feel natural, generous, and exciting.
