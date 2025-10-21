# PDF Processor Service

Standalone microservice for extracting text from PDFs, images, and Word documents.

## Deployment to Railway

1. **Create new Railway service:**
   - Go to your Railway project
   - Click "New Service"
   - Select "GitHub Repo"
   - Choose this repository
   - Set root directory to `services/pdf-processor`

2. **Configure environment variables:**
   ```
   PORT=3002
   ALLOWED_ORIGINS=https://your-main-app.railway.app
   ```

3. **Railway will auto-detect:**
   - Node.js runtime
   - Install command: `npm install`
   - Start command: `npm start`

4. **Get the service URL:**
   - After deployment, copy the Railway URL (e.g., `https://pdf-processor-production.up.railway.app`)
   - Add this to your main app's environment variables as `PDF_PROCESSOR_URL`

## API Endpoints

### Health Check
```
GET /health
```

### Extract from PDF
```
POST /extract/pdf
Content-Type: multipart/form-data
Body: file (PDF file)

Response:
{
  "success": true,
  "text": "extracted text...",
  "pages": 5,
  "info": { ... }
}
```

### Extract from Image (OCR)
```
POST /extract/image
Content-Type: multipart/form-data
Body: file (JPG, PNG, WebP)

Response:
{
  "success": true,
  "text": "extracted text..."
}
```

### Extract from Word
```
POST /extract/word
Content-Type: multipart/form-data
Body: file (.docx file)

Response:
{
  "success": true,
  "text": "extracted text..."
}
```

## Local Development

```bash
cd services/pdf-processor
npm install
npm run dev
```

Service runs on http://localhost:3002
