import 'server-only'

/**
 * Extract text from PDF files using external microservice
 * This avoids Next.js bundling/minification issues with pdf-parse
 */
export async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfProcessorUrl = process.env.PDF_PROCESSOR_URL || 'http://localhost:3002'

    // Create FormData with the PDF buffer
    const formData = new FormData()
    // Create a proper ArrayBuffer from the Node.js Buffer
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
    formData.append('file', blob, 'document.pdf')

    const response = await fetch(`${pdfProcessorUrl}/extract/pdf`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'PDF processing service error')
    }

    const result = await response.json()
    return result.text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from images using OCR via external microservice
 */
export async function extractFromImage(buffer: Buffer): Promise<string> {
  try {
    const pdfProcessorUrl = process.env.PDF_PROCESSOR_URL || 'http://localhost:3002'

    const formData = new FormData()
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' })
    formData.append('file', blob, 'image.jpg')

    const response = await fetch(`${pdfProcessorUrl}/extract/image`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Image processing service error')
    }

    const result = await response.json()
    return result.text
  } catch (error) {
    console.error('Error extracting text from image:', error)
    throw new Error(`Image OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from Word documents (.docx) via external microservice
 */
export async function extractFromWord(buffer: Buffer): Promise<string> {
  try {
    const pdfProcessorUrl = process.env.PDF_PROCESSOR_URL || 'http://localhost:3002'

    const formData = new FormData()
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    formData.append('file', blob, 'document.docx')

    const response = await fetch(`${pdfProcessorUrl}/extract/word`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Word processing service error')
    }

    const result = await response.json()
    return result.text
  } catch (error) {
    console.error('Error extracting text from Word document:', error)
    throw new Error(`Word extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Main text extraction router - determines file type and extracts accordingly
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  console.log(`Extracting text from ${mimeType}...`)

  switch (mimeType) {
    case 'application/pdf':
      return extractFromPDF(buffer)

    case 'image/jpeg':
    case 'image/jpg':
    case 'image/png':
    case 'image/webp':
      return extractFromImage(buffer)

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractFromWord(buffer)

    case 'application/msword':
      // .doc files are more complex - mammoth primarily supports .docx
      // For .doc files, we'll try mammoth but it may fail
      try {
        return extractFromWord(buffer)
      } catch (error) {
        throw new Error('.doc files may not be fully supported. Please upload as .docx or PDF.')
      }

    default:
      throw new Error(`Unsupported file type: ${mimeType}`)
  }
}

/**
 * Validate extracted text
 */
export function validateExtractedText(text: string, minLength: number = 10): boolean {
  if (!text || text.trim().length < minLength) {
    return false
  }
  return true
}

/**
 * Clean extracted text - remove excessive whitespace, normalize line breaks
 */
export function cleanExtractedText(text: string): string {
  return text
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Remove excessive line breaks (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim()
}
