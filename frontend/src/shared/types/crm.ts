export type FunnelStage =
  | 'Novo Contato'
  | 'Visita Agendada'
  | 'Proposta Feita'
  | 'Fechado'
  | 'Perdido'

export interface Lead {
  id: string
  name: string
  stage: FunnelStage
  phone: string
  email?: string
  budget?: number
  neighborhood?: string
  createdAt: string
}

export interface DashboardSummary {
  activeLeads: number
  scheduledVisits: number
  openProposals: number
  closedDeals: number
}

export interface HealthStatus {
  status: 'ok' | 'degraded'
  version: string
  timestamp: string
}

export type EventType = 'visita' | 'ligacao' | 'followup' | 'reuniao'

export interface CrmEvent {
  id: string
  title: string
  type: EventType
  date: string
  clientName?: string
}
