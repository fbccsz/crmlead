import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthSession } from '../features/auth/useAuthSession'

type DemoProfile = 'corretor' | 'gestor'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuthSession()

  const [email, setEmail] = useState('corretor@crmlead.local')
  const [password, setPassword] = useState('123456')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const disabled = useMemo(
    () => submitting || loading || !email.trim() || !password.trim(),
    [email, loading, password, submitting],
  )

  const emailLooksValid = useMemo(() => {
    const value = email.trim()
    return value.length > 3 && value.includes('@') && value.includes('.')
  }, [email])

  const credentialsReady = emailLooksValid && password.trim().length >= 4

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await login(email.trim(), password.trim())
      navigate('/')
    } finally {
      setSubmitting(false)
    }
  }

  function applyDemoProfile(profile: DemoProfile) {
    if (profile === 'gestor') {
      setEmail('gestor@crmlead.local')
      setPassword('123456')
      return
    }

    setEmail('corretor@crmlead.local')
    setPassword('123456')
  }

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <p className="eyebrow">CRMLead</p>
        <h1>Entrar no CRM</h1>
        <p className="subtitle">
          Plataforma comercial com autenticacao pronta para operacao real.
        </p>

        <div className={`auth-readiness ${credentialsReady ? 'auth-readiness-ok' : 'auth-readiness-warn'}`}>
          <span className="auth-readiness-dot" aria-hidden="true" />
          <p>
            {credentialsReady
              ? 'Credenciais com formato valido para login.'
              : 'Preencha e-mail valido e senha para liberar o acesso.'}
          </p>
        </div>

        <div className="auth-quick-profiles" aria-label="Perfis rapidos para demo">
          <button
            className="auth-ghost-btn"
            type="button"
            onClick={() => applyDemoProfile('corretor')}
          >
            Usar perfil corretor
          </button>
          <button
            className="auth-ghost-btn"
            type="button"
            onClick={() => applyDemoProfile('gestor')}
          >
            Usar perfil gestor
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@crmlead.com"
              autoComplete="username"
            />
          </label>

          {!emailLooksValid && email.trim().length > 0 ? (
            <p className="auth-inline-warning">Informe um e-mail valido para continuar.</p>
          ) : null}

          <label>
            Senha
            <div className="auth-password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-toggle-pass"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>

          <button className="auth-btn" type="submit" disabled={disabled || !emailLooksValid}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {error ? <p className="error">Falha: {error}</p> : null}

        <ul className="auth-guidelines" aria-label="Orientacoes de acesso demo">
          <li>Perfil corretor: corretor@crmlead.local</li>
          <li>Perfil gestor: gestor@crmlead.local</li>
          <li>Senha demo padrao: 123456</li>
        </ul>

        <p className="muted">
          Dica demo: qualquer senha funciona. Se o e-mail contiver "gestor", o perfil
          de acesso sera gestor.
        </p>
      </section>
    </main>
  )
}
