import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthSession } from '../features/auth/useAuthSession'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuthSession()

  const [email, setEmail] = useState('corretor@crmlead.local')
  const [password, setPassword] = useState('123456')
  const [submitting, setSubmitting] = useState(false)

  const disabled = useMemo(
    () => submitting || loading || !email.trim() || !password.trim(),
    [email, loading, password, submitting],
  )

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

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <p className="eyebrow">CRMLead</p>
        <h1>Entrar no CRM</h1>
        <p className="subtitle">Ambiente de autenticacao pronto para backend real.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="auth-btn" type="submit" disabled={disabled}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {error ? <p className="error">Falha: {error}</p> : null}

        <p className="muted">
          Dica demo: use qualquer e-mail e senha. Se o e-mail contiver "gestor",
          o papel sera gestor.
        </p>
      </section>
    </main>
  )
}
