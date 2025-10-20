import Link from 'next/link'
import ServiceCard from './ServiceCard'
import styles from './ServicesSection.module.css'

const employerServices = [
  {
    icon: 'fas fa-users',
    title: 'Recruitment Assistance',
    description: 'Let us help you find the right candidates for your open positions at no cost to your business.'
  },
  {
    icon: 'fas fa-bullhorn',
    title: 'Job Posting Services',
    description: 'Post your job openings for free and reach thousands of qualified job seekers across Ohio.'
  },
  {
    icon: 'fas fa-dollar-sign',
    title: 'Tax Credit Information',
    description: 'Learn about Work Opportunity Tax Credits (WOTC) and other incentives for hiring.'
  },
  {
    icon: 'fas fa-chalkboard-teacher',
    title: 'Training Resources',
    description: 'Access training programs and resources to develop your workforce and improve employee skills.'
  },
  {
    icon: 'fas fa-calendar-alt',
    title: 'Hiring Event Coordination',
    description: 'We can help you organize and promote hiring events to connect with multiple candidates at once.'
  },
  {
    icon: 'fas fa-handshake',
    title: 'Business Partnership',
    description: 'Partner with us for ongoing recruitment support and workforce development solutions.'
  }
]

export default function EmployersSection() {
  return (
    <section id="employers" className={`${styles.servicesSection} ${styles.altBg}`}>
      <div className="container">
        <h2 className={styles.sectionTitle}>For Employers</h2>
        <p className={styles.sectionSubtitle}>Find qualified candidates and grow your business</p>

        <div className={styles.servicesGrid}>
          {employerServices.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>

        <div className={styles.sectionCta}>
          <Link href="/employers" className="btn btn-primary">
            Explore Employer Services
          </Link>
        </div>
      </div>
    </section>
  )
}
