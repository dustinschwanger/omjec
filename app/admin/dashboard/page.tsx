'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import DocumentUploadModal from '@/components/DocumentUploadModal'
import DocumentViewModal from '@/components/DocumentViewModal'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import styles from './dashboard.module.css'

interface Document {
  id: string
  title: string
  filename: string
  type: string
  status: string
  created_at: string
  file_size: number
  is_downloadable: boolean
  metadata?: any
  download_stats?: {
    download_count: number
    last_downloaded_at: string
  }
}

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/admin/login')
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    if (user && isAdmin) {
      loadDocuments()
    }
  }, [user, isAdmin])

  async function loadDocuments() {
    try {
      // Fetch documents
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('id, title, filename, type, status, created_at, file_size, is_downloadable, metadata')
        .order('created_at', { ascending: false })

      if (docsError) {
        console.error('Error loading documents:', docsError)
        setDocuments([])
        return
      }

      // Fetch download stats for all documents
      const { data: downloadStats, error: statsError } = await supabase
        .from('document_downloads')
        .select('document_id, download_count, last_downloaded_at')

      if (statsError) {
        console.error('Error loading download stats:', statsError)
      }

      // Merge download stats with documents
      const documentsWithStats = (docs || []).map(doc => ({
        ...doc,
        download_stats: downloadStats?.find(stat => stat.document_id === doc.id)
      }))

      setDocuments(documentsWithStats)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoadingDocs(false)
    }
  }

  function handleUploadComplete() {
    // Reload documents after successful upload
    loadDocuments()
  }

  function handleViewDocument(id: string) {
    setSelectedDocumentId(id)
    setViewModalOpen(true)
  }

  function handleDeleteClick(id: string, title: string) {
    setDocumentToDelete({ id, title })
    setDeleteDialogOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!documentToDelete) return

    setIsDeleting(true)

    try {
      // Get session token for authentication
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        alert('You must be logged in to delete documents')
        setIsDeleting(false)
        return
      }

      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete document')
      }

      // Reload documents after successful deletion
      await loadDocuments()

      // Close dialog
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    } catch (err: any) {
      console.error('Delete error:', err)
      alert(`Failed to delete document: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  function handleDeleteCancel() {
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  }

  async function handleReprocess(documentId: string) {
    try {
      // Get session token for authentication
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        alert('You must be logged in to reprocess documents')
        return
      }

      const response = await fetch(`/api/documents/process/${documentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reprocess document')
      }

      alert('Document reprocessing started. This may take a few minutes.')

      // Reload documents to show updated status
      loadDocuments()
    } catch (err: any) {
      console.error('Reprocess error:', err)
      alert(`Failed to reprocess document: ${err.message}`)
    }
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className={styles.loading}>
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <i className="fas fa-shield-alt"></i>
          <h2>Admin Panel</h2>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navItem + ' ' + styles.active}>
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
          <a href="#documents" className={styles.navItem}>
            <i className="fas fa-file-alt"></i>
            <span>Documents</span>
          </a>
          <Link href="/admin/analytics" className={styles.navItem}>
            <i className="fas fa-chart-line"></i>
            <span>Chat Analytics</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <i className="fas fa-user-circle"></i>
            <span>{user.email}</span>
          </div>
          <button onClick={signOut} className={styles.signOutButton}>
            <i className="fas fa-sign-out-alt"></i>
            Sign Out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>Dashboard</h1>
            <p>Manage documents and monitor chat activity</p>
          </div>
          <Link href="/" className={styles.viewSiteLink}>
            <i className="fas fa-external-link-alt"></i>
            View Site
          </Link>
        </header>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statIcon + ' ' + styles.blue}>
              <i className="fas fa-file-alt"></i>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Documents</p>
              <p className={styles.statValue}>{documents.length}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon + ' ' + styles.green}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Processed</p>
              <p className={styles.statValue}>
                {documents.filter(d => d.status === 'processed').length}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon + ' ' + styles.purple}>
              <i className="fas fa-download"></i>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Downloadable</p>
              <p className={styles.statValue}>
                {documents.filter(d => d.is_downloadable).length}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon + ' ' + styles.orange}>
              <i className="fas fa-spinner"></i>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Processing</p>
              <p className={styles.statValue}>
                {documents.filter(d => d.status === 'processing').length}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon + ' ' + styles.red}>
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Failed</p>
              <p className={styles.statValue}>
                {documents.filter(d => d.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>
              <i className="fas fa-file-alt"></i>
              Documents
            </h2>
          </div>

          {loadingDocs ? (
            <div className={styles.emptyState}>
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fas fa-folder-open"></i>
              <h3>No documents yet</h3>
              <p>Upload your first document to get started with the AI chat.</p>
              <button
                className={styles.uploadButton}
                onClick={() => setUploadModalOpen(true)}
              >
                <i className="fas fa-upload"></i>
                Upload Document
              </button>
            </div>
          ) : (
            <div className={styles.documentList}>
              {documents.map(doc => (
                <div key={doc.id} className={styles.documentCard}>
                  <div className={styles.documentIcon}>
                    <i className="fas fa-file-pdf"></i>
                  </div>
                  <div className={styles.documentInfo}>
                    <div className={styles.documentTitle}>
                      <h4>{doc.title}</h4>
                      <div className={styles.badges}>
                        {doc.is_downloadable && (
                          <span className={styles.downloadableBadge} title="Available for user download">
                            <i className="fas fa-download"></i>
                            Downloadable
                          </span>
                        )}
                        {doc.download_stats && doc.download_stats.download_count > 0 && (
                          <span className={styles.downloadCountBadge} title="Total downloads">
                            <i className="fas fa-arrow-down"></i>
                            {doc.download_stats.download_count} {doc.download_stats.download_count === 1 ? 'download' : 'downloads'}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={styles.documentMeta}>
                      <span>{doc.filename}</span>
                      <span>•</span>
                      <span>{(doc.file_size / 1024).toFixed(2)} KB</span>
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </p>
                    {doc.status === 'failed' && doc.metadata?.error && (
                      <p className={styles.errorMessage}>
                        <i className="fas fa-exclamation-triangle"></i>
                        {doc.metadata.error}
                      </p>
                    )}
                  </div>
                  <div className={styles.documentStatus}>
                    <span className={`${styles.statusBadge} ${styles[doc.status]}`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className={styles.documentActions}>
                    {doc.status === 'failed' && (
                      <button
                        className={styles.actionButton}
                        onClick={() => handleReprocess(doc.id)}
                        title="Reprocess document"
                      >
                        <i className="fas fa-redo"></i>
                      </button>
                    )}
                    <button
                      className={styles.actionButton}
                      onClick={() => handleViewDocument(doc.id)}
                      title="View details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleDeleteClick(doc.id, doc.title)}
                      title="Delete document"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      <DocumentViewModal
        isOpen={viewModalOpen}
        documentId={selectedDocumentId}
        onClose={() => {
          setViewModalOpen(false)
          setSelectedDocumentId(null)
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        documentTitle={documentToDelete?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </div>
  )
}
