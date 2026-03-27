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
          Lista de oportunidades trazida pela camada de gateway, pronta para API real.
        </p>
      </header>

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
                <th>Orcamento</th>
                <th>Contato</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.name}</strong>
                  </td>
                  <td>{lead.stage}</td>
                  <td>{lead.neighborhood ?? 'Nao informado'}</td>
                  <td>{fmtMoney(lead.budget)}</td>
                  <td>{lead.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !error && filteredLeads.length === 0 ? (
            <p className="muted table-empty">Nenhum lead encontrado para os filtros aplicados.</p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
