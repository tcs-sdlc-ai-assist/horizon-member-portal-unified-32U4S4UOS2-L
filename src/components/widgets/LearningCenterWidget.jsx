import { useMemo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import learningCenter from '@/data/learningCenter'
import { useEventTagger } from '@/hooks/useEventTagger'
import LeavingSiteModal from '@/components/common/LeavingSiteModal'

/**
 * Maximum number of featured articles to display in the widget.
 */
const MAX_VISIBLE_ARTICLES = 3

/**
 * Icon mapping for learning center article categories/icons.
 */
const ARTICLE_ICON_MAP = {
  'file-text': (
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  'dollar-sign': (
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
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  shield: (
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  'map-pin': (
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  video: (
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
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  'alert-circle': (
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  clipboard: (
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
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  heart: (
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  'credit-card': (
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
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
}

/**
 * Returns the SVG icon element for a given article icon name.
 * @param {string} iconName - The icon name from the learning center data.
 * @returns {React.ReactNode} The icon element.
 */
const getArticleIcon = (iconName) => ARTICLE_ICON_MAP[iconName] || ARTICLE_ICON_MAP['file-text']

/**
 * Maps category strings to badge color classes.
 */
const CATEGORY_BADGE_MAP = {
  claims: 'hb-badge-info',
  spending: 'hb-badge-warning',
  benefits: 'hb-badge-success',
  coverage: 'hb-badge-primary',
  get_care: 'hb-badge-accent',
}

/**
 * Maps category strings to display labels.
 */
const CATEGORY_LABEL_MAP = {
  claims: 'Claims',
  spending: 'Spending',
  benefits: 'Benefits',
  coverage: 'Coverage',
  get_care: 'Get Care',
}

/**
 * Dashboard Learning Center widget.
 *
 * Displays up to 3 featured articles/resources from the learningCenter
 * data source with title, summary, category badge, read time, and link.
 * External article links trigger the LeavingSiteModal disclaimer. Styled
 * as a card list with Honeybee CSS classes.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <LearningCenterWidget />
 *
 * @example
 * <LearningCenterWidget className="col-span-2" testId="dashboard-learning-center" />
 */
function LearningCenterWidget({ className = '', testId }) {
  const navigate = useNavigate()
  const { tagExternalLinkClick, tagPageView } = useEventTagger()

  const [isLeavingSiteOpen, setIsLeavingSiteOpen] = useState(false)
  const [externalDestination, setExternalDestination] = useState({
    url: '',
    label: '',
  })

  /**
   * Featured articles sorted by published date (most recent first),
   * limited to MAX_VISIBLE_ARTICLES.
   */
  const featuredArticles = useMemo(() => {
    const featured = learningCenter
      .filter((article) => article.featured)
      .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
      .slice(0, MAX_VISIBLE_ARTICLES)

    // If fewer than MAX_VISIBLE_ARTICLES featured, fill with non-featured
    if (featured.length < MAX_VISIBLE_ARTICLES) {
      const remaining = learningCenter
        .filter((article) => !article.featured)
        .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
        .slice(0, MAX_VISIBLE_ARTICLES - featured.length)

      return [...featured, ...remaining]
    }

    return featured
  }, [])

  /**
   * Handles clicking an article — opens external link via leaving site modal
   * or navigates to an internal route.
   */
  const handleArticleClick = useCallback(
    (article) => {
      if (article.isExternal && article.link) {
        setExternalDestination({ url: article.link, label: article.title })
        setIsLeavingSiteOpen(true)
      } else if (article.link) {
        tagPageView({ page: article.link, source: 'learning_center_widget' })
        navigate(article.link)
      }
    },
    [navigate, tagPageView],
  )

  /**
   * Handles keyboard activation on an article row.
   */
  const handleArticleKeyDown = useCallback(
    (event, article) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleArticleClick(article)
      }
    },
    [handleArticleClick],
  )

  /**
   * Handles the continue action after the leaving site modal is confirmed.
   */
  const handleExternalContinue = useCallback(() => {
    tagExternalLinkClick({
      destinationUrl: externalDestination.url,
      destinationLabel: externalDestination.label,
      source: 'learning_center_widget',
    })
  }, [tagExternalLinkClick, externalDestination])

  /**
   * Handles navigating to the full support/learning page.
   */
  const handleViewAll = useCallback(() => {
    tagPageView({ page: '/support', source: 'learning_center_widget' })
    navigate('/support')
  }, [navigate, tagPageView])

  if (!featuredArticles || featuredArticles.length === 0) {
    return (
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'learning-center-widget'}
      >
        <div className="hb-card-header flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-hb-accent/10 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-hb-accent"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">Learning Center</h3>
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
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <p className="text-sm text-neutral-500">No articles available</p>
            <p className="text-xs text-neutral-400 mt-1">
              Learning resources will appear here once available.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`hb-card overflow-hidden ${className}`.trim()}
        data-testid={testId || 'learning-center-widget'}
      >
        {/* Header */}
        <div className="hb-card-header flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-hb-accent/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-hb-accent"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Learning Center</h3>
              <p className="text-2xs text-neutral-500 mt-0.5">
                Resources to help you understand your benefits
              </p>
            </div>
          </div>
        </div>

        {/* Articles list */}
        <div className="hb-card-body p-0">
          <div className="divide-y divide-neutral-100">
            {featuredArticles.map((article) => {
              const icon = getArticleIcon(article.icon)
              const categoryBadgeClass =
                CATEGORY_BADGE_MAP[article.category] || 'hb-badge-neutral'
              const categoryLabel =
                CATEGORY_LABEL_MAP[article.category] || article.category

              return (
                <div
                  key={article.id}
                  className="flex items-start gap-3 px-6 py-3.5 transition-colors duration-150 hover:bg-neutral-50 cursor-pointer group"
                  onClick={() => handleArticleClick(article)}
                  onKeyDown={(event) => handleArticleKeyDown(event, article)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${article.title} — ${article.summary}`}
                  data-testid={
                    testId
                      ? `${testId}-article-${article.id}`
                      : `learning-center-widget-article-${article.id}`
                  }
                >
                  {/* Article icon */}
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-neutral-500 group-hover:bg-hb-accent/10 group-hover:text-hb-accent transition-colors duration-150 mt-0.5">
                    {icon}
                  </div>

                  {/* Article content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-800 group-hover:text-hb-primary transition-colors duration-150 hb-text-clamp-2">
                        {article.title}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5 hb-text-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`hb-badge-sm ${categoryBadgeClass}`}>
                        {categoryLabel}
                      </span>
                      {article.readTimeMinutes && (
                        <>
                          <span className="text-neutral-300" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-2xs text-neutral-400">
                            {article.readTimeMinutes} min read
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* External / arrow indicator */}
                  {article.isExternal ? (
                    <svg
                      className="w-4 h-4 text-neutral-300 group-hover:text-hb-primary flex-shrink-0 transition-colors duration-150 mt-1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-neutral-300 group-hover:text-hb-primary flex-shrink-0 transition-colors duration-150 mt-1"
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

        {/* Footer CTA */}
        <div className="hb-card-footer flex items-center justify-center">
          <button
            type="button"
            className="hb-btn-sm hb-btn-outline w-full justify-center"
            onClick={handleViewAll}
            data-testid={
              testId
                ? `${testId}-view-all`
                : 'learning-center-widget-view-all'
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
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            View All Resources
          </button>
        </div>
      </div>

      {/* Leaving Site Modal for external links */}
      <LeavingSiteModal
        isOpen={isLeavingSiteOpen}
        onClose={() => setIsLeavingSiteOpen(false)}
        destinationUrl={externalDestination.url}
        destinationLabel={externalDestination.label}
        onContinue={handleExternalContinue}
        testId={
          testId
            ? `${testId}-leaving-site-modal`
            : 'learning-center-widget-leaving-site-modal'
        }
      />
    </>
  )
}

export default LearningCenterWidget

export { LearningCenterWidget }