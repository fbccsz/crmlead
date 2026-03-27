import { NavLink, Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { useAuthSession } from '../features/auth/useAuthSession'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/agenda', label: 'Agenda' },
  { to: '/leads', label: 'Leads' },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/setup', label: 'Setup', role: 'gestor' as const },
]

export function AppLayout() {
  const navigate = useNavigate()
  const { session, logout } = useAuthSession()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1 className="brand">CRMLead</h1>
        <p className="brand-sub">Frontend TypeScript</p>
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
        <Outlet />
      </div>
    </div>
  )
}
