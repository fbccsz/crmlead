// Coleta de métricas de performance e diagnóstico

interface PerformanceMetrics {
  navigationTiming: {
    dnsMs: number
    tcpMs: number
    ttfbMs: number
    downloadMs: number
  }
  resourceMetrics: {
    totalResources: number
    cachedResources: number
    largestContentfulPaint?: number
  }
  coreWebVitals: {
    cls?: number // Cumulative Layout Shift
    fid?: number // First Input Delay
    lcp?: number // Largest Contentful Paint
  }
}

export function collectPerformanceMetrics(): Partial<PerformanceMetrics> {
  if (typeof window === 'undefined' || !window.performance) {
    return {}
  }

  const metrics: Partial<PerformanceMetrics> = {}

  // Navigation timing (se disponível)
  const perfData = window.performance.getEntriesByType('navigation')[0]
  if (perfData instanceof PerformanceNavigationTiming) {
    const dnsLookup = perfData.domainLookupEnd - perfData.domainLookupStart
    const tcpConnection = perfData.connectEnd - perfData.connectStart
    const ttfb = perfData.responseStart - perfData.fetchStart
    const download = perfData.responseEnd - perfData.responseStart

    metrics.navigationTiming = {
      dnsMs: Math.round(dnsLookup),
      tcpMs: Math.round(tcpConnection),
      ttfbMs: Math.round(ttfb),
      downloadMs: Math.round(download),
    }
  }

  // Resource timing
  const resources = window.performance.getEntriesByType('resource')
  metrics.resourceMetrics = {
    totalResources: resources.length,
    cachedResources: resources.filter((r) => (r as PerformanceResourceTiming).transferSize === 0)
      .length,
  }

  return metrics
}

export function getMetricsForDisplay(): Record<string, string | number> {
  const metrics = collectPerformanceMetrics()
  const display: Record<string, string | number> = {}

  if (metrics.navigationTiming) {
    const { dnsMs, tcpMs, ttfbMs, downloadMs } = metrics.navigationTiming
    const totalMs = dnsMs + tcpMs + ttfbMs + downloadMs
    display['networkTotalMs'] = totalMs
    display['cachedResourcesCount'] = metrics.resourceMetrics?.cachedResources ?? 0
  }

  return display
}
