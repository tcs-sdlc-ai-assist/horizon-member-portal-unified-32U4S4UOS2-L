import { A11Y, ANIMATION } from '@/constants/constants'

// -----------------------------------------------------------------------------
// Accessibility Utility Functions
// -----------------------------------------------------------------------------

/**
 * Selectors for all focusable elements within a container.
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
  'details > summary',
  'audio[controls]',
  'video[controls]',
].join(', ')

// -----------------------------------------------------------------------------
// Focus Management
// -----------------------------------------------------------------------------

/**
 * Returns all focusable elements within a given container.
 * @param {HTMLElement} container - The container element to search within.
 * @returns {HTMLElement[]} Array of focusable elements.
 */
const getFocusableElements = (container) => {
  if (!container || !(container instanceof HTMLElement)) {
    return []
  }

  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS))

  return elements.filter((el) => {
    if (el.offsetParent === null && el.getAttribute('type') !== 'hidden') {
      return false
    }
    return !el.hasAttribute('aria-hidden') || el.getAttribute('aria-hidden') !== 'true'
  })
}

/**
 * Returns the first focusable element within a container.
 * @param {HTMLElement} container - The container element to search within.
 * @returns {HTMLElement|null} The first focusable element, or null.
 */
const getFirstFocusableElement = (container) => {
  const elements = getFocusableElements(container)
  return elements.length > 0 ? elements[0] : null
}

/**
 * Returns the last focusable element within a container.
 * @param {HTMLElement} container - The container element to search within.
 * @returns {HTMLElement|null} The last focusable element, or null.
 */
const getLastFocusableElement = (container) => {
  const elements = getFocusableElements(container)
  return elements.length > 0 ? elements[elements.length - 1] : null
}

/**
 * Moves focus to a specific element safely.
 * @param {HTMLElement} element - The element to focus.
 * @param {object} [options] - Focus options.
 * @param {boolean} [options.preventScroll=false] - Whether to prevent scrolling on focus.
 */
const moveFocus = (element, options = {}) => {
  const { preventScroll = false } = options

  if (!element || !(element instanceof HTMLElement)) {
    return
  }

  try {
    element.focus({ preventScroll })
  } catch (_error) {
    // Silently fail if focus cannot be set
  }
}

// -----------------------------------------------------------------------------
// Focus Trap (for Modals and Dialogs)
// -----------------------------------------------------------------------------

/**
 * Creates a focus trap within a container element.
 * Returns a cleanup function to remove the trap.
 *
 * @param {HTMLElement} container - The container element to trap focus within.
 * @param {object} [options] - Configuration options.
 * @param {boolean} [options.initialFocus=true] - Whether to focus the first focusable element on creation.
 * @param {HTMLElement} [options.initialFocusElement] - Specific element to focus initially.
 * @param {HTMLElement} [options.returnFocusElement] - Element to return focus to on cleanup.
 * @param {boolean} [options.returnFocusOnDeactivate=true] - Whether to return focus on cleanup.
 * @param {function} [options.onEscape] - Callback invoked when Escape key is pressed.
 * @returns {function} Cleanup function to remove the focus trap.
 */
const trapFocus = (container, options = {}) => {
  const {
    initialFocus = true,
    initialFocusElement = null,
    returnFocusElement = null,
    returnFocusOnDeactivate = true,
    onEscape,
  } = options

  if (!container || !(container instanceof HTMLElement)) {
    return () => {}
  }

  const previouslyFocusedElement = returnFocusElement || document.activeElement

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && typeof onEscape === 'function') {
      event.preventDefault()
      onEscape(event)
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusableElements = getFocusableElements(container)

    if (focusableElements.length === 0) {
      event.preventDefault()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
        event.preventDefault()
        moveFocus(lastElement)
      }
    } else {
      if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
        event.preventDefault()
        moveFocus(firstElement)
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  if (initialFocus) {
    const elementToFocus = initialFocusElement || getFirstFocusableElement(container)
    if (elementToFocus) {
      requestAnimationFrame(() => {
        moveFocus(elementToFocus)
      })
    }
  }

  const cleanup = () => {
    container.removeEventListener('keydown', handleKeyDown)

    if (returnFocusOnDeactivate && previouslyFocusedElement && previouslyFocusedElement instanceof HTMLElement) {
      try {
        moveFocus(previouslyFocusedElement)
      } catch (_error) {
        // Silently fail if return focus element is no longer in the DOM
      }
    }
  }

  return cleanup
}

