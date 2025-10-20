import Link from 'next/link'
import styles from './ContactSection.module.css'

export default function ContactSection() {
  return (
    <section id="contact" className={styles.contactSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Visit Us</h2>
        <p className={styles.sectionSubtitle}>Stop by our office or make an appointment today</p>

        <div className={styles.contactWrapper}>
          {/* Contact Info */}
          <div className={styles.contactInfo}>
            <div className={styles.contactInfoItem}>
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <h3>Address</h3>
                <p>221 W. Parish St.<br />Sandusky, OH 44870</p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <i className="fas fa-phone"></i>
              <div>
                <h3>Phone</h3>
                <p><a href="tel:4196246451">419-624-6451</a></p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Appointments: 419-624-6459
                </p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <i className="fas fa-envelope"></i>
              <div>
                <h3>Email</h3>
                <p>
                  <a href="mailto:OMJ-ErieCo@jfs.ohio.gov">
                    OMJ-ErieCo@jfs.ohio.gov
                  </a>
                </p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <i className="fas fa-clock"></i>
              <div>
                <h3>Hours</h3>
                <p>Monday - Friday<br />8:30 AM - 4:00 PM</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2969.234!2d-82.7079!3d41.4492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883b44e5f5f5f5f5%3A0x1!2s221%20W%20Parish%20St%2C%20Sandusky%2C%20OH%2044870!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="350"
              style={{ border: 0, borderRadius: '10px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="OhioMeansJobs Erie County Location"
            />
          </div>
        </div>

        <div className={styles.sectionCta}>
          <Link href="/contact" className="btn btn-primary">
            Full Contact Information & Staff Directory
          </Link>
        </div>
      </div>
    </section>
  )
}
