import { useAgendaFeed } from '../features/agenda/useAgendaFeed'
import type { EventType } from '../shared/types/crm'

function formatDate(value: string) {
  const date = new Date(value)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function eventLabel(type: EventType) {
  if (type === 'visita') return 'Visita'
  if (type === 'ligacao') return 'Ligacao'
  if (type === 'followup') return 'Follow-up'
  return 'Reuniao'
}

function eventTone(type: EventType) {
  if (type === 'visita') return 'agenda-good'
  if (type === 'ligacao') return 'agenda-warn'
  if (type === 'followup') return 'agenda-neutral'
  return 'agenda-strong'
}

export function AgendaPage() {
  const { loading, error, upcoming, past, markDone, postponeOneDay } =
    useAgendaFeed()

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">Agenda</p>
        <h1>Compromissos comerciais</h1>
        <p className="subtitle">
          Timeline de visitas, ligacoes e follow-ups, pronta para backend real.
        </p>
      </header>

      <section className="panel">
        <h2>Proximos eventos</h2>
        {loading ? <p className="muted">Carregando agenda...</p> : null}
        {error ? <p className="error">Falha: {error}</p> : null}
        <div className="agenda-list">
          {upcoming.map((event) => (
            <article key={event.id} className={`agenda-item ${eventTone(event.type)}`}>
              <div>
                <p className="agenda-title">{event.title}</p>
                <p className="agenda-sub">
                  {eventLabel(event.type)} · {formatDate(event.date)}
                </p>
              </div>
              <div className="agenda-actions">
                <strong>{event.clientName ?? 'Sem cliente'}</strong>
                <div>
                  <button
                    className="agenda-btn"
                    type="button"
                    onClick={() => markDone(event.id)}
                  >
                    Concluir
                  </button>
                  <button
                    className="agenda-btn"
                    type="button"
                    onClick={() => postponeOneDay(event.id)}
                  >
                    Adiar 1d
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!loading && !error && upcoming.length === 0 ? (
            <p className="muted">Nenhum evento futuro.</p>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <h2>Historico recente</h2>
        <div className="agenda-list">
          {past.slice(0, 5).map((event) => (
            <article key={event.id} className="agenda-item agenda-past">
              <div>
                <p className="agenda-title">{event.title}</p>
                <p className="agenda-sub">
                  {eventLabel(event.type)} · {formatDate(event.date)}
                </p>
              </div>
              <strong>{event.clientName ?? 'Sem cliente'}</strong>
            </article>
          ))}
          {!loading && !error && past.length === 0 ? (
            <p className="muted">Nenhum evento concluido.</p>
          ) : null}
        </div>
      </section>
    </main>
  )
}