// -----------------------------------------------------------------------------
// Screen Reader Announcements (Live Region)
// -----------------------------------------------------------------------------

/**
 * Ensures the live region element exists in the DOM.
 * @returns {HTMLElement} The live region element.
 */
const ensureLiveRegion = () => {
  let liveRegion = document.getElementById(A11Y.liveRegionId)

  if (!liveRegion) {
    liveRegion = document.createElement('div')
    liveRegion.id = A11Y.liveRegionId
    liveRegion.setAttribute('role', 'status')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'hb-sr-only'
    document.body.appendChild(liveRegion)
  }

  return liveRegion
}

/**
 * Announces a message to screen readers via a live region.
 *
 * @param {string} message - The message to announce.
 * @param {object} [options] - Configuration options.
 * @param {string} [options.priority='polite'] - The aria-live priority ('polite' or 'assertive').
 * @param {number} [options.delay] - Delay in ms before announcing (defaults to A11Y.announcerDelay).
 * @param {boolean} [options.clearAfter=true] - Whether to clear the message after announcement.
 * @param {number} [options.clearDelay=5000] - Delay in ms before clearing the message.
 */
const announceToScreenReader = (message, options = {}) => {
  const {
    priority = 'polite',
    delay = A11Y.announcerDelay,
    clearAfter = true,
    clearDelay = 5000,
  } = options

  if (!message || typeof message !== 'string') {
    return
  }

  const liveRegion = ensureLiveRegion()

  liveRegion.setAttribute('aria-live', priority)

  // Clear first to ensure re-announcement of identical messages
  liveRegion.textContent = ''

  setTimeout(() => {
    liveRegion.textContent = message

    if (clearAfter) {
      setTimeout(() => {
        if (liveRegion.textContent === message) {
          liveRegion.textContent = ''
        }
      }, clearDelay)
    }
  }, delay)
}

// -----------------------------------------------------------------------------
// Keyboard Navigation
// -----------------------------------------------------------------------------

/**
 * Handles keyboard navigation within a list of items (e.g., dropdown menus, tab lists).
 *
 * @param {KeyboardEvent} event - The keyboard event.
 * @param {HTMLElement[]} items - Array of navigable elements.
 * @param {object} [options] - Configuration options.
 * @param {string} [options.orientation='vertical'] - Navigation orientation ('vertical' or 'horizontal').
 * @param {boolean} [options.loop=true] - Whether navigation wraps around at the ends.
 * @param {function} [options.onSelect] - Callback invoked when Enter or Space is pressed on an item.
 * @param {function} [options.onEscape] - Callback invoked when Escape is pressed.
 * @param {function} [options.onTab] - Callback invoked when Tab is pressed.
 * @returns {boolean} Whether the event was handled.
 */
