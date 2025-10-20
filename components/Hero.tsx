'use client'

import Link from 'next/link'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}></div>
      <div className={styles.heroOverlay}></div>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Your Career Starts Here</h1>
          <p className={styles.heroSubtitle}>
            Developing a community with a well-trained workforce that meets business needs and provides job seeker opportunities
          </p>
          <div className={styles.heroButtons}>
            <Link
              href="https://ohiomeansjobs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <i className="fas fa-search"></i> Find a Job
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              <i className="fas fa-envelope"></i> Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
