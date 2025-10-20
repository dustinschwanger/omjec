import PageHero from '@/components/PageHero'
import FeatureCard from '@/components/FeatureCard'
import Link from 'next/link'
import styles from './job-seekers.module.css'

export const metadata = {
  title: 'Job Seeker Services - OhioMeansJobs Erie County',
  description: 'Free job search assistance, resume writing, and career services for Erie County job seekers.',
}

export default function JobSeekersPage() {
  return (
    <>
      <PageHero
        title="Job Seeker Services"
        subtitle="Free resources and support to help you find your next career opportunity"
      />

      {/* Veterans Priority Notice */}
      <section className={styles.veteransNotice}>
        <div className="container">
          <div className={styles.noticeContent}>
            <i className="fas fa-flag-usa" style={{ fontSize: '3rem', color: 'var(--ohio-red)', flexShrink: 0 }}></i>
            <p style={{ textAlign: 'center', fontSize: '1.125rem', lineHeight: '1.8', margin: 0 }}>
              <strong>Priority of Service for U.S. Military Veterans and Eligible Spouses.</strong> We&apos;re committed to minimizing employment transition time after military service.
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className={styles.servicesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How We Can Help You</h2>
          <p className={styles.sectionSubtitle}>All services are completely free of charge</p>

          {/* Feature Services - Two Column Layout */}
          <div className={styles.featureGrid}>
            <FeatureCard
              icon="fas fa-file-alt"
              title="Resume & Cover Letters"
              description="Expert help crafting professional resumes and cover letters that highlight your strengths and get you noticed by employers."
              variant="red"
            />
            <FeatureCard
              icon="fas fa-user-tie"
              title="Interview Coaching"
              description="Practice interviews, learn to answer tough questions confidently, and master professional presentation skills."
              variant="blue"
            />
            <FeatureCard
              icon="fas fa-search"
              title="Job Search Assistance"
              description="Learn effective strategies to find jobs that match your skills, plus one-on-one help navigating OhioMeansJobs.com."
              variant="red"
            />
            <FeatureCard
              icon="fas fa-chart-line"
              title="Career Planning"
              description="Explore career options, assess your skills, and develop a personalized plan for your professional future."
              variant="blue"
            />
          </div>

          {/* Additional Services */}
          <div style={{ maxWidth: '900px', margin: '3rem auto 0' }}>
            <h3 className={styles.subsectionTitle}>Additional Support Services</h3>

            <div className={styles.additionalServicesGrid}>
              <div className={styles.serviceItem}>
                <i className="fas fa-laptop"></i>
                <div>
                  <strong>Free Technology Access</strong>
                  <p>Computers, internet, phones, printer & fax</p>
                </div>
              </div>

              <div className={styles.serviceItem}>
                <i className="fas fa-graduation-cap"></i>
                <div>
                  <strong>GED/ASPIRE Preparation</strong>
                  <p>Earn your high school equivalency</p>
                </div>
              </div>

              <div className={styles.serviceItem}>
                <i className="fas fa-laptop-code"></i>
                <div>
                  <strong>Computer Skills Training</strong>
                  <p>Build essential workplace skills</p>
                </div>
              </div>

              <div className={styles.serviceItem}>
                <i className="fas fa-certificate"></i>
                <div>
                  <strong>Job Training & Certifications</strong>
                  <p>Industry-recognized credentials</p>
                </div>
              </div>

              <div className={styles.serviceItem}>
                <i className="fas fa-tasks"></i>
                <div>
                  <strong>Skills Assessment</strong>
                  <p>Identify strengths and opportunities</p>
                </div>
              </div>

              <div className={styles.serviceItem}>
                <i className="fas fa-chart-bar"></i>
                <div>
                  <strong>Labor Market Data</strong>
                  <p>Current job trends and wages</p>
                </div>
              </div>

              <div className={styles.serviceItem}>
                <i className="fas fa-hands-helping"></i>
                <div>
                  <strong>Community Resources</strong>
                  <p>Housing, transportation, childcare</p>
                </div>
              </div>

              <div className={styles.serviceItem}>
                <i className="fas fa-wheelchair"></i>
                <div>
                  <strong>Disability Services</strong>
                  <p>Specialized support & accommodations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* We Serve All Job Seekers */}
      <section className={styles.serveSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>We Serve All Job Seekers</h2>
          <p className={styles.sectionSubtitle}>Specialized support for diverse backgrounds and circumstances</p>

          <div className={styles.pillContainer}>
            <div className={styles.pill}>
              <i className="fas fa-briefcase"></i>
              <span>First-Time Job Seekers</span>
            </div>
            <div className={styles.pill}>
              <i className="fas fa-history"></i>
              <span>Employment Gaps</span>
            </div>
            <div className={styles.pill}>
              <i className="fas fa-gavel"></i>
              <span>Criminal Background</span>
            </div>
            <div className={styles.pill}>
              <i className="fas fa-flag-usa"></i>
              <span>Veterans & Military Spouses</span>
            </div>
            <div className={styles.pill}>
              <i className="fas fa-wheelchair"></i>
              <span>Disabilities</span>
            </div>
            <div className={styles.pill}>
              <i className="fas fa-user-graduate"></i>
              <span>Career Changes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Preparing for Your Visit */}
      <section className={styles.servicesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Preparing for Your Visit</h2>
          <p className={styles.sectionSubtitle}>What to bring when you visit OhioMeansJobs Erie County</p>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className={styles.checklistCard}>
              <h3><i className="fas fa-clipboard-list"></i> Checklist</h3>

              <ul className={styles.checklist}>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <strong>Professional attire</strong> - Dress as you would for an interview
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <strong>Updated resume or work history</strong> - Bring any version you have
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <strong>Identification</strong> - Valid photo ID
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <strong>Social Security Card</strong> - Original card or documentation
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <strong>Layoff or unemployment paperwork</strong> - If applicable
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* In Demand Jobs Week Videos */}
      <section className={styles.videosSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>In Demand Jobs Week: Recordings of Presentations</h2>
          <p className={styles.sectionSubtitle}>Watch industry presentations to learn about career opportunities in high-demand fields</p>

          <div className={styles.videoGrid}>
            <div className={styles.videoCard}>
              <h3><i className="fas fa-hard-hat"></i> Construction and Maintenance</h3>
              <video controls style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}>
                <source src="/Construction-and-Maintenance-5-4-2021-1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>LEWCO, Great Wolf Lodge & Cedar Fair</p>
            </div>

            <div className={styles.videoCard}>
              <h3><i className="fas fa-utensils"></i> Food Industry</h3>
              <video controls style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}>
                <source src="/Food-Industry-5-6-2021-1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>Chef&apos;s Garden, Raising Cane&apos;s, Wendy&apos;s and Chick-Fil-A</p>
            </div>

            <div className={styles.videoCard}>
              <h3><i className="fas fa-stethoscope"></i> Medical Industry</h3>
              <video controls style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}>
                <source src="/Medical-Industry-5-5-2021-1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>NOMS & Bayshore Counseling</p>
            </div>

            <div className={styles.videoCard}>
              <h3><i className="fas fa-heartbeat"></i> Medical Industry</h3>
              <video controls style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}>
                <source src="/Medical-Industry-Senior-Care-and-Sandusky-Career-Center-5-5-2021-1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>Senior Care & Sandusky Career Center</p>
            </div>

            <div className={styles.videoCard}>
              <h3><i className="fas fa-shopping-cart"></i> Retail</h3>
              <video controls style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}>
                <source src="/Retail-featuring-Home-Depot-Mad-River-Harley-Davidson-and-Cedar-Fair-1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>Home Depot, Mad River Harley-Davidson & Cedar Fair</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className={styles.servicesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Resources for Job Seekers</h2>
          <p className={styles.sectionSubtitle}>Forms, links, and tools to support your job search journey</p>

          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <h3><i className="fas fa-file-alt"></i> Job Seeker Forms</h3>
              <div className={styles.resourceList}>
                <div className={styles.resourceItem}>
                  <i className="fas fa-file-download"></i>
                  <div>
                    <a href="/WIA Application Form revised 2014.docx" download>WIOA Application</a>
                    <p>
                      <i className="fas fa-phone"></i> Call for appt:{' '}
                      <a href="tel:4196246459">419-624-6459</a>
                    </p>
                  </div>
                </div>
                <div className={styles.resourceItem}>
                  <i className="fas fa-file-download"></i>
                  <div>
                    <a href="/PRC 08 Checklist.docx" download>PRC Application</a>
                    <p>
                      <i className="fas fa-phone"></i> Call for appt:{' '}
                      <a href="tel:4196246459">419-624-6459</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.resourceCard}>
              <h3><i className="fas fa-search"></i> Job Search Links</h3>
              <ul className={styles.linkList}>
                <li>
                  <i className="fas fa-external-link-alt"></i>
                  <a href="https://ohiomeansjobs.com" target="_blank" rel="noopener noreferrer">
                    OhioMeansJobs Main Page
                  </a>
                </li>
                <li>
                  <i className="fas fa-external-link-alt"></i>
                  <a href="https://ohiomeansjobs.com/omj/individuals/apprenticeship" target="_blank" rel="noopener noreferrer">
                    How to create an Apprenticeship account
                  </a>
                </li>
                <li>
                  <i className="fas fa-external-link-alt"></i>
                  <a href="https://ohiomeansjobs.com/omj/youth/apprenticeship" target="_blank" rel="noopener noreferrer">
                    How to create a Youth K-12 Apprenticeship Program
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.resourceCard}>
              <h3><i className="fas fa-link"></i> Resource Links</h3>
              <ul className={styles.linkList}>
                <li>
                  <i className="fas fa-file-pdf"></i>
                  <a href="/JFS3800.docx" download>
                    FoodStamps, Medicaid, TANF application
                  </a>
                </li>
                <li>
                  <i className="fas fa-book"></i>
                  <a href="#">Community Resource Guide</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 className={styles.sectionTitle}>Ready to Get Started?</h2>
            <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
              Visit our Resource Room to access job search tools, or contact us to schedule an appointment with a career counselor.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://ohiomeansjobs.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <i className="fas fa-search"></i> Search Jobs on OhioMeansJobs.com
              </a>
              <Link href="/contact" className="btn btn-secondary">
                <i className="fas fa-calendar-alt"></i> Schedule an Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
