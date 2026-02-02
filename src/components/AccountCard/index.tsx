import { Tooltip, message } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import type { AccountInfo, TokenInfo } from '../../types'
import { copyToClipboard } from '../../utils'
import { formatAddress, formatBalance } from '../../utils/format'
import styles from './index.module.less'

interface AccountCardProps {
  account: AccountInfo
  nativeSymbol: string
  onTokenClick?: (token: TokenInfo) => void
}

export const AccountCard = ({ account, nativeSymbol, onTokenClick }: AccountCardProps) => {
  return (
    <div className={styles.accountCard}>
      <div className={styles.accountHeader}>
        <div className={styles.accountInfo}>
          <div className={styles.accountAvatar}>
            {account.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className={styles.accountName}>{account.name}</h3>
            <Tooltip title="Click to copy">
              <span 
                className={styles.accountAddress}
                onClick={() => copyToClipboard(account.address)}
              >
                {formatAddress(account.address)}
                <CopyOutlined className={styles.iconMarginLeft} style={{ fontSize: 12 }} />
              </span>
            </Tooltip>
          </div>
        </div>
        <div className={styles.accountBalance}>
          <div className={styles.balanceLabel}>Balance</div>
          <div className={styles.balanceValue}>
            {formatBalance(account.nativeBalance)}
            <span className={styles.balanceSymbol}>{nativeSymbol}</span>
          </div>
        </div>
      </div>
      <div className={styles.tokenSection}>
        <div className={styles.tokenSectionTitle}>Token Holdings</div>
        {account.tokens.length > 0 ? (
          <div className={styles.tokenList}>
            {account.tokens.map((token) => (
              <div 
                key={token.address} 
                className={styles.tokenItem}
                onClick={() => {
                  onTokenClick?.(token)
                  message.success(`Token address filled: ${token.symbol}`)
                }}
              >
                <div className={styles.tokenIcon}>
                  {token.symbol.slice(0, 2)}
                </div>
                <div className={styles.tokenDetails}>
                  <div className={styles.tokenSymbol}>{token.symbol}</div>
                  <div className={styles.tokenName}>{token.name}</div>
                </div>
                <div className={styles.tokenBalance}>
                  {formatBalance(token.balance)} {token.symbol}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noTokens}>No tokens found on this network</div>
        )}
      </div>
    </div>
  )
}
