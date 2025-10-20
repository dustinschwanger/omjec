import PageHero from '@/components/PageHero'
import ServiceCard from '@/components/ServiceCard'
import Link from 'next/link'
import styles from './events.module.css'

export const metadata = {
  title: 'Events & Workshops - OhioMeansJobs Erie County',
  description: 'Upcoming events, workshops, job fairs, and hiring events at OhioMeansJobs Erie County.',
}

export default function EventsPage() {
  return (
    <>
      <PageHero
        title="Events & Workshops"
        subtitle="Connect, learn, and grow with OhioMeansJobs Erie County"
      />

      {/* Event Types */}
      <section className={styles.eventTypesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Types of Events We Host</h2>
          <p className={styles.sectionSubtitle}>Free events and workshops for job seekers and employers</p>

          <div className={styles.servicesGrid}>
            <ServiceCard
              icon="fas fa-handshake"
              title="Job Fairs"
              description="Meet multiple employers in one place. Bring your resume and dress professionally to make connections."
            />

            <ServiceCard
              icon="fas fa-chalkboard-teacher"
              title="Career Workshops"
              description="Learn resume writing, interview skills, job search strategies, and professional development."
            />

            <ServiceCard
              icon="fas fa-laptop"
              title="Computer Skills Training"
              description="Build essential computer skills for the modern workplace through hands-on training sessions."
            />

            <ServiceCard
              icon="fas fa-building"
              title="Employer Hiring Events"
              description="Company-specific recruitment events where employers interview candidates on-site."
            />

            <ServiceCard
              icon="fas fa-graduation-cap"
              title="Training Information Sessions"
              description="Learn about available training programs, certifications, and educational opportunities."
            />

            <ServiceCard
              icon="fas fa-users"
              title="Networking Events"
              description="Connect with other professionals, employers, and community organizations."
            />
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className={styles.upcomingSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Upcoming Events</h2>
          <p className={styles.sectionSubtitle}>Check back regularly for new events and workshops</p>

          <div className={styles.upcomingCard}>
            <i className="fas fa-calendar-alt"></i>
            <h3>Stay Informed</h3>
            <p className={styles.upcomingText}>
              Events and workshops are scheduled throughout the year. Contact us to learn about upcoming job fairs, hiring events, and training sessions. We also post updates on our social media channels.
            </p>

            <div className={styles.appointmentBox}>
              <h4>
                <i className="fas fa-phone"></i> Schedule an Appointment
              </h4>
              <p>To make an appointment for career counseling or to learn about upcoming events:</p>
              <p className={styles.phoneNumber}>419-624-6459</p>
            </div>

            <div className={styles.buttonGroup}>
              <Link href="/contact" className="btn btn-primary">
                <i className="fas fa-envelope"></i> Contact Us
              </Link>
              <a href="tel:4196246459" className="btn btn-secondary">
                <i className="fas fa-phone-alt"></i> Call: 419-624-6459
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Event Prep */}
      <section className={styles.prepSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Preparing for Events</h2>
          <p className={styles.sectionSubtitle}>Make the most of your job fair or workshop experience</p>

          <div className={styles.prepGrid}>
            <div className={styles.prepCard}>
              <i className="fas fa-file-alt"></i>
              <h3>Bring Resumes</h3>
              <p>Print multiple copies of your updated resume for job fairs</p>
            </div>

            <div className={styles.prepCard}>
              <i className="fas fa-user-tie"></i>
              <h3>Dress Professionally</h3>
              <p>Dress as you would for an interview to make a great impression</p>
            </div>

            <div className={styles.prepCard}>
              <i className="fas fa-id-card"></i>
              <h3>Bring Identification</h3>
              <p>Have your ID and Social Security card for on-site interviews</p>
            </div>

            <div className={styles.prepCard}>
              <i className="fas fa-pen"></i>
              <h3>Be Prepared</h3>
              <p>Research employers and prepare questions to ask recruiters</p>
            </div>

            <div className={styles.prepCard}>
              <i className="fas fa-clock"></i>
              <h3>Arrive Early</h3>
              <p>Get there early for the best opportunities and shorter lines</p>
            </div>

            <div className={styles.prepCard}>
              <i className="fas fa-smile"></i>
              <h3>Be Professional</h3>
              <p>Smile, make eye contact, and use a firm handshake</p>
            </div>
          </div>
        </div>
      </section>

      {/* Follow Us */}
      <section className={styles.socialSection}>
        <div className="container">
          <div className={styles.socialContent}>
            <h2 className={styles.sectionTitle}>Stay Connected</h2>
            <p className={styles.socialText}>
              Follow us on social media for the latest event announcements, job postings, and workforce news.
            </p>

            <div className={styles.socialCards}>
              <a href="https://www.facebook.com/OMJEC/" target="_blank" rel="noopener noreferrer" className={styles.socialCard}>
                <i className="fab fa-facebook"></i>
                <h3>Facebook</h3>
                <p>@OMJEC</p>
              </a>

              <a href="https://www.instagram.com/omjec/" target="_blank" rel="noopener noreferrer" className={styles.socialCard}>
                <i className="fab fa-instagram"></i>
                <h3>Instagram</h3>
                <p>@omjec</p>
              </a>
            </div>

            <Link href="/contact" className="btn btn-primary">
              <i className="fas fa-calendar-check"></i> Contact Us About Events
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
