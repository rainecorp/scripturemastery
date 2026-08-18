# Backend setup — Billing Slice 1

This is the whole backend: one Postgres schema (via Supabase) and no separate
server process. Everything the app needs beyond that is `js/29-accounts.js`
talking to Supabase directly from the browser, protected by the Row Level
Security policies in `migrations/0001_accounts_and_profiles.sql`.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) → sign up → **New Project**.
2. Pick a strong database password and save it somewhere safe. You will not
   need to hand it to Claude or paste it into any client file — it's for
   direct database access (SQL editor, CLI), not for the app.
3. Wait for provisioning (a minute or two).

## 2. Run the migration

Easiest path, no CLI install required:

1. Open your project → **SQL Editor** (left sidebar).
2. New query → paste the full contents of
   `migrations/0001_accounts_and_profiles.sql` → **Run**.
3. Check **Table Editor** — you should see `accounts` and `profiles`, both
   with a shield icon indicating RLS is on.

(If you'd rather use the Supabase CLI and keep this directory as the real
source of truth long-term — `supabase link`, `supabase db push` — that works
too; the SQL is identical either way.)

## 3. Get the two values the client needs

**Project Settings → API**. Copy:

- **Project URL** — looks like `https://abcdefghijklm.supabase.co`
- **`anon` `public`** key — a long JWT-looking string

Hand both to me (or paste them into `js/29-accounts.js` yourself, replacing
the two `REPLACE_WITH_...` placeholders near the top of the file).

**Do not copy the `service_role` key anywhere in this repo.** It bypasses
every RLS policy above. It has no legitimate use in a static, client-only
app — if a future slice needs it (a webhook handler, say), it lives only as
a secret on whatever server runs that handler, never in a file that ships to
a browser.

## 4. Turn on Google sign-in

**Authentication → Providers → Google** → toggle on. You'll need a Google
OAuth Client ID/Secret from the
[Google Cloud Console](https://console.cloud.google.com/) — Supabase's
provider page shows the exact redirect URI to register there
(`https://<your-project-ref>.supabase.co/auth/v1/callback`). I can walk you
through the Google Cloud Console side step-by-step when you're ready for it;
it needs your Google account, so it's a "you click it" step either way.

## 5. Allow this app's URL to receive the auth redirect

**Authentication → URL Configuration → Redirect URLs** — add every URL
`account.html` will actually be served from:

- `http://localhost:8483/account.html` (this repo's local dev server, for
  testing before anything is deployed)
- `https://rainecorp.github.io/scripturemastery/account.html` (once GitHub
  Pages is enabled — see the root `HANDOFF.md` for that step)
- your real domain's `account.html`, once you buy one

Missing this step is the most common "Google sign-in redirects to a blank
error page" cause — if that happens, check this list first.

## 6. Optional: email confirmation

**Authentication → Providers → Email** — "Confirm email" is on by default,
which means a new sign-up can't sign in until they click a link Supabase
emails them (using Supabase's own limited-volume sender on the free tier —
fine for testing, worth revisiting before real launch volume). Turn it off
if you want frictionless testing while building; turn it back on before
anything real ships, or add your own SMTP provider under
**Project Settings → Auth → SMTP**.

## What's deliberately not here yet

- **Apple sign-in** — needs an active Apple Developer Program enrollment.
  Deferred by your own call; email + Google ship first.
- **Server-side hero_id validation** — see the comment above the `profiles`
  table in the migration. RLS already stops anyone but the account owner
  from writing to their own profiles; it does not yet stop that owner's
  client from sending a `hero_id`/`display_name` combination outside the
  curated allowlist. Low risk today (nothing reads `hero_id` server-side
  yet), worth closing before this is load-bearing for real children's data.
- **Cross-device state sync.** This slice makes identity real. The tower
  save itself still lives only in this browser's `localStorage`, exactly as
  it does today — see `docs/INVENTORY.md` §12 for why that's a deliberate,
  separate piece of work rather than bundled in here.
