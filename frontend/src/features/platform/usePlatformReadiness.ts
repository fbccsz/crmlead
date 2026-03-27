import { useEffect, useState } from 'react'

import { crmGateway } from '../../shared/api/runtimeGateway'
import type { DashboardSummary, HealthStatus, Lead } from '../../shared/types/crm'

interface ReadinessState {
  loading: boolean
  error: string | null
  health: HealthStatus | null
  summary: DashboardSummary | null
  leads: Lead[]
}

const initialState: ReadinessState = {
  loading: true,
  error: null,
  health: null,
  summary: null,
  leads: [],
}

export function usePlatformReadiness() {
  const [state, setState] = useState<ReadinessState>(initialState)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [health, summary, leads] = await Promise.all([
          crmGateway.getHealthStatus(),
          crmGateway.getDashboardSummary(),
          crmGateway.listLeads(),
        ])

        if (!active) return
        setState({ loading: false, error: null, health, summary, leads })
      } catch (error) {
        if (!active) return
        setState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Falha ao carregar readiness da plataforma',
          health: null,
          summary: null,
          leads: [],
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return state
}
