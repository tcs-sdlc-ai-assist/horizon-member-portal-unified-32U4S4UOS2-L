import { useState, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header'
import NavigationMenu from '@/components/layout/NavigationMenu'
import SessionWarningModal from '@/components/common/SessionWarningModal'
import { InstrumentationProvider } from '@/context/InstrumentationProvider'
import { NotificationProvider } from '@/context/NotificationContext'
import { WidgetProvider } from '@/context/WidgetContext'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { A11Y } from '@/constants/constants'

/**
 * Authenticated application layout shell component.
 *
 * Wraps all authenticated pages with the global Header, NavigationMenu
 * sidebar, session timeout management, and context providers. Renders
 * the routed page content via React Router's <Outlet /> within the main
 * content area. Uses Honeybee CSS page layout classes (.page-sidebar,
 * .page-content, .fluid-wrapper, .page-section) for responsive layout.
 *
 * Includes:
 * - InstrumentationProvider for Glassbox analytics and privacy masking
 * - NotificationProvider for notification state management
 * - WidgetProvider for dashboard widget preferences
 * - Header with search, support actions, notifications, and user menu
 * - NavigationMenu sidebar with collapsible navigation
 * - SessionWarningModal for session timeout warnings
 * - Skip-to-content accessibility support via the Header component
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the layout container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * // Used as a route layout element
 * <Route element={<AppLayout />}>
 *   <Route path="/" element={<Dashboard />} />
 *   <Route path="/claims" element={<Claims />} />
 * </Route>
 *
 * @example
 * <AppLayout testId="app-layout" />
 */
function AppLayout({ className = '', testId }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const {
    isWarningVisible,
    formattedRemainingTime,
    remainingTime,
    extendSession,
    logout,
  } = useSessionTimeout()

  /**
   * Toggles the mobile sidebar open/closed state.
   */
  const handleMenuToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  /**
   * Handles sidebar toggle from the NavigationMenu component.
   */
  const handleSidebarToggle = useCallback((value) => {
    setIsSidebarOpen(value)
  }, [])

  /**
   * Closes the mobile sidebar when a navigation item is clicked.
   */
  const handleNavigate = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

  return (
    <InstrumentationProvider>
      <NotificationProvider>
        <WidgetProvider>
          <div
            className={`min-h-screen bg-surface-secondary ${className}`.trim()}
            data-testid={testId || 'app-layout'}
          >
            {/* Navigation sidebar */}
            <NavigationMenu
              isOpen={isSidebarOpen}
              onToggle={handleSidebarToggle}
              onNavigate={handleNavigate}
              testId={testId ? `${testId}-nav` : 'app-layout-nav'}
            />

            {/* Header */}
            <Header
              onMenuToggle={handleMenuToggle}
              isSidebarOpen={isSidebarOpen}
              testId={testId ? `${testId}-header` : 'app-layout-header'}
            />

            {/* Main content area */}
            <main
              id={A11Y.skipNavId}
              className="page-content"
              role="main"
              data-testid={testId ? `${testId}-main` : 'app-layout-main'}
            >
              <div className="fluid-wrapper page-section">
                <Outlet />
              </div>
            </main>

            {/* Session timeout warning modal */}
            <SessionWarningModal
              isOpen={isWarningVisible}
              formattedRemainingTime={formattedRemainingTime}
              remainingTime={remainingTime}
              onExtendSession={extendSession}
              onLogout={logout}
              testId={testId ? `${testId}-session-warning` : 'app-layout-session-warning'}
            />
          </div>
        </WidgetProvider>
      </NotificationProvider>
    </InstrumentationProvider>
  )
}

export default AppLayout

export { AppLayout }