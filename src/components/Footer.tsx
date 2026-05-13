import { Box, Github, Twitter, Mail, Sparkles } from 'lucide-react'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{
      background: 'linear-gradient(180deg, var(--bg-secondary) 0%, rgba(10, 10, 15, 0.95) 100%)',
      borderTop: '1px solid var(--border)',
      padding: '80px 32px 32px',
      position: 'relative',
    }}>
      {/* Decorative gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60%',
        height: 1,
        background: 'linear-gradient(90deg, transparent 0%, rgba(92, 124, 250, 0.5) 50%, transparent 100%)',
      }} />

      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 48,
        marginBottom: 48,
      }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 12,
          }}>
            <div style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(92, 124, 250, 0.3)',
            }}>
              <Box size={20} color="#fff" strokeWidth={2.5} />
            </div>
            TubeCAD
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 6,
            fontSize: 10,
            fontWeight: 700,
            color: '#4ade80',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 16,
          }}>
            <Sparkles size={10} />
            Временно бесплатно
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
            Профессиональное CAD решение для проектирования трубных конструкций с поддержкой IGES и 3D визуализации.
          </p>
        </div>

        <div>
          <h3 style={{ 
            fontSize: 13, 
            fontWeight: 700, 
            marginBottom: 20, 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
          }}>
            Продукт
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Возможности', href: '/features', available: true },
              { label: 'Цены', href: '/pricing', available: true },
              { label: 'Обновления', href: '#', available: false },
              { label: 'Roadmap', href: '#', available: false },
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: 14, 
                  transition: 'all 0.2s',
                  position: 'relative',
                  paddingLeft: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  pointerEvents: item.available ? 'auto' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (item.available) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.paddingLeft = '16px'
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.available) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.paddingLeft = '12px'
                  }
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: 4,
                  background: 'var(--accent)',
                  borderRadius: '50%',
                }} />
                {item.label}
                {!item.available && (
                  <span style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    background: 'rgba(251, 191, 36, 0.15)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: 4,
                    color: '#fbbf24',
                    fontWeight: 600,
                  }}>
                    Скоро
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ 
            fontSize: 13, 
            fontWeight: 700, 
            marginBottom: 20, 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
          }}>
            Ресурсы
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Документация', href: '/docs', available: true },
              { label: 'API Reference', href: '#', available: false },
              { label: 'Примеры', href: '#', available: false },
              { label: 'Сообщество', href: '#', available: false },
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: 14, 
                  transition: 'all 0.2s',
                  position: 'relative',
                  paddingLeft: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  pointerEvents: item.available ? 'auto' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (item.available) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.paddingLeft = '16px'
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.available) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.paddingLeft = '12px'
                  }
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: 4,
                  background: 'var(--accent)',
                  borderRadius: '50%',
                }} />
                {item.label}
                {!item.available && (
                  <span style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    background: 'rgba(251, 191, 36, 0.15)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: 4,
                    color: '#fbbf24',
                    fontWeight: 600,
                  }}>
                    Скоро
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ 
            fontSize: 13, 
            fontWeight: 700, 
            marginBottom: 20, 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em',
            color: 'var(--text-primary)',
          }}>
            Связь
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { icon: Github, href: 'https://github.com/yasimmy', label: 'GitHub' },
              { icon: Twitter, href: '#', label: 'Twitter' },
              { icon: Mail, href: 'mailto:support@tubecad.com', label: 'Email' },
            ].map(({ icon: Icon, href, label }, i) => (
              <a
                key={i}
                href={href}
                title={label}
                style={{
                  width: 44,
                  height: 44,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(92, 124, 250, 0.15) 0%, rgba(76, 110, 245, 0.15) 100%)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(92, 124, 250, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-card)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        paddingTop: 32,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <a 
          href="/admin" 
          style={{ 
            color: 'var(--text-muted)', 
            fontSize: 13,
            textDecoration: 'none',
            transition: 'color 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          © {currentYear} TubeCAD. Все права защищены.
        </a>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {['Политика конфиденциальности', 'Условия использования', 'Лицензия'].map((item) => (
            <a key={item} href="#" style={{ color: 'var(--text-muted)', fontSize: 13, transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
