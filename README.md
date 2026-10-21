# Nexus — RAG Chatbot

```
rag-chatbot/
  frontend/    React + Vite app
  backend/     Express API (holds OpenAI + Groq keys)
  sql/         Supabase schema
```

Split on purpose: OpenAI + Groq keys live only in `backend/`, never reach the browser. `frontend/` only ever holds the Supabase anon key (meant to be public, protected by RLS).

## 1. Supabase project

1. Create project at supabase.com.
2. SQL editor → run `sql/schema.sql` — creates `chats`, `messages`, `documents`, `match_documents` fn, RLS.
3. Auth → Providers → Email enabled. Turn off "Confirm email" for faster local dev.
4. Settings → API → grab: Project URL, `anon` key, `service_role` key.

## 2. Backend

```
cd backend
npm install
cp .env.example .env   # fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY, GROQ_API_KEY
npm run dev             # http://localhost:8787
```

Routes:
- `POST /api/chat` — `{ question, history }` → SSE stream of `{token}` chunks, ends with `{done, answer, sources}`
- `POST /api/ingest` — `{ text, source }` → chunks, embeds, stores into `documents`
- `GET /health`

## 3. Frontend

```
cd frontend
npm install
cp .env.example .env   # fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_BACKEND_URL
npm run dev             # http://localhost:5173
```

## 4. Load a knowledge base (optional, this is what makes it RAG)

Backend must be running:

```
cd backend
node scripts/ingest.mjs path/to/your-notes.txt
```

Skip this and Nexus just answers from general knowledge — degrades gracefully.

## The 3 keys, where they live now

| Key | Lives in | Used for |
|---|---|---|
| Supabase anon key | `frontend/.env` | auth, reading/writing chats — safe to expose, RLS-protected |
| Supabase service role key | `backend/.env` | server-side writes to `documents`, bypasses RLS — never expose |
| OpenAI key | `backend/.env` | `text-embedding-3-small` only |
| Groq key | `backend/.env` | actual chat answers, streamed |

## Running both at once

Two terminals:
```
cd backend && npm run dev
cd frontend && npm run dev
```
Both need to be up for chat to answer. Frontend alone still handles auth/history fine — Supabase talks direct.
