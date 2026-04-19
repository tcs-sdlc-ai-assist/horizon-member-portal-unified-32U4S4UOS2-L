import { useCallback } from 'react'
import Logo from '@/components/common/Logo'
import SearchBar from '@/components/layout/SearchBar'
import SupportActions from '@/components/layout/SupportActions'
import NotificationIcon from '@/components/layout/NotificationIcon'
import UserMenu from '@/components/layout/UserMenu'
import { useAuth } from '@/context/AuthContext'
import { A11Y } from '@/constants/constants'

/**
 * Global header component for the Horizon Member Portal.
 *
 * Renders a fixed-position header bar containing the Logo, SearchBar,
 * SupportActions, NotificationIcon, and UserMenu components. Provides
 * responsive layout with Honeybee CSS classes — on mobile viewports the
 * search bar collapses and support action labels are hidden. Includes a
 * skip-to-content link for keyboard accessibility.
 *
 * The header is always visible and sits above the page content area. It
 * coordinates with the NavigationMenu sidebar via the onMenuToggle callback
 * to trigger the mobile hamburger menu.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the header container.
 * @param {function} [props.onMenuToggle] - Callback invoked when the mobile menu toggle is clicked.
 * @param {boolean} [props.isSidebarOpen] - Whether the mobile sidebar is currently open.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <Header />
 *
 * @example
 * <Header
 *   onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
 *   isSidebarOpen={isSidebarOpen}
 * />
 *
 * @example
 * <Header className="border-b-2" testId="portal-header" />
 */
function Header({
  className = '',
  onMenuToggle,
  isSidebarOpen = false,
  testId,
}) {
  const { isAuthenticated } = useAuth()

  /**
   * Handles the skip-to-content link activation.
   */
  const handleSkipToContent = useCallback((event) => {
    event.preventDefault()

    const mainContent = document.getElementById(A11Y.skipNavId)

    if (mainContent) {
      if (!mainContent.hasAttribute('tabindex')) {
        mainContent.setAttribute('tabindex', '-1')
      }

      try {
        mainContent.focus({ preventScroll: false })
      } catch (_error) {
        // Silently fail if focus cannot be set
      }
    }
  }, [])

  /**
   * Handles the mobile menu toggle button click.
   */
  const handleMenuToggle = useCallback(() => {
    if (typeof onMenuToggle === 'function') {
      onMenuToggle()
    }
  }, [onMenuToggle])

  return (
    <>
      {/* Skip to content link — visible only on keyboard focus */}
      <a
        href={`#${A11Y.skipNavId}`}
        className="hb-sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-toast focus-visible:px-4 focus-visible:py-2 focus-visible:bg-hb-primary focus-visible:text-white focus-visible:rounded-md focus-visible:text-sm focus-visible:font-medium focus-visible:shadow-lg focus-visible:outline-none"
        onClick={handleSkipToContent}
        data-testid={testId ? `${testId}-skip-link` : 'header-skip-link'}
      >
        {A11Y.skipNavLabel}
      </a>

      {/* Header bar */}
      <header
        className={`fixed top-0 right-0 left-0 lg:left-[var(--hb-sidebar-width)] bg-surface-primary/95 backdrop-blur-sm border-b border-neutral-200 z-sticky ${className}`.trim()}
        style={{ height: 'var(--hb-header-height)' }}
        role="banner"
        data-testid={testId || 'header'}
      >
        <div className="flex items-center justify-between h-full px-4 sm:px-6 gap-3">
          {/* Left section: Mobile menu toggle + Logo (mobile only) + Search */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile menu toggle button */}
            <button
              type="button"
              className="lg:hidden hb-btn-icon hb-btn-ghost text-neutral-600 hover:text-neutral-800 flex-shrink-0"
              onClick={handleMenuToggle}
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isSidebarOpen}
              data-testid={testId ? `${testId}-menu-toggle` : 'header-menu-toggle'}
            >
              {isSidebarOpen ? (
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

            {/* Logo — visible only on mobile (sidebar has logo on desktop) */}
            <div className="lg:hidden flex-shrink-0">
              <Logo
                variant="small"
                linkToDashboard
                testId={testId ? `${testId}-logo` : 'header-logo'}
              />
            </div>

            {/* Search bar — hidden on small mobile, visible on sm+ */}
            {isAuthenticated && (
              <div className="hidden sm:block flex-1 max-w-md">
                <SearchBar
                  size="sm"
                  placeholder="Search the portal..."
                  testId={testId ? `${testId}-search` : 'header-search'}
                />
              </div>
            )}
          </div>

          {/* Right section: Support actions, Notifications, User menu */}
          {isAuthenticated && (
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Support actions — labels hidden on mobile */}
              <div className="hidden md:flex">
                <SupportActions
                  size="sm"
                  showLabels
                  testId={testId ? `${testId}-support` : 'header-support'}
                />
              </div>

              {/* Support actions — icon only on mobile */}
              <div className="flex md:hidden">
                <SupportActions
                  size="sm"
                  showLabels={false}
                  testId={testId ? `${testId}-support-mobile` : 'header-support-mobile'}
                />
              </div>

              {/* Divider */}
              <div className="hb-divider-vertical h-6 mx-1 hidden sm:block" aria-hidden="true" />

              {/* Notifications */}
              <NotificationIcon
                size="sm"
                testId={testId ? `${testId}-notifications` : 'header-notifications'}
              />

              {/* User menu */}
              <UserMenu
                size="sm"
                showName
                testId={testId ? `${testId}-user-menu` : 'header-user-menu'}
              />
            </div>
          )}
        </div>

        {/* Mobile search bar — visible only on xs screens when authenticated */}
        {isAuthenticated && (
          <div className="sm:hidden px-4 pb-2 border-t border-neutral-100 bg-surface-primary">
            <SearchBar
              size="sm"
              placeholder="Search..."
              testId={testId ? `${testId}-search-mobile` : 'header-search-mobile'}
            />
          </div>
        )}
      </header>
    </>
  )
}

export default Header

export { Header }