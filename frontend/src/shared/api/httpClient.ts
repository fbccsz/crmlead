type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface HttpClientOptions {
  timeoutMs?: number
  retryCount?: number
}

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export class HttpClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly retryCount: number
  private readonly cache = new Map<string, CacheEntry<unknown>>()
  private readonly cacheDefaultTtlMs = 60 * 1000 // 1 minuto

  constructor(baseUrl: string, options?: HttpClientOptions) {
    this.baseUrl = baseUrl
    this.timeoutMs = options?.timeoutMs ?? 8000
    this.retryCount = options?.retryCount ?? 1
  }

  private getCacheKey(path: string): string {
    return `${this.baseUrl}:${path}`
  }

  private getCached<T>(path: string): T | null {
    const key = this.getCacheKey(path)
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.data
  }

  private setCached<T>(path: string, data: T): void {
    const key = this.getCacheKey(path)
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.cacheDefaultTtlMs,
    })
  }

  private clearCache(path: string): void {
    const key = this.getCacheKey(path)
    this.cache.delete(key)
  }

  private async wait(ms: number): Promise<void> {
    await new Promise((resolve) => window.setTimeout(resolve, ms))
  }

  private async performRequest(
    path: string,
    method: HttpMethod,
    body?: unknown,
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      return await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })
    } catch (error) {
      const isAbortError = error instanceof DOMException && error.name === 'AbortError'
      if (isAbortError) {
        throw new Error(`Timeout da requisicao apos ${this.timeoutMs}ms`)
      }

      // Detectar erro de conectividade
      const isNetworkError =
        error instanceof TypeError &&
        (error.message.includes('Failed to fetch') || error.message.includes('network'))

      if (isNetworkError) {
        throw new Error(`Erro de conectividade: verifique sua conexao com a internet`)
      }

      throw error
    } finally {
      window.clearTimeout(timeoutId)
    }
  }

  async request<TResponse>(
    path: string,
    method: HttpMethod,
    body?: unknown,
  ): Promise<TResponse> {
    // Verificar cache para GETs
    if (method === 'GET') {
      const cached = this.getCached<TResponse>(path)
      if (cached !== null) return cached
    }

    let attempt = 0
    let lastError: unknown = null

    while (attempt <= this.retryCount) {
      try {
        const response = await this.performRequest(path, method, body)

        if (!response.ok) {
          const detail = await response.text()
          const errorMsg = `HTTP ${response.status}: ${detail || 'Falha na requisicao'}`

          // Nao fazer retry em erros de cliente (4xx) exceto timeout/conexao
          if (response.status >= 400 && response.status < 500) {
            throw new Error(errorMsg)
          }

          // Retry em erros de servidor (5xx)
          throw new Error(errorMsg)
        }

        if (response.status === 204) {
          return undefined as TResponse
        }

        const responseText = await response.text()
        if (!responseText) {
          return undefined as TResponse
        }

        const parsed = JSON.parse(responseText) as TResponse

        // Cache resultado para GETs
        if (method === 'GET') {
          this.setCached(path, parsed)
        }

        return parsed
      } catch (error) {
        lastError = error
        const isTimeoutError =
          error instanceof Error && error.message.includes('Timeout')
        const isNetworkError =
          error instanceof Error && error.message.includes('conectividade')

        // Nao fazer retry em erros de validacao ou autenticacao
        if (
          error instanceof Error &&
          (error.message.includes('401') || error.message.includes('403'))
        ) {
          throw error
        }

        // So fazer retry em timeout, erro de rede ou erro 5xx
        if (!isTimeoutError && !isNetworkError && !lastError?.toString().includes('5')) {
          if (attempt >= this.retryCount) break
        }

        if (attempt >= this.retryCount) break

        const retryDelay = 300 * (attempt + 1)
        await this.wait(retryDelay)
      }

      attempt += 1
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Falha na requisicao HTTP')
  }

  get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>(path, 'GET')
  }

  post<TResponse>(path: string, body?: unknown): Promise<TResponse> {
    // Limpar cache relacionado após POST
    const relatedPath = path.split('?')[0]
    if (relatedPath.includes('list') || relatedPath.includes('get')) {
      this.cache.forEach((_, key) => {
        if (key.includes(relatedPath)) {
          this.cache.delete(key)
        }
      })
    }
    return this.request<TResponse>(path, 'POST', body)
  }

  patch<TResponse>(path: string, body?: unknown): Promise<TResponse> {
    // Limpar cache após PATCH
    this.clearCache(path)
    return this.request<TResponse>(path, 'PATCH', body)
  }

  invalidateCache(path?: string): void {
    if (path) {
      this.clearCache(path)
    } else {
      this.cache.clear()
    }
  }
}
