const API_BASE = import.meta.env.VITE_API_BASE || ''

const getClientId = () => {
  const key = 'tubecad_client_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

const request = async (path: string, init: RequestInit = {}) => {
  const token = localStorage.getItem('tubecad_token')
  const headers = new Headers(init.headers || {})
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
  headers.set('x-client-id', getClientId())
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.error || 'Server error')
  }
  return data
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request('/api/auth/me'),
  getDownloadCount: () => request('/api/stats/downloads'),
  incrementDownload: () =>
    request('/api/stats/download', {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  linkTelegram: (payload: Record<string, string | number>) =>
    request('/api/telegram/link', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
