import { useMemo } from 'react'
import Modal from '@/components/common/Modal'
import { SUPPORT } from '@/constants/constants'

/**
 * Session timeout warning modal component.
 *
 * Displays a countdown timer before session expiry with 'Stay Logged In' and
 * 'Log Out' action buttons. Uses the Modal component for rendering and is
 * triggered by the useSessionTimeout hook when the session enters the warning
 * phase.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {string} props.formattedRemainingTime - The remaining time formatted as "M:SS".
 * @param {number} props.remainingTime - The remaining time in milliseconds.
 * @param {function} props.onExtendSession - Callback invoked when the user clicks 'Stay Logged In'.
 * @param {function} props.onLogout - Callback invoked when the user clicks 'Log Out'.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <SessionWarningModal
 *   isOpen={isWarningVisible}
 *   formattedRemainingTime={formattedRemainingTime}
 *   remainingTime={remainingTime}
 *   onExtendSession={extendSession}
 *   onLogout={logout}
 * />
 *
 * @example
 * // Used with useSessionTimeout hook
 * const { isWarningVisible, formattedRemainingTime, remainingTime, extendSession, logout } = useSessionTimeout()
 *
 * <SessionWarningModal
 *   isOpen={isWarningVisible}
 *   formattedRemainingTime={formattedRemainingTime}
 *   remainingTime={remainingTime}
 *   onExtendSession={extendSession}
 *   onLogout={logout}
 * />
 */
function SessionWarningModal({
  isOpen,
  formattedRemainingTime,
  remainingTime,
  onExtendSession,
  onLogout,
  testId,
}) {
  /**
   * Determines the urgency level based on remaining time for visual styling.
   */
  const urgencyLevel = useMemo(() => {
    if (remainingTime <= 30000) {
      return 'critical'
    }
    if (remainingTime <= 60000) {
      return 'high'
    }
    return 'normal'
  }, [remainingTime])

  /**
   * Maps urgency level to countdown text color classes.
   */
  const countdownColorClass = useMemo(() => {
    switch (urgencyLevel) {
      case 'critical':
        return 'text-error'
      case 'high':
        return 'text-warning-dark'
      default:
        return 'text-hb-primary'
    }
  }, [urgencyLevel])

  /**
   * Maps urgency level to countdown background color classes.
   */
  const countdownBgClass = useMemo(() => {
    switch (urgencyLevel) {
      case 'critical':
        return 'bg-error-light'
      case 'high':
        return 'bg-warning-light'
      default:
        return 'bg-hb-primary/10'
    }
  }, [urgencyLevel])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onExtendSession}
      title="Session Expiring"
      size="sm"
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
      description="Your session is about to expire due to inactivity. Please choose to stay logged in or log out."
      primaryAction={{
        label: 'Stay Logged In',
        onClick: onExtendSession,
        variant: 'primary',
      }}
      secondaryAction={{
        label: 'Log Out',
        onClick: onLogout,
        variant: 'outline-secondary',
      }}
      testId={testId || 'session-warning-modal'}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Warning icon */}
        <div className="flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-warning-light flex items-center justify-center">
            <svg
              className="w-7 h-7 text-warning-dark"
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
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-neutral-600 text-center leading-relaxed max-w-sm">
          Your session is about to expire due to inactivity. You will be automatically logged out
          when the timer reaches zero.
        </p>

        {/* Countdown timer */}
        <div
          className={`flex items-center justify-center rounded-lg px-6 py-4 ${countdownBgClass}`}
          role="timer"
          aria-live="assertive"
          aria-atomic="true"
          aria-label={`Session expires in ${formattedRemainingTime}`}
          data-testid={testId ? `${testId}-countdown` : 'session-warning-modal-countdown'}
        >
          <span className={`text-3xl font-bold tabular-nums ${countdownColorClass}`}>
            {formattedRemainingTime}
          </span>
        </div>

        {/* Additional guidance */}
        <p className="text-xs text-neutral-500 text-center leading-relaxed">
          Click <span className="font-medium">Stay Logged In</span> to continue your session, or{' '}
          <span className="font-medium">Log Out</span> to end your session now.
        </p>

        {/* Support contact */}
        <div className="border-t border-neutral-200 pt-4 w-full text-center">
          <p className="text-xs text-neutral-400">
            Need help? Call Member Services at{' '}
            <a
              href={`tel:${SUPPORT.phone.replace(/[^\d]/g, '')}`}
              className="font-medium text-hb-primary hover:text-hb-primary-light transition-colors duration-200"
            >
              {SUPPORT.phoneDisplay}
            </a>
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default SessionWarningModal

export { SessionWarningModal }