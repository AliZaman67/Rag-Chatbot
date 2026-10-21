import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function ChatWindow({ title, messages, loading, sending, onSend }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    onSend(text)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <main className="chat-main">
      <div className="chat-header">
        <h2>{title}</h2>
        <div className={`orb small ${sending ? 'thinking' : ''}`} />
      </div>

      <div className="messages">
        {!loading && messages.length === 0 && (
          <div className="empty-state">
            <div className="orb" />
            <h2>Ask Nexus anything</h2>
            <p>Answers are grounded in your connected documents, and streamed straight from Groq.</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`msg-row ${m.role}`}>
            <div className={`msg-avatar ${m.role}`}>{m.role === 'user' ? 'You' : 'N'}</div>
            <div className="msg-bubble">
              <ReactMarkdown>{m.content || '…'}</ReactMarkdown>
              {m.sources?.length > 0 && (
                <div className="sources-row">
                  {m.sources.map((s, i) => (
                    <span className="source-chip" key={s.id || i}>[{i + 1}] similarity {s.similarity?.toFixed(2)}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <form className="composer-inner" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Message Nexus…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" type="submit" disabled={!input.trim() || sending}>
            ↑
          </button>
        </form>
        <div className="hint">Nexus can be wrong. Verify important answers.</div>
      </div>
    </main>
  )
}
