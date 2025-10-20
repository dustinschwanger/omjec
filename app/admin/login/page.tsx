'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if already logged in as admin
    if (user && isAdmin) {
      router.push('/admin/dashboard')
    }
  }, [user, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        setError(signInError.message || 'Failed to sign in')
        setLoading(false)
        return
      }

      // Wait a moment for admin check to complete
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 500)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <i className="fas fa-shield-alt"></i>
          <h1>Admin Login</h1>
          <p>OhioMeansJobs Huron County</p>
        </div>

        {error && (
          <div className={styles.error}>
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">
              <i className="fas fa-lock"></i>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <a href="/">
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
