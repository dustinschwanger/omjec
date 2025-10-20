import Link from 'next/link'
import ServiceCard from './ServiceCard'
import styles from './ServicesSection.module.css'

const jobSeekerServices = [
  {
    icon: 'fas fa-search',
    title: 'Job Search Assistance',
    description: 'Access thousands of job listings and get personalized help finding opportunities that match your skills and goals.'
  },
  {
    icon: 'fas fa-file-alt',
    title: 'Resume Writing Help',
    description: 'Get expert assistance crafting a professional resume that highlights your strengths and gets you noticed.'
  },
  {
    icon: 'fas fa-user-tie',
    title: 'Career Counseling',
    description: 'Work one-on-one with career coaches who can help you explore options and develop a career path.'
  },
  {
    icon: 'fas fa-graduation-cap',
    title: 'Training & Skills Development',
    description: 'Access training programs and resources to build new skills and advance your career.'
  },
  {
    icon: 'fas fa-money-check-alt',
    title: 'Unemployment Services',
    description: 'Get information and assistance with unemployment benefits and job search requirements.'
  },
  {
    icon: 'fas fa-upload',
    title: 'Online Profile Creation',
    description: 'Create your profile and upload your resume to OhioMeansJobs.com to connect with employers.'
  }
]

export default function JobSeekersSection() {
  return (
    <section id="job-seekers" className={styles.servicesSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>For Job Seekers</h2>
        <p className={styles.sectionSubtitle}>We&apos;re here to help you find your next opportunity</p>

        <div className={styles.servicesGrid}>
          {jobSeekerServices.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>

        <div className={styles.sectionCta}>
          <Link href="/job-seekers" className="btn btn-primary">
            Learn More About Job Seeker Services
          </Link>
        </div>
      </div>
    </section>
  )
}
