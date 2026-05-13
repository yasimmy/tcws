import { Download, CheckCircle, Monitor, Apple, Clock } from 'lucide-react'

const DOWNLOAD_URL = 'https://github.com/yasimmy/tubecad/releases/download/latest/TubeCAD_0.1.3_x64-setup.exe'

export const DownloadPage = () => {
  const handleDownload = async () => {
    // Trigger actual download
    const link = document.createElement('a')
    link.href = DOWNLOAD_URL
    link.download = 'TubeCAD_0.1.3_x64-setup.exe'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ minHeight: '80vh', padding: '80px 32px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 900,
          textAlign: 'center',
          marginBottom: 24,
          letterSpacing: '-0.03em',
        }}>
          СКАЧАТЬ TUBECAD
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2vw, 18px)',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginBottom: 64,
          maxWidth: 600,
          margin: '0 auto 64px',
          padding: '0 16px',
        }}>
          Выберите версию для вашей операционной системы
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          marginBottom: 64,
        }}>
          {[
            { icon: Monitor, name: 'Windows', version: '1.0.0', size: '76 MB', color: '#5c7cfa', available: true },
            { icon: Apple, name: 'macOS', version: 'Скоро', size: '~118 MB', color: '#748ffc', available: false },
            { icon: Monitor, name: 'Linux', version: 'Скоро', size: '~112 MB', color: '#91a7ff', available: false },
          ].map((platform) => (
            <div
              key={platform.name}
              style={{
                padding: 32,
                background: 'rgba(20, 25, 35, 0.8)',
                border: `1px solid ${platform.available ? 'rgba(92, 124, 250, 0.3)' : 'rgba(42, 42, 42, 0.5)'}`,
                borderRadius: 16,
                transition: 'all 0.3s',
                position: 'relative',
                opacity: platform.available ? 1 : 0.7,
              }}
              onMouseEnter={(e) => {
                if (platform.available) {
                  e.currentTarget.style.borderColor = platform.color
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = `0 8px 24px ${platform.color}40`
                }
              }}
              onMouseLeave={(e) => {
                if (platform.available) {
                  e.currentTarget.style.borderColor = 'rgba(92, 124, 250, 0.3)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {!platform.available && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                }}>
                  <Clock size={10} />
                  Скоро
                </div>
              )}
              <div style={{
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <platform.icon size={48} color={platform.color} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{platform.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                {platform.available ? `Версия ${platform.version}` : platform.version} • {platform.size}
              </p>
              <button
                disabled={!platform.available}
                onClick={platform.available ? handleDownload : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '14px 24px',
                  background: platform.available 
                    ? `linear-gradient(135deg, ${platform.color} 0%, ${platform.color}dd 100%)`
                    : 'var(--bg-secondary)',
                  border: platform.available ? 'none' : '1px solid var(--border)',
                  borderRadius: 10,
                  color: platform.available ? '#fff' : 'var(--text-muted)',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: platform.available ? 'pointer' : 'not-allowed',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (platform.available) {
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (platform.available) {
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                {platform.available ? (
                  <>
                    <Download size={18} />
                    Скачать
                  </>
                ) : (
                  <>
                    <Clock size={18} />
                    В разработке
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div style={{
          padding: 'clamp(24px, 5vw, 40px)',
          background: 'var(--bg-secondary)',
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 24px)', fontWeight: 700, marginBottom: 24 }}>Системные требования</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {[
              { label: 'ОС', value: 'Windows 10+, macOS 11+, Linux' },
              { label: 'Процессор', value: 'Intel Core i5 или аналог' },
              { label: 'RAM', value: '8 GB (рекомендуется 16 GB)' },
              { label: 'Видеокарта', value: 'OpenGL 3.3+' },
              { label: 'Место на диске', value: '500 MB' },
              { label: 'Дисплей', value: '1920x1080 или выше' },
            ].map((req) => (
              <div key={req.label} style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                <CheckCircle size={20} color="#52c07a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{req.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{req.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
