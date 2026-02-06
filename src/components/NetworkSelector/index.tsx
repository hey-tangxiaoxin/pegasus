import { memo, useMemo } from 'react'
import { Card, Select, Badge, Tooltip, Typography } from 'antd'
import { GlobalOutlined, CheckCircleFilled, UserOutlined } from '@ant-design/icons'
import type { NetworkConfig, AccountInfo } from '../../types'
import { SUPPORTED_NETWORKS, getGroupedNetworks, ALL_NETWORKS_CHAIN_ID } from '../../constants'
import { NetworkIcon } from '../NetworkIcon'
import { formatAddress } from '../../utils/format'
import styles from './index.module.less'

const { Text } = Typography

interface NetworkSelectorProps {
  currentChainId: string
  /** 当前展示的网络：'all' 或链 ID，用于下拉框 value 与“所有网络”选项 */
  displayChainId: string
  isNetworkSwitching: boolean
  isDisabled: boolean
  onNetworkSwitch: (chainId: string) => void
  accounts: AccountInfo[]
  selectedAccountIndex: number
  onAccountChange: (index: number) => void
}

// Testnet badge style - extracted as constant to avoid recreation
const TESTNET_BADGE_STYLE = { backgroundColor: '#f5f5f5', color: '#8c8c8c', fontSize: '10px' }
const TEST_BADGE_STYLE = { backgroundColor: '#fff7e6', color: '#fa8c16', fontSize: '10px', marginLeft: '4px' }

const renderNetworkOption = (
  _chainId: string,
  network: NetworkConfig,
  isSelected: boolean
) => (
  <div className={styles.networkOption}>
    <NetworkIcon network={network} size={24} />
    <div className={styles.networkOptionContent}>
      <div className={styles.networkOptionHeader}>
        <Text strong className={styles.networkName}>{network.shortName}</Text>
        {network.isTestnet && (
          <Badge
            count="Testnet"
            style={TESTNET_BADGE_STYLE}
          />
        )}
        {isSelected && <CheckCircleFilled className={styles.selectedIcon} />}
      </div>
      <Text type="secondary" className={styles.currencySymbol}>
        {network.nativeCurrency.symbol}
      </Text>
    </div>
  </div>
)

// Memoize grouped networks since they're static
const groupedNetworks = getGroupedNetworks()

