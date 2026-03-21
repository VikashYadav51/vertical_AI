import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const storage = {
  getAccess() {
    return localStorage.getItem('accessToken') || ''
  },
  setAccess(t) {
    if (t) localStorage.setItem('accessToken', t)
    else localStorage.removeItem('accessToken')
  },
  getRefresh() {
    return localStorage.getItem('refreshToken') || ''
  },
  setRefresh(t) {
    if (t) localStorage.setItem('refreshToken', t)
    else localStorage.removeItem('refreshToken')
  },
  clear() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = storage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing = null

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true
      if (!refreshing) {
        const refreshToken = storage.getRefresh()
        refreshing = axios
          .post(`${API_BASE}/users/refreshToken`, { refreshToken }, { withCredentials: true })
          .then((res) => {
            const { accessToken, refreshToken: newRefresh } = res.data?.data || {}
            if (accessToken) storage.setAccess(accessToken)
            if (newRefresh) storage.setRefresh(newRefresh)
            return accessToken
          })
          .finally(() => {
            refreshing = null
          })
      }
      const newToken = await refreshing
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  async register(body) {
    return api.post('/users/register', body)
  },
  async login(body) {
    return api.post('/users/login', body)
  },
  async logout() {
    return api.post('/users/logout')
  },
  async me() {
    return api.get('/users/me')
  },
  async adminUsers() {
    return api.get('/users/admin/users')
  },
  async verifyEmail(token) {
    return api.get(`/users/verify-email?token=${encodeURIComponent(token)}`)
  },
}

export const tokens = storage
export default api
