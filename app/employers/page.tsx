import PageHero from '@/components/PageHero'
import Link from 'next/link'
import styles from './employers.module.css'

export const metadata = {
  title: 'Employer Services - OhioMeansJobs Erie County',
  description: 'Free recruitment assistance, job posting services, and training grants for Erie County employers. On-the-Job Training program available.',
}

export default function EmployersPage() {
  return (
    <>
      <PageHero
        title="Employer Services"
        subtitle="Partner with us to find qualified candidates and grow your business"
      />

      {/* Mission Statement */}
      <section className={styles.missionSection}>
        <div className="container">
          <div className={styles.missionContent}>
            <i className="fas fa-handshake" style={{ fontSize: '3rem', color: 'var(--ohio-red)', flexShrink: 0 }}></i>
            <p style={{ textAlign: 'center', fontSize: '1.125rem', lineHeight: '1.8', margin: 0 }}>
              All employer services are completely <strong>free of charge</strong>. Let us help you recruit, train, and support your workforce development needs.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className={styles.servicesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How We Support Employers</h2>
          <p className={styles.sectionSubtitle}>Comprehensive recruitment and workforce development services</p>

          <div className={styles.servicesGrid}>
            <div className={styles.serviceItem}>
              <i className="fas fa-bullhorn"></i>
              <div>
                <h4>Job Posting</h4>
                <p>Post openings free on OhioMeansJobs.com</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-edit"></i>
              <div>
                <h4>Ad Development</h4>
                <p>Create compelling job advertisements</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-users"></i>
              <div>
                <h4>Recruitment Help</h4>
                <p>Identify and recruit qualified candidates</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-user-tag"></i>
              <div>
                <h4>Special Populations</h4>
                <p>Veterans, youth, workers with disabilities</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-laptop-house"></i>
              <div>
                <h4>Interview Spaces</h4>
                <p>Free computer labs and interview rooms</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-calendar-check"></i>
              <div>
                <h4>Job Fairs</h4>
                <p>Organized recruitment events</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-graduation-cap"></i>
              <div>
                <h4>Training Providers</h4>
                <p>Connect with local training resources</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-rocket"></i>
              <div>
                <h4>Small Business Support</h4>
                <p>Resources for entrepreneurs</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-chart-line"></i>
              <div>
                <h4>Market Data</h4>
                <p>Workforce trends and wage information</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-balance-scale"></i>
              <div>
                <h4>UI Information</h4>
                <p>Unemployment insurance guidance</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-file-download"></i>
              <div>
                <h4>Forms & Documents</h4>
                <p>Downloadable resources</p>
              </div>
            </div>

            <div className={styles.serviceItem}>
              <i className="fas fa-building"></i>
              <div>
                <h4>Economic Development</h4>
                <p>Local business growth resources</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On-the-Job Training Program */}
      <section className={styles.ojtSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>On-the-Job Training (OJT) Program</h2>
          <p className={styles.sectionSubtitle}>Get reimbursed for training new employees</p>

          <div className={styles.ojtCard}>
            <div className={styles.ojtIcon}>
              <i className="fas fa-dollar-sign"></i>
            </div>

            <h3>Program Benefits</h3>

            <ul className={styles.benefitsList}>
              <li>
                <i className="fas fa-check-circle"></i>
                Receive up to <strong>$8,000 in reimbursement</strong> for training new employees
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                Training period of up to <strong>six months</strong>
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                Reduce the cost of hiring and training while building a skilled workforce
              </li>
            </ul>

            <p className={styles.ojtDescription}>
              The OJT program is designed to help employers offset the costs of training new hires while providing job seekers with valuable work experience and skills development. This is a win-win opportunity for both employers and employees.
            </p>

            <Link href="/contact" className="btn btn-primary">
              <i className="fas fa-phone"></i> Contact Us to Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Available Grants */}
      <section className={styles.servicesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Employer Grants & Programs</h2>
          <p className={styles.sectionSubtitle}>Financial assistance and support programs available to eligible employers</p>

          <div className={styles.grantsGrid}>
            <div className={styles.grantItem}>
              <i className="fas fa-briefcase"></i>
              <div>
                <h4>On-the-Job Training</h4>
                <p>Up to $8,000 reimbursement for training new employees</p>
              </div>
            </div>

            <div className={styles.grantItem}>
              <i className="fas fa-user-graduate"></i>
              <div>
                <h4>Incumbent Worker Training</h4>
                <p>Upgrade skills of your current workforce</p>
              </div>
            </div>

            <div className={styles.grantItem}>
              <i className="fas fa-users-cog"></i>
              <div>
                <h4>WIOA Programs</h4>
                <p>Workforce Innovation & Opportunity Act funding</p>
              </div>
            </div>

            <div className={styles.grantItem}>
              <i className="fas fa-user-friends"></i>
              <div>
                <h4>WIOA Youth Programs</h4>
                <p>Support for hiring and training young workers ages 16-24</p>
              </div>
            </div>

            <div className={styles.grantItem}>
              <i className="fas fa-people-arrows"></i>
              <div>
                <h4>SharedWork Ohio</h4>
                <p>Alternative to layoffs during slow business periods</p>
              </div>
            </div>

            <div className={styles.grantItem}>
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <h4>National Emergency Grants</h4>
                <p>Support during economic disruptions or emergencies</p>
              </div>
            </div>

            <div className={styles.grantItem}>
              <i className="fas fa-laptop-code"></i>
              <div>
                <h4>TechCred Program</h4>
                <p>Technology-focused training and upskilling grants</p>
              </div>
            </div>

            <div className={styles.grantItem}>
              <i className="fas fa-dollar-sign"></i>
              <div>
                <h4>Work Opportunity Tax Credits</h4>
                <p>WOTC and other tax incentives for hiring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 className={styles.sectionTitle}>Ready to Partner With Us?</h2>
            <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
              Contact our Business Outreach Coordinator to discuss your hiring needs, learn about available programs, or post your job openings.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-primary">
                <i className="fas fa-phone"></i> Contact Our Team
              </Link>
              <a href="https://ohiomeansjobs.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                <i className="fas fa-bullhorn"></i> Post a Job Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
