import { Book, Rocket, Wrench, Code, Keyboard, Settings, HelpCircle, FileText, Zap, Box, Layers } from 'lucide-react'

export const DocsPage = () => {
  return (
    <div style={{ padding: '80px 32px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 900,
          marginBottom: 24,
          textAlign: 'center',
          letterSpacing: '-0.03em',
        }}>
          ДОКУМЕНТАЦИЯ
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 18,
          maxWidth: 800,
          margin: '0 auto 64px',
          lineHeight: 1.6,
        }}>
          Полное руководство по работе с TubeCAD
        </p>

        {/* Quick Start */}
        <section style={{ marginBottom: 64 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, rgba(92, 124, 250, 0.2) 0%, rgba(76, 110, 245, 0.2) 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Rocket size={24} color="#5c7cfa" strokeWidth={2} />
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}>
              БЫСТРЫЙ СТАРТ
            </h2>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 32,
          }}>
            <ol style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 2 }}>
              <li><strong style={{ color: 'var(--text-primary)' }}>Импортируйте трубу:</strong> Нажмите "Импорт трубы" (Ctrl+Shift+T) и выберите IGES файл основной трубы</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Добавьте детали:</strong> Нажмите "Импорт детали" (Ctrl+Shift+P) для добавления деталей/шаблонов</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Настройте размещение:</strong> В правой панели настройте количество, зазоры, вращение и смещения</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Пересоберите:</strong> Нажмите "Пересобрать" (Ctrl+B) для применения изменений</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Экспортируйте:</strong> Нажмите "Экспорт IGES" (Ctrl+E) для сохранения результата</li>
            </ol>
          </div>
        </section>

        {/* Main Workflow */}
        <section style={{ marginBottom: 64 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, rgba(92, 124, 250, 0.2) 0%, rgba(76, 110, 245, 0.2) 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Wrench size={24} color="#5c7cfa" strokeWidth={2} />
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}>
              ОСНОВНОЙ РАБОЧИЙ ПРОЦЕСС
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                icon: Box,
                title: 'Работа с трубой',
                items: [
                  'Импорт основной трубы из IGES',
                  'Размножение по осям X, Y, Z',
                  'Настройка зазоров между трубами',
                  'Вращение и зеркалирование',
                  'Смещение по трём осям',
                  'Выбор цвета трубы',
                ]
              },
              {
                icon: Layers,
                title: 'Работа с деталями',
                items: [
                  'Импорт деталей/шаблонов',
                  'Создание правил размещения',
                  'Размножение деталей (паттерны)',
                  'Булевы операции (cut/fuse)',
                  'Управление порядком правил',
                  'Включение/выключение правил',
                ]
              },
              {
                icon: Settings,
                title: '3D Просмотр',
                items: [
                  'Орбитальное вращение (ПКМ)',
                  'Панорамирование (СКМ)',
                  'Зум колесом мыши',
                  'WASD навигация',
                  'Переключение рёбер (G)',
                  'Fit All для масштабирования',
                ]
              },
            ].map((section, i) => (
              <div
                key={i}
                style={{
                  padding: 24,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, rgba(92, 124, 250, 0.15) 0%, rgba(76, 110, 245, 0.15) 100%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <section.icon size={20} color="#5c7cfa" strokeWidth={2} />
                </div>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 16,
                }}>
                  {section.title}
                </h3>
                <ul style={{
                  margin: 0,
                  paddingLeft: 20,
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  lineHeight: 1.8,
                }}>
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Hotkeys */}
        <section style={{ marginBottom: 64 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, rgba(92, 124, 250, 0.2) 0%, rgba(76, 110, 245, 0.2) 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Keyboard size={24} color="#5c7cfa" strokeWidth={2} />
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}>
              ГОРЯЧИЕ КЛАВИШИ
            </h2>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 32,
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {[
                { key: 'Ctrl+Shift+T', desc: 'Импорт трубы' },
                { key: 'Ctrl+Shift+P', desc: 'Импорт детали' },
                { key: 'Ctrl+B', desc: 'Пересобрать геометрию' },
                { key: 'Ctrl+S', desc: 'Сохранить проект' },
                { key: 'Ctrl+O', desc: 'Загрузить проект' },
                { key: 'Ctrl+E', desc: 'Экспорт IGES' },
                { key: 'Ctrl+Z', desc: 'Отменить' },
                { key: 'Ctrl+Y', desc: 'Повторить' },
                { key: 'G', desc: 'Показать/скрыть рёбра' },
                { key: 'F11', desc: 'Полноэкранный режим 3D' },
                { key: 'Ctrl+Shift+Del', desc: 'Очистить проект' },
                { key: 'WASD', desc: 'Навигация камеры' },
                { key: 'Shift+WASD', desc: 'Быстрая навигация' },
                { key: 'ПКМ', desc: 'Орбитальное вращение' },
                { key: 'СКМ', desc: 'Панорамирование' },
                { key: 'Колесо', desc: 'Зум' },
              ].map((hotkey, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                >
                  <span style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                  }}>
                    {hotkey.desc}
                  </span>
                  <code style={{
                    padding: '4px 8px',
                    background: 'rgba(92, 124, 250, 0.1)',
                    border: '1px solid rgba(92, 124, 250, 0.3)',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#5c7cfa',
                  }}>
                    {hotkey.key}
                  </code>
                </div>
              ))}
            </div>
            <p style={{
              marginTop: 20,
              color: 'var(--text-muted)',
              fontSize: 13,
              textAlign: 'center',
            }}>
              Все хоткеи можно настроить в разделе Настройки → Хоткеи
            </p>
          </div>
        </section>

        {/* Settings Guide */}
        <section style={{ marginBottom: 64 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, rgba(92, 124, 250, 0.2) 0%, rgba(76, 110, 245, 0.2) 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Settings size={24} color="#5c7cfa" strokeWidth={2} />
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}>
              НАСТРОЙКИ
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                title: 'Интерфейс',
                items: [
                  'Компактный режим панелей',
                  'Акцентный цвет (синий/зелёный/фиолетовый)',
                  'Авторазворот окна при запуске',
                ]
              },
              {
                title: '3D Просмотр',
                items: [
                  'Рёбра и сетка по умолчанию',
                  'Инверсия зума, зум к курсору',
                  'Чувствительность зума, панорамирования, орбиты',
                  'Скорость WASD и ускорение Shift',
                  'FOV (поле зрения 20-95°)',
                  'Контраст рёбер и сетки',
                  'Размер осевого гизмо и подписей',
                  'Показ подсказок управления',
                ]
              },
              {
                title: 'Файлы/Экспорт',
                items: [
                  'Автопересборка перед экспортом',
                  'Автоэкспорт после пересборки',
                  'Имя файла по умолчанию',
                  'Подтверждение перед очисткой',
                ]
              },
            ].map((section, i) => (
              <div
                key={i}
                style={{
                  padding: 24,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 16,
                }}>
                  {section.title}
                </h3>
                <ul style={{
                  margin: 0,
                  paddingLeft: 20,
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  lineHeight: 1.8,
                }}>
                  {section.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tips & Tricks */}
        <section>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, rgba(92, 124, 250, 0.2) 0%, rgba(76, 110, 245, 0.2) 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={24} color="#5c7cfa" strokeWidth={2} />
            </div>
            <h2 style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}>
              СОВЕТЫ И ХИТРОСТИ
            </h2>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 32,
          }}>
            <ul style={{
              margin: 0,
              paddingLeft: 20,
              color: 'var(--text-secondary)',
              fontSize: 14,
              lineHeight: 2,
            }}>
              <li><strong style={{ color: 'var(--text-primary)' }}>Автопересборка:</strong> Изменения параметров автоматически запускают пересборку с задержкой 140мс для плавной работы</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Порядок правил:</strong> Используйте кнопки ↑↓ для изменения порядка применения правил размещения деталей</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Временное отключение:</strong> Отключайте правила вместо удаления для экспериментов с размещением</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Зазоры:</strong> Программа автоматически определяет оптимальный зазор при импорте на основе геометрии</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>История изменений:</strong> Используйте Ctrl+Z/Ctrl+Y для отмены/повтора любых изменений</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Fit All:</strong> Если потеряли объект из виду, используйте Fit All для автоматического масштабирования</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Компактный режим:</strong> Включите для экономии места на экране при работе с большими проектами</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
