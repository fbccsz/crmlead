import { appEnv } from '../config/env'
import type { CrmGateway } from './crmGateway'
import type { LoginInput, UserSession } from '../types/auth'
import type { CrmEvent, DashboardSummary, HealthStatus, Lead } from '../types/crm'

const SESSION_KEY = 'crmlead_mock_session_v1'
const SESSION_TIMESTAMP_KEY = 'crmlead_mock_session_ts_v1'

function isSessionExpired(createdAtMs: number): boolean {
  const nowMs = Date.now()
  const ageMs = nowMs - createdAtMs
  const ttlMs = appEnv.sessionTtlMinutes * 60 * 1000
  return ageMs > ttlMs
}

function loadSession(): UserSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    const tsRaw = window.localStorage.getItem(SESSION_TIMESTAMP_KEY)
    if (!raw || !tsRaw) return null

    const createdAtMs = parseInt(tsRaw, 10)
    if (isSessionExpired(createdAtMs)) {
      window.localStorage.removeItem(SESSION_KEY)
      window.localStorage.removeItem(SESSION_TIMESTAMP_KEY)
      return null
    }

    return JSON.parse(raw) as UserSession
  } catch {
    return null
  }
}

function saveSession(session: UserSession | null) {
  if (typeof window === 'undefined') return
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY)
    window.localStorage.removeItem(SESSION_TIMESTAMP_KEY)
    return
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString())
}

const mockLeads: Lead[] = [
  {
    id: 'ld-01',
    name: 'Maria Santos',
    stage: 'Proposta Feita',
    phone: '(71) 99999-1234',
    email: 'maria@email.com',
    neighborhood: 'Pituba',
    budget: 500000,
    createdAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'ld-02',
    name: 'Carlos Lima',
    stage: 'Visita Agendada',
    phone: '(71) 98888-5678',
    email: 'carlos@email.com',
    neighborhood: 'Barra',
    budget: 900000,
    createdAt: '2026-03-22T14:30:00Z',
  },
]

const mockSummary: DashboardSummary = {
  activeLeads: 12,
  scheduledVisits: 4,
  openProposals: 3,
  closedDeals: 9,
}

const mockEvents: CrmEvent[] = [
  {
    id: 'ev-01',
    title: 'Visita no apartamento da Pituba',
    type: 'visita',
    date: '2026-03-28T14:00:00Z',
    clientName: 'Maria Santos',
  },
  {
    id: 'ev-02',
    title: 'Ligacao de alinhamento da proposta',
    type: 'ligacao',
    date: '2026-03-28T16:30:00Z',
    clientName: 'Carlos Lima',
  },
  {
    id: 'ev-03',
    title: 'Follow-up de documentacao',
    type: 'followup',
    date: '2026-03-25T13:00:00Z',
    clientName: 'Ana Beatriz',
  },
  {
    id: 'ev-04',
    title: 'Reuniao de briefing',
    type: 'reuniao',
    date: '2026-03-24T10:00:00Z',
    clientName: 'Thiago Rocha',
  },
]

export class MockCrmGateway implements CrmGateway {
  async getSession(): Promise<UserSession | null> {
    return loadSession()
  }

  async login(credentials: LoginInput): Promise<UserSession> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Credenciais invalidas')
    }

    const session: UserSession = {
      id: 'usr-01',
      name: credentials.email.includes('gestor') ? 'Gestor CRM' : 'Corretor Demo',
      email: credentials.email,
      role: credentials.email.includes('gestor') ? 'gestor' : 'corretor',
      token: `mock-token-${Date.now()}`,
    }

    saveSession(session)
    return session
  }

  async logout(): Promise<void> {
    saveSession(null)
  }

  async getHealthStatus(): Promise<HealthStatus> {
    return {
      status: 'ok',
      version: 'mock-1.0.0',
      timestamp: new Date().toISOString(),
    }
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return mockSummary
  }

  async listLeads(): Promise<Lead[]> {
    return mockLeads
  }

  async listEvents(): Promise<CrmEvent[]> {
    return mockEvents
  }

  async updateEventDate(eventId: string, date: string): Promise<CrmEvent> {
    const index = mockEvents.findIndex((event) => event.id === eventId)
    if (index < 0) {
      throw new Error('Evento nao encontrado')
    }

    mockEvents[index] = {
      ...mockEvents[index],
      date,
    }

    return mockEvents[index]
  }
}
