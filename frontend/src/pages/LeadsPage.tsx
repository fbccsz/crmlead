import { usePlatformReadiness } from '../features/platform/usePlatformReadiness'
import {
  ALL_STAGES,
  useLeadsViewModel,
} from '../features/leads/useLeadsViewModel'
import type { FunnelStage } from '../shared/types/crm'

function fmtMoney(value: number | undefined) {
  if (!value) return 'Nao informado'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function stageBadgeClass(stage: FunnelStage) {
  if (stage === 'Fechado') return 'lead-stage-badge lead-stage-good'
  if (stage === 'Proposta Feita') return 'lead-stage-badge lead-stage-hot'
  if (stage === 'Perdido') return 'lead-stage-badge lead-stage-bad'
  return 'lead-stage-badge lead-stage-neutral'
}

export function LeadsPage() {
  const { loading, error, leads } = usePlatformReadiness()
  const {
    filteredLeads,
    search,
    setSearch,
    stageFilter,
    setStageFilter,
    stageSummary,
  } = useLeadsViewModel(leads)

  const leadBudgets = filteredLeads
    .map((lead) => lead.budget)
    .filter((value): value is number => Boolean(value))

  const avgBudget =
    leadBudgets.length > 0
      ? leadBudgets.reduce((sum, current) => sum + current, 0) / leadBudgets.length
      : 0

  const hotLeads = filteredLeads.filter(
    (lead) => lead.stage === 'Visita Agendada' || lead.stage === 'Proposta Feita',
  ).length

  const closedLeads = filteredLeads.filter((lead) => lead.stage === 'Fechado').length
  const conversion = filteredLeads.length
    ? Math.round((closedLeads / filteredLeads.length) * 100)
    : 0

  const stageOptions: Array<FunnelStage | typeof ALL_STAGES> = [
    ALL_STAGES,
    'Novo Contato',
    'Visita Agendada',
    'Proposta Feita',
    'Fechado',
    'Perdido',
  ]

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">Leads</p>
        <h1>Pipeline comercial</h1>
        <p className="subtitle">
          Operacao de oportunidades com visibilidade de calor, conversao e valor medio.
        </p>
      </header>

      <section className="leads-command">
        <article className="highlight-card">
          <p className="highlight-label">Leads Visiveis</p>
          <strong className="highlight-value">{filteredLeads.length}</strong>
          <p className="highlight-sub">Base apos filtros aplicados.</p>
        </article>
        <article className="highlight-card">
          <p className="highlight-label">Em Negociacao</p>
          <strong className="highlight-value">{hotLeads}</strong>
          <p className="highlight-sub">Visitas agendadas + propostas em andamento.</p>
        </article>
        <article className="highlight-card highlight-ok">
          <p className="highlight-label">Conversao Atual</p>
          <strong className="highlight-value">{conversion}%</strong>
          <p className="highlight-sub">Proporcao de fechamentos na visao ativa.</p>
        </article>
        <article className="highlight-card highlight-warn">
          <p className="highlight-label">Ticket Medio</p>
          <strong className="highlight-value">{fmtMoney(avgBudget)}</strong>
          <p className="highlight-sub">Media de orcamento dos leads com valor.</p>
        </article>
      </section>

      <section className="panel">
        <h2>Leads cadastrados</h2>
        <div className="filter-row">
          <input
            className="search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, telefone, etapa ou bairro"
            aria-label="Buscar leads"
          />
          <select
            className="stage-select"
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value as FunnelStage | typeof ALL_STAGES)}
            aria-label="Filtrar por etapa"
          >
            {stageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="chips" aria-label="Resumo por etapa">
          {stageSummary.map((item) => (
            <div key={item.stage} className="chip">
              <span>{item.stage}</span>
              <strong>{item.total}</strong>
            </div>
          ))}
        </div>

        {loading ? <p className="muted">Carregando leads...</p> : null}
        {error ? <p className="error">Falha: {error}</p> : null}
        <div className="table-wrap">
          <table className="lead-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Etapa</th>
                <th>Bairro</th>
                <th>Status comercial</th>
                <th>Orcamento</th>
                <th>Contato</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.name}</strong>
                    <p className="pipeline-sub">ID: {lead.id}</p>
                  </td>
                  <td>
                    <span className={stageBadgeClass(lead.stage)}>{lead.stage}</span>
                  </td>
                  <td>{lead.neighborhood ?? 'Nao informado'}</td>
                  <td>
                    {lead.stage === 'Fechado' ? (
                      <span className="lead-priority lead-priority-good">Pronto para pos-venda</span>
                    ) : null}
                    {lead.stage === 'Proposta Feita' ? (
                      <span className="lead-priority lead-priority-hot">Follow-up de proposta</span>
                    ) : null}
                    {lead.stage === 'Visita Agendada' ? (
                      <span className="lead-priority lead-priority-warn">Confirmar visita</span>
                    ) : null}
                    {lead.stage === 'Novo Contato' ? (
                      <span className="lead-priority lead-priority-neutral">Fazer qualificacao inicial</span>
                    ) : null}
                    {lead.stage === 'Perdido' ? (
                      <span className="lead-priority lead-priority-bad">Mapear motivo da perda</span>
                    ) : null}
                  </td>
                  <td>{fmtMoney(lead.budget)}</td>
                  <td>{lead.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !error && filteredLeads.length === 0 ? (
            <div className="empty-state table-empty" role="status" aria-live="polite">
              <p className="empty-state-title">Nenhum lead encontrado</p>
              <p className="empty-state-subtitle">
                Ajuste busca ou etapa para ampliar a visao comercial.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
