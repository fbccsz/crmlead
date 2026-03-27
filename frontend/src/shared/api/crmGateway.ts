import type { CrmEvent, DashboardSummary, HealthStatus, Lead } from '../types/crm'
import type { LoginInput, UserSession } from '../types/auth'

export interface CrmGateway {
  getSession(): Promise<UserSession | null>
  login(credentials: LoginInput): Promise<UserSession>
  logout(): Promise<void>
  getHealthStatus(): Promise<HealthStatus>
  getDashboardSummary(): Promise<DashboardSummary>
  listLeads(): Promise<Lead[]>
  listEvents(): Promise<CrmEvent[]>
  updateEventDate(eventId: string, date: string): Promise<CrmEvent>
}
