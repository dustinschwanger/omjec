'use client'

import { useState, useEffect } from 'react'
import styles from './BackToTop.module.css'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      id="back-to-top"
      className={`${styles.backToTop} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  )
}
