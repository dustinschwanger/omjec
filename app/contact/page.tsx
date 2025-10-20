import PageHero from '@/components/PageHero'
import ContactForm from './ContactForm'
import styles from './contact.module.css'

export const metadata = {
  title: 'Contact Us - OhioMeansJobs Erie County',
  description: 'Contact OhioMeansJobs Erie County. Address, phone, email, hours, and staff directory. Located at 221 W. Parish St., Sandusky, OH.',
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="We're here to help you succeed"
      />

      {/* Contact Info */}
      <section className={styles.contactInfoSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Visit Our Office</h2>
          <p className={styles.sectionSubtitle}>Stop by during our office hours or call to schedule an appointment</p>

          <div className={styles.contactGrid}>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3>Address</h3>
              <p>221 W. Parish St.</p>
              <p>Sandusky, OH 44870</p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-phone"></i>
              </div>
              <h3>Phone</h3>
              <p><a href="tel:4196246451">419-624-6451</a></p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}><strong>Appointments:</strong> 419-624-6459</p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <h3>Email</h3>
              <p><a href="mailto:OMJ-ErieCo@jfs.ohio.gov">OMJ-ErieCo@jfs.ohio.gov</a></p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Hours</h3>
              <p>Monday - Friday</p>
              <p>8:30 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className={styles.mapSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Our Location</h2>
          <div className={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2969.234!2d-82.7079!3d41.4492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883b44e5f5f5f5f5%3A0x1!2s221%20W%20Parish%20St%2C%20Sandusky%2C%20OH%2044870!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '10px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="OhioMeansJobs Erie County Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Staff Directory */}
      <section className={styles.staffSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Staff Directory</h2>
          <p className={styles.sectionSubtitle}>Connect with our team members directly</p>

          <div className={styles.staffContainer}>
            {/* Administrator */}
            <div className={styles.adminCard}>
              <h3>
                <i className="fas fa-user-tie"></i>
                Neil P. Yingling III
              </h3>
              <p className={styles.staffTitle}>Administrator</p>
              <p><i className="fas fa-phone"></i> 419-627-4411</p>
              <p><i className="fas fa-envelope"></i> <a href="mailto:Neil.Yingling@jfs.ohio.gov">Neil.Yingling@jfs.ohio.gov</a></p>
            </div>

            {/* Rest of Staff */}
            <div className={styles.staffGrid}>
              <div className={styles.staffCard}>
                <h3>Trudy Riddle</h3>
                <p className={styles.staffTitle}>Business Outreach Coordinator</p>
                <p><i className="fas fa-phone"></i> 419-627-4462</p>
                <p><i className="fas fa-envelope"></i> <a href="mailto:Trudy.Riddle2@jfs.ohio.gov">Email</a></p>
              </div>

              <div className={styles.staffCard}>
                <h3>David Cromer</h3>
                <p className={styles.staffTitle}>WIOA Case Manager</p>
                <p><i className="fas fa-phone"></i> 419-627-4468</p>
                <p><i className="fas fa-envelope"></i> <a href="mailto:David.Cromer@jfs.ohio.gov">Email</a></p>
              </div>

              <div className={styles.staffCard}>
                <h3>Lisa Irby</h3>
                <p className={styles.staffTitle}>WIOA Case Manager</p>
                <p><i className="fas fa-phone"></i> 419-627-4469</p>
                <p><i className="fas fa-envelope"></i> <a href="mailto:Lisa.Irby@jfs.ohio.gov">Email</a></p>
              </div>

              <div className={styles.staffCard}>
                <h3>Mariam Glass</h3>
                <p className={styles.staffTitle}>Youth Career Coach</p>
                <p><i className="fas fa-phone"></i> 419-627-4458</p>
                <p><i className="fas fa-envelope"></i> <a href="mailto:Mariam.Glass@jfs.ohio.gov">Email</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className={styles.formSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Send Us a Message</h2>
          <p className={styles.sectionSubtitle}>Have questions? Fill out the form below and we&apos;ll get back to you</p>

          <div className={styles.formContainer}>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className={styles.socialSection}>
        <div className="container">
          <div className={styles.socialContent}>
            <h2 className={styles.sectionTitle}>Connect With Us</h2>
            <p className={styles.socialText}>
              Follow us on social media for the latest job postings, events, and workforce development news.
            </p>

            <div className={styles.socialButtons}>
              <a href="https://www.facebook.com/OMJEC/" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <i className="fab fa-facebook"></i> Facebook
              </a>
              <a href="https://www.instagram.com/omjec/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <i className="fab fa-instagram"></i> Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
