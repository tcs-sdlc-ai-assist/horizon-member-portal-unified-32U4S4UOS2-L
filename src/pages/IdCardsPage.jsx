import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import coverages from '@/data/coverages'
import IdCardPreview from '@/components/idcards/IdCardPreview'
import IdCardActions from '@/components/idcards/IdCardActions'
import { useEventTagger } from '@/hooks/useEventTagger'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'
import {
  COVERAGE_TYPE_LABELS,
} from '@/constants/constants'

/**
 * Coverage type icon mapping — inline SVGs for each coverage type.
 */
const COVERAGE_TYPE_ICONS = {
  medical: (
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  dental: (
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  vision: (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  pharmacy: (
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
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  behavioral_health: (
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  life: (
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
}

/**
 * Returns the icon element for a given coverage type.
 * @param {string} type - The coverage type key.
 * @returns {React.ReactNode} The icon element.
 */
const getCoverageIcon = (type) => COVERAGE_TYPE_ICONS[type] || COVERAGE_TYPE_ICONS.medical

/**
 * ID Cards page component.
 *
 * Renders a coverage selector dropdown, IdCardPreview with front/back flip
 * and enlarge functionality, and IdCardActions with print, download, and
 * request new card buttons. Manages the selected coverage state and passes
 * it to child components. Includes a page title, breadcrumb navigation,
 * and tags a page_view event on mount via useEventTagger.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <IdCardsPage />
 *
 * @example
 * <IdCardsPage className="mt-4" testId="id-cards-page" />
 */
function IdCardsPage({ className = '', testId }) {
  const { tagPageView, tagCoverageViewed } = useEventTagger()

  const cardFrontRef = useRef(null)
  const cardBackRef = useRef(null)

  /**
   * Coverages that have ID card data.
   */
  const coveragesWithCards = useMemo(
    () => coverages.filter((cov) => cov.idCard && cov.idCard.front),
    [],
  )

  /**
   * All active coverages for the coverage overview section.
   */
  const activeCoverages = useMemo(
    () => coverages.filter((cov) => cov.status === 'active'),
    [],
  )

  /**
   * Resolves the default coverage to display.
   */
  const defaultCoverageId = useMemo(() => {
    const activeMedical = coveragesWithCards.find(
      (cov) => cov.type === 'medical' && cov.status === 'active',
    )
    return activeMedical ? activeMedical.id : coveragesWithCards[0]?.id || ''
  }, [coveragesWithCards])

  const [selectedCoverageId, setSelectedCoverageId] = useState(defaultCoverageId)

  const [ids] = useState(() => ({
    selector: generateAriaId('hb-idcards-selector'),
  }))

  /**
   * The currently selected coverage object.
   */
  const selectedCoverage = useMemo(
    () => coveragesWithCards.find((cov) => cov.id === selectedCoverageId) || null,
    [selectedCoverageId, coveragesWithCards],
  )

  /**
   * Tag page view event and announce to screen readers on mount.
   */
  useEffect(() => {
    tagPageView({ page: '/coverage', source: 'id_cards_page' })
    announceToScreenReader('ID Cards page loaded', { priority: 'polite' })
  }, [tagPageView])

  /**
   * Handles coverage selector change.
   */
  const handleCoverageChange = useCallback(
    (event) => {
      const newId = event.target.value
      setSelectedCoverageId(newId)

      const cov = coveragesWithCards.find((c) => c.id === newId)
      if (cov) {
        tagCoverageViewed({
          coverageType: cov.type,
          coverageId: cov.id,
          source: 'id_cards_page',
        })
        announceToScreenReader(
          `Showing ${COVERAGE_TYPE_LABELS[cov.type] || cov.type} ID card`,
          { priority: 'polite' },
        )
      }
    },
    [coveragesWithCards, tagCoverageViewed],
  )

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'id-cards-page'}
    >
      {/* Breadcrumb navigation */}
      <nav
        aria-label="Breadcrumb"
        data-testid={testId ? `${testId}-breadcrumb` : 'id-cards-page-breadcrumb'}
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
              ID Cards & Coverage
            </span>
          </li>
        </ol>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
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
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">ID Cards & Coverage</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              View, download, and print your insurance ID cards
            </p>
          </div>
        </div>

        {/* Coverage selector (header-level) */}
        {coveragesWithCards.length > 1 && (
          <div className="hb-form-group min-w-[14rem]">
            <label htmlFor={ids.selector} className="hb-label">
              Coverage Type
            </label>
            <select
              id={ids.selector}
              className="hb-select text-sm py-2 px-3"
              value={selectedCoverageId}
              onChange={handleCoverageChange}
              aria-label="Select coverage type to view ID card"
              data-testid={
                testId
                  ? `${testId}-selector`
                  : 'id-cards-page-selector'
              }
            >
              {coveragesWithCards.map((cov) => (
                <option key={cov.id} value={cov.id}>
                  {COVERAGE_TYPE_LABELS[cov.type] || cov.type} — {cov.planName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ID Card Preview */}
      <IdCardPreview
        initialCoverageId={selectedCoverageId}
        showSelector={false}
        showActions
        testId={testId ? `${testId}-preview` : 'id-cards-page-preview'}
      />

      {/* ID Card Actions */}
      {selectedCoverage && (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-actions-card` : 'id-cards-page-actions-card'}
        >
          <div className="hb-card-header flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0 text-hb-primary">
              {getCoverageIcon(selectedCoverage.type)}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Card Actions</h2>
              <p className="text-2xs text-neutral-500 mt-0.5">
                {COVERAGE_TYPE_LABELS[selectedCoverage.type] || selectedCoverage.type} — {selectedCoverage.planName}
              </p>
            </div>
          </div>
          <div className="hb-card-body">
            <IdCardActions
              cardFrontRef={cardFrontRef}
              cardBackRef={cardBackRef}
              coverage={selectedCoverage}
              layout="inline"
              size="md"
              showPrint
              showDownload
              showRequestNew
              testId={testId ? `${testId}-actions` : 'id-cards-page-actions'}
            />
          </div>
        </div>
      )}

      {/* Active Coverages Overview */}
      {activeCoverages.length > 0 && (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-coverages-card` : 'id-cards-page-coverages-card'}
        >
          <div className="hb-card-header flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-hb-primary"
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
              <h2 className="text-sm font-semibold text-neutral-900">Active Coverages</h2>
              <p className="text-2xs text-neutral-500 mt-0.5">
                {activeCoverages.length} active {activeCoverages.length === 1 ? 'plan' : 'plans'}
              </p>
            </div>
          </div>

          <div className="hb-card-body p-0">
            <div className="divide-y divide-neutral-100">
              {activeCoverages.map((cov) => {
                const icon = getCoverageIcon(cov.type)
                const hasIdCard = cov.idCard && cov.idCard.front
                const isSelected = cov.id === selectedCoverageId

                return (
                  <div
                    key={cov.id}
                    className={`flex items-center gap-3 px-6 py-3.5 transition-colors duration-150 ${
                      hasIdCard
                        ? 'cursor-pointer hover:bg-neutral-50 group'
                        : ''
                    } ${isSelected ? 'bg-hb-primary/5' : ''}`}
                    onClick={
                      hasIdCard
                        ? () => {
                            setSelectedCoverageId(cov.id)
                            tagCoverageViewed({
                              coverageType: cov.type,
                              coverageId: cov.id,
                              source: 'id_cards_page_coverage_list',
                            })
                            announceToScreenReader(
                              `Showing ${COVERAGE_TYPE_LABELS[cov.type] || cov.type} ID card`,
                              { priority: 'polite' },
                            )
                          }
                        : undefined
                    }
                    onKeyDown={
                      hasIdCard
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setSelectedCoverageId(cov.id)
                              tagCoverageViewed({
                                coverageType: cov.type,
                                coverageId: cov.id,
                                source: 'id_cards_page_coverage_list',
                              })
                              announceToScreenReader(
                                `Showing ${COVERAGE_TYPE_LABELS[cov.type] || cov.type} ID card`,
                                { priority: 'polite' },
                              )
                            }
                          }
                        : undefined
                    }
                    role={hasIdCard ? 'button' : undefined}
                    tabIndex={hasIdCard ? 0 : undefined}
                    aria-label={
                      hasIdCard
                        ? `View ${COVERAGE_TYPE_LABELS[cov.type] || cov.type} ID card for ${cov.planName}`
                        : undefined
                    }
                    data-testid={
                      testId
                        ? `${testId}-coverage-${cov.id}`
                        : `id-cards-page-coverage-${cov.id}`
                    }
                  >
                    {/* Coverage icon */}
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                        isSelected
                          ? 'bg-hb-primary/15 text-hb-primary'
                          : 'bg-neutral-100 text-neutral-500 group-hover:bg-hb-primary/10 group-hover:text-hb-primary'
                      }`}
                    >
                      {icon}
                    </div>

                    {/* Coverage info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium transition-colors duration-150 ${
                          isSelected
                            ? 'text-hb-primary'
                            : 'text-neutral-800 group-hover:text-hb-primary'
                        }`}
                      >
                        {COVERAGE_TYPE_LABELS[cov.type] || cov.type}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5 hb-text-truncate">
                        {cov.planName}
                      </p>
                    </div>

                    {/* Status and ID card indicator */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasIdCard ? (
                        <span className="hb-badge-sm hb-badge-success">ID Card</span>
                      ) : (
                        <span className="hb-badge-sm hb-badge-neutral">No Card</span>
                      )}
                      <span className="hb-badge-sm hb-badge-success">Active</span>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && hasIdCard && (
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
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    )}

                    {/* Arrow for clickable items */}
                    {hasIdCard && !isSelected && (
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
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dependents info */}
      {selectedCoverage && selectedCoverage.dependents && selectedCoverage.dependents.length > 0 && (
        <div
          className="hb-card overflow-hidden"
          data-testid={testId ? `${testId}-dependents-card` : 'id-cards-page-dependents-card'}
        >
          <div className="hb-card-header flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-hb-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Covered Dependents</h2>
              <p className="text-2xs text-neutral-500 mt-0.5">
                {selectedCoverage.dependents.length}{' '}
                {selectedCoverage.dependents.length === 1 ? 'dependent' : 'dependents'} on this plan
              </p>
            </div>
          </div>

          <div className="hb-card-body p-0">
            <div className="divide-y divide-neutral-100">
              {selectedCoverage.dependents.map((dependent, index) => (
                <div
                  key={dependent.memberId || index}
                  className="flex items-center gap-3 px-6 py-3"
                  data-testid={
                    testId
                      ? `${testId}-dependent-${index}`
                      : `id-cards-page-dependent-${index}`
                  }
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-neutral-400"
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
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">
                      {dependent.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neutral-500 capitalize">
                        {dependent.relationship}
                      </span>
                      {dependent.memberId && (
                        <>
                          <span className="text-neutral-300" aria-hidden="true">·</span>
                          <span className="text-xs text-neutral-400 font-mono">
                            {dependent.memberId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Helpful info */}
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
            Your digital ID card can be used at most provider offices and pharmacies. You can also
            download a PDF version to print or save to your phone. If you need a new physical card
            mailed to you, use the <span className="font-medium">Request New Card</span> button
            above — new cards typically arrive within 7-10 business days.
          </p>
        </div>
      </div>

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {selectedCoverage
          ? `Showing ${COVERAGE_TYPE_LABELS[selectedCoverage.type] || selectedCoverage.type} ID card for ${selectedCoverage.planName}`
          : 'ID Cards page loaded'}
      </div>
    </div>
  )
}

export default IdCardsPage

export { IdCardsPage }