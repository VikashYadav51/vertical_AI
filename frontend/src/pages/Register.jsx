import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api.js'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await authApi.register({ email, password, fullName })
      setMessage('Registered successfully. Check your email for verification.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {error ? <div className="text-red-600 text-sm mb-3">{error}</div> : null}
      {message ? <div className="text-green-600 text-sm mb-3">{message}</div> : null}
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Processing…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
