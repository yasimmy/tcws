import { Link, Navigate } from 'react-router-dom'
import { LogOut, ShieldCheck, BadgeCheck, Crown, ArrowRight, Mail, Calendar, Fingerprint, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const formatDate = (iso: string | undefined) => {
  if (!iso) return '—'
  const date = new Date(iso)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const BootstrapPersonIcon = ({ size = 30 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  </svg>
)

export const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated || !user) return <Navigate to="/auth" replace />

  return (
    <div>
      {/* Cover + Profile Header */}
      <section className="profile-cover" style={{
        padding: '70px 32px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(92, 124, 250, 0.12) 0%, transparent 55%)',
          animation: 'float 8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        <div className="profile-container" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="profile-coverCard" style={{
            height: 190,
            borderRadius: 22,
            background: 'linear-gradient(135deg, rgba(92, 124, 250, 0.22) 0%, rgba(76, 110, 245, 0.10) 35%, rgba(0,0,0,0) 100%)',
            border: '1px solid rgba(92, 124, 250, 0.22)',
            boxShadow: '0 18px 48px rgba(0, 0, 0, 0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              inset: -120,
              background: 'radial-gradient(circle at 15% 40%, rgba(92, 124, 250, 0.35) 0%, transparent 60%), radial-gradient(circle at 85% 35%, rgba(34, 197, 94, 0.10) 0%, transparent 55%)',
              pointerEvents: 'none',
            }} />
          </div>

          <div className="profile-headerRow" style={{
            display: 'flex',
            gap: 18,
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            marginTop: 18,
            padding: '0 18px 8px',
          }}>
            <div className="profile-identity" style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="profile-avatar" style={{
                width: 88,
                height: 88,
                borderRadius: 22,
                background: 'linear-gradient(135deg, rgba(92, 124, 250, 0.9) 0%, rgba(76, 110, 245, 0.85) 100%)',
                boxShadow: '0 12px 32px rgba(92, 124, 250, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <span style={{ color: '#fff', opacity: 0.95 }}>
                  <BootstrapPersonIcon size={34} />
                </span>
              </div>

              <div className="profile-nameBlock" style={{ paddingBottom: 6 }}>
                <div className="profile-name" style={{
                  fontSize: 'clamp(34px, 5vw, 54px)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                }}>
                  {user.name}
                </div>
                <div className="profile-meta" style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginTop: 10,
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={14} />
                    {user.email}
                  </span>
                  <span style={{ opacity: 0.7 }}>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={14} />
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingBottom: 6 }}>
              <Link
                to="/pricing"
                className="profile-primaryBtn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 22px',
                  background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  transition: 'all 0.3s',
                  boxShadow: '0 8px 24px rgba(92, 124, 250, 0.35)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(92, 124, 250, 0.45)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(92, 124, 250, 0.35)'
                }}
              >
                <Crown size={18} />
                Тарифы
                <ArrowRight size={18} />
              </Link>

              <button
                onClick={logout}
                className="profile-ghostBtn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 22px',
                  background: 'transparent',
                  border: '2px solid rgba(248, 113, 113, 0.35)',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#fecaca',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.6)'
                  e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.35)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <LogOut size={18} />
                Выйти
              </button>
            </div>
          </div>

          <div className="profile-statsGrid" style={{
            marginTop: 22,
            padding: '0 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
            marginBottom: 18,
          }}>
            {[
              {
                title: 'Статус подписки',
                value: 'Активен (бета)',
                hint: 'Сейчас бесплатно. После запуска тарифов вход будет по подписке.',
                icon: BadgeCheck,
                color: '#52c07a',
              },
              {
                title: 'Безопасность',
                value: 'JWT-сессия',
                hint: 'Токен хранится локально, API защищено.',
                icon: Fingerprint,
                color: '#93c5fd',
              },
              {
                title: 'Настройки',
                value: 'Скоро',
                hint: 'Персональные настройки будут добавлены позже.',
                icon: Settings,
                color: '#a5b4fc',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="profile-statCard"
                style={{
                  padding: 18,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    background: 'rgba(92, 124, 250, 0.12)',
                    border: '1px solid rgba(92, 124, 250, 0.25)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <card.icon size={22} color={card.color} strokeWidth={2} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>
                      {card.title}
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>
                      {card.value}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}>
                      {card.hint}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .profile-cover {
              padding: 64px 16px 0 !important;
            }
            .profile-coverCard {
              height: 150px !important;
              border-radius: 18px !important;
            }
            .profile-headerRow {
              padding: 0 6px 8px !important;
              margin-top: 14px !important;
              gap: 14px !important;
            }
            .profile-avatar {
              width: 72px !important;
              height: 72px !important;
              border-radius: 18px !important;
            }
            .profile-nameBlock {
              padding-bottom: 0 !important;
            }
            .profile-actions {
              width: 100%;
              padding-bottom: 0 !important;
            }
            .profile-primaryBtn,
            .profile-ghostBtn {
              width: 100%;
              justify-content: center;
            }
            .profile-statsGrid {
              padding: 0 6px !important;
              margin-top: 16px !important;
              margin-bottom: 24px !important;
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 420px) {
            .profile-meta {
              gap: 8px !important;
              font-size: 13px !important;
            }
          }
        `}</style>
      </section>

      <section style={{
        padding: '92px 32px 120px',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: 44,
            letterSpacing: '-0.02em',
          }}>
            АККАУНТ
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            <div style={{
              padding: 32,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
            }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, rgba(92, 124, 250, 0.2) 0%, rgba(76, 110, 245, 0.2) 100%)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <ShieldCheck size={28} color="#5c7cfa" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
                Управление подпиской
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
                Сейчас доступ работает в бесплатном режиме. Когда тарифы будут включены — управление подпиской появится здесь.
              </p>
              <Link
                to="/pricing"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(92, 124, 250, 0.35)',
                  background: 'rgba(92, 124, 250, 0.12)',
                  color: '#c7d2fe',
                  fontWeight: 800,
                }}
              >
                Перейти к тарифам
                <ArrowRight size={18} />
              </Link>
            </div>

            <div style={{
              padding: 32,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
            }}>
              <div style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, rgba(82, 192, 122, 0.2) 0%, rgba(34, 197, 94, 0.15) 100%)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <BadgeCheck size={28} color="#52c07a" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
                Статус доступа
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Активен (бета). Сейчас доступ бесплатный. После запуска тарифов вход будет только по подписке.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
