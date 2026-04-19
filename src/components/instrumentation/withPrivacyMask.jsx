import { forwardRef, useEffect, useRef, useCallback, useMemo } from 'react'
import { useInstrumentation } from '@/context/InstrumentationProvider'

// -----------------------------------------------------------------------------
// Default PHI/PII Selectors — DOM elements that should be masked in replays
// -----------------------------------------------------------------------------
const DEFAULT_FIELD_SELECTORS = [
  '[data-phi]',
  '[data-pii]',
  '[data-mask]',
  '.phi-field',
  '.pii-field',
]

// -----------------------------------------------------------------------------
// Default PHI/PII Data Attribute Patterns
// -----------------------------------------------------------------------------
const PHI_DATA_ATTRIBUTES = [
  'data-member-id',
  'data-member-name',
  'data-claim-number',
  'data-group-number',
  'data-subscriber-name',
  'data-patient-name',
  'data-provider-name',
  'data-pcp-name',
  'data-dob',
  'data-ssn',
  'data-email',
  'data-phone',
  'data-address',
  'data-financial-amount',
]

/**
 * Applies the Glassbox privacy masking data attribute to all matching elements
 * within a container.
 *
 * @param {HTMLElement} container - The container element to scan.
 * @param {string[]} selectors - Array of CSS selectors identifying PHI/PII elements.
 */
const applyMaskAttributes = (container, selectors) => {
  if (!container || !(container instanceof HTMLElement)) {
    return
  }

  const combinedSelector = selectors.join(', ')

  if (!combinedSelector) {
    return
  }

  try {
    const elements = container.querySelectorAll(combinedSelector)

    elements.forEach((el) => {
      if (!el.hasAttribute('data-glassbox-mask')) {
        el.setAttribute('data-glassbox-mask', 'true')
      }
    })
  } catch (_error) {
    // Silently fail if selectors are invalid
  }

  // Also mask elements with PHI data attributes
  PHI_DATA_ATTRIBUTES.forEach((attr) => {
    try {
      const elements = container.querySelectorAll(`[${attr}]`)

      elements.forEach((el) => {
        if (!el.hasAttribute('data-glassbox-mask')) {
          el.setAttribute('data-glassbox-mask', 'true')
        }
      })
    } catch (_error) {
      // Silently fail for invalid attribute selectors
    }
  })
}

/**
 * Higher-order component that applies Glassbox privacy masking data attributes
 * to wrapped components. Scans the rendered DOM for PHI/PII fields and adds
 * `data-glassbox-mask="true"` to matching elements so that Glassbox session
 * replay masks their content.
 *
 * @param {React.ComponentType} WrappedComponent - The component to wrap.
 * @param {string[]} [fieldSelectors] - Additional CSS selectors identifying PHI/PII fields to mask.
 * @returns {React.ComponentType} The wrapped component with privacy masking applied.
 *
 * @example
 * // Basic usage
 * export default withPrivacyMask(MemberIdCard)
 *
 * @example
 * // With custom selectors
 * export default withPrivacyMask(ClaimDetail, ['.claim-amount', '.provider-info'])
 */
const withPrivacyMask = (WrappedComponent, fieldSelectors = []) => {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'

  const PrivacyMaskedComponent = forwardRef((props, ref) => {
    const containerRef = useRef(null)
    const observerRef = useRef(null)
    const { isInstrumentationEnabled, addMaskedSelectors } = useInstrumentation()

    // Merge default selectors with component-specific selectors and any passed via props
    const allSelectors = useMemo(() => {
      const propSelectors = props.maskSelectors || []
      const merged = [
        ...DEFAULT_FIELD_SELECTORS,
        ...fieldSelectors,
        ...propSelectors,
      ]

      // Deduplicate
      return [...new Set(merged)]
    }, [props.maskSelectors])

    // Apply masking to the container element
    const applyMasking = useCallback(() => {
      if (!containerRef.current) {
        return
      }

      applyMaskAttributes(containerRef.current, allSelectors)

      // Also mark the container itself if it has PHI attributes
      PHI_DATA_ATTRIBUTES.forEach((attr) => {
        if (containerRef.current.hasAttribute(attr)) {
          containerRef.current.setAttribute('data-glassbox-mask', 'true')
        }
      })
    }, [allSelectors])

    // Register selectors with the instrumentation provider
    useEffect(() => {
      if (isInstrumentationEnabled && fieldSelectors.length > 0) {
        addMaskedSelectors(fieldSelectors)
      }
    }, [isInstrumentationEnabled, addMaskedSelectors])

    // Apply masking on mount and observe DOM mutations for dynamic content
    useEffect(() => {
      // Initial masking pass
      applyMasking()

      const container = containerRef.current

      if (!container) {
        return
      }

      // Observe DOM mutations to re-apply masking when content changes
      try {
        observerRef.current = new MutationObserver(() => {
          applyMasking()
        })

        observerRef.current.observe(container, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: PHI_DATA_ATTRIBUTES,
        })
      } catch (_error) {
        // MutationObserver not available — masking applied only on mount
      }

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect()
          observerRef.current = null
        }
      }
    }, [applyMasking])

    // Re-apply masking when instrumentation state changes
    useEffect(() => {
      if (isInstrumentationEnabled) {
        applyMasking()
      }
    }, [isInstrumentationEnabled, applyMasking])

    // Extract maskSelectors from props so it doesn't get passed to the DOM
    const { maskSelectors: _maskSelectors, ...restProps } = props

    // Combine refs if an external ref is provided
    const setRefs = useCallback(
      (node) => {
        containerRef.current = node

        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref],
    )

    return (
      <div
        ref={setRefs}
        data-privacy-masked="true"
        data-testid="privacy-mask-container"
      >
        <WrappedComponent {...restProps} />
      </div>
    )
  })

  PrivacyMaskedComponent.displayName = `withPrivacyMask(${displayName})`

  return PrivacyMaskedComponent
}

export default withPrivacyMask

export { withPrivacyMask, applyMaskAttributes, DEFAULT_FIELD_SELECTORS, PHI_DATA_ATTRIBUTES }