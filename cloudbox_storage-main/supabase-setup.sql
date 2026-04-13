-- Run this in the Supabase SQL editor.
-- Bucket name required by the app: files

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.folders(id) on delete cascade,
  created_at timestamptz not null default now(),
  trashed_at timestamptz
);

alter table public.folders
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists parent_id uuid references public.folders(id) on delete cascade,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists trashed_at timestamptz;

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references public.folders(id) on delete cascade,
  file_url text not null,
  size bigint not null default 0,
  created_at timestamptz not null default now(),
  trashed_at timestamptz
);

alter table public.files
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists folder_id uuid references public.folders(id) on delete cascade,
  add column if not exists file_url text,
  add column if not exists size bigint not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists trashed_at timestamptz;

alter table public.folders enable row level security;
alter table public.files enable row level security;

drop policy if exists "Users can read their folders" on public.folders;
create policy "Users can read their folders"
on public.folders for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their folders" on public.folders;
create policy "Users can create their folders"
on public.folders for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their folders" on public.folders;
create policy "Users can update their folders"
on public.folders for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their folders" on public.folders;
create policy "Users can delete their folders"
on public.folders for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their files" on public.files;
create policy "Users can read their files"
on public.files for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their files" on public.files;
create policy "Users can create their files"
on public.files for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their files" on public.files;
create policy "Users can update their files"
on public.files for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their files" on public.files;
create policy "Users can delete their files"
on public.files for delete to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('files', 'files', false)
on conflict (id) do nothing;

drop policy if exists "Users can read their storage files" on storage.objects;
create policy "Users can read their storage files"
on storage.objects for select to authenticated
using (
  bucket_id = 'files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload their storage files" on storage.objects;
create policy "Users can upload their storage files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their storage files" on storage.objects;
create policy "Users can delete their storage files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'files'
  and (storage.foldername(name))[1] = auth.uid()::text
);
