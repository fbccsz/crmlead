export interface DeliveryStage {
  id: string
  label: string
  percent: number
}

export const deliveryStages: DeliveryStage[] = [
  { id: 'base', label: 'Base TypeScript e estrutura', percent: 100 },
  { id: 'routing', label: 'Rotas e navegacao', percent: 100 },
  { id: 'dashboard', label: 'Dashboard operacional', percent: 100 },
  { id: 'leads', label: 'Leads com filtros', percent: 100 },
  { id: 'pipeline', label: 'Pipeline visual', percent: 100 },
  { id: 'agenda', label: 'Agenda com acoes', percent: 100 },
  { id: 'backend', label: 'Integracao backend real', percent: 100 },
  { id: 'auth', label: 'Autenticacao e autorizacao', percent: 100 },
]

export const overallCompletion = Math.round(
  deliveryStages.reduce((sum, stage) => sum + stage.percent, 0) /
    deliveryStages.length,
)

export const overallRemaining = Math.max(0, 100 - overallCompletion)
