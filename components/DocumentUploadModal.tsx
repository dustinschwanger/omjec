'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import styles from './DocumentUploadModal.module.css'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function DocumentUploadModal({ isOpen, onClose, onUploadComplete }: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<string>('general')
  const [isDownloadable, setIsDownloadable] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('')

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.')
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload PDF, Word documents, or images.')
      } else {
        setError('Failed to upload file. Please try again.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)

      // Auto-fill title from filename if empty
      if (!title) {
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setTitle(fileNameWithoutExt)
      }
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select a file to upload.')
      return
    }

    if (!title.trim()) {
      setError('Please enter a document title.')
      return
    }

    setUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      // Get session token for authentication
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('You must be logged in to upload documents')
      }

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', title.trim())
      formData.append('type', type)
      formData.append('isDownloadable', String(isDownloadable))

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      setUploadProgress(100)

      // Reset form
      setSelectedFile(null)
      setTitle('')
      setType('general')
      setIsDownloadable(false)

      // Notify parent and close modal
      setTimeout(() => {
        onUploadComplete()
        onClose()
        setUploadProgress(0)
      }, 500)

    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null)
      setTitle('')
      setType('general')
      setIsDownloadable(false)
      setError('')
      setUploadProgress(0)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            <i className="fas fa-cloud-upload-alt"></i>
            Upload Document
          </h2>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            disabled={uploading}
            type="button"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="title">Document Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Job Seeker's Guide 2024"
              disabled={uploading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type">Document Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={uploading}
            >
              <option value="general">General Information</option>
              <option value="job-seeker-guide">Job Seeker Guide</option>
              <option value="employer-info">Employer Information</option>
              <option value="youth-program">Youth Program</option>
              <option value="event">Event Information</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isDownloadable}
                onChange={(e) => setIsDownloadable(e.target.checked)}
                disabled={uploading}
                className={styles.checkbox}
              />
              <div className={styles.checkboxHint}>
                <span>Make available for download</span>
                <small>
                  Enable this to allow users to download this document through the AI chat
                </small>
              </div>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label>File Upload *</label>
            <div
              {...getRootProps()}
              className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${selectedFile ? styles.dropzoneHasFile : ''}`}
            >
              <input {...getInputProps()} disabled={uploading} />

              {selectedFile ? (
                <div className={styles.filePreview}>
                  <div className={styles.fileIcon}>
                    {selectedFile.type.startsWith('image/') && (
                      <i className="fas fa-image"></i>
                    )}
                    {selectedFile.type === 'application/pdf' && (
                      <i className="fas fa-file-pdf"></i>
                    )}
                    {(selectedFile.type === 'application/msword' ||
                      selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                      <i className="fas fa-file-word"></i>
                    )}
                  </div>
                  <div className={styles.fileInfo}>
                    <p className={styles.fileName}>{selectedFile.name}</p>
                    <p className={styles.fileSize}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                      className={styles.removeFileButton}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.dropzoneContent}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>
                    {isDragActive
                      ? 'Drop the file here...'
                      : 'Drag & drop a file here, or click to select'}
                  </p>
                  <p className={styles.dropzoneHint}>
                    Supports: PDF, Word (.doc, .docx), Images (JPG, PNG, WebP)
                    <br />
                    Max size: 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {uploading && (
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <div className={styles.footer}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.uploadButton}
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
