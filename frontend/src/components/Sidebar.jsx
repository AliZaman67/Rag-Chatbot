import { useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'

function initials(nameOrEmail) {
  if (!nameOrEmail) return '?'
  const parts = nameOrEmail.split(/[\s@]/).filter(Boolean)
  return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase()
}

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onOpenProfile }) {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const displayName = user?.user_metadata?.full_name || user?.email

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="orb small" />
        <h1>Nexus</h1>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        + New chat
      </button>

      <div className="chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-list-item ${chat.id === activeChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <span className="title">{chat.title || 'New chat'}</span>
            <button
              className="del-btn"
              onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id) }}
              title="Delete chat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        {menuOpen && (
          <div className="profile-menu">
            <button onClick={() => { setMenuOpen(false); onOpenProfile() }}>👤 Profile</button>
            <button className="danger" onClick={signOut}>⎋ Log out</button>
          </div>
        )}
        <button className="profile-row" onClick={() => setMenuOpen((v) => !v)}>
          <div className="avatar">{initials(displayName)}</div>
          <div className="profile-info">
            <div className="name">{displayName}</div>
            <div className="email">{user?.email}</div>
          </div>
        </button>
      </div>
    </aside>
  )
}
