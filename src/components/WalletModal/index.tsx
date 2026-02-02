import { memo, useMemo, useCallback } from 'react'
import { Modal } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import type { WalletProvider } from '../../types'
import { getWalletIcon, RECOMMENDED_WALLETS } from '../../constants'
import styles from './index.module.less'

interface WalletModalProps {
  open: boolean
  onClose: () => void
  availableWallets: WalletProvider[]
  connectedWalletId?: string
  onConnect: (wallet: WalletProvider) => void
}

// Normalize wallet name for comparison
const normalizeForCompare = (name: string) =>
  name.toLowerCase().replace(/\s+wallet$/i, '').replace(/\s+/g, '').replace(/ex$/i, '')

export const WalletModal = memo(({ open, onClose, availableWallets, connectedWalletId, onConnect }: WalletModalProps) => {
  // Memoize filtered recommended wallets to avoid recalculation on each render
  const filteredRecommendedWallets = useMemo(() => 
    RECOMMENDED_WALLETS.filter(rw => {
      const recommendedKey = normalizeForCompare(rw.name)
      return !availableWallets.some(aw => {
        const detectedKey = normalizeForCompare(aw.name)
        return detectedKey === recommendedKey || 
               detectedKey.includes(recommendedKey) || 
               recommendedKey.includes(detectedKey)
      })
    }), [availableWallets])

  // Memoize modal styles to prevent object recreation
  const modalStyles = useMemo(() => ({
    mask: {
      backdropFilter: 'blur(12px)',
      background: 'rgba(0, 0, 0, 0.6)',
    },
  }), [])

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      closable={false}
      title={null}
      styles={modalStyles}
      className="wallet-modal"
    >
      {/* Modal Header */}
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderContent}>
          <div>
            <h2 className={styles.modalTitle}>Connect Wallet</h2>
            <p className={styles.modalSubtitle}>Choose your preferred wallet</p>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>
      </div>

      {/* Wallet List */}
      <div className={styles.walletListContainer}>
        {/* Detected Wallets */}
        {availableWallets.length > 0 && (
          <>
            <div className={`${styles.walletGroupLabel} ${styles.detectedLabel}`}>
              <span className={styles.labelDot} />
              Detected ({availableWallets.length})
            </div>
            <div className={`${styles.walletList} ${styles.detectedWalletList}`}>
              {availableWallets.map((wallet) => {
                const isConnected = connectedWalletId === wallet.id
                return (
                  <div 
                    key={wallet.id}
                    className={`${styles.detectedWalletItem} ${isConnected ? styles.connectedWalletItem : ''}`}
                    onClick={() => onConnect(wallet)}
                  >
                    <div className={styles.walletIconWrapper}>
                      {getWalletIcon(wallet.name)}
                    </div>
                    <div className={styles.walletInfoWrapper}>
                      <div className={styles.detectedWalletName}>{wallet.name}</div>
                      <div className={styles.walletStatus}>
                        {isConnected ? 'Connected' : 'Ready to connect'}
                      </div>
                    </div>
                    {isConnected ? (
                      <div className={styles.connectedBadge}>Connected</div>
                    ) : (
                      <div className={styles.connectBtnSmall}>Connect</div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Recommended Wallets */}
        <div className={`${styles.walletGroupLabel} ${styles.recommendedLabel}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          {availableWallets.length > 0 ? 'More Wallets' : 'Recommended Wallets'}
        </div>
        <div className={styles.walletList}>
          {filteredRecommendedWallets.map((wallet) => (
            <div 
              key={wallet.name}
              className={styles.recommendedWalletItem}
              onClick={() => window.open(wallet.chromeStoreUrl, '_blank')}
            >
              <div className={styles.walletIconWrapper}>
                {getWalletIcon(wallet.name)}
              </div>
              <div className={styles.walletInfoWrapper}>
                <div className={styles.recommendedWalletName}>{wallet.name}</div>
                <div className={styles.walletDescription}>{wallet.description}</div>
              </div>
              <div className={styles.installBtn}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Install
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer Hint */}
        <div className={styles.footerHint}>
          <div className={styles.footerHintIcon}>🔒</div>
          <p className={styles.footerHintText}>Secure connection. Your keys stay with you.</p>
        </div>
      </div>
    </Modal>
  )
})
