import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import Modal from '@/components/common/Modal'
import { useWidgets } from '@/context/WidgetContext'
import { WIDGET_TYPE_LABELS } from '@/constants/constants'
import { announceToScreenReader, generateAriaId } from '@/utils/accessibility'

/**
 * Icon mapping for widget types.
 */
const WIDGET_ICON_MAP = {
  benefits_summary: (
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
  claims_overview: (
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
  spending_tracker: (
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
  id_card: (
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
  quick_actions: (
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
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  recent_claims: (
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
  notifications: (
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  deductible_progress: (
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
  upcoming_appointments: (
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  cost_estimator: (
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
  plan_highlights: (
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
}

/**
 * Returns the icon element for a given widget type.
 * @param {string} widgetType - The widget type key.
 * @returns {React.ReactNode} The icon element.
 */
const getWidgetIcon = (widgetType) => WIDGET_ICON_MAP[widgetType] || WIDGET_ICON_MAP.quick_actions

/**
 * Dashboard widget customization panel/modal.
 *
 * Allows users to show/hide widgets and reorder them via up/down buttons.
 * Consumes WidgetContext for preferences. Includes reset to defaults button.
 * Accessible with keyboard support.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the customizer modal is visible.
 * @param {function} props.onClose - Callback invoked when the modal should close.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <WidgetCustomizer
 *   isOpen={isCustomizerOpen}
 *   onClose={() => setIsCustomizerOpen(false)}
 * />
 */
function WidgetCustomizer({ isOpen, onClose, className = '', testId }) {
  const {
    widgetOrder,
    widgetVisibility,
    toggleWidgetVisibility,
    moveWidget,
    resetWidgets,
  } = useWidgets()

  const [confirmReset, setConfirmReset] = useState(false)
  const widgetListRef = useRef(null)

  const [ids] = useState(() => ({
    list: generateAriaId('hb-widget-list'),
    description: generateAriaId('hb-widget-customizer-desc'),
  }))

  /**
   * Counts visible and hidden widgets.
   */
  const visibleCount = useMemo(
    () => widgetOrder.filter((id) => widgetVisibility[id] === true).length,
    [widgetOrder, widgetVisibility],
  )

  const hiddenCount = useMemo(
    () => widgetOrder.filter((id) => widgetVisibility[id] === false).length,
    [widgetOrder, widgetVisibility],
  )

  /**
   * Handles toggling a widget's visibility.
   */
  const handleToggleVisibility = useCallback(
    (widgetId) => {
      const widgetLabel = WIDGET_TYPE_LABELS[widgetId] || widgetId
      const isCurrentlyVisible = widgetVisibility[widgetId]

      toggleWidgetVisibility(widgetId)

      announceToScreenReader(
        `${widgetLabel} widget ${isCurrentlyVisible ? 'hidden' : 'shown'}`,
        { priority: 'polite' },
      )
    },
    [widgetVisibility, toggleWidgetVisibility],
  )

  /**
   * Handles moving a widget up in the order.
   */
  const handleMoveUp = useCallback(
    (widgetId) => {
      const widgetLabel = WIDGET_TYPE_LABELS[widgetId] || widgetId
      moveWidget(widgetId, 'up')
      announceToScreenReader(`${widgetLabel} moved up`, { priority: 'polite' })
    },
    [moveWidget],
  )

  /**
   * Handles moving a widget down in the order.
   */
  const handleMoveDown = useCallback(
    (widgetId) => {
      const widgetLabel = WIDGET_TYPE_LABELS[widgetId] || widgetId
      moveWidget(widgetId, 'down')
      announceToScreenReader(`${widgetLabel} moved down`, { priority: 'polite' })
    },
    [moveWidget],
  )

  /**
   * Handles the reset to defaults action.
   */
  const handleReset = useCallback(() => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }

    resetWidgets()
    setConfirmReset(false)
    announceToScreenReader('Dashboard widgets reset to defaults', { priority: 'assertive' })
  }, [confirmReset, resetWidgets])

  /**
   * Cancels the reset confirmation.
   */
  const handleCancelReset = useCallback(() => {
    setConfirmReset(false)
  }, [])

  /**
   * Handles keyboard events on widget items for reordering.
   */
  const handleWidgetKeyDown = useCallback(
    (event, widgetId, index) => {
      switch (event.key) {
        case 'ArrowUp': {
          if (index > 0) {
            event.preventDefault()
            handleMoveUp(widgetId)
            // Focus the same widget after it moves up
            requestAnimationFrame(() => {
              const items = widgetListRef.current?.querySelectorAll('[data-widget-item]')
              if (items && items[index - 1]) {
                items[index - 1].focus()
              }
            })
          }
          break
        }

        case 'ArrowDown': {
          if (index < widgetOrder.length - 1) {
            event.preventDefault()
            handleMoveDown(widgetId)
            // Focus the same widget after it moves down
            requestAnimationFrame(() => {
              const items = widgetListRef.current?.querySelectorAll('[data-widget-item]')
              if (items && items[index + 1]) {
                items[index + 1].focus()
              }
            })
          }
          break
        }

        case ' ':
        case 'Enter': {
          event.preventDefault()
          handleToggleVisibility(widgetId)
          break
        }

        default:
          break
      }
    },
    [widgetOrder, handleMoveUp, handleMoveDown, handleToggleVisibility],
  )

  /**
   * Resets confirm state when modal closes.
   */
  useEffect(() => {
    if (!isOpen) {
      setConfirmReset(false)
    }
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Dashboard"
      size="md"
      closeOnOverlayClick
      closeOnEscape
      description="Show, hide, and reorder your dashboard widgets. Use the toggle to show or hide a widget, and the arrow buttons to change the order."
      testId={testId || 'widget-customizer'}
    >
      <div className={`flex flex-col gap-4 ${className}`.trim()}>
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="hb-badge-sm hb-badge-success">
              {visibleCount} visible
            </span>
            {hiddenCount > 0 && (
              <span className="hb-badge-sm hb-badge-neutral">
                {hiddenCount} hidden
              </span>
            )}
          </div>

          {/* Reset button */}
          <div className="flex items-center gap-2">
            {confirmReset ? (
              <>
                <span className="text-xs text-warning-dark font-medium">Reset all?</span>
                <button
                  type="button"
                  className="hb-btn-xs hb-btn-danger"
                  onClick={handleReset}
                  data-testid={
                    testId
                      ? `${testId}-confirm-reset`
                      : 'widget-customizer-confirm-reset'
                  }
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="hb-btn-xs hb-btn-outline-secondary"
                  onClick={handleCancelReset}
                  data-testid={
                    testId
                      ? `${testId}-cancel-reset`
                      : 'widget-customizer-cancel-reset'
                  }
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="hb-btn-xs hb-btn-ghost text-neutral-500 hover:text-neutral-700"
                onClick={handleReset}
                aria-label="Reset widgets to defaults"
                data-testid={
                  testId
                    ? `${testId}-reset`
                    : 'widget-customizer-reset'
                }
              >
                <svg
                  className="w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Reset to Defaults
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="hb-alert-info">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
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
          <p className="text-xs leading-relaxed">
            Toggle widgets on or off to customize your dashboard. Use the arrow buttons or keyboard
            arrow keys to reorder widgets.
          </p>
        </div>

        {/* Widget list */}
        <div
          ref={widgetListRef}
          id={ids.list}
          className="flex flex-col gap-1 max-h-96 hb-scrollable"
          role="list"
          aria-label="Dashboard widgets"
          data-testid={
            testId
              ? `${testId}-list`
              : 'widget-customizer-list'
          }
        >
          {widgetOrder.map((widgetId, index) => {
            const isVisible = widgetVisibility[widgetId] === true
            const widgetLabel = WIDGET_TYPE_LABELS[widgetId] || widgetId
            const icon = getWidgetIcon(widgetId)
            const isFirst = index === 0
            const isLast = index === widgetOrder.length - 1

            return (
              <div
                key={widgetId}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors duration-150 group ${
                  isVisible
                    ? 'bg-surface-primary border-neutral-200 hover:border-neutral-300'
                    : 'bg-neutral-50 border-neutral-100 opacity-70 hover:opacity-90'
                }`}
                role="listitem"
                tabIndex={0}
                data-widget-item
                onKeyDown={(event) => handleWidgetKeyDown(event, widgetId, index)}
                aria-label={`${widgetLabel}, ${isVisible ? 'visible' : 'hidden'}, position ${index + 1} of ${widgetOrder.length}. Use arrow keys to reorder, Enter or Space to toggle visibility.`}
                data-testid={
                  testId
                    ? `${testId}-item-${widgetId}`
                    : `widget-customizer-item-${widgetId}`
                }
              >
                {/* Drag handle indicator */}
                <div className="flex-shrink-0 text-neutral-300 group-hover:text-neutral-400 transition-colors duration-150">
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
                    <line x1="8" y1="6" x2="8" y2="6.01" />
                    <line x1="16" y1="6" x2="16" y2="6.01" />
                    <line x1="8" y1="12" x2="8" y2="12.01" />
                    <line x1="16" y1="12" x2="16" y2="12.01" />
                    <line x1="8" y1="18" x2="8" y2="18.01" />
                    <line x1="16" y1="18" x2="16" y2="18.01" />
                  </svg>
                </div>

                {/* Widget icon */}
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                    isVisible
                      ? 'bg-hb-primary/10 text-hb-primary'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {icon}
                </div>

                {/* Widget label */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm font-medium hb-text-truncate block ${
                      isVisible ? 'text-neutral-800' : 'text-neutral-500'
                    }`}
                  >
                    {widgetLabel}
                  </span>
                </div>

                {/* Reorder buttons */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    type="button"
                    className={`hb-btn-icon-sm hb-btn-ghost text-neutral-400 hover:text-neutral-600 ${
                      isFirst ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveUp(widgetId)
                    }}
                    disabled={isFirst}
                    aria-label={`Move ${widgetLabel} up`}
                    tabIndex={-1}
                    data-testid={
                      testId
                        ? `${testId}-move-up-${widgetId}`
                        : `widget-customizer-move-up-${widgetId}`
                    }
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className={`hb-btn-icon-sm hb-btn-ghost text-neutral-400 hover:text-neutral-600 ${
                      isLast ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMoveDown(widgetId)
                    }}
                    disabled={isLast}
                    aria-label={`Move ${widgetLabel} down`}
                    tabIndex={-1}
                    data-testid={
                      testId
                        ? `${testId}-move-down-${widgetId}`
                        : `widget-customizer-move-down-${widgetId}`
                    }
                  >
                    <svg
                      className="w-3.5 h-3.5"
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
                  </button>
                </div>

                {/* Visibility toggle */}
                <button
                  type="button"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleVisibility(widgetId)
                  }}
                  aria-label={`${isVisible ? 'Hide' : 'Show'} ${widgetLabel} widget`}
                  aria-pressed={isVisible}
                  tabIndex={-1}
                  data-testid={
                    testId
                      ? `${testId}-toggle-${widgetId}`
                      : `widget-customizer-toggle-${widgetId}`
                  }
                >
                  <div
                    className={`relative inline-flex items-center h-5 w-9 rounded-full cursor-pointer transition-colors duration-200 ${
                      isVisible ? 'bg-hb-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        isVisible ? 'translate-x-[1.1rem]' : 'translate-x-[0.15rem]'
                      }`}
                    />
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer hint */}
        <div className="border-t border-neutral-200 pt-3">
          <p className="text-2xs text-neutral-400 text-center">
            Changes are saved automatically and will persist across sessions.
          </p>
        </div>

        {/* Screen reader live region for widget count */}
        <div className="hb-sr-only" aria-live="polite" aria-atomic="true">
          {visibleCount} widgets visible, {hiddenCount} widgets hidden
        </div>
      </div>
    </Modal>
  )
}

export default WidgetCustomizer

export { WidgetCustomizer }