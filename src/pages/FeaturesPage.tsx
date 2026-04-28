import { Box, Layers, Code, Zap, Settings, Grid3x3, Rotate3d, Copy, Scissors, Merge, FlipHorizontal, Palette, Eye, Keyboard, Save, FileDown, Undo2, Maximize2, Gauge, Move, MousePointer2, Sliders } from 'lucide-react'

export const FeaturesPage = () => {
  const features = [
    {
      category: 'ИМПОРТ И ЭКСПОРТ',
      icon: FileDown,
      items: [
        { icon: Code, title: 'IGES Импорт/Экспорт', desc: 'Полная поддержка формата IGES (.igs, .iges) для обмена данными с другими CAD системами' },
        { icon: Save, title: 'Сохранение проектов', desc: 'Сохранение и загрузка проектов с полной историей изменений и настроек' },
        { icon: FileDown, title: 'Автоэкспорт', desc: 'Автоматический экспорт после пересборки с настраиваемым именем файла по умолчанию' },
      ]
    },
    {
      category: '3D ВИЗУАЛИЗАЦИЯ',
      icon: Box,
      items: [
        { icon: Box, title: 'OpenCascade движок', desc: 'Мощный 3D движок с реалистичным отображением трубных конструкций и деталей' },
        { icon: Eye, title: 'Режимы отображения', desc: 'Переключение между затененным (shaded) и каркасным (wireframe) режимами' },
        { icon: Grid3x3, title: 'Сетка и оси', desc: 'Настраиваемая сетка, осевой гизмо (XYZ стрелки) и подписи осей с регулируемым размером' },
        { icon: Palette, title: 'Цветовая настройка', desc: 'Настройка цветов труб и деталей, контраста рёбер и сетки' },
        { icon: Maximize2, title: 'Fit All', desc: 'Автоматическое масштабирование для отображения всей сцены' },
      ]
    },
    {
      category: 'РАБОТА С ГЕОМЕТРИЕЙ',
      icon: Layers,
      items: [
        { icon: Layers, title: 'Трубы и детали', desc: 'Импорт основной трубы и множества деталей/шаблонов для сборки' },
        { icon: Copy, title: 'Размножение (паттерны)', desc: 'Размножение труб и деталей по осям X, Y, Z с настраиваемыми зазорами' },
        { icon: Rotate3d, title: 'Трансформации', desc: 'Вращение по осям X/Y/Z с произвольным углом, смещение по трём осям' },
        { icon: FlipHorizontal, title: 'Зеркалирование', desc: 'Зеркальное отражение деталей для симметричных конструкций' },
        { icon: Scissors, title: 'Булевы операции', desc: 'Вырезание (cut) и объединение (fuse) деталей с автоматическим расчетом пересечений' },
        { icon: Merge, title: 'Автопересборка', desc: 'Автоматическая пересборка геометрии при изменении параметров с дебаунсом' },
      ]
    },
    {
      category: 'УПРАВЛЕНИЕ КАМЕРОЙ',
      icon: MousePointer2,
      items: [
        { icon: MousePointer2, title: 'Зум к курсору', desc: 'Опциональный зум к позиции курсора с настраиваемой чувствительностью и инверсией' },
        { icon: Move, title: 'Панорамирование', desc: 'Перемещение камеры с настраиваемой скоростью' },
        { icon: Rotate3d, title: 'Орбитальное вращение', desc: 'Вращение вокруг объекта с регулируемой чувствительностью' },
        { icon: Keyboard, title: 'WASD навигация', desc: 'Перемещение камеры клавишами WASD с ускорением на Shift' },
        { icon: Sliders, title: 'FOV и дистанция', desc: 'Настройка поля зрения (20-95°) и минимальной/максимальной дистанции зума' },
      ]
    },
    {
      category: 'ПРАВИЛА РАЗМЕЩЕНИЯ',
      icon: Settings,
      items: [
        { icon: Settings, title: 'Гибкие правила', desc: 'Создание правил размещения деталей с количеством, зазорами, смещениями' },
        { icon: Layers, title: 'Порядок применения', desc: 'Изменение порядка применения правил (вверх/вниз) для контроля последовательности' },
        { icon: Eye, title: 'Включение/выключение', desc: 'Временное отключение правил без удаления для экспериментов' },
        { icon: Palette, title: 'Цветовая маркировка', desc: 'Автоматическое назначение цветов деталям для визуального различия' },
      ]
    },
    {
      category: 'ГОРЯЧИЕ КЛАВИШИ',
      icon: Keyboard,
      items: [
        { icon: Keyboard, title: 'Полная настройка', desc: 'Настройка всех хоткеев под ваш рабочий процесс без привязки к раскладке' },
        { icon: Undo2, title: 'Undo/Redo', desc: 'Отмена и повтор действий с полной историей изменений (Ctrl+Z, Ctrl+Y)' },
        { icon: Save, title: 'Быстрые действия', desc: 'Импорт (Ctrl+Shift+T/P), сохранение (Ctrl+S), экспорт (Ctrl+E), пересборка (Ctrl+B)' },
        { icon: Eye, title: 'Переключение режимов', desc: 'Быстрое переключение рёбер (G), полноэкранного режима (F11)' },
      ]
    },
    {
      category: 'ИНТЕРФЕЙС',
      icon: Settings,
      items: [
        { icon: Settings, title: 'Компактный режим', desc: 'Уменьшенные кнопки панели инструментов для экономии пространства' },
        { icon: Palette, title: 'Акцентные цвета', desc: 'Выбор акцентного цвета интерфейса: синий, зелёный, фиолетовый' },
        { icon: Maximize2, title: 'Авторазворот окна', desc: 'Автоматическое разворачивание окна на весь экран при запуске' },
        { icon: Eye, title: 'Подсказки управления', desc: 'Отображение подсказок управления в окне 3D' },
      ]
    },
    {
      category: 'ПРОИЗВОДИТЕЛЬНОСТЬ',
      icon: Zap,
      items: [
        { icon: Zap, title: 'Нативный движок C++', desc: 'Оптимизированный движок на C++ с OpenCascade для максимальной скорости' },
        { icon: Zap, title: 'Tauri фреймворк', desc: 'Легковесный интерфейс на Tauri для быстрого запуска и низкого потребления памяти' },
        { icon: Gauge, title: 'Дебаунс пересборки', desc: 'Умная задержка пересборки при изменении параметров для плавной работы' },
        { icon: Save, title: 'Автосохранение', desc: 'Защита от потери данных с отслеживанием несохранённых изменений' },
      ]
    },
  ]

  return (
    <div style={{ padding: '80px 32px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 900,
          marginBottom: 24,
          textAlign: 'center',
          letterSpacing: '-0.03em',
        }}>
          ВОЗМОЖНОСТИ
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 18,
          maxWidth: 800,
          margin: '0 auto 64px',
          lineHeight: 1.6,
        }}>
          TubeCAD предоставляет полный набор инструментов для профессионального проектирования трубных конструкций
        </p>

        {features.map((section, idx) => (
          <div key={idx} style={{ marginBottom: 64 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 32,
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
                <section.icon size={24} color="#5c7cfa" strokeWidth={2} />
              </div>
              <h2 style={{
                fontSize: 'clamp(24px, 3vw, 32px)',
                fontWeight: 800,
                letterSpacing: '0.02em',
              }}>
                {section.category}
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 20,
            }}>
              {section.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: 24,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-card-hover)'
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-card)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.transform = 'translateY(0)'
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
                    <item.icon size={20} color="#5c7cfa" strokeWidth={2} />
                  </div>
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 8,
                    letterSpacing: '0.01em',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
