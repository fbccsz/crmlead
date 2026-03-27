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

export function PipelinePage() {
  const { loading, error, leads } = usePlatformReadiness()
  const columns = usePipelineColumns(leads)

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">Pipeline</p>
        <h1>Funil em colunas</h1>
        <p className="subtitle">
          Visualizacao tipo kanban para acompanhar rapidamente o volume em cada etapa.
        </p>
      </header>

      <section className="panel">
        <h2>Visao por etapa</h2>
        {loading ? <p className="muted">Carregando pipeline...</p> : null}
        {error ? <p className="error">Falha: {error}</p> : null}

        <div className="pipeline-grid">
          {columns.map((column) => (
            <article key={column.stage} className="pipeline-col">
              <header className={`pipeline-col-head ${stageClass(column.stage)}`}>
                <span>{column.stage}</span>
                <strong>{column.leads.length}</strong>
              </header>

              <div className="pipeline-cards">
                {column.leads.map((lead) => (
                  <div key={lead.id} className="pipeline-card">
                    <p className="pipeline-name">{lead.name}</p>
                    <p className="pipeline-sub">{lead.neighborhood ?? 'Sem bairro'}</p>
                    <p className="pipeline-sub">{fmtMoney(lead.budget)}</p>
                    <p className="pipeline-phone">{lead.phone}</p>
                  </div>
                ))}

                {!loading && !error && column.leads.length === 0 ? (
                  <p className="pipeline-empty">Nenhum lead nesta etapa</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
