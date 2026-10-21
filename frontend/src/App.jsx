import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ChatApp from './pages/ChatApp.jsx'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="auth-shell"><div className="orb thinking" /></div>
  if (!session) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="auth-shell"><div className="orb thinking" /></div>
  if (session) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><ChatApp /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