const handleKeyboardNavigation = (event, items, options = {}) => {
  const {
    orientation = 'vertical',
    loop = true,
    onSelect,
    onEscape,
    onTab,
  } = options

  if (!event || !items || items.length === 0) {
    return false
  }

  const currentIndex = items.indexOf(document.activeElement)

  const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
  const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'

  switch (event.key) {
    case nextKey: {
      event.preventDefault()
      let nextIndex = currentIndex + 1

      if (nextIndex >= items.length) {
        nextIndex = loop ? 0 : items.length - 1
      }

      moveFocus(items[nextIndex])
      return true
    }

    case prevKey: {
      event.preventDefault()
      let prevIndex = currentIndex - 1

      if (prevIndex < 0) {
        prevIndex = loop ? items.length - 1 : 0
      }

      moveFocus(items[prevIndex])
      return true
    }

    case 'Home': {
      event.preventDefault()
      moveFocus(items[0])
      return true
    }

    case 'End': {
      event.preventDefault()
      moveFocus(items[items.length - 1])
      return true
    }

    case 'Enter':
    case ' ': {
      if (typeof onSelect === 'function' && currentIndex >= 0) {
        event.preventDefault()
        onSelect(items[currentIndex], currentIndex, event)
        return true
      }
      return false
    }

    case 'Escape': {
      if (typeof onEscape === 'function') {
        event.preventDefault()
        onEscape(event)
        return true
      }
      return false
    }

    case 'Tab': {
      if (typeof onTab === 'function') {
        onTab(event)
        return true
      }
      return false
    }

    default:
      return false
  }
}

// -----------------------------------------------------------------------------
// ARIA ID Generation
// -----------------------------------------------------------------------------

/**
 * Counter for generating unique IDs.
 */
let ariaIdCounter = 0

/**
 * Generates a unique ARIA-compatible ID string.
 *
 * @param {string} [prefix='hb'] - The prefix for the generated ID.
 * @returns {string} A unique ID string (e.g., 'hb-modal-1', 'hb-dropdown-2').
 */
const generateAriaId = (prefix = 'hb') => {
  ariaIdCounter += 1
  return `${prefix}-${ariaIdCounter}`
}

/**
 * Resets the ARIA ID counter. Useful for testing.
 */
const resetAriaIdCounter = () => {
  ariaIdCounter = 0
}

// -----------------------------------------------------------------------------
// Dialog Focus Management
// -----------------------------------------------------------------------------

/**
 * Sets up focus management for a dialog/modal element.
 * Applies appropriate ARIA attributes and traps focus.
 *
 * @param {HTMLElement} dialogElement - The dialog container element.
 * @param {object} [options] - Configuration options.
 * @param {string} [options.labelledBy] - ID of the element that labels the dialog.
 * @param {string} [options.describedBy] - ID of the element that describes the dialog.
 * @param {function} [options.onClose] - Callback invoked when the dialog should close.
 * @param {HTMLElement} [options.initialFocusElement] - Specific element to focus initially.
 * @returns {function} Cleanup function to remove focus management.
 */
const setupDialogFocus = (dialogElement, options = {}) => {
  const {
    labelledBy,
    describedBy,
    onClose,
    initialFocusElement,
  } = options

  if (!dialogElement || !(dialogElement instanceof HTMLElement)) {
    return () => {}
  }

  dialogElement.setAttribute('role', 'dialog')
  dialogElement.setAttribute('aria-modal', 'true')

  if (labelledBy) {
    dialogElement.setAttribute('aria-labelledby', labelledBy)
  }

  if (describedBy) {
    dialogElement.setAttribute('aria-describedby', describedBy)
  }

  const cleanupTrap = trapFocus(dialogElement, {
    initialFocus: true,
    initialFocusElement,
    returnFocusOnDeactivate: true,
    onEscape: onClose,
  })

  return () => {
    cleanupTrap()
    dialogElement.removeAttribute('aria-modal')
  }
}

// -----------------------------------------------------------------------------
// Dropdown Focus Management
// -----------------------------------------------------------------------------

/**
 * Sets up focus management for a dropdown menu.
 * Handles keyboard navigation and ARIA attributes.
 *
 * @param {HTMLElement} triggerElement - The button/element that triggers the dropdown.
 * @param {HTMLElement} menuElement - The dropdown menu container element.
 * @param {object} [options] - Configuration options.
 * @param {function} [options.onClose] - Callback invoked when the dropdown should close.
 * @param {function} [options.onSelect] - Callback invoked when a menu item is selected.
 * @param {string} [options.orientation='vertical'] - Navigation orientation.
 * @returns {function} Cleanup function to remove dropdown focus management.
 */
