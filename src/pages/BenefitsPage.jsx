import { useEffect } from 'react'
import BenefitsSummary from '@/components/benefits/BenefitsSummary'
import CoverageCategories from '@/components/benefits/CoverageCategories'
import { useEventTagger } from '@/hooks/useEventTagger'
import { announceToScreenReader } from '@/utils/accessibility'

/**
 * Benefits & Coverage page component.
 *
 * Renders the BenefitsSummary component with coverage selector and plan
 * details, followed by the CoverageCategories component showing detailed
 * coverage category information with in-network/out-of-network comparisons.
 * Includes a page title, breadcrumb navigation, and tags a page_view
 * event on mount via useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <BenefitsPage />
 *
 * @example
 * <BenefitsPage className="mt-4" testId="benefits-page" />
 */
function BenefitsPage({ className = '', testId }) {
  const { tagPageView } = useEventTagger()

  /**
   * Tag page view event and announce to screen readers on mount.
   */
  useEffect(() => {
    tagPageView({ page: '/benefits', source: 'benefits_page' })
    announceToScreenReader('Benefits page loaded', { priority: 'polite' })
  }, [tagPageView])

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'benefits-page'}
    >
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        data-testid={testId ? `${testId}-breadcrumb` : 'benefits-page-breadcrumb'}
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
              Benefits
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Benefits & Coverage</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            View your plan benefits, coverage details, and copay information
          </p>
        </div>
      </div>

      {/* Benefits Summary with coverage selector and plan details */}
      <BenefitsSummary
        showSelector
        showPlanDetails
        testId={testId ? `${testId}-summary` : 'benefits-page-summary'}
      />

      {/* Coverage Categories with in-network/out-of-network details */}
      <CoverageCategories
        layout="grid"
        showCoveredServices
        testId={testId ? `${testId}-categories` : 'benefits-page-categories'}
      />

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Benefits page loaded
      </div>
    </div>
  )
}

export default BenefitsPage

export { BenefitsPage }