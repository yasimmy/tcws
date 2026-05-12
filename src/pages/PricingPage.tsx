import { Check, Sparkles, ShieldCheck, Wrench, Clock3, MessageCircle, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export const PricingPage = () => {
  const { isAuthenticated } = useAuth()
  const [paymentsEnabled, setPaymentsEnabled] = useState(false)
  const [prices, setPrices] = useState<{ starter: number; pro: number; team: number }>({ starter: 0, pro: 0, team: 0 })
  const [actionMessage, setActionMessage] = useState('')
  const [paymentModalPlan, setPaymentModalPlan] = useState<'pro' | 'team' | null>(null)
  const [loadingTrial, setLoadingTrial] = useState(false)
  const payButtonLabel = (planName: string) => {
    if (!paymentsEnabled) return 'Оплата временно недоступна'
    const amount =
      planName === 'Team' ? prices.team : planName === 'Pro' ? prices.pro : planName === 'Starter' ? prices.starter : 0
    if (amount > 0) return `Оплатить · ${amount} ₴`
    return 'Оплатить'
  }

  useEffect(() => {
    api.getPublicSettings()
      .then((s) => {
        setPaymentsEnabled(!!s.paymentsEnabled)
        setPrices({
          starter: Number(s.prices?.starter || 0),
          pro: Number(s.prices?.pro || 0),
          team: Number(s.prices?.team || 0),
        })
      })
      .catch(() => {})
  }, [])

  const plans = [
    {
      name: 'Starter',
      subtitle: 'Для знакомства с продуктом',
      price: '0 ₴',
      period: 'в месяц',
      features: [
        'Импорт и экспорт IGES',
        'Базовые инструменты сборки',
        'Стандартная производительность',
        'Документация и быстрый старт',
      ],
    },
    {
      name: 'Pro',
      subtitle: 'Для инженерной работы каждый день',
      price: 'Скоро',
      period: 'тариф готовится',
      features: [
        'Расширенные инструменты соединения',
        'Гибкие настройки шаблонов и правил',
        'Повышенная скорость пересборки',
        'Приоритетные обновления',
      ],
      highlighted: true,
    },
    {
      name: 'Team',
      subtitle: 'Для команд и производственных задач',
      price: 'Скоро',
      period: 'тариф готовится',
      features: [
        'Совместные рабочие процессы',
        'Единые стандарты и пресеты',
        'Расширенная надежность и контроль',
        'Поддержка внедрения',
      ],
    },
  ]

  const effectivePlans = paymentsEnabled
    ? [
      {
        name: 'Trial',
        subtitle: '30 дней для теста перед оплатой',
        price: '0 ₴',
        period: '30 дней · 1 раз на устройство',
        features: [
          'Полный доступ к функциям Starter',
          'Активация только один раз на одно железо',
          'После окончания требуется активная подписка',
          'Нельзя переактивировать trial на том же устройстве',
        ],
      },
      ...plans
        .filter((p) => p.name !== 'Starter')
        .map((p) => {
          const key = p.name === 'Pro' ? 'pro' : 'team'
          const v = prices[key as 'pro' | 'team'] || 0
          return { ...p, price: `${v} ₴`, period: 'в месяц' }
        }),
    ]
    : plans

  const compareRows = [
    { name: 'Импорт/экспорт IGES', starter: 'Да', pro: 'Да', team: 'Да' },
    { name: 'Правила размещения и шаблоны', starter: 'Базовые', pro: 'Расширенные', team: 'Расширенные + стандарты' },
    { name: 'Производительность пересборки', starter: 'Стандарт', pro: 'Высокая', team: 'Максимальная' },
    { name: 'Поддержка', starter: 'Документация', pro: 'Приоритетная', team: 'Выделенная' },
  ]

  const faq = [
    {
      q: 'Нужно ли вводить карту прямо сейчас?',
      a: 'Нет. Платежный модуль отключен, поэтому никаких реквизитов сейчас не требуется.',
    },
    {
      q: 'Когда включится оплата?',
      a: 'После завершения бета-этапа. Мы заранее опубликуем даты и условия перехода на тарифы.',
    },
    {
      q: 'Бесплатный доступ сохранится?',
      a: 'Starter сейчас доступен как временный бесплатный режим. После запуска платной модели он может быть отключен, и вход останется только по активной подписке.',
    },
  ]

  return (
    <div style={{ padding: '80px 32px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 900,
          marginBottom: 18,
          textAlign: 'center',
          letterSpacing: '-0.03em',
        }}>
          ЦЕНЫ
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 'clamp(16px, 2vw, 19px)',
          maxWidth: 760,
          margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          {paymentsEnabled
            ? 'Выберите подходящий тариф и продолжайте работу без ограничений.'
            : 'Прозрачная модель тарифов без скрытых условий. Сейчас сервис работает во временном бесплатном режиме.'}
        </p>

        {!paymentsEnabled && (
          <div style={{
          margin: '0 auto 44px',
          maxWidth: 920,
          borderRadius: 16,
          border: '1px solid rgba(34, 197, 94, 0.35)',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.05) 100%)',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          }}>
          <Sparkles size={18} color="#4ade80" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ color: '#d1fae5', lineHeight: 1.6, fontSize: 14 }}>
            Сейчас приложение доступно бесплатно для всех пользователей.
            Оплата и подписки временно отключены.
            После запуска тарифов вход будет доступен только с активной подпиской.
          </p>
        </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 22,
          marginBottom: 32,
        }}>
          {effectivePlans.map((plan) => (
            <article
              key={plan.name}
              style={{
                borderRadius: 18,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                background: plan.highlighted
                  ? 'linear-gradient(160deg, rgba(92, 124, 250, 0.2) 0%, rgba(15, 23, 42, 0.95) 55%)'
                  : 'var(--bg-card)',
                border: plan.highlighted
                  ? '1px solid rgba(92, 124, 250, 0.5)'
                  : '1px solid var(--border)',
                boxShadow: plan.highlighted
                  ? '0 12px 32px rgba(92, 124, 250, 0.2)'
                  : '0 8px 24px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                width: 'fit-content',
                alignItems: 'center',
                gap: 8,
                padding: '4px 9px',
                borderRadius: 999,
                border: '1px solid rgba(148, 163, 184, 0.28)',
                color: '#cbd5e1',
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {plan.highlighted ? <ShieldCheck size={14} /> : <Wrench size={14} />}
                {plan.highlighted ? 'Рекомендуем' : 'План'}
              </div>

              <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>
                {plan.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                {plan.subtitle}
              </p>

              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontSize: 36,
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: plan.highlighted ? '#a5b4fc' : 'var(--text-primary)',
                }}>
                  {plan.price}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
                  {plan.period}
                </div>
              </div>

              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gap: 10,
                marginBottom: 24,
                flex: 1,
              }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45,
                    fontSize: 14,
                  }}>
                    <span style={{
                      width: 18,
                      height: 18,
                      borderRadius: 7,
                      border: '1px solid rgba(92, 124, 250, 0.45)',
                      background: 'rgba(92, 124, 250, 0.12)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                      flexShrink: 0,
                      boxShadow: '0 8px 22px rgba(92, 124, 250, 0.18)',
                    }}>
                      <Check size={12} color="#a5b4fc" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                disabled={!paymentsEnabled}
                onClick={async () => {
                  setActionMessage('')
                  if (plan.name === 'Trial') {
                    if (!isAuthenticated) {
                      setActionMessage('Сначала войдите в аккаунт, чтобы получить trial.')
                      return
                    }
                    setLoadingTrial(true)
                    try {
                      const data = await api.activateTrial()
                      setActionMessage(data?.message || 'Trial активирована на 30 дней.')
                    } catch (e) {
                      setActionMessage(e instanceof Error ? e.message : 'Не удалось активировать trial.')
                    } finally {
                      setLoadingTrial(false)
                    }
                    return
                  }
                  const planKey = plan.name.toLowerCase() === 'team' ? 'team' : 'pro'
                  setPaymentModalPlan(planKey as 'pro' | 'team')
                }}
                style={{
                  marginTop: 'auto',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: paymentsEnabled ? 'linear-gradient(135deg, #5c7cfa 0%, #4c6ef5 100%)' : 'rgba(148, 163, 184, 0.12)',
                  border: paymentsEnabled ? 'none' : '1px solid rgba(148, 163, 184, 0.25)',
                  color: paymentsEnabled ? '#fff' : '#cbd5e1',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: paymentsEnabled ? 'pointer' : 'not-allowed',
                  opacity: paymentsEnabled ? 1 : 0.9,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
              >
                <CreditCard size={16} />
                {plan.name === 'Trial'
                  ? (loadingTrial ? 'Активация...' : 'Получить Trial')
                  : payButtonLabel(plan.name)}
              </button>
            </article>
          ))}
        </div>
        {actionMessage && (
          <div style={{
            marginBottom: 16,
            border: '1px solid rgba(148, 163, 184, 0.22)',
            borderRadius: 12,
            background: 'rgba(15, 23, 42, 0.4)',
            padding: '10px 12px',
            color: '#dbe6ff',
            fontSize: 14,
          }}>
            {actionMessage}
          </div>
        )}
        {paymentModalPlan && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.62)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 16,
          }}>
            <div style={{
              width: 460,
              maxWidth: 'calc(100vw - 24px)',
              borderRadius: 14,
              border: '1px solid rgba(92, 124, 250, 0.35)',
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(10, 10, 10, 0.95))',
              padding: 16,
              boxShadow: '0 18px 42px rgba(0,0,0,0.5)',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Выберите сервис оплаты</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>
                Тариф: <b style={{ color: '#dbe6ff' }}>{paymentModalPlan.toUpperCase()}</b>
                {prices[paymentModalPlan] > 0 ? (
                  <> · сумма: <b style={{ color: '#dbe6ff' }}>{prices[paymentModalPlan]} ₴</b></>
                ) : null}
                . Ниже временные заглушки, вы потом подключите нужный провайдер.
              </div>
              <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                {['Stripe', 'Fondy', 'LiqPay', 'Крипто'].map((name) => (
                  <button
                    key={name}
                    onClick={() => setActionMessage(`Вы выбрали ${name}. Подключите обработчик оплаты в этом месте.`)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'rgba(148, 163, 184, 0.08)',
                      color: '#dbe6ff',
                      fontWeight: 700,
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPaymentModalPlan(null)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontWeight: 700,
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {!paymentsEnabled && (
          <section style={{
          marginBottom: 30,
          border: '1px solid var(--border)',
          borderRadius: 16,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(12, 12, 12, 0.7) 100%)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 18px',
            borderBottom: '1px solid var(--border)',
            color: '#c7d2fe',
            fontWeight: 700,
          }}>
            <Clock3 size={16} />
            Сравнение тарифов (предварительно)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              minWidth: 680,
              borderCollapse: 'collapse',
              fontSize: 14,
            }}>
              <thead>
                <tr style={{ color: '#cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '14px 18px' }}>Возможность</th>
                  <th style={{ textAlign: 'left', padding: '14px 12px' }}>Starter</th>
                  <th style={{ textAlign: 'left', padding: '14px 12px' }}>Pro</th>
                  <th style={{ textAlign: 'left', padding: '14px 12px' }}>Team</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row.name} style={{ borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                    <td style={{ padding: '13px 18px', color: '#e2e8f0' }}>{row.name}</td>
                    <td style={{ padding: '13px 12px', color: '#94a3b8', fontWeight: 500 }}>{row.starter}</td>
                    <td style={{ padding: '13px 12px', color: '#a5b4fc', fontWeight: 500 }}>{row.pro}</td>
                    <td style={{ padding: '13px 12px', color: '#cbd5e1', fontWeight: 500 }}>{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {!paymentsEnabled && (
          <section style={{
          display: 'grid',
          gap: 12,
          marginBottom: 12,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#cbd5e1',
            fontWeight: 700,
            fontSize: 18,
          }}>
            <MessageCircle size={18} color="#93c5fd" />
            Частые вопросы
          </div>
          {faq.map((item) => (
            <div key={item.q} style={{
              border: '1px solid var(--border)',
              borderRadius: 12,
              background: 'var(--bg-card)',
              padding: '14px 16px',
            }}>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>{item.q}</p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: 14 }}>{item.a}</p>
            </div>
          ))}
        </section>
        )}
      </div>
    </div>
  )
}
