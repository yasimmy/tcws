import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ShieldCheck, Sparkles, Lock, Mail, UserRound, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const AuthPage = () => {
  const { isAuthenticated, login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to="/profile" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = mode === 'register'
      ? await register({ name, email, password })
      : await login(email, password)

    if (!result.ok) setError(result.error || 'Не удалось выполнить операцию.')
    setLoading(false)
  }

  return (
    <div className="auth-page" style={{ padding: '80px 32px', minHeight: '80vh' }}>
      <div className="auth-container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          position: 'relative',
          borderRadius: 24,
          border: '1px solid rgba(92, 124, 250, 0.25)',
          background: 'radial-gradient(circle at 20% 10%, rgba(92, 124, 250, 0.25), rgba(10, 10, 10, 1) 55%)',
          overflow: 'hidden',
          boxShadow: '0 18px 48px rgba(0, 0, 0, 0.45)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 85% 25%, rgba(34, 197, 94, 0.10), transparent 45%)',
            pointerEvents: 'none',
          }} />

          <div className="auth-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 24,
            padding: 'clamp(18px, 3vw, 28px)',
          }}>
            {/* Left */}
            <div className="auth-left" style={{ padding: '10px 10px 10px 14px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid rgba(148, 163, 184, 0.25)',
                background: 'rgba(15, 23, 42, 0.35)',
                color: '#cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 14,
              }}>
                <Sparkles size={14} />
                Профиль TubeCAD
              </div>

              <h1 style={{
                fontSize: 'clamp(34px, 5vw, 54px)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                marginBottom: 12,
              }}>
                {mode === 'register' ? 'Создайте аккаунт' : 'Войдите в аккаунт'}
              </h1>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: 'clamp(14px, 2vw, 16px)',
                lineHeight: 1.7,
                maxWidth: 520,
              }}>
                {mode === 'register'
                  ? 'Регистрация займёт минуту. После входа вы сможете управлять доступом и подпиской.'
                  : 'Откройте личный кабинет: профиль, статус доступа и управление подпиской.'}
              </p>

              <div style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                maxWidth: 560,
              }}>
                {[
                  { icon: ShieldCheck, title: 'Безопасный вход', desc: 'Токен хранится локально, API защищено.' },
                  { icon: UserRound, title: 'Профиль', desc: 'Вся информация по аккаунту в одном месте.' },
                  { icon: Crown, title: 'Управление подпиской', desc: 'Тариф, доступ и условия — в личном кабинете.' },
                ].map((b) => (
                  <div key={b.title} style={{
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    background: 'rgba(15, 23, 42, 0.35)',
                    borderRadius: 14,
                    padding: '12px 12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <b.icon size={16} color="#9ab0ff" />
                      <div style={{ fontWeight: 800 }}>{b.title}</div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="auth-right" style={{
              borderRadius: 18,
              border: '1px solid var(--border)',
              background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.92) 0%, rgba(10, 10, 10, 0.92) 100%)',
              padding: 22,
            }}>
              <div style={{
                display: 'inline-flex',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 4,
                marginBottom: 16,
                background: 'rgba(148, 163, 184, 0.08)',
              }}>
                <button
                  onClick={() => setMode('register')}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: mode === 'register' ? 'rgba(92, 124, 250, 0.25)' : 'transparent',
                    color: mode === 'register' ? '#dbe4ff' : 'var(--text-secondary)',
                    fontWeight: 700,
                  }}
                >
                  Регистрация
                </button>
                <button
                  onClick={() => setMode('login')}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: mode === 'login' ? 'rgba(92, 124, 250, 0.25)' : 'transparent',
                    color: mode === 'login' ? '#dbe4ff' : 'var(--text-secondary)',
                    fontWeight: 700,
                  }}
                >
                  Вход
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                {mode === 'register' && (
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Имя</span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      borderRadius: 12,
                      padding: '12px 12px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)',
                    }}>
                      <UserRound size={16} color="#9ab0ff" />
                      <input
                        placeholder="Например, Mona"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          color: 'var(--text-primary)',
                          border: 'none',
                          outline: 'none',
                          padding: 0,
                        }}
                      />
                    </div>
                  </label>
                )}

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Email</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderRadius: 12,
                    padding: '12px 12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                  }}>
                    <Mail size={16} color="#9ab0ff" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                      }}
                    />
                  </div>
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Пароль</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderRadius: 12,
                    padding: '12px 12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                  }}>
                    <Lock size={16} color="#9ab0ff" />
                    <input
                      type="password"
                      placeholder="Минимум 6 символов"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                      }}
                    />
                  </div>
                </label>

                {error && (
                  <div style={{
                    color: '#fda4af',
                    border: '1px solid rgba(251, 113, 133, 0.35)',
                    background: 'rgba(127, 29, 29, 0.25)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    fontSize: 14,
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 2,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 15,
                    boxShadow: '0 10px 26px rgba(92, 124, 250, 0.25)',
                  }}
                >
                  {loading ? 'Подождите...' : mode === 'register' ? 'Создать аккаунт' : 'Войти'}
                </button>
              </form>

              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-secondary)' }}>
                {mode === 'register' ? (
                  <>
                    Уже есть аккаунт?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      disabled={loading}
                      style={{ background: 'transparent', color: '#9ab0ff', fontWeight: 700 }}
                    >
                      Войти
                    </button>
                  </>
                ) : (
                  <>
                    Нет аккаунта?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      disabled={loading}
                      style={{ background: 'transparent', color: '#9ab0ff', fontWeight: 700 }}
                    >
                      Зарегистрироваться
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <style>{`
            @media (max-width: 920px) {
              .auth-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 768px) {
              .auth-page {
                padding: 64px 16px !important;
              }
              .auth-left {
                padding: 6px 6px 0 !important;
              }
              .auth-right {
                padding: 16px !important;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}
