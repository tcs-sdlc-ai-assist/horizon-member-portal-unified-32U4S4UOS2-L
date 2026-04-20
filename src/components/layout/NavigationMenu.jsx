import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS, BRANDING } from '@/constants/constants'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'
import { getSidebarCollapsed, setSidebarCollapsed } from '@/utils/storage'

/**
 * Icon mapping for navigation menu items.
 * Maps icon name strings from NAV_ITEMS to inline SVG elements.
 */
const NAV_ICON_MAP = {
  home: (
    <svg
      className="w-5 h-5 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  shield: (
    <svg
      className="w-5 h-5 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  'file-text': (
    <svg
      className="w-5 h-5 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  heart: (
    <svg
      className="w-5 h-5 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  'dollar-sign': (
    <svg
      className="w-5 h-5 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  folder: (
    <svg
      className="w-5 h-5 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  mail: (
    <svg
      className="w-5 h-5 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  'help-circle': (
    <svg
      className="w-5 h-5 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
}

/**
 * Returns the SVG icon element for a given nav item icon name.
 * @param {string} iconName - The icon name from NAV_ITEMS.
 * @returns {React.ReactNode} The icon element.
 */
const getNavIcon = (iconName) => NAV_ICON_MAP[iconName] || NAV_ICON_MAP['home']

/**
 * Left sidebar navigation component for the Horizon Member Portal.
 *
 * Renders the primary navigation menu items with icons, active state
 * highlighting via React Router NavLink, and responsive behavior. On
 * mobile viewports the sidebar is hidden by default and toggled via a
 * hamburger button. Includes full ARIA navigation landmark support,
 * keyboard navigation, and Honeybee CSS styling.
 *
 * Supports a collapsed mode that shows only icons (persisted to
 * localStorage). The sidebar overlay on mobile closes when clicking
 * outside or pressing Escape.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {boolean} [props.isOpen] - Controlled open state for mobile sidebar (overrides internal state).
 * @param {function} [props.onToggle] - Callback invoked when the sidebar open state changes.
 * @param {function} [props.onNavigate] - Callback invoked when a navigation item is clicked.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <NavigationMenu />
 *
 * @example
 * <NavigationMenu
 *   isOpen={isSidebarOpen}
 *   onToggle={setIsSidebarOpen}
 *   onNavigate={() => setIsSidebarOpen(false)}
 * />
 */
function NavigationMenu({
  className = '',
  isOpen: controlledIsOpen,
  onToggle,
  onNavigate,
  testId,
}) {
  const location = useLocation()
  const sidebarRef = useRef(null)
  const toggleButtonRef = useRef(null)

  const isControlled = controlledIsOpen !== undefined

  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => getSidebarCollapsed())

  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const [ids] = useState(() => ({
    nav: generateAriaId('hb-nav'),
    label: generateAriaId('hb-nav-label'),
    toggle: generateAriaId('hb-nav-toggle'),
  }))

  /**
   * Updates the open state, calling the controlled callback or internal setter.
   */
  const setIsOpen = useCallback(
    (value) => {
      const nextValue = typeof value === 'function' ? value(isOpen) : value

      if (isControlled && typeof onToggle === 'function') {
        onToggle(nextValue)
      } else {
        setInternalIsOpen(nextValue)
      }
    },
    [isControlled, isOpen, onToggle],
  )

  /**
   * Toggles the mobile sidebar open/closed.
   */
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      announceToScreenReader(
        next ? 'Navigation menu opened' : 'Navigation menu closed',
        { priority: 'polite' },
      )
      return next
    })
  }, [setIsOpen])

  /**
   * Closes the mobile sidebar.
   */
  const closeSidebar = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  /**
   * Toggles the collapsed (icon-only) state on desktop.
   */
  const handleCollapseToggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev
      setSidebarCollapsed(next)
      announceToScreenReader(
        next ? 'Navigation collapsed to icons' : 'Navigation expanded',
        { priority: 'polite' },
      )
      return next
    })
  }, [])

  /**
   * Handles a navigation item click.
   */
  const handleNavItemClick = useCallback(() => {
    // Close mobile sidebar on navigation
    closeSidebar()

    if (typeof onNavigate === 'function') {
      onNavigate()
    }
  }, [closeSidebar, onNavigate])

  /**
   * Handles keyboard events on the sidebar.
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        closeSidebar()

        if (toggleButtonRef.current) {
          toggleButtonRef.current.focus()
        }
      }
    },
    [isOpen, closeSidebar],
  )

  /**
   * Closes the mobile sidebar when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        closeSidebar()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, closeSidebar])

  /**
   * Locks body scroll when mobile sidebar is open.
   */
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalOverflow
      }
    }

    return undefined
  }, [isOpen])

  /**
   * Determines if a nav item is currently active based on the route.
   */
  const isActiveRoute = useCallback(
    (route) => {
      if (route === '/') {
        return location.pathname === '/'
      }
      return location.pathname.startsWith(route)
    },
    [location.pathname],
  )

  /**
   * Computes the active nav item count for screen reader context.
   */
  const activeItemLabel = useMemo(() => {
    const activeItem = NAV_ITEMS.find((item) => isActiveRoute(item.route))
    return activeItem ? activeItem.label : 'Dashboard'
  }, [isActiveRoute])

  return (
    <>
      {/* Mobile hamburger toggle button */}
      <button
        ref={toggleButtonRef}
        id={ids.toggle}
        type="button"
        className="lg:hidden fixed top-3 left-3 z-overlay hb-btn-icon hb-btn-ghost text-neutral-700 hover:text-neutral-900 bg-surface-primary/90 backdrop-blur-sm border border-neutral-200 rounded-md"
        onClick={handleToggle}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls={ids.nav}
        data-testid={testId ? `${testId}-toggle` : 'navigation-menu-toggle'}
      >
        {isOpen ? (
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

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
          data-testid={testId ? `${testId}-overlay` : 'navigation-menu-overlay'}
        />
      )}

      {/* Sidebar navigation */}
      <aside
        ref={sidebarRef}
        id={ids.nav}
        className={`page-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''} ${className}`.trim()}
        onKeyDown={handleKeyDown}
        data-testid={testId || 'navigation-menu'}
      >
        <nav
          aria-label="Main navigation"
          className="flex flex-col h-full"
        >
          {/* Hidden label for accessibility */}
          <span id={ids.label} className="hb-sr-only">
            Main navigation — currently on {activeItemLabel}
          </span>

          {/* Logo / brand area */}
          {/* Logo / brand area */}
          <div className={`flex items-center border-b border-neutral-200 ${isCollapsed ? 'justify-center px-2 py-4' : 'px-4 py-4'}`}>
            {isCollapsed ? (
              <div className="h-8 w-auto rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden py-1">
                {/* FIX: Removed 'w-8' fixed width. Let the logo scale its width automatically based on the 'h-8' height. */}
                <img src={BRANDING.logoSmallUrl} alt={BRANDING.logoAltText} className="h-full w-auto object-contain" />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* FIX: Removed 'w-8' and background color so the rectangular logo has room to breathe natively. */}
                <div className="h-8 w-auto rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden py-1">
                  <img src={BRANDING.logoUrl} alt={BRANDING.logoAltText} className="h-full w-auto object-contain" />
                </div>
                <div className="flex flex-col min-w-0 justify-center">
                  <span className="text-sm font-bold text-neutral-900 hb-text-truncate leading-tight">
                    Horizon
                  </span>
                  <span className="text-xs text-neutral-500 hb-text-truncate leading-tight">
                    Member Portal
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation items */}
          <div className="flex-1 overflow-y-auto hb-scrollable py-2">
            <ul className="flex flex-col gap-0.5 px-2" role="list">
              {NAV_ITEMS.map((item) => {
                const icon = getNavIcon(item.icon)
                const isActive = isActiveRoute(item.route)

                return (
                  <li key={item.id} role="listitem">
                    <NavLink
                      to={item.route}
                      onClick={handleNavItemClick}
                      className={({ isActive: navLinkActive }) => {
                        const active = navLinkActive || isActive
                        return `flex items-center gap-3 rounded-md transition-colors duration-150 group ${
                          isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                        } ${
                          active
                            ? 'bg-hb-primary/10 text-hb-primary font-medium'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        }`.trim()
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      title={isCollapsed ? item.label : undefined}
                      data-testid={
                        testId
                          ? `${testId}-item-${item.id}`
                          : `navigation-menu-item-${item.id}`
                      }
                    >
                      {/* Icon */}
                      <span
                        className={`flex-shrink-0 ${
                          isActive
                            ? 'text-hb-primary'
                            : 'text-neutral-400 group-hover:text-neutral-600'
                        }`}
                      >
                        {icon}
                      </span>

                      {/* Label */}
                      {!isCollapsed && (
                        <span className="text-sm hb-text-truncate">
                          {item.label}
                        </span>
                      )}

                      {/* Active indicator */}
                      {isActive && !isCollapsed && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-hb-primary flex-shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Collapse toggle (desktop only) */}
          <div className="hidden lg:flex items-center border-t border-neutral-200 px-2 py-3">
            <button
              type="button"
              className={`hb-btn-icon hb-btn-ghost text-neutral-400 hover:text-neutral-600 w-full ${
                isCollapsed ? 'justify-center' : 'justify-start px-3'
              }`}
              onClick={handleCollapseToggle}
              aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              data-testid={
                testId
                  ? `${testId}-collapse-toggle`
                  : 'navigation-menu-collapse-toggle'
              }
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
              {!isCollapsed && (
                <span className="text-xs font-medium ml-2">Collapse</span>
              )}
            </button>
          </div>
        </nav>

        {/* Screen reader live region for navigation state */}
        <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
          {isOpen ? 'Navigation menu is open' : ''}
        </div>
      </aside>
    </>
  )
}

export default NavigationMenu

export { NavigationMenu }