export const NetworkSelector = memo(({
  currentChainId,
  displayChainId,
  isNetworkSwitching,
  isDisabled,
  onNetworkSwitch,
  accounts,
  selectedAccountIndex,
  onAccountChange,
}: NetworkSelectorProps) => {
  // Memoize current network lookup（按展示用的 displayChainId，'all' 时显示“所有网络”）
  const currentNetwork = useMemo(() => {
    if (displayChainId === ALL_NETWORKS_CHAIN_ID) return null
    return displayChainId ? SUPPORTED_NETWORKS[displayChainId] ?? null : null
  }, [displayChainId])

  const isAllNetworks = displayChainId === ALL_NETWORKS_CHAIN_ID

  // Use pre-computed grouped networks
  const { mainnetList, testnetList } = groupedNetworks

  const renderSelectedLabel = () => {
    if (isAllNetworks) {
      return (
        <div className={styles.selectedLabel}>
          <GlobalOutlined className={styles.placeholderIcon} />
          <span className={styles.selectedName}>All Networks</span>
        </div>
      )
    }
    if (!currentNetwork) {
      return (
        <div className={styles.selectedLabel}>
          <GlobalOutlined className={styles.placeholderIcon} />
          <span>Select Network</span>
        </div>
      )
    }
    return (
      <div className={styles.selectedLabel}>
        <NetworkIcon network={currentNetwork} size={20} />
        <span className={styles.selectedName}>{currentNetwork.shortName}</span>
        {currentNetwork.isTestnet && (
          <Badge
            count="Test"
            style={TEST_BADGE_STYLE}
          />
        )}
      </div>
    )
  }

  const selectedAccount = accounts[selectedAccountIndex]

  const renderAccountLabel = () => {
    if (!selectedAccount) {
      return (
        <div className={styles.selectedLabel}>
          <UserOutlined className={styles.placeholderIcon} />
          <span>Select Account</span>
        </div>
      )
    }
    return (
      <div className={styles.selectedLabel}>
        <div className={styles.accountAvatar}>
          {selectedAccount.name.charAt(0).toUpperCase()}
        </div>
        <span className={styles.selectedName}>{selectedAccount.name}</span>
      </div>
    )
  }

  return (
    <Card
      size="small"
      className={styles.selectorCard}
      styles={{ body: { padding: '12px 16px' } }}
    >
      <div className={styles.cardContent}>
        {/* Network Selector */}
        <div className={styles.selectorGroup}>
          <div className={styles.cardHeader}>
            <GlobalOutlined className={styles.cardIcon} />
            <Text strong className={styles.cardTitle}>Network</Text>
          </div>

          <Select
            value={displayChainId || undefined}
            onChange={onNetworkSwitch}
            loading={isNetworkSwitching}
            disabled={isDisabled || isNetworkSwitching}
            className={styles.networkSelect}
            placeholder="Select Network"
            labelRender={renderSelectedLabel}
            styles={{
              popup: {
                root: {
                  borderRadius: '12px',
                  padding: '8px',
                }
              }
            }}
            popupMatchSelectWidth={280}
          >
            <Select.Option value={ALL_NETWORKS_CHAIN_ID}>
              <div className={styles.networkOption}>
                <GlobalOutlined style={{ fontSize: 24, color: 'var(--color-text-secondary, #8c8c8c)' }} />
                <div className={styles.networkOptionContent}>
                  <div className={styles.networkOptionHeader}>
                    <Text strong className={styles.networkName}>All Networks</Text>
                    {isAllNetworks && <CheckCircleFilled className={styles.selectedIcon} />}
                  </div>
                  <Text type="secondary" className={styles.currencySymbol}>Aggregated balances</Text>
                </div>
              </div>
            </Select.Option>
            <Select.OptGroup label={<div className={styles.mainnetLabel}>Mainnets</div>}>
              {mainnetList.map(([chainId, network]) => (
                <Select.Option key={chainId} value={chainId}>
                  {renderNetworkOption(chainId, network, chainId === displayChainId)}
                </Select.Option>
              ))}
            </Select.OptGroup>

            <Select.OptGroup label={<div className={styles.testnetLabel}>Testnets</div>}>
              {testnetList.map(([chainId, network]) => (
                <Select.Option key={chainId} value={chainId}>
                  {renderNetworkOption(chainId, network, chainId === displayChainId)}
                </Select.Option>
              ))}
            </Select.OptGroup>
          </Select>
        </div>

        {/* Account Selector */}
        <div className={styles.selectorGroup}>
          <div className={styles.cardHeader}>
            <UserOutlined className={styles.cardIcon} />
            <Text strong className={styles.cardTitle}>Account</Text>
          </div>

          <Select
            value={selectedAccountIndex}
            onChange={onAccountChange}
            disabled={accounts.length === 0}
            className={styles.accountSelect}
            placeholder="Select Account"
            labelRender={renderAccountLabel}
            styles={{
              popup: {
                root: {
                  borderRadius: '12px',
                  padding: '8px',
                }
              }
            }}
            popupMatchSelectWidth={240}
          >
            {accounts.map((account, index) => (
              <Select.Option key={account.address} value={index}>
                <div className={styles.accountOption}>
                  <div className={styles.accountOptionAvatar}>
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.accountOptionContent}>
                    <div className={styles.accountOptionHeader}>
                      <Text strong className={styles.accountName}>{account.name}</Text>
                      {index === selectedAccountIndex && <CheckCircleFilled className={styles.selectedIcon} />}
                    </div>
                    <Text type="secondary" className={styles.accountAddress}>
                      {formatAddress(account.address)}
                    </Text>
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Status Indicator */}
        {isAllNetworks && (
          <Tooltip title="Showing balances across all supported networks">
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot} />
              <Text className={styles.statusText}>All</Text>
            </div>
          </Tooltip>
        )}
        {currentNetwork && !isAllNetworks && (
          <Tooltip title={`Connected to ${currentNetwork.chainName}`}>
            <div className={styles.statusIndicator}>
              <span className={styles.statusDot} />
              <Text className={styles.statusText}>{currentNetwork.nativeCurrency.symbol}</Text>
            </div>
          </Tooltip>
        )}

        {currentChainId && !currentNetwork && !isAllNetworks && (
          <Tooltip title="This network is not in the supported list">
            <div className={styles.unknownIndicator}>
              <span className={styles.unknownDot} />
              <Text className={styles.unknownText}>Unknown ({currentChainId})</Text>
            </div>
          </Tooltip>
        )}
      </div>
    </Card>
  )
})
