import { memo, useState } from 'react'
import { Modal, Form, Select, Button, InputNumber } from 'antd'
import { SwapOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons'
import type { AccountInfo } from '../../types'
import { formatBalance } from '../../utils/format'
import styles from './index.module.less'

interface SwapModalProps {
  open: boolean
  onClose: () => void
  account: AccountInfo | undefined
  nativeSymbol: string
}

const swapTokens = [
  { symbol: 'ETH', icon: '⟠' },
  { symbol: 'USDT', icon: '₮' },
  { symbol: 'USDC', icon: '$' },
  { symbol: 'DAI', icon: '◈' },
  { symbol: 'WBTC', icon: '₿' },
]

export const SwapModal = memo(({ open, onClose, account, nativeSymbol }: SwapModalProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fromToken, setFromToken] = useState(nativeSymbol)
  const [toToken, setToToken] = useState('USDT')

  const handleSubmit = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onClose()
      form.resetFields()
    }, 1500)
  }

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    form.setFieldsValue({ fromToken: toToken, toToken: fromToken })
  }

  const tokenOptions = swapTokens.map(t => ({ value: t.symbol, label: <span>{t.icon} {t.symbol}</span> }))

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      closable={false}
      title={null}
      styles={{ mask: { backdropFilter: 'blur(12px)', background: 'rgba(0, 0, 0, 0.6)' } }}
      className={styles.swapModal}
      destroyOnClose
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderContent}>
          <div className={styles.titleWrapper}>
            <div className={styles.titleIcon}><SwapOutlined /></div>
            <div>
              <h2 className={styles.modalTitle}>Token Swap</h2>
              <p className={styles.modalSubtitle}>Quickly swap different tokens</p>
            </div>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose}><CloseOutlined /></button>
        </div>
      </div>

      <div className={styles.modalContent}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ fromToken: nativeSymbol, toToken: 'USDT' }}>
          <div className={styles.tokenBox}>
            <div className={styles.tokenBoxHeader}>
              <span className={styles.tokenBoxLabel}>Pay</span>
              <span className={styles.tokenBalance}>Balance: {formatBalance(account?.nativeBalance || '0')} {fromToken}</span>
            </div>
            <div className={styles.tokenInputRow}>
              <Form.Item name="fromAmount" noStyle rules={[{ required: true, message: 'Please enter amount' }]}>
                <InputNumber placeholder="0.0" variant="borderless" className={styles.tokenInput} min={0} stringMode />
              </Form.Item>
              <Form.Item name="fromToken" noStyle>
                <Select className={styles.tokenSelect} value={fromToken} onChange={setFromToken} suffixIcon={<DownOutlined />} options={tokenOptions} />
              </Form.Item>
            </div>
            <button type="button" className={styles.maxBtn} onClick={() => form.setFieldValue('fromAmount', account?.nativeBalance)}>MAX</button>
          </div>

          <div className={styles.swapBtnWrapper}>
            <button type="button" className={styles.swapBtn} onClick={handleSwapTokens}><SwapOutlined rotate={90} /></button>
          </div>

          <div className={styles.tokenBox}>
            <div className={styles.tokenBoxHeader}>
              <span className={styles.tokenBoxLabel}>Receive</span>
            </div>
            <div className={styles.tokenInputRow}>
              <Form.Item name="toAmount" noStyle>
                <InputNumber placeholder="0.0" variant="borderless" className={styles.tokenInput} disabled />
              </Form.Item>
              <Form.Item name="toToken" noStyle>
                <Select className={styles.tokenSelect} value={toToken} onChange={setToToken} suffixIcon={<DownOutlined />} options={tokenOptions} />
              </Form.Item>
            </div>
          </div>

          <div className={styles.rateBox}>
            <div className={styles.rateRow}>
              <span className={styles.rateLabel}>Exchange Rate</span>
              <span className={styles.rateValue}>1 {fromToken} = 2,450 {toToken}</span>
            </div>
            <div className={styles.rateRow}>
              <span className={styles.rateLabel}>Price Impact</span>
              <span className={styles.rateValueGreen}>&lt; 0.01%</span>
            </div>
            <div className={styles.rateRow}>
              <span className={styles.rateLabel}>Fee</span>
              <span className={styles.rateValue}>0.3%</span>
            </div>
          </div>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<SwapOutlined />} className={styles.submitBtn}>
            Confirm Swap
          </Button>
        </Form>

        <div className={styles.footerHint}>
          <div className={styles.footerHintIcon}>⚡</div>
          <p className={styles.footerHintText}>Automatically routed through DEX for optimal swap path</p>
        </div>
      </div>
    </Modal>
  )
})
