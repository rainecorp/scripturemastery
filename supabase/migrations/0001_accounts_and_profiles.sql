-- 0001_accounts_and_profiles.sql — Billing Slice 1: identity
-- ===========================================================================
-- What this is, and what it deliberately is not:
--
--   This is IDENTITY only — a stable account, and the profiles under it. It
--   does not sync tower progress. The existing localStorage save stays the
--   source of truth for a player's actual state; this schema exists so that
--   *who a save belongs to* can be a real, cross-device account instead of a
--   free-text name typed into one browser's localStorage. Cross-device sync
--   of the save itself is later work — see docs/INVENTORY.md §12 and
--   ROADMAP.md's T20 — with its own conflict-resolution design, which this
--   migration does not attempt to pre-empt.
--
--   The parent/child model here is ROADMAP.md §5.6, and it is load-bearing,
--   not decorative: a child never gets their own credentials. A parent
--   authenticates (email or Google today; Apple to follow), and every child
--   is a `profiles` row under that parent's account. A child profile's
--   `display_name` MUST come from account.html's curated hero allowlist —
--   enforced client-side today; nothing in this schema currently blocks a
--   client from inserting free text into a child's display_name, which is a
--   known gap (see the note above the profiles table) worth closing with a
--   server-side check before this handles real children's data at scale.
--
--   The rule that must never move: no attribution, click cookie, or
--   commission row may ever reference a child profile. Slices 6+ (the
--   affiliate program) are not built yet, so there is nothing to constrain
--   today — but when `customer_attributions` arrives, its foreign key MUST
--   point at `accounts`, never at `profiles`, so a child profile is
--   structurally incapable of carrying attribution. Do not "helpfully"
--   FK it to profiles later without re-reading ROADMAP.md §5.6 first.
-- ===========================================================================

create extension if not exists pgcrypto with schema extensions;

-- One row per authenticated adult identity. 1:1 with auth.users; the id IS
-- the auth.users id on purpose, so "does this account own this row" is
-- always just `account_id = auth.uid()`, with no extra join.
create table public.accounts (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

-- Every player — the signed-in adult themself, or a child underneath them —
-- is a profile. There is no separate child-account concept anywhere in this
-- schema; that absence is the point.
--
-- KNOWN GAP: hero_id is not validated against the actual curated allowlist
-- server-side (that list lives in account.html, a client file). The CHECK
-- constraints below stop a child profile from being created with no hero and
-- stop display_name from being empty or absurdly long, but they do not stop
-- a modified client from inserting arbitrary display_name text for a child.
-- Acceptable for Slice 1 — RLS already prevents anyone but the owning
-- account from writing here at all — but tighten with a `hero_id in (...)`
-- check (or a lookup table) before this is the only thing standing between
-- a child profile and free-text PII.
create table public.profiles (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references public.accounts(id) on delete cascade,
  kind          text not null check (kind in ('adult','child')),
  display_name  text not null check (char_length(display_name) between 1 and 40),
  hero_id       text,
  created_at    timestamptz not null default now(),
  constraint child_requires_hero check (kind <> 'child' or hero_id is not null),
  constraint adult_has_no_hero   check (kind <> 'adult' or hero_id is null)
);
create index profiles_account_id_idx on public.profiles(account_id);

alter table public.accounts enable row level security;
alter table public.profiles enable row level security;

-- An account can only ever see or touch itself.
create policy accounts_self on public.accounts
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- An account can only ever see or touch its own profiles — adult or child.
-- This is the policy that makes "a child can't be reached except through
-- their own parent's authenticated session" a database guarantee rather
-- than an application convention.
create policy profiles_own_account on public.profiles
  for all
  using (account_id = auth.uid())
  with check (account_id = auth.uid());

-- Every sign-up gets an account row and a default adult profile
-- automatically, so client code can never forget to create one (and RLS
-- always has a row to evaluate against, immediately after auth completes).
-- The default display name is best-effort and meant to be renamed —
-- account.html offers that on first login.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accounts (id, email) values (new.id, new.email);
  insert into public.profiles (account_id, kind, display_name)
    values (new.id, 'adult', coalesce(nullif(split_part(new.email, '@', 1), ''), 'Player'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
