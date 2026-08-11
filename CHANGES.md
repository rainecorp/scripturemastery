# Scripture Quest Update Notes

## 2026-08-10 Arena Heart Bonus

### Changed

- Arena results now award bonus XP for completing a round while conserving heart hints.
- Completing a round with zero hearts used earns the `Heartstrong Finish` bonus for +25 XP.
- Completing a round with exactly one heart used earns the `One-Heart Climb` bonus for +10 XP and a "Good job!" result message.
- The results summary now says `Hearts used` instead of generic `Hints used`.
- Every heart spent now counts toward the round total, even if multiple hints are used on the same puzzle.

### Why

- Hearts should feel like an intentional Arena resource, not just a hidden hint counter.
- Rewarding restraint makes hint usage more game-like: kids can spend help when they need it, but there is a clear reason to try finishing cleanly.
- The end-of-round language now celebrates near-clean clears instead of only punishing hint use.

## 2026-08-10 Untangle Context + Arena Hearts

### Changed

- Untangle the Verse now shows a previous-words lead-in when the scrambled phrase starts mid-verse.
- Added a persistent Arena heart bank with three heart hints.
- Added a heart row on the Home Arena quest card, Arena setup, and active Arena rounds.
- Added a heart hint for Untangle that places the next correct word.
- Converted existing Arena hint buttons to spend hearts before revealing help.
- Daily Check-in blessing now advertises and refills Arena hearts.
- Study/Tower progress now refills one heart when a shard is earned, a verse is sealed, a seal is restored, or a seal is polished.

### Why

- Mid-verse Untangle prompts like "would hearken unto..." were not intuitive without the phrase that came before.
- Hearts give kids a forgiving way through the Arena without turning every question into an all-or-nothing moment.
- Refilling hearts through Study/Towers ties Arena help back to the main scripture mastery loop.

### Verification

- Loaded the app in browser with no console errors.
- Opened a Thread Weaver / Untangle quest and verified the previous-words context appears.
- Used a heart hint in Untangle and verified it placed the next word and changed hearts from `3/3` to `2/3`.
- Claimed the Daily Check-in blessing and verified hearts refilled back to `3/3`.

## 2026-08-09 Arena Thoroughness Pass

### Changed

- Fixed Reference Match, Keyword Match, and Timed Recall choices so they no longer reveal the answer theme under the reference.
- Added a live quest HUD inside quest-launched Arena rounds so Home-page quests visibly show their current progress while playing.
- Split quest cards into active and won states. Active cards show `Play`; completed cards show `Won`.
- Made won quest cards useful: tapping one opens the Arena stats / Quest Shelf instead of feeling dead or replaying confusingly.
- Added a `Today's quests` button to quest result screens so returning to the quest board is explicit.
- Changed the Verse Builder quest to track correct phrase placements, matching its "8 sections" wording.
- Tightened Prove It option feedback: correct choices now disable/fade the option bank immediately and advance faster, avoiding stale highlighted buttons.

### Why

- Some Arena questions were not real challenges because the correct option included its own theme/answer.
- Home-page quests needed a clearer loop from quest card -> Arena round -> progress -> quest board.
- Prove It could appear to keep the previous selected slot highlighted when the next prompt reused that same button position.

### Verification

- Reloaded the local app in browser with no console errors.
- Launched Reference Ranger from the Home-page quest card.
- Verified Reference Match options showed only references, not answer themes.
- Answered one Reference Ranger question and verified the quest HUD advanced from `0/5` to `1/5`.
- Opened Prove It and verified correct selections advance to fresh options without lingering `.correct` styling.

## Changed

- Widened the Arena setup so it uses the full app page width instead of staying capped in a narrow center column.
- Reworked the Arena setup output into three peer modes: Quick Practice, Book Mastery Challenges, and Grand Scripture Challenge.
- Moved the active Arena filters into a summary above the mode chooser so the modes are easier to compare.
- Changed Relic Shelf clicks to open a detail popup instead of jumping straight to Study.
- Added relic detail content: relic name, motto, reference, volume, shelf status, theme, verse text, a Study button, and an external scripture link.
- Added direct scripture URL generation for the books used in this app, with a Church search fallback for unusual references.

## Why

- The Arena looked visually smaller than the rest of the page and made the challenge modes feel secondary.
- The old Shelf click behavior was surprising because users could not inspect the relic or verse before being moved into Study.
- The popup keeps the Shelf as a trophy room while still making Study and the official scripture page easy to reach.

## Verification

- Reloaded the local app in the browser with no console errors.
- Verified the `1 Nephi 3:7` relic popup shows the relic title, reference, verse text, Study action, and direct scripture link.
- Verified the Study action closes the popup and opens the correct Study page.
- Measured the desktop Arena layout: the page wrapper is 980px wide and the Arena panel now uses 952px inside its padding.
