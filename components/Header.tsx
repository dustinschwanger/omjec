'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './Header.module.css'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header id="header" className={styles.header}>
      <nav className={styles.navbar}>
        <div className="container">
          <div className={styles.navWrapper}>
            <div className={styles.logo}>
              <Link href="/">
                <Image
                  src="/Erie-county-OMJ-logo.jpg"
                  alt="OhioMeansJobs Erie County"
                  width={200}
                  height={80}
                  style={{ height: '80px', width: 'auto' }}
                  priority
                />
              </Link>
            </div>

            <button
              className={styles.mobileMenuToggle}
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <ul className={`${styles.navMenu} ${mobileMenuOpen ? styles.active : ''}`}>
              <li>
                <Link
                  href="/job-seekers"
                  className={`${styles.navLink} ${pathname === '/job-seekers' ? styles.active : ''}`}
                >
                  Job Seekers
                </Link>
              </li>
              <li>
                <Link
                  href="/employers"
                  className={`${styles.navLink} ${pathname === '/employers' ? styles.active : ''}`}
                >
                  Employers
                </Link>
              </li>
              <li>
                <Link
                  href="/youth-program"
                  className={`${styles.navLink} ${pathname === '/youth-program' ? styles.active : ''}`}
                >
                  Youth Program
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className={`${styles.navLink} ${pathname === '/about-us' ? styles.active : ''}`}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className={`${styles.navLink} ${pathname === '/events' ? styles.active : ''}`}
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={`${styles.navLink} ${pathname === '/contact' ? styles.active : ''}`}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}
