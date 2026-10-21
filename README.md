# Nexus — RAG Chatbot

```text
rag-chatbot/
  frontend/    React + Vite app
  backend/     Express API (holds OpenAI + Groq keys)
  sql/         Supabase schema
```

Split on purpose: OpenAI + Groq keys live only in `backend/`, never reach the browser. `frontend/` only holds the Supabase anon key, protected by RLS.

## 1. Supabase Setup

1. Create project at [supabase.com](https://supabase.com).
2. Open SQL Editor and run `sql/schema.sql`.
3. Enable Email under Auth → Providers.
4. Get Project URL, anon key, and service role key from Settings → API.

## 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` with:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
```

Start backend:

```bash
npm run dev
```

Backend runs at `http://localhost:8787`.

## 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env` with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:8787
```

Start frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

## 4. Load Knowledge Base (Optional)

With backend running, use:

```bash
cd backend
node scripts/ingest.mjs path/to/your-notes.txt
```

This loads text for retrieval-augmented generation (RAG).

## API Routes

- `POST /api/chat` — Sends a question and streams an answer.
- `POST /api/ingest` — Processes and stores text documents.
- `GET /health` — Checks backend health.

## API Key Security

| Key | Location | Purpose |
|---|---|---|
| Supabase anon key | `frontend/.env` | Client authentication and database access, protected by RLS |
| Supabase service role key | `backend/.env` | Privileged server-side access; never expose |
| OpenAI API key | `backend/.env` | Embeddings |
| Groq API key | `backend/.env` | Chat responses |

Never commit `.env` files or publish private API keys.

## Run Both Applications

Use two VS Code terminals.

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Both applications must run for chat functionality.
