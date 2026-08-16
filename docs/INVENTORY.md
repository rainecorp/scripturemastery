# INVENTORY — Slice 0 audit

**Produced:** 2026-08-16
**Audits:** this repository, at commit `91174fc` (T18 shipped)
**Against:** `CLAUDE-CODE-HANDOFF.md` v1.1 — "Affiliate & Billing Build Handoff"
**Scope:** read-only audit. No application code was written or changed.

---

## 0 · Verdict — the handoff's own stop condition is met

> **From §4 of the handoff:** *"Stop and report if: the app has no server-side user identity (everything is localStorage). Account-level attribution is the foundation of this entire system and cannot be built on device-local state. That would change the slice order materially."*

**That is this app, exactly.** There is no server. There is no `users` table, no session, no token, no network call of any kind in the application code. Every byte of state lives in `localStorage` on one device in one browser. The thing that *looks* like accounts — `usernames.html` — is a device-local profile picker (details in §2), and it cannot recognize the same human on a second device even in principle.

So, per the document's own instruction: **stopping here and reporting, rather than proceeding to Slice 1.**

This is not a blocker so much as a re-scoping. Slice 1 is written as *"check whether cross-device identity exists; if it does, note it and move on."* Here the answer is that it doesn't exist and nothing adjacent to it exists either — no backend, no database, no package manager, no deploy pipeline, no server-side anything. **Slice 1 is not a slice of this codebase. It is a new, second codebase**, and it should be planned and estimated as one. §11 of this document proposes how.

Three findings soften that, and one sharpens it:

- ✅ **`state.entitlement` already exists** in the exact shape the handoff's §6.1 returns. See §4.
- ✅ **Translation is already a first-class concept.** Slice 2 — flagged in the handoff as *"the most expensive mistake available in this project"* — is substantially already built. See §5.
- ✅ **A real, tested migration runner exists.** See §7.
- ⚠️ **The handoff contains factual errors about this app** and a **direct pricing contradiction** with `ROADMAP.md` that changes the affiliate program's economics by an order of magnitude. See §10.

> **Update, 2026-08-16 — two of the three §10 conflicts are now closed by owner decision.** Pricing resolved in the handoff's favour (§10.2); COPPA in / FERPA out, with a posture drafted in `ROADMAP.md` §5.6 (§10.3). The owner also **released the Daily Quest tie-in as a constraint** — see §3. **The one remaining blocker before Slice 1 is the backend stack and host choice** (§11).

---

## 1 · Stack

| | |
|---|---|
| **Language** | Vanilla ES2020 JavaScript. No TypeScript. |
| **Framework** | None. Deliberately. |
| **Module system** | None — classic `<script>` tags in `index.html`, load-order-numbered (`js/00-…` → `js/28-…`). ES modules are ruled out because they're CORS-blocked over `file://`, which the app supports on purpose. Cross-file sharing goes through one `SQ` global registry (`js/00-namespace.js`). |
| **Dependencies** | **Zero.** No `package.json`, no lockfile, no `node_modules`, no bundler, no transpiler, no build step. |
| **Database** | **None.** `localStorage` only. |
| **Hosting** | Static files. Repo is `github.com/rainecorp/scripturemastery`. Local preview is `python3 -m http.server 8483` (`.claude/launch.json`) — a dev convenience, not a server tier. Production host is not specified in the repo. |
| **Package manager** | None. |
| **Test runner** | None. Tests are standalone Node scripts with a hand-rolled 5-line assertion harness (`ok()`/`eq()`, counters, `process.exit(1)`). Run as `node tests/x.test.js`. |
| **CI** | None found. |
| **Assets** | 13 hand-authored CSS files, self-hosted Cinzel woff2, PNG/WebP art, `manifest.json`, `sw.js`. |

**Implication for this project, stated plainly:** every technology the handoff assumes — Postgres, `uuid`, `citext`, `jsonb`, enums, migrations, Stripe SDK, webhook endpoints, a request/response cycle, an auth layer — is absent, and there is no scaffolding to hang them on. Slices 1, 3, 4, and 5 are not modifications to this codebase. They are a new service that this codebase will eventually call.

---

## 2 · Auth & accounts

**There is no server-side user record. There is no authentication.**

What exists is a profile *namespacing* scheme:

