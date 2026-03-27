import { usePipelineColumns } from '../features/pipeline/usePipelineColumns'
import { usePlatformReadiness } from '../features/platform/usePlatformReadiness'

function stageClass(stage: string) {
  if (stage === 'Fechado') return 'stage-good'
  if (stage === 'Perdido') return 'stage-bad'
  if (stage === 'Proposta Feita') return 'stage-warn'
  return 'stage-neutral'
}

function fmtMoney(value: number | undefined) {
  if (!value) return 'Nao informado'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function stageAction(stage: string) {
  if (stage === 'Novo Contato') return 'Qualificar em ate 24h'
  if (stage === 'Visita Agendada') return 'Confirmar visita e roteiro'
  if (stage === 'Proposta Feita') return 'Follow-up comercial ativo'
  if (stage === 'Fechado') return 'Acionar pos-venda'
  return 'Registrar motivo da perda'
}

export function PipelinePage() {
  const { loading, error, leads } = usePlatformReadiness()
  const columns = usePipelineColumns(leads)
  const hasAnyLeads = columns.some((column) => column.leads.length > 0)

  const totalLeads = leads.length
  const openPipeline = columns
    .filter((column) => column.stage !== 'Fechado' && column.stage !== 'Perdido')
    .reduce((sum, column) => sum + column.leads.length, 0)
  const proposalLeads = columns.find((column) => column.stage === 'Proposta Feita')?.leads.length ?? 0
  const closedLeads = columns.find((column) => column.stage === 'Fechado')?.leads.length ?? 0
  const winRate = totalLeads ? Math.round((closedLeads / totalLeads) * 100) : 0

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">Pipeline</p>
        <h1>Funil em colunas</h1>
        <p className="subtitle">
          Mapa comercial em tempo real para priorizar negociacao, proposta e fechamento.
        </p>
      </header>

      <section className="pipeline-command">
        <article className="highlight-card">
          <p className="highlight-label">Base total</p>
          <strong className="highlight-value">{totalLeads}</strong>
          <p className="highlight-sub">Oportunidades monitoradas no pipeline.</p>
        </article>
        <article className="highlight-card">
          <p className="highlight-label">Funil ativo</p>
          <strong className="highlight-value">{openPipeline}</strong>
          <p className="highlight-sub">Leads em trabalho comercial no momento.</p>
        </article>
        <article className="highlight-card highlight-warn">
          <p className="highlight-label">Propostas abertas</p>
          <strong className="highlight-value">{proposalLeads}</strong>
          <p className="highlight-sub">Negociacoes com potencial de fechamento.</p>
        </article>
        <article className="highlight-card highlight-ok">
          <p className="highlight-label">Taxa de ganho</p>
          <strong className="highlight-value">{winRate}%</strong>
          <p className="highlight-sub">Fechamentos sobre a base total.</p>
        </article>
      </section>

      <section className="panel">
        <h2>Visao por etapa</h2>
        {loading ? <p className="muted">Carregando pipeline...</p> : null}
        {error ? <p className="error">Falha: {error}</p> : null}

        {!loading && !error && !hasAnyLeads ? (
          <div className="empty-state" role="status" aria-live="polite">
            <p className="empty-state-title">Pipeline vazio</p>
            <p className="empty-state-subtitle">
              Nenhuma oportunidade encontrada no momento para exibir nas colunas.
            </p>
          </div>
        ) : null}

        <div className="pipeline-grid">
          {columns.map((column) => (
            <article key={column.stage} className="pipeline-col">
              <header className={`pipeline-col-head ${stageClass(column.stage)}`}>
                <span>{column.stage}</span>
                <strong>{column.leads.length}</strong>
              </header>

              <div className="pipeline-cards">
                {column.leads.map((lead) => (
                  <div key={lead.id} className={`pipeline-card pipeline-card-${stageClass(column.stage)}`}>
                    <p className="pipeline-name">{lead.name}</p>
                    <p className="pipeline-sub">{lead.neighborhood ?? 'Sem bairro'}</p>
                    <p className="pipeline-sub">{fmtMoney(lead.budget)}</p>
                    <p className="pipeline-phone">{lead.phone}</p>
                    <p className="pipeline-sub">ID: {lead.id}</p>
                    <span className="pipeline-action">{stageAction(column.stage)}</span>
                  </div>
                ))}

                {!loading && !error && column.leads.length === 0 ? (
                  <p className="pipeline-empty pipeline-empty-chip">Nenhum lead nesta etapa</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
