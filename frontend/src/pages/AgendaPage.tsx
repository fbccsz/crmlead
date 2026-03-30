import { useState } from 'react'

import { Dialog } from '../components/Dialog'
import { ToastContainer } from '../components/ToastContainer'
import { useAgendaFeed } from '../features/agenda/useAgendaFeed'
import { useToast } from '../hooks/useToast'
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
  const { toasts, success, error: notifyError, removeToast } = useToast()
  const [pendingAction, setPendingAction] = useState<{
    type: 'done' | 'postpone'
    eventId: string
    title: string
  } | null>(null)

  const visitas = upcoming.filter((event) => event.type === 'visita').length
  const followups = upcoming.filter((event) => event.type === 'followup').length
  const ligacoes = upcoming.filter((event) => event.type === 'ligacao').length
  const nextEvent = upcoming
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  async function confirmPendingAction() {
    if (!pendingAction) return

    try {
      if (pendingAction.type === 'done') {
        await markDone(pendingAction.eventId)
        success('Evento concluido com sucesso.')
      } else {
        await postponeOneDay(pendingAction.eventId)
        success('Evento adiado em 1 dia.')
      }
    } catch {
      notifyError('Nao foi possivel atualizar o evento. Tente novamente.')
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">Agenda</p>
        <h1>Compromissos comerciais</h1>
        <p className="subtitle">
          Ritmo de atendimento com foco em proximas acoes e continuidade de follow-up.
        </p>
      </header>

      <section className="agenda-command">
        <article className="highlight-card highlight-ok">
          <p className="highlight-label">Proximos eventos</p>
          <strong className="highlight-value">{upcoming.length}</strong>
          <p className="highlight-sub">Compromissos ativos na fila comercial.</p>
        </article>
        <article className="highlight-card">
          <p className="highlight-label">Visitas</p>
          <strong className="highlight-value">{visitas}</strong>
          <p className="highlight-sub">Reunioes presenciais ou tours marcados.</p>
        </article>
        <article className="highlight-card">
          <p className="highlight-label">Follow-ups</p>
          <strong className="highlight-value">{followups + ligacoes}</strong>
          <p className="highlight-sub">Ligacoes e retomadas de negociacao.</p>
        </article>
        <article className="highlight-card highlight-warn">
          <p className="highlight-label">Proxima acao</p>
          <strong className="highlight-value">{nextEvent ? formatDate(nextEvent.date) : '--'}</strong>
          <p className="highlight-sub">{nextEvent ? nextEvent.title : 'Sem evento futuro no momento.'}</p>
        </article>
      </section>

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
                <p className="pipeline-sub">ID: {event.id}</p>
              </div>
              <div className="agenda-actions">
                <strong>{event.clientName ?? 'Sem cliente'}</strong>
                <div>
                  <button
                    className="agenda-btn"
                    type="button"
                    onClick={() =>
                      setPendingAction({
                        type: 'done',
                        eventId: event.id,
                        title: event.title,
                      })
                    }
                  >
                    Concluir
                  </button>
                  <button
                    className="agenda-btn"
                    type="button"
                    onClick={() =>
                      setPendingAction({
                        type: 'postpone',
                        eventId: event.id,
                        title: event.title,
                      })
                    }
                  >
                    Adiar 1d
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!loading && !error && upcoming.length === 0 ? (
            <div className="empty-state" role="status" aria-live="polite">
              <p className="empty-state-title">Sem eventos futuros</p>
              <p className="empty-state-subtitle">
                A agenda esta livre. Novos compromissos aparecerao aqui.
              </p>
            </div>
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
            <div className="empty-state" role="status" aria-live="polite">
              <p className="empty-state-title">Sem historico recente</p>
              <p className="empty-state-subtitle">
                Assim que eventos forem concluidos, este bloco mostrara o historico.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <Dialog
        open={Boolean(pendingAction)}
        title={pendingAction?.type === 'done' ? 'Concluir evento?' : 'Adiar evento em 1 dia?'}
        description={pendingAction ? `Evento: ${pendingAction.title}` : undefined}
        confirmText={pendingAction?.type === 'done' ? 'Concluir' : 'Confirmar adiamento'}
        cancelText="Cancelar"
        onConfirm={confirmPendingAction}
        onClose={() => setPendingAction(null)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  )
}
