'use client'

import styles from './DeleteConfirmDialog.module.css'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  documentTitle: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export default function DeleteConfirmDialog({
  isOpen,
  documentTitle,
  onConfirm,
  onCancel,
  isDeleting = false
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>
          <i className="fas fa-exclamation-triangle"></i>
        </div>

        <h2>Delete Document?</h2>

        <p className={styles.message}>
          Are you sure you want to delete <strong>{documentTitle}</strong>?
          This action cannot be undone.
        </p>

        <div className={styles.buttons}>
          <button
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={styles.deleteButton}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Deleting...
              </>
            ) : (
              <>
                <i className="fas fa-trash"></i>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
