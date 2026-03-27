import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import { AuthGuard } from './AuthGuard'
import { AppLayout } from './AppLayout'
import { RoleGuard } from './RoleGuard'
import { ErrorBoundary } from './ErrorBoundary'
import './styles.css'
import { AuthSessionProvider } from '../features/auth/useAuthSession'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'

// Lazy load páginas pesadas
const AgendaPage = lazy(() => import('../pages/AgendaPage').then(m => ({ default: m.AgendaPage })))
const LeadsPage = lazy(() => import('../pages/LeadsPage').then(m => ({ default: m.LeadsPage })))
const PipelinePage = lazy(() => import('../pages/PipelinePage').then(m => ({ default: m.PipelinePage })))
const ProjectSetupPage = lazy(() => import('../pages/ProjectSetupPage').then(m => ({ default: m.ProjectSetupPage })))

function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '14px',
        color: '#666',
      }}
    >
      Carregando...
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthSessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route
                  path="/agenda"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AgendaPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/leads"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <LeadsPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/pipeline"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <PipelinePage />
                    </Suspense>
                  }
                />
                <Route element={<RoleGuard allow={['gestor']} />}>
                  <Route
                    path="/setup"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <ProjectSetupPage />
                      </Suspense>
                    }
                  />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthSessionProvider>
    </ErrorBoundary>
  )
}
