import { crmContracts } from './contracts'
import { HttpClient } from './httpClient'
import type { CrmGateway } from './crmGateway'
import type { LoginInput, UserSession } from '../types/auth'
import type { CrmEvent, DashboardSummary, HealthStatus, Lead } from '../types/crm'

type HealthStatusResponse = HealthStatus
interface DashboardSummaryResponse {
  summary: DashboardSummary
}
interface LeadsResponse {
  items: Lead[]
}
interface EventsResponse {
  items: CrmEvent[]
}

export class HttpCrmGateway implements CrmGateway {
  private readonly client: HttpClient

  constructor(client: HttpClient) {
    this.client = client
  }

  getSession(): Promise<UserSession | null> {
    return this.client.get<UserSession | null>(crmContracts.authSession)
  }

  login(credentials: LoginInput): Promise<UserSession> {
    return this.client.post<UserSession>(crmContracts.authLogin, credentials)
  }

  async logout(): Promise<void> {
    await this.client.post<void>(crmContracts.authLogout)
  }

  getHealthStatus(): Promise<HealthStatusResponse> {
    return this.client.get<HealthStatusResponse>(crmContracts.healthcheck)
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await this.client.get<DashboardSummaryResponse>(
      crmContracts.dashboardSummary,
    )
    return response.summary
  }

  async listLeads(): Promise<Lead[]> {
    const response = await this.client.get<LeadsResponse>(crmContracts.leads)
    return response.items
  }

  async listEvents(): Promise<CrmEvent[]> {
    const response = await this.client.get<EventsResponse>(crmContracts.events)
    return response.items
  }

  async updateEventDate(eventId: string, date: string): Promise<CrmEvent> {
    return this.client.patch<CrmEvent>(`${crmContracts.events}/${eventId}`, {
      date,
    })
  }
}
