import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/context/NotificationContext'
import { useEventTagger } from '@/hooks/useEventTagger'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'
import { formatDate } from '@/utils/formatters'
import { NOTIFICATION_TYPE_ICONS } from '@/constants/constants'

/**
 * Maps notification type icon names to inline SVG elements.
 */
const ICON_MAP = {
  'info': (
    <svg
      className="w-4 h-4 text-info flex-shrink-0"
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
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  'check-circle': (
    <svg
      className="w-4 h-4 text-success flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  'alert-triangle': (
    <svg
      className="w-4 h-4 text-warning flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  'alert-circle': (
    <svg
      className="w-4 h-4 text-error flex-shrink-0"
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
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  'file-text': (
    <svg
      className="w-4 h-4 text-info flex-shrink-0"
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
  'shield': (
    <svg
      className="w-4 h-4 text-hb-primary flex-shrink-0"
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
  'folder': (
    <svg
      className="w-4 h-4 text-hb-secondary flex-shrink-0"
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
  'mail': (
    <svg
      className="w-4 h-4 text-hb-accent flex-shrink-0"
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
  'dollar-sign': (
    <svg
      className="w-4 h-4 text-warning flex-shrink-0"
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
  'calendar': (
    <svg
      className="w-4 h-4 text-hb-accent flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  'clipboard': (
    <svg
      className="w-4 h-4 text-hb-primary flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  'settings': (
    <svg
      className="w-4 h-4 text-neutral-500 flex-shrink-0"
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
  ),
}

/**
 * Returns the SVG icon element for a given notification type.
 * @param {string} type - The notification type key.
 * @returns {React.ReactNode} The icon element.
 */
const getNotificationIcon = (type) => {
  const iconName = NOTIFICATION_TYPE_ICONS[type]
  return ICON_MAP[iconName] || ICON_MAP['info']
}

/**
 * Formats a notification timestamp into a relative or short date string.
 * @param {string} timestamp - ISO timestamp string.
 * @returns {string} Formatted time string.
 */
const formatNotificationTime = (timestamp) => {
  if (!timestamp) {
    return ''
  }

  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMinutes < 1) {
      return 'Just now'
    }

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    }

    if (diffHours < 24) {
      return `${diffHours}h ago`
    }

    if (diffDays < 7) {
      return `${diffDays}d ago`
    }

    return formatDate(date, { preset: 'short' })
  } catch (_error) {
    return ''
  }
}

/**
 * Maximum number of notifications to display in the dropdown.
 */
const MAX_VISIBLE_NOTIFICATIONS = 8

/**
 * Header notification bell icon with unread count badge and dropdown panel.
 *
 * Clicking the bell icon opens a dropdown panel showing recent notifications
 * with unread/read styling, notification type icons, timestamps, and a
 * mark-all-read button. Consumes NotificationContext for notification data
 * and state management. Styled with Honeybee CSS classes.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.size='md'] - Size variant: 'sm', 'md', 'lg'.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <NotificationIcon />
 *
 * @example
 * <NotificationIcon size="sm" className="ml-2" />
 */
function NotificationIcon({
  className = '',
  size = 'md',
  testId,
}) {
  const navigate = useNavigate()
  const { tagNotificationOpened } = useEventTagger()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)

  const [ids] = useState(() => ({
    button: generateAriaId('hb-notif-btn'),
    dropdown: generateAriaId('hb-notif-dropdown'),
    label: generateAriaId('hb-notif-label'),
  }))

  /**
   * Sorted and limited notifications for display.
   */
  const visibleNotifications = useMemo(() => {
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    )
    return sorted.slice(0, MAX_VISIBLE_NOTIFICATIONS)
  }, [notifications])

  /**
   * Toggles the dropdown open/closed.
   */
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      if (next) {
        announceToScreenReader(
          `Notifications panel opened. ${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}.`,
          { priority: 'polite' },
        )
      }
      return next
    })
  }, [unreadCount])

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
   * Handles clicking a notification item.
   */
  const handleNotificationClick = useCallback(
    (notification) => {
      if (!notification.isRead) {
        markAsRead(notification.id)
      }

      tagNotificationOpened({
        notificationId: notification.id,
        notificationType: notification.type,
      })

      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }

      closeDropdown()
    },
    [markAsRead, tagNotificationOpened, navigate, closeDropdown],
  )

  /**
   * Handles the mark all as read action.
   */
  const handleMarkAllRead = useCallback(() => {
    markAllRead()
    announceToScreenReader('All notifications marked as read', { priority: 'polite' })
  }, [markAllRead])

  /**
   * Handles the "View All" action.
   */
  const handleViewAll = useCallback(() => {
    navigate('/messages')
    closeDropdown()
  }, [navigate, closeDropdown])

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
   * Size class mapping for the bell icon button.
   */
  const buttonSizeClassMap = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-10 h-10',
  }

  const iconSizeClassMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const buttonSizeClass = buttonSizeClassMap[size] || buttonSizeClassMap.md
  const iconSizeClass = iconSizeClassMap[size] || iconSizeClassMap.md

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`.trim()}
      onKeyDown={handleKeyDown}
      data-testid={testId || 'notification-icon'}
    >
      {/* Hidden label for accessibility */}
      <span id={ids.label} className="hb-sr-only">
        Notifications
      </span>

      {/* Bell icon button */}
      <button
        ref={buttonRef}
        id={ids.button}
        type="button"
        className={`hb-btn-icon hb-btn-ghost relative ${buttonSizeClass} text-neutral-600 hover:text-neutral-800 transition-colors duration-150`.trim()}
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? ids.dropdown : undefined}
        aria-haspopup="true"
        aria-labelledby={ids.label}
        data-testid={testId ? `${testId}-button` : 'notification-icon-button'}
      >
        {/* Bell SVG */}
        <svg
          className={iconSizeClass}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 text-2xs font-bold rounded-full bg-error text-white ring-2 ring-surface-primary"
            aria-hidden="true"
            data-testid={testId ? `${testId}-badge` : 'notification-icon-badge'}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          id={ids.dropdown}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface-primary rounded-lg border border-neutral-200 overflow-hidden"
          style={{ boxShadow: 'var(--hb-shadow-dropdown)', zIndex: 'var(--hb-z-dropdown)' }}
          role="region"
          aria-label="Notifications"
          data-testid={testId ? `${testId}-dropdown` : 'notification-icon-dropdown'}
        >
          {/* Dropdown header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-surface-secondary">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="hb-badge-sm hb-badge-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs font-medium text-hb-primary hover:text-hb-primary-light transition-colors duration-150"
                onClick={handleMarkAllRead}
                data-testid={
                  testId
                    ? `${testId}-mark-all-read`
                    : 'notification-icon-mark-all-read'
                }
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div
            className="max-h-96 hb-scrollable"
            role="list"
            aria-label="Recent notifications"
            data-testid={
              testId ? `${testId}-list` : 'notification-icon-list'
            }
          >
            {visibleNotifications.length === 0 ? (
              <div className="hb-empty-state py-8">
                <svg
                  className="w-10 h-10 text-neutral-300 mb-3"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p className="text-sm text-neutral-500">No notifications</p>
                <p className="text-xs text-neutral-400 mt-1">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              visibleNotifications.map((notification) => {
                const icon = getNotificationIcon(notification.type)
                const timeDisplay = formatNotificationTime(notification.timestamp)

                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`flex items-start gap-3 w-full px-4 py-3 text-left transition-colors duration-150 border-b border-neutral-100 last:border-b-0 ${
                      notification.isRead
                        ? 'bg-surface-primary hover:bg-neutral-50'
                        : 'bg-info-light/30 hover:bg-info-light/50'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                    role="listitem"
                    aria-label={`${notification.isRead ? '' : 'Unread: '}${notification.title}. ${timeDisplay}`}
                    data-testid={
                      testId
                        ? `${testId}-item-${notification.id}`
                        : `notification-icon-item-${notification.id}`
                    }
                  >
                    {/* Icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm leading-snug ${
                            notification.isRead
                              ? 'font-medium text-neutral-700'
                              : 'font-semibold text-neutral-900'
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span
                            className="inline-block w-2 h-2 rounded-full bg-hb-accent flex-shrink-0 mt-1.5"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5 hb-text-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-2xs text-neutral-400">
                          {timeDisplay}
                        </span>
                        {notification.actionLabel && (
                          <>
                            <span className="text-neutral-300" aria-hidden="true">·</span>
                            <span className="text-2xs font-medium text-hb-primary">
                              {notification.actionLabel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Dropdown footer */}
          {visibleNotifications.length > 0 && (
            <div className="border-t border-neutral-200 bg-surface-secondary">
              <button
                type="button"
                className="w-full px-4 py-2.5 text-sm font-medium text-hb-primary hover:text-hb-primary-light hover:bg-neutral-50 transition-colors duration-150 text-center"
                onClick={handleViewAll}
                data-testid={
                  testId
                    ? `${testId}-view-all`
                    : 'notification-icon-view-all'
                }
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Screen reader live region for unread count */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {unreadCount > 0
          ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
          : 'No unread notifications'}
      </div>
    </div>
  )
}

export default NotificationIcon

export { NotificationIcon }