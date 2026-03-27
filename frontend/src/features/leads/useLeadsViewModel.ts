import { useMemo, useState } from 'react'

import type { FunnelStage, Lead } from '../../shared/types/crm'

export const ALL_STAGES = 'Todas'

type StageFilter = FunnelStage | typeof ALL_STAGES

interface LeadsViewModel {
  stageFilter: StageFilter
  search: string
  filteredLeads: Lead[]
  stageSummary: Array<{ stage: FunnelStage; total: number }>
  setStageFilter: (value: StageFilter) => void
  setSearch: (value: string) => void
}

const STAGE_ORDER: FunnelStage[] = [
  'Novo Contato',
  'Visita Agendada',
  'Proposta Feita',
  'Fechado',
  'Perdido',
]

function normalize(input: string) {
  return input.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function useLeadsViewModel(leads: Lead[]): LeadsViewModel {
  const [stageFilter, setStageFilter] = useState<StageFilter>(ALL_STAGES)
  const [search, setSearch] = useState('')

  const stageSummary = useMemo(
    () =>
      STAGE_ORDER.map((stage) => ({
        stage,
        total: leads.filter((lead) => lead.stage === stage).length,
      })),
    [leads],
  )

  const filteredLeads = useMemo(() => {
    const query = normalize(search.trim())

    return leads.filter((lead) => {
      const stageMatch = stageFilter === ALL_STAGES || lead.stage === stageFilter
      if (!stageMatch) return false

      if (!query) return true

      const target = normalize(
        [lead.name, lead.phone, lead.email ?? '', lead.neighborhood ?? '', lead.stage].join(' '),
      )
      return target.includes(query)
    })
  }, [leads, search, stageFilter])

  return {
    stageFilter,
    search,
    filteredLeads,
    stageSummary,
    setStageFilter,
    setSearch,
  }
}
