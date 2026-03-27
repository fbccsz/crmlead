import { useEffect, useMemo, useState } from 'react'

import { projectMeta } from '../shared/config/projectMeta'
import { appEnv, appEnvKeys } from '../shared/config/env'
import {
  deliveryStages,
  overallCompletion,
  overallRemaining,
} from '../shared/config/deliveryProgress'

const folders = [
  { name: 'frontend/', description: 'Aplicacao web em TypeScript (React + Vite).' },
  { name: 'legacy/standalone/', description: 'Versao HTML unica preservada para referencia.' },
  { name: 'docs/business/', description: 'Plano de negocio, roadmap e documentacao funcional.' },
]

const nextSteps = [
  'Definir entidades e contratos da API (OpenAPI) antes do backend.',
  'Migrar regras de negocio do legado para modulos de dominio no frontend.',
  'Preparar autenticacao JWT e RBAC quando iniciar backend.',
]

type ApiCheckSnapshot = {
  status: 'success' | 'error'
  message: string
  latencyMs: number | null
  checkedAt: string
}

type ApiCheckHistoryItem = ApiCheckSnapshot & {
  testedUrl: string | null
}

type HistoryFilter = 'all' | 'success' | 'error'
type HistorySort = 'newest' | 'oldest' | 'slowest' | 'fastest'

function formatHistoryStatusLabel(status: ApiCheckHistoryItem['status']): string {
  return status === 'success' ? 'Sucesso' : 'Falha'
}

function historyStatusClass(status: ApiCheckHistoryItem['status']): string {
  return status === 'success' ? 'history-status-chip history-status-success' : 'history-status-chip history-status-error'
}

