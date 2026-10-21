import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { listChats, createChat, deleteChat, listMessages, addMessage } from '../lib/chats.js'
import { askRag } from '../lib/rag.js'
import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import ProfileModal from '../components/ProfileModal.jsx'

export default function ChatApp() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const refreshChats = useCallback(async () => {
    const data = await listChats(user.id)
    setChats(data)
    return data
  }, [user.id])

  useEffect(() => {
    refreshChats().then((data) => {
      if (data.length) setActiveChatId(data[0].id)
    })
  }, [refreshChats])

  useEffect(() => {
    if (!activeChatId) { setMessages([]); return }
    setLoadingMsgs(true)
    listMessages(activeChatId).then((data) => {
      setMessages(data)
      setLoadingMsgs(false)
    })
  }, [activeChatId])

  async function handleNewChat() {
    const chat = await createChat(user.id)
    setChats((prev) => [chat, ...prev])
    setActiveChatId(chat.id)
    setMessages([])
  }

  async function handleDeleteChat(id) {
    await deleteChat(id)
    setChats((prev) => prev.filter((c) => c.id !== id))
    if (activeChatId === id) {
      const remaining = chats.filter((c) => c.id !== id)
      setActiveChatId(remaining[0]?.id ?? null)
    }
  }

  async function handleSend(text) {
    let chatId = activeChatId
    if (!chatId) {
      const chat = await createChat(user.id, text.slice(0, 48))
      setChats((prev) => [chat, ...prev])
      chatId = chat.id
      setActiveChatId(chatId)
    }

    const userMsg = { id: `tmp-${Date.now()}`, role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    await addMessage(chatId, 'user', text)

    setSending(true)
    const assistantId = `tmp-a-${Date.now()}`
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    const history = messages.map((m) => ({ role: m.role, content: m.content }))

    try {
      const { answer, sources } = await askRag({
        question: text,
        history,
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m))
          )
        }
      })
      await addMessage(chatId, 'assistant', answer)
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: answer, sources } : m))
      )
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: `Error: ${err.message}` } : m
        )
      )
    } finally {
      setSending(false)
    }
  }

  const activeChat = chats.find((c) => c.id === activeChatId)

  return (
    <div className="app-shell">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onOpenProfile={() => setShowProfile(true)}
      />
      <ChatWindow
        title={activeChat?.title || 'New chat'}
        messages={messages}
        loading={loadingMsgs}
        sending={sending}
        onSend={handleSend}
      />
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} totalChats={chats.length} />}
    </div>
  )
}