const setupDropdownFocus = (triggerElement, menuElement, options = {}) => {
  const {
    onClose,
    onSelect,
    orientation = 'vertical',
  } = options

  if (!triggerElement || !menuElement) {
    return () => {}
  }

  const menuId = menuElement.id || generateAriaId('hb-dropdown-menu')
  menuElement.id = menuId

  triggerElement.setAttribute('aria-haspopup', 'true')
  triggerElement.setAttribute('aria-expanded', 'true')
  triggerElement.setAttribute('aria-controls', menuId)

  menuElement.setAttribute('role', 'menu')

  const menuItems = getFocusableElements(menuElement)

  menuItems.forEach((item) => {
    if (!item.getAttribute('role')) {
      item.setAttribute('role', 'menuitem')
    }
  })

  const handleMenuKeyDown = (event) => {
    handleKeyboardNavigation(event, menuItems, {
      orientation,
      loop: true,
      onSelect: (item, index, evt) => {
        if (typeof onSelect === 'function') {
          onSelect(item, index, evt)
        }
      },
      onEscape: () => {
        if (typeof onClose === 'function') {
          onClose()
        }
        moveFocus(triggerElement)
      },
      onTab: () => {
        if (typeof onClose === 'function') {
          onClose()
        }
      },
    })
  }

  menuElement.addEventListener('keydown', handleMenuKeyDown)

  if (menuItems.length > 0) {
    requestAnimationFrame(() => {
      moveFocus(menuItems[0])
    })
  }

  const cleanup = () => {
    menuElement.removeEventListener('keydown', handleMenuKeyDown)
    triggerElement.setAttribute('aria-expanded', 'false')
    triggerElement.removeAttribute('aria-controls')
  }

  return cleanup
}

// -----------------------------------------------------------------------------
// Skip Navigation
// -----------------------------------------------------------------------------

/**
 * Handles skip navigation link activation.
 * Moves focus to the main content area.
 *
 * @param {Event} [event] - The click or keydown event.
 */
const handleSkipToContent = (event) => {
  if (event) {
    event.preventDefault()
  }

  const mainContent = document.getElementById(A11Y.skipNavId)

  if (mainContent) {
    if (!mainContent.hasAttribute('tabindex')) {
      mainContent.setAttribute('tabindex', '-1')
    }

    moveFocus(mainContent)
  }
}

// -----------------------------------------------------------------------------
// Reduced Motion Detection
// -----------------------------------------------------------------------------

/**
 * Checks if the user prefers reduced motion.
 * @returns {boolean} True if the user prefers reduced motion.
 */
const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch (_error) {
    return false
  }
}

/**
 * Returns the appropriate animation duration based on user preference.
 * @param {number} duration - The desired animation duration in ms.
 * @returns {number} The duration, or 0 if reduced motion is preferred.
 */
const getAnimationDuration = (duration = ANIMATION.base) => {
  if (prefersReducedMotion()) {
    return 0
  }
  return duration
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const accessibility = {
  getFocusableElements,
  getFirstFocusableElement,
  getLastFocusableElement,
  moveFocus,
  trapFocus,
  announceToScreenReader,
  handleKeyboardNavigation,
  generateAriaId,
  resetAriaIdCounter,
  setupDialogFocus,
  setupDropdownFocus,
  handleSkipToContent,
  prefersReducedMotion,
  getAnimationDuration,
}

export default accessibility

export {
  getFocusableElements,
  getFirstFocusableElement,
  getLastFocusableElement,
  moveFocus,
  trapFocus,
  announceToScreenReader,
  handleKeyboardNavigation,
  generateAriaId,
  resetAriaIdCounter,
  setupDialogFocus,
  setupDropdownFocus,
  handleSkipToContent,
  prefersReducedMotion,
  getAnimationDuration,
}