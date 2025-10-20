import styles from './Mission.module.css'

export default function Mission() {
  return (
    <section className={styles.mission}>
      <div className="container">
        <div className={styles.missionContent}>
          <i className={`fas fa-bullseye ${styles.missionIcon}`}></i>
          <p className={styles.missionText}>
            OhioMeansJobs Erie County is a local workforce resource center providing free services to job seekers and businesses. We offer workshops, career development, job search tools, and comprehensive support to help you succeed. Priority services available for U.S. Military Veterans and eligible spouses.
          </p>
        </div>
      </div>
    </section>
  )
}
