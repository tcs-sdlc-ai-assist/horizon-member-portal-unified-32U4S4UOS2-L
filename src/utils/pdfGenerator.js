import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// -----------------------------------------------------------------------------
// PDF Generation Utility
// -----------------------------------------------------------------------------

/**
 * Default PDF configuration for ID card generation.
 */
const DEFAULT_PDF_OPTIONS = {
  orientation: 'landscape',
  unit: 'mm',
  format: [86, 54], // Standard ID card dimensions (CR80): 85.6mm x 53.98mm
  compress: true,
}

/**
 * Default html2canvas configuration for capturing DOM elements.
 */
const DEFAULT_CANVAS_OPTIONS = {
  scale: 2,
  useCORS: true,
  allowTaint: false,
  backgroundColor: '#FFFFFF',
  logging: false,
  removeContainer: true,
}

/**
 * Captures a DOM element as a canvas using html2canvas.
 * @param {HTMLElement} element - The DOM element to capture.
 * @param {object} [canvasOptions] - Optional html2canvas configuration overrides.
 * @returns {Promise<HTMLCanvasElement>} The rendered canvas element.
 */
const captureElementAsCanvas = async (element, canvasOptions = {}) => {
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error('A valid DOM element is required for PDF generation.')
  }

  const options = {
    ...DEFAULT_CANVAS_OPTIONS,
    ...canvasOptions,
  }

  try {
    const canvas = await html2canvas(element, options)
    return canvas
  } catch (error) {
    throw new Error(`Failed to capture element as canvas: ${error.message}`)
  }
}

/**
 * Generates a downloadable PDF from an ID card DOM element.
 *
 * @param {HTMLElement} element - The DOM element containing the ID card to capture.
 * @param {object} [options] - Configuration options.
 * @param {string} [options.fileName='ID_Card.pdf'] - The name of the downloaded PDF file.
 * @param {function} [options.onLoadingChange] - Callback invoked with loading state (true/false).
 * @param {object} [options.pdfOptions] - Optional jsPDF configuration overrides.
 * @param {object} [options.canvasOptions] - Optional html2canvas configuration overrides.
 * @param {boolean} [options.download=true] - Whether to trigger an automatic download.
 * @returns {Promise<jsPDF>} The generated jsPDF instance.
 */
const generateIdCardPdf = async (element, options = {}) => {
  const {
    fileName = 'ID_Card.pdf',
    onLoadingChange,
    pdfOptions = {},
    canvasOptions = {},
    download = true,
  } = options

  if (typeof onLoadingChange === 'function') {
    onLoadingChange(true)
  }

  try {
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error('A valid DOM element is required for PDF generation.')
    }

    const canvas = await captureElementAsCanvas(element, canvasOptions)

    const imgData = canvas.toDataURL('image/png', 1.0)

    const mergedPdfOptions = {
      ...DEFAULT_PDF_OPTIONS,
      ...pdfOptions,
    }

    const pdf = new jsPDF(mergedPdfOptions)

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    const canvasAspectRatio = canvas.width / canvas.height
    const pdfAspectRatio = pdfWidth / pdfHeight

    let imgWidth = pdfWidth
    let imgHeight = pdfHeight
    let offsetX = 0
    let offsetY = 0

    if (canvasAspectRatio > pdfAspectRatio) {
      imgHeight = pdfWidth / canvasAspectRatio
      offsetY = (pdfHeight - imgHeight) / 2
    } else {
      imgWidth = pdfHeight * canvasAspectRatio
      offsetX = (pdfWidth - imgWidth) / 2
    }

    pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight)

    if (download) {
      pdf.save(fileName)
    }

    return pdf
  } catch (error) {
    console.error('[pdfGenerator] Failed to generate PDF:', error)
    throw error
  } finally {
    if (typeof onLoadingChange === 'function') {
      onLoadingChange(false)
    }
  }
}

/**
 * Generates a PDF containing both front and back of an ID card.
 *
 * @param {HTMLElement} frontElement - The DOM element for the front of the ID card.
 * @param {HTMLElement} backElement - The DOM element for the back of the ID card.
 * @param {object} [options] - Configuration options.
 * @param {string} [options.fileName='ID_Card.pdf'] - The name of the downloaded PDF file.
 * @param {function} [options.onLoadingChange] - Callback invoked with loading state (true/false).
 * @param {object} [options.pdfOptions] - Optional jsPDF configuration overrides.
 * @param {object} [options.canvasOptions] - Optional html2canvas configuration overrides.
 * @param {boolean} [options.download=true] - Whether to trigger an automatic download.
 * @returns {Promise<jsPDF>} The generated jsPDF instance.
 */
const generateIdCardPdfFrontBack = async (frontElement, backElement, options = {}) => {
  const {
    fileName = 'ID_Card.pdf',
    onLoadingChange,
    pdfOptions = {},
    canvasOptions = {},
    download = true,
  } = options

  if (typeof onLoadingChange === 'function') {
    onLoadingChange(true)
  }

  try {
    if (!frontElement || !(frontElement instanceof HTMLElement)) {
      throw new Error('A valid DOM element is required for the front of the ID card.')
    }

    if (!backElement || !(backElement instanceof HTMLElement)) {
      throw new Error('A valid DOM element is required for the back of the ID card.')
    }

    const [frontCanvas, backCanvas] = await Promise.all([
      captureElementAsCanvas(frontElement, canvasOptions),
      captureElementAsCanvas(backElement, canvasOptions),
    ])

    const mergedPdfOptions = {
      ...DEFAULT_PDF_OPTIONS,
      ...pdfOptions,
    }

    const pdf = new jsPDF(mergedPdfOptions)

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    const addCanvasToPdf = (canvas) => {
      const imgData = canvas.toDataURL('image/png', 1.0)
      const canvasAspectRatio = canvas.width / canvas.height
      const pdfAspectRatio = pdfWidth / pdfHeight

      let imgWidth = pdfWidth
      let imgHeight = pdfHeight
      let offsetX = 0
      let offsetY = 0

      if (canvasAspectRatio > pdfAspectRatio) {
        imgHeight = pdfWidth / canvasAspectRatio
        offsetY = (pdfHeight - imgHeight) / 2
      } else {
        imgWidth = pdfHeight * canvasAspectRatio
        offsetX = (pdfWidth - imgWidth) / 2
      }

      pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight)
    }

    // Front page
    addCanvasToPdf(frontCanvas)

    // Back page
    pdf.addPage(mergedPdfOptions.format, mergedPdfOptions.orientation)
    addCanvasToPdf(backCanvas)

    if (download) {
      pdf.save(fileName)
    }

    return pdf
  } catch (error) {
    console.error('[pdfGenerator] Failed to generate front/back PDF:', error)
    throw error
  } finally {
    if (typeof onLoadingChange === 'function') {
      onLoadingChange(false)
    }
  }
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

const pdfGenerator = {
  generateIdCardPdf,
  generateIdCardPdfFrontBack,
  captureElementAsCanvas,
}

export default pdfGenerator

export { generateIdCardPdf, generateIdCardPdfFrontBack, captureElementAsCanvas }