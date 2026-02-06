import { memo, useCallback } from 'react'
import { Tooltip, message } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import type { AccountInfo, TokenInfo, NetworkBalanceInfo } from '../../types'
import { copyToClipboard } from '../../utils'
import { formatAddress, formatBalance } from '../../utils/format'
import { NetworkIcon } from '../NetworkIcon'
import styles from './index.module.less'

interface AccountCardProps {
  account: AccountInfo
  nativeSymbol: string
  onTokenClick?: (token: TokenInfo) => void
  /** “所有网络”视图：按链展示的余额与代币，有值时忽略 account 的 balance/tokens 展示方式 */
  allNetworksData?: NetworkBalanceInfo[] | null
}

export const AccountCard = memo(({ account, nativeSymbol, onTokenClick, allNetworksData }: AccountCardProps) => {
  const handleCopyAddress = useCallback(() => {
    copyToClipboard(account.address)
  }, [account.address])

  const handleTokenClick = useCallback((token: TokenInfo) => {
    onTokenClick?.(token)
    message.success(`Token address filled: ${token.symbol}`)
  }, [onTokenClick])

  const hasAllNetworksData = Array.isArray(allNetworksData) && allNetworksData.length > 0

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
                onClick={handleCopyAddress}
              >
                {formatAddress(account.address)}
                <CopyOutlined className={styles.iconMarginLeft} style={{ fontSize: 12 }} />
              </span>
            </Tooltip>
          </div>
        </div>
        {!hasAllNetworksData && (
          <div className={styles.accountBalance}>
            <div className={styles.balanceLabel}>Balance</div>
            <div className={styles.balanceValue}>
              {formatBalance(account.nativeBalance)}
              <span className={styles.balanceSymbol}>{nativeSymbol}</span>
            </div>
          </div>
        )}
      </div>

      {hasAllNetworksData ? (
        <div className={styles.tokenSection}>
          <div className={styles.tokenSectionTitle}>Holdings by Network</div>
          <div className={styles.allNetworksList}>
            {allNetworksData.map(({ chainId, network, nativeBalance, tokens }) => {
              const hasBalance = Number(nativeBalance) > 0 || tokens.length > 0
              if (!hasBalance) return null
              return (
                <div key={chainId} className={styles.networkBlock}>
                  <div className={styles.networkBlockHeader}>
                    <NetworkIcon network={network} size={20} />
                    <span className={styles.networkBlockName}>{network.shortName}</span>
                    <span className={styles.networkBlockNative}>
                      {formatBalance(nativeBalance)} {network.nativeCurrency.symbol}
                    </span>
                  </div>
                  {tokens.length > 0 && (
                    <div className={styles.tokenList}>
                      {tokens.map((token) => (
                        <div
                          key={`${chainId}-${token.address}`}
                          className={styles.tokenItem}
                          onClick={() => handleTokenClick(token)}
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
                  )}
                </div>
              )
            })}
          </div>
          {allNetworksData.every(
            ({ nativeBalance, tokens }) => Number(nativeBalance) === 0 && tokens.length === 0
          ) && (
            <div className={styles.noTokens}>No tokens found across supported networks</div>
          )}
        </div>
      ) : (
        <div className={styles.tokenSection}>
          <div className={styles.tokenSectionTitle}>Token Holdings</div>
          {account.tokens.length > 0 ? (
            <div className={styles.tokenList}>
              {account.tokens.map((token) => (
                <div 
                  key={token.address} 
                  className={styles.tokenItem}
                  onClick={() => handleTokenClick(token)}
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
      )}
    </div>
  )
})
