import { Link } from 'react-router-dom'
import { BRANDING } from '@/constants/constants'

/**
 * Horizon BCBSNJ branding logo component.
 *
 * Renders the logo image from the branding asset URL with proper alt text,
 * responsive sizing, and an optional link to the dashboard. Supports small
 * and default logo variants, custom sizing, and click handling.
 *
 * @param {object} props - Component props.
 * @param {string} [props.variant='default'] - Logo variant: 'default' or 'small'.
 * @param {boolean} [props.linkToDashboard=true] - Whether the logo links to the dashboard route.
 * @param {string} [props.className] - Additional CSS class names for the container.
 * @param {string} [props.imgClassName] - Additional CSS class names for the image element.
 * @param {number} [props.width] - Explicit width override in pixels.
 * @param {number} [props.height] - Explicit height override in pixels.
 * @param {function} [props.onClick] - Optional click handler.
 * @param {string} [props.testId] - data-testid attribute for testing.
 *
 * @example
 * // Default logo linked to dashboard
 * <Logo />
 *
 * @example
 * // Small logo variant without link
 * <Logo variant="small" linkToDashboard={false} />
 *
 * @example
 * // Custom sized logo with click handler
 * <Logo width={160} height={58} onClick={handleLogoClick} />
 */
function Logo({
  variant = 'default',
  linkToDashboard = true,
  className = '',
  imgClassName = '',
  width,
  height,
  onClick,
  testId,
}) {
  const isSmall = variant === 'small'
  const logoSrc = isSmall ? BRANDING.logoSmallUrl : BRANDING.logoUrl
  const altText = BRANDING.logoAltText

  const defaultWidth = isSmall ? 40 : 200
  const defaultHeight = isSmall ? 40 : 72

  const resolvedWidth = width || defaultWidth
  const resolvedHeight = height || defaultHeight

  const imageElement = (
    <img
      src={logoSrc}
      alt={altText}
      width={resolvedWidth}
      height={resolvedHeight}
      className={`max-w-full h-auto ${imgClassName}`.trim()}
      loading="eager"
      data-testid={testId ? `${testId}-img` : 'logo-img'}
    />
  )

  const handleClick = (event) => {
    if (typeof onClick === 'function') {
      onClick(event)
    }
  }

  if (linkToDashboard) {
    return (
      <Link
        to="/"
        className={`inline-flex items-center flex-shrink-0 transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-hb-accent focus-visible:ring-offset-2 focus-visible:outline-none rounded-sm ${className}`.trim()}
        onClick={handleClick}
        aria-label={`${altText} - Go to Dashboard`}
        data-testid={testId || 'logo'}
      >
        {imageElement}
      </Link>
    )
  }

  return (
    <div
      className={`inline-flex items-center flex-shrink-0 ${className}`.trim()}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleClick(event)
              }
            }
          : undefined
      }
      aria-label={onClick ? `${altText}` : undefined}
      data-testid={testId || 'logo'}
    >
      {imageElement}
    </div>
  )
}

export default Logo

export { Logo }