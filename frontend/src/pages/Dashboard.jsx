import { useEffect, useState } from 'react'
import { authApi, tokens } from '../lib/api.js'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    authApi
      .me()
      .then((r) => {
        if (!mounted) return
        setUser(r.data?.data)
      })
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {}
    tokens.clear()
    navigate('/login')
  }

  if (loading) return <div>Loading…</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <button onClick={logout} className="px-3 py-1 rounded bg-gray-800 text-white">
          Logout
        </button>
      </div>
      <div className="bg-white rounded shadow p-4">
        <div className="text-sm">User ID: {user?._id}</div>
        <div className="text-sm">Name: {user?.fullName}</div>
        <div className="text-sm">Email: {user?.email}</div>
        <div className="text-sm">Role: {user?.role}</div>
        <div className="text-sm">Verified: {String(user?.isVerified)}</div>
      </div>
    </div>
  )
}
