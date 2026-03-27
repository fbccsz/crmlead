import { useEffect, useMemo, useState } from 'react'

import { crmGateway } from '../../shared/api/runtimeGateway'
import type { CrmEvent } from '../../shared/types/crm'

const AGENDA_OVERRIDES_KEY = 'crmlead_agenda_overrides_v1'

function loadAgendaOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(AGENDA_OVERRIDES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, string>
  } catch {
    return {}
  }
}

function saveAgendaOverrides(overrides: Record<string, string>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AGENDA_OVERRIDES_KEY, JSON.stringify(overrides))
}

function applyOverrides(events: CrmEvent[]): CrmEvent[] {
  const overrides = loadAgendaOverrides()
  return events.map((event) => {
    const nextDate = overrides[event.id]
    if (!nextDate) return event
    return { ...event, date: nextDate }
  })
}

interface AgendaState {
  loading: boolean
  error: string | null
  events: CrmEvent[]
  referenceNow: number
}

const initialState: AgendaState = {
  loading: true,
  error: null,
  events: [],
  referenceNow: Date.now(),
}

export function useAgendaFeed() {
  const [state, setState] = useState<AgendaState>(initialState)

  function applyLocalDate(eventId: string, nextDate: string) {
    const currentOverrides = loadAgendaOverrides()
    saveAgendaOverrides({ ...currentOverrides, [eventId]: nextDate })

    setState((prev) => ({
      ...prev,
      events: prev.events.map((event) =>
        event.id === eventId ? { ...event, date: nextDate } : event,
      ),
    }))
  }

  async function updateEventDate(eventId: string, nextDate: string) {
    try {
      const updated = await crmGateway.updateEventDate(eventId, nextDate)
      applyLocalDate(eventId, updated.date)
    } catch {
      // Fallback local enquanto backend de escrita nao estiver ativo.
      applyLocalDate(eventId, nextDate)
    }
  }

  async function markDone(eventId: string) {
    const doneAt = new Date(state.referenceNow - 60_000).toISOString()
    await updateEventDate(eventId, doneAt)
  }

  async function postponeOneDay(eventId: string) {
    const current = state.events.find((event) => event.id === eventId)
    if (!current) return
    const next = new Date(current.date)
    next.setDate(next.getDate() + 1)
    await updateEventDate(eventId, next.toISOString())
  }

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const events = applyOverrides(await crmGateway.listEvents())
        if (!active) return
        setState({ loading: false, error: null, events, referenceNow: Date.now() })
      } catch (error) {
        if (!active) return
        setState({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Falha ao carregar agenda',
          events: [],
          referenceNow: Date.now(),
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const upcoming = useMemo(
    () =>
      state.events.filter(
        (event) => new Date(event.date).getTime() >= state.referenceNow,
      ),
    [state.events, state.referenceNow],
  )

  const past = useMemo(
    () =>
      state.events.filter(
        (event) => new Date(event.date).getTime() < state.referenceNow,
      ),
    [state.events, state.referenceNow],
  )

  return {
    ...state,
    upcoming,
    past,
    markDone,
    postponeOneDay,
  }
}
