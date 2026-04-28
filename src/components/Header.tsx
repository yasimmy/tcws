import { Link, useLocation } from 'react-router-dom'
import { Box, Download, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'

export const Header = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isActive = (path: string) => location.pathname === path

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(42, 42, 42, 0.5)',
    }}>
      <nav style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '12px clamp(16px, 4vw, 32px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Logo + Badge */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 'clamp(18px, 3vw, 20px)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          flexShrink: 0,
        }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Box size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            TubeCAD
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              color: '#4ade80',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              <Sparkles size={12} />
              Временно бесплатно
            </span>
          </span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 32,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }} className="desktop-nav">
          {[
            { path: '/', label: 'Главная' },
            { path: '/features', label: 'Возможности' },
            { path: '/docs', label: 'Документация' },
            { path: '/pricing', label: 'Цены' },
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: isActive(path) ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'color 0.2s',
                position: 'relative',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => !isActive(path) && (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {label}
              {isActive(path) && (
                <div style={{
                  position: 'absolute',
                  bottom: -16,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, #5c7cfa 0%, #748ffc 100%)',
                  borderRadius: 2,
                }} />
              )}
            </Link>
          ))}
        </div>

        {/* Download Button */}
        <Link
          to="/download"
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 2px 8px rgba(92, 124, 250, 0.3)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(92, 124, 250, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(92, 124, 250, 0.3)'
          }}
        >
          <Download size={16} />
          Скачать
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            padding: 8,
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{
          padding: '16px clamp(16px, 4vw, 32px) 24px',
          background: 'rgba(0, 0, 0, 0.95)',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { path: '/', label: 'Главная' },
              { path: '/features', label: 'Возможности' },
              { path: '/docs', label: 'Документация' },
              { path: '/pricing', label: 'Цены' },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: isActive(path) ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '10px 14px',
                  background: isActive(path) ? 'rgba(92, 124, 250, 0.1)' : 'transparent',
                  borderRadius: 8,
                  border: isActive(path) ? '1px solid rgba(92, 124, 250, 0.3)' : '1px solid transparent',
                }}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/download"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                marginTop: 8,
              }}
            >
              <Download size={18} />
              Скачать
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  )
}
