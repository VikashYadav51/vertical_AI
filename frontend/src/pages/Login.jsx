import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, tokens } from '../lib/api.js'

export default function Login() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login({ identifier: loginId, email: loginId, fullName: loginId, password })
      const data = res.data?.data
      if (data?.accessToken) tokens.setAccess(data.accessToken)
      if (data?.refreshToken) tokens.setRefresh(data.refreshToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const google = () => {
    const base = import.meta.env.VITE_API_URL || '/api/v1'
    window.location.href = `${base.replace('/api/v1', '')}/api/v1/auth/google`
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error ? <div className="text-red-600 text-sm mb-3">{error}</div> : null}
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email or Full Name"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Processing…' : 'Login'}
        </button>
      </form>
      <div className="mt-4">
        <button onClick={google} className="w-full bg-red-600 text-white rounded py-2">
          Login with Google
        </button>
      </div>
    </div>
  )
}
