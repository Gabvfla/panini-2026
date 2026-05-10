import { create } from 'zustand'
import { signIn, signUp, signOut, type Session, type AuthUser } from '../utils/supabase'

interface AuthStore {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  restoreSession: () => void
}

const SESSION_KEY = 'panini-session'

function persistSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token: session.access_token, user: session.user }))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  restoreSession: () => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return
      const { token, user } = JSON.parse(raw)
      if (token && user) set({ token, user })
    } catch {
      clearSession()
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const session = await signIn(email, password)
      persistSession(session)
      set({ user: session.user, token: session.access_token, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const session = await signUp(email, password)
      persistSession(session)
      set({ user: session.user, token: session.access_token, loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  logout: async () => {
    const { token } = get()
    set({ loading: true })
    try {
      if (token) await signOut(token)
    } catch {
      /* ignore */
    } finally {
      clearSession()
      set({ user: null, token: null, loading: false, error: null })
    }
  },

  clearError: () => set({ error: null }),
}))
