import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { Shield, Users, Settings2, Save, KeyRound } from 'lucide-react'

type AdminUserRow = {
  id: number
  name: string
  email: string
  subscription_plan: string | null
  subscription_status: string | null
  subscription_expires_at: string | null
  created_at: string
}

const ADMIN_TOKEN_KEY = 'tubecad_admin_token'

export const AdminPage = () => {
  const [token, setToken] = useState<string>(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [paymentsEnabled, setPaymentsEnabled] = useState(false)
  const [priceUah, setPriceUah] = useState(0)
  const [savingSettings, setSavingSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users')

  const isAuthed = !!token

  const refresh = async () => {
    if (!token) return
    const me = await api.adminMe(token)
    setMustChangePassword(!!me.mustChangePassword)
    if (me.mustChangePassword) return
    const settings = await api.adminGetSettings(token)
    setPaymentsEnabled(!!settings.paymentsEnabled)
    setPriceUah(Number(settings.priceUah || 0))
    const u = await api.adminGetUsers(token)
    setUsers(u.users || [])
  }

  useEffect(() => {
    if (!token) return
    refresh().catch(() => {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      setToken('')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.adminLogin(username, password)
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      setToken(data.token)
      setMustChangePassword(!!data.mustChangePassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token) return
    setLoading(true)
    try {
      await api.adminChangePassword(token, newPassword)
      setMustChangePassword(false)
      setNewPassword('')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сменить пароль')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!token) return
    setSavingSettings(true)
    setError('')
    try {
      const data = await api.adminSetSettings(token, { paymentsEnabled, priceUah })
      setPaymentsEnabled(!!data.paymentsEnabled)
      setPriceUah(Number(data.priceUah || 0))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить настройки')
    } finally {
      setSavingSettings(false)
    }
  }

  const updateUser = async (u: AdminUserRow, patch: { plan?: string; status?: string; expiresAt?: string | null }) => {
    if (!token) return
    setError('')
    try {
      const data = await api.adminUpdateUserSubscription(token, u.id, patch)
      const updated = data.user
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить пользователя')
    }
  }

  const header = useMemo(() => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Shield size={18} color="#9ab0ff" />
        <div style={{ fontSize: 18, fontWeight: 900 }}>Админ-панель</div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: activeTab === 'users' ? 'rgba(92, 124, 250, 0.18)' : 'transparent',
            color: activeTab === 'users' ? '#dbe4ff' : 'var(--text-secondary)',
            fontWeight: 800,
          }}
        >
          <Users size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
          Пользователи
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: activeTab === 'settings' ? 'rgba(92, 124, 250, 0.18)' : 'transparent',
            color: activeTab === 'settings' ? '#dbe4ff' : 'var(--text-secondary)',
            fontWeight: 800,
          }}
        >
          <Settings2 size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
          Настройки
        </button>
      </div>
    </div>
  ), [activeTab])

  if (!isAuthed) {
    return (
      <div style={{ padding: '80px 32px', minHeight: '80vh' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 10 }}>Вход в админку</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 18 }}>
            Введите админские данные. При первом входе система попросит сменить пароль.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 10 }}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Логин"
              style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" type="password"
              style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            {error && <div style={{ color: '#fda4af', fontSize: 14 }}>{error}</div>}
            <button disabled={loading} type="submit" style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
              color: '#fff',
              fontWeight: 900,
            }}>
              {loading ? '...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (mustChangePassword) {
    return (
      <div style={{ padding: '80px 32px', minHeight: '80vh' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 10 }}>Смена пароля</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 18 }}>
            Первый вход в админку: необходимо задать новый пароль.
          </p>
          <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <KeyRound size={18} color="#9ab0ff" />
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Новый пароль (мин. 8)" type="password"
                style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            {error && <div style={{ color: '#fda4af', fontSize: 14 }}>{error}</div>}
            <button disabled={loading} type="submit" style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
              color: '#fff',
              fontWeight: 900,
            }}>
              {loading ? '...' : 'Сохранить пароль'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '80px 32px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {header}

        {error && <div style={{ color: '#fda4af', fontSize: 14, marginBottom: 10 }}>{error}</div>}

        {activeTab === 'settings' && (
          <section style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 18, background: 'var(--bg-card)' }}>
            <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="checkbox" checked={paymentsEnabled} onChange={(e) => setPaymentsEnabled(e.target.checked)} />
                <span style={{ fontWeight: 800 }}>Оплата включена</span>
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Цена (₴)</span>
                <input type="number" value={priceUah} onChange={(e) => setPriceUah(Number(e.target.value))}
                  style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </label>
              <button onClick={saveSettings} disabled={savingSettings} style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(92, 124, 250, 0.16)',
                border: '1px solid rgba(92, 124, 250, 0.35)',
                color: '#dbe4ff',
                fontWeight: 900,
              }}>
                <Save size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />
                {savingSettings ? 'Сохраняю...' : 'Сохранить настройки'}
              </button>
            </div>
          </section>
        )}

        {activeTab === 'users' && (
          <section style={{ border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 14px' }}>ID</th>
                    <th style={{ padding: '12px 14px' }}>Пользователь</th>
                    <th style={{ padding: '12px 14px' }}>Email</th>
                    <th style={{ padding: '12px 14px' }}>План</th>
                    <th style={{ padding: '12px 14px' }}>Статус</th>
                    <th style={{ padding: '12px 14px' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.10)' }}>
                      <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{u.id}</td>
                      <td style={{ padding: '12px 14px', color: '#e2e8f0', fontWeight: 700 }}>{u.name}</td>
                      <td style={{ padding: '12px 14px', color: '#cbd5e1' }}>{u.email}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <select
                          value={u.subscription_plan || 'starter'}
                          onChange={(e) => updateUser(u, { plan: e.target.value })}
                          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                          <option value="starter">starter</option>
                          <option value="pro">pro</option>
                          <option value="team">team</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <select
                          value={u.subscription_status || 'beta_free'}
                          onChange={(e) => updateUser(u, { status: e.target.value })}
                          style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                          <option value="beta_free">beta_free</option>
                          <option value="active">active</option>
                          <option value="cancelled">cancelled</option>
                          <option value="expired">expired</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => updateUser(u, { status: 'active' })}
                          style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(34, 197, 94, 0.14)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#bbf7d0', fontWeight: 800 }}
                        >
                          Выдать
                        </button>
                        <button
                          onClick={() => updateUser(u, { status: 'cancelled' })}
                          style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(248, 113, 113, 0.10)', border: '1px solid rgba(248, 113, 113, 0.22)', color: '#fecaca', fontWeight: 800 }}
                        >
                          Аннулировать
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

