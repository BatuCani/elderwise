-- Per-user profile and answer history for signed-in Elderwise users.
-- Row level security: every user can only read and write their own rows.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  font_size text not null default 'normal',
  speech_rate real not null default 0.9,
  lang text not null default 'en',
  trusted jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.answers (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  at bigint not null,
  question text not null,
  answer jsonb not null
);

create index answers_user_at on public.answers (user_id, at desc);

alter table public.profiles enable row level security;
alter table public.answers enable row level security;

create policy "own profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "own answers" on public.answers
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
