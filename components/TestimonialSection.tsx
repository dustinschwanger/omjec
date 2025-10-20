import styles from './TestimonialSection.module.css'

export default function TestimonialSection() {
  return (
    <section className={styles.faqSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>Success Stories</h2>

        <div className={styles.testimonialCard}>
          <i className="fas fa-quote-left" style={{
            fontSize: '2.5rem',
            color: 'var(--ohio-red)',
            marginBottom: '1.5rem',
            display: 'block'
          }}></i>
          <p className={styles.testimonialQuote}>
            &ldquo;We would like to thank you so much for all the hard work you do getting people like us back on our feet.&rdquo;
          </p>
          <p className={styles.testimonialAuthor}>
            — Wilbur & Jeanne, Sandusky
          </p>
        </div>
      </div>
    </section>
  )
}
