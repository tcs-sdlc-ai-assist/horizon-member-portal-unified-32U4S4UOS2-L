import { useMemo, useCallback, useRef, useEffect } from 'react'
import { useInstrumentation } from '@/context/InstrumentationProvider'
import { PHI_DATA_ATTRIBUTES } from '@/components/instrumentation/withPrivacyMask'

/**
 * Maps field type shorthand to the corresponding PHI data attribute.
 */
const FIELD_TYPE_ATTRIBUTE_MAP = {
  memberId: 'data-member-id',
  memberName: 'data-member-name',
  claimNumber: 'data-claim-number',
  groupNumber: 'data-group-number',
  subscriberName: 'data-subscriber-name',
  patientName: 'data-patient-name',
  providerName: 'data-provider-name',
  pcpName: 'data-pcp-name',
  dob: 'data-dob',
  ssn: 'data-ssn',
  email: 'data-email',
  phone: 'data-phone',
  address: 'data-address',
  financialAmount: 'data-financial-amount',
}

/**
 * Inline privacy masking wrapper component that applies Glassbox privacy
 * masking data attributes to inline text content. Used to wrap PHI/PII text
 * elements (member IDs, names, financial amounts) throughout the portal so
 * that Glassbox session replay masks their content.
 *
 * Renders a `<span>` element with `data-glassbox-mask="true"`, the appropriate
 * PHI data attribute, and optional CSS classes for styling. Supports all PHI/PII
 * field types defined in the privacy masking system.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The text content to mask.
 * @param {string} [props.fieldType] - The PHI/PII field type shorthand (e.g., 'memberId', 'patientName', 'financialAmount').
 * @param {string} [props.as='span'] - The HTML element to render ('span', 'p', 'div', 'td', 'li').
 * @param {string} [props.className] - Additional CSS class names.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @param {string} [props.ariaLabel] - Accessible label for the masked content.
 * @param {boolean} [props.inline=true] - Whether to render as an inline element.
 * @param {object} [props.style] - Optional inline styles.
 *
 * @example
 * // Mask a member ID
 * <PrivacyMaskedText fieldType="memberId">HZN-884729103</PrivacyMaskedText>
 *
 * @example
 * // Mask a patient name with custom class
 * <PrivacyMaskedText fieldType="patientName" className="font-semibold">
 *   Sarah Mitchell
 * </PrivacyMaskedText>
 *
 * @example
 * // Mask a financial amount rendered as a div
 * <PrivacyMaskedText fieldType="financialAmount" as="div" className="text-lg font-bold">
 *   $1,234.56
 * </PrivacyMaskedText>
 *
 * @example
 * // Generic PHI masking without a specific field type
 * <PrivacyMaskedText>Sensitive information here</PrivacyMaskedText>
 *
 * @example
 * // With aria-label for screen readers
 * <PrivacyMaskedText fieldType="memberId" ariaLabel="Member ID ending in 9103">
 *   HZN-884729103
 * </PrivacyMaskedText>
 */
function PrivacyMaskedText({
  children,
  fieldType,
  as = 'span',
  className = '',
  testId,
  ariaLabel,
  inline = true,
  style,
}) {
  const elementRef = useRef(null)
  const { isInstrumentationEnabled, addMaskedSelectors } = useInstrumentation()

  /**
   * Resolves the PHI data attribute name from the field type shorthand.
   */
  const phiAttribute = useMemo(() => {
    if (!fieldType) {
      return null
    }

    return FIELD_TYPE_ATTRIBUTE_MAP[fieldType] || null
  }, [fieldType])

  /**
   * Builds the props object for the rendered element, including all
   * privacy masking data attributes.
   */
  const elementProps = useMemo(() => {
    const props = {
      'data-glassbox-mask': 'true',
      'data-phi': 'true',
      className: `phi-field ${className}`.trim(),
    }

    if (phiAttribute) {
      props[phiAttribute] = 'true'
    }

    if (testId) {
      props['data-testid'] = testId
    } else {
      props['data-testid'] = fieldType
        ? `privacy-masked-${fieldType}`
        : 'privacy-masked-text'
    }

    if (ariaLabel) {
      props['aria-label'] = ariaLabel
    }

    if (style) {
      props.style = style
    }

    return props
  }, [phiAttribute, className, testId, ariaLabel, style, fieldType])

  /**
   * Register the PHI field selector with the instrumentation provider
   * so Glassbox SDK is aware of this masked field.
   */
  useEffect(() => {
    if (isInstrumentationEnabled && phiAttribute) {
      addMaskedSelectors([`[${phiAttribute}]`])
    }
  }, [isInstrumentationEnabled, phiAttribute, addMaskedSelectors])

  /**
   * Ensure the masking attribute is applied after mount and on updates,
   * in case dynamic content changes.
   */
  useEffect(() => {
    if (elementRef.current && !elementRef.current.hasAttribute('data-glassbox-mask')) {
      elementRef.current.setAttribute('data-glassbox-mask', 'true')
    }
  })

  /**
   * Resolves the allowed HTML element tag. Falls back to 'span' for
   * unrecognized values to prevent rendering arbitrary elements.
   */
  const allowedTags = useMemo(
    () => new Set(['span', 'p', 'div', 'td', 'li', 'strong', 'em', 'label']),
    [],
  )

  const Tag = useMemo(() => {
    if (allowedTags.has(as)) {
      return as
    }
    return 'span'
  }, [as, allowedTags])

  return (
    <Tag ref={elementRef} {...elementProps}>
      {children}
    </Tag>
  )
}

export default PrivacyMaskedText

export { PrivacyMaskedText, FIELD_TYPE_ATTRIBUTE_MAP }