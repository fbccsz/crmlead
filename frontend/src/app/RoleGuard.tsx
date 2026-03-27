import { Navigate, Outlet } from 'react-router-dom'

import { useAuthSession } from '../features/auth/useAuthSession'
import type { UserSession } from '../shared/types/auth'

interface RoleGuardProps {
  allow: Array<UserSession['role']>
}

export function RoleGuard({ allow }: RoleGuardProps) {
  const { session } = useAuthSession()

  if (!session) return <Navigate to="/login" replace />

  if (!allow.includes(session.role)) {
    return (
      <main className="layout">
        <section className="panel">
          <h2>Acesso restrito</h2>
          <p className="muted">
            Seu perfil atual nao possui permissao para acessar esta area.
          </p>
        </section>
      </main>
    )
  }

  return <Outlet />
}
