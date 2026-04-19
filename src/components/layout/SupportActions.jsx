import { useCallback, useState } from 'react'
import { SUPPORT, EXTERNAL_URLS } from '@/constants/constants'
import { useEventTagger } from '@/hooks/useEventTagger'
import LeavingSiteModal from '@/components/common/LeavingSiteModal'

/**
 * Header support action buttons/links component.
 *
 * Renders inline action links for Email, Chat, and Call support channels
 * in the portal header. Email opens a mailto link, Call opens a tel link,
 * and Chat opens an external URL via the LeavingSiteModal disclaimer.
 * Each action is tagged via useEventTagger for analytics tracking.
 * Styled with Honeybee CSS classes.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.size='md'] - Size variant: 'sm', 'md', 'lg'.
 * @param {boolean} [props.showLabels=true] - Whether to display text labels next to icons.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <SupportActions />
 *
 * @example
 * <SupportActions size="sm" showLabels={false} className="ml-4" />
 */
function SupportActions({
  className = '',
  size = 'md',
  showLabels = true,
  testId,
}) {
  const { tagSupportContact } = useEventTagger()
  const [isLeavingSiteOpen, setIsLeavingSiteOpen] = useState(false)

  /**
   * Size class mapping for icons.
   */
  const iconSizeClassMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const labelSizeClassMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const iconSizeClass = iconSizeClassMap[size] || iconSizeClassMap.md
  const labelSizeClass = labelSizeClassMap[size] || labelSizeClassMap.md

  /**
   * Handles the email support action.
   */
  const handleEmail = useCallback(() => {
    tagSupportContact({
      channel: 'email',
      destination: SUPPORT.email,
    })

    try {
      window.location.href = `mailto:${SUPPORT.email}`
    } catch (_error) {
      // Silently fail if mailto is not supported
    }
  }, [tagSupportContact])

  /**
   * Handles the call support action.
   */
  const handleCall = useCallback(() => {
    tagSupportContact({
      channel: 'phone',
      destination: SUPPORT.phone,
    })

    try {
      window.location.href = `tel:${SUPPORT.phone.replace(/[^\d]/g, '')}`
    } catch (_error) {
      // Silently fail if tel is not supported
    }
  }, [tagSupportContact])

  /**
   * Handles the chat support action — opens the leaving site modal.
   */
  const handleChatClick = useCallback(() => {
    setIsLeavingSiteOpen(true)
  }, [])

  /**
   * Handles the chat continue action after the leaving site modal is confirmed.
   */
  const handleChatContinue = useCallback(() => {
    tagSupportContact({
      channel: 'chat',
      destination: SUPPORT.chatUrl,
    })
  }, [tagSupportContact])

  return (
    <>
      <div
        className={`flex items-center gap-1 ${className}`.trim()}
        role="group"
        aria-label="Support actions"
        data-testid={testId || 'support-actions'}
      >
        {/* Email */}
        <button
          type="button"
          className="hb-btn-icon hb-btn-ghost flex items-center gap-1.5 text-neutral-600 hover:text-hb-primary transition-colors duration-150 rounded-md px-2 py-1.5"
          onClick={handleEmail}
          aria-label={`Email support at ${SUPPORT.email}`}
          data-testid={testId ? `${testId}-email` : 'support-actions-email'}
        >
          <svg
            className={`${iconSizeClass} flex-shrink-0`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          {showLabels && (
            <span className={`${labelSizeClass} font-medium hidden sm:inline-block`}>
              Email
            </span>
          )}
        </button>

        {/* Chat */}
        <button
          type="button"
          className="hb-btn-icon hb-btn-ghost flex items-center gap-1.5 text-neutral-600 hover:text-hb-primary transition-colors duration-150 rounded-md px-2 py-1.5"
          onClick={handleChatClick}
          aria-label="Open live chat support"
          data-testid={testId ? `${testId}-chat` : 'support-actions-chat'}
        >
          <svg
            className={`${iconSizeClass} flex-shrink-0`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {showLabels && (
            <span className={`${labelSizeClass} font-medium hidden sm:inline-block`}>
              Chat
            </span>
          )}
        </button>

        {/* Call */}
        <button
          type="button"
          className="hb-btn-icon hb-btn-ghost flex items-center gap-1.5 text-neutral-600 hover:text-hb-primary transition-colors duration-150 rounded-md px-2 py-1.5"
          onClick={handleCall}
          aria-label={`Call support at ${SUPPORT.phoneDisplay}`}
          data-testid={testId ? `${testId}-call` : 'support-actions-call'}
        >
          <svg
            className={`${iconSizeClass} flex-shrink-0`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {showLabels && (
            <span className={`${labelSizeClass} font-medium hidden sm:inline-block`}>
              Call
            </span>
          )}
        </button>
      </div>

      {/* Leaving Site Modal for Chat */}
      <LeavingSiteModal
        isOpen={isLeavingSiteOpen}
        onClose={() => setIsLeavingSiteOpen(false)}
        destinationUrl={SUPPORT.chatUrl}
        destinationLabel="Live Chat Support"
        onContinue={handleChatContinue}
        testId={testId ? `${testId}-leaving-site-modal` : 'support-actions-leaving-site-modal'}
      />
    </>
  )
}

export default SupportActions

export { SupportActions }