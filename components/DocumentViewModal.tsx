'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './DocumentViewModal.module.css'

interface DocumentDetails {
  id: string
  title: string
  filename: string
  type: string
  status: string
  created_at: string
  file_size: number
  public_url?: string
  content_preview?: string
  metadata?: any
}

interface DocumentViewModalProps {
  isOpen: boolean
  documentId: string | null
  onClose: () => void
}

export default function DocumentViewModal({ isOpen, documentId, onClose }: DocumentViewModalProps) {
  const [document, setDocument] = useState<DocumentDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument()
    }
  }, [isOpen, documentId])

  async function loadDocument() {
    if (!documentId) return

    setLoading(true)
    setError('')

    try {
      // Get session token for authentication
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('You must be logged in to view documents')
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load document')
      }

      setDocument(data.document)
    } catch (err: any) {
      console.error('Error loading document:', err)
      setError(err.message || 'Failed to load document details')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            <i className="fas fa-file-alt"></i>
            Document Details
          </h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            type="button"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading document...</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          ) : document ? (
            <>
              <div className={styles.field}>
                <label>Title</label>
                <p>{document.title}</p>
              </div>

              <div className={styles.field}>
                <label>Filename</label>
                <p>{document.filename}</p>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Type</label>
                  <p className={styles.capitalize}>{document.type.replace(/-/g, ' ')}</p>
                </div>

                <div className={styles.field}>
                  <label>Status</label>
                  <span className={`${styles.statusBadge} ${styles[document.status]}`}>
                    {document.status}
                  </span>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Size</label>
                  <p>{(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
                </div>

                <div className={styles.field}>
                  <label>Uploaded</label>
                  <p>{new Date(document.created_at).toLocaleString()}</p>
                </div>
              </div>

              {document.content_preview && (
                <div className={styles.field}>
                  <label>Content Preview</label>
                  <div className={styles.preview}>
                    {document.content_preview}
                  </div>
                </div>
              )}

              {document.public_url && (
                <div className={styles.field}>
                  <label>File URL</label>
                  <a
                    href={document.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    <i className="fas fa-external-link-alt"></i>
                    Open in new tab
                  </a>
                </div>
              )}

              {document.metadata && document.metadata.uploaded_by && (
                <div className={styles.field}>
                  <label>Uploaded By</label>
                  <p className={styles.meta}>{document.metadata.uploaded_by}</p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <i className="fas fa-file-alt"></i>
              <p>No document selected</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.closeButtonFooter}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
