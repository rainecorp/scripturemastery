# Scripture Quest — Implementation Roadmap v3

**Status:** Source of truth for implementation.
**Supersedes:** `IMPLEMENTATION_ROADMAP.md` (v1) and roadmap v2. Do not implement from either.
**Incorporates:** `ROADMAP_REVIEW.md` — read it for the evidence behind these decisions.
**Prepared:** 2026-08-10
**Target:** `scripture-tower/index.html` @ SHA-1 `4e4251e0dda62b7fe3ee916f759fd7f9511c477b`
**Audience:** The developer or coding agent doing the work.

> ### ⚠️ BUILD MODE
> **There are no production users.** No save-compatibility constraint exists. Do not write migrations to preserve existing progress, do not grandfather sealed verses, and do not let any legacy shape constrain a design decision. Where the current code does something wrong, **fix it properly rather than working around it.** The one thing worth keeping is a `schemaVersion` field and a migration *runner*, so that discipline exists before launch — not because anything needs migrating today.

---

## 0 · How to use this document

Work **ticket by ticket, in order**. Tickets are `T1`…`T20`, each with Scope, Out of scope, and Definition of Done. Do not start a ticket until the previous one's DoD is verified in a browser.

Three rules that override everything else:

1. **Do not rebuild the product.** Towers, relics, seals, shards, hearts, quests, Arena, and the ceremony vocabulary are the identity and they work. This roadmap strengthens what's underneath them.
2. **No framework, no build step, no npm dependency in the shipped app.** Test tooling may use Node; the app may not.
3. **Never edit `scripture-tower 2/`.** Byte-identical today, will drift. `scripture-tower/` is the only source. Archive it in T1.

After every ticket: append a `✅ DONE` / *Shipped* note directly under that ticket's own entry in §8, covering what changed, why, and exactly how it was verified (specific commands run, specific assertions checked live in the browser), then commit with a long descriptive message. **This superseded the original plan of updating `CHANGES.md` and exporting a dated zip after each ticket** — once T1 put the project under real git version control, git history became the actual audit trail, and `CHANGES.md`/dated zips were an artifact of a pre-git workflow. `CHANGES.md` has been stale since T1 and should not be treated as current; do not resume updating it unless the project moves off git. See `HANDOFF.md` for the full picture of what "current" means in this repo.

---

## 1 · Product definition

### 1.1 Two audiences, one engine

| Track | Who | Default campaigns | Default text |
|---|---|---|---|
| **Seminary** | LDS youth in seminary, their teachers and parents | Doctrinal Mastery (2023) | LDS scripture (public-domain edition — §3.4) |
| **Christian** | General Christian individuals, families, small groups | Christian Foundations | Berean Standard Bible |

Both tracks share every mechanic. Nothing in the game vocabulary is denomination-specific — towers, seals, relics, and climbing read as faith-adjacent fantasy to any Christian audience. **Only content and naming differ.** Solve it in the data model (§3), never by forking the app.

### 1.2 The competitive picture

| | Doctrinal Mastery (official) | The Bible Memory App | Bible Versus | Scripture Quest |
|---|---|---|---|---|
| Price | Free | $1.99/mo · $9.99 · $19.99 lifetime · $49.99/yr | Free + IAP | §6 |
| Ratings | 4.3★ · 231 | 4.8★ · ~32,000 | New | — |
| Languages | 37 | 15+ | — | 1 |
| First-letter memorize | ✅ (slider) | ✅ (typing) | — | Stages 0–4 |
| Key-phrase flashcards | ✅ | — | — | ✅ T10 |
| Spaced repetition | ❌ | ✅ | ❌ | ✅ → T13 |
| Leaderboards | ❌ | ✅ **two** — points, and *verses currently held* | ✅ ranked 1v1, global | ❌ → T17 |
| Groups | ❌ | ✅ | ✅ private rooms | Local → T18 |
| Custom content | Broken per reviews | ✅ | — | ❌ → T11 |
| Streaks / daily loop | ❌ | Partial | ❌ | ✅ — the identity |

**Three things to take from this table.**

*The wedge.* In Seminary, the incumbent is free and official but has no spaced repetition, no streak, and no reason to open it tomorrow. In Christian, the incumbent is excellent but is a *utility*. Scripture Quest is the only one that's a *journey*.

*Steal BibleMemory's second leaderboard.* They rank two ways: total points, and **number of verses you currently hold** — sealed and not overdue. That second metric is un-farmable and rewards exactly the behavior the product wants. Points can be ground out; held verses cannot. **This is the ranking metric.** (§5.3)

*Bible Versus is the classroom threat.* Real-time 1v1 with private rooms for youth groups. Classroom mode (T18) is not optional.

### 1.3 The loop

> **Rescue fading seals → strengthen trouble spots → climb one study step → prove recall → return tomorrow.**

Every feature serves this or is deferred.

---

## 2 · The sealing problem, and the answer

### 2.1 What's wrong

`index.html:6676–6704`. The "harder → harder → Recite & Seal ✦" button calls `sealVerse(p)` with **no check of any kind**. Tap one button ~500 times and every verse is sealed, every tower lit, every relic earned. Everything downstream — floors, relics, strength, the Daily Path, any metric, any leaderboard — is computed on a claim nobody verifies.

With a leaderboard (§5.3) this stops being a data-quality issue and becomes a cheating issue. **T6 is the most important ticket in this document.**

### 2.2 Principle: feedback, not failure

A failed recall attempt costs **nothing**. No XP loss, no heart, no streak break, no seal damage, no cooldown. Retries are unlimited and free. What it always returns is the specific words that tripped the learner.

The check is a **gate**, not a punishment.

### 2.3 The Recall Check — full spec

**Mode:** First-Letter Recall (typed). Every major competitor converged on it, it's objective, fast, phone-friendly, and half-built already in `renderVerseHTML` stage 3.

**Presentation** — show reference + key phrase + the passage's line shape as empty slots (one per word, fixed dimensions, no reflow). Never show the text. Input: physical keyboard, or an on-screen A–Z pad on touch.

**Per keystroke**

| Event | Response |
|---|---|
| Correct letter | Slot fills with the bold letter. Advance. |
| Wrong letter | Shake. **Do not advance. Do not reveal.** `misses[pos] += 1`. |
| Wrong letter QWERTY-adjacent to the correct one | **Slip** — gentle shake, no miss recorded, no combo break. Disabled by `settings.strictMode`. |
| 3rd miss at one position | Word auto-reveals 1.2s, slot fills, advance. `revealed[pos] = true`. **Not** a heart spend — anti-stuck valve. |
| Heart hint | Reveals current word. `revealed[pos] = true`. Spends a heart. |
| Backspace | Step back one, clear that slot. |

**Scoring**

```
words     = canonical word count (the one tokenizer — T3)
cleanHits = positions filled with zero misses and no reveal
accuracy  = cleanHits / words        → shown as a percentage
slips     = words - cleanHits
reveals   = count of revealed positions
```

**Grade on an error budget, not a raw percentage.** A 7-word verse cannot reach 95% with one error; a naive threshold makes short verses *harder* than long ones. Display the percentage; grade on the budget.

```js
const goodBudget = Math.max(1, Math.round(words * 0.05));   // ≥95%, min 1 free wobble
const hardBudget = Math.max(2, Math.round(words * 0.15));   // ≥85%, min 2
```

| Condition | Grade | Copy |
|---|---|---|
| `slips === 0 && reveals === 0` | `easy` | "Flawless. Not one stumble." |
| `slips <= goodBudget && reveals === 0` | `good` | "Sealed at 96%. Two words wobbled — here they are." |
| `slips <= hardBudget && reveals <= 1` | `hard` | "Sealed, but it's fragile. We'll bring this back sooner." |
| otherwise | `again` | "Not yet — and that's fine. Here's exactly what tripped you." |

**Gates** — **first seal** requires `good`+ (earns the ceremony, relic, and floor; it should mean something). **Re-seal** requires `hard`+. **`again`** records the attempt, updates the trouble map, awards practice XP, offers *Try again* and *Study this one more*, and costs nothing.

**Evidence table**

| Mode | First seal | Re-seal |
|---|---|---|
| First-Letter Recall | ✅ `good`+ | ✅ `hard`+ |
| Cumulative Chaining (T14) | ✅ `good`+ | ✅ `hard`+ |
| Speech recitation (T19) | ✅ `good`+ | ✅ `hard`+ |
| Self-reported recitation | ❌ never | ✅ `hard` max, no peek |
| Recognition — `text2ref`, `ref2text`, `theme2ref`, `pairMatch`, `timedRecall` | ❌ | ❌ |
| Reconstruction — `finishVerse`, `fillBlank`, `findError`, `buildVerse`, `wordScramble` | ❌ | ❌ |

**Accessibility escape hatch.** Anyone who cannot type must have a path: self-report advances stages and re-seals at `hard`; speech is a full path. Never leave a user unable to progress.

---

## 3 · Content architecture

### 3.1 Why the current model breaks

Today `DATA` is keyed by four LDS volume names → `VERSES` → `TOWERS[volume]` → `state.climb[volume]` → `bookAreas(vol)` hardcodes 5 areas × 5 = 25.

*Volume* is doing four jobs at once: canon, book grouping, tower identity, and campaign membership. Two tracks with different-sized campaigns — and user-built towers of arbitrary height — collapse it.

### 3.2 The model

```js
// ---- Passage: canonical content ----
{
  id: "p_7f3a91c4",                 // ★ opaque, stable, NOT derived from ref or text
  canon: "restoration",             // "bible" | "restoration"
  book: "1 Nephi",
  ref: "1 Nephi 3:7",
  sortKey: [2, 1, 3, 7],            // canon, book order, chapter, verse
  keyPhrase: "I will go and do",
  topic: "Prophets and Revelation",
  texts: { lds1920: "…", kjv: null, bsb: null },
  textVerifiedAt: "2026-08-15",
  textHash: "sha1:…",
  source: "builtin"                 // builtin | pack | user
}

// ---- Campaign: an ordered set of passages that IS a tower ----
{
  id: "camp_dm_bom", track: "seminary",
  name: "The Ancient America Tower", shortName: "Book of Mormon",
  subtitle: "Doctrinal Mastery",
  passageIds: [ … ],                // ordered; length = tower height
  towerArt: { kit: "ancient-america-temple", baseWidth: 640 },
  hue: "#34d399", icon: "🌴", tag: "Hold the rod. Climb to the tree.",
  order: 1, status: "active"        // active | retired | locked | custom
}

// ---- Track ----
{ id: "seminary", name: "Seminary — Doctrinal Mastery",
  campaignIds: [...], defaultTranslation: "lds1920",
  extraPacks: ["pack_articles_of_faith", "pack_retired_sm"] }

// ---- Collection: a grouping, not a tower ----
{ id: "col_…", name: "Come, Follow Me — August", passageIds: [], source: "user" }
```

**Rules**
- `state.progress` is keyed by passage `id`. Nothing else may key progress.
- **IDs are opaque and generated once.** `verseIdFor()` (`:2928`) derives IDs from the reference string, which the v1 roadmap correctly forbids — a user renaming a custom passage would orphan their own progress. Build mode means we simply fix it: generate `p_<8 hex>` at authoring time, store it in the data file, never recompute.
- Tower height derives from `campaign.passageIds.length`. Delete every hardcoded 25.
- `bookAreas(vol)` → `campaignAreas(campaignId)`, chunking into 5 areas of `ceil(n/5)`.
- A passage may appear in many campaigns. Progress is per-passage and shared — memorizing John 3:16 once counts everywhere.
- `allPassages()` is the only accessor. Never mutate a builtin array.

### 3.3 Seminary content

