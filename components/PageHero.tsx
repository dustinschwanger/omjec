import styles from './PageHero.module.css'

interface PageHeroProps {
  title: string
  subtitle: string
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}></div>
      <div className={styles.heroOverlay}></div>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroSubtitle}>{subtitle}</p>
        </div>
      </div>
    </section>
  )
}
