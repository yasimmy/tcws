import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

type AuthUser = {
  id: number
  name: string
  email: string
  createdAt: string
  tgId?: string
  tgUsername?: string
  tgFirstName?: string
  tgPhotoUrl?: string
  tgLinkedAt?: string
}

type AuthResult = {
  ok: boolean
  error?: string
}

type RegisterInput = {
  name: string
  email: string
  password: string
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (input: RegisterInput) => Promise<AuthResult>
  logout: () => void
  linkTelegram: (payload: Record<string, string | number>) => Promise<AuthResult>
}

const TOKEN_KEY = 'tubecad_token'

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    api.me()
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      })
  }, [])

  const register = async (input: RegisterInput): Promise<AuthResult> => {
    try {
      const data = await api.register(input.name, input.email, input.password)
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Не удалось зарегистрироваться.' }
    }
  }

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const data = await api.login(email, password)
      localStorage.setItem(TOKEN_KEY, data.token)
      setUser(data.user)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Не удалось войти.' }
    }
  }

  const linkTelegram = async (payload: Record<string, string | number>): Promise<AuthResult> => {
    try {
      const data = await api.linkTelegram(payload)
      setUser(data.user)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Не удалось привязать Telegram.' }
    }
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    register,
    login,
    logout: () => {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    },
    linkTelegram,
  }), [user, register, login, linkTelegram])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