**Doctrinal Mastery (2023)** — four campaigns. Transcribe references, **key scripture phrases**, topics, and texts from the [official Core Document](https://www.churchofjesuschrist.org/study/manual/doctrinal-mastery-core-document-2023/doctrinal-mastery-passages-and-key-phrases?lang=eng). Do not trust this file's summary of it — automated reads of that page returned inconsistent per-course counts. Transcribe from source.

**Retired Verses of Scripture Mastery** — the current 100 passages, kept as a named pack with its own towers. Framing: *"The verses a generation grew up on. Still worth carrying."* Parents and leaders memorized these; it's a genuine draw.

**Articles of Faith** (13). Cheap, high demand, already half-referenced in `POPULAR_REFS`.

### 3.4 Text sourcing and licensing — resolved, with one correction that helps

Your reading is right: the copyrighted material in modern LDS scripture is the **editorial apparatus** — 1981/2013 chapter headings, footnotes, index, Bible Dictionary, Guide to the Scriptures — not the scripture text itself, which long predates it. You're not using any of that.

One practical correction that makes the plan actually work. "Original published version" is a trap for a memorization app:

- The **1830 first edition** has no verses at all. Versification came in **1879** (Orson Pratt).
- The **1920 edition** (James E. Talmage) is the last major LDS edition published before the US public-domain cutoff (works published before 1930 are public domain as of 2026) **and** it carries the modern chapter-and-verse structure. Same for the **1921 Doctrine and Covenants** and **1921 Pearl of Great Price**.

**So: source from the 1920/1921 editions, not 1830.** You get public-domain text *with* the verse numbering everyone actually uses.

⚠️ **One real risk to accept knowingly.** Text differs in small ways between 1920 and 2013 — punctuation, occasional wording. In a *verbatim memorization* app judged letter by letter, a student whose printed copy says one thing while the app expects another is a support ticket and a trust problem. Two options:

- **(a)** Ship the 1920/1921 text, label the translation honestly ("1920 edition"), and diff it against the current edition so you know exactly which passages differ. If a Doctrinal Mastery passage differs, flag it in-app.
- **(b)** Request permission from Intellectual Reserve for the current text. Free apps are routinely granted quotation permission; a paid app is a different conversation.

**Recommendation: (a), plus run the diff in T4 so you know the blast radius.** KJV is public domain in the US (Crown letters patent apply in the UK only — worth one line of legal review before UK distribution, not a blocker).

I'm not a lawyer and this isn't legal advice; the reasoning is the pre-1930 US rule. Have counsel confirm before a paid launch.

### 3.5 Christian content

**Translations — public domain only:**

| Translation | Status | Use |
|---|---|---|
| **BSB** — Berean Standard Bible | Public domain, 2023 | Christian-track default. Modern, readable. |
| **KJV** | Public domain (US) | Seminary default option; bridges both audiences |
| **WEB / ASV** | Public domain | Optional extras |
| NIV, ESV, NASB, NLT, CSB | **Licensed — do not ship** | Paid agreements. Deferred. |

Store text **per passage per translation**, not whole Bibles. The packs total a few hundred verses, so payload stays small and offline stays real.

**Starter campaigns** (20–25 passages each, so each is a full tower): Foundations · The Gospel · Comfort & Anxiety · Armor of God · Psalms Worth Knowing · For Kids.

**Tower art.** `jerusalem-temple-tower` and `tabernacle-tower` are already faith-neutral and work for both tracks. `ancient-america-temple` and `restoration-temple` are Seminary-only. The Christian track needs 2–4 new kits; until they exist, reuse the neutral two with different hues. **Do not block content on art.**

**Relic art.** `relicFor()` (`:3049`) already has themed emoji fallback via `FALLBACK_EMOJI` and a `designed:false` flag. Christian-track passages use it. Polish the fallback frame so it reads as intentional; do not commission 150 relics.

### 3.6 Onboarding

First-run, before anything else:

> **Which path are you climbing?**
> · Seminary — Doctrinal Mastery · Christian Scripture Memory · Family / Kids · Just show me around

Sets `state.track`, `state.translation`, and the starting campaign. Changeable in Settings; changing tracks **adds** campaigns, never hides progress.

---

## 4 · Towers that scale — and this is nearly free

### 4.1 The tower is already procedural

`TV_ASSET` (`:5901`) and `buildTowerVisual()` (`:5936`) already stack the tower from a **5-piece kit**:

```
roof-final-25.png  →  top-window-24.png  →  22 × window-repeat.png  →  window-01.png  →  bottom.png
```

`repeatLevels: 22` is the *only* thing that makes a tower 25 floors. All four kits share identical piece geometry (640w · 251/87/94/302). Parameterize that one number and the tower renders at **any** height with zero new art.

### 4.2 What to change

```js
function towerGeometry(floors){
  // floor 1 = window-01, floor N = roof, floor N-1 = top-window, rest = repeat
  return { ...TV_ASSET, repeatLevels: Math.max(0, floors - 3), floors };
}
```

Generalize `tvLevelTop()`, `tvLevelHeight()`, and `tvGlowTop()` off the hardcoded `25` / `24` / `1` to `floors` / `floors-1` / `1`. Handle small towers gracefully: **fewer than 4 floors** renders base + windows + roof with no repeat section, and **very tall towers** need the viewport scale clamp in `tvLevelOffset()` re-derived from `worldHeight` rather than assuming 25.

### 4.3 The mechanic this unlocks

**Endless personal towers.** A user's custom collection becomes a tower that *grows a floor every time they add a passage*. Add a verse → the tower gets taller → the roof lifts. That's a better motivator than any leaderboard, it's a genuinely novel mechanic no competitor has, and it's a parameterization rather than a feature build.

Design notes:
- Cap the rendered height for performance (~120 floors) and switch to a compressed "distant tower" view above that, with the top 25 floors detailed.
- Custom towers get a distinct kit (a plainer "pioneer tower" is fine) so built-in campaigns stay visually special.
- Tower height is the honest bragging metric — and because floors require sealed verses (T6), it can't be faked.

---

## 5 · Motivation, monetization, and social

### 5.1 What to take from Duolingo — and what not to

Duolingo replaced Hearts with **Energy** in 2026: 25 units that deplete on *every* exercise regardless of correctness, capping free users at roughly 2–3 lessons a day. It monetizes well and it is the wrong model here.

🔴 **Hard rule: never gate review, re-seal, or the Daily Path.** Charging someone to keep alive scripture they already memorized is both an ugly proposition for a faith product and strategically self-defeating — review *is* the retention loop that makes people want to pay. Anything that throttles it kills the habit that funds you.

Keep hearts as **hints, not lives**, exactly as they are today.

| Duolingo mechanic | Verdict |
|---|---|
| Streak + streak freeze | ✅ Already have it (`shields`) |
| Daily quests | ✅ Already have it |
| XP + ranks | ✅ Already have it |
| Weekly leagues, promote/relegate | ✅ Adopt — but on the right metric (§5.3) |
| Daily finish line ("you're done for today") | ✅ Adopt — the Daily Path (T16) |
| Energy / lesson caps | ❌ Never |
| Hearts as lives that block progress | ❌ Never |
| Loss-aversion nag notifications | ❌ Not for this product |

Duolingo's real lesson isn't hearts. It's *a daily loop with a visible finish line, a social comparison, and loss aversion on the streak*. You already have two of the three.

### 5.2 Free vs paid

The competitive attack is **a more generous free learning core than BibleMemory** (which paywalls heat maps, flashcards, audio, and speech behind PRO) plus a lower price. Undercutting alone is the weaker lever; generosity plus undercutting is defensible.

**Free — permanently useful, never crippled**
- Every built-in campaign: Doctrinal Mastery, Retired, Articles of Faith, Christian Foundations
- All 5 study stages and the full Recall Check
- **Unlimited review, forever, never gated**
- Daily Path · streaks · shields · towers · relics · shelf · achievements
- Arena: all question types, unlimited quick sessions
- 3 hearts, refilled by the daily blessing and by earning
- Leagues and leaderboards *(social hooks drive acquisition — keep them free)*
- Local profiles, export/import
- Up to **10 custom passages** and **1 custom collection**

**Quest+ — paid**
- Unlimited custom passages, collections, and **custom towers**
- Trouble Map, heat maps, phrase drills
- Speech recitation scoring
- Personal audio recording + loop playback
- Cross-device sync and cloud backup
- Family and classroom dashboards, assignments
- All translations
- Instant heart refill
- Full history and advanced stats

### 5.3 Leaderboards — rank the thing that can't be farmed

BibleMemory ranks two ways: total points, and **number of verses currently held**. Adopt the second as primary.

**Primary ranking metric: Verses Held** — passages that are sealed **and not overdue**. It cannot be ground out, it decays if you stop reviewing, and it is exactly the behavior the product wants. Secondary: current streak, and weekly clean recalls.

**Never rank on XP.** XP is farmable today (§T7) and will always be farmable enough to corrupt a ladder.

**League structure** — weekly, 30 climbers per group, top 7 promote / bottom 5 relegate, 10 divisions. Copy the shape; it's well-tuned.

**Child-safety rules, non-negotiable:**
- Display names only, never real names by default; no photos; no free-text chat in v1.
- Under-13 accounts default to **family/class leagues only**, never global.
- No DMs. Preset encouragement only.
- A visible opt-out that costs nothing.

### 5.4 Pricing

BibleMemory's actual ladder, and yours applying "beat monthly by $1, lifetime by $20":

| Tier | BibleMemory | **Scripture Quest** | Delta |
|---|---|---|---|
| Monthly | $1.99 | **$0.99** | −$1.00 ✓ |
| Yearly | $49.99 (Unlimited) | **$29.99** | −$20.00 ✓ |
| One-time unlock | $9.99 (PRO) | **$8.99** | −$1.00 ✓ |
| Lifetime | $19.99 | **$9.99** ⚠️ | −$10.00 |
| AI tier, monthly | $5.99 (Bible Intelligence) | **$4.99** | −$1.00 ✓ |

⚠️ **The lifetime rule doesn't survive arithmetic.** Their lifetime is only $19.99, so "beat it by $20" is $0.00. $9.99 is my recommendation because it preserves their *ratio* — BibleMemory's lifetime is 10× their monthly; $0.99 × 10 = $9.99 — so it reads as "half their price" rather than "broken." Your call; the number is a one-line constant.

Two flags, stated once and then I'll build whatever you choose:

- **$0.99/month nets roughly $0.84** after Apple's 15% Small Business Program rate. Funding sync, speech, and cloud storage at that price needs real volume. The free-tier generosity in §5.2 is the stronger differentiator; consider holding monthly at $1.49 and spending the difference on being more generous than them.
- **A $9.99 lifetime at $0.99/month pays back in 10 months**, which will cannibalize subscriptions hard. That's the same ratio BibleMemory runs, so it's not reckless — just know it's a lifetime-heavy revenue mix.

### 5.5 Distribution — website + all app stores

One codebase, three surfaces:

1. **Web** — the PWA is the product (T15). Installable, offline, no store review, instant updates, no platform cut. This is also your marketing site's "try it now."
2. **Android** — PWA wrapped as a Trusted Web Activity (Bubblewrap / PWABuilder). Near-zero extra code.
3. **iOS** — wrap with **Capacitor**, not a bare WebView. Apple guideline 4.2 rejects thin web wrappers; adding native speech, notifications, and StoreKit clears it.

**Payments constraint that affects architecture:** Apple and Google require their own in-app purchase for digital goods. You cannot bill Stripe inside the iOS app. So the entitlement system must accept **three** receipt sources — StoreKit, Google Play Billing, and Stripe (web) — and resolve them to one server-side entitlement per account. **Design this before writing the paywall**, not after; retrofitting it is expensive. It also means accounts (T20) must exist before paid features ship, since an entitlement has to attach to something.

---

## 6 · The first-letter continuity design

**Decision:** bold the first letter of every word at every study stage *except* the first-letters stage.

**Why it's better than it sounds.** The bolded letters at Stage 0 are *exactly* what remains at Stage 3. The learner spends every earlier stage unconsciously reading the same cue they'll later be asked to produce, so first-letter recall stops being a cliff — and the Recall Check looks identical to what they've been reading all along.

| Stage | Name | Treatment |
|---|---|---|
| 0 | Full Text | Every word: first letter bold |
| 1 | Light Fade (30% hidden) | Visible and revealed words: first letter bold |
| 2 | Heavy Fade (65% hidden) | Same |
| 3 | First Letters | **No extra bolding** — the letter is the whole token; normal weight, reading as "the bold parts are all that's left" |
| 4 | Blackout | No words |
| — | Recall Check | Typed letters render bold, matching Stage 3 |

**Implementation** — this is exactly where the current code fails:
- Route through the canonical tokenizer (T3). "First letter" means first **word character**: `"they` bolds the `t`, not the quote. Today's regex `/^(\w)(\w*)(.*)$/` returns `null` for such tokens and **renders the whole word** — verified, 3 occurrences in Joseph Smith—History 1:15–20.
- Don't leak internal punctuation. Today `it's` → `i…'s` and `glory—to` → `g…—to`, handing over the word's shape.
- Bolding must not change layout width, or the verse reflows between stages.

---

## 7 · Code structure — the split

6,984 lines / 362 KB in one file: CSS `10–2393`, body `2395–2403`, JS `2404–2982`, `DATA` `2408–2918`. Every edit re-reads the whole file, collisions are likely, and a test harness is impossible.

**Split in T2 as one mechanical commit with zero behavior change.**

### 7.1 Critical: no ES modules yet

`<script type="module">` is CORS-blocked over `file://` in every major browser. The current workflow is *unzip and double-click*. **ES modules would break it.**

- Use **classic `<script src>` tags in dependency order.** No build, no bundler, works from `file://`.
- Each file attaches to one namespace object — `SQ.tokenize = …` — not scattered globals. Later module conversion stays mechanical.
- Pure-logic files end with a guarded export so Node can test them:
  ```js
  if (typeof module !== "undefined") module.exports = { tokenize, normalize };
  ```
- Revisit ES modules when the app is served over HTTP (T15).

### 7.2 Layout — as shipped in T2, updated through T9

Filenames are **numbered, and the numbers are the load order.** They are not decoration: `03-state.js` runs its boot migrations the moment it loads, and `24-boot.js` calls `render()`. Reordering the tags breaks the app. The numbers also preserve the CSS cascade, which the original single `<style>` block gave us for free.

```
scripture-tower/
  index.html               <link>s, root divs, ordered classic <script>s
  css/   01-base 02-towers 03-ceremony 04-pages 05-arena
         06-ui-v2 07-arena-v2 08-responsive
  data/  passages.js       registered Seminary content pack: passages,
                           Campaigns, and Track (T9; T10–T12 add packs)
  js/    00-namespace     SQ = the one global — must load first
         00-config        every tunable number: intervals, ranks, milestones,
                          difficulty bands, the whole Arena table
         00-content       ★ pure Passage/Campaign/Track contracts + validation
         00-tower-geometry ★ pure N-floor procedural geometry
         00-tokenize      ★ the canonical tokenizer (T3)
         01-catalog       allPassages/allCampaigns accessors, difficulty tiers
         02-relics-data   designed relic metadata + fallback mapping
         03-state         climber, STORE_KEY, load/persist/save, migrations, streak
         04-review        seal/re-seal/eternal, REVIEW_LADDER, RANKS
         05-relics        shard rendering, relic popup, chests
         06-helpers       tower stats, recommended verse, toast, openStudy
         07-sfx  08-fx    WebAudio synth · canvas confetti
         09-checkin       daily check-in, journey milestones
         10-achievements  definitions, sweep, overlay
         11-share  12-ceremony  13-shelf
         14-arena         engine: types, quests, hearts, question building
         15-arena-views   trials, setup, session, results
         16-shell         view state, render() dispatch
         17-today  18-towers  19-library
         20-text          tokenize, isWord, escHTML, verse numbers
         21-highlight     Scripture Intelligence roles, lexicon, phrases
         22-study         renderVerseHTML, blank picking, study screen
         23-proveit  24-boot  25-bridge
  tests/ fingerprint.js   deterministic DOM + computed-style snapshot
         seed-fixture.js  the mid-progress save both runs share
         seed-fixture.html one-click fixture loader for browser smoke tests
         content.test.js  opaque IDs, content contracts, areas, tower geometry
  tools/ split-from-baseline.py   how T2 was produced; --verify proves verbatim
```

**Files still to come:** `learning.js` (T13) · `entitlement.js` (T20) · additional content packs (T10–T12) · richer fixtures. Tier 00 is "depends on nothing" and is where pure logic goes; new pure modules belong there, not wedged into a numbered slot.

**One deviation from the pre-split guess, deliberate.** CSS is eight files, not five, because the boundaries had to fall on existing section banners to keep the cascade byte-identical — grouping by theme would have meant reordering rules.

`config.js` was held back from T2 for the same reason (gathering scattered constants is a *move*, and T2 allowed none) and **shipped after T3 as `js/00-config.js`** — 20 constants out of five files, verified as a pure move: every declaration byte-identical, 83 of 84 fingerprints unchanged with `_meta.scripts` the only mover.

### 7.3 Procedure — follow exactly

1. Commit untouched (T1).
2. CSS out verbatim, original order. Verify.
3. `DATA` out verbatim. Verify.
4. JS out **in the order it currently appears**, one section per file, adding only `SQ.` assignments. Verify.
5. Only then begin behavior changes.

Do not reorder, rename, or "improve" anything during the split. A split commit that also changes behavior is unreviewable and becomes the source of every bug for a month.

**The hazard that makes step 4 delicate.** Function declarations hoist across a whole `<script>`, but *not* across separate files. Any top-level code that runs at load and calls a function declared further down was fine in one blob and throws once split. There is exactly one such case in this codebase: `migrateV2()` (originally `:3133`) runs immediately and calls `todayStr()`, declared 72 lines later. The `03-state.js` boundary keeps them together. Check for new instances before moving any boundary.

### 7.4 How T2 proved "zero behavior change"

Three independent checks, because "it looked fine" is not evidence:

1. **Verbatim** — every extracted body concatenates back to `git show SPLIT_BASE:index.html` byte for byte. All 34 files pass. This is what makes the diff reviewable: the only new lines in the entire commit are file headers, the `SQ` footers, and the shell.
2. **Fingerprint** — `tests/fingerprint.js` hashes the rendered DOM of 76 states (every tab, all four towers, all ten Collection filters, four passages × five study stages, all eleven Arena question types, results, three overlays) plus 8 computed-style probes, plus `renderVerseHTML` / `chunkVerse` / `tokenize` / `classifyVerse` over all 100 passages. **82 of 84 identical.** The two that moved are `_meta.scripts` 1→27 and `_meta.sheets` 3→10 — the split itself. CSS rule count held at 812.
3. **Runs from `file://`** — the non-negotiable one. Opened directly off disk: 27 scripts, 198 `SQ` bindings, 100 passages, fully styled. Plus zero console output and zero failed requests over HTTP, and a hand-played Arena round.

Re-use that harness for T3 and T6. A refactor that can't produce this evidence isn't done.

---

## 8 · Tickets

### Phase A — Foundations

**T1 · Source control and safety net** — ✅ **DONE**
`git init`; `.gitignore` for `*.zip`, `.DS_Store`, `__MACOSX/`; baseline commit. Archive `scripture-tower 2/` → `_archive-scripture-tower-2/` with `DO-NOT-EDIT.txt`. Remove stale in-folder copies once captured in git.
**DoD** — one baseline commit; exactly one `index.html` in the tree.
*Shipped:* two commits — a baseline capturing the tree untouched, then the cleanup. Four copies of `index.html` existed; three were committed first (recoverable via `git show`) then removed. Six `.zip` snapshots moved to gitignored `_archive/zips/` rather than deleted — they'd bloat the repo permanently and can't be diffed. `scripture-tower 2/` was verified byte-identical (same md5 on `index.html`) before archiving, so nothing unique was frozen. The baseline is tagged **`SPLIT_BASE`**.

**T2 · Mechanical code split** — ✅ **DONE**, §7. Classic scripts, `SQ` namespace, zero behavior change.
**DoD** — `index.html` < 200 lines · double-click still works · every screen renders identically (Today, Towers, tower detail, Study, Prove It, Arena setup/session across all 11 types/results, Shelf, Collection, achievements, relic popup, share, ceremony) · zero console errors or 404s · before/after screenshot diff shows no change.
*Shipped:* 6,984 lines → **67-line shell + 8 CSS + 26 JS**, all bodies verbatim, 198 bindings on `SQ` (`let`/`var` via live accessors so nothing goes stale). Evidence in §7.4: byte-identical reassembly, 82/84 fingerprints unchanged, runs from `file://`. Screenshot diff was **superseded by** the DOM+computed-style fingerprint, which is strictly stronger — it compares markup and resolved styles exactly rather than by eye, and covers 76 states instead of a handful.

**T3 · The canonical tokenizer ★** — ✅ **DONE**
The app has four incompatible notions of "word position": `tokenize()`+`isWord()` (`:6301`), `split(/\s+/)` (`:4342`, `:4357`, `:4373`, `:4380`), `clean.split(" ")` (`:6757`), `text.split(" ")` (`:3910`). **Verified: 7 of 100 passages already disagree** — JS—History 1:15–20 (503 vs 504), D&C 19:16–19 (89 vs 91), D&C 58:42–43, 64:9–11, 76:22–24, 121:34–36, 130:20–21. The divergence accumulates mid-passage, so it can't be corrected after the fact. Trouble maps, first-letter, phrase drills, and speech alignment all silently corrupt without this.
**Scope** — `js/tokenize.js` returning `{ index, raw, norm, isWord, isVerseMark, leadPunct, firstLetter, tailPunct }`. `norm` = lowercased, curly quotes/dashes normalized, punctuation stripped — used for all comparison. `index` counts `isWord` tokens only and is the *one* meaning of word position. Migrate every consumer; delete all other tokenizers.
**DoD** — test asserts Study index === Arena index across all passages, the 7 known cases pass · covers curly/straight apostrophes, em/en dashes, leading `"`/`(`, trailing punctuation, verse markers, `D&C`, `Joseph Smith—History`, hyphenates, numerals · no `split(" ")` or `split(/\s+/)` remains in `js/` or `data/`.

*Shipped as `js/00-tokenize.js`* (tier 00 = pure, no dependencies), with `tests/tokenize.test.js` — **79 assertions, no framework, `node tests/tokenize.test.js`**.

**The single cause, confirmed:** all seven divergences are a free-standing em dash. The study path skipped it (no `\w`), the other three counted it as a word. Nothing else in the corpus diverged — the text is otherwise clean (single spaces, no digits, no tabs).

**Two API decisions worth knowing:**
- **Tokens cover the whole string, whitespace included**, so `tokenize(t).map(x=>x.raw).join("") === t` always. Renderers walk tokens; only `isWord` tokens carry an `index`. That separation is what lets the em dash keep its place on screen while occupying no word position.
- **`spanByWords(text, from, to)`** cuts the *source* between two word positions instead of rejoining word tokens with spaces. Rejoining would have silently deleted every free-standing dash from Prove It, Finish the Verse and the snippets. Spans run start-of-word to start-of-word, so consecutive spans partition the text exactly; a test asserts this holds at three step sizes across all 100 passages.

**Behaviour change, reviewed one by one.** 64 of 84 fingerprints unchanged, including `fn.renderVerseHTML` (all 100 passages × 4 stages), `fn.classifyVerse`, `fn.verseNumbers`, and all 11 Arena question types. All 20 that moved trace to the corrected word counts, and **exactly one is user-visible beyond a number**: `D&C 19:16–19` counted 91 words and now counts 89, which moves it across the 90-word boundary from **Challenge ⛈️ to Hard 🌧️** — so its relic goes Gold → Green Gold. That is the correct tier; the old count was two phantom dashes.

`isVerseMark` is opt-in (`tokenize(text, {verseMarks:true})`) rather than "digits are verse numbers". No shipped passage contains a digit, so guessing would only have created the risk of silently demoting a real numeral out of the word index — the exact bug class this ticket exists to end. T10 turns it on for numbered text.

### Defects found in flight

Found while doing T3, deliberately **not** fixed there — T3 was a tokenizer unification, and folding in output changes would have made the 20 fingerprint movements unreviewable. Both are now one-liners because the tokenizer exposes what they need.

**D1 · Multi-verse numbering never worked.** `verseNumberMarks()` ([js/20-text.js](scripture-tower/js/20-text.js)) detects sentence ends with `else if(/[.!?]/.test(tok))` on *non-word* tokens. But sentence punctuation is glued to the word before it (`earth.`), so that token is a word and never reaches the branch — only whitespace and lone dashes do. `sentenceStarts` is therefore always `[0]`, and every multi-verse passage renders a single verse number at word 0 instead of one per verse. Fix: test `t.tailPunct` on word tokens. Marked in the source.

**D2 · The first-letter stage leaks words that open with a quote.** `renderVerseHTML()` stage 3 ([js/22-study.js](scripture-tower/js/22-study.js)) builds its stub with `/^(\w)(\w*)(.*)$/`, which cannot match a token starting with punctuation, and the `if(!m)` fallback returns **the whole word**. Four tokens in Joseph Smith—History (`(for`, `“they`, `“Never`, `“I`) render in full at the hardest study stage — it was three until T4c restored the passage's missing clause, which begins `(for at this time…`. Note the fallback also drops the `letter` class, so these leak as plain `.w` spans and are not even tappable-to-reveal like the rest. Fix: build the stub from `leadPunct + firstLetter + "…" + tailPunct`. Belongs with §6, since that section is rewriting this exact code path.

**D3 · Two dead branches, preserved and labelled.** The second lead-in width in `scrambleLeadIn()` is unreachable (`start < 14` forces `leadStart` to 0), as is D1's sentence branch. Both are commented in place rather than removed, so the next person doesn't "fix" a behaviour that was never running.

**D4 · The guest "Save your progress" pill could sit on top of a `.cer` modal and block taps underneath it.** ✅ **FIXED**, same session. Found in T14 while testing Prove It's new on-screen keyboard at a mobile width. `#savePill` ([js/25-bridge.js:57](scripture-tower/js/25-bridge.js)) is `position:fixed; z-index:120`, permanently present for any guest who hasn't created a username; every full-screen overlay — Recall Check, Prove It, the seal ceremony, relic/achievement/share pop — is `.cer{position:fixed; z-index:80;}` ([css/03-ceremony.css:7](scripture-tower/css/03-ceremony.css)). The pill outranked all of them, so on a narrow-enough viewport whatever the pill's fixed `bottom:96px` position landed on was not just visually covered but genuinely unclickable (`document.elementFromPoint` returned the pill, not the button beneath it). Confirmed at 375×812 on a guest fixture: Prove It's on-screen `b`, `n`, `m` and ⌫ keys were all fully blocked, and — pre-dating T14 entirely — Prove It's recognition-mode third answer option was partly covered by the same pill on the same viewport, so this was never specific to production chaining, only newly *noticed* by it. Fixed with one rule added to `#savePill`'s own scoped `<style>` block: `body:has(.cer.show) #savePill{ display:none; }` — the pill hides itself whenever any overlay is open and reappears when the last one closes, with no changes needed to any of the six overlays' own open/close code and no risk to overlays added later. Chosen over raising every `.cer`'s z-index because hiding is also the better *look* — a floating pill sitting on top of a modal's own chrome would still be a visual mess even if clicks now reached through to it correctly. `:has()` is well within this codebase's existing browser-support floor (`css/03-ceremony.css` already relies on `dvh` units, a similarly modern feature, with no fallback), and matters more than usual here since the product is headed for iOS/Play wrapping, where a blocked on-screen control is the whole interaction, not a keyboard-specific inconvenience. Verified live: `document.elementFromPoint` on the "b" key now returns the key itself, not the pill, while Prove It is open; the pill's `display` flips from `block` to `none` the instant `.show` is added and back on close.

*One bug caught while writing the fix, worth naming so it isn't repeated:* the first draft of the code comment above the new rule used backticks (`` `.cer` ``) as markdown-style inline-code formatting — inside the `pill.innerHTML = \`...\`` template literal those backticks are not comment text to the JS parser, they terminate and re-open the surrounding template literal, silently re-tokenizing everything after them into unrelated (but still syntactically legal) JS. `node --check` passed anyway, because the mis-tokenized result was still valid syntax; it only threw (`TypeError: "...".cer is not a function`) at runtime, in a real browser. Caught by loading the page and reading the console, not by static checks — the concrete argument for always doing the browser pass, not just the Node suite, before calling a change done.

**T4 · Text sourcing, verification, storage guard** ✅ DONE
Source Seminary text from the 1920/1921 editions (§3.4). **Diff against the current edition and record every passage that differs** — that diff is the risk register. Add `textVerifiedAt` + `textHash` to every passage; unverified text renders a marker. Wrap `persistState()` (`:3125`) in try/catch — on `QuotaExceededError` shed the detail log first, never progress, and warn visibly. Add a storage budget and a `Storage used: N KB` line in Settings.
**DoD** — every passage carries verification metadata · the 1920↔2013 diff exists as a checked-in file · a forced quota failure loses nothing and explains itself.

*Shipped (T4a — storage guard):* `persistState()` returns a boolean and never lets a failed write pass for a successful one. On a non-quota failure (private browsing, storage disabled) it warns and gives up honestly. On `QuotaExceededError` it walks `STORAGE_SHED_LADDER` — the Daily Quest event queue trimmed to 20, then check-in history older than 400 days — retrying the write after each rung so the least possible is given up, and naming what was dropped in the toast. **Progress is not on the ladder and never will be.** If the ladder is exhausted, `storageLastError` is set and Today renders a red card saying progress is *not* being saved; the previous save on disk is left untouched rather than half-overwritten. `storageReport()` exposes used/budget/mine, and a quiet `Storage used: N KB` line sits at the foot of Today (there is no Settings screen yet — move it when there is), escalating to an amber card at 80% of a deliberately conservative 4 MB budget. Verified by simulating a real byte cap in the page: rung 1 alone recovers the write (bridge 200 → 20 entries) with xp, seals and streak all persisted; rung 2 alone sheds two 500/600-day-old calendar entries and keeps the 30-day-old one; the terminal case returns `false`, sets `kind:"quota"`, leaves the on-disk save byte-identical, and keeps the in-memory state intact. Fingerprints: 81/84, the three movers all the intended ones — `_meta.cssRules` 812→821, and the Today DOM and its `#body`/`.wrap` heights growing by the new line.

*Shipped (T4b — verification metadata):* [js/00-verify.js](scripture-tower/js/00-verify.js) resolves every passage to one of three states — `verified`, `drifted`, `unverified` — and [data/text-sources.js](scripture-tower/data/text-sources.js) is the checked-in provenance record it reads, keyed by reference. **The metadata is a hash of the reviewed text, not a boolean flag**: a flag rots the moment someone fixes a typo and leaves it set, whereas recording `textHash()` of the exact text that was checked demotes a passage to `drifted` automatically on any later edit — one character, one curly quote — with no discipline required from anybody. `verificationFor()` computes the hash live from `v.text` rather than stamping it on the verse at build time, because `state.edits` can replace the text after the catalog builds and T11 will let people write their own. The Study screen carries the note directly under the passage: quiet for `unverified` (currently all 100), loud for `drifted`. `SHOW_TEXT_VERIFICATION` in config silences it, though silencing it does not make the text correct. 38 assertions in [tests/verify.test.js](scripture-tower/tests/verify.test.js), including that a hand-edited hash cannot grant verification and that `sourceRecordFor()` round-trips. Fingerprints: 53/84, with all 31 movers accounted for — 28 study DOM states each growing by exactly 263 characters (the same note on every passage, since none is verified), `css.study`, and the two `_meta` counters. **Zero non-study movers.**

*Harness fix, found in flight:* T4a's live `Storage used: N KB` line made the Today fingerprint depend on whatever else was in `localStorage` at capture time — including the harness's own baseline blobs. Worse, it usually changed the hash *without* changing the length, which reads exactly like a real regression. `tests/fingerprint.js` now pins `storageUsedBytes()` for the duration of a capture, the same treatment `Math.random` already got, and restores it after. Verified by capturing twice over identical code: 84/84. Any future ticket that puts environment-dependent data on screen needs the same treatment.

*Decision made 2026-08-11:* **current editions, confirmed usable by the owner.** That retires the 1920↔2013 diff — its only purpose was sizing the blast radius of shipping older text. It is replaced by something more useful: a diff of our own 100 passages against the current edition, which is a register of what is wrong *today*.

*Shipped (T4c — the edition diff):* all 100 passages fetched from their own chapter pages on churchofjesuschrist.org (87 pages) and compared character by character. **82 matched exactly** and are recorded in [data/text-sources.js](scripture-tower/data/text-sources.js). **18 did not**, and are documented in [data/TEXT-REVIEW.md](scripture-tower/data/TEXT-REVIEW.md) in five classes: **E** — Joseph Smith—History 1:15–20 is missing 358 characters, two whole clauses; **A** — five passages carry modernized KJV wording (`anything`/`any thing`, `showing`/`shewing`, `male servant`/`manservant`, `fullness`/`fulness`, `offering`/`offerings`); **B** — nine passages flattened an em dash to a comma or a spaced dash, *the same defect T3's tokenizer work surfaced from the other end*; **C** — D&C 131:2 drops the edition's editorial brackets; **D** — two apostrophe-shape differences that cannot be adjudicated from a fetch. **Nothing was auto-applied.** The fetch is mediated by a summarizing model, so a mismatch is evidence rather than proof, and rewriting scripture from an automated diff is precisely the failure this system exists to prevent. Unresolved entries stay out of `text-sources.js`, so the app keeps saying on screen that their source is unverified. Tools checked in as [tools/text-fetch-plan.js](scripture-tower/tools/text-fetch-plan.js) and [tools/text-compare.js](scripture-tower/tools/text-compare.js).

*Shipped (T4d — corrections applied).* Owner's direction: match what the Church prints, since most users are from that population. Before editing scripture I stopped trusting the model-mediated fetch and re-read all 17 affected chapter pages **straight out of the DOM**, and that caught a real error: **the fetch had been silently normalizing curly apostrophes to straight ones.** Class D was a fetch artifact — D&C 84:33–39 and D&C 130:22–23 were already correct. Applying the diff automatically would have made two right passages wrong and then certified them as verified. That is the argument for the whole design in one incident.

**16 corrected, 2 confirmed already right.** Joseph Smith—History 1:15–20 regained 358 characters (2609 → 2967), including the whole of `(for at this time it had never entered into my heart that all were wrong)` and the final sentence of verse 20. All 100 passages now verify, each entry recording *how* it was checked — 21 against the page's own text, 79 against a fetch of it. **No difficulty tier and no relic metal moved:** every correction stayed inside its word-count band.

*Consequence for the tests.* `tests/tokenize.test.js` pinned the seven em-dash passages by name, so correcting the text made those assertions demand that our data stay wrong. The free-standing-dash contract now lives on fixtures — where it belongs, since T11 will let people write passages containing one — and the corpus gets an invariant instead: **no shipped passage contains a spaced dash.** That is a regression guard on the T4 corrections. 88 assertions, up from 79.

*Fingerprints:* 41/84, and every one of the 43 movers is text-derived — the four study screens, six library views, `today`, `tower.bom` and `tower.dc`, five `fn.*` probes and one arena question. `tower.nt` and `tower.ot` correctly did **not** move: their climb-choice cards happen to pick no corrected passage, which is the kind of detail that makes a wide diff checkable rather than just plausible. **Zero `css.*` and zero `_meta.*` movement** — no structural change hid inside a data change.

*Still open on T4:* nothing. Note that restoring the JS-H clause made **defect D2 slightly worse** — four leaked words at the first-letter stage now instead of three, because the restored clause opens `(for`. Still deferred to §6, which rewrites that code path.

### Phase B — Honest mastery

**T5 · Recall engine (logic only)** — `js/recall.js`, §2.3 as pure functions over tokenizer output: session state, keystrokes, QWERTY adjacency, miss/reveal accounting, error budgets, grades. No rendering.
**DoD** — tests: perfect → `easy` · one slip on 40 words → `good` · one slip on 6 words → `good` (budget floor) · 3 misses → auto-reveal + advance · reveal disqualifies `good` · adjacent-key slip records no miss with `strictMode` off and does with it on · backspace restores prior state · accuracy correct at every boundary.
✅ DONE.

*Shipped* as [js/00-recall.js](scripture-tower/js/00-recall.js) — tier 00 (its only functional dependency is the tokenizer, also tier 00; nothing here runs at load time, only when a session is created). `createRecallSession(text)` builds one slot per canonical word from `tokenWords`; `typeLetter`/`revealHint`/`backspace` mutate it and return an event descriptor; `scoreRecallSession`/`recallBudgets`/`gradeRecallSession` read it without mutating. `recallMeetsGate(grade, "first"|"reseal")` encodes the §2.3 evidence table (good+ to first-seal, hard+ to re-seal) since it's four lines of pure logic sitting right next to the grade table T6 will need it against.

QWERTY adjacency is a computed physical key grid (three staggered rows, not a hand-typed table) rather than an asserted lookup — checkable geometry instead of a claim. Backspace resets the slot **completely** (fill, misses, and reveal all clear), not just its display, on the reading that "go back and try that one again" should mean a clean attempt.

86 assertions in [tests/recall.test.js](scripture-tower/tests/recall.test.js), covering every DoD line plus the budget floor at several word counts, both auto-reveal and heart-reveal disqualifying `good`/`easy` (and two reveals separately dropping `hard`), safety on completed/empty sessions, and the gate table. Cross-checked against the real tokenizer on a genuine 19-word passage as an integration sanity check outside the fixture-based unit tests.

**T6 · Gate sealing on the Recall Check ★★** *(the most important ticket here)*
Build the Recall Check UI on T5: fixed-dimension slots in the passage's line shape, keyboard + on-screen pad, live percentage, per-position feedback. `"Recite & Seal ✦"` / `"Recite & Re-seal ✦"` open it; `sealVerse()` and `resealVerse()` are reachable **only** through a passing grade. Results panel shows percentage, grade, the exact words that wobbled, and *Try again* (free, unlimited) + *Study this one more*. `again` is never punitive. Self-report retained for accessibility at `hard` max, first-seal disallowed. Copy pass for "feedback, not failure."
**DoD** — no path in the app seals without a passing grade · a new user seals their first verse in under three minutes and it feels like a win · failure costs nothing and always names the words · keyboard-only completion works end to end · screen reader announces each slot result.
✅ DONE.

*Shipped* as [js/26-recall-check.js](scripture-tower/js/26-recall-check.js), a thin renderer over T5's `js/00-recall.js` — nothing here decides whether a letter was right, only draws the result and, on a passing grade, calls `sealVerse()`/`resealVerse()`. `"Recite & Seal ✦"` / `"Recite & Re-seal ✦"` in [js/22-study.js](scripture-tower/js/22-study.js) now call `openRecallCheck(v, "first"|"reseal")` instead of sealing directly; the exact reward logic that used to sit inline there (XP, heart refill, streak touch, ceremony/toast) moved verbatim into `performSeal()`/`performReseal()`, called only from a passing results screen.

**Audited every reachable path to `sealVerse`/`resealVerse` in the app — three total, all three now gated:**
1. Study screen first seal → Recall Check, `good`+ required.
2. Study screen re-seal → Recall Check, `hard`+ required, or the self-report escape hatch (below).
3. Arena's Full Recitation ([js/14-arena.js](scripture-tower/js/14-arena.js) `settleAnswer`) — this **is** the self-report mode from the §2.3 evidence table, and it was calling `resealVerse()` unconditionally with the words fully visible via a no-cost peek. First-seal-via-self-report was already structurally impossible (`isDue()` requires `p.sealed`), but peeking-then-claiming was not caught. Fixed: the reseal is now skipped whenever `q.hinted` (the same flag `spendArenaHeart()` already sets for the peek button — no new state needed) is true for that question, with a toast explaining the round still scored Arena points but didn't count as re-seal evidence.

**Self-report inside the Recall Check itself** (re-seal only, never offered when `mode==="first"`) needs no separate "no peek" mechanism to enforce — the whole modal never renders `v.text` anywhere, in any phase, so there is nothing to peek at by construction. Confirmed in the browser by asserting none of the passage's own words (4+ letters) appear anywhere in the self-report screen's HTML.

**Slots are fixed-dimension by construction, not by convention:** every state a slot can be in — pending, current, filled, revealed — renders exactly `core.length` characters (all underscores, first-letter-plus-underscores, or the full word), so a slot's width never changes as it fills. Verified visually and by DoD's own claim about line shape holding steady.

**Two deliberate scope cuts, both because their infrastructure doesn't exist yet:**
- **No practice XP on an `again` result**, though the ticket text mentions it. `state.dailyRewards` (T7) doesn't exist yet, and awarding XP on *every* completed attempt — with retries explicitly free and unlimited — would hand-build exactly the kind of farmable loop T7 is coming to close. `again` is fully non-punitive (zero cost) without it; the reward is deferred, not the guarantee.
- **"key phrase" shown as `v.theme`.** The `keyPhrase` field is part of T9's not-yet-built content schema (§3.2); `v.theme`, which every passage already carries and already displays elsewhere in Study, is the closest existing stand-in and gives the same memory cue in spirit.

Verified live in the browser end to end: first-seal happy path (typed all first letters via real `KeyboardEvent`s → `easy` grade → `Seal it ✦` → ceremony opens, `+50 XP`, matches the original inline behavior exactly) · a forced `again` result (three real misses per word → auto-reveal fires each time → gate correctly refuses to seal → `Try again` spins up a fresh session at zero cost, `Study this one more` returns to Study) · physical `Backspace` fully resets a slot (`{filled:false, revealed:false, misses:0, letter:null}`, byte-identical to its pristine state) · re-seal via self-report (`+25 XP`, ladder rung climbed, matches `resealVerse()`'s own math) · Arena peek-vs-no-peek on the same due, sealed verse side by side — peeked keeps the Arena score but leaves `reviewLevel` untouched, unpeeked climbs it · `Enter` on the results screen keyboard-triggers the primary button · zero console errors across every tab after the change. 86 recall + 79 tokenize + 38 verify assertions still pass; no other screen's rendering changed.

**T7 · Close every reward farm**
Ledger: `state.dailyRewards = { date, claimed: { "polish:<id>", "stage:<id>:<n>", "prove:<id>", "arena:<sessionId>" } }`. Close all four — **stage toggle** (`:6670`→`:6676`, currently +10 XP and a heart per Easier/Harder cycle, unbounded), **Prove It** (`:6893`, `:6906`, replayable forever), **polish** (`:6722`), and **`finishArenaSession()`** (`:4473`, add `sessionId` + `rewarded`, make idempotent). UI distinguishes **"Practice completed"** from **"Reward earned."**
**DoD** — no sequence produces unbounded XP or hearts · duplicate finish awards nothing · repeat practice still feels welcome. *(Blocking for T17 — a leaderboard over farmable XP is worthless.)*
✅ DONE.

*Shipped* as `ensureDailyRewards()`/`isRewardClaimed()`/`claimReward()` in [js/03-state.js](scripture-tower/js/03-state.js), alongside the storage guard and the other state-shape helpers already living there. `state.dailyRewards = {date, claimed:{}}` lazy-inits and resets on a stale `localISODate()`, matching the pattern `ensureArena()` already uses. `claimReward(key)` is the one thing every call site touches: an atomic check-and-set that returns `true` the one time a key is new and `false` every time after — callers gate the XP/heart payout on the return value directly, never on a separate check-then-set, so there's no window for two calls in one tick to both slip through.

**All four:**
- **Stage toggle** ([js/22-study.js](scripture-tower/js/22-study.js)) — was `+10 XP` and a heart on *every* Easier/Harder cycle, unbounded. Now keyed `"stage:<id>:<n>"` per verse per stage-number per day. The shard-reveal FX stayed on its own existing check (`shardsFor(p) > prevShards`, all-time, never daily) since a verse's shards are a permanent collectible — the two checks diverge exactly once, on a *second* day's first pass through a stage already reached on an earlier day: no new shard fires (already revealed), but the daily XP does. Verified live: an honest first pass through stages 0→4 pays `10, 10, 10, 10`; five Easier→Harder cycles on the same day at stage 4 pay `0, 0, 0, 0, 0`; forcing the ledger's date stale and repeating the *same* transition pays `10` once more, then `0` again same-day.
- **Polish** — was `+5 XP` and a heart on every tap of an already-sealed, not-due verse, the cheapest farm in the app. Now `"polish:<id>"`, once per verse per day; every later tap still polishes (same sound, same `nextReviewText()`), with copy that says plainly what happened: *"Polished again — practice completed. Today's polish reward is already claimed."* Verified: `5, 0, 0, 0` across four taps.
- **Prove It** ([js/23-proveit.js](scripture-tower/js/23-proveit.js)) — was `+15 XP` on *every* completion, forever; the puzzle resets fresh each open so nothing remembered it had already paid. `p.provenIt` (the one-time relic-glow unlock) and the XP are now two separate things — the flag stays exactly as one-time-ever as before, the XP is capped `"prove:<id>"` once per day. Verified: first completion `+15 XP` with the unlock toast, second completion same day `+0` with *"Proven again — practice completed."*
- **`finishArenaSession()`** ([js/14-arena.js](scripture-tower/js/14-arena.js)) — audited every reachable call site first (two, both in `js/15-arena-views.js`) and found they already guard on `T.done` before calling in, so a same-object double-invocation wasn't actually reachable through the UI today. Added `sessionId` + `rewarded` on the trial object anyway, exactly as specified: `T.rewarded` is checked as the function's first line and set as its last, independent of `T.done` (which has other jobs — blocking further answers, driving the results screen — and shouldn't be the *only* thing standing between a future refactor and a double payout). The `"arena:<sessionId>"` ledger entry gives it the same audit trail shape as the other three. Verified directly: calling `finishArenaSession(T)` three times on one object pays out on the first call only (`67, 0, 0` — `42` base score plus the function's own no-hints heart bonus, computed once); `T.rewarded` and the ledger entry both confirm claimed.

**Deliberately not touched:** sealing and re-sealing. Sealing is state-monotonic — `p.sealed` can only ever flip once per verse, so it was never a same-session farm to begin with. Re-sealing is already time-gated by `REVIEW_LADDER`, real calendar days apart, not a button anyone can spam. Neither needed a ledger; both were already correctly one-shot before T7.

Zero render errors across every tab after the change; 86 recall + 79 tokenize + 38 verify assertions still pass. No new file needed — all four fixes and the ledger itself live in the three files that already owned this logic.

**T8 · Schema version + migration runner + export/import**
`state.schemaVersion`, sequential idempotent migrations, never delete unknown fields, timestamped recovery key on parse failure, `exportProgress()` / `importProgress()` with validation and a confirmation summary. **Build mode: no legacy migration needed** — this establishes the discipline before launch. Drop `state.edits` (read at `:3150`, never written; the editing UI is gone).
**DoD** — clean and corrupt fixtures both handled · export→import round-trips including Unicode punctuation and multi-verse refs.
✅ DONE.

*Shipped* in [js/03-state.js](scripture-tower/js/03-state.js), alongside the storage guard and reward ledger already living there.

**Schema version + runner.** `SCHEMA_VERSION = 1` and one real migration: drop `state.edits`, exactly as the ticket asks — the field was read at the old per-verse-edit site and never written since that UI was removed, so it was pure dead weight on every save. `runMigrations(s)` walks from `s.schemaVersion` (missing → treated as 0) up to the target, applying only the steps still needed, and stamps the version once at the end — a state already current runs nothing. Per the ticket's build-mode note, this does not carry the app's whole prior history forward step by step; it establishes the mechanism so the *next* real schema change is one small versioned function instead of another `if(state.x == null)` dropped wherever the change happened to be made. `runMigrations` takes an optional second `migrations` argument (default: the real list) — `MIGRATIONS` is a `const`, so unlike `state` it never becomes a `window` property a console test could swap out; the parameter is what makes the sequential/resume/idempotent properties provable against the *real* runner rather than a reimplementation of it, with zero effect on any production caller (all of which take the default).

**Never delete unknown fields** is enforced by what a migration is *allowed* to do, not by a runtime check: `run()` bodies only add or explicitly retire a named field. Verified directly — a field the shipped migration doesn't know about survives untouched.

**Recovery key.** `loadState()` used to swallow a `JSON.parse` failure and return blank state, which then got written straight over the corrupt (but often only *slightly* corrupt) bytes on the very next save — a parse error silently became data loss. It now copies the raw string to `<STORE_KEY>::recovery::<timestamp>` before falling back, so the bytes survive even though nothing reads them back automatically yet (that's a recovery UI, a later ticket). Verified: a deliberately truncated JSON blob in `localStorage` doesn't throw, falls back to blank state, and the exact original bytes reappear verbatim under the new key.

**Export/import** is three pure data functions, no DOM, no download link, no confirm dialog — matching how T5 built the recall engine as logic with the UI deferred, since there's still no Settings screen for a real Export/Import button to live in (noted since T4a). `exportProgress()` wraps `state` with a format version, timestamp, and climber name. `previewProgressImport(json)` validates and returns a summary *without touching live state* — rejects unparseable JSON, the wrong shape, and an unrecognized `exportFormat`; accepts either the wrapped export or a bare state object. `applyProgressImport(data)` — only ever called with a previously-validated preview's `data` — runs the same migration runner an older export would need, then replaces state and persists. Verified: a clean round trip is byte-identical; a synthetic import with a genuinely free-text Unicode climber name (accents and an emoji) and a real multi-verse-reference passage (`2 Nephi 9:28–29`, en dash included) both survive the summary untouched; `applyProgressImport` correctly replaces both the live state and what's in `localStorage`.

Zero render errors across every tab after the change; 86 recall + 79 tokenize + 38 verify assertions still pass.

### Phase C — The right content

**T9 · Content architecture** — ✅ **DONE** — §3.2. Retire volume-keyed `DATA` and the hardcoded 25; opaque `p_<hex>` IDs; `campaignAreas()`; `allPassages()`.
**DoD** — tower floor counts derive from campaign length · no hardcoded 25 remains · no ID is derived from a reference or text string.

*Shipped:* The 100 existing retired Scripture Mastery passages now register as a Seminary content pack containing canonical **Passage**, ordered **Campaign**, and **Track** records. Every passage has a generated-once opaque `p_<8 hex>` ID embedded in `data/passages.js`; compiled builtin records and membership arrays are frozen, `allPassages()` is the runtime passage boundary, and no reference/text-to-ID function remains. The four legacy groups are explicitly framed as active retired campaigns so T10 can add current Doctrinal Mastery without confusing the two sets. Designed relic metadata and all 25 WebP filenames were re-keyed to the new stable IDs.

Tower, climb, library, Today, Study, achievements, sharing, ceremony, and Arena consumers now use campaign IDs. `state.progress` is keyed only by passage ID and `state.climb` by campaign ID. Because the app is still in BUILD MODE with no production saves, schema migration 2 intentionally resets pre-T9 reference-keyed progress/climbs rather than preserving the invalid identity contract. A passage placed in multiple campaigns shares one progress record and `recordClimb()` credits every containing campaign. Arena's former Book Mastery path is Campaign Mastery, and `campaignAreas(campaignId)` chunks any campaign into five `ceil(n/5)` areas.

Tower geometry moved to pure `towerGeometry(floors)`, `tvLevelTop`, `tvLevelHeight`, and `tvGlowTop` functions. The renderer derives its layer count, repeat pieces, scroll bounds, floor navigation, completion, and totals from `campaign.passageIds.length`; the only remaining `25`/`24` in that rendering path are legacy source PNG filenames, not height logic. T11 still owns its explicitly-scoped special presentation for sub-four-floor and compressed very-tall custom towers.

*Verification:* `node tests/content.test.js` — **41 passed** (canonical authoring shape; 100 unique opaque IDs; immutable compiled model; invalid legacy IDs rejected; 7/13/25 campaign-area splits; 3/7/25/60/120 tower geometry; relic metadata and assets in lockstep). Existing suites remain green: tokenizer **88**, recall **86**, verification **38**. Every `js/*.js`, `data/*.js`, `tests/*.js`, and `tools/*.js` file passes `node --check`; `tools/text-fetch-plan.js` still maps **100 passages across 87 chapter pages**; `git diff --check` is clean. Live browser smoke covered clean and seeded saves across Today, all four Towers, a 4/25 floor detail (25 layers / 22 repeats / 4 lit), Study with designed relic art, Arena campaign filters and an 8-question campaign-only round, plus 375px mobile with no horizontal overflow. No new console errors or failed relic requests appeared after a cache-busted reload. The app still uses only ordered classic scripts and no build step; the in-app browser's security policy blocks direct `file://` navigation, so this ticket's live smoke ran over the plain static HTTP server rather than claiming a direct-file run it could not perform.

**T10 · Doctrinal Mastery + Retired + Articles of Faith + key phrases** — ✅ **DONE**
Transcribe from source with key scripture phrases. Ship Retired as a warm-framed pack. Key-phrase flashcards both directions (phrase → reference, reference → phrase) — the incumbent's strongest feature and the curriculum's actual center. Track-selection onboarding (§3.6).
**DoD** — Doctrinal Mastery is the Seminary default · the retired pack reads as a feature, not a fallback · key-phrase drill works both ways.

*Shipped:* The official Core Document was transcribed into a checked-in source snapshot and four current Doctrinal Mastery campaigns. The live official table contains **24 passages per course, 96 total**—not 25/100, exactly the inconsistency §3.3 warned about—so the four current towers honestly render at 24 floors. `tools/build-t10-content.py` makes the extraction reproducible: it parses the official table and its linked chapter pages, asserts the 24×4 course shape, preserves generated opaque IDs in `data/t10-passage-ids.json`, validates every shared retired passage byte-for-byte, and generates the current pack plus provenance. Of the 96 current references, 51 reuse the existing canonical passage and progress identity; 45 are new. Articles of Faith adds 13 exact current-edition passages in its own 13-floor tower. Together with the preserved 100-passage Heritage Collection, the Seminary catalog now contains **158 unique passages across nine campaigns**.

One Seminary Track now assembles campaigns contributed by all three packs, with current Doctrinal Mastery first, Articles of Faith next, and the retired collection kept active under its exact warm framing: *“The verses a generation grew up on. Still worth carrying.”* Brand-new profiles see the §3.6 path chooser before the app; Seminary starts at the current Book of Mormon campaign, while existing saves skip onboarding. Christian and Family / Kids remain visible but honestly disabled until their own content ships in T12 rather than routing users into Seminary vocabulary.

The **96 official key scripture phrases** are first-class passage metadata, visible on Study and available as ten-card, say-it-before-reveal recall drills in both directions. “Again” requeues a missed card once; phrase practice intentionally pays no XP. Phrase drills remain available before a learner has sealed a passage, including from the otherwise locked Arena. Today and Towers distinguish the four current campaigns, Articles of Faith, and the Heritage Collection; campaign and grand Arena challenges now scale across the entire catalog instead of silently stopping at the original 100.

*Verification:* `node tests/content.test.js` — **67 passed** (official snapshot and order, 24×4 current campaigns, 13 Articles, 25×4 heritage, shared identity, all 158 provenance hashes, pack/Track contracts, areas and geometry); `node tests/phrases.test.js` — **14 passed**; tokenizer **88**, recall **86**, verification **38** (**293 assertions total**). The generator reran deterministically from its cached official pages and reported 96 official rows, 51 shared references, 45 new passages, 13 Articles, and 88 parsed chapter pages. Every JavaScript file passes `node --check`; `tools/text-fetch-plan.js` maps all **158 passages across 116 chapter pages**; `git diff --check` is clean. Live browser verification covered a true fresh install and Seminary selection; both phrase directions including reveal/requeue; Today and Study phrase presentation; current 24-floor (24 layers / 21 repeats), Articles 13-floor (13 / 10), and heritage 25-floor (25 / 22) towers; a seeded save; all nine Arena campaigns; a Grand Challenge area spanning 16 of 158 passages; and a 375px mobile viewport with no horizontal overflow. The browser console contained no warnings or errors.

**T11 · Custom passages + custom towers ★** — ✅ **DONE**
User-created passages and collections. Scalable tower geometry per §4 — `repeatLevels` computed, `tvLevelTop`/`tvLevelHeight`/`tvGlowTop` generalized, small and very tall towers handled, height capped ~120 with a compressed distant view. A custom collection becomes a tower that grows a floor per added passage.
**Before any user text renders:** one escaping discipline, an explicit allowlist of the places that intentionally emit markup, and a test that a passage containing `<img src=x onerror=alert(1)>` renders inert. Every screen renders template strings into `innerHTML`; this is a real exposure and v1 never mentions it.
**DoD** — a 7-floor and a 60-floor tower both render correctly and scroll well · adding a passage visibly grows the tower · malicious passage text cannot execute · free tier capped at 10 custom passages with a clear, non-nagging upgrade path.

*Shipped:* Personal content is now a real persistent domain, not another special-case edit map. `js/00-custom.js` owns pure validation, crypto-backed opaque IDs, stable edit identity, the 10-passage / one-collection free entitlement boundary, collection-to-Campaign derivation, import validation, and the capped-tower render plan. Collections are the single editable source of truth; `customCampaigns` is rebuilt as derived export/debug data so renames and membership changes cannot leave a stale second copy. Passage edits preserve both progress identity and their position in the tower. Export/import accepts valid custom content, initializes missing progress, rejects malformed or dangling collection links, and preserves active-looking strings as raw memorization text rather than silently rewriting them.

The Collection screen now opens a complete personal builder: create, rename, view, and delete towers; add, edit, assign, reassign, or delete passages; retain invalid form drafts while naming the exact missing fields; and show a quiet 10/10 boundary that leaves every existing passage fully usable. A future non-free entitlement already removes both passage and collection caps without showing free-tier counters. Empty towers have a real foundation screen, each added passage raises the visual tower by exactly one floor, and custom content participates in Study, Review, Shelf, Towers, and the Arena through the same Passage/Campaign accessors as built-in content.

`js/00-html.js` is now the one plain-text-to-HTML boundary and names the eight helpers intentionally allowed to emit markup. The exact `<img src=x onerror=alert(1)>` regression payload is retained byte-for-byte in state but escaped at every render surface. The audit covered the new manager plus Library, Today, Towers, Study, Shelf/relic popup, Prove It, Recall Check, ceremony, and all Arena question renderers; custom wording receives a personal-source verification note instead of an invented official-source claim.

Tower rendering now removes phantom pieces at one and two floors, renders every logical floor through 120, and switches above 120 to a capped distant structure whose newest 25 logical floors remain detailed. A range control makes both ordinary tall towers and compressed towers directly navigable. The neutral Restoration tower assets are intentionally reused with a distinct personal-tower hue and frame: decision §9.5 still says the owner will supply the dedicated pioneer kit, so this ticket does not fabricate final art or block the mechanic on it.

*Verification:* `node tests/custom.test.js` — **30 passed** (escaping boundary and allowlist, malicious payload preservation, opaque/stable IDs, collection derivation, free/paid caps, 7/60/145 render plans, built-in ID collision defense, and malformed-import rejection). Existing suites remain green: content **67**, phrases **14**, recall **86**, tokenizer **88**, verification **38**—**323 assertions total**. Every `js/*.js` and `tests/*.js` file passes `node --check`; `git diff --check` is clean. Live browser verification covered the empty builder and tower creation, reload persistence, one- and two-floor piece sets, 7 floors (7 layers / 4 repeats), 60 floors (60 / 57 with a working jump to Floor 60), and a 145-floor compressed tower (120 rendered floors, 117 repeats, logical floors 121–145 detailed). Adding an eighth passage through the real form changed the same tower from 7 to 8 layers. The exact XSS payload rendered as visible text in the manager, tower choices, and Study with zero `img[src=x]` nodes, JavaScript dialogs, warnings, errors, or 404s. The free fixture stopped cleanly at 10/10; a Quest+ fixture exposed uncapped passage and tower controls. A 375×812 run of the 60-floor tower had zero horizontal overflow and retained its jump control.

**T12 · Christian track** — ✅ **DONE** — BSB + KJV per passage per translation, translation picker, six starter campaigns, relic fallback polish, reuse neutral tower kits with new hues. Audit every string for Seminary-specific assumptions.
**DoD** — choosing "Christian Scripture Memory" at first run yields a complete experience with no LDS vocabulary anywhere · both tracks run side by side.

*Shipped:* Christian Scripture Memory is now a complete first-run choice with six curated 20-floor campaigns: Foundations, The Gospel, Comfort & Anxiety, Armor of God, Psalms Worth Knowing, and For Kids. Their 120 memberships resolve to 99 unique references. Every one carries exact BSB and KJV text plus separate checked-in provenance; BSB is the default, and the shell translation picker changes the text, difficulty, verification claim, Arena prompts, and study flow immediately without changing passage progress. `tools/build-t12-content.py` generates the pack from selected public-domain Free Use Bible API chapter JSON, preserves 99 opaque IDs, and records the upstream edition fingerprints. `data/CHRISTIAN-SOURCES.md` documents the BSB/KJV licensing and rebuild boundary.

Seven Bible references already existed in the Seminary catalog. T12 deliberately reuses their canonical IDs and augments them with BSB/KJV wording and Christian-specific topics, so a learned passage counts in both tracks while Seminary key phrases remain translation-scoped and never appear in Christian mode. `activePassages()` is now the learner-facing boundary across Today, recommendations, reviews, Collection, Shelf, achievements, Study, and every Arena pool; the original `allPassages()` remains the whole-catalog persistence/identity boundary. A persistent path picker keeps Seminary and Christian collections side by side, normalizes stale track/translation saves safely, and changes paths without deleting any progress.

The six campaigns reuse the neutral Jerusalem and Tabernacle art kits with distinct hues as §3.5 required. Undesigned relics now have a deliberately layered, star-set fallback frame, and their popup links to the selected BSB or KJV source rather than ChurchofJesusChrist.org. The full visible-string audit also made the Seminary-only Today and phrase-drill panels conditional; live QA caught and removed two shared-identity leaks that a raw source grep would not have found.

*Verification:* content **94**, tokenizer **89**, recall **86**, verification **41**, phrases **14**, and custom content **30** — **354 assertions total**, all green. The content suite asserts 250 canonical passages, 356 exact translation texts, 15 campaigns, two Tracks, 6×20 Christian membership/order, 99 Christian references, seven shared identities, immutable translation materialization, and provenance hash agreement for every edition. The tokenizer round-trips and agrees on word positions for all 356 texts. Every JavaScript file passes `node --check`; the T12 generator reruns deterministically from cache; `git diff --check` is clean. Clean-cache browser QA covered Christian first-run selection; 0/99 isolation; BSB→KJV switching on an open Study passage with the correct source claim; six campaign cards; a 20-layer / 17-repeat neutral tower; intentional relic fallbacks; Christian-only Collection results; an empty Arena with no Seminary phrase controls; and Christian→Seminary→Christian switching with the correct 158/99 catalog totals. All app assets requested successfully; the only HTTP 404 was the repository's pre-existing absent favicon.

### Phase D — The memory engine

**T13 · Learning events, trouble map, graded scheduling** — ✅ **DONE**
`recordLearningAttempt()` + per-passage aggregates; bounded log (200) with separate lifetime aggregates; `trouble` keyed by tokenizer word position (safe now that T3 shipped). Trouble Map as a **segmented control** with Smart Highlights — `Meaning | Trouble spots | Plain`, never both. Tap a trouble word → phrase drill of 3–5 words either side. Drive intervals from **FSRS or SM-2**, not an invented formula; keep `REVIEW_LADDER` as the *visual* skin (rung = stability bucket) so seals and the Eternal Seal are untouched. Keep a separate, clearly-labeled display "strength" — never conflate display with scheduling. Eternal Seal gains a non-punitive `nextPolishAt` (~180 days); missing it never cracks the seal.
**DoD** — one aggregate update per settled question · trouble positions match real words including repeats · next interval varies by grade · Trouble Map and Meaning never render together.

*Shipped:* `js/00-learning.js` is the pure learning boundary: an idempotent `recordLearningAttempt()` writes one capped 200-event diagnostic log while updating uncapped lifetime and per-passage aggregates, exact tokenizer word-position trouble weights, and scheduling evidence. Recall Check (typed and accessible self-report), every settled Arena question, both key-phrase directions, Prove It chunks, and the new focused phrase drill all report through that boundary. Event IDs make re-rendering or a second settlement call harmless; generic recognition exercises update aggregates without fabricating a word position.

The scheduler now follows the published SM-2 rules: 1- and 6-day opening intervals, E-Factor updates from the 0–5 response quality, a 1.3 floor, and a repetition reset after failed recall. `REVIEW_LADDER` remains presentation only—its rungs are stability-day buckets derived from SM-2, while `nextReviewAt` comes only from the scheduler. The nearby “Recall strength” percentage is explicitly labeled **display only** and is never read by scheduling. Eternal Seals remain permanent; activity only moves an optional `nextPolishAt` about 180 days out, and a missed polish never cracks or lowers them.

Study now has one segmented `Meaning | Trouble spots | Plain` mode. Meaning uses Smart Highlights; Trouble spots uses only warm position-specific marks; Plain uses neither. Tapping a warm word opens a 3–5-word-per-side production drill with first-letter cues, exact normalized grading, repeated-word-safe position feedback, and clean/try-again feedback. The three displays cannot be layered together.

*Verification:* new learning suite **24**, content **94**, tokenizer **89**, recall **86**, verification **41**, phrases **14**, and custom content **30**—**378 assertions total**, all green. Every JavaScript file passes `node --check`; `git diff --check` is clean. Live desktop and 390×844 browser QA covered the exclusive segmented modes, an empty Trouble Map, a real Prove It miss creating exactly three heated word positions, tap-to-open phrase practice, wrong and clean phrase submissions, display-strength updates, persistence through reload, and zero warnings/errors. Unit coverage includes the canonical SM-2 sequence and grade-dependent future intervals, minimum E-Factor, bounded-log/lifetime separation, duplicate-event idempotency, exact repeated-word positions, phrase windows, strength/scheduler isolation, and non-punitive Eternal polish.

**T14 · Cumulative chaining** *(highest learning-per-line in this document)* — ✅ **DONE**
Cumulative chaining — produce phrase 1, then 1→2, then 1→2→3 — is the strongest known technique for long verbatim text and it's absent. `chunkVerse()` (`:6754`) already produces the chunks and Prove It already walks them, but Prove It is *recognition*: pick from three (`:6862`). Convert it to **production** — first-letter or type each chunk with the built text visible above. Keep the shell, progress bar, and ceremony. Accepts as recall evidence.
**DoD** — chunk sequence unchanged · a completed chain at `good`+ can seal · the old recognition mode stays as an easier rung.

*Shipped:* [js/23-proveit.js](scripture-tower/js/23-proveit.js) is now two modes sharing one shell (header, ref, step counter, progress bar, the "Proven!" finish ceremony). `chunkVerse()` itself is byte-for-byte unchanged — T14 only adds `chunkWordRanges()`, which sums `wordCount()` per chunk to align chunk boundaries to the exact same zero-based word-index space `tokenWords()`/`createRecallSession()` already use (verified in Node against four real passage shapes, including one with a free-standing em dash, before wiring anything up: every chunk's word content matched the corresponding slice of the full token stream). **Production is the new default** (`openProveIt(v)` with no second argument): a single Recall Check session (`js/00-recall.js`, unmodified) spans the *whole* passage — same first-letter typing, same QWERTY-slip tolerance, same three-miss auto-reveal, same error-budget grading — and the UI reveals only the current chunk's slots at a time, promoting each finished chunk to real built text above it as `session.position` crosses that chunk's boundary. **Recognition is untouched**: same order-guessing puzzle, same per-chunk `recordLearningAttempt(...,{schedule:false})`, same +3 XP per correct pick, same "Proven!" finish with no grade and no seal path — it is offered as the explicit easier rung via a mode-switch link in both directions, and switching always reopens fresh rather than carrying partial progress across two different scoring models.

The seal gate is computed once, at open, the same three-way split `js/22-study.js`'s `nextStage` handler already makes: not yet sealed → `"first"`; sealed and due → `"reseal"`; sealed and not due → `null`. A completed production chain records exactly one `recordLearningAttempt` (mode `"proveItChain"`) the moment the session completes — before any button click, matching Recall Check's own timing — with `schedule` true **only** when the gate is `"reseal"`, so a practice chain on an already-sealed, not-due passage can never move `nextReviewAt` or `p.srs`, and a first-seal chain can't either (the passage isn't sealed yet at record time). Only on a `good`+ (first) or `hard`+ (reseal) grade does the finish screen's button call `performSeal()`/`performReseal()` — the exact same functions Recall Check calls, so a chained seal gets the identical relic ceremony, XP, heart refill, and SM-2 update. Anything short of the gate, or a chain with no gate to meet, falls through to the same practice-XP ceremony recognition has always used (`claimReward("prove:"+v.id)`, `p.provenIt`) — deliberately **not** also paid on a passing chain, since that XP plus the seal's own XP would reopen the exact per-verse-per-day farm T7 closed.

*Verification:* `node --check` passes on every file in `js/*.js` and `tests/*.js`; `git diff --check` is clean. All seven Node suites pass — **24 + 89 + 86 + 94 + 41 + 14 + 30 = 378 assertions**, all green (unchanged from T13; T14 has no Node-testable surface of its own — Prove It is DOM-driven like the rest of the study screen). Live browser QA against `tests/seed-fixture.html` at desktop and 375×812 covered: a clean production chain on an unsealed passage sealing correctly (relic, +50 XP, confetti, SM-2 initialized); a one-slip `good` chain on a due, sealed passage re-sealing correctly (ladder rung advanced, SM-2 `dueAt` moved, no double XP); a clean chain on a sealed-but-not-due passage staying pure practice (`nextReviewAt`/`p.srs` byte-identical before and after, +15 XP once, `provenIt` set); a fully-missed chain on an unsealed passage staying unsealed with a "Try the chain again" offered; the recognition puzzle run to completion end-to-end with real clicks, confirming it never seals and its reward/toast behavior is pixel-for-pixel what it was pre-T14; both mode-switch links; a passage containing a free-standing em dash chunking, typing, and rendering correctly in built/active/upcoming text; and Escape/✕/backdrop all closing the overlay. Zero console errors throughout.

*Defect found in flight, not fixed here:* see **D4** above — a pre-existing, pre-T14 z-index issue where the guest "Save your progress" pill can sit on top of and functionally block taps on any `.cer` overlay's bottom-right content on a narrow viewport. T14's on-screen keyboard made it easy to notice (b/n/m/⌫ blocked at 375×812) but did not cause it — recognition mode's own third answer option already had the same problem, unchanged by this ticket. Flagged as a follow-up task rather than fixed inside T14, since a safe fix means auditing every `.cer` screen's stacking, not just Prove It's.

**T15 · Within-session spacing + PWA shell** — ✅ **DONE**
`makeArenaRound()` (`:4410`) gives each passage one question per session; the first twenty minutes is the highest-leverage window and is currently unused. Add expanding intra-session intervals — a passage returns 2, then 5, then 9 questions later. Add reference-production drills both directions (recall is cue-specific; recognizing a reference in a list is not producing one). PWA: `manifest.json`, service worker, self-hosted Cinzel subset — Google Fonts is a hard external `<link>` at `:9` and there are zero service workers, so "offline-first" is not true today.
**DoD** — a passage can be retrieved 3× at expanding gaps in one session · installs to a phone home screen and fully loads with the network off.

*Shipped (T15a — within-session spacing + reference-production drills):* [js/14-arena.js](scripture-tower/js/14-arena.js)'s `settleAnswer()` now calls `requeueArenaMiss(T, q)` on every miss (every mode except Lightning Round, which already repeats passages by cycling its own shuffled pool under a hard timer and has no clean place to splice a delayed reappearance). It regenerates the missed question fresh via `buildArenaQuestion()` — new distractors each time, not the same wrong option sitting in the same spot — tags it with `requeueAttempt`, and splices it into `T.qs` at `T.i + 1 + gap`, where `gap` walks `ARENA_REQUEUE_GAPS = [2, 5, 9]` ([js/00-config.js](scripture-tower/js/00-config.js)) as the same passage keeps getting missed, capping at 3 extra attempts. A correct answer at any point stops the chain — no further requeue. Since `T.qs` is the same array `T.i` already walks to completion, the round just naturally runs one question longer per miss; nothing about the finish condition, the `perfect` calculation, or per-answer quest/stat bookkeeping needed to change. The results screen's "Question N of M" and pip row read the grown array automatically. A small note (`↻ One more look — this one slipped a few questions ago.`) appears in the shared question shell whenever `q.requeueAttempt` is set, so a returning passage doesn't feel like a rendering glitch.

Two new question types add the missing production side of reference recall — `refFromText` (shown the verse text, type the reference) and `refFromTheme` (shown the topic/key phrase, type the reference) — alongside the existing `text2ref`/`theme2ref` recognition pairs, which only ever ask the learner to *pick* a reference from three options. Grading goes through a new pure module, [js/00-refmatch.js](scripture-tower/js/00-refmatch.js): `refsMatch()` normalizes case, whitespace, and dash style (reusing the tokenizer's own `normalizePunct()`) but deliberately keeps the colon structural, so "John 3:16" and "John 31:6" can never collide the way a full-strip word-normalizer would let them. Both types score in the same 15-XP tier as the app's other production formats (`buildVerse`, `timedRecall`, `wordScramble`, `pairMatch`) and were added to `ARENA_TYPES` (so quick-mode's type rotation includes them), left out of `BLITZ_TYPES` (typing doesn't fit blitz's tap-only pace), and each got a matching daily quest (`refscribe`, `nameit`) following the one-quest-per-type convention every other Arena type already has. Neither type contributes word-position trouble data — `arenaLearningPositions()` correctly falls through to empty `attempted`/`trouble` arrays for both, since reference recall isn't about a position in the verse text and forcing one in would fabricate a signal T13's trouble map was built to avoid fabricating.

*Verification:* `node --check` on every `js/*.js`/`tests/*.js` file, `git diff --check` clean. New [tests/refmatch.test.js](scripture-tower/tests/refmatch.test.js) — **23 assertions**, split between forgiveness (case, whitespace, colon spacing, dash-family variants including em/en dash ranges, ampersand spacing) and precision (different verse/chapter/book, the John 3:16 vs John 31:6 collision case specifically, empty/null/whitespace-only input). All eight suites green — **24 + 89 + 86 + 94 + 41 + 14 + 30 + 23 = 401 assertions**. Live browser QA verified the exact splice math (`T.i+1+2`, then `+1+5`, then `+1+9`, matching `ARENA_REQUEUE_GAPS` exactly) against a live round; confirmed a correct answer on a requeued attempt stops further requeuing; confirmed Lightning Round's `T.qs` length is untouched by a miss; ran a realistic interleaved multi-passage session (two different passages missed and passed among unrelated questions) and confirmed both saw their correct 2-then-5 gaps, not compressed ones — the only place gaps compress is the synthetic worst case of missing one single passage three times back-to-back in a very short round, where there simply aren't enough later positions yet and the insert clamps to the current end of the array rather than going out of bounds; both `refFromText` and `refFromTheme` rendered and graded correctly through the real UI (a deliberately messy `"genesis  1 : 1"` matched `Genesis 1:1`; a wrong reference showed the correct one plus what was typed); the `refscribe` quest routed to a 6-question all-`refFromText` round. Zero console errors.

*Shipped (T15b — PWA shell):* The app installs and now genuinely works with the network off. [index.html](scripture-tower/index.html) gained `<link rel="manifest">`, theme-color/apple-mobile-web-app meta tags, a favicon and apple-touch-icon, and a self-hosted [css/00-fonts.css](scripture-tower/css/00-fonts.css) replacing the old hard `<link>` to `fonts.googleapis.com`. The two Cinzel `.woff2` subsets in `fonts/` are byte-identical to what Google's CDN served — fetched from `fonts.gstatic.com` directly, with the owner's explicit permission for the download — so the six `@font-face` rules (three weights × two Unicode subsets) render identically with zero external requests on a cold load. [manifest.json](scripture-tower/manifest.json) and four icon PNGs (192/512, plus maskable variants) in `icons/` are new; the icon is a simple placeholder star-seal glyph on the app's own dark-violet palette, generated programmatically (Pillow, no external asset), following the exact same "ship a functional placeholder, document it as swappable" precedent T11 already set for the custom-tower art kit — swap the five files in `icons/` for real branding whenever the owner wants to.

[sw.js](scripture-tower/sw.js) is a new service worker, registered from new [js/27-pwa.js](scripture-tower/js/27-pwa.js) (feature-detected and wrapped in try/catch — registration rejects under `file://`, which must keep working unregistered, not broken). Two decisions worth recording because they weren't the first thing tried:

- **Network-first, not cache-first.** There are no production users yet (this file's own BUILD MODE banner) and the app is being rewritten ticket by ticket. A cache-first worker with no auto-bumped version would silently serve stale app code to anyone who'd already installed it, with no signal that a newer version exists — exactly the kind of bug that's invisible from the outside. Network-first means every online visit gets the current files and keeps the cache warm as a side effect; only a genuinely offline visit falls back to whatever was last fetched successfully.
- **The `install` handler fetches and regex-scans `index.html` itself** for every `<script src>`/`<link href>` it references, rather than hand-maintaining a duplicate file list in `sw.js`. This was not the first version shipped — the first draft relied purely on "cache whatever gets fetched" and failed a real offline test, because a service worker does not control the very page that first registers it: only requests made *after* activation go through its fetch handler, so the entire first visit was going uncached and offline broke immediately after install. Discovering the file list from `index.html` at install time instead means a future ticket that adds a new `js/*.js` or `css/*.css` `<script>`/`<link>` tag is automatically covered — nothing in `sw.js` needs to change alongside it. The two font files are added by hand (`EXTRA_ASSETS`) since they're referenced from CSS, not from `index.html`, so the scan can't find them on its own; that's a two-line list that essentially never changes, not the ~90-file list that would have been the alternative.

*Verification:* `node --check` on every `js/*.js`/`tests/*.js` file plus `sw.js`; `manifest.json` validated as parseable JSON; `git diff --check` clean. All eight Node suites still green at 401 assertions (T15b touches no Node-testable surface). Live browser QA: confirmed zero requests to `fonts.googleapis.com`/`fonts.gstatic.com` on a fresh load and that `document.fonts` reports the self-hosted Cinzel weights actually in use as `loaded`; confirmed the service worker registers and activates; confirmed the *first* `install` precaches all 66 shell files (62 discovered from `index.html` plus the two fonts, `index.html` itself, and `./`) rather than only the handful a naive cache-as-you-go approach caught; then did the real test — **stopped the dev server entirely** (genuine connection failures, not a simulated flag) and reloaded: Today, Study, and a live Arena round all rendered and stayed fully interactive, with every shell JS/CSS/font request served from the service-worker cache (visible in the network log as failed-then-recovered) and zero console errors from app code. A handful of runtime-loaded relic/chest/tower images that hadn't been visited yet 404'd offline, as expected for a content library too large to fully precache — core functionality was never affected, and those images cache normally the next time they're viewed online, same as any other network-first request.

### Phase E — Daily loop and social

**T16 · Daily Path + Review Rescue** — ✅ **DONE**
`dailyPlanFor()` with persisted task IDs so re-render doesn't reshuffle; Review Rescue framing; `dailyReviewLimit` default 10 with 3 required and "see all due"; confidence input; `recommendedModeFor()`; a visible finish line.
**DoD** — one tap from Today starts the right activity · plan stable across reloads · required path completable without spending hearts · new learner gets an onboarding path, not an empty queue.

*Shipped:* Today used to be a stack of independent cards with no single answer to "what should I do right now" — the closest thing was a standalone "Fading Seals" list. New [js/24-daily-plan.js](scripture-tower/js/24-daily-plan.js) builds one ordered task list per calendar day: up to 3 **rescue** tasks (oldest-due seals first) and 1 **climb** task (via the existing `recommendedVerse()`) are *required* and drive the visible finish line; up to 2 **strengthen** tasks (real passages with recorded T13 trouble weight ≥0.12, highest first) and 1 **victory** task (today's first unfinished Arena quest) are optional bonus rows shown underneath, never counted against the finish line.

`ensureDailyPlan()` decides *which* tasks and *what order* exactly once per local day (`localISODate()`, matching `dailyRewards`' own established date-keying convention) and persists that choice to the new `state.dailyPlan = {date, tasks}` — the literal shape the data contract in §9 already specified. `dailyPlanFor()` then re-derives each task's live **status** from real, current state on every call: a rescue task completes the instant `isDue()` flips false on its passage, however that happened — through the Daily Path's own row, or by re-sealing it from Study, or from an Arena Full Recitation. Climb and strengthen snapshot a baseline at task-creation time (`startStage`/`startSealed` for climb, `startWeight` for strengthen) so "did today's step happen" has an unambiguous, single-session answer instead of requiring the whole passage to reach mastery in one sitting. Identity/order and status are deliberately two different questions — the DoD's "plan stable across reloads" is the first one, "one tap starts the right activity and it's honestly tracked" is the second.

Every row is one tap to the actual activity, no detour through another screen first: rescue opens `openRecallCheck(v,"reseal")` directly; climb opens `openStudy(v.id,false)`; strengthen opens Study already switched to its `trouble` mode; victory calls `startQuestRound()`. Both required kinds are heart-free by construction, not by a special case — Recall Check's typing already costs nothing, and a Study stage-advance only ever pays a heart, never spends one. The old standalone "Fading Seals" card is gone (folded into rescue); "Continue the climb" stays exactly as it was, right below, as the rich detail view for the same climb task the checklist already named — the checklist gives the tl;dr and the checkmark, the existing card gives the tower art and the alternate-verse picker. A brand-new learner (`started === false`) sees neither card — the existing `hero-start` onboarding stays completely unchanged and is what satisfies "a real path, not an empty queue" for day one.

Confidence input landed in Arena's Full Recitation, the one question type with no objective score to grade. It used to be two buttons (a hidden assumption that any clean, unpeeked pass was automatically graded "easy"). It's now an honest four-way segmented control — Again / Hard / Good / Easy, one tap, styled with the same grade colors Recall Check's own results screen already uses — with Good and Easy disabled outright (not silently downgraded) the moment the learner peeks, matching the evidence table's "hard max, no peek" rule and explaining why in one line. `settleAnswer()` (`js/14-arena.js`) takes the confidence straight through via a new `opts.confidence`, falling back to the original derived formula for every other question type, which has a real right answer and doesn't need a self-report.

`recommendedModeFor(v,p)` labels *why* a task is what it is — `recognize`/`build` for an unsealed passage depending on stage, `recall` for sealed-and-due, `recite` for sealed-and-strong — and drives the Daily Path's own routing/copy. It intentionally does not reach into Arena's own type-rotation logic; adapting `buildArenaQuestion()`'s type selection per-passage would be a much larger, separate change this ticket didn't ask for.

*Verification:* `node --check` on every `js/*.js`/`tests/*.js` file, `git diff --check` clean. All eight Node suites still green at 401 assertions — the Daily Path and confidence input are both DOM/state-driven like the rest of Today and Arena, so verified live rather than forced into a Node harness (same boundary `HANDOFF.md` §4 already documents for `03-state.js`/`14-arena.js`). Live browser QA against `tests/seed-fixture.html`: completed a rescue task from its Daily Path row and confirmed the same row (and only that row) flipped to "complete" on the next render, the finish line advanced from 0/3 to 1/3, and a genuine `location.reload()` afterward reproduced the identical task IDs in the identical order with the completed status recomputed correctly from scratch — not a cached flag; climb and victory rows confirmed routing to Study and the correct quest round respectively; a manually-injected trouble position confirmed a strengthen row appears, labels itself correctly, and opens Study already on the Trouble spots tab with the right word highlighted; the "+N more due — see all" link confirmed appearing only when due passages exceed the 3 shown, expanding to exactly the right extra rows, each independently wired to Recall Check. All four Full Recitation confidence grades verified end-to-end into `state.learningLog` with the exact grade the button carries (not a derived one), and Good/Easy confirmed genuinely `disabled` (not just visually dimmed) after a peek. Verified against `tests/onboarding-fixture.html` that a brand-new, zero-progress learner sees neither an empty Daily Path nor a missing one — `hero-start` renders exactly as it did before this ticket, and `dailyPathCardHTML()` is simply never called for `started === false`. Zero console errors throughout.

**T17 · Leagues and leaderboards** — §5.3. **Verses Held** as the primary metric, never XP. Weekly, 30 per group, 10 divisions, top 7 promote / bottom 5 relegate. Child-safety rules are non-negotiable: display names only, no photos, no free-text chat, under-13 defaults to family/class leagues only, no DMs, free opt-out.
**Blocked by T6 and T7** — a ladder over unverified seals and farmable XP is worse than no ladder.

**T18 · Classroom mode ★** — the highest-frequency real use of scripture mastery is a teacher running a five-minute review game on a projector, and it's the distribution channel: one teacher brings 25 students. Bible Versus is already attacking here. Large-type, no-login presentation mode over the existing Arena engine: team scoring, big timer, reference-and-phrase rounds, keyboard-driven, readable from the back of a room. Plus local group assignment with completion tracking.
**DoD** — a teacher runs a class review within 60 seconds of opening the app, no account, no setup.

### Phase F — Aloud, and everywhere

**T19 · Speech recitation** — feature-detected, explicit tap to activate, no background recording, no retained audio by default, graceful fallback. Thresholds map to §2.3 grades.

**T20 · Accounts, entitlements, sync, distribution**
Accounts; **three receipt sources resolving to one entitlement** — StoreKit, Google Play Billing, Stripe (§5.5); sync of compact state only (never `view`, never raw audio); family and class roles; invite codes with expiry; row-level authorization; documented conflict resolution.
**Blocked on §10** — particularly COPPA (US, under-13, verifiable parental consent) and FERPA if adopted through a school. For this product minors are the *primary* user, not an edge case.

---

## 9 · Data contract

```js
{
  schemaVersion: 4,
  track: "seminary",              // seminary | christian | family
  translation: "lds2013",
  startingCampaignId: "camp_retired_bom",
  entitlement: { tier: "free", source: null, expiresAt: null },
  xp: 0, streak: 0, bestStreak: 0, lastDay: null, shields: 0,
  calendar: {},
  settings: { dailyReviewLimit: 10, strictMode: false, sound: true,
              reducedMotion: false, defaultRecallMode: "firstLetter",
              leaderboardOptIn: true },
  progress: {
    "<passageId>": {
      stage: 0, sealed: false, sealedAt: null,
      reviewLevel: 0, reviews: 0,
      nextReviewAt: null, lastReviewAt: null, nextPolishAt: null,
      srs: { algorithm:"sm2", repetitions:0, intervalDays:0,
             easeFactor:2.5, stabilityDays:0, lastGrade:null,
             lastReviewedAt:null, dueAt:null },
      provenIt: false, hl: [],
      learning: { total:0, correct:0, byGrade:{}, byMode:{},
                  firstAt:null, lastAt:null, lastAttemptId:null },
      trouble: { "<wordIndex>": { misses, successes, weight, lastAt } }
    }
  },
  learningLog: [],                // max 200
  learningLifetime: { total:0, correct:0, byGrade:{}, byMode:{}, firstAt:null, lastAt:null },
  dailyPlan:    { date: "YYYY-MM-DD", tasks: [] },
  dailyRewards: { date: "YYYY-MM-DD", claimed: {} },
  climb: { "<campaignId>": ["<passageId>", …] },
  collections: [], customPassages: [], customCampaigns: [],
  arena: {}, achv: {}
}
```

**Invariants**
- State is data, never rendered HTML.
- Epoch milliseconds everywhere except keys deliberately based on local calendar dates.
- Every user-activity array has an explicit maximum length.
- **IDs are opaque and never derived from editable text.**
- Every reward-producing operation is idempotent.
- Every migration has a fixture from the previous version.

---

## 10 · Open decisions

| # | Question | Blocks | Status |
|---|---|---|---|
| 1 | Pricing ladder — confirm §5.4, especially the lifetime number | T20 | ⏳ Lifetime rule needs your call; rest is set |
| 2 | Text sourcing — 1920/1921 editions, or seek permission for current text | T4 | ✅ **Resolved 2026-08-11 — current editions, owner confirmed usable.** Diff run: 82/100 exact, 18 in data/TEXT-REVIEW.md |
| 3 | COPPA / FERPA posture for under-13 accounts and class rosters | T17, T20 | ⏳ Needs a documented answer before any backend |
| 4 | Legal review of the public-domain reasoning before a *paid* launch | Paid launch | ⏳ Not a blocker for building |
| 5 | Custom tower art kit — one plain "pioneer tower," or several | T11 | ⏳ You said you'd design these |

**Resolved:** ✅ Distribution — web PWA + Capacitor iOS + TWA Android. ✅ Translations — BSB, KJV, WEB, ASV only. ✅ Build mode — no legacy constraints. ✅ Ranking metric — Verses Held, never XP. ✅ No energy system, ever.

---

## 11 · Test matrix

**Automated (Node)** — tokenizer index stability across the full corpus · first-letter masking with leading quotes/parens, internal apostrophes, em dashes, verse markers, numerals · recall grading at every band boundary including short-passage floors · scheduling at boundary dates · reward idempotency for all four farm paths · daily-plan determinism with fixed date and seed · custom-passage import validation including the XSS payload · tower geometry at 3, 7, 25, 60, 120 floors.

**Browser smoke, every ticket** — new guest · returning mid-verse · named climber · 20+ overdue · zero hearts · everything sealed · both tracks · unsupported speech · mic denied · 320 / 390 / 768 / 1024 / wide · reload mid-Arena-round and immediately after a settled answer.

**Regression** — tower floor order stays personal and stable · relic popup, Study link, share, official-scripture link · quest progress survives leaving Arena · daily quests rotate once per local date · Prove It options don't retain stale selected styling · Untangle shows prior-phrase context mid-verse · hearts decrement once per hint · zero console errors or 404s.

---

## 12 · UX and accessibility

- **Focus and scroll survive re-render.** `render()` replaces `body.innerHTML` wholesale, destroying focus, scroll, and text selection every time — worse once the Daily Path re-renders after each task. Preserve focus by stable element id; restore scroll.
- **Announce dynamic results.** Recall Check feedback, Arena results, and ceremonies need `aria-live`; a screen-reader user currently learns nothing from a re-render.
- **Fixed dimensions on recall slots**, or the passage reflows as letters land and the learner loses their place.
- One obvious primary action per screen · never color alone for correct/wrong/due/selected · reset transient selection classes before the next question renders · honor `prefers-reduced-motion` · keyboard input and visible focus throughout · a no-sound path, never autoplay.

---

## 13 · Success measures

**North star:** *weekly successful delayed recalls per active learner* — a `good`+ recall with no reveals, completed at least a day after the previous success on that passage.

**Learning:** due-review completion rate · 7- and 30-day delayed-recall accuracy · trouble positions that improve after focused practice · reveals per successful recall · new seals still recallable at 7 and 30 days.

**Product:** time to first seal · first Daily Path completion · D1 / D7 / D30 return · share of sessions started from the Daily Path · campaign completion · classroom sessions run · free→paid conversion · lifetime vs subscription mix.

**Guardrails:** never optimize XP if XP can be farmed · never count recognition as recall · no child-facing public rankings · track speech denials locally so the fallback improves.

**Honest limitation:** with localStorage only, no cross-user measure is computable. Until T20 these are local instrumentation and design targets, not dashboards. Don't report them as if they were.

---

## 14 · Deliberately deferred

More generic multiple-choice Arena modes · a second currency · public child profiles · social feeds or child-to-child DMs · decorative redesigns · more achievements without stronger evidence behind them · generative AI as the default Study interface · native rewrites · scripture scraping · bespoke relic art for every custom passage · licensed translations (NIV/ESV/NASB) until there's a signed agreement · **any energy or lesson-cap mechanic**.

---

## 15 · Working agreement for the implementing agent

1. Read `HANDOFF.md` first — it's the current entry point and says what's actually true today. Read this file's §8 ticket list for the plan and the `✅ DONE` notes for what's already shipped. `ROADMAP_REVIEW.md` and `IMPLEMENTATION_ROADMAP.md` are superseded drafts, worth reading only for the reasoning behind decisions already made — never implement from them directly (see the header at the top of this file). `CHANGES.md` is stale since T1; ignore it.
2. Confirm you're in `scripture-tower/`, not the archive.
3. Write pure logic and its tests before binding it to rendered controls.
4. Reuse the existing `state`, `view`, render, SFX, FX, toast, and card conventions. Match the surrounding code's naming and comment density.
5. Stay inside the ticket. Do not opportunistically redesign an unrelated screen.
6. Test against a clean localStorage and a mid-progress fixture.
7. Verify in a browser at desktop and mobile widths before declaring done.
8. Append a `✅ DONE` / *Shipped* note under the ticket's own entry in §8 — see §0 for exactly what that note should cover.
9. Commit with a long, descriptive message (see recent `git log` for the established style: what was broken, why, what changed, and the specific verification performed). Push when asked to.

Every handoff report states: files changed · state fields added · user-visible behavior · exact tests run and their results · known limitations.

**If something here turns out to be wrong once you're in the code, say so in the handoff report rather than silently working around it.** Every verified finding in `ROADMAP_REVIEW.md` was discovered exactly that way.

---

## 16 · The principle everything serves

The app must never confuse *recognizing* a scripture with *being able to recall* it — and it must never make a learner feel that missing a word is failing. Recognition is useful practice. Reconstruction is stronger. Recall is mastery. A learner who scores 94% should see the two words they missed and feel invited back, not judged.

And nothing — no paywall, no energy meter, no league — may ever stand between someone and reviewing scripture they've already memorized.

---

## Sources

- [Doctrinal Mastery Passages and Key Phrases — 2023 Core Document](https://www.churchofjesuschrist.org/study/manual/doctrinal-mastery-core-document-2023/doctrinal-mastery-passages-and-key-phrases?lang=eng)
- [Church News — Doctrinal Mastery replaces Scripture Mastery (2016)](https://www.thechurchnews.com/2016/6/2/23222426/new-doctrinal-mastery-program-is-replacing-scripture-mastery-for-seminary-students/)
- [Doctrinal Mastery app — App Store](https://apps.apple.com/us/app/doctrinal-mastery/id413341700)
- [The Bible Memory App — App Store](https://apps.apple.com/us/app/the-bible-memory-app/id496790833)
- [BibleMemory — how ranking works](https://biblememory.com/BulletinViewer.aspx?ItemId=29580)
- [Bible Versus — ranked multiplayer Bible memory](https://apps.apple.com/us/app/bible-versus/id6754584985)
- [Remember Me — study and review modes](https://www.remem.me/docs/study/)
- [Duolingo energy system explained](https://duoplanet.com/duolingo-energy-system/)
- [Duolingo divisions and leagues, 2026](https://www.spliiit.com/en/blog/divisions-duolingo-explication)
- [Book of Mormon editions, 1830–1981](https://eom.byu.edu/index.php/Book_of_Mormon_Editions_(1830-1981))
- [Free Use Bible API — public domain texts including BSB](https://faith.tools/app/288-free-use-bible-api)
