const MODEL = 'llama-3.3-70b-versatile'

// Streams raw SSE lines from Groq straight through to res (an Express response).
// res must already have SSE headers set by the caller.
export async function streamGroqToResponse(messages, res) {
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.3, stream: true })
  })

  if (!groqRes.ok || !groqRes.body) {
    throw new Error(`Groq request failed: ${await groqRes.text()}`)
  }

  const reader = groqRes.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

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
      if (payload === '[DONE]') continue
      try {
        const json = JSON.parse(payload)
        const token = json.choices?.[0]?.delta?.content
        if (token) {
          full += token
          res.write(`data: ${JSON.stringify({ token })}\n\n`)
        }
      } catch {
        // partial chunk, skip
      }
    }
  }

  return full
}
