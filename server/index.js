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
      price_starter_uah INTEGER NOT NULL DEFAULT 0,
      price_pro_uah INTEGER NOT NULL DEFAULT 0,
      price_team_uah INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS subscription_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      plan TEXT,
      days INTEGER,
      reason TEXT,
      prev_status TEXT,
      prev_plan TEXT,
      prev_expires_at TEXT,
      new_status TEXT,
      new_plan TEXT,
      new_expires_at TEXT,
      created_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS app_auth_requests (
      request_id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      status TEXT NOT NULL,
      user_id INTEGER,
      token TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      approved_at TEXT,
      consumed_at TEXT
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS device_fingerprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      fingerprint_hash TEXT NOT NULL,
      machine_hash TEXT,
      board_hash TEXT,
      disk_hash TEXT,
      cpu_hash TEXT,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS trial_activations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      fingerprint_hash TEXT NOT NULL,
      machine_hash TEXT,
      board_hash TEXT,
      disk_hash TEXT,
      cpu_hash TEXT,
      trial_start TEXT NOT NULL,
      trial_end TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
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
  await add('trial_used_at', 'TEXT')
}

const ensureSettingsTable = async () => {
  await ensureSettingsRow()
}

const ensureSettingsColumns = async () => {
  const cols = await all(`PRAGMA table_info(app_settings)`)
  const names = new Set(cols.map((c) => c.name))
  const add = async (name, type, defSql = '') => {
    if (names.has(name)) return
    await run(`ALTER TABLE app_settings ADD COLUMN ${name} ${type} ${defSql}`.trim())
  }
  await add('price_starter_uah', 'INTEGER', 'NOT NULL DEFAULT 0')
  await add('price_pro_uah', 'INTEGER', 'NOT NULL DEFAULT 0')
  await add('price_team_uah', 'INTEGER', 'NOT NULL DEFAULT 0')
}

const ensureMigrations = async () => {
  await ensureUserColumns()
  await ensureSettingsTable()
  await ensureSettingsColumns()
  await ensureBootstrapAdmin()
}

const isSubscriptionActive = (user) => {
  if (!user) return false
  if (String(user.subscription_status || '') !== 'active') return false
  if (!user.subscription_expires_at) return true
  return new Date(user.subscription_expires_at).getTime() > Date.now()
}

const scoreHardwareMatch = (left, right) => {
  const fields = ['machine_hash', 'board_hash', 'disk_hash', 'cpu_hash']
  let matched = 0
  for (const f of fields) {
    if (!left?.[f] || !right?.[f]) continue
    if (String(left[f]) === String(right[f])) matched += 1
  }
  return matched
}

const hashPayloadFromBody = (body) => ({
  fingerprint_hash: String(body?.fingerprintHash || '').trim(),
  machine_hash: String(body?.machineGuidHash || '').trim() || null,
  board_hash: String(body?.boardHash || '').trim() || null,
  disk_hash: String(body?.diskHash || '').trim() || null,
  cpu_hash: String(body?.cpuHash || '').trim() || null,
})

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

app.post('/api/app-auth/start', async (req, res) => {
  const clientId = String(req.body?.clientId || req.headers['x-client-id'] || '').trim()
  if (!clientId) return res.status(400).json({ error: 'Client id is required.' })
  const requestId = crypto.randomUUID()
  const createdAt = new Date()
  const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000)
  try {
    await run(
      `INSERT INTO app_auth_requests
       (request_id, client_id, status, created_at, expires_at)
       VALUES (?, ?, 'pending', ?, ?)`,
      [requestId, clientId, createdAt.toISOString(), expiresAt.toISOString()],
    )
    return res.json({ requestId, expiresAt: expiresAt.toISOString() })
  } catch {
    return res.status(500).json({ error: 'Не удалось создать запрос входа.' })
  }
})

