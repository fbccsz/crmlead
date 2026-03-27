import { useMemo } from 'react'

import type { FunnelStage, Lead } from '../../shared/types/crm'

export interface PipelineColumn {
  stage: FunnelStage
  leads: Lead[]
}

const STAGES: FunnelStage[] = [
  'Novo Contato',
  'Visita Agendada',
  'Proposta Feita',
  'Fechado',
  'Perdido',
]

export function usePipelineColumns(leads: Lead[]): PipelineColumn[] {
  return useMemo(
    () =>
      STAGES.map((stage) => ({
        stage,
        leads: leads.filter((lead) => lead.stage === stage),
      })),
    [leads],
  )
}
