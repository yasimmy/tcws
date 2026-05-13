# TubeCAD Backend API

Backend API для TubeCAD - профессионального CAD решения для соединения трубных конструкций.

## 🚀 Технологии

- **Node.js** + **Express** - REST API сервер
- **SQLite3** - база данных
- **JWT** - аутентификация (срок действия: 14 дней)
- **bcryptjs** - хеширование паролей
- **CORS** - поддержка кросс-доменных запросов

## 📦 Установка

```bash
npm install
```

## ⚙️ Настройка

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Настройте переменные окружения:

```env
API_PORT=4000
JWT_SECRET=your_long_random_secret_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ADMIN_BOOTSTRAP_USER=admin
ADMIN_BOOTSTRAP_PASS=admin
```

⚠️ **ВАЖНО:** Обязательно измените `JWT_SECRET` на длинный случайный ключ в production!

## 🏃 Запуск

### Development (с автоперезагрузкой)
```bash
npm run dev
```

### Production
```bash
npm start
```

API будет доступен по адресу: `http://localhost:4000`

## 📡 API Endpoints

### Публичные
- `GET /api/health` - проверка работоспособности
- `GET /api/public/settings` - публичные настройки (оплата, цены)
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход пользователя

### Защищенные (требуют JWT токен пользователя)
- `GET /api/auth/me` - информация о текущем пользователе
- `POST /api/app-auth/start` - начало авторизации приложения
- `GET /api/app-auth/status/:requestId` - статус авторизации приложения
- `POST /api/app-auth/complete` - завершение авторизации приложения
- `POST /api/app-access/check` - проверка доступа к приложению (trial/subscription)
- `POST /api/subscription/trial/activate` - активация trial подписки

### Админ панель (требуют admin JWT токен)
- `POST /api/admin/login` - вход в админку
- `GET /api/admin/me` - информация об админе
- `POST /api/admin/change-password` - смена пароля админа
- `GET /api/admin/users` - список всех пользователей
- `POST /api/admin/users/:id/subscription` - обновление подписки пользователя
- `POST /api/admin/users/:id/subscription-action` - действия с подпиской (выдать/аннулировать)
- `GET /api/admin/settings` - получить настройки приложения
- `POST /api/admin/settings` - обновить настройки приложения

## 🗄️ База данных

SQLite база данных создается автоматически в папке `data/app.db`

### Таблицы:

#### `users`
Пользователи системы с информацией о подписках и Telegram интеграции.

#### `admins`
Администраторы системы с хешированными паролями.

#### `app_settings`
Глобальные настройки приложения:
- `payments_enabled` - включена ли система оплаты
- `price_uah` - базовая цена в гривнах
- `price_starter_uah`, `price_pro_uah`, `price_team_uah` - цены по тарифам

#### `download_events`
События скачивания приложения (для статистики).

#### `app_auth_requests`
Запросы авторизации приложения через веб-интерфейс.

#### `device_fingerprints`
Отпечатки устройств пользователей для контроля доступа.

#### `trial_activations`
Активации trial подписок с привязкой к устройствам.

#### `subscription_events`
Журнал всех действий с подписками (выдача, аннулирование).

## 🔐 Безопасность

- Пароли хешируются с помощью **bcrypt** (10 раундов)
- JWT токены для аутентификации (срок действия: 14 дней)
- CORS настроен для безопасности
- Защита от SQL инъекций через параметризованные запросы
- Middleware для проверки ролей (user/admin)
- Обязательная смена пароля при первом входе админа

## 🎯 Особенности

### Система подписок
- **beta_free** - бесплатный доступ (когда оплата выключена)
- **trial** - пробный период (30 дней, привязка к устройству)
- **starter/pro/team** - платные тарифы

### Контроль доступа
- Проверка отпечатков устройств (machine, board, disk, cpu hash)
- Защита от использования trial на нескольких устройствах
- Автоматическое продление подписок админом

### Telegram интеграция
- Хранение Telegram ID и данных пользователя
- Готовность к интеграции с ботом

## 🌐 Production

- **API URL**: https://tcws.onrender.com
- **Frontend URL**: https://tubecad.fun
- **Frontend Repo**: https://github.com/yasimmy/tcws

## 📝 Структура проекта

```
server/
├── index.js          # Основной файл сервера (Express + SQLite)
├── package.json      # Зависимости и скрипты
├── .env.example      # Пример конфигурации
├── .gitignore        # Игнорируемые файлы
├── README.md         # Документация
└── data/             # База данных (создается автоматически)
    └── app.db        # SQLite база
```

## 🛠️ Разработка

Сервер использует `nodemon` для автоматической перезагрузки при изменениях:

```bash
npm run dev
```

## 🚀 Деплой

1. Установите зависимости: `npm install`
2. Настройте `.env` файл
3. Запустите сервер: `npm start`
4. Настройте reverse proxy (nginx/caddy) для HTTPS
5. Используйте PM2 или systemd для автозапуска

### Пример с PM2:
```bash
pm2 start index.js --name tubecad-api
pm2 save
pm2 startup
```

## 📄 Лицензия

Proprietary - все права защищены © TubeCAD Team
