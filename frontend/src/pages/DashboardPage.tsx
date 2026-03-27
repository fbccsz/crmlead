import { usePlatformReadiness } from '../features/platform/usePlatformReadiness'
import { stageTone } from '../features/dashboard/stageStyle'
import { useDashboardFunnel } from '../features/dashboard/useDashboardFunnel'

export function DashboardPage() {
  const { loading, error, health, summary, leads } = usePlatformReadiness()
  const { funnel, conversionRate, totalLeads } = useDashboardFunnel(leads)

  const healthyApi = health?.status?.toLowerCase() === 'ok'

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">Dashboard</p>
        <h1>Cockpit comercial em tempo real</h1>
        <p className="subtitle">
          Visao tatico-operacional para conversao, ritmo de atendimento e capacidade
          de fechamento.
        </p>
      </header>

      <section className="dashboard-highlight">
        <article className="highlight-card">
          <p className="highlight-label">Taxa de Conversao</p>
          <strong className="highlight-value">{conversionRate}%</strong>
          <p className="highlight-sub">Base ativa de {totalLeads} leads monitorados.</p>
        </article>

        <article className="highlight-card">
          <p className="highlight-label">Leads em Operacao</p>
          <strong className="highlight-value">{summary?.activeLeads ?? '--'}</strong>
          <p className="highlight-sub">Oportunidades atualmente em acompanhamento.</p>
        </article>

        <article className={`highlight-card ${healthyApi ? 'highlight-ok' : 'highlight-warn'}`}>
          <p className="highlight-label">Saude da API</p>
          <strong className="highlight-value">{health?.status ?? '--'}</strong>
          <p className="highlight-sub">Versao: {health?.version ?? 'indisponivel'}.</p>
        </article>
      </section>

      <section className="panel">
        <h2>Painel de Integracao</h2>
        {loading ? <p className="muted">Carregando status da camada de API...</p> : null}
        {error ? <p className="error">Falha: {error}</p> : null}

        {!loading && !error && health && summary ? (
          <div className="kpis">
            <div className="kpi">
              <span>Status API</span>
              <strong>{health.status}</strong>
            </div>
            <div className="kpi">
              <span>Versao</span>
              <strong>{health.version}</strong>
            </div>
            <div className="kpi">
              <span>Leads ativos</span>
              <strong>{summary.activeLeads}</strong>
            </div>
            <div className="kpi">
              <span>Visitas agendadas</span>
              <strong>{summary.scheduledVisits}</strong>
            </div>
            <div className="kpi">
              <span>Propostas abertas</span>
              <strong>{summary.openProposals}</strong>
            </div>
            <div className="kpi">
              <span>Fechamentos</span>
              <strong>{summary.closedDeals}</strong>
            </div>
          </div>
        ) : null}
      </section>

      <section className="panel">
        <h2>Funil de Conversao</h2>
        <p className="muted table-subtitle">
          Performance atual: <strong>{conversionRate}%</strong> com{' '}
          <strong>{totalLeads}</strong> leads mapeados.
        </p>
        <div className="funnel-list">
          {funnel.map((item) => (
            <div key={item.stage} className={`funnel-item tone-${stageTone(item.stage)}`}>
              <div className="funnel-head">
                <span>{item.stage}</span>
                <strong>{item.total}</strong>
              </div>
              <div className="funnel-track" aria-hidden="true">
                <div className="funnel-fill" style={{ width: `${item.ratio}%` }} />
              </div>
              <small>{item.ratio}% da base</small>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
