import { WalletOutlined } from '@ant-design/icons'
import styles from '../App.module.less'

interface WelcomeSectionProps {
  onConnect: () => void
}

export const WelcomeSection = ({ onConnect }: WelcomeSectionProps) => {
  return (
    <div className={styles.welcomeSection}>
      <div className={styles.welcomeIcon}>
        <WalletOutlined />
      </div>
      <h2>Welcome to Pegasus</h2>
      <p>Connect your wallet to manage your crypto assets</p>
      <button className={styles.welcomeBtn} onClick={onConnect}>
        <WalletOutlined className={styles.iconMarginRight} />
        Connect Wallet
      </button>
    </div>
  )
}
