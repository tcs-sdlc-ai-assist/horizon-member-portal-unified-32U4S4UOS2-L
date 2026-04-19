import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEventTagger } from '@/hooks/useEventTagger'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'
import { getInitials } from '@/utils/formatters'

/**
 * User profile dropdown menu component for the portal header.
 *
 * Displays the current user's avatar (initials) and name with a dropdown
 * menu containing navigation items. Menu items include Settings (always
 * visible), Admin Panel (visible only for admin role), and Logout.
 * Consumes AuthContext for user info, role checking, and logout functionality.
 * Styled with Honeybee CSS classes.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.size='md'] - Size variant: 'sm', 'md', 'lg'.
 * @param {boolean} [props.showName=true] - Whether to display the user's name next to the avatar.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <UserMenu />
 *
 * @example
 * <UserMenu size="sm" showName={false} className="ml-2" />
 */
function UserMenu({
  className = '',
  size = 'md',
  showName = true,
  testId,
}) {
  const navigate = useNavigate()
  const { currentUser, isAdmin, logout } = useAuth()
  const { tagEvent } = useEventTagger()

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)

  const [ids] = useState(() => ({
    button: generateAriaId('hb-user-menu-btn'),
    dropdown: generateAriaId('hb-user-menu-dropdown'),
    label: generateAriaId('hb-user-menu-label'),
  }))

  /**
   * Computes the user's display name.
   */
  const displayName = useMemo(() => {
    if (!currentUser) {
      return ''
    }

    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`
    }

    return currentUser.firstName || currentUser.lastName || 'User'
  }, [currentUser])

  /**
   * Computes the user's initials for the avatar.
   */
  const initials = useMemo(() => getInitials(displayName), [displayName])

  /**
   * Toggles the dropdown open/closed.
   */
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        announceToScreenReader('User menu opened', { priority: 'polite' })
      }
      return next
    })
  }, [])

  /**
   * Closes the dropdown.
   */
  const closeDropdown = useCallback(() => {
    setIsOpen(false)
    if (buttonRef.current) {
      buttonRef.current.focus()
    }
  }, [])

  /**
   * Handles navigation to Settings.
   */
  const handleSettings = useCallback(() => {
    tagEvent('page_view', { page: 'settings', source: 'user_menu' })
    navigate('/settings')
    closeDropdown()
  }, [navigate, closeDropdown, tagEvent])

  /**
   * Handles navigation to Profile.
   */
  const handleProfile = useCallback(() => {
    tagEvent('page_view', { page: 'profile', source: 'user_menu' })
    navigate('/profile')
    closeDropdown()
  }, [navigate, closeDropdown, tagEvent])

  /**
   * Handles navigation to Admin Panel (placeholder).
   */
  const handleAdminPanel = useCallback(() => {
    tagEvent('page_view', { page: 'admin', source: 'user_menu' })
    navigate('/admin')
    closeDropdown()
  }, [navigate, closeDropdown, tagEvent])

  /**
   * Handles the logout action.
   */
  const handleLogout = useCallback(() => {
    tagEvent('page_view', { page: 'logout', source: 'user_menu' })
    closeDropdown()
    logout()
    announceToScreenReader('You have been logged out', { priority: 'assertive' })
  }, [logout, closeDropdown, tagEvent])

  /**
   * Handles keyboard events on the dropdown.
   */
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDropdown()
      }
    },
    [closeDropdown],
  )

  /**
   * Closes dropdown when clicking outside the container.
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  /**
   * Size class mapping for the avatar.
   */
  const avatarSizeClassMap = {
    sm: 'hb-avatar-xs',
    md: 'hb-avatar-sm',
    lg: 'hb-avatar-md',
  }

  const avatarSizeClass = avatarSizeClassMap[size] || avatarSizeClassMap.md

  const nameSizeClassMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const nameSizeClass = nameSizeClassMap[size] || nameSizeClassMap.md

  if (!currentUser) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`.trim()}
      onKeyDown={handleKeyDown}
      data-testid={testId || 'user-menu'}
    >
      {/* Hidden label for accessibility */}
      <span id={ids.label} className="hb-sr-only">
        User menu
      </span>

      {/* Trigger button */}
      <button
        ref={buttonRef}
        id={ids.button}
        type="button"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-hb-accent focus-visible:ring-offset-2 focus-visible:outline-none"
        onClick={handleToggle}
        aria-label={`User menu for ${displayName}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? ids.dropdown : undefined}
        aria-haspopup="true"
        aria-labelledby={ids.label}
        data-testid={testId ? `${testId}-button` : 'user-menu-button'}
      >
        {/* Avatar */}
        <span
          className={avatarSizeClass}
          aria-hidden="true"
          data-testid={testId ? `${testId}-avatar` : 'user-menu-avatar'}
        >
          {initials}
        </span>

        {/* Name */}
        {showName && (
          <span
            className={`${nameSizeClass} font-medium text-neutral-700 hidden sm:inline-block hb-text-truncate max-w-[8rem]`}
            data-testid={testId ? `${testId}-name` : 'user-menu-name'}
          >
            {displayName}
          </span>
        )}

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id={ids.dropdown}
          className="absolute right-0 top-full mt-2 w-56 bg-surface-primary rounded-lg border border-neutral-200 py-1 overflow-hidden"
          style={{ boxShadow: 'var(--hb-shadow-dropdown)', zIndex: 'var(--hb-z-dropdown)' }}
          role="menu"
          aria-label="User menu"
          data-testid={testId ? `${testId}-dropdown` : 'user-menu-dropdown'}
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-neutral-200">
            <p
              className="text-sm font-semibold text-neutral-900 hb-text-truncate"
              data-testid={testId ? `${testId}-display-name` : 'user-menu-display-name'}
            >
              {displayName}
            </p>
            {currentUser.email && (
              <p
                className="text-xs text-neutral-500 mt-0.5 hb-text-truncate"
                data-testid={testId ? `${testId}-email` : 'user-menu-email'}
              >
                {currentUser.email}
              </p>
            )}
            {currentUser.memberId && (
              <p className="text-2xs text-neutral-400 mt-1">
                Member ID: {currentUser.memberId}
              </p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            {/* Profile */}
            <button
              type="button"
              className="hb-dropdown-item w-full"
              role="menuitem"
              onClick={handleProfile}
              data-testid={testId ? `${testId}-profile` : 'user-menu-profile'}
            >
              <svg
                className="w-4 h-4 text-neutral-400 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </button>

            {/* Settings */}
            <button
              type="button"
              className="hb-dropdown-item w-full"
              role="menuitem"
              onClick={handleSettings}
              data-testid={testId ? `${testId}-settings` : 'user-menu-settings'}
            >
              <svg
                className="w-4 h-4 text-neutral-400 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Settings
            </button>

            {/* Admin Panel (admin role only) */}
            {isAdmin && (
              <button
                type="button"
                className="hb-dropdown-item w-full"
                role="menuitem"
                onClick={handleAdminPanel}
                data-testid={testId ? `${testId}-admin` : 'user-menu-admin'}
              >
                <svg
                  className="w-4 h-4 text-neutral-400 flex-shrink-0"
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
                Admin Panel
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="hb-dropdown-divider" />

          {/* Logout */}
          <div className="py-1">
            <button
              type="button"
              className="hb-dropdown-item w-full text-error"
              role="menuitem"
              onClick={handleLogout}
              data-testid={testId ? `${testId}-logout` : 'user-menu-logout'}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {isOpen ? 'User menu expanded' : ''}
      </div>
    </div>
  )
}

export default UserMenu

export { UserMenu }