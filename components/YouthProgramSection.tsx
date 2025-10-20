import Link from 'next/link'
import styles from './ServicesSection.module.css'

export default function YouthProgramSection() {
  return (
    <section className={styles.servicesSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>L.Y.F.E. Youth Program</h2>
        <p className={styles.sectionSubtitle}>Leading Youth to Feel Empowered!</p>

        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: '70px',
            height: '70px',
            margin: '0 auto 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--ohio-blue), var(--ohio-red))',
            color: 'white',
            borderRadius: '50%',
            fontSize: '1.75rem'
          }}>
            <i className="fas fa-users"></i>
          </div>
          <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', lineHeight: '1.8' }}>
            Our Comprehensive Case Management Employment Program (CCMEP) serves youth ages 16-24 who qualify based on income, education, or life circumstances. We provide support for high school completion, job placement, internships, leadership development, and post-secondary education.
          </p>
          <Link href="/youth-program" className="btn btn-primary">
            Learn About L.Y.F.E. Program
          </Link>
        </div>
      </div>
    </section>
  )
}
