import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { embedText } from '../lib/openai.js'
import { streamGroqToResponse } from '../lib/groq.js'
import { loadKnowledge } from '../lib/knowledge.js'

const router = Router()

const SYSTEM_PROMPT = `You are Nexus, a precise research assistant. Answer using the CONTEXT block when it's relevant.
If the context doesn't contain the answer, say so plainly, then answer from general knowledge.
Keep answers clear and well-structured.`

// POST /api/chat  { question, history }
// Streams Server-Sent Events: {token} chunks, then a final {done, sources} event.
// Free mode: pulls the whole backend/knowledge.txt file in as context, no embeddings, no OpenAI cost.
router.post('/chat', async (req, res) => {
  const { question, history = [] } = req.body
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'question is required' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  try {
    const knowledge = loadKnowledge()
    const contextBlock = knowledge.trim() ? knowledge : '(no knowledge.txt loaded)'

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: `CONTEXT:\n${contextBlock}\n\nQUESTION: ${question}` }
    ]

    const answer = await streamGroqToResponse(messages, res)

    res.write(`data: ${JSON.stringify({ done: true, answer, sources: [] })}\n\n`)
    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
    res.end()
  }
})

// POST /api/ingest  { text, source }
// Chunks text, embeds each piece, stores in `documents`. Used to grow the knowledge base.
router.post('/ingest', async (req, res) => {
  const { text, source = 'manual' } = req.body
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' })
  }

  const size = 800
  const overlap = 100
  const chunks = []
  let start = 0
  while (start < text.length) {
    chunks.push(text.slice(start, Math.min(start + size, text.length)))
    start += size - overlap
  }

  try {
    let inserted = 0
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i])
      const { error } = await supabase
        .from('documents')
        .insert({ content: chunks[i], embedding, metadata: { source, chunk: i } })
      if (error) throw error
      inserted++
    }
    res.json({ inserted, totalChunks: chunks.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