app.get('/api/app-auth/status/:requestId', async (req, res) => {
  const requestId = String(req.params.requestId || '').trim()
  const clientId = String(req.headers['x-client-id'] || req.query.clientId || '').trim()
  if (!requestId || !clientId) return res.status(400).json({ error: 'Invalid request.' })
  try {
    const row = await get('SELECT * FROM app_auth_requests WHERE request_id = ?', [requestId])
    if (!row) return res.status(404).json({ error: 'Запрос входа не найден.' })
    if (row.client_id !== clientId) return res.status(403).json({ error: 'Этот запрос принадлежит другому устройству.' })
    if (row.status === 'pending' && new Date(row.expires_at).getTime() <= Date.now()) {
      await run('UPDATE app_auth_requests SET status = ? WHERE request_id = ?', ['expired', requestId])
      return res.json({ status: 'expired' })
    }
    if (row.status === 'approved' || row.status === 'consumed') {
      const user = row.user_id ? await get('SELECT * FROM users WHERE id = ?', [row.user_id]) : null
      if (!row.token || !user) return res.json({ status: row.status })
      if (row.status === 'approved') {
        await run(
          'UPDATE app_auth_requests SET status = ?, consumed_at = ? WHERE request_id = ?',
          ['consumed', new Date().toISOString(), requestId],
        )
      }
      return res.json({ status: 'approved', token: row.token, user: safeUser(user) })
    }
    return res.json({ status: row.status })
  } catch {
    return res.status(500).json({ error: 'Не удалось проверить статус входа.' })
  }
})

app.post('/api/app-auth/complete', authMiddleware, async (req, res) => {
  const requestId = String(req.body?.requestId || '').trim()
  if (!requestId) return res.status(400).json({ error: 'requestId is required.' })
  try {
    const row = await get('SELECT * FROM app_auth_requests WHERE request_id = ?', [requestId])
    if (!row) return res.status(404).json({ error: 'Запрос входа не найден.' })
    if (new Date(row.expires_at).getTime() <= Date.now()) {
      await run('UPDATE app_auth_requests SET status = ? WHERE request_id = ?', ['expired', requestId])
      return res.status(400).json({ error: 'Запрос входа истек. Вернитесь в приложение и попробуйте снова.' })
    }
    if (row.status !== 'pending') {
      return res.status(400).json({ error: 'Этот запрос уже обработан.' })
    }
    const token = signToken(req.user)
    await run(
      `UPDATE app_auth_requests
       SET status = ?, user_id = ?, token = ?, approved_at = ?
       WHERE request_id = ?`,
      ['approved', req.user.id, token, new Date().toISOString(), requestId],
    )
    return res.json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Не удалось подтвердить вход в приложение.' })
  }
})

app.get('/api/public/settings', async (_req, res) => {
  try {
    const row = await ensureSettingsRow()
    return res.json({
      paymentsEnabled: Number(row.payments_enabled) === 1,
      priceUah: Number(row.price_uah) || 0,
      prices: {
        starter: Number(row.price_starter_uah) || 0,
        pro: Number(row.price_pro_uah) || 0,
        team: Number(row.price_team_uah) || 0,
      },
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
      prices: {
        starter: Number(row.price_starter_uah) || 0,
        pro: Number(row.price_pro_uah) || 0,
        team: Number(row.price_team_uah) || 0,
      },
      updatedAt: row.updated_at,
    })
  } catch {
    return res.status(500).json({ error: 'Не удалось получить настройки.' })
  }
})

app.post('/api/admin/settings', adminMiddleware, async (req, res) => {
  const { paymentsEnabled, priceUah, prices } = req.body || {}
  const pe = paymentsEnabled ? 1 : 0
  const price = Math.max(0, Number(priceUah || 0))
  const pStarter = Math.max(0, Number(prices?.starter || 0))
  const pPro = Math.max(0, Number(prices?.pro || 0))
  const pTeam = Math.max(0, Number(prices?.team || 0))

  try {
    await ensureSettingsRow()
    const now = new Date().toISOString()
    await run(
      'UPDATE app_settings SET payments_enabled = ?, price_uah = ?, price_starter_uah = ?, price_pro_uah = ?, price_team_uah = ?, updated_at = ? WHERE id = 1',
      [pe, price, pStarter, pPro, pTeam, now],
    )
    const row = await get('SELECT * FROM app_settings WHERE id = 1')
    return res.json({
      paymentsEnabled: Number(row.payments_enabled) === 1,
      priceUah: Number(row.price_uah) || 0,
      prices: {
        starter: Number(row.price_starter_uah) || 0,
        pro: Number(row.price_pro_uah) || 0,
        team: Number(row.price_team_uah) || 0,
      },
      updatedAt: row.updated_at,
    })
  } catch {
    return res.status(500).json({ error: 'Не удалось сохранить настройки.' })
  }
})

