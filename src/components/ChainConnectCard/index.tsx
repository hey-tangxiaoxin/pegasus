import { Button } from 'antd'
import styles from './index.module.less'

export interface ChainConnectCardProps {
  title: string
  icon: React.ReactNode
  description: string
  buttonLabel: string
  onConnect: () => void
}

export function ChainConnectCard({ title, icon, description, buttonLabel, onConnect }: ChainConnectCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      <Button type="primary" size="large" onClick={onConnect} className={styles.button}>
        {buttonLabel}
      </Button>
    </div>
  )
}
