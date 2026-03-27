import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { appEnv } from '../../shared/config/env'
import { setupActivityTracking } from '../../shared/services/sessionRenewal'
import { crmGateway } from '../../shared/api/runtimeGateway'
import type { UserSession } from '../../shared/types/auth'

interface AuthState {
  loading: boolean
  session: UserSession | null
  error: string | null
}

const initialState: AuthState = {
  loading: true,
  session: null,
  error: null,
}

interface AuthSessionContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

const SESSION_TIMESTAMP_KEY = 'crmlead_session_login_ts_v1'

function saveSessionTimestamp(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
  }
}

function getSessionAge(): number {
  if (typeof window === 'undefined') return 0
  const ts = window.localStorage.getItem(SESSION_TIMESTAMP_KEY)
  if (!ts) return 0
  return Date.now() - parseInt(ts, 10)
}

function isSessionExpired(): boolean {
  const ageMs = getSessionAge()
  const ttlMs = appEnv.sessionTtlMinutes * 60 * 1000
  return ageMs > ttlMs
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)

  // Setup de rastreamento de atividade na primeira renderizacao
  useEffect(() => {
    const cleanup = setupActivityTracking()
    return cleanup
  }, [])

  // Verificar expiração de sessão periodicamente
  useEffect(() => {
    const checkInterval = window.setInterval(() => {
      if (state.session && isSessionExpired()) {
        console.warn('Sessao expirou, fazendo logout automatico')
        void crmGateway.logout().then(() => {
          setState({ loading: false, session: null, error: 'Sessao expirou' })
        })
      }
    }, 30 * 1000) // verificar a cada 30s

    return () => {
      window.clearInterval(checkInterval)
    }
  }, [state.session])

  useEffect(() => {
    let active = true

    void crmGateway
      .getSession()
      .then((session) => {
        if (!active) return
        // Se temos sessão, restaurar timestamp de quando foi feito login
        if (session && isSessionExpired()) {
          setState({ loading: false, session: null, error: 'Sessao expirou' })
        } else {
          setState({ loading: false, session, error: null })
        }
      })
      .catch((error) => {
        if (!active) return
        setState({
          loading: false,
          session: null,
          error:
            error instanceof Error ? error.message : 'Falha ao carregar sessao',
        })
      })

    return () => {
      active = false
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const session = await crmGateway.getSession()
      setState({ loading: false, session, error: null })
    } catch (error) {
      setState({
        loading: false,
        session: null,
        error: error instanceof Error ? error.message : 'Falha ao carregar sessao',
      })
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await crmGateway.login({ email, password })
      saveSessionTimestamp()
      setState({ loading: false, session, error: null })
    },
    [],
  )

  const logout = useCallback(async () => {
    await crmGateway.logout()
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_TIMESTAMP_KEY)
    }
    setState({ loading: false, session: null, error: null })
  }, [])

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      ...state,
      login,
      logout,
      refreshSession,
    }),
    [state, login, logout, refreshSession],
  )

  return createElement(AuthSessionContext.Provider, { value }, children)
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext)
  if (!context) {
    throw new Error('useAuthSession deve ser usado dentro de AuthSessionProvider')
  }
  return context
}
