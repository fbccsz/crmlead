import type { FunnelStage } from '../../shared/types/crm'

export function stageTone(stage: FunnelStage) {
  if (stage === 'Fechado') return 'good'
  if (stage === 'Perdido') return 'bad'
  if (stage === 'Proposta Feita') return 'warn'
  return 'neutral'
}
