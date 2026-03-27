// Servico de renovacao de sessao para manter usuario logado
// durante periodos de inatividade sem desconectar abruptamente

import { appEnv } from '../config/env'

const LAST_ACTIVITY_KEY = 'crmlead_last_activity_ms'

export function recordActivity(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
  }
}

export function getLastActivityAge(): number {
  if (typeof window === 'undefined') return 0
  const lastActivity = window.localStorage.getItem(LAST_ACTIVITY_KEY)
  if (!lastActivity) return 0
  return Date.now() - parseInt(lastActivity, 10)
}

// Marcar atividade cada vez que usuario interage com a pagina
export function setupActivityTracking(): (() => void) | undefined {
  if (typeof window === 'undefined') return undefined

  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  const activityHandler = () => recordActivity()

  events.forEach((event) => {
    window.addEventListener(event, activityHandler, { passive: true })
  })

  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, activityHandler)
    })
  }
}

// Verificar se ainda devem renovar sessao baseado em inatividade
export function shouldRefreshSession(): boolean {
  const inactivityMs = getLastActivityAge()
  // Renovar se nao houve atividade por mais de 30% do TTL
  const thresholdMs = (appEnv.sessionTtlMinutes * 60 * 1000) * 0.3
  return inactivityMs < thresholdMs // renovar antes que expire
}

export function clearSessionActivity(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LAST_ACTIVITY_KEY)
  }
}