- `usernames.html` writes `localStorage["scriptureProfiles_v1"] = {profiles:{<username>:{id, username, heroId, collection, pinHash, createdAt, lastLogin}}}`.
- "Signing in" = `ScriptureProfiles.verify(username, pin)`, which SHA-256-hashes `"sq::"+username+"::"+pin` **in the browser** and string-compares it to the hash sitting in the same `localStorage` the user controls. It then redirects to `index.html?climber=<username>`.
- `js/03-state.js` reads that into `const CLIMBER`, and namespaces the save: `STORE_KEY = CLIMBER ? "lineUponLine_v1::"+CLIMBER : "lineUponLine_v1"`.
- `usernames.html?claim=1` runs `adoptGuestSave()`, which moves the anonymous save under the namespaced key.
- There's a `file://` fallback that replaces SHA-256 with a 32-bit FNV hash when `crypto.subtle` is unavailable.

**Why this cannot carry attribution:**

1. **It is not identity across devices.** The profile exists in one browser's `localStorage`. The same child on a school Chromebook and a home iPad is two unrelated profiles with no link between them. Handoff test case **#3 — *"Click on phone → signup → purchase on laptop → commission"*** — is not merely unimplemented; it is not expressible.
2. **It is not authentication.** The PIN hash is client-side, unsalted beyond the username, 4 digits (10,000 candidates), and stored next to the data it protects. Anyone with devtools is any profile. That's fine for its actual job — keeping siblings out of each other's towers — and completely unfit to gate money or a commission ledger.
3. **`user_id` is not stable.** Profile IDs are `"usr_"+Math.random().toString(16).slice(2,10)` — 8 hex chars, generated locally, never coordinated. Collisions across devices are not just possible, they're unremarkable, and there is no authority that could detect one.

**The `users` table every schema in handoff §5 foreign-keys into does not exist, and nothing in this repo can be promoted into it.** It has to be built from zero, and existing local profiles can at best be *claimed* into it later (which is a real migration story worth designing — see §11).

---

## 3 · Existing sync

**There is no cloud sync and no family sync.** The handoff's ground rule 6 and §10 guardrail both instruct: *"Do not refactor relics, spaced repetition, family sync, or the Daily Quest bridge."* Of those four, **"family sync" does not exist in this codebase** — see §10.1. The other three do:

**Daily Quest bridge (real, load-bearing).** A same-origin `localStorage` handshake with a separate app called Daily Quest:
- Reads `localStorage["dailyUnlocks_v1"].selectedProfile` to learn who's playing, and `sq_activeClimber` as a fallback.
- `emitBridge()` appends seal events to `localStorage["lul_bridge_events"]` (`BRIDGE_KEY`, `js/00-config.js:139`), capped at 200, which Daily Quest converts into XP and a completed daily.
- Accepts `?climber=<name>` and `?from=` on the URL.

This is a one-way, same-origin, best-effort event queue. It is **not** sync — nothing is reconciled, nothing round-trips, and it silently no-ops when `CLIMBER` is null.

> ✅ **Released as a constraint, 2026-08-16 (owner):** Scripture Quest is now to be a full standalone product rather than a Daily Quest companion, and the owner retains their own copy of Daily Quest independently. **The handoff's "don't break the Daily Quest bridge" guardrail no longer binds.**
> **Recommended handling: don't delete it now — retire it during Slice 1.** It is inert when `CLIMBER` is null and harmless today, and the code that implements it (`CLIMBER`, `STORE_KEY` namespacing, `emitBridge`, `?climber=`) is *exactly* the code that server-side identity replaces. Removing it as part of that change is one coherent edit; removing it now is a separate destructive change that buys nothing. `js/00-config.js:139`, `js/03-state.js:14-58`.

**Manual export/import (real).** `exportProgress()` (`js/03-state.js:204`) emits `{exportFormat:1, exportedAt, climber, state}`; `previewProgressImport()` validates a pasted blob, accepts either the wrapped or bare shape, and runs it through the same migration runner as a boot-time load. This is the only way progress moves between devices today: a human copies a JSON file.

**Storage limits are already a live concern.** `js/03-state.js` carries explicit quota handling — it measures its own footprint against the ~5 MB per-origin cap, records `storageLastError = {kind:"quota"}`, and sheds data. Worth knowing before anyone proposes caching server responses locally.

---

## 4 · Existing monetization

