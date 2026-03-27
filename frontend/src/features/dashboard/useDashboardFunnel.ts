import { useMemo } from 'react'

import type { FunnelStage, Lead } from '../../shared/types/crm'

export interface FunnelItem {
  stage: FunnelStage
  total: number
  ratio: number
}

const STAGE_ORDER: FunnelStage[] = [
  'Novo Contato',
  'Visita Agendada',
  'Proposta Feita',
  'Fechado',
  'Perdido',
]

export function useDashboardFunnel(leads: Lead[]) {
  const total = leads.length

  const funnel = useMemo<FunnelItem[]>(() => {
    return STAGE_ORDER.map((stage) => {
      const count = leads.filter((lead) => lead.stage === stage).length
      return {
        stage,
        total: count,
        ratio: total > 0 ? Math.round((count / total) * 100) : 0,
      }
    })
  }, [leads, total])

  const conversionRate = useMemo(() => {
    if (total === 0) return 0
    const closed = funnel.find((item) => item.stage === 'Fechado')?.total ?? 0
    return Math.round((closed / total) * 100)
  }, [funnel, total])

  return {
    funnel,
    conversionRate,
    totalLeads: total,
  }
}
