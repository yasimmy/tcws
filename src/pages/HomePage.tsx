import { Download, Box, Zap, Layers, Code, Shield, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export const HomePage = () => {
  const [downloadCount, setDownloadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    api.getDownloadCount()
      .then((data) => {
        if (mounted) setDownloadCount(data.count || 0)
      })
      .catch(() => {})

    const refresh = () => {
      api.getDownloadCount().then((data) => setDownloadCount(data.count || 0)).catch(() => {})
    }
    window.addEventListener('downloadCountChanged', refresh as EventListener)
    return () => {
      mounted = false
      window.removeEventListener('downloadCountChanged', refresh as EventListener)
    }
  }, [])

  const formatNumber = (num: number) => {
    if (num === 0) return '0'
    
    const str = num.toString()
    const result: string[] = []
    
    for (let i = 0; i < str.length; i++) {
      result.push(str[i])
      const isLastDigit = i === str.length - 1
      const shouldAddSpace = !isLastDigit && (str.length - i - 1) % 3 === 0
      
      if (shouldAddSpace) {
        result.push(' ')
      }
    }
    
    return result.join('')
  }

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(92, 124, 250, 0.1) 0%, transparent 50%)',
          animation: 'float 8s ease-in-out infinite',
        }} />

        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 32px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 120px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            marginBottom: 24,
            lineHeight: 1,
          }} className="animate-fade-in">
            TUBECAD
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            maxWidth: 700,
            margin: '0 auto 48px',
            lineHeight: 1.6,
            letterSpacing: '0.02em',
          }} className="animate-slide-up">
            ПРОФЕССИОНАЛЬНОЕ CAD РЕШЕНИЕ ДЛЯ СОЕДИНЕНИЯ ТРУБНЫХ КОНСТРУКЦИЙ С ПОДДЕРЖКОЙ IGES И 3D ВИЗУАЛИЗАЦИИ
          </p>

          <div
            className="animate-slide-up"
            style={{
              display: 'inline-flex',
              margin: '0 auto 28px',
              padding: '10px 16px',
              borderRadius: 999,
              border: '1px solid rgba(148, 163, 184, 0.28)',
              background: 'rgba(15, 23, 42, 0.55)',
              boxShadow: '0 8px 28px rgba(0, 0, 0, 0.35)',
            }}
          >
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#cbd5e1',
            }}>
              {`${formatNumber(downloadCount)} пользователей установило TubeCAD`}
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }} className="animate-slide-up">
            <Link
              to="/download"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                transition: 'all 0.3s',
                boxShadow: '0 8px 24px rgba(92, 124, 250, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(92, 124, 250, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(92, 124, 250, 0.4)'
              }}
            >
              <Download size={20} />
              Скачать
            </Link>

            <a
              href="#features"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 32px',
                background: 'transparent',
                border: '2px solid var(--border)',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.background = 'rgba(92, 124, 250, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              Узнать больше
            </a>
          </div>


        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '120px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: 64,
            letterSpacing: '-0.02em',
          }}>
            ВОЗМОЖНОСТИ
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {[
              {
                icon: Box,
                title: '3D ВИЗУАЛИЗАЦИЯ',
                desc: 'Мощный 3D движок с поддержкой OpenCascade для реалистичного отображения трубных конструкций',
              },
              {
                icon: Layers,
                title: 'БУЛЕВЫ ОПЕРАЦИИ',
                desc: 'Вырезание, объединение и зеркалирование деталей с автоматическим расчетом пересечений',
              },
              {
                icon: Code,
                title: 'IGES ИМПОРТ/ЭКСПОРТ',
                desc: 'Полная поддержка формата IGES для обмена данными с другими CAD системами',
              },
              {
                icon: Zap,
                title: 'БЫСТРАЯ РАБОТА',
                desc: 'Оптимизированный движок на C++ с использованием Tauri для максимальной производительности',
              },
              {
                icon: Shield,
                title: 'НАДЕЖНОСТЬ',
                desc: 'Автосохранение, история изменений и защита от потери данных',
              },
              {
                icon: Sparkles,
                title: 'ИНТУИТИВНЫЙ UI',
                desc: 'Современный интерфейс с поддержкой горячих клавиш и настраиваемых панелей',
              },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: 32,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-card-hover)'
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-card)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
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
                  <feature.icon size={28} color="#5c7cfa" strokeWidth={2} />
                </div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 12,
                  letterSpacing: '0.02em',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '120px 32px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            marginBottom: 24,
            letterSpacing: '-0.02em',
          }}>
            Готовы начать?
          </h2>
          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            marginBottom: 40,
            lineHeight: 1.6,
          }}>
            Скачайте TubeCAD бесплатно и начните проектировать трубные конструкции уже сегодня
          </p>
          <Link
            to="/download"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              transition: 'all 0.3s',
              boxShadow: '0 8px 24px rgba(92, 124, 250, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(92, 124, 250, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(92, 124, 250, 0.4)'
            }}
          >
            <Download size={20} />
            Скачать TubeCAD
          </Link>
        </div>
      </section>
    </div>
  )
}
