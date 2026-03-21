import { useEffect, useState } from 'react'
import { authApi } from '../lib/api.js'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    authApi
      .adminUsers()
      .then((r) => {
        if (!mounted) return
        setUsers(r.data?.data || [])
      })
      .catch((e) => {
        setError(e?.response?.data?.message || 'Failed to load users')
      })
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div>Loading…</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Admin Users</h2>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Verified</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="px-3 py-2">{u.fullName}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">{String(u.isVerified)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
