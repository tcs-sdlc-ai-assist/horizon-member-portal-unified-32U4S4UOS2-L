import { useAuth } from '@/context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Authentication route guard component.
 *
 * Checks AuthContext `isAuthenticated` state and redirects unauthenticated
 * users to the login page, preserving the attempted location for redirect
 * after successful login. Optionally enforces admin role access for
 * admin-only routes via the `requireAdmin` prop.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The child route content to render when authenticated.
 * @param {boolean} [props.requireAdmin=false] - Whether the route requires admin role access.
 * @param {string} [props.redirectTo='/login'] - The path to redirect unauthenticated users to.
 * @param {string} [props.adminRedirectTo='/'] - The path to redirect non-admin users to when requireAdmin is true.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * // Basic authenticated route
 * <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
 *   <Route path="/" element={<Dashboard />} />
 * </Route>
 *
 * @example
 * // Admin-only route
 * <Route
 *   path="/admin"
 *   element={
 *     <ProtectedRoute requireAdmin>
 *       <AdminPanelPage />
 *     </ProtectedRoute>
 *   }
 * />
 *
 * @example
 * // Custom redirect paths
 * <ProtectedRoute redirectTo="/signin" adminRedirectTo="/dashboard">
 *   <SensitivePage />
 * </ProtectedRoute>
 */
function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = '/login',
  adminRedirectTo = '/',
  testId,
}) {
  const { isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  // Redirect unauthenticated users to the login page, preserving the
  // attempted location so they can be redirected back after login.
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
        data-testid={testId ? `${testId}-redirect-login` : 'protected-route-redirect-login'}
      />
    )
  }

  // Redirect non-admin users away from admin-only routes.
  if (requireAdmin && !isAdmin) {
    return (
      <Navigate
        to={adminRedirectTo}
        replace
        data-testid={testId ? `${testId}-redirect-admin` : 'protected-route-redirect-admin'}
      />
    )
  }

  return children
}

export default ProtectedRoute

export { ProtectedRoute }