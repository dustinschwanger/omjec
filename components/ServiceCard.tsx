import styles from './ServiceCard.module.css'

interface ServiceCardProps {
  icon: string
  title: string
  description: string
}

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceIcon}>
        <i className={icon}></i>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
