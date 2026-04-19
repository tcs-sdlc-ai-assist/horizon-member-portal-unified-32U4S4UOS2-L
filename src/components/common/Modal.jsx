import { useEffect, useRef, useCallback, useState } from 'react'
import { setupDialogFocus, generateAriaId, announceToScreenReader } from '@/utils/accessibility'

/**
 * Reusable accessible modal component with Honeybee CSS classes.
 *
 * Supports title, body content, action buttons, close button, focus trapping,
 * Escape key close, and ARIA attributes. Used for session warning, leaving-site
 * disclaimer, ID card enlarge, and widget customization.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {function} props.onClose - Callback invoked when the modal should close.
 * @param {string} [props.title] - Modal title text.
 * @param {React.ReactNode} [props.children] - Modal body content.
 * @param {string} [props.size='md'] - Modal size variant: 'sm', 'md', 'lg', 'xl', 'full'.
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close (X) button in the header.
 * @param {boolean} [props.closeOnOverlayClick=true] - Whether clicking the overlay closes the modal.
 * @param {boolean} [props.closeOnEscape=true] - Whether pressing Escape closes the modal.
 * @param {React.ReactNode} [props.footer] - Custom footer content (overrides primaryAction/secondaryAction).
 * @param {object} [props.primaryAction] - Primary action button configuration.
 * @param {string} [props.primaryAction.label] - Button label text.
 * @param {function} [props.primaryAction.onClick] - Button click handler.
 * @param {boolean} [props.primaryAction.disabled] - Whether the button is disabled.
 * @param {boolean} [props.primaryAction.loading] - Whether the button shows a loading state.
 * @param {string} [props.primaryAction.variant] - Button variant class suffix (e.g., 'primary', 'danger').
 * @param {object} [props.secondaryAction] - Secondary action button configuration.
 * @param {string} [props.secondaryAction.label] - Button label text.
 * @param {function} [props.secondaryAction.onClick] - Button click handler.
 * @param {boolean} [props.secondaryAction.disabled] - Whether the button is disabled.
 * @param {string} [props.secondaryAction.variant] - Button variant class suffix.
 * @param {string} [props.description] - Accessible description text for the modal (aria-describedby).
 * @param {string} [props.className] - Additional CSS class names for the modal container.
 * @param {string} [props.overlayClassName] - Additional CSS class names for the overlay.
 * @param {string} [props.bodyClassName] - Additional CSS class names for the modal body.
 * @param {boolean} [props.hideHeader=false] - Whether to hide the modal header entirely.
 * @param {string} [props.ariaLabel] - Explicit aria-label for the modal (used when title is not provided).
 * @param {React.ReactNode} [props.headerContent] - Custom header content (replaces default title rendering).
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @param {function} [props.onAfterOpen] - Callback invoked after the modal opens and focus is trapped.
 * @param {function} [props.onAfterClose] - Callback invoked after the modal closes.
 *
 * @example
 * <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Action">
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 *
 * @example
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Session Expiring"
 *   size="sm"
 *   primaryAction={{ label: 'Stay Logged In', onClick: handleExtend }}
 *   secondaryAction={{ label: 'Log Out', onClick: handleLogout, variant: 'outline-secondary' }}
 * >
 *   <p>Your session is about to expire.</p>
 * </Modal>
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  primaryAction,
  secondaryAction,
  description,
  className = '',
  overlayClassName = '',
  bodyClassName = '',
  hideHeader = false,
  ariaLabel,
  headerContent,
  testId,
  onAfterOpen,
  onAfterClose,
}) {
  const modalRef = useRef(null)
  const overlayRef = useRef(null)
  const cleanupFocusTrapRef = useRef(null)
  const [ids] = useState(() => ({
    title: generateAriaId('hb-modal-title'),
    description: generateAriaId('hb-modal-desc'),
  }))
  const wasOpenRef = useRef(false)

  // Size class mapping
  const sizeClassMap = {
    sm: 'hb-modal-sm',
    md: 'hb-modal-md',
    lg: 'hb-modal-lg',
    xl: 'hb-modal-xl',
    full: 'hb-modal-full',
  }

  const modalSizeClass = sizeClassMap[size] || sizeClassMap.md

  /**
   * Handles overlay click — closes modal if closeOnOverlayClick is enabled.
   */
  const handleOverlayClick = useCallback(
    (event) => {
      if (closeOnOverlayClick && event.target === overlayRef.current) {
        onClose()
      }
    },
    [closeOnOverlayClick, onClose],
  )

  /**
   * Handles close via the Escape key callback from focus trap.
   */
  const handleEscapeClose = useCallback(() => {
    if (closeOnEscape) {
      onClose()
    }
  }, [closeOnEscape, onClose])

  // Set up focus trap and body scroll lock when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Lock body scroll
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      // Set up focus trap with dialog ARIA attributes
      cleanupFocusTrapRef.current = setupDialogFocus(modalRef.current, {
        labelledBy: title ? ids.title : undefined,
        describedBy: description ? ids.description : undefined,
        onClose: handleEscapeClose,
      })

      // Announce modal to screen readers
      if (title) {
        announceToScreenReader(`${title} dialog opened`, { priority: 'assertive' })
      }

      if (typeof onAfterOpen === 'function') {
        onAfterOpen()
      }

      wasOpenRef.current = true

      return () => {
        document.body.style.overflow = originalOverflow

        if (cleanupFocusTrapRef.current) {
          cleanupFocusTrapRef.current()
          cleanupFocusTrapRef.current = null
        }
      }
    }

    // Handle close transition
    if (!isOpen && wasOpenRef.current) {
      wasOpenRef.current = false

      if (typeof onAfterClose === 'function') {
        onAfterClose()
      }
    }

    return undefined
  }, [isOpen, title, description, ids.title, ids.description, handleEscapeClose, onAfterOpen, onAfterClose])

  // Clean up on unmount
  useEffect(
    () => () => {
      if (cleanupFocusTrapRef.current) {
        cleanupFocusTrapRef.current()
        cleanupFocusTrapRef.current = null
      }
    },
    [],
  )

  if (!isOpen) {
    return null
  }

  /**
   * Resolves the button variant class for an action button.
   */
  const getButtonVariantClass = (variant = 'primary') => {
    const variantMap = {
      primary: 'hb-btn-primary',
      secondary: 'hb-btn-secondary',
      accent: 'hb-btn-accent',
      outline: 'hb-btn-outline',
      'outline-secondary': 'hb-btn-outline-secondary',
      ghost: 'hb-btn-ghost',
      danger: 'hb-btn-danger',
      success: 'hb-btn-success',
      link: 'hb-btn-link',
    }

    return variantMap[variant] || variantMap.primary
  }

  const hasFooter = footer || primaryAction || secondaryAction
  const hasHeader = !hideHeader && (title || headerContent || showCloseButton)

  return (
    <div
      ref={overlayRef}
      className={`hb-modal-overlay ${overlayClassName}`.trim()}
      onClick={handleOverlayClick}
      data-testid={testId ? `${testId}-overlay` : 'modal-overlay'}
    >
      <div
        ref={modalRef}
        className={`${modalSizeClass} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? ids.title : undefined}
        aria-label={!title && ariaLabel ? ariaLabel : undefined}
        aria-describedby={description ? ids.description : undefined}
        data-testid={testId || 'modal'}
      >
        {/* Header */}
        {hasHeader && (
          <div className="hb-modal-header">
            {headerContent || (
              <h2 id={ids.title} className="hb-modal-title">
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                type="button"
                className="hb-btn-icon hb-btn-ghost text-neutral-400 hover:text-neutral-600"
                onClick={onClose}
                aria-label="Close dialog"
                data-testid={testId ? `${testId}-close-btn` : 'modal-close-btn'}
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Description (visually hidden, for screen readers) */}
        {description && (
          <div id={ids.description} className="hb-sr-only">
            {description}
          </div>
        )}

        {/* Body */}
        <div
          className={`hb-modal-body ${bodyClassName}`.trim()}
          data-testid={testId ? `${testId}-body` : 'modal-body'}
        >
          {children}
        </div>

        {/* Footer */}
        {hasFooter && (
          <div
            className="hb-modal-footer"
            data-testid={testId ? `${testId}-footer` : 'modal-footer'}
          >
            {footer || (
              <>
                {secondaryAction && (
                  <button
                    type="button"
                    className={`hb-btn-md ${getButtonVariantClass(secondaryAction.variant || 'outline-secondary')}`}
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                    data-testid={testId ? `${testId}-secondary-btn` : 'modal-secondary-btn'}
                  >
                    {secondaryAction.label}
                  </button>
                )}

                {primaryAction && (
                  <button
                    type="button"
                    className={`hb-btn-md ${getButtonVariantClass(primaryAction.variant || 'primary')}`}
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled || primaryAction.loading}
                    data-testid={testId ? `${testId}-primary-btn` : 'modal-primary-btn'}
                  >
                    {primaryAction.loading && (
                      <span className="hb-spinner-sm" aria-hidden="true" />
                    )}
                    {primaryAction.label}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal

export { Modal }