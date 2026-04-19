import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import Dashboard from '@/pages/DashboardPage'
import BenefitsPage from '@/pages/BenefitsPage'
import ClaimsPage from '@/pages/ClaimsPage'
import ClaimDetailPage from '@/pages/ClaimDetailPage'
import ClaimSubmissionPage from '@/pages/ClaimSubmissionPage'
import IdCardsPage from '@/pages/IdCardsPage'
import DocumentCenterPage from '@/pages/DocumentCenterPage'
import NotificationsPage from '@/pages/NotificationsPage'
import GetCarePage from '@/pages/GetCarePage'
import WellnessPage from '@/pages/WellnessPage'
import PrescriptionsPage from '@/pages/PrescriptionsPage'
import SettingsPage from '@/pages/SettingsPage'
import AdminPanelPage from '@/pages/AdminPanelPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'

/**
 * Application router configuration component.
 *
 * Defines all application routes including the public login route,
 * authenticated routes wrapped with ProtectedRoute and AppLayout,
 * admin-only routes, and a 404 catch-all. Uses React Router v6
 * with BrowserRouter for client-side routing.
 *
 * Route structure:
 * - /login — Public login page (no auth required)
 * - / — Dashboard (authenticated)
 * - /benefits — Benefits & Coverage page (authenticated)
 * - /claims — Claims list page (authenticated)
 * - /claims/submit — Claim submission form (authenticated)
 * - /claims/:claimId — Claim detail page (authenticated)
 * - /coverage — ID Cards & Coverage page (authenticated)
 * - /spending — Spending / Deductible page (authenticated, reuses DeductibleOopSummary via Dashboard)
 * - /documents — Document Center page (authenticated)
 * - /messages — Notifications / Messages page (authenticated)
 * - /support — Get Care / Support page (authenticated)
 * - /wellness — Wellness page placeholder (authenticated)
 * - /prescriptions — Prescriptions page placeholder (authenticated)
 * - /settings — Settings page placeholder (authenticated)
 * - /profile — Profile page placeholder (authenticated, reuses SettingsPage)
 * - /admin — Admin Panel (authenticated, admin role required)
 * - * — 404 Not Found catch-all
 *
 * @example
 * <AppRouter />
 */
function AppRouter() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            {/* Public route — Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated routes — wrapped with ProtectedRoute and AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Benefits & Coverage */}
              <Route path="/benefits" element={<BenefitsPage />} />

              {/* Claims */}
              <Route path="/claims" element={<ClaimsPage />} />
              <Route path="/claims/submit" element={<ClaimSubmissionPage />} />
              <Route path="/claims/:claimId" element={<ClaimDetailPage />} />

              {/* Coverage / ID Cards */}
              <Route path="/coverage" element={<IdCardsPage />} />

              {/* Spending — renders the Dashboard with spending focus */}
              <Route path="/spending" element={<Dashboard />} />

              {/* Document Center */}
              <Route path="/documents" element={<DocumentCenterPage />} />

              {/* Messages & Notifications */}
              <Route path="/messages" element={<NotificationsPage />} />

              {/* Get Care / Support */}
              <Route path="/support" element={<GetCarePage />} />

              {/* Wellness (placeholder) */}
              <Route path="/wellness" element={<WellnessPage />} />

              {/* Prescriptions (placeholder) */}
              <Route path="/prescriptions" element={<PrescriptionsPage />} />

              {/* Settings (placeholder) */}
              <Route path="/settings" element={<SettingsPage />} />

              {/* Profile (placeholder — reuses Settings page) */}
              <Route path="/profile" element={<SettingsPage />} />

              {/* Admin Panel (admin role required) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPanelPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default AppRouter

export { AppRouter }