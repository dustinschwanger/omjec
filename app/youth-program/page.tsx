import Link from 'next/link'
import styles from './youth-program.module.css'

export const metadata = {
  title: 'L.Y.F.E. Youth Program - OhioMeansJobs Erie County',
  description: 'L.Y.F.E. Youth Program - Leading Youth to Feel Empowered! Comprehensive Case Management Employment Program for ages 16-24 in Erie County.',
}

export default function YouthProgramPage() {
  return (
    <>
      {/* Custom Hero for Youth Program */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroOverlay}></div>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>L.Y.F.E.</h1>
            <p className={styles.heroSubtitleLarge}>Leading Youth to Feel Empowered!</p>
            <p className={styles.heroSubtitle}>Comprehensive Case Management Employment Program (CCMEP)</p>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className={styles.overviewSection}>
        <div className="container">
          <div className={styles.overviewContent}>
            <i className="fas fa-users" style={{ fontSize: '3.5rem', color: 'var(--ohio-red)', display: 'block', margin: '0 auto 1.5rem' }}></i>
            <h2 style={{ color: 'var(--ohio-blue)', marginBottom: '1rem', fontSize: '1.75rem', fontWeight: '700' }}>Empowering Young People Ages 16-24</h2>
            <p className={styles.overviewText}>
              The L.Y.F.E. program provides comprehensive support to help young adults overcome barriers, develop skills, and achieve their education and career goals.
            </p>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className={styles.eligibilitySection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Do You Qualify?</h2>
          <p className={styles.sectionSubtitle}>Participants ages 16-24 may qualify if they meet one or more of the following criteria</p>

          <div className={styles.eligibilityGrid}>
            <div className={styles.eligibilityCard}>
              <i className="fas fa-baby"></i>
              <span>Pregnant or Parenting</span>
            </div>

            <div className={styles.eligibilityCard}>
              <i className="fas fa-school"></i>
              <span>High School Dropout / Need GED</span>
            </div>

            <div className={styles.eligibilityCard}>
              <i className="fas fa-home"></i>
              <span>Foster Care (Current/Former)</span>
            </div>

            <div className={styles.eligibilityCard}>
              <i className="fas fa-gavel"></i>
              <span>Court Involvement</span>
            </div>

            <div className={styles.eligibilityCard}>
              <i className="fas fa-house-damage"></i>
              <span>Experiencing Homelessness</span>
            </div>

            <div className={styles.eligibilityCard}>
              <i className="fas fa-wheelchair"></i>
              <span>Have a Disability</span>
            </div>

            <div className={styles.eligibilityCard}>
              <i className="fas fa-dollar-sign"></i>
              <span>Low Income</span>
            </div>

            <div className={styles.eligibilityCard}>
              <i className="fas fa-hand-holding-heart"></i>
              <span>Other Employment Barriers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Program Services */}
      <section className={styles.servicesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What We Offer</h2>
          <p className={styles.sectionSubtitle}>Comprehensive support services to help you succeed</p>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceItem}>
              <i className="fas fa-graduation-cap"></i>
              <div>
                <h4>High School Diploma/GED</h4>
                <p>Earn your diploma or GED through our ASPIRE program partners</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-user-graduate"></i>
              <div>
                <h4>Leadership Development</h4>
                <p>Build confidence, communication, and leadership skills</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-money-bill-wave"></i>
              <div>
                <h4>Financial Management</h4>
                <p>Learn budgeting, saving, and essential financial literacy</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-briefcase"></i>
              <div>
                <h4>Job Placement Connections</h4>
                <p>Connect with employers and find jobs matching your goals</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-hands-helping"></i>
              <div>
                <h4>Paid Internships</h4>
                <p>Gain work experience through paid internship opportunities</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-university"></i>
              <div>
                <h4>Post-Secondary Education</h4>
                <p>College applications, financial aid, and higher education guidance</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-certificate"></i>
              <div>
                <h4>Skills Training</h4>
                <p>Career training and industry-recognized certifications</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-user-friends"></i>
              <div>
                <h4>One-on-One Case Management</h4>
                <p>Work with a dedicated career coach supporting your journey</p>
              </div>
            </div>

            <div className={styles.serviceItemFull}>
              <i className="fas fa-bus"></i>
              <div>
                <h4>Supportive Services</h4>
                <p>Assistance with transportation, work clothing, tools, and removing barriers to employment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Mission */}
      <section className={styles.missionSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Your Success is Our Mission</h2>

          <div className={styles.missionContent}>
            <p className={styles.missionText}>
              The L.Y.F.E. program has helped countless young adults in Erie County overcome challenges, complete their education, develop job skills, and launch successful careers. Our dedicated team is here to support you every step of the way.
            </p>

            <div className={styles.ctaCard}>
              <i className="fas fa-star"></i>
              <h3>Join the L.Y.F.E. Program Today</h3>
              <p>
                Take the first step toward a brighter future. Our team is ready to help you achieve your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Notice */}
      <section className={styles.applicationSection}>
        <div className="container">
          <div className={styles.applicationContent}>
            <h2 className={styles.sectionTitle}>How to Apply</h2>
            <div className={styles.applicationCard}>
              <i className="fas fa-info-circle"></i>
              <p className={styles.applicationNotice}>
                Applications are currently unavailable online. Please contact us directly to learn more about the L.Y.F.E. program and start your enrollment process.
              </p>

              <div className={styles.contactCard}>
                <h3>Contact Our Youth Career Coach</h3>
                <p><strong>Mariam Glass</strong></p>
                <p><i className="fas fa-phone"></i> 419-627-4458</p>
                <p><i className="fas fa-envelope"></i> Mariam.Glass@jfs.ohio.gov</p>
              </div>

              <div className={styles.buttonGroup}>
                <Link href="/contact" className="btn btn-primary">
                  <i className="fas fa-phone"></i> Contact Us
                </Link>
                <a href="tel:4196274458" className="btn btn-secondary">
                  <i className="fas fa-phone-alt"></i> Call Now: 419-627-4458
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