const addDays = (iso, days) => {
  const base = iso ? new Date(iso) : new Date()
  base.setUTCDate(base.getUTCDate() + days)
  return base.toISOString()
}

app.post('/api/admin/users/:id/subscription-action', adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id)
  const { action, plan, days, reason, extendExisting } = req.body || {}
  if (!userId) return res.status(400).json({ error: 'Invalid user id' })
  const a = String(action || '')
  const rsn = String(reason || '').trim()
  if (!rsn) return res.status(400).json({ error: 'Укажите причину.' })

  try {
    const user = await get('SELECT * FROM users WHERE id = ?', [userId])
    if (!user) return res.status(404).json({ error: 'Пользователь не найден.' })

    const prevStatus = user.subscription_status || null
    const prevPlan = user.subscription_plan || null
    const prevExpires = user.subscription_expires_at || null

    let newStatus = prevStatus
    let newPlan = prevPlan
    let newExpires = prevExpires

    if (a === 'grant') {
      const d = Math.max(1, Number(days || 30))
      newPlan = String(plan || prevPlan || 'starter')
      newStatus = 'active'
      const now = new Date()
      const canExtend = Boolean(extendExisting) && prevStatus === 'active' && prevExpires && new Date(prevExpires) > now
      newExpires = addDays(canExtend ? prevExpires : now.toISOString(), d)

      await run(
        'UPDATE users SET subscription_plan = ?, subscription_status = ?, subscription_expires_at = ? WHERE id = ?',
        [newPlan, newStatus, newExpires, userId],
      )
      await run(
        `INSERT INTO subscription_events
         (user_id, admin_id, action, plan, days, reason, prev_status, prev_plan, prev_expires_at, new_status, new_plan, new_expires_at, created_at)
         VALUES (?, ?, 'grant', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, req.admin.id, newPlan, d, rsn, prevStatus, prevPlan, prevExpires, newStatus, newPlan, newExpires, new Date().toISOString()],
      )
    } else if (a === 'revoke') {
      newStatus = 'cancelled'
      newExpires = new Date().toISOString()
      await run(
        'UPDATE users SET subscription_status = ?, subscription_expires_at = ? WHERE id = ?',
        [newStatus, newExpires, userId],
      )
      await run(
        `INSERT INTO subscription_events
         (user_id, admin_id, action, reason, prev_status, prev_plan, prev_expires_at, new_status, new_plan, new_expires_at, created_at)
         VALUES (?, ?, 'revoke', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, req.admin.id, rsn, prevStatus, prevPlan, prevExpires, newStatus, prevPlan, newExpires, new Date().toISOString()],
      )
    } else {
      return res.status(400).json({ error: 'Invalid action' })
    }

    const updated = await get(
      'SELECT id, name, email, subscription_plan, subscription_status, subscription_expires_at, created_at FROM users WHERE id = ?',
      [userId],
    )
    return res.json({ user: updated })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('subscription-action failed', err)
    return res.status(500).json({ error: 'Не удалось выполнить операцию.' })
  }
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: safeUser(req.user) })
})

