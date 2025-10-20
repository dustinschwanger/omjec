import { createWorker } from 'tesseract.js'
import mammoth from 'mammoth'

/**
 * Extract text from PDF files
 */
export async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use require for pdf-parse to avoid ESM/CommonJS issues in production
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text.trim()
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from images using OCR (Tesseract.js)
 */
export async function extractFromImage(buffer: Buffer): Promise<string> {
  const worker = await createWorker('eng')

  try {
    const { data: { text } } = await worker.recognize(buffer)
    await worker.terminate()
    return text.trim()
  } catch (error) {
    await worker.terminate()
    console.error('Error extracting text from image:', error)
    throw new Error(`Image OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text from Word documents (.docx)
 */
export async function extractFromWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    return result.value.trim()
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
