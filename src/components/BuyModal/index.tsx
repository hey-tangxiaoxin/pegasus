import { memo, useState } from 'react'
import { Modal, Form, Select, Button, InputNumber, Typography } from 'antd'
import { DollarOutlined, CreditCardOutlined, CloseOutlined } from '@ant-design/icons'
import styles from './index.module.less'

const { Text } = Typography

interface BuyModalProps {
  open: boolean
  onClose: () => void
  nativeSymbol: string
}

const ApplePayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
)

const paymentMethods = [
  { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { value: 'bank', label: 'Bank Transfer', icon: '🏦' },
  { value: 'apple', label: 'Apple Pay', icon: <ApplePayIcon /> },
]

const popularAmounts = [100, 500, 1000, 5000]

export const BuyModal = memo(({ open, onClose, nativeSymbol }: BuyModalProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onClose()
      form.resetFields()
    }, 1500)
  }

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    form.setFieldValue('amount', amount)
  }

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
      className={styles.buyModal}
      destroyOnClose
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderContent}>
          <div className={styles.titleWrapper}>
            <div className={styles.titleIcon}><DollarOutlined /></div>
            <div>
              <h2 className={styles.modalTitle}>Buy {nativeSymbol}</h2>
              <p className={styles.modalSubtitle}>Buy crypto with fiat currency</p>
            </div>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose}><CloseOutlined /></button>
        </div>
      </div>

      <div className={styles.modalContent}>
        <div className={styles.rateInfo}>
          <Text className={styles.rateLabel}>Current Exchange Rate</Text>
          <div className={styles.rateValue}>1 {nativeSymbol} ≈ $2,450 USD</div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ paymentMethod: 'card' }}>
          <div className={styles.formItem}>
            <label className={styles.formLabel}>Amount (USD)</label>
            <Form.Item name="amount" rules={[{ required: true, message: 'Please enter amount' }]} noStyle>
              <InputNumber size="large" placeholder="Enter amount" prefix="$" className={styles.inputNumber} min={10} max={100000} />
            </Form.Item>
          </div>

          <div className={styles.quickAmounts}>
            {popularAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`${styles.amountBtn} ${selectedAmount === amount ? styles.selected : ''}`}
                onClick={() => handleAmountSelect(amount)}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className={styles.formItem}>
            <label className={styles.formLabel}>Payment Method</label>
            <Form.Item name="paymentMethod" rules={[{ required: true }]} noStyle>
              <Select size="large" className={styles.select} options={paymentMethods.map(m => ({ value: m.value, label: <span>{m.icon} {m.label}</span> }))} />
            </Form.Item>
          </div>

          <div className={styles.estimateBox}>
            <div className={styles.estimateRow}>
              <span className={styles.estimateLabel}>You will receive</span>
              <span className={styles.estimateValue}>~ 0.04 {nativeSymbol}</span>
            </div>
            <div className={styles.estimateRow}>
              <span className={styles.estimateLabel}>Fee</span>
              <span className={styles.estimateValue}>$2.99</span>
            </div>
          </div>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<CreditCardOutlined />} className={styles.submitBtn}>
            Continue to Pay
          </Button>
        </Form>

        <div className={styles.footerHint}>
          <div className={styles.footerHintIcon}>💳</div>
          <p className={styles.footerHintText}>This feature is processed by third-party providers and may require KYC verification</p>
        </div>
      </div>
    </Modal>
  )
})
