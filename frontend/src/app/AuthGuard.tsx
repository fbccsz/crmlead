import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthSession } from '../features/auth/useAuthSession'

export function AuthGuard() {
  const { loading, session } = useAuthSession()
  const location = useLocation()

  if (loading) {
    return (
      <main className="layout">
        <section className="panel">
          <h2>Carregando sessao...</h2>
        </section>
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
