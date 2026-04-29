import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sqlite3 from 'sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

dotenv.config()

const app = express()
const PORT = Number(process.env.API_PORT || 4000)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const ADMIN_BOOTSTRAP_USER = process.env.ADMIN_BOOTSTRAP_USER || 'admin'
const ADMIN_BOOTSTRAP_PASS = process.env.ADMIN_BOOTSTRAP_PASS || 'admin'

const ROOT_DIR = process.cwd()
const DATA_DIR = path.join(ROOT_DIR, 'data')
const DB_PATH = path.join(DATA_DIR, 'app.db')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new sqlite3.Database(DB_PATH)

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function onRun(err) {
    if (err) reject(err)
    else resolve(this)
  })
})

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err)
    else resolve(row || null)
  })
})

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err)
    else resolve(rows || [])
  })
})

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      tg_id TEXT,
      tg_username TEXT,
      tg_first_name TEXT,
      tg_photo_url TEXT,
      tg_linked_at TEXT,
      subscription_plan TEXT,
      subscription_status TEXT,
      subscription_expires_at TEXT,
      created_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS download_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_key TEXT NOT NULL UNIQUE,
      user_id INTEGER,
      client_id TEXT,
      created_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      must_change_password INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      payments_enabled INTEGER NOT NULL DEFAULT 0,
      price_uah INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )
  `)
})

app.use(cors())
app.use(express.json())

const ensureUserColumns = async () => {
  // Lightweight migrations for existing db files
  const cols = await all(`PRAGMA table_info(users)`)
  const names = new Set(cols.map((c) => c.name))
  const add = async (name, type, defSql = '') => {
    if (names.has(name)) return
    await run(`ALTER TABLE users ADD COLUMN ${name} ${type} ${defSql}`.trim())
  }
  await add('subscription_plan', 'TEXT')
  await add('subscription_status', 'TEXT')
  await add('subscription_expires_at', 'TEXT')
}

const ensureSettingsTable = async () => {
  await ensureSettingsRow()
}

const ensureMigrations = async () => {
  await ensureUserColumns()
  await ensureSettingsTable()
  await ensureBootstrapAdmin()
}

const safeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  tgId: row.tg_id,
  tgUsername: row.tg_username,
  tgFirstName: row.tg_first_name,
  tgPhotoUrl: row.tg_photo_url,
  tgLinkedAt: row.tg_linked_at,
  subscriptionPlan: row.subscription_plan || 'starter',
  subscriptionStatus: row.subscription_status || 'beta_free',
  subscriptionExpiresAt: row.subscription_expires_at,
  createdAt: row.created_at,
})

const signToken = (user) => jwt.sign({ userId: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '14d' })
const signAdminToken = (admin) => jwt.sign({ adminId: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '14d' })

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Auth required' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'user') return res.status(401).json({ error: 'Invalid token' })
    const user = await get('SELECT * FROM users WHERE id = ?', [payload.userId])
    if (!user) return res.status(401).json({ error: 'Invalid token' })
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

const adminMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Admin auth required' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (payload.role !== 'admin') return res.status(401).json({ error: 'Invalid token' })
    const admin = await get('SELECT * FROM admins WHERE id = ?', [payload.adminId])
    if (!admin) return res.status(401).json({ error: 'Invalid token' })

    // force password change: allow only these endpoints
    if (Number(admin.must_change_password) === 1) {
      const allowed = ['/api/admin/me', '/api/admin/change-password']
      if (!allowed.includes(req.path)) {
        return res.status(403).json({ error: 'Password change required' })
      }
    }

    req.admin = admin
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

const ensureSettingsRow = async () => {
  const row = await get('SELECT * FROM app_settings WHERE id = 1')
  if (row) return row
  const now = new Date().toISOString()
  await run('INSERT INTO app_settings (id, payments_enabled, price_uah, updated_at) VALUES (1, 0, 0, ?)', [now])
  return get('SELECT * FROM app_settings WHERE id = 1')
}

const ensureBootstrapAdmin = async () => {
  const row = await get('SELECT * FROM admins WHERE username = ?', [ADMIN_BOOTSTRAP_USER])
  if (row) return
  const now = new Date().toISOString()
  const hash = await bcrypt.hash(String(ADMIN_BOOTSTRAP_PASS), 10)
  await run(
    'INSERT INTO admins (username, password_hash, must_change_password, created_at, updated_at) VALUES (?, ?, 1, ?, ?)',
    [ADMIN_BOOTSTRAP_USER, hash, now, now],
  )
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/public/settings', async (_req, res) => {
  try {
    const row = await ensureSettingsRow()
    return res.json({
      paymentsEnabled: Number(row.payments_enabled) === 1,
      priceUah: Number(row.price_uah) || 0,
      updatedAt: row.updated_at,
    })
  } catch {
    return res.status(500).json({ error: 'Не удалось получить настройки.' })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const { name = '', email = '', password = '' } = req.body || {}
  const n = String(name).trim()
  const e = String(email).trim().toLowerCase()
  const p = String(password)

  if (!n) return res.status(400).json({ error: 'Введите имя.' })
  if (!e) return res.status(400).json({ error: 'Введите email.' })
  if (p.length < 6) return res.status(400).json({ error: 'Пароль минимум 6 символов.' })

  try {
    const existing = await get('SELECT id FROM users WHERE email = ?', [e])
    if (existing) return res.status(409).json({ error: 'Email уже занят.' })

    const passwordHash = await bcrypt.hash(p, 10)
    const createdAt = new Date().toISOString()
    const result = await run(
      'INSERT INTO users (name, email, password_hash, subscription_plan, subscription_status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [n, e, passwordHash, 'starter', 'beta_free', createdAt],
    )
    const user = await get('SELECT * FROM users WHERE id = ?', [result.lastID])
    const token = signToken(user)

    return res.json({ token, user: safeUser(user) })
  } catch (error) {
    return res.status(500).json({ error: 'Не удалось зарегистрироваться.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email = '', password = '' } = req.body || {}
  const e = String(email).trim().toLowerCase()
  const p = String(password)

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [e])
    if (!user) return res.status(401).json({ error: 'Неверный email или пароль.' })

    const isValid = await bcrypt.compare(p, user.password_hash)
    if (!isValid) return res.status(401).json({ error: 'Неверный email или пароль.' })

    const token = signToken(user)
    return res.json({ token, user: safeUser(user) })
  } catch {
    return res.status(500).json({ error: 'Не удалось войти.' })
  }
})

app.post('/api/admin/login', async (req, res) => {
  const { username = '', password = '' } = req.body || {}
  const u = String(username).trim()
  const p = String(password)

  try {
    const admin = await get('SELECT * FROM admins WHERE username = ?', [u])
    if (!admin) return res.status(401).json({ error: 'Неверный логин или пароль.' })
    const isValid = await bcrypt.compare(p, admin.password_hash)
    if (!isValid) return res.status(401).json({ error: 'Неверный логин или пароль.' })

    const token = signAdminToken(admin)
    return res.json({
      token,
      mustChangePassword: Number(admin.must_change_password) === 1,
      username: admin.username,
    })
  } catch {
    return res.status(500).json({ error: 'Не удалось войти в админку.' })
  }
})

app.get('/api/admin/me', adminMiddleware, async (req, res) => {
  return res.json({
    username: req.admin.username,
    mustChangePassword: Number(req.admin.must_change_password) === 1,
  })
})

app.post('/api/admin/change-password', adminMiddleware, async (req, res) => {
  const { newPassword = '' } = req.body || {}
  const np = String(newPassword)
  if (np.length < 8) return res.status(400).json({ error: 'Пароль минимум 8 символов.' })

  try {
    const now = new Date().toISOString()
    const hash = await bcrypt.hash(np, 10)
    await run('UPDATE admins SET password_hash = ?, must_change_password = 0, updated_at = ? WHERE id = ?', [hash, now, req.admin.id])
    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Не удалось изменить пароль.' })
  }
})

app.get('/api/admin/users', adminMiddleware, async (_req, res) => {
  try {
    const rows = await all(
      `SELECT id, name, email, subscription_plan, subscription_status, subscription_expires_at, created_at
       FROM users
       ORDER BY id DESC`,
    )
    return res.json({ users: rows })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('admin/users failed', err)
    return res.status(500).json({ error: 'Не удалось получить пользователей.' })
  }
})

app.post('/api/admin/users/:id/subscription', adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id)
  const { plan, status, expiresAt } = req.body || {}

  if (!userId) return res.status(400).json({ error: 'Invalid user id' })
  const p = plan ? String(plan) : null
  const s = status ? String(status) : null
  const e = expiresAt ? String(expiresAt) : null

  try {
    await run(
      'UPDATE users SET subscription_plan = COALESCE(?, subscription_plan), subscription_status = COALESCE(?, subscription_status), subscription_expires_at = ? WHERE id = ?',
      [p, s, e, userId],
    )
    const row = await get('SELECT id, name, email, subscription_plan, subscription_status, subscription_expires_at, created_at FROM users WHERE id = ?', [userId])
    return res.json({ user: row })
  } catch {
    return res.status(500).json({ error: 'Не удалось обновить подписку.' })
  }
})

app.get('/api/admin/settings', adminMiddleware, async (_req, res) => {
  try {
    const row = await ensureSettingsRow()
    return res.json({
      paymentsEnabled: Number(row.payments_enabled) === 1,
      priceUah: Number(row.price_uah) || 0,
      updatedAt: row.updated_at,
    })
  } catch {
    return res.status(500).json({ error: 'Не удалось получить настройки.' })
  }
})

app.post('/api/admin/settings', adminMiddleware, async (req, res) => {
  const { paymentsEnabled, priceUah } = req.body || {}
  const pe = paymentsEnabled ? 1 : 0
  const price = Math.max(0, Number(priceUah || 0))

  try {
    await ensureSettingsRow()
    const now = new Date().toISOString()
    await run('UPDATE app_settings SET payments_enabled = ?, price_uah = ?, updated_at = ? WHERE id = 1', [pe, price, now])
    const row = await get('SELECT * FROM app_settings WHERE id = 1')
    return res.json({
      paymentsEnabled: Number(row.payments_enabled) === 1,
      priceUah: Number(row.price_uah) || 0,
      updatedAt: row.updated_at,
    })
  } catch {
    return res.status(500).json({ error: 'Не удалось сохранить настройки.' })
  }
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: safeUser(req.user) })
})

app.get('/api/stats/downloads', async (_req, res) => {
  try {
    const row = await get('SELECT COUNT(*) AS count FROM download_events')
    return res.json({ count: row?.count || 0 })
  } catch {
    return res.status(500).json({ error: 'Не удалось получить статистику.' })
  }
})

app.post('/api/stats/download', async (req, res) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const clientId = String(req.headers['x-client-id'] || '').trim()
  const now = new Date().toISOString()

  let userId = null
  let actorKey = ''

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET)
      userId = payload.userId
      actorKey = `user:${payload.userId}`
    } catch {
      // ignore token errors and fallback to client id
    }
  }

  if (!actorKey) {
    if (!clientId) return res.status(400).json({ error: 'Client id is required.' })
    actorKey = `client:${clientId}`
  }

  try {
    await run(
      'INSERT OR IGNORE INTO download_events (actor_key, user_id, client_id, created_at) VALUES (?, ?, ?, ?)',
      [actorKey, userId, clientId || null, now],
    )
    const row = await get('SELECT COUNT(*) AS count FROM download_events')
    return res.json({ count: row?.count || 0 })
  } catch {
    return res.status(500).json({ error: 'Не удалось обновить статистику.' })
  }
})

const verifyTelegramPayload = (payload) => {
  const incomingHash = payload.hash
  if (!incomingHash) return false

  const dataCheckString = Object.keys(payload)
    .filter((key) => key !== 'hash' && payload[key] !== undefined && payload[key] !== null)
    .sort()
    .map((key) => `${key}=${payload[key]}`)
    .join('\n')

  const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest()
  const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  return expectedHash === incomingHash
}

app.post('/api/telegram/link', authMiddleware, async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN не задан на сервере.' })
  }

  const payload = req.body || {}
  const authDate = Number(payload.auth_date || 0)
  const nowSec = Math.floor(Date.now() / 1000)
  const maxAgeSec = 24 * 60 * 60

  if (!payload.id || !payload.hash || !authDate) {
    return res.status(400).json({ error: 'Некорректные данные Telegram.' })
  }
  if (nowSec - authDate > maxAgeSec) {
    return res.status(400).json({ error: 'Сессия Telegram устарела, попробуйте еще раз.' })
  }
  if (!verifyTelegramPayload(payload)) {
    return res.status(401).json({ error: 'Проверка Telegram не пройдена.' })
  }

  try {
    await run(
      `UPDATE users
       SET tg_id = ?, tg_username = ?, tg_first_name = ?, tg_photo_url = ?, tg_linked_at = ?
       WHERE id = ?`,
      [
        String(payload.id),
        payload.username || null,
        payload.first_name || null,
        payload.photo_url || null,
        new Date().toISOString(),
        req.user.id,
      ],
    )
    const user = await get('SELECT * FROM users WHERE id = ?', [req.user.id])
    return res.json({ user: safeUser(user) })
  } catch {
    return res.status(500).json({ error: 'Не удалось привязать Telegram.' })
  }
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API started on http://localhost:${PORT}`)
  // eslint-disable-next-line no-console
  console.log(`SQLite DB file: ${DB_PATH}`)
})

// bootstrap after listen (safe for dev)
ensureMigrations().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('migrations failed', err)
})
