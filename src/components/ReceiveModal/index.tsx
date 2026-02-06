import { memo, useEffect, useState, useMemo } from 'react'
import { Modal, Typography, Button, Tabs } from 'antd'
import { QrcodeOutlined, CopyOutlined, CheckCircleFilled, CloseOutlined } from '@ant-design/icons'
import { QRCodeSVG } from 'qrcode.react'
import { copyToClipboard } from '../../utils'
import { useNetworks } from '../../contexts/NetworksContext'
import { NetworkIcon } from '../NetworkIcon'
import type { NetworkConfig } from '../../types'
import styles from './index.module.less'

const { Text } = Typography

const getNetworkLabel = (n: NetworkConfig) => n.displayName ?? n.shortName ?? n.chainName

interface ReceiveModalProps {
  open: boolean
  onClose: () => void
  address: string
  currentChainId: string | null
}

export const ReceiveModal = memo(({ open, onClose, address, currentChainId }: ReceiveModalProps) => {
  const { supportedNetworks, getGroupedNetworks } = useNetworks()
  const { mainnetList, testnetList } = useMemo(() => getGroupedNetworks(), [getGroupedNetworks])
  const [selectedChainId, setSelectedChainId] = useState<string | null>(currentChainId)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (currentChainId) setSelectedChainId(currentChainId)
  }, [currentChainId])

  const effectiveChainId = selectedChainId || currentChainId
  const selectedNetwork: NetworkConfig | null = effectiveChainId ? supportedNetworks[effectiveChainId] : null

  const handleCopy = () => {
    copyToClipboard(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderNetworkList = (networks: [string, NetworkConfig][]) => (
    <div className={styles.networkList}>
      {networks.map(([chainId, network]) => (
        <div
          key={chainId}
          className={`${styles.networkItem} ${effectiveChainId === chainId ? styles.selected : ''}`}
          onClick={() => setSelectedChainId(chainId)}
        >
          <div className={styles.networkInfo}>
            <NetworkIcon network={network} size={22} />
            <span className={styles.networkName}>{getNetworkLabel(network)}</span>
          </div>
          {effectiveChainId === chainId && <CheckCircleFilled className={styles.checkIcon} />}
        </div>
      ))}
    </div>
  )

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      closable={false}
      title={null}
      styles={{ mask: { backdropFilter: 'blur(12px)', background: 'rgba(0, 0, 0, 0.6)' } }}
      className={styles.receiveModal}
      destroyOnHidden
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderContent}>
          <div className={styles.titleWrapper}>
            <div className={styles.titleIcon}><QrcodeOutlined /></div>
            <div>
              <h2 className={styles.modalTitle}>Receive</h2>
              <p className={styles.modalSubtitle}>Select network and share address</p>
            </div>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose}><CloseOutlined /></button>
        </div>
      </div>

      <div className={styles.modalContent}>
        <div className={styles.twoColumnLayout}>
          <div className={styles.networkSelector}>
            <Text className={styles.sectionTitle}>Select Network</Text>
            <Tabs
              defaultActiveKey="mainnet"
              size="small"
              className={styles.networkTabs}
              items={[
                { key: 'mainnet', label: 'Mainnet', children: renderNetworkList(mainnetList) },
                { key: 'testnet', label: 'Testnet', children: renderNetworkList(testnetList) },
              ]}
            />
          </div>

          <div className={styles.qrSection}>
            {selectedNetwork && address ? (
              <>
                <div className={styles.selectedNetworkBadge}>
                  <NetworkIcon network={selectedNetwork} size={20} />
                  <Text>{getNetworkLabel(selectedNetwork)}</Text>
                </div>
                <div className={styles.qrWrapper}>
                  <QRCodeSVG value={address} size={180} level="M" bgColor="#ffffff" fgColor="#000000" />
                </div>
                <Text className={styles.scanHint}>Scan QR code to transfer to this address</Text>
                <div className={styles.addressSection}>
                  <div className={styles.addressBox}>
                    <p className={styles.addressText}>{address}</p>
                  </div>
                  <Button
                    type="primary"
                    icon={copied ? <CheckCircleFilled /> : <CopyOutlined />}
                    onClick={handleCopy}
                    className={styles.copyBtn}
                    block
                  >
                    {copied ? 'Copied' : 'Copy Address'}
                  </Button>
                </div>
                <div className={styles.warningBox}>
                  <Text className={styles.warningText}>
                    ⚠️ Please ensure the sender uses the <strong>{getNetworkLabel(selectedNetwork)}</strong> network, otherwise assets may be lost
                  </Text>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <QrcodeOutlined className={styles.emptyIcon} />
                <Text className={styles.emptyText}>Please select a network on the left</Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
})
