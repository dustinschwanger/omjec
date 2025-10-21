const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { PDFParse } = require('pdf-parse')
const { createWorker } = require('tesseract.js')
const mammoth = require('mammoth')

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const PORT = process.env.PORT || 3002

// Enable CORS for your main app
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}))

app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'pdf-processor' })
})

// Extract text from PDF
app.post('/extract/pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    console.log(`Processing PDF: ${req.file.originalname}, size: ${req.file.size} bytes`)

    // Parse PDF
    const data = await PDFParse(req.file.buffer)
    const text = data.text.trim()

    console.log(`Extracted ${text.length} characters from PDF`)

    res.json({
      success: true,
      text,
      pages: data.numpages,
      info: data.info
    })
  } catch (error) {
    console.error('PDF extraction error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Extract text from images using OCR
app.post('/extract/image', upload.single('file'), async (req, res) => {
  const worker = await createWorker('eng')

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    console.log(`Processing image: ${req.file.originalname}`)

    const { data: { text } } = await worker.recognize(req.file.buffer)
    await worker.terminate()

    console.log(`Extracted ${text.length} characters from image`)

    res.json({
      success: true,
      text: text.trim()
    })
  } catch (error) {
    await worker.terminate()
    console.error('Image OCR error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Extract text from Word documents
app.post('/extract/word', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    console.log(`Processing Word document: ${req.file.originalname}`)

    const result = await mammoth.extractRawText({ buffer: req.file.buffer })
    const text = result.value.trim()

    console.log(`Extracted ${text.length} characters from Word document`)

    res.json({
      success: true,
      text
    })
  } catch (error) {
    console.error('Word extraction error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`PDF Processor Service running on port ${PORT}`)
})
