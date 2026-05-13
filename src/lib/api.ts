const API_BASE = import.meta.env.VITE_API_BASE || 'https://tcws.onrender.com'

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
  // Do not override explicit Authorization (e.g. admin token)
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

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
  getPublicSettings: () => request('/api/public/settings'),
  appAuthStart: (clientId: string) =>
    request('/api/app-auth/start', {
      method: 'POST',
      body: JSON.stringify({ clientId }),
    }),
  appAuthStatus: (requestId: string) =>
    request(`/api/app-auth/status/${requestId}`),
  appAuthComplete: (requestId: string) =>
    request('/api/app-auth/complete', {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    }),
  appAccessCheck: (body: {
    fingerprintHash: string
    machineGuidHash?: string
    boardHash?: string
    diskHash?: string
    cpuHash?: string
  }) =>
    request('/api/app-access/check', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  activateTrial: () =>
    request('/api/subscription/trial/activate', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  adminLogin: (username: string, password: string) =>
    request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  adminMe: (adminToken: string) =>
    request('/api/admin/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    }),
  adminChangePassword: (adminToken: string, newPassword: string) =>
    request('/api/admin/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ newPassword }),
    }),
  adminGetUsers: (adminToken: string) =>
    request('/api/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    }),
  adminUpdateUserSubscription: (
    adminToken: string,
    userId: number,
    body: { plan?: string; status?: string; expiresAt?: string | null },
  ) =>
    request(`/api/admin/users/${userId}/subscription`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(body),
    }),
  adminSubscriptionAction: (
    adminToken: string,
    userId: number,
    body: { action: 'grant' | 'revoke'; plan?: string; days?: number; reason: string; extendExisting?: boolean },
  ) =>
    request(`/api/admin/users/${userId}/subscription-action`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(body),
    }),
  adminGetSettings: (adminToken: string) =>
    request('/api/admin/settings', {
      headers: { Authorization: `Bearer ${adminToken}` },
    }),
  adminSetSettings: (adminToken: string, body: { paymentsEnabled: boolean; priceUah: number; prices: { starter: number; pro: number; team: number } }) =>
    request('/api/admin/settings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(body),
    }),
}
