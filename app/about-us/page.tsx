import PageHero from '@/components/PageHero'
import ServiceCard from '@/components/ServiceCard'
import Link from 'next/link'
import styles from './about-us.module.css'

export const metadata = {
  title: 'About Us - OhioMeansJobs Erie County',
  description: 'About OhioMeansJobs Erie County - Our mission, services, and commitment to developing a well-trained workforce in Sandusky, Ohio.',
}

export default function AboutUsPage() {
  return (
    <>
      <PageHero
        title="About Us"
        subtitle="Building a stronger workforce for Erie County"
      />

      {/* Mission */}
      <section className={styles.missionSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Our Mission</h2>

          <div className={styles.missionCard}>
            <i className="fas fa-bullseye"></i>
            <p>
              Developing a community with a well-trained workforce that meets business needs and provides job seeker opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className={styles.whoWeAreSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Who We Are</h2>
          <p className={styles.sectionSubtitle}>A local workforce resource center serving Erie County</p>

          <div className={styles.contentCard}>
            <p>
              OhioMeansJobs Erie County is a comprehensive workforce development center providing free services to both job seekers and businesses throughout Erie County. We are part of Ohio&apos;s statewide workforce development system, dedicated to connecting people with jobs and helping employers find qualified talent.
            </p>

            <p>
              Our center offers a Resource Room equipped with computers, internet access, phones, printers, and fax machines for job searching. We host regular workshops on job skills, career development, and employment readiness. We also organize recruitment events where job seekers can meet directly with local employers.
            </p>

            <p>
              All of our services are completely free of charge, funded by federal and state workforce development programs. Whether you&apos;re looking for your first job, changing careers, or seeking to expand your business, we&apos;re here to help you succeed.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className={styles.whatWeDoSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What We Do</h2>

          <div className={styles.servicesGrid}>
            <ServiceCard
              icon="fas fa-users"
              title="For Individuals"
              description="Free job search tools, career counseling, skills training, resume assistance, and employment support services."
            />

            <ServiceCard
              icon="fas fa-building"
              title="For Businesses"
              description="Job posting services, recruitment assistance, training grants, and workforce development solutions."
            />

            <ServiceCard
              icon="fas fa-user-graduate"
              title="For Youth"
              description="L.Y.F.E. program providing comprehensive case management and employment services for ages 16-24."
            />

            <ServiceCard
              icon="fas fa-flag-usa"
              title="For Veterans"
              description="Priority services and dedicated support for U.S. Military Veterans and eligible spouses."
            />

            <ServiceCard
              icon="fas fa-chalkboard-teacher"
              title="Workshops & Training"
              description="Regular workshops covering job search skills, interviewing, computer skills, and career planning."
            />

            <ServiceCard
              icon="fas fa-calendar-alt"
              title="Recruitment Events"
              description="Job fairs and hiring events connecting job seekers directly with local employers."
            />
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className={styles.commitmentSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Our Commitment</h2>

          <div className={styles.commitmentGrid}>
            <div className={styles.commitmentCard}>
              <i className="fas fa-hand-holding-heart"></i>
              <h3>Free Services</h3>
              <p>All services for job seekers and employers are completely free</p>
            </div>

            <div className={styles.commitmentCard}>
              <i className="fas fa-universal-access"></i>
              <h3>Accessibility</h3>
              <p>Auxiliary aids and services available upon request to individuals with disabilities</p>
            </div>

            <div className={styles.commitmentCard}>
              <i className="fas fa-balance-scale"></i>
              <h3>Equal Opportunity</h3>
              <p>Equal opportunity employer/program serving all members of our community</p>
            </div>

            <div className={styles.commitmentCard}>
              <i className="fas fa-shield-alt"></i>
              <h3>Veteran Priority</h3>
              <p>Priority of service for U.S. Military Veterans and eligible spouses</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 className={styles.sectionTitle}>Ready to Work With Us?</h2>
            <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
              Whether you&apos;re looking for employment or seeking to hire qualified candidates, we&apos;re here to help. Visit our Resource Room or contact us to learn more about our services.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/job-seekers" className="btn btn-primary">
                <i className="fas fa-user"></i> Job Seeker Services
              </Link>
              <Link href="/employers" className="btn btn-secondary">
                <i className="fas fa-briefcase"></i> Employer Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
