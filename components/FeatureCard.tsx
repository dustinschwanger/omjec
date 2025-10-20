import styles from './FeatureCard.module.css'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  variant?: 'red' | 'blue'
}

export default function FeatureCard({ icon, title, description, variant = 'red' }: FeatureCardProps) {
  return (
    <div className={`${styles.featureCard} ${variant === 'red' ? styles.red : styles.blue}`}>
      <div className={styles.content}>
        <div className={styles.iconBox}>
          <i className={icon}></i>
        </div>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </div>
  )
}
