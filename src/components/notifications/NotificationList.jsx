import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/context/NotificationContext'
import { useEventTagger } from '@/hooks/useEventTagger'
import { formatDate } from '@/utils/formatters'
import { announceToScreenReader } from '@/utils/accessibility'
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_ICONS,
} from '@/constants/constants'

/**
 * Maps notification type icon names to inline SVG elements.
 */
const ICON_MAP = {
  info: (
    <svg
      className="w-5 h-5 text-info flex-shrink-0"
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
      className="w-5 h-5 text-success flex-shrink-0"
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
      className="w-5 h-5 text-warning flex-shrink-0"
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
      className="w-5 h-5 text-error flex-shrink-0"
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
      className="w-5 h-5 text-info flex-shrink-0"
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
  shield: (
    <svg
      className="w-5 h-5 text-hb-primary flex-shrink-0"
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
  folder: (
    <svg
      className="w-5 h-5 text-hb-secondary flex-shrink-0"
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
      className="w-5 h-5 text-hb-accent flex-shrink-0"
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
      className="w-5 h-5 text-warning flex-shrink-0"
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
  calendar: (
    <svg
      className="w-5 h-5 text-hb-accent flex-shrink-0"
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
  clipboard: (
    <svg
      className="w-5 h-5 text-hb-primary flex-shrink-0"
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
  settings: (
    <svg
      className="w-5 h-5 text-neutral-500 flex-shrink-0"
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
  return ICON_MAP[iconName] || ICON_MAP.info
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
 * Maps notification type to a badge color class.
 * @param {string} type - The notification type key.
 * @returns {string} Badge CSS class.
 */
const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'claim_update':
      return 'hb-badge-info'
    case 'document_available':
      return 'hb-badge-primary'
    case 'benefit_change':
      return 'hb-badge-accent'
    case 'message_received':
      return 'hb-badge-secondary'
    case 'payment_due':
      return 'hb-badge-warning'
    case 'appointment_reminder':
      return 'hb-badge-success'
    case 'prior_auth_update':
      return 'hb-badge-primary'
    case 'success':
      return 'hb-badge-success'
    case 'warning':
      return 'hb-badge-warning'
    case 'error':
      return 'hb-badge-error'
    case 'system':
      return 'hb-badge-neutral'
    case 'info':
    default:
      return 'hb-badge-info'
  }
}

/**
 * Filter options for the notification list.
 */
const FILTER_OPTIONS = [
  { value: 'all', label: 'All Notifications' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

/**
 * Full notifications list page component.
 *
 * Displays all notifications with unread/read visual states, timestamps,
 * and message content. Includes mark-all-read button at top. Consumes
 * NotificationContext for notification data and state management. Styled
 * with Honeybee CSS list/card classes.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <NotificationList />
 *
 * @example
 * <NotificationList className="mt-4" testId="messages-page-notifications" />
 */
function NotificationList({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagNotificationOpened } = useEventTagger()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    markAsUnread,
  } = useNotifications()

  const [filter, setFilter] = useState('all')

  /**
   * Sorted notifications — most recent first.
   */
  const sortedNotifications = useMemo(() => {
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    )

    if (filter === 'unread') {
      return sorted.filter((n) => !n.isRead)
    }

    if (filter === 'read') {
      return sorted.filter((n) => n.isRead)
    }

    return sorted
  }, [notifications, filter])

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
        source: 'notification_list',
      })

      if (notification.actionUrl) {
        navigate(notification.actionUrl)
      }
    },
    [markAsRead, tagNotificationOpened, navigate],
  )

  /**
   * Handles keyboard activation on a notification item.
   */
  const handleNotificationKeyDown = useCallback(
    (event, notification) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleNotificationClick(notification)
      }
    },
    [handleNotificationClick],
  )

  /**
   * Handles the mark all as read action.
   */
  const handleMarkAllRead = useCallback(() => {
    markAllRead()
    announceToScreenReader('All notifications marked as read', { priority: 'polite' })
  }, [markAllRead])

  /**
   * Handles toggling read/unread state for a single notification.
   */
  const handleToggleRead = useCallback(
    (event, notification) => {
      event.stopPropagation()

      if (notification.isRead) {
        markAsUnread(notification.id)
        announceToScreenReader(`${notification.title} marked as unread`, { priority: 'polite' })
      } else {
        markAsRead(notification.id)
        announceToScreenReader(`${notification.title} marked as read`, { priority: 'polite' })
      }
    },
    [markAsRead, markAsUnread],
  )

  /**
   * Handles filter change.
   */
  const handleFilterChange = useCallback((event) => {
    const newFilter = event.target.value
    setFilter(newFilter)

    const label = FILTER_OPTIONS.find((o) => o.value === newFilter)?.label || newFilter
    announceToScreenReader(`Showing ${label.toLowerCase()}`, { priority: 'polite' })
  }, [])

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'notification-list'}
    >
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-hb-primary"
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
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Notifications</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {notifications.length} total · {unreadCount} unread
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter select */}
          <select
            className="hb-select text-sm py-2 px-3"
            value={filter}
            onChange={handleFilterChange}
            aria-label="Filter notifications"
            data-testid={
              testId
                ? `${testId}-filter`
                : 'notification-list-filter'
            }
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Mark all read button */}
          {unreadCount > 0 && (
            <button
              type="button"
              className="hb-btn-sm hb-btn-outline-secondary"
              onClick={handleMarkAllRead}
              aria-label="Mark all notifications as read"
              data-testid={
                testId
                  ? `${testId}-mark-all-read`
                  : 'notification-list-mark-all-read'
              }
            >
              <svg
                className="w-4 h-4"
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
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      {sortedNotifications.length === 0 ? (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-empty` : 'notification-list-empty'}
        >
          <div className="hb-card-body">
            <div className="hb-empty-state py-12">
              <svg
                className="w-12 h-12 text-neutral-300 mb-4"
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
              <p className="text-sm font-medium text-neutral-600 mb-1">
                {filter === 'unread'
                  ? 'No unread notifications'
                  : filter === 'read'
                    ? 'No read notifications'
                    : 'No notifications'}
              </p>
              <p className="text-xs text-neutral-400">
                {filter === 'unread'
                  ? 'You\'re all caught up!'
                  : filter === 'read'
                    ? 'No notifications have been read yet.'
                    : 'Notifications will appear here when there are updates to your account.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-card` : 'notification-list-card'}
        >
          <div
            className="divide-y divide-neutral-100"
            role="list"
            aria-label="Notifications"
            data-testid={
              testId ? `${testId}-items` : 'notification-list-items'
            }
          >
            {sortedNotifications.map((notification) => {
              const icon = getNotificationIcon(notification.type)
              const timeDisplay = formatNotificationTime(notification.timestamp)
              const typeLabel =
                NOTIFICATION_TYPE_LABELS[notification.type] || notification.type
              const typeBadgeClass = getTypeBadgeClass(notification.type)

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors duration-150 cursor-pointer group ${
                    notification.isRead
                      ? 'bg-surface-primary hover:bg-neutral-50'
                      : 'bg-info-light/20 hover:bg-info-light/30'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(event) => handleNotificationKeyDown(event, notification)}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${notification.isRead ? '' : 'Unread: '}${notification.title}. ${notification.message}. ${timeDisplay}`}
                  data-testid={
                    testId
                      ? `${testId}-item-${notification.id}`
                      : `notification-list-item-${notification.id}`
                  }
                >
                  {/* Icon */}
                  <div className="mt-0.5 flex-shrink-0">{icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
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
                              className="inline-block w-2 h-2 rounded-full bg-hb-accent flex-shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`hb-badge-sm ${typeBadgeClass}`}>
                            {typeLabel}
                          </span>
                          <span className="text-neutral-300" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-xs text-neutral-400">{timeDisplay}</span>
                          {notification.actionLabel && notification.actionUrl && (
                            <>
                              <span className="text-neutral-300" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-xs font-medium text-hb-primary">
                                {notification.actionLabel}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        {/* Toggle read/unread */}
                        <button
                          type="button"
                          className="hb-btn-icon-sm hb-btn-ghost text-neutral-400 hover:text-neutral-600"
                          onClick={(e) => handleToggleRead(e, notification)}
                          aria-label={
                            notification.isRead
                              ? `Mark ${notification.title} as unread`
                              : `Mark ${notification.title} as read`
                          }
                          tabIndex={-1}
                          data-testid={
                            testId
                              ? `${testId}-toggle-read-${notification.id}`
                              : `notification-list-toggle-read-${notification.id}`
                          }
                        >
                          {notification.isRead ? (
                            <svg
                              className="w-4 h-4"
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
                          ) : (
                            <svg
                              className="w-4 h-4"
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
                          )}
                        </button>

                        {/* Navigate arrow */}
                        {notification.actionUrl && (
                          <svg
                            className="w-4 h-4 text-neutral-300 group-hover:text-hb-primary flex-shrink-0 transition-colors duration-150"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary footer */}
      {sortedNotifications.length > 0 && (
        <div className="flex items-center justify-center">
          <p className="text-xs text-neutral-400">
            Showing {sortedNotifications.length} of {notifications.length} notifications
          </p>
        </div>
      )}

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {sortedNotifications.length} {sortedNotifications.length === 1 ? 'notification' : 'notifications'} displayed
      </div>
    </div>
  )
}

export default NotificationList

export { NotificationList }