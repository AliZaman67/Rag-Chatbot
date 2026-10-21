-- Run this once in Supabase SQL editor.

create extension if not exists vector;

-- ---------- Chats ----------
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default 'New chat',
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade not null,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);

alter table chats enable row level security;
alter table messages enable row level security;

create policy "own chats" on chats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own messages" on messages
  for all using (
    exists (select 1 from chats where chats.id = messages.chat_id and chats.user_id = auth.uid())
  ) with check (
    exists (select 1 from chats where chats.id = messages.chat_id and chats.user_id = auth.uid())
  );

-- ---------- Documents (RAG knowledge base) ----------
-- text-embedding-3-small returns 1536-dim vectors
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Documents are shared knowledge, readable by any signed-in user.
alter table documents enable row level security;
create policy "read documents" on documents
  for select using (auth.role() = 'authenticated');

-- Similarity search RPC used by src/lib/rag.js
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (id uuid, content text, similarity float)
language sql stable
as $$
  select id, content, 1 - (embedding <=> query_embedding) as similarity
  from documents
  order by embedding <=> query_embedding
  limit match_count;
$$;

create index if not exists documents_embedding_idx
  on documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);
