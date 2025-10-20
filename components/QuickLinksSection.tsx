import styles from './QuickLinksSection.module.css'

const quickLinks = [
  {
    icon: 'fas fa-external-link-alt',
    title: 'OhioMeansJobs.com',
    description: 'Search jobs and create your profile',
    url: 'https://ohiomeansjobs.com'
  },
  {
    icon: 'fas fa-file-invoice-dollar',
    title: 'Unemployment Services',
    description: 'File for unemployment benefits',
    url: 'https://unemployment.ohio.gov'
  },
  {
    icon: 'fas fa-building',
    title: 'Ohio Job & Family Services',
    description: 'State resources and programs',
    url: 'https://jfs.ohio.gov'
  },
  {
    icon: 'fas fa-flag-usa',
    title: 'Veterans Services',
    description: 'Career resources for veterans',
    url: 'https://www.va.gov/careers-employment/'
  }
]

export default function QuickLinksSection() {
  return (
    <section id="resources" className={styles.quickLinksSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Quick Links & Resources</h2>

        <div className={styles.quickLinksGrid}>
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quickLinkCard}
            >
              <i className={link.icon}></i>
              <h3>{link.title}</h3>
              <p>{link.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
