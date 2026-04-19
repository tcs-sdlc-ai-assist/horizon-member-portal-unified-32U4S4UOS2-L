import { useEffect } from 'react'
import GetCareSections from '@/components/getcare/GetCareSections'
import { useEventTagger } from '@/hooks/useEventTagger'
import { announceToScreenReader } from '@/utils/accessibility'

/**
 * Get Care page component.
 *
 * Renders the GetCareSections component within the standard page layout.
 * Includes a page title, breadcrumb navigation, and tags a page_view
 * event on mount via useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <GetCarePage />
 *
 * @example
 * <GetCarePage className="mt-4" testId="get-care-page" />
 */
function GetCarePage({ className = '', testId }) {
  const { tagPageView } = useEventTagger()

  /**
   * Tag page view event and announce to screen readers on mount.
   */
  useEffect(() => {
    tagPageView({ page: '/support', source: 'get_care_page' })
    announceToScreenReader('Get Care page loaded', { priority: 'polite' })
  }, [tagPageView])

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'get-care-page'}
    >
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        data-testid={testId ? `${testId}-breadcrumb` : 'get-care-page-breadcrumb'}
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
              Get Care
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
          <h1 className="text-2xl font-bold text-neutral-900">Get Care</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Find providers, access telehealth, and explore care options
          </p>
        </div>
      </div>

      {/* Get Care Sections */}
      <GetCareSections
        testId={testId ? `${testId}-sections` : 'get-care-page-sections'}
      />

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Get Care page loaded
      </div>
    </div>
  )
}

export default GetCarePage

export { GetCarePage }