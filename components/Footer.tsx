import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>OhioMeansJobs Erie County</h3>
            <p>Developing a community with a well-trained workforce that meets business needs and provides job seeker opportunities.</p>
          </div>

          <div className={styles.footerSection}>
            <h3>Services</h3>
            <ul className={styles.footerLinks}>
              <li><Link href="/job-seekers">Job Seekers</Link></li>
              <li><Link href="/employers">Employers</Link></li>
              <li><Link href="/youth-program">Youth Program</Link></li>
              <li><Link href="/events">Events</Link></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Resources</h3>
            <ul className={styles.footerLinks}>
              <li><a href="https://ohiomeansjobs.com" target="_blank" rel="noopener noreferrer">OhioMeansJobs.com</a></li>
              <li><a href="https://jfs.ohio.gov" target="_blank" rel="noopener noreferrer">Ohio Job & Family Services</a></li>
              <li><a href="https://unemployment.ohio.gov" target="_blank" rel="noopener noreferrer">Unemployment Services</a></li>
              <li><a href="https://ohio.gov" target="_blank" rel="noopener noreferrer">Ohio.gov</a></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Contact</h3>
            <ul className={styles.footerLinks}>
              <li><i className="fas fa-map-marker-alt"></i> 221 W. Parish St., Sandusky, OH 44870</li>
              <li><i className="fas fa-phone"></i> <a href="tel:4196246451">419-624-6451</a></li>
              <li><i className="fas fa-envelope"></i> <a href="mailto:OMJ-ErieCo@jfs.ohio.gov">OMJ-ErieCo@jfs.ohio.gov</a></li>
              <li><i className="fas fa-clock"></i> Mon-Fri: 8:30 AM - 4:00 PM</li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Connect</h3>
            <div className={styles.socialLinks}>
              <a href="https://www.facebook.com/OMJEC/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://www.instagram.com/omjec/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className={styles.footerLegal}>
            <p>&copy; 2025 OhioMeansJobs Erie County. All rights reserved.</p>
            <p className={styles.equalOpportunity}>
              Equal Opportunity Employer/Program. Auxiliary aids and services available upon request to individuals with disabilities.
            </p>
          </div>
          <div className={styles.footerLegalLinks}>
            <Link href="/about-us">About Us</Link>
            <Link href="/contact">Contact</Link>
            <a href="https://ohio.gov" target="_blank" rel="noopener noreferrer">Ohio.gov</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
