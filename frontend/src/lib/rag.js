const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8787'

// Calls the backend's /api/chat SSE endpoint. onToken fires per chunk.
// Returns { answer, sources }.
export async function askRag({ question, history = [], onToken }) {
  const res = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history })
  })

  if (!res.ok || !res.body) {
    throw new Error(`Backend request failed: ${await res.text()}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let final = { answer: '', sources: [] }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (!payload) continue

      const json = JSON.parse(payload)
      if (json.error) throw new Error(json.error)
      if (json.token) onToken(json.token)
      if (json.done) final = { answer: json.answer, sources: json.sources }
    }
  }

  return final
}
