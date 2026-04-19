import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEventTagger } from '@/hooks/useEventTagger'
import { announceToScreenReader } from '@/utils/accessibility'
import { SUPPORT, BRANDING } from '@/constants/constants'

/**
 * 404 Not Found page component.
 *
 * Displays a friendly error message when the user navigates to a route
 * that does not exist. Includes a prominent illustration, descriptive
 * text, navigation buttons to return to the dashboard or go back, and
 * support contact information. Styled with Honeybee CSS classes. Tags
 * a page_view event on mount via useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <NotFoundPage />
 *
 * @example
 * <NotFoundPage className="mt-4" testId="not-found-page" />
 */
function NotFoundPage({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagPageView } = useEventTagger()

  /**
   * Tag page view event and announce to screen readers on mount.
   */
  useEffect(() => {
    tagPageView({ page: '/404', source: 'not_found_page' })
    announceToScreenReader('Page not found. The page you are looking for does not exist.', {
      priority: 'assertive',
    })
  }, [tagPageView])

  /**
   * Handles navigating back to the dashboard.
   */
  const handleGoHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  /**
   * Handles navigating back to the previous page.
   */
  const handleGoBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-surface-secondary px-4 py-12 ${className}`.trim()}
      data-testid={testId || 'not-found-page'}
    >
      <div className="hb-card max-w-lg w-full">
        <div className="hb-card-body text-center py-12 px-6">
          {/* Error Illustration */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-warning-light flex items-center justify-center">
              <svg
                className="w-10 h-10 text-warning-dark"
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
            </div>
          </div>

          {/* Error Code */}
          <p className="text-6xl font-extrabold text-hb-primary mb-2">404</p>

          {/* Error Title */}
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Page Not Found</h1>

          {/* Error Description */}
          <p className="text-sm text-neutral-600 mb-8 leading-relaxed max-w-md mx-auto">
            The page you are looking for doesn&apos;t exist or has been moved. Please check the URL
            or navigate back to the dashboard.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <button
              type="button"
              className="hb-btn-md hb-btn-primary w-full sm:w-auto"
              onClick={handleGoHome}
              data-testid={
                testId
                  ? `${testId}-go-home-btn`
                  : 'not-found-page-go-home-btn'
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
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go to Dashboard
            </button>

            <button
              type="button"
              className="hb-btn-md hb-btn-outline-secondary w-full sm:w-auto"
              onClick={handleGoBack}
              data-testid={
                testId
                  ? `${testId}-go-back-btn`
                  : 'not-found-page-go-back-btn'
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
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Go Back
            </button>
          </div>

          {/* Support Contact */}
          <div className="border-t border-neutral-200 pt-6">
            <p className="text-xs text-neutral-500 mb-1">
              Need help? Contact Member Services
            </p>
            <p className="text-sm font-medium text-hb-primary">
              <a
                href={`tel:${SUPPORT.phone.replace(/[^\d]/g, '')}`}
                className="hover:text-hb-primary-light transition-colors duration-200"
              >
                {SUPPORT.phoneDisplay}
              </a>
            </p>
            <p className="text-xs text-neutral-400 mt-1">{SUPPORT.hoursOfOperation}</p>
          </div>
        </div>
      </div>

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="assertive" aria-atomic="true">
        Page not found. Error 404.
      </div>
    </div>
  )
}

export default NotFoundPage

export { NotFoundPage }