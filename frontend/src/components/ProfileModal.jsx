import { useAuth } from '../lib/AuthContext.jsx'

function initials(nameOrEmail) {
  if (!nameOrEmail) return '?'
  const parts = nameOrEmail.split(/[\s@]/).filter(Boolean)
  return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '').toUpperCase()
}

export default function ProfileModal({ onClose, totalChats }) {
  const { user, signOut } = useAuth()
  const displayName = user?.user_metadata?.full_name || 'Unnamed user'
  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>Your profile</h3>
        <div className="modal-avatar-row">
          <div className="avatar">{initials(displayName)}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{displayName}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{user?.email}</div>
          </div>
        </div>

        <div className="stat-row"><span className="label">Member since</span><span>{joined}</span></div>
        <div className="stat-row"><span className="label">Total chats</span><span>{totalChats}</span></div>
        <div className="stat-row"><span className="label">User ID</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{user?.id?.slice(0, 8)}…</span></div>

        <button className="btn-primary" style={{ marginTop: 20, background: 'var(--surface-2)', color: 'var(--danger)' }} onClick={signOut}>
          Log out
        </button>
      </div>
    </div>
  )
}