**No payment code, no paywall, no checkout, no plan selector, no receipt handling, no price constant anywhere.**

But — and this is the most useful finding in the audit — **the entitlement *shape* already exists and is already load-bearing:**

```js
// js/03-state.js:526
def("entitlement", {tier:"free", source:null, expiresAt:null});
```

Compare the handoff's §6.1 response body: `{tier, sources[], expires_at, in_grace_period}`. Same three fields, near-identical names. Someone was thinking ahead.

And it is **already enforced**, not decorative:

```js
// js/00-custom.js:100
function canCreateCustomPassage(count, entitlement){
  const tier = entitlement && entitlement.tier;
  return tier && tier !== "free" ? true : Number(count||0) < CUSTOM_FREE_PASSAGE_LIMIT;
}
function canCreateCustomCollection(count, entitlement){ /* same shape */ }
```

`js/24-custom.js` gates the custom-content builder on both, and the UI already tells the user what's coming: *"Quest+ will add unlimited passages and towers when accounts and purchases ship."* These functions are pure, dual-exported, and covered by `tests/custom.test.js`.

**What this means for Slice 3:** the client-side consumption of entitlement is partly built and correctly factored — a pure predicate taking an entitlement object, not a scattered set of `if(isPro)` checks. The gap is that `state.entitlement` is *seeded from a local default and never written by anything*. Slice 3's work here is (a) build the server endpoint, (b) populate this object from it, (c) treat the local value as a cache with an offline fallback — which the PWA requirement makes mandatory anyway.

⚠️ **One caution:** because `state.entitlement` lives in user-writable `localStorage`, it is trivially forgeable today. That's harmless while nothing is sold. The moment it gates paid features, **the server must be the authority** and the local copy must be a cache only. Handoff §10's *"do not infer `subscription_source`"* has a sibling rule worth writing down: *do not trust a client-reported tier.*

---

## 5 · Scripture storage — better than the handoff assumes

Slice 2 asks: *"Is translation a first-class concept, or is text hardcoded/single-source?"*

**It is first-class, and most of Slice 2 is already built.**

- Passages carry a **per-translation text map**: `passage.texts = {lds2013:"…", bsb:"…", kjv:"…"}`. Keys actually present in the data today: **`lds2013` (158 passages), `kjv` (99), `bsb` (99)**. WEB and ASV are named in `ROADMAP.md` §10 as resolved *intent* but are not in the data yet.
- Content packs declare `defaultTranslation` (`data/passages.js:668` `lds2013`, `data/christian.js:5` `bsb`, `data/articles-of-faith.js:155`).
- Tracks declare a `translations[]` array, read through `translationOptionsForTrack()` (`js/01-catalog.js:47`).
  ⚠️ **Only the `christian` track actually declares one** (`["bsb","kjv"]`, `data/christian.js:1147`). The `seminary` track — the default and primary track — declares `defaultTranslation:"lds2013"` and **no `translations` array at all**, so `translationOptionsForTrack()` returns `[]` and the switcher has nothing to offer. The abstraction is genuinely first-class in shape but exercised by exactly one of two tracks.
- `js/00-content.js` resolves text through one boundary — `passageInTranslation(passage, translation)` (line 207) and the normalization at line 145 — with a documented fallback chain (`raw.translation` → `track.defaultTranslation` → `pack.defaultTranslation` → `"lds2013"`).
- `state.translation` persists the choice and is validated on load against the track's allowed list (`js/03-state.js:530-533`), self-healing to the default if invalid.
- There is a **provenance and verification layer** (`data/text-sources*.js`, `js/00-verify.js`, `data/TEXT-REVIEW.md`): per-passage `{hash, source, verifiedAt, by}` records, with `textVerification` surfaced on the passage object and enforced by `tests/verify.test.js` (41 assertions). The rules comment is explicit that an entry added on faith is worse than none.
- `ROADMAP.md` §10 records translations as a **resolved** decision: BSB, KJV, WEB, ASV.

**Adding a translation today is already close to a data-only change** — add the key to each passage's `texts` map and to the track's `translations[]`. No renderer knows a translation name.

**The gap against Slice 2, precisely:**

