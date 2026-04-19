import { useEffect } from 'react'
import { useEventTagger } from '@/hooks/useEventTagger'
import { announceToScreenReader } from '@/utils/accessibility'

/**
 * Wellness page placeholder component.
 *
 * Displays a page title, breadcrumb navigation, and a "Coming Soon" message
 * styled with Honeybee CSS classes. Placeholder for future wellness content.
 * Tags a page_view event on mount via useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <WellnessPage />
 *
 * @example
 * <WellnessPage className="mt-4" testId="wellness-page" />
 */
function WellnessPage({ className = '', testId }) {
  const { tagPageView } = useEventTagger()

  /**
   * Tag page view event and announce to screen readers on mount.
   */
  useEffect(() => {
    tagPageView({ page: '/wellness', source: 'wellness_page' })
    announceToScreenReader('Wellness page loaded', { priority: 'polite' })
  }, [tagPageView])

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'wellness-page'}
    >
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        data-testid={testId ? `${testId}-breadcrumb` : 'wellness-page-breadcrumb'}
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
              Wellness
            </span>
          </li>
        </ol>
      </nav>

      {/* Page header */}
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
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Wellness</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Health and wellness programs, resources, and tools
          </p>
        </div>
      </div>

      {/* Coming Soon card */}
      <div
        className="hb-card overflow-hidden"
        data-testid={testId ? `${testId}-coming-soon-card` : 'wellness-page-coming-soon-card'}
      >
        <div className="hb-card-body">
          <div className="hb-empty-state py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-hb-accent/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-hb-accent"
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
              </div>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Coming Soon</h2>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-md mx-auto mb-6">
              We are building wellness programs, health assessments, and personalized resources to
              help you and your family stay healthy. Check back soon for updates.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/"
                className="hb-btn-sm hb-btn-outline"
                data-testid={
                  testId
                    ? `${testId}-back-to-dashboard`
                    : 'wellness-page-back-to-dashboard'
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
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Informational alert */}
      <div className="hb-alert-info">
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
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
        <div>
          <p className="text-xs leading-relaxed">
            Wellness features including health risk assessments, wellness challenges, and
            preventive care reminders are currently in development. You will be notified when
            these features become available.
          </p>
        </div>
      </div>

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Wellness page loaded
      </div>
    </div>
  )
}

export default WellnessPage

export { WellnessPage }