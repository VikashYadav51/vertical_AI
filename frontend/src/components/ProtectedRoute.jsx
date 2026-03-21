import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { authApi, tokens } from '../lib/api.js'

export default function ProtectedRoute({ children, requireRole }) {
  const [state, setState] = useState({ loading: true, ok: false, user: null })

  useEffect(() => {
    let mounted = true
    authApi
      .me()
      .then((res) => {
        const user = res.data?.data
        if (!mounted) return
        if (requireRole && user?.role !== requireRole) {
          setState({ loading: false, ok: false, user: null })
        } else {
          setState({ loading: false, ok: true, user })
        }
      })
      .catch(() => {
        if (mounted) setState({ loading: false, ok: false, user: null })
      })
    return () => {
      mounted = false
    }
  }, [requireRole])

  if (state.loading) {
    return <div className="text-center py-10">Loading…</div>
  }
  if (!state.ok) {
    tokens.clear()
    return <Navigate to="/login" replace />
  }
  return children
}