| Slice 2 asks for | Status |
|---|---|
| One interface all verse text flows through | ✅ Exists (`passageInTranslation` / `00-content.js`) |
| Translation as data, not code | ✅ Effectively — content packs are data files |
| A `translations` **registry** with metadata | ❌ Missing. Translation keys are bare strings; there's no record of what `bsb` *is*. |
| `is_public_domain` flag | ❌ Missing |
| `requires_entitlement` flag | ❌ Missing — and note `ROADMAP.md` §5.2 puts *"All translations"* behind Quest+, so this flag has a product consumer already |
| `licensor` field | ❌ Missing |

**This is a small, cheap, high-value piece of work that needs no backend and no decisions** — a `data/translations.js` registry keyed by the strings already in use, plus a lookup in `00-content.js`. It's the one part of the entire handoff that can be done today, safely, in isolation. See §11.

---

## 6 · Client surfaces

**Web only, today.** One responsive single-page app, plus `usernames.html` and some standalone tower demos.

- **PWA shipped (T15b):** `manifest.json`, `sw.js` (cache-first shell, offline mode), self-hosted fonts, maskable icons at 192/512, apple-touch-icon.
- **No iOS build. No Android build.** No Xcode project, no Gradle, no Capacitor config, no `www/` output, no native wrapper of any kind in the repo.
- `ROADMAP.md` §10 records the *intent* as resolved — "web PWA + Capacitor iOS + TWA Android" — but no work has started.
- `file://` compatibility is deliberately maintained (the whole no-ES-modules constraint follows from it).

**Implication for Slice 5 (native receipts):** there is no native client to receive a receipt from. Slice 5 has a prerequisite that isn't in the handoff's dependency table — *build the native wrappers first*. Practically: Capacitor + StoreKit 2 for iOS. On Android a TWA *can* reach Play Billing through the Digital Goods API, so the roadmap's TWA plan isn't disqualified — but it's the narrower, fussier path, and using Capacitor on both platforms means one purchase integration instead of two. That's a real body of work either way, plus two developer-account enrollments and two review cycles.

**Implication for Slice 13 (IAP steer):** it presumes native paywalls, storefront detection, and App Review exposure. All downstream of the above.

---

## 7 · Migration mechanism

**A real one exists, for client state.** `js/03-state.js`:

- `const SCHEMA_VERSION = 4;` (line 111) with an ordered `MIGRATIONS` list and `runMigrations(s, migrations)` (line 173) that applies every migration between `s.schemaVersion` and current, then stamps the version.
- The runner is **injectable** — passing a migration list is how tests exercise resume-from-version behavior against the real runner.
- The documented rules are good and should be respected: migrations must be idempotent, and must **never strip an unrecognized field** (so a save from a newer build survives an older migration).
- The same runner handles boot loads *and* imports, so there is exactly one upgrade path.
- Corrupt saves are preserved to a recovery key rather than discarded (line ~83).

**For database schema, there is nothing** — no SQL, no migration tool, no `db/` directory. That decision is unmade and belongs with the stack decision in §11.

---

## 8 · Test coverage

**8 Node suites, 401 assertions, all green.** No framework — each file `require()`s a pure module, counts with `ok()`/`eq()`, and exits non-zero on failure.

```bash
node tests/tokenize.test.js   # 89   node tests/content.test.js   # 94
node tests/recall.test.js     # 86   node tests/phrases.test.js   # 14
node tests/verify.test.js     # 41   node tests/custom.test.js    # 30
node tests/learning.test.js   # 24   node tests/refmatch.test.js  # 23
```

**Only tier-00 files are Node-testable** — the pure modules dual-export `module.exports` and `SQ.*`. Everything with ambient dependencies (`state`, DOM, `SFX`) — including all of storage, migration, import/export, and every UI file — is verified **in a real browser** against HTML fixtures (`tests/seed-fixture.html`, `onboarding-fixture.html`, `custom-fixture.html`). `HANDOFF.md` §4 is blunt about not fighting this: *don't try to make `03-state.js` importable.*

There's also `tests/fingerprint.js`, a deterministic DOM + computed-style hash used to prove a refactor changed nothing.

**Relevance to the money slices.** Handoff §2.7 requires slices 8–11 be test-first, and §9 is a 38-case normative suite. The good news: this project's testing culture is genuinely strong and the hand-rolled harness style would work fine for pure commission math. The bad news: **§9 is overwhelmingly integration testing** — webhook replay, 10 concurrent deliveries, refunds 60 days after payout — which needs a database, a transaction boundary, and a fixture/factory layer that don't exist in any form. The commission *arithmetic* (§3.4, §3.5, half-up rounding) is pure and would slot into this harness on day one. The rest needs a real test stack chosen alongside the backend.

