import { useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useWidgets } from '@/context/WidgetContext'
import { useEventTagger } from '@/hooks/useEventTagger'
import { WIDGET_TYPE } from '@/constants/constants'
import FindCareCTA from '@/components/widgets/FindCareCTA'
import RecentClaims from '@/components/widgets/RecentClaims'
import IdCardSummary from '@/components/widgets/IdCardSummary'
import DeductibleOopSummary from '@/components/widgets/DeductibleOopSummary'
import LearningCenterWidget from '@/components/widgets/LearningCenterWidget'
import WidgetCustomizer from '@/components/widgets/WidgetCustomizer'
import { announceToScreenReader } from '@/utils/accessibility'

/**
 * Maps widget type IDs to their corresponding React components.
 */
const WIDGET_COMPONENT_MAP = {
  [WIDGET_TYPE.QUICK_ACTIONS]: FindCareCTA,
  [WIDGET_TYPE.RECENT_CLAIMS]: RecentClaims,
  [WIDGET_TYPE.ID_CARD]: IdCardSummary,
  [WIDGET_TYPE.DEDUCTIBLE_PROGRESS]: DeductibleOopSummary,
  [WIDGET_TYPE.SPENDING_TRACKER]: DeductibleOopSummary,
  [WIDGET_TYPE.PLAN_HIGHLIGHTS]: LearningCenterWidget,
}

/**
 * Returns a greeting string based on the current time of day.
 * @returns {string} Greeting prefix (e.g., 'Good morning').
 */
const getGreeting = () => {
  const hour = new Date().getHours()

  if (hour < 12) {
    return 'Good morning'
  }

  if (hour < 18) {
    return 'Good afternoon'
  }

  return 'Good evening'
}

/**
 * Dashboard page component.
 *
 * Displays a personalized greeting using the member's first name, and
 * renders a widget container with FindCareCTA, RecentClaims, IdCardSummary,
 * DeductibleOopSummary, and LearningCenterWidget. Respects WidgetContext
 * for widget order and visibility preferences. Includes a WidgetCustomizer
 * toggle button to allow users to show/hide and reorder dashboard widgets.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <Dashboard />
 *
 * @example
 * <Dashboard className="mt-4" testId="dashboard-page" />
 */
function Dashboard({ className = '', testId }) {
  const { currentUser } = useAuth()
  const { tagPageView } = useEventTagger()
  const { widgetOrder, widgetVisibility, getVisibleWidgets } = useWidgets()

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false)

  /**
   * The member's first name for the greeting.
   */
  const firstName = useMemo(() => currentUser?.firstName || 'Member', [currentUser])

  /**
   * Time-of-day greeting string.
   */
  const greeting = useMemo(() => getGreeting(), [])

  /**
   * Today's date formatted for display.
   */
  const todayDisplay = useMemo(() => {
    try {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    } catch (_error) {
      return ''
    }
  }, [])

  /**
   * Visible widgets in order, filtered to only those with a component mapping.
   */
  const visibleWidgets = useMemo(() => {
    const visible = getVisibleWidgets()
    return visible.filter((widgetId) => WIDGET_COMPONENT_MAP[widgetId])
  }, [getVisibleWidgets])

  /**
   * Handles opening the widget customizer modal.
   */
  const handleOpenCustomizer = useCallback(() => {
    setIsCustomizerOpen(true)
    announceToScreenReader('Dashboard customizer opened', { priority: 'polite' })
  }, [])

  /**
   * Handles closing the widget customizer modal.
   */
  const handleCloseCustomizer = useCallback(() => {
    setIsCustomizerOpen(false)
    announceToScreenReader('Dashboard customizer closed', { priority: 'polite' })
  }, [])

  return (
    <div
      className={`flex flex-col gap-6 ${className}`.trim()}
      data-testid={testId || 'dashboard-page'}
    >
      {/* Page header with greeting and customizer toggle */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">{todayDisplay}</p>
        </div>

        {/* Customize dashboard button */}
        <button
          type="button"
          className="hb-btn-sm hb-btn-outline-secondary"
          onClick={handleOpenCustomizer}
          aria-label="Customize dashboard widgets"
          data-testid={
            testId
              ? `${testId}-customize-btn`
              : 'dashboard-page-customize-btn'
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
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Customize
        </button>
      </div>

      {/* Widget grid */}
      {visibleWidgets.length === 0 ? (
        <div
          className="hb-card overflow-hidden"
          data-testid={
            testId
              ? `${testId}-empty-state`
              : 'dashboard-page-empty-state'
          }
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
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <p className="text-sm font-medium text-neutral-600 mb-1">
                No widgets visible
              </p>
              <p className="text-xs text-neutral-400 mb-4">
                Click the Customize button above to add widgets to your dashboard.
              </p>
              <button
                type="button"
                className="hb-btn-sm hb-btn-primary"
                onClick={handleOpenCustomizer}
                data-testid={
                  testId
                    ? `${testId}-empty-customize-btn`
                    : 'dashboard-page-empty-customize-btn'
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
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Customize Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          data-testid={
            testId
              ? `${testId}-widget-grid`
              : 'dashboard-page-widget-grid'
          }
        >
          {visibleWidgets.map((widgetId) => {
            const WidgetComponent = WIDGET_COMPONENT_MAP[widgetId]

            if (!WidgetComponent) {
              return null
            }

            return (
              <WidgetComponent
                key={widgetId}
                testId={
                  testId
                    ? `${testId}-widget-${widgetId}`
                    : `dashboard-page-widget-${widgetId}`
                }
              />
            )
          })}
        </div>
      )}

      {/* Widget Customizer Modal */}
      <WidgetCustomizer
        isOpen={isCustomizerOpen}
        onClose={handleCloseCustomizer}
        testId={
          testId
            ? `${testId}-customizer`
            : 'dashboard-page-customizer'
        }
      />

      {/* Screen reader live region */}
      <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
        Dashboard loaded with {visibleWidgets.length} {visibleWidgets.length === 1 ? 'widget' : 'widgets'}
      </div>
    </div>
  )
}

export default Dashboard

export { Dashboard }