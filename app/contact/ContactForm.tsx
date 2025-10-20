'use client'

import { useState, FormEvent } from 'react'
import styles from './contact.module.css'

export default function ContactForm() {
  const [formStatus, setFormStatus] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormStatus('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    // Simulate form submission
    // In a real implementation, you would send this to an API endpoint
    setTimeout(() => {
      setFormStatus('Thank you for your message! We will get back to you soon.')
      setIsSubmitting(false)
      ;(e.target as HTMLFormElement).reset()
    }, 1000)
  }

  return (
    <div className={styles.contactFormWrapper}>
      <form onSubmit={handleSubmit} className={styles.contactForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name *</label>
          <input type="text" id="name" name="name" required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address *</label>
          <input type="email" id="email" name="email" required />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subject">I am a *</label>
          <select id="subject" name="subject" required>
            <option value="">Please select...</option>
            <option value="job-seeker">Job Seeker</option>
            <option value="employer">Employer</option>
            <option value="youth">Youth (16-24)</option>
            <option value="veteran">Veteran/Military Spouse</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Message *</label>
          <textarea id="message" name="message" rows={5} required></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          <i className="fas fa-paper-plane"></i> {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>

        {formStatus && (
          <div className={styles.formStatus}>
            {formStatus}
          </div>
        )}
      </form>
    </div>
  )
}
