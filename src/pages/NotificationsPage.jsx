import { useEffect } from 'react'
import NotificationList from '@/components/notifications/NotificationList'
import { useEventTagger } from '@/hooks/useEventTagger'
import { announceToScreenReader } from '@/utils/accessibility'

/**
 * Notifications page component.
 *
 * Renders the NotificationList component with full notification management
 * including read/unread toggling, mark all read, and filtering. Includes
 * a page title, breadcrumb navigation, and tags a page_view event on mount
 * via useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <NotificationsPage />
 *
 * @example
 * <NotificationsPage className="mt-4" testId="notifications-page" />
 */
function NotificationsPage({ className = '', testId }) {
  const { tagPageView } = useEventTagger()

  /**
   * Tag page view event and announce to screen readers on mount.
   */
  useEffect(() => {
    tagPageView({ page: '/messages', source: 'notifications_page' })
    announceToScreenReader('Notifications page loaded', { priority: 'polite' })
  }, [tagPageView])

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'notifications-page'}
    >
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        data-testid={testId ? `${testId}-breadcrumb` : 'notifications-page-breadcrumb'}
      >
        <ol className="hb-breadcrumb">
          <li>
            <a href="/" className="hb-breadcrumb-item">
              Dashboard
            </a>
          </li>
          <li>
            <svg
              className="w-3.5 h-3.5 hb-breadcrumb-separator"
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
          </li>
          <li>
            <span className="hb-breadcrumb-item-active" aria-current="page">
              Messages & Notifications
            </span>
          </li>
        </ol>
      </nav>

      {/* Notification list with full management */}
      <NotificationList
        testId={testId ? `${testId}-list` : 'notifications-page-list'}
      />

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Notifications page loaded
      </div>
    </div>
  )
}

export default NotificationsPage

export { NotificationsPage }