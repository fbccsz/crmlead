import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { useAuthSession } from '../features/auth/useAuthSession'
import { appEnv } from '../shared/config/env'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/agenda', label: 'Agenda' },
  { to: '/leads', label: 'Leads' },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/setup', label: 'Setup', role: 'gestor' as const },
]

function resolveCurrentPage(pathname: string): string {
  if (pathname === '/') return 'Dashboard'

  const match = navItems
    .filter((item) => item.to !== '/')
    .find((item) => pathname.startsWith(item.to))

  return match?.label ?? 'Painel'
}

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, logout } = useAuthSession()
  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const currentPage = resolveCurrentPage(location.pathname)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Pular para conteudo principal
      </a>

      <aside className="sidebar">
        <h1 className="brand">CRMLead</h1>
        <p className="brand-sub">Frontend TypeScript</p>
        <div className="sidebar-meta-row">
          <span className={`sidebar-chip ${appEnv.useMockApi ? 'chip-warn' : 'chip-good'}`}>
            API: {appEnv.useMockApi ? 'Mock' : 'Real'}
          </span>
          <span className="sidebar-chip chip-neutral">Perfil: {session?.role ?? 'usuario'}</span>
        </div>
        <nav className="menu" aria-label="Navegacao principal">
          {navItems
            .filter((item) => !item.role || item.role === session?.role)
            .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `menu-item${isActive ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
            ))}
        </nav>

        <div className="sidebar-footer">
          <div>
            <p className="brand-sub">Sessao ativa</p>
            <strong className="session-name">{session?.name ?? 'Usuario'}</strong>
            <p className="session-role">Perfil: {session?.role ?? 'desconhecido'}</p>
          </div>
          <button className="logout-btn" type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      <div className="content-area">
        <header className="content-topbar" aria-label="Contexto da sessao">
          <p className="content-topbar-item content-topbar-emphasis">Pagina: {currentPage}</p>
          <p className="content-topbar-item">Data: {todayLabel}</p>
          <p className="content-topbar-item">Usuario: {session?.name ?? 'Usuario'}</p>
          <p className="content-topbar-item">Perfil: {session?.role ?? 'desconhecido'}</p>
        </header>
        <div id="main-content" className="content-main" tabIndex={-1}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