---

## 9 · Reconciliation table

Every table in handoff §5, plus the `users` table all of them foreign-key into.

> **Status note, 2026-08-16:** Slice 2 has since **shipped** — see §12. The translation row below is kept as the audit found it.

| This spec requires | Exists today? | Gap |
|---|---|---|
| `users` | ❌ **No** | No server. `scriptureProfiles_v1` in `localStorage` is device-local, unauthenticated, with locally-generated random IDs. Cannot be promoted; must be built from zero. **This is the §4 stop condition.** |
| Session / token auth | ❌ No | 4-digit PIN hashed client-side, verified client-side, stored client-side. Not auth in any security sense. |
| `affiliates` | ❌ No | Nothing adjacent exists. Needs `citext`, enums, `jsonb`, a `users` FK. |
| `affiliate_clicks` | ❌ No | No server → no request to log, no IP to hash, no cookie to set. `?ref=` cannot be captured by a static file. |
| `customer_attributions` | ❌ No | Depends entirely on `users`. |
| `subscriptions` (with explicit `source`) | ❌ No | No subscription concept. But see `state.entitlement` (§4) — the *client* consumer of this exists and is already enforced. |
| `stripe_events` (idempotency guard #1) | ❌ No | No webhook endpoint; no HTTP surface at all. |
| `payouts` | ❌ No | — |
| `commissions` (+ unique `(source_ref, affiliate_id)`, guard #2) | ❌ No | — |
| `affiliate_ledger` | ❌ No | — |
| Translation abstraction | ⚠️ **Mostly** | Per-translation text maps (`lds2013`/`kjv`/`bsb`), per-pack defaults, one resolution boundary, provenance + verification tests. **Missing:** a translations registry, the `is_public_domain` / `requires_entitlement` / `licensor` metadata, and a `translations[]` array on the primary `seminary` track. See §5. |
| Entitlement service (§6.1) | ⚠️ **Client half** | `state.entitlement = {tier, source, expiresAt}` exists and gates custom content through pure, tested predicates. **Missing:** the server, and any writer. Local value is forgeable and must become a cache, not the authority. |
| Any billing | ❌ No | Zero payment code. No price constants. |
| Native clients | ❌ No | Web PWA only. Slice 5 has an unlisted prerequisite: build the wrappers. |
| Schema migrations (DB) | ❌ No | Client-state migrations are excellent (`SCHEMA_VERSION 4`, injectable runner). No DB equivalent. |
| Money-path test infra | ⚠️ **Partial** | Strong pure-unit culture (401 assertions). Pure commission math fits today. §9's integration cases need a DB + fixtures + a chosen stack. |

---

## 10 · Conflicts — stop-and-report items

Handoff §0: *"Where it conflicts, **stop and report rather than silently refactoring**."* Three items.

### 10.1 The handoff describes features this app doesn't have

Ground rule 6 and the §10 guardrail both protect *"relics, spaced repetition, family sync, and the Daily Quest bridge."*

- **Relics** — ✅ real (`js/05-relics.js`, `js/02-relics-data.js`, `relics/`).
- **Spaced repetition** — ✅ real, and stronger than "don't break it" implies: canonical SM-2 in `js/00-learning.js`, 24 assertions, with display-strength deliberately isolated from scheduling.
- **Daily Quest bridge** — ✅ real (§3).
- **Family sync** — ❌ **does not exist.** The only "family" in the codebase is a *Coming soon* placeholder card (`js/16-shell.js:51-53`) for a future family content track, and some keyword lists. There is no family feature, no sharing, no multi-user anything.

Not a problem in itself — but it means the handoff was written against an assumed app rather than this one, which is exactly why §0 told me to audit first. **Treat its other assumptions about existing behavior as unverified too.**

### 10.2 ✅ **RESOLVED 2026-08-16 — pricing confirmed in the handoff's favour**

**The owner confirmed the handoff's ladder: $8.99/mo web, $44.99/yr web, $139.99 lifetime web; native +$1/+$5 with no lifetime.** The strategy is **annual-first** — $44.99/yr is an effective $3.75/mo, 58% below the monthly rate, and monthly at $8.99 is deliberately the price of *not committing*. `ROADMAP.md` §5.4 has been rewritten to match and now points at handoff §3.1 as the source of truth; the old $0.99/$9.99 ladder is marked superseded so nobody builds it by accident.

**Every §3.4 and §3.5 commission figure is therefore valid as written**, and the affiliate program clears its own $25 payout minimum on a single lifetime referral ($44.80). The one money constant still genuinely open is the **40% lifetime commission rate**, which is handoff §8 open item 1 and lives as a single named constant by design.

The original analysis is preserved below for the record.

---

### ~~10.2 ⚠️ Pricing — a direct, order-of-magnitude contradiction (needs your decision)~~ *(resolved above)*

Handoff §3 says its table is the single source of truth and *"if any other document disagrees, this table wins."* `ROADMAP.md` §5.4 disagrees enormously:

| | ROADMAP §5.4 | Handoff §3.1 (web) | Multiple |
|---|---:|---:|---:|
| Monthly | $0.99 | **$8.99** | **9.1×** |
| Yearly | $29.99 | **$44.99** | 1.5× |
| Lifetime | $9.99 | **$139.99** | **14.0×** |

I am not treating this as a document-precedence question, because it isn't one. These encode **two different products**:

- **ROADMAP's $0.99/mo is a deliberate competitive wedge**, reasoned out at length against BibleMemory's actual ladder ("beat monthly by $1, lifetime by $20"), and paired with an unusually generous free tier (§5.2 keeps unlimited review, leaderboards, the Daily Path, and all five study stages free) as the primary differentiator. It even flags that $0.99 nets ~$0.84 after Apple's 15% and questions whether that funds sync and speech.
- **The handoff's $139.99 lifetime / $8.99 monthly is a premium product**, and the affiliate program requires it. A 40% commission on a $9.99 lifetime is **$4.00**, not the `4480` cents (§3.4) the spec asserts. Every number in §3.4 and §3.5 — and the $25 payout minimum in §3.6 — assumes the higher ladder. **At ROADMAP's prices the affiliate program does not clear its own payout threshold**: a standard partner would need ~6 lifetime referrals to reach $25.

`ROADMAP.md` §10 open decision #1 lists the pricing ladder as **still unconfirmed** and blocking T20. So this contradiction was already open — the handoff didn't create it, it just answered it silently in a different direction.

**Needed from you:** one ladder, confirmed, that both documents then point at. This decides whether the affiliate program is viable at all, so it comes before Slice 4, not during. Everything else in the handoff is well-specified enough to build once this is settled.

### 10.3 ✅ **SCOPE SET 2026-08-16 — COPPA in, FERPA out**

**The owner scoped this to COPPA only.** FERPA is out, which means school-district procurement is not a v1 channel — a free trade, since Classroom Mode (T18) never creates a student account and is FERPA-free by construction.

A concrete COPPA posture is now drafted in **`ROADMAP.md` §5.6**: a neutral age screen; **under-13s never hold their own account** (a parent does, and child profiles hang off it); child profiles carry no PII beyond an allowlisted hero display name; and — the rule that must live in the schema rather than a policy doc — **no attribution row, click cookie, or IP hash ever attaches to a child profile.** It needs a one-line owner sign-off, plus counsel review before a paid launch (ROADMAP §10 decision 4, already tracked).

Also settled there: **ship email + Google + Sign in with Apple.** Apple is not optional once Google ships on iOS — App Store guideline 4.8 requires it alongside any third-party sign-in.

The original analysis is preserved below for the record.

---

### ~~10.3 ⚠️ COPPA / FERPA is unresolved and now blocks more than it did~~ *(scoped above)*

`ROADMAP.md` §10 decision #3 — COPPA posture for under-13 accounts, FERPA if adopted through schools — is open and marked *"Needs a documented answer before any backend."* T20 is annotated: *"For this product minors are the primary user, not an edge case."*

The handoff's Slice 1 **is** that backend. It also adds two things the roadmap hadn't weighed:

1. **Marketing attribution on accounts that may belong to children** — click tracking, 90-day cookies, `ip_hash`, `user_agent`, and a commercial relationship keyed to a user record. COPPA constrains behavioral tracking of under-13s well beyond what it constrains about accounts.
2. **A partner channel that runs through churches, seminaries, and teachers** (§3 `partner_type`, Slice 15's church flow) — i.e. adults enrolling minors, which is where FERPA and verifiable-parental-consent questions get sharp.

Handoff §8 says *do not invent answers.* This qualifies. It's a documented-policy-and-counsel question, and the answer shapes the schema (consent records, age gates, data-retention and deletion paths, what an under-13 attribution row may even contain) — cheap now, expensive after Slice 8.

---

## 11 · Recommendation

Slice 0 is complete; the stop condition is real. **Do not proceed to Slice 1 as written.** What I'd do instead:

**A. Decisions — two closed, one open.**
1. ✅ **Pricing ladder** — resolved 2026-08-16 (§10.2). `ROADMAP.md` §5.4 rewritten.
2. ✅ **Child-privacy scope** — COPPA in, FERPA out (§10.3); posture drafted in `ROADMAP.md` §5.6, awaiting a one-line sign-off. Sign-in providers settled there too: **email + Google + Sign in with Apple** (Apple being mandatory once Google ships on iOS, per App Store guideline 4.8).
3. ⏳ **Backend stack and host — still open, and now the only thing blocking Slice 1.** The handoff shows Postgres and says "adapt to the actual stack"; there is no actual stack, so this is a genuinely free choice and should be made deliberately.

**A3 was resolved on 2026-08-16 in favour of a Postgres-backed BaaS (Supabase or equivalent).** The reasoning, recorded so a future reader can tell whether it still holds:

- It supplies **Google and Apple sign-in as configuration**, and §5.6 now requires both. Building OIDC twice by hand is the single largest avoidable cost in Slice 1.
- **Row-level security is exactly the tool §5.6 needs** — "an attribution row may never reference a child profile" and "a parent may read only their own children" become database policies, which is where that rule has to live to actually hold.
- It is **real Postgres**, so handoff §5's schema — enums, `jsonb`, `citext`, partial unique indexes, the `(source_ref, affiliate_id)` idempotency guard — transfers essentially verbatim rather than being "adapted."
- It provides a migration tool, so §7's missing DB-migration story arrives for free.
- Serverless functions cover the Stripe webhook endpoint, which is the only server surface Slices 4 and 8 strictly need.

The honest counterweight: it's a platform dependency in a codebase whose defining trait is **zero dependencies**. That tension is real, but it's confined to the new service — the existing static app stays dependency-free and simply calls an API. The alternative (managed Postgres + a small Node/Fastify service) buys full control at the cost of building auth, RLS equivalents, and migrations by hand, which is likely months rather than weeks for a solo operator.

**B. Do the one thing that needs no decisions and no backend — now.**
**Finish Slice 2.** It's ~70% built (§5), it's pure data + one lookup, it can't break anything, it's testable in the existing harness, and the handoff itself flags retrofitting it later as *"the most expensive mistake available in this project."* Concretely: a `data/translations.js` registry keyed by the strings already in use (`lds2013`, `kjv`, `bsb`), each with `label`, `is_public_domain`, `requires_entitlement`, `licensor`; a lookup in `js/00-content.js`; a `translations[]` array on the `seminary` track so the switcher isn't dead there; and a `tests/content.test.js` case proving a new translation is a data-only change. This also gives §5.2's *"All translations"* Quest+ tier something real to gate on.

**C. Then re-order the remaining slices around what's actually true here.**

The handoff's best advice is in §7: *"Slices 1–5 contain no affiliate logic. You can ship a working, revenue-taking product before Slice 8 exists. Do that."* That's even more true than it reads, because slices 6–12 are a large build that earns nothing until there are customers to attribute. Suggested order:

| Order | Work | Note |
|---|---|---|
| 1 | ~~**Slice 2** (finish translations)~~ | ✅ **Shipped 2026-08-16 — see §12.** |
| 2 | ✅ *Decision A3 — stack and host* | **Resolved: Supabase-class Postgres BaaS.** |
| 3 | **Slice 1** (accounts) — *a new codebase* | Plan as a 0→1 backend, not a modification. Three things belong in it that aren't in the handoff's Slice 1: the **parent/child account model** (§5.6), the **local-profile → real-account claim migration** (`adoptGuestSave()` is the precedent and the UX is already built), and **retiring the Daily Quest bridge** (§3). |
| 4 | **Slice 3** (entitlement service) | Client half exists; server must become the authority, local value demoted to cache with offline fallback. |
| 5 | **Slice 4** (Stripe web) | **Revenue starts here.** Stop and reassess before going further. |
| 6 | *Native wrappers* — **not in the handoff's dependency table** | Capacitor iOS + Android. Prerequisite for Slice 5. Two store enrollments, two review cycles. |
| 7 | **Slice 5** (native receipts) | Plus the explicit test: attributed user buys via Apple → zero commission rows. |
| 8 | **Slices 6–12** (affiliate program) | Only once there are paying customers to attribute — and only if §10.2 resolves to a ladder that makes commissions worth paying. |

**One architectural note to carry into Slice 1**, because it's cheap now and expensive later: this app is offline-first by design and ships as a PWA. Every server call added must degrade gracefully to the local copy, and `state.entitlement` must become *"last known good, server is truth"* rather than either extreme. The existing quota handling in `js/03-state.js` is a good sign someone already thinks this way.

**And one boundary worth stating:** nothing above touches the roadmap's own track (T19 speech, T17 leagues). The affiliate/billing work is a parallel program with its own dependencies, and T17 is separately blocked on the same COPPA/FERPA decision — so resolving §10.3 unblocks both at once. That made it the highest-leverage decision on the table, and it is now made.

---

## 12 · Slice 2 — ✅ **SHIPPED 2026-08-16**

**Done-when, from the handoff:** *"Adding a translation is a config/data change requiring **zero** code changes. Prove it by adding one."*

**What shipped:**

- **`data/translations.js`** (new) — the registry, and the only file that names a translation. Three entries: `lds2013`, `kjv`, `bsb`. Each carries `label`/`short`, the handoff's three required rights fields (`isPublicDomain`, `requiresEntitlement`, `licensor`), plus `attribution` and two fields that replace hardcoded behaviour (`usesChristianTopics`, `hasAuthoredKeyPhrases`). A commented ESV entry records the licensed shape before it's needed.
- **`js/00-content.js`** — `registerTranslation`, `registeredTranslations`, `translationById`, `translationLabel`, `translationIssues`, dual-exported like the rest of tier 00.
- **Two hardcodings deleted**, which were the actual reason the abstraction wasn't real:
  - the `{bsb:"BSB",kjv:"KJV"}` label map in `js/16-shell.js` (a UI file deciding what a translation is called);
  - the twin `["bsb","kjv"].includes(key)` tests inside `passageInTranslation()`, which silently drove both topic selection and key-phrase suppression. A fourth translation would have been mishandled by both with no error.
- **`data/doctrinal-mastery.js`** — the Seminary track now declares `translations:["lds2013"]`. It previously declared a default but no list, so `translationOptionsForTrack()` returned `[]` for the app's primary track. No UI change: the picker only renders above one option.

**Two deliberate non-changes.** `requiresEntitlement` is `false` everywhere, because setting it true today would gate something currently free — `ROADMAP.md` §5.2 puts "all translations" behind Quest+, and that switch belongs to the paywall slice, not this one. And `counselReviewed` is `false` on all three, because it is: ROADMAP §10 decision 4 is still open, and the field exists precisely so "we believe" can't quietly become "we checked."

**Why `rightsBasis` exists at all,** since the handoff only asked for a boolean: `data/text-sources.js` already established the house rule that provenance beats assertion — *"an entry added on faith is worse than no entry."* A bare `isPublicDomain: true` records a conclusion and discards the reasoning behind it, which is the wrong trade for the one field in this codebase most likely to be read by a lawyer.

**Verification.** Full suite green at **418 assertions** (content 94 → 111); every `js/`, `data/` and `tests/` file passes `node --check`; `git diff --check` clean. The Done-when is asserted rather than described: the test registers **two** new translations at runtime — long after every engine and renderer in the repo was written — and asserts the resolution boundary honours both purely from their flags, in opposite directions. In the browser: registry loads with zero issues, the picker renders BSB/KJV from the registry exactly as the old map did, switching translations still swaps wording, Seminary correctly shows no picker, and all six nav tabs render on genuine clicks with a clean console.

**Not done, and out of scope by design:** *enforcing* `requiresEntitlement`, and seeding WEB/NET/ASV. Seeding is now purely a content task — a `texts` key per passage plus a registry entry — with no code change required, which is the whole point.
