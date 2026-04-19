import { useCallback, useMemo } from 'react'
import Modal from '@/components/common/Modal'
import { useEventTagger } from '@/hooks/useEventTagger'
import { BRANDING } from '@/constants/constants'

/**
 * Leaving-site disclaimer modal component.
 *
 * Displays a warning when the user clicks an external link (e.g., National
 * Doctor & Hospital Finder, pharmacy finder, telehealth). Shows the destination
 * URL, a disclaimer message, and continue/cancel buttons. Uses the Modal
 * component for rendering and tags an external_link_click event via
 * useEventTagger when the user confirms navigation.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {function} props.onClose - Callback invoked when the modal should close (cancel action).
 * @param {string} props.destinationUrl - The external URL the user is navigating to.
 * @param {string} [props.destinationLabel] - Optional display label for the destination (e.g., 'Find a Doctor').
 * @param {function} [props.onContinue] - Optional callback invoked after the user confirms navigation.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * <LeavingSiteModal
 *   isOpen={isLeavingSiteOpen}
 *   onClose={() => setIsLeavingSiteOpen(false)}
 *   destinationUrl="https://www.horizonhealthcare.com/find-a-doctor"
 *   destinationLabel="Find a Doctor"
 * />
 *
 * @example
 * <LeavingSiteModal
 *   isOpen={showDisclaimer}
 *   onClose={handleCancel}
 *   destinationUrl={externalUrl}
 *   onContinue={handleExternalNavigation}
 * />
 */
function LeavingSiteModal({
  isOpen,
  onClose,
  destinationUrl,
  destinationLabel,
  onContinue,
  testId,
}) {
  const { tagExternalLinkClick } = useEventTagger()

  /**
   * Extracts the hostname from a URL for display purposes.
   */
  const displayHostname = useMemo(() => {
    if (!destinationUrl) {
      return ''
    }

    try {
      const url = new URL(destinationUrl)
      return url.hostname
    } catch (_error) {
      return destinationUrl
    }
  }, [destinationUrl])

  /**
   * Handles the continue action — tags the event, opens the external link,
   * and closes the modal.
   */
  const handleContinue = useCallback(() => {
    tagExternalLinkClick({
      destinationUrl,
      destinationLabel: destinationLabel || displayHostname,
    })

    if (typeof onContinue === 'function') {
      onContinue()
    }

    try {
      window.open(destinationUrl, '_blank', 'noopener,noreferrer')
    } catch (_error) {
      // Silently fail if popup is blocked
    }

    onClose()
  }, [destinationUrl, destinationLabel, displayHostname, tagExternalLinkClick, onContinue, onClose])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="You are leaving the Member Portal"
      size="sm"
      closeOnOverlayClick
      closeOnEscape
      description="You are about to navigate to an external website that is not part of the Horizon Member Portal."
      primaryAction={{
        label: 'Continue',
        onClick: handleContinue,
        variant: 'primary',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        variant: 'outline-secondary',
      }}
      testId={testId || 'leaving-site-modal'}
    >
      <div className="flex flex-col gap-4">
        {/* Warning icon and message */}
        <div className="hb-alert-warning">
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
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p className="text-sm leading-relaxed">
              You are about to leave the {BRANDING.portalName}. The external website you are
              navigating to is not owned or operated by {BRANDING.companyName}. We are not
              responsible for the content, privacy practices, or security of external sites.
            </p>
          </div>
        </div>

        {/* Destination URL display */}
        {destinationUrl && (
          <div className="bg-surface-secondary border border-neutral-200 rounded-md px-4 py-3">
            {destinationLabel && (
              <p className="text-sm font-medium text-neutral-800 mb-1">
                {destinationLabel}
              </p>
            )}
            <p
              className="text-xs text-neutral-500 break-all font-mono"
              data-testid={testId ? `${testId}-destination-url` : 'leaving-site-modal-destination-url'}
            >
              {destinationUrl}
            </p>
          </div>
        )}

        {/* Additional guidance */}
        <p className="text-xs text-neutral-500 leading-relaxed">
          By clicking <span className="font-medium">Continue</span>, a new browser tab will open
          with the external website. Your {BRANDING.portalName} session will remain active.
        </p>
      </div>
    </Modal>
  )
}

export default LeavingSiteModal

export { LeavingSiteModal }