export function ProjectSetupPage() {
  const [selectedMode, setSelectedMode] = useState<'mock' | 'real'>(
    appEnv.useMockApi ? 'mock' : 'real',
  )
  const [apiCheckStatus, setApiCheckStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle')
  const [apiCheckMessage, setApiCheckMessage] = useState<string>(
    'Nenhum teste executado ainda.',
  )
  const [apiLatencyMs, setApiLatencyMs] = useState<number | null>(null)
  const [apiCheckedAt, setApiCheckedAt] = useState<string | null>(null)
  const [apiCheckedUrl, setApiCheckedUrl] = useState<string | null>(null)
  const [apiRecentChecks, setApiRecentChecks] = useState<ApiCheckHistoryItem[]>([])
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all')
  const [historySort, setHistorySort] = useState<HistorySort>('newest')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'done' | 'error'>('idle')
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'done' | 'error'>('idle')
  const [healthPathInput, setHealthPathInput] = useState<string>(
    appEnv.healthCheckPath,
  )

  const isOverrideActive = appEnv.useMockApi !== appEnv.defaultUseMockApi
  const isHealthPathOverrideActive =
    appEnv.healthCheckPath !== appEnv.defaultHealthCheckPath

  function normalizeHealthPath(input: string): string {
    const trimmed = input.trim()
    if (!trimmed) return '/health'
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }

  const hasWhitespaceInHealthPath = /\s/.test(healthPathInput)
  const isHealthPathValid =
    healthPathInput.trim().length > 0 && !hasWhitespaceInHealthPath
  const normalizedHealthPath = normalizeHealthPath(healthPathInput)
  const hasApiCheckHistory =
    apiCheckStatus !== 'idle' || apiCheckedAt !== null || apiLatencyMs !== null
  const checksWithError = apiRecentChecks.filter((item) => item.status === 'error').length
  const checksWithSuccess = apiRecentChecks.filter((item) => item.status === 'success').length

  const displayedHistory = useMemo(() => {
    const filtered = apiRecentChecks.filter((item) => {
      if (historyFilter === 'all') return true
      return item.status === historyFilter
    })

    const sorted = [...filtered]

    if (historySort === 'oldest') {
      sorted.reverse()
      return sorted
    }

    if (historySort === 'slowest') {
      sorted.sort((a, b) => {
        const latencyA = a.latencyMs ?? -1
        const latencyB = b.latencyMs ?? -1
        return latencyB - latencyA
      })
      return sorted
    }

    if (historySort === 'fastest') {
      sorted.sort((a, b) => {
        const latencyA = a.latencyMs ?? Number.MAX_SAFE_INTEGER
        const latencyB = b.latencyMs ?? Number.MAX_SAFE_INTEGER
        return latencyA - latencyB
      })
      return sorted
    }

    return sorted
  }, [apiRecentChecks, historyFilter, historySort])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const raw = window.localStorage.getItem(appEnvKeys.apiCheckSnapshot)
    if (raw === null) return

    try {
      const parsed = JSON.parse(raw) as Partial<ApiCheckHistoryItem>
      if (parsed.status !== 'success' && parsed.status !== 'error') return
      if (typeof parsed.message !== 'string') return
      if (typeof parsed.checkedAt !== 'string') return
      if (parsed.latencyMs !== null && typeof parsed.latencyMs !== 'number') return
      if (parsed.testedUrl !== null && typeof parsed.testedUrl !== 'string') return

      setApiCheckStatus(parsed.status)
      setApiCheckMessage(parsed.message)
      setApiLatencyMs(parsed.latencyMs ?? null)
      setApiCheckedAt(parsed.checkedAt)
      setApiCheckedUrl(parsed.testedUrl ?? null)
    } catch {
      window.localStorage.removeItem(appEnvKeys.apiCheckSnapshot)
    }

    const historyRaw = window.localStorage.getItem(appEnvKeys.apiCheckHistory)
    if (historyRaw === null) return

    try {
      const parsedHistory = JSON.parse(historyRaw)
      if (!Array.isArray(parsedHistory)) return

      const validItems = parsedHistory.filter((item): item is ApiCheckHistoryItem => {
        if (!item || typeof item !== 'object') return false
        if (item.status !== 'success' && item.status !== 'error') return false
        if (typeof item.message !== 'string') return false
        if (typeof item.checkedAt !== 'string') return false
        if (item.latencyMs !== null && typeof item.latencyMs !== 'number') return false
        if (item.testedUrl !== null && typeof item.testedUrl !== 'string') return false
        return true
      })

      setApiRecentChecks(validItems.slice(0, 5))
    } catch {
      window.localStorage.removeItem(appEnvKeys.apiCheckHistory)
    }
  }, [])

  function saveApiCheckSnapshot(snapshot: ApiCheckSnapshot, testedUrl: string | null) {
    if (typeof window === 'undefined') return

    const snapshotToStore: ApiCheckHistoryItem = {
      ...snapshot,
      testedUrl,
    }
    window.localStorage.setItem(
      appEnvKeys.apiCheckSnapshot,
      JSON.stringify(snapshotToStore),
    )

    const nextHistory = [snapshotToStore, ...apiRecentChecks].slice(0, 5)
    setApiRecentChecks(nextHistory)
    window.localStorage.setItem(appEnvKeys.apiCheckHistory, JSON.stringify(nextHistory))
  }

  function clearApiCheckSnapshot() {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(appEnvKeys.apiCheckSnapshot)
    window.localStorage.removeItem(appEnvKeys.apiCheckHistory)
    setApiCheckStatus('idle')
    setApiCheckMessage('Nenhum teste executado ainda.')
    setApiLatencyMs(null)
    setApiCheckedAt(null)
    setApiCheckedUrl(null)
    setApiRecentChecks([])
    setCopyStatus('idle')
    setDownloadStatus('idle')
  }

  function loadHistoryItem(item: ApiCheckHistoryItem) {
    setApiCheckStatus(item.status)
    setApiCheckMessage(item.message)
    setApiLatencyMs(item.latencyMs)
    setApiCheckedAt(item.checkedAt)
    setApiCheckedUrl(item.testedUrl)
    setCopyStatus('idle')
    setDownloadStatus('idle')
  }

  function removeHistoryItem(itemToRemove: ApiCheckHistoryItem) {
    if (typeof window === 'undefined') return

    const targetIndex = apiRecentChecks.findIndex((item) => {
      return (
        item.status === itemToRemove.status &&
        item.message === itemToRemove.message &&
        item.latencyMs === itemToRemove.latencyMs &&
        item.checkedAt === itemToRemove.checkedAt &&
        item.testedUrl === itemToRemove.testedUrl
      )
    })

    if (targetIndex < 0) return

    const nextHistory = apiRecentChecks.filter((_, index) => index !== targetIndex)
    setApiRecentChecks(nextHistory)

    if (nextHistory.length === 0) {
      window.localStorage.removeItem(appEnvKeys.apiCheckHistory)
    } else {
      window.localStorage.setItem(appEnvKeys.apiCheckHistory, JSON.stringify(nextHistory))
    }
  }

  async function copyApiCheckSnapshot() {
    if (typeof window === 'undefined' || !hasApiCheckHistory) return
    setDownloadStatus('idle')

    const payload = {
      mode: appEnv.useMockApi ? 'mock' : 'real',
      apiBaseUrl: appEnv.apiBaseUrl,
      healthCheckPath: normalizedHealthPath,
      status: apiCheckStatus,
      message: apiCheckMessage,
      latencyMs: apiLatencyMs,
      checkedAt: apiCheckedAt,
      testedUrl: apiCheckedUrl,
      recentChecks: apiRecentChecks,
    }

    try {
      await window.navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      setCopyStatus('done')
    } catch {
      setCopyStatus('error')
    }
  }

  function downloadApiCheckSnapshot() {
    if (typeof window === 'undefined' || !hasApiCheckHistory) return
    setCopyStatus('idle')

    const payload = {
      mode: appEnv.useMockApi ? 'mock' : 'real',
      apiBaseUrl: appEnv.apiBaseUrl,
      healthCheckPath: normalizedHealthPath,
      status: apiCheckStatus,
      message: apiCheckMessage,
      latencyMs: apiLatencyMs,
      checkedAt: apiCheckedAt,
      testedUrl: apiCheckedUrl,
      recentChecks: apiRecentChecks,
    }

    try {
      const fileContent = JSON.stringify(payload, null, 2)
      const blob = new Blob([fileContent], { type: 'application/json;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')

      link.href = url
      link.download = `crmlead-api-diagnostico-${stamp}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setDownloadStatus('done')
    } catch {
      setDownloadStatus('error')
    }
  }

  function applyApiModeOverride() {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(
      appEnvKeys.useMockApiOverride,
      selectedMode === 'mock' ? 'true' : 'false',
    )
    window.location.reload()
  }

  function resetApiModeOverride() {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(appEnvKeys.useMockApiOverride)
    window.location.reload()
  }

  function saveHealthPathOverride() {
    if (typeof window === 'undefined') return
    if (!isHealthPathValid) return

    const normalized = normalizeHealthPath(healthPathInput)
    window.localStorage.setItem(appEnvKeys.healthPathOverride, normalized)
    window.location.reload()
  }

  function resetHealthPathOverride() {
    if (typeof window === 'undefined') return

    window.localStorage.removeItem(appEnvKeys.healthPathOverride)
    window.location.reload()
  }

  async function testApiConnection() {
    if (!isHealthPathValid) {
      const checkedAt = new Date().toLocaleString('pt-BR')
      setApiCheckStatus('error')
      setApiCheckMessage('Endpoint de health invalido. Remova espacos e tente novamente.')
      setApiCheckedAt(checkedAt)
      setApiCheckedUrl(null)
      setApiLatencyMs(null)
      saveApiCheckSnapshot({
        status: 'error',
        message: 'Endpoint de health invalido. Remova espacos e tente novamente.',
        latencyMs: null,
        checkedAt,
      }, null)
      return
    }

    setApiCheckStatus('testing')
    setApiCheckMessage('Testando conectividade...')
    setApiLatencyMs(null)

    const cleanedBaseUrl = appEnv.apiBaseUrl.replace(/\/+$/, '')
    const candidates = [cleanedBaseUrl, `${cleanedBaseUrl}${normalizedHealthPath}`]

    for (const candidate of candidates) {
      const controller = new AbortController()
      const timeoutId = window.setTimeout(() => controller.abort(), 5000)
      const startedAt = performance.now()

      try {
        const response = await fetch(candidate, {
          method: 'GET',
          signal: controller.signal,
        })
        const elapsedMs = Math.round(performance.now() - startedAt)
        const checkedAt = new Date().toLocaleString('pt-BR')

        if (response.ok) {
          setApiCheckStatus('success')
          setApiCheckMessage(`Conexao OK em ${candidate} (HTTP ${response.status}).`)
          setApiLatencyMs(elapsedMs)
          setApiCheckedAt(checkedAt)
          setApiCheckedUrl(candidate)
          saveApiCheckSnapshot({
            status: 'success',
            message: `Conexao OK em ${candidate} (HTTP ${response.status}).`,
            latencyMs: elapsedMs,
            checkedAt,
          }, candidate)
          return
        }

        if (response.status < 500) {
          setApiCheckStatus('success')
          setApiCheckMessage(
            `Host respondeu em ${candidate} (HTTP ${response.status}). Ajuste a rota se necessario.`,
          )
          setApiLatencyMs(elapsedMs)
          setApiCheckedAt(checkedAt)
          setApiCheckedUrl(candidate)
          saveApiCheckSnapshot({
            status: 'success',
            message: `Host respondeu em ${candidate} (HTTP ${response.status}). Ajuste a rota se necessario.`,
            latencyMs: elapsedMs,
            checkedAt,
          }, candidate)
          return
        }
      } catch (error) {
        const isAbortError =
          error instanceof DOMException && error.name === 'AbortError'
        if (isAbortError) {
          const checkedAt = new Date().toLocaleString('pt-BR')
          const timeoutMessage =
            `Timeout ao conectar em ${candidate} (5s). Verifique disponibilidade da API.`
          setApiCheckStatus('error')
          setApiCheckMessage(timeoutMessage)
          setApiCheckedAt(checkedAt)
          setApiCheckedUrl(candidate)
          setApiLatencyMs(null)
          saveApiCheckSnapshot({
            status: 'error',
            message: timeoutMessage,
            latencyMs: null,
            checkedAt,
          }, candidate)
          return
        }
      } finally {
        window.clearTimeout(timeoutId)
      }
    }

    const checkedAt = new Date().toLocaleString('pt-BR')
    const genericErrorMessage =
      'Nao foi possivel conectar na API. Verifique se o backend esta ativo e liberado para CORS.'
    setApiCheckStatus('error')
    setApiCheckMessage(genericErrorMessage)
    setApiCheckedAt(checkedAt)
    setApiCheckedUrl(null)
    setApiLatencyMs(null)
    saveApiCheckSnapshot({
      status: 'error',
      message: genericErrorMessage,
      latencyMs: null,
      checkedAt,
    }, null)
  }

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">Setup</p>
        <h1>Arquitetura e organizacao do projeto</h1>
        <p className="subtitle">
          Stack atual: <strong>{projectMeta.stack}</strong>. Base preparada para iniciar backend sem acoplamento ao legado.
        </p>
      </header>

      <section className="setup-command">
        <article className="highlight-card highlight-ok">
          <p className="highlight-label">Progresso MVP</p>
          <strong className="highlight-value">{overallCompletion}%</strong>
          <p className="highlight-sub">Entrega acumulada no escopo atual.</p>
        </article>
        <article className="highlight-card">
          <p className="highlight-label">Restante estimado</p>
          <strong className="highlight-value">{overallRemaining}%</strong>
          <p className="highlight-sub">Backlog para chegar ao target planejado.</p>
        </article>
        <article className="highlight-card">
          <p className="highlight-label">Fonte ativa</p>
          <strong className="highlight-value">{appEnv.useMockApi ? 'Mock' : 'Real'}</strong>
          <p className="highlight-sub">Modo de dados utilizado na sessao atual.</p>
        </article>
        <article className={`highlight-card ${checksWithError > 0 ? 'highlight-warn' : 'highlight-ok'}`}>
          <p className="highlight-label">Diagnosticos API</p>
          <strong className="highlight-value">{apiRecentChecks.length}</strong>
          <p className="highlight-sub">{checksWithSuccess} sucesso(s) e {checksWithError} falha(s) recentes.</p>
        </article>
      </section>

      <section className="panel">
        <h2>Status de Entrega</h2>
        <p className="muted table-subtitle">
          Progresso estimado do MVP web: <strong>{overallCompletion}%</strong>.
          Falta aproximadamente <strong>{overallRemaining}%</strong> para ficar pronto
          no escopo atual.
        </p>
        <div className="progress-wrap" aria-label="Progresso geral do projeto">
          <div className="progress-fill" style={{ width: `${overallCompletion}%` }} />
        </div>
        <ul className="delivery-list">
          {deliveryStages.map((stage) => (
            <li key={stage.id}>
              <span>{stage.label}</span>
              <strong>{stage.percent}%</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Fonte de Dados (API)</h2>
        <p className="muted table-subtitle">
          Modo ativo: <strong>{appEnv.useMockApi ? 'Mock local' : 'Backend real'}</strong>. Base URL:{' '}
          <strong>{appEnv.apiBaseUrl}</strong>.
        </p>
        <div className="api-mode-row" role="radiogroup" aria-label="Selecionar modo da API">
          <label className="api-mode-option">
            <input
              type="radio"
              name="apiMode"
              checked={selectedMode === 'mock'}
              onChange={() => setSelectedMode('mock')}
            />
            <span>Mock local</span>
          </label>
          <label className="api-mode-option">
            <input
              type="radio"
              name="apiMode"
              checked={selectedMode === 'real'}
              onChange={() => setSelectedMode('real')}
            />
            <span>Backend real</span>
          </label>
        </div>
        <div className="api-mode-actions">
          <button type="button" className="agenda-btn" onClick={applyApiModeOverride}>
            Aplicar e recarregar
          </button>
          <button
            type="button"
            className="agenda-btn"
            onClick={resetApiModeOverride}
            disabled={!isOverrideActive}
          >
            Voltar ao padrao .env
          </button>
          <button
            type="button"
            className="agenda-btn"
            onClick={testApiConnection}
            disabled={apiCheckStatus === 'testing' || !isHealthPathValid}
          >
            {apiCheckStatus === 'testing' ? 'Testando...' : 'Testar conexao API'}
          </button>
        </div>
        <div className="health-path-row">
          <label className="health-path-field" htmlFor="healthPathInput">
            Endpoint health-check
            <input
              id="healthPathInput"
              className="search-input"
              type="text"
              value={healthPathInput}
              onChange={(event) => setHealthPathInput(event.target.value)}
              placeholder="/health"
            />
          </label>
          <p
            className={`health-path-hint ${isHealthPathValid ? 'health-path-ok' : 'health-path-error'}`}
          >
            {isHealthPathValid
              ? `Valor final aplicado: ${normalizedHealthPath}`
              : 'Endpoint invalido: informe um caminho sem espacos (ex.: /health).'}
          </p>
          <div className="api-mode-actions">
            <button
              type="button"
              className="agenda-btn"
              onClick={saveHealthPathOverride}
              disabled={!isHealthPathValid}
            >
              Salvar endpoint
            </button>
            <button
              type="button"
              className="agenda-btn"
              onClick={resetHealthPathOverride}
              disabled={!isHealthPathOverrideActive}
            >
              Resetar endpoint
            </button>
          </div>
        </div>
        <p
          className={`api-check-message api-check-${apiCheckStatus}`}
          role="status"
          aria-live="polite"
        >
          {apiCheckMessage}
        </p>
        {(apiCheckedAt !== null || apiLatencyMs !== null) && (
          <p className="api-check-meta muted">
            {apiCheckedAt !== null ? `Ultima checagem: ${apiCheckedAt}. ` : ''}
            {apiLatencyMs !== null ? `Latencia estimada: ${apiLatencyMs} ms.` : ''}
            {apiCheckedUrl !== null ? `URL testada: ${apiCheckedUrl}.` : ''}
          </p>
        )}
        <div className="api-mode-actions">
          <button
            type="button"
            className="agenda-btn"
            onClick={copyApiCheckSnapshot}
            disabled={!hasApiCheckHistory || apiCheckStatus === 'testing'}
          >
            Copiar diagnostico (JSON)
          </button>
          <button
            type="button"
            className="agenda-btn"
            onClick={downloadApiCheckSnapshot}
            disabled={!hasApiCheckHistory || apiCheckStatus === 'testing'}
          >
            Baixar diagnostico (JSON)
          </button>
          <button
            type="button"
            className="agenda-btn btn-danger-soft"
            onClick={clearApiCheckSnapshot}
            disabled={!hasApiCheckHistory}
          >
            Limpar historico do diagnostico
          </button>
        </div>
        {copyStatus === 'done' && (
          <p className="api-copy-feedback api-copy-success">Diagnostico copiado para a area de transferencia.</p>
        )}
        {copyStatus === 'error' && (
          <p className="api-copy-feedback api-copy-error">Nao foi possivel copiar automaticamente neste navegador.</p>
        )}
        {downloadStatus === 'done' && (
          <p className="api-copy-feedback api-copy-success">Arquivo JSON do diagnostico foi baixado.</p>
        )}
        {downloadStatus === 'error' && (
          <p className="api-copy-feedback api-copy-error">Nao foi possivel gerar o arquivo JSON neste navegador.</p>
        )}
        {apiRecentChecks.length > 0 && (
          <div className="api-history-block">
            <h3>Historico recente de checagens</h3>
            <div className="history-toolbar">
              <label htmlFor="historyFilter">
                Filtro
                <select
                  id="historyFilter"
                  className="stage-select"
                  value={historyFilter}
                  onChange={(event) =>
                    setHistoryFilter(event.target.value as HistoryFilter)
                  }
                >
                  <option value="all">Todos</option>
                  <option value="success">Somente sucesso</option>
                  <option value="error">Somente falha</option>
                </select>
              </label>
              <label htmlFor="historySort">
                Ordenacao
                <select
                  id="historySort"
                  className="stage-select"
                  value={historySort}
                  onChange={(event) => setHistorySort(event.target.value as HistorySort)}
                >
                  <option value="newest">Mais recente</option>
                  <option value="oldest">Mais antigo</option>
                  <option value="slowest">Maior latencia</option>
                  <option value="fastest">Menor latencia</option>
                </select>
              </label>
            </div>
            <p className="muted history-meta">
              Exibindo {displayedHistory.length} de {apiRecentChecks.length} checagens.
            </p>
            <ul className="api-history-list">
              {displayedHistory.map((item, index) => (
                <li key={`${item.checkedAt}-${index}-${item.message}`} className="api-history-card">
                  <div className="api-history-head">
                    <span className={historyStatusClass(item.status)}>
                      {formatHistoryStatusLabel(item.status)}
                    </span>
                    <span className="history-meta-chip">{item.latencyMs !== null ? `${item.latencyMs} ms` : 'latencia indisponivel'}</span>
                  </div>
                  <p className="history-meta-row">{item.checkedAt}</p>
                  <p className="history-url">{item.testedUrl ?? 'URL nao registrada'}</p>
                  <p className="history-message">{item.message}</p>
                  <div className="history-actions">
                    <button
                      type="button"
                      className="agenda-btn history-load-btn"
                      onClick={() => loadHistoryItem(item)}
                    >
                      Carregar no resumo
                    </button>
                    <button
                      type="button"
                      className="agenda-btn btn-danger-soft"
                      onClick={() => removeHistoryItem(item)}
                    >
                      Remover item
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {displayedHistory.length === 0 && (
              <div className="empty-state history-empty" role="status" aria-live="polite">
                <p className="empty-state-title">Sem checagens para este filtro</p>
                <p className="empty-state-subtitle">
                  Altere filtro ou ordenacao para revisar outras execucoes salvas.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Estrutura de Pastas</h2>
        <ul className="list">
          {folders.map((item) => (
            <li key={item.name}>
              <strong>{item.name}</strong>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel grid-two">
        <article>
          <h2>Diretrizes de Linguagem</h2>
          <ul className="bullets">
            <li>TypeScript strict para reduzir erros em runtime.</li>
            <li>Arquitetura por camadas para facilitar manutencao.</li>
            <li>Separacao clara entre legado e base nova.</li>
          </ul>
        </article>
        <article>
          <h2>Proximos Passos Tecnicos</h2>
          <ol className="steps">
            {nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </section>
    </main>
  )
}