app.post('/api/app-access/check', authMiddleware, async (req, res) => {
  const fp = hashPayloadFromBody(req.body || {})
  if (!fp.fingerprint_hash) {
    return res.status(400).json({ error: 'fingerprintHash is required.' })
  }
  try {
    const now = new Date()
    const settings = await ensureSettingsRow()
    const paymentsEnabled = Number(settings.payments_enabled) === 1
    const user = await get('SELECT * FROM users WHERE id = ?', [req.user.id])
    if (!user) return res.status(401).json({ error: 'Invalid token' })

    await run(
      `INSERT INTO device_fingerprints
       (user_id, fingerprint_hash, machine_hash, board_hash, disk_hash, cpu_hash, created_at, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, fp.fingerprint_hash, fp.machine_hash, fp.board_hash, fp.disk_hash, fp.cpu_hash, now.toISOString(), now.toISOString()],
    )

    if (!paymentsEnabled) {
      return res.json({
        allow: true,
        accessType: 'beta',
        reason: 'Оплата выключена: доступ открыт.',
      })
    }

    if (isSubscriptionActive(user) && String(user.subscription_plan || '') !== 'trial') {
      return res.json({
        allow: true,
        accessType: 'subscription',
        reason: 'Активная подписка.',
      })
    }

    if (isSubscriptionActive(user) && String(user.subscription_plan || '') === 'trial') {
      const allTrials = await all(
        `SELECT * FROM trial_activations
         WHERE fingerprint_hash = ?
            OR machine_hash = ?
            OR board_hash = ?
            OR disk_hash = ?
            OR cpu_hash = ?`,
        [fp.fingerprint_hash, fp.machine_hash, fp.board_hash, fp.disk_hash, fp.cpu_hash],
      )
      let foreign = allTrials.find((t) => Number(t.user_id) !== Number(user.id) && (t.fingerprint_hash === fp.fingerprint_hash || scoreHardwareMatch(t, fp) >= 3)) || null
      if (foreign) {
        return res.json({
          allow: false,
          accessType: 'denied',
          reason: 'К этому железу уже привязан trial другого аккаунта.',
        })
      }
      const myTrial = await get(
        `SELECT * FROM trial_activations
         WHERE user_id = ?
         ORDER BY id DESC LIMIT 1`,
        [user.id],
      )
      if (myTrial) {
        const trialEndTs = new Date(myTrial.trial_end).getTime()
        if (trialEndTs <= Date.now()) {
          await run('UPDATE trial_activations SET status = ?, updated_at = ? WHERE id = ?', ['expired', now.toISOString(), myTrial.id])
          await run('UPDATE users SET subscription_status = ? WHERE id = ?', ['expired', user.id])
          return res.json({
            allow: false,
            accessType: 'denied',
            reason: 'Trial истекла.',
          })
        }
        const sameDevice = myTrial.fingerprint_hash === fp.fingerprint_hash || scoreHardwareMatch(myTrial, fp) >= 3
        if (!sameDevice) {
          return res.json({
            allow: false,
            accessType: 'denied',
            reason: 'Trial этого аккаунта уже привязана к другому устройству.',
          })
        }
        await run('UPDATE trial_activations SET status = ?, updated_at = ? WHERE id = ?', ['active', now.toISOString(), myTrial.id])
        return res.json({
          allow: true,
          accessType: 'trial',
          reason: 'Trial активна.',
          trialEnd: myTrial.trial_end,
        })
      }

      const trialStart = now.toISOString()
      const trialEnd = user.subscription_expires_at || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      await run(
        `INSERT INTO trial_activations
         (user_id, fingerprint_hash, machine_hash, board_hash, disk_hash, cpu_hash, trial_start, trial_end, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        [user.id, fp.fingerprint_hash, fp.machine_hash, fp.board_hash, fp.disk_hash, fp.cpu_hash, trialStart, trialEnd, trialStart, trialStart],
      )
      return res.json({
        allow: true,
        accessType: 'trial',
        reason: 'Trial активна.',
        trialEnd,
      })
    }

    return res.json({
      allow: false,
      accessType: 'denied',
      reason: 'Нет активной подписки. Получите Trial на сайте или оформите оплату.',
    })
  } catch (err) {
    console.error('app-access/check failed', err)
    return res.status(500).json({ error: 'Не удалось проверить доступ приложения.' })
  }
})

app.post('/api/subscription/trial/activate', authMiddleware, async (req, res) => {
  try {
    const settings = await ensureSettingsRow()
    if (Number(settings.payments_enabled) !== 1) {
      return res.status(400).json({ error: 'Trial активируется только при включенной оплате.' })
    }
    const user = await get('SELECT * FROM users WHERE id = ?', [req.user.id])
    if (!user) return res.status(401).json({ error: 'Invalid token' })
    if (user.trial_used_at) {
      return res.status(400).json({ error: 'Trial уже была использована для этого аккаунта.' })
    }
    if (isSubscriptionActive(user)) {
      return res.status(400).json({ error: 'У вас уже есть активный доступ.' })
    }
    const now = new Date()
    const trialStart = now.toISOString()
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await run(
      'UPDATE users SET subscription_plan = ?, subscription_status = ?, subscription_expires_at = ?, trial_used_at = ? WHERE id = ?',
      ['trial', 'active', trialEnd, trialStart, user.id],
    )
    const updated = await get('SELECT * FROM users WHERE id = ?', [user.id])
    return res.json({
      message: 'Trial активирована на 30 дней.',
      trialEnd,
      user: safeUser(updated),
    })
  } catch (err) {
    console.error('subscription/trial/activate failed', err)
    return res.status(500).json({ error: 'Не удалось активировать trial.' })
  }
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
