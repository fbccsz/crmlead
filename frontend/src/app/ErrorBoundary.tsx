import React from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary capturou:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    // Log para storage para debugging
    try {
      const logs = JSON.parse(localStorage.getItem('crmlead_error_logs') || '[]')
      logs.push({
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
      })
      if (logs.length > 10) logs.shift() // manter ultimos 10
      localStorage.setItem('crmlead_error_logs', JSON.stringify(logs))
    } catch {
      // noop
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#d32f2f',
              fontFamily: 'system-ui',
            }}
          >
            <h2>Ops! Algo deu errado</h2>
            <p>{this.state.error?.message || 'Erro desconhecido'}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.5rem 1rem',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Recarregar pagina
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
