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
})

app.use(cors())
app.use(express.json())

const safeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  tgId: row.tg_id,
  tgUsername: row.tg_username,
  tgFirstName: row.tg_first_name,
  tgPhotoUrl: row.tg_photo_url,
  tgLinkedAt: row.tg_linked_at,
  createdAt: row.created_at,
})

const signToken = (user) => jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '14d' })

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Auth required' })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = await get('SELECT * FROM users WHERE id = ?', [payload.userId])
    if (!user) return res.status(401).json({ error: 'Invalid token' })
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
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
      'INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
      [n, e, passwordHash, createdAt],
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
