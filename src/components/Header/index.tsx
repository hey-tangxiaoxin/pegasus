import { WalletOutlined, DisconnectOutlined, SwapOutlined } from '@ant-design/icons'
import { LogoIcon } from '../Logo'
import { formatAddress } from '../../utils/format'
import styles from '../../App.module.less'

interface HeaderProps {
  account: string
  onConnect: () => void
  onDisconnect: () => void
}

export const Header = ({ account, onConnect, onDisconnect }: HeaderProps) => {
  return (
    <header className={styles.appHeader}>
      <div className={styles.headerLeft}>
        <div className={styles.appLogo}>
          <LogoIcon />
        </div>
        <h1 className={styles.appTitle}>Pegasus</h1>
      </div>
      <div className={styles.headerRight}>
        {account && (
          <div className={styles.walletStatus}>
            <span className={styles.statusDot} />
            <span>{formatAddress(account)}</span>
          </div>
        )}
        {account ? (
          <div className={styles.headerBtnGroup}>
            <button className={styles.switchBtn} onClick={onConnect}>
              <SwapOutlined className={styles.iconMarginRight} />
              Switch
            </button>
            <button className={styles.disconnectBtn} onClick={onDisconnect}>
              <DisconnectOutlined className={styles.iconMarginRight} />
              Disconnect
            </button>
          </div>
        ) : (
          <button className={styles.connectBtn} onClick={onConnect}>
            <WalletOutlined className={styles.iconMarginRight} />
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  )
}
