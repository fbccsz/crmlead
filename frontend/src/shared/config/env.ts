interface AppEnv {
  apiBaseUrl: string
  useMockApi: boolean
  defaultUseMockApi: boolean
  healthCheckPath: string
  defaultHealthCheckPath: string
  httpTimeoutMs: number
  httpRetryCount: number
  sessionTtlMinutes: number
}

export const appEnvKeys = {
  useMockApiOverride: 'crmlead.useMockApi',
  healthPathOverride: 'crmlead.apiHealthPath',
  apiCheckSnapshot: 'crmlead.apiCheckSnapshot',
  apiCheckHistory: 'crmlead.apiCheckHistory',
} as const

function parseBoolean(input: string | undefined, fallback: boolean): boolean {
  if (input === undefined) return fallback
  return ['1', 'true', 'yes', 'on'].includes(input.toLowerCase())
}

function parseInteger(input: string | undefined, fallback: number): number {
  if (input === undefined) return fallback
  const parsed = Number.parseInt(input, 10)
  if (Number.isNaN(parsed) || parsed < 0) return fallback
  return parsed
}

function readUseMockOverride(): boolean | undefined {
  if (typeof window === 'undefined') return undefined

  const raw = window.localStorage.getItem(appEnvKeys.useMockApiOverride)
  if (raw === null) return undefined

  return parseBoolean(raw, true)
}

function resolveUseMockApi(defaultValue: boolean): boolean {
  const override = readUseMockOverride()
  if (override !== undefined) return override
  return defaultValue
}

function normalizeHealthPath(input: string | undefined, fallback: string): string {
  const trimmed = input?.trim()
  if (!trimmed) return fallback

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function readHealthPathOverride(): string | undefined {
  if (typeof window === 'undefined') return undefined

  const raw = window.localStorage.getItem(appEnvKeys.healthPathOverride)
  if (raw === null) return undefined

  return normalizeHealthPath(raw, '/health')
}

function resolveHealthPath(defaultValue: string): string {
  const override = readHealthPathOverride()
  if (override !== undefined) return override
  return defaultValue
}

const defaultUseMockApi = parseBoolean(import.meta.env.VITE_USE_MOCK_API, true)
const defaultHealthCheckPath = normalizeHealthPath(
  import.meta.env.VITE_API_HEALTH_PATH,
  '/health',
)
const defaultHttpTimeoutMs = parseInteger(import.meta.env.VITE_HTTP_TIMEOUT_MS, 8000)
const defaultHttpRetryCount = parseInteger(import.meta.env.VITE_HTTP_RETRY_COUNT, 1)
const defaultSessionTtlMinutes = parseInteger(import.meta.env.VITE_SESSION_TTL_MINUTES, 480)

export const appEnv: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api',
  useMockApi: resolveUseMockApi(defaultUseMockApi),
  defaultUseMockApi,
  healthCheckPath: resolveHealthPath(defaultHealthCheckPath),
  defaultHealthCheckPath,
  httpTimeoutMs: defaultHttpTimeoutMs,
  httpRetryCount: defaultHttpRetryCount,
  sessionTtlMinutes: defaultSessionTtlMinutes,
}
