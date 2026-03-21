import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authApi } from '../lib/api.js'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [state, setState] = useState({ loading: true, ok: false, message: '' })

  useEffect(() => {
    let mounted = true
    if (!token) {
      setState({ loading: false, ok: false, message: 'Missing token' })
      return
    }
    authApi
      .verifyEmail(token)
      .then(() => {
        if (!mounted) return
        setState({ loading: false, ok: true, message: 'Email verified' })
      })
      .catch((e) => {
        setState({
          loading: false,
          ok: false,
          message: e?.response?.data?.message || 'Verification failed',
        })
      })
    return () => {
      mounted = false
    }
  }, [token])

  if (state.loading) return <div>Verifying…</div>

  return (
    <div className="max-w-md mx-auto bg-white rounded shadow p-6 text-center">
      <div className={state.ok ? 'text-green-600' : 'text-red-600'}>{state.message}</div>
    </div>
  )
}
