import { useState, useCallback, useMemo } from 'react'
import benefits from '@/data/benefits'
import { useEventTagger } from '@/hooks/useEventTagger'
import { generateAriaId, announceToScreenReader } from '@/utils/accessibility'

/**
 * Icon mapping for coverage category icons.
 */
const CATEGORY_ICON_MAP = {
  shield: (
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
  user: (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  activity: (
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
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  clock: (
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
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  'alert-circle': (
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
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  home: (
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  scissors: (
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
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  ),
  clipboard: (
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
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  monitor: (
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
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  heart: (
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
  video: (
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
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  'trending-up': (
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
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  tool: (
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
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
}

/**
 * Returns the icon element for a given category icon name.
 * @param {string} iconName - The icon name from the benefits data.
 * @returns {React.ReactNode} The icon element.
 */
const getCategoryIcon = (iconName) => CATEGORY_ICON_MAP[iconName] || CATEGORY_ICON_MAP.shield

/**
 * Coverage categories detail component.
 *
 * Displays a grid/list of coverage categories (office visits, specialist,
 * emergency, prescriptions, etc.) with copay/coinsurance values, covered
 * services, and prior authorization indicators. Uses benefits dummy data.
 * Styled with Honeybee CSS card classes. Supports expanding individual
 * categories to view full details including covered services list.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.layout='grid'] - Layout variant: 'grid' or 'list'.
 * @param {boolean} [props.showCoveredServices=true] - Whether to show covered services in expanded view.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <CoverageCategories />
 *
 * @example
 * <CoverageCategories layout="list" showCoveredServices={false} />
 *
 * @example
 * <CoverageCategories className="mt-4" testId="benefits-coverage-categories" />
 */
function CoverageCategories({
  className = '',
  layout = 'grid',
  showCoveredServices = true,
  testId,
}) {
  const { tagBenefitViewed } = useEventTagger()

  const [expandedCategoryId, setExpandedCategoryId] = useState(null)

  const [ids] = useState(() => ({
    section: generateAriaId('hb-coverage-categories'),
  }))

  /**
   * Coverage categories from the benefits data source.
   */
  const categories = useMemo(() => benefits.coverageCategories || [], [])

  /**
   * Handles expanding/collapsing a category.
   */
  const handleToggleCategory = useCallback(
    (categoryId) => {
      setExpandedCategoryId((prev) => {
        const next = prev === categoryId ? null : categoryId

        if (next) {
          const category = categories.find((c) => c.id === categoryId)
          if (category) {
            tagBenefitViewed({
              categoryId: category.id,
              categoryName: category.name,
              source: 'coverage_categories',
            })
            announceToScreenReader(`${category.name} details expanded`, {
              priority: 'polite',
            })
          }
        } else {
          announceToScreenReader('Category details collapsed', {
            priority: 'polite',
          })
        }

        return next
      })
    },
    [categories, tagBenefitViewed],
  )

  /**
   * Handles keyboard activation on a category card.
   */
  const handleCategoryKeyDown = useCallback(
    (event, categoryId) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleToggleCategory(categoryId)
      }
    },
    [handleToggleCategory],
  )

  if (!categories || categories.length === 0) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'coverage-categories'}
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
          <h3 className="text-sm font-semibold text-neutral-900">Coverage Categories</h3>
        </div>
        <div className="hb-card-body">
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-sm text-neutral-500">No coverage categories available</p>
            <p className="text-xs text-neutral-400 mt-1">
              Coverage details will appear here once your plan is active.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const layoutClass =
    layout === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'flex flex-col gap-4'

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'coverage-categories'}
    >
      {/* Section header */}
      <div className="flex items-center gap-2.5">
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
          <h3 className="text-sm font-semibold text-neutral-900">Coverage Categories</h3>
          <p className="text-2xs text-neutral-500 mt-0.5">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} — click to
            view details
          </p>
        </div>
      </div>

      {/* Categories grid/list */}
      <div
        id={ids.section}
        className={layoutClass}
        role="list"
        aria-label="Coverage categories"
        data-testid={
          testId ? `${testId}-list` : 'coverage-categories-list'
        }
      >
        {categories.map((category) => {
          const isExpanded = expandedCategoryId === category.id
          const icon = getCategoryIcon(category.icon)
          const { inNetwork, outOfNetwork } = category

          return (
            <div
              key={category.id}
              className={`hb-card overflow-hidden transition-all duration-200 ${
                isExpanded ? 'ring-2 ring-hb-primary/20' : ''
              } ${layout === 'grid' ? '' : ''}`}
              role="listitem"
              data-testid={
                testId
                  ? `${testId}-category-${category.id}`
                  : `coverage-categories-category-${category.id}`
              }
            >
              {/* Category header — clickable */}
              <div
                className="px-4 sm:px-5 py-4 cursor-pointer transition-colors duration-150 hover:bg-neutral-50 group"
                onClick={() => handleToggleCategory(category.id)}
                onKeyDown={(event) => handleCategoryKeyDown(event, category.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={isExpanded ? `${ids.section}-detail-${category.id}` : undefined}
                aria-label={`${category.name}. In-network copay: ${inNetwork.copay || inNetwork.coinsurance || 'See details'}. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-hb-primary/10 flex items-center justify-center flex-shrink-0 text-hb-primary group-hover:bg-hb-primary/15 transition-colors duration-150">
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-neutral-800 group-hover:text-hb-primary transition-colors duration-150">
                          {category.name}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5 hb-text-clamp-2">
                          {category.description}
                        </p>
                      </div>

                      {/* Expand/collapse chevron */}
                      <svg
                        className={`w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
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
                    </div>

                    {/* Quick cost summary */}
                    <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                      {inNetwork.copay && (
                        <span className="hb-badge-sm hb-badge-success">
                          {inNetwork.copay}
                        </span>
                      )}
                      {!inNetwork.copay && inNetwork.coinsurance && (
                        <span className="hb-badge-sm hb-badge-info">
                          {inNetwork.coinsurance} coinsurance
                        </span>
                      )}
                      {inNetwork.deductibleApplies && (
                        <span className="hb-badge-sm hb-badge-neutral">
                          Deductible applies
                        </span>
                      )}
                      {!inNetwork.deductibleApplies && inNetwork.copay && (
                        <span className="hb-badge-sm hb-badge-neutral">
                          No deductible
                        </span>
                      )}
                      {inNetwork.priorAuthRequired && (
                        <span className="hb-badge-sm hb-badge-warning">
                          Prior auth required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded detail section */}
              {isExpanded && (
                <div
                  id={`${ids.section}-detail-${category.id}`}
                  className="border-t border-neutral-200"
                  data-testid={
                    testId
                      ? `${testId}-detail-${category.id}`
                      : `coverage-categories-detail-${category.id}`
                  }
                >
                  {/* In-Network vs Out-of-Network comparison */}
                  <div className="px-4 sm:px-5 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* In-Network */}
                      <div className="bg-success-light/30 rounded-lg px-4 py-3 border border-success/20">
                        <div className="flex items-center gap-2 mb-2.5">
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
                          <h5 className="text-xs font-semibold text-success-dark uppercase tracking-wider">
                            In-Network
                          </h5>
                        </div>

                        <div className="flex flex-col gap-2">
                          {inNetwork.copay && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-neutral-500">Copay</span>
                              <span className="text-sm font-semibold text-neutral-800">
                                {inNetwork.copay}
                              </span>
                            </div>
                          )}
                          {inNetwork.coinsurance && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-neutral-500">Coinsurance</span>
                              <span className="text-sm font-semibold text-neutral-800">
                                {inNetwork.coinsurance}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-neutral-500">Deductible</span>
                            <span className="text-xs font-medium text-neutral-700">
                              {inNetwork.deductibleApplies ? 'Applies' : 'Waived'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-neutral-500">Prior Auth</span>
                            <span className="text-xs font-medium text-neutral-700">
                              {inNetwork.priorAuthRequired ? 'Required' : 'Not required'}
                            </span>
                          </div>
                          {inNetwork.notes && (
                            <p className="text-2xs text-neutral-500 mt-1 leading-relaxed border-t border-success/10 pt-2">
                              {inNetwork.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Out-of-Network */}
                      <div className="bg-warning-light/30 rounded-lg px-4 py-3 border border-warning/20">
                        <div className="flex items-center gap-2 mb-2.5">
                          <svg
                            className="w-4 h-4 text-warning-dark flex-shrink-0"
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
                          <h5 className="text-xs font-semibold text-warning-dark uppercase tracking-wider">
                            Out-of-Network
                          </h5>
                        </div>

                        <div className="flex flex-col gap-2">
                          {outOfNetwork.copay && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-neutral-500">Copay</span>
                              <span className="text-sm font-semibold text-neutral-800">
                                {outOfNetwork.copay}
                              </span>
                            </div>
                          )}
                          {outOfNetwork.coinsurance && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-neutral-500">Coinsurance</span>
                              <span className="text-sm font-semibold text-neutral-800">
                                {outOfNetwork.coinsurance}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-neutral-500">Deductible</span>
                            <span className="text-xs font-medium text-neutral-700">
                              {outOfNetwork.deductibleApplies ? 'Applies' : 'Waived'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-neutral-500">Prior Auth</span>
                            <span className="text-xs font-medium text-neutral-700">
                              {outOfNetwork.priorAuthRequired ? 'Required' : 'Not required'}
                            </span>
                          </div>
                          {outOfNetwork.notes && (
                            <p className="text-2xs text-neutral-500 mt-1 leading-relaxed border-t border-warning/10 pt-2">
                              {outOfNetwork.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Covered services */}
                  {showCoveredServices &&
                    category.coveredServices &&
                    category.coveredServices.length > 0 && (
                      <div className="px-4 sm:px-5 py-4 border-t border-neutral-100 bg-surface-secondary">
                        <div className="flex items-center gap-2 mb-3">
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
                          <h5 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                            Covered Services
                          </h5>
                        </div>

                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                          {category.coveredServices.map((service, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-xs text-neutral-600"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>{service}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
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
            This is a summary of your coverage. Copays, coinsurance, and covered services may vary.
            Please refer to your{' '}
            <span className="font-medium">Summary Plan Description (SPD)</span> for complete
            details. Prior authorization is required for certain services — failure to obtain prior
            authorization may result in reduced benefits or denial.
          </p>
        </div>
      </div>

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        {expandedCategoryId
          ? `Showing details for ${categories.find((c) => c.id === expandedCategoryId)?.name || 'selected category'}`
          : ''}
      </div>
    </div>
  )
}

export default CoverageCategories

export { CoverageCategories }