import { memo, useState, type ChangeEvent } from 'react'
import { Modal, Form, Input, Select, Button } from 'antd'
import { SendOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons'
import type { AccountInfo } from '../../types'
import { formatBalance } from '../../utils/format'
import styles from './index.module.less'

// Only allow numeric input (digits and one decimal point)
const handleNumericInput = (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  if (value && !/^\d*\.?\d*$/.test(value)) {
    e.target.value = value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')
  }
}

interface SendModalProps {
  open: boolean
  onClose: () => void
  account: AccountInfo | undefined
  nativeSymbol: string
  onSend: (values: { tokenAddress: string; amount: string; toAddress: string }) => void
}

export const SendModal = memo(({ open, onClose, account, nativeSymbol, onSend }: SendModalProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedToken, setSelectedToken] = useState<string>('native')

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      await onSend({ tokenAddress: values.token === 'native' ? '' : values.token, amount: values.amount.toString(), toAddress: values.toAddress })
      form.resetFields()
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const tokenOptions = [
    { value: 'native', label: `${nativeSymbol} (Native Token)`, balance: account?.nativeBalance || '0', symbol: nativeSymbol },
    ...(account?.tokens.map(t => ({ value: t.address, label: `${t.symbol} - ${t.name}`, balance: t.balance, symbol: t.symbol })) || []),
  ]

  const currentToken = tokenOptions.find(t => t.value === selectedToken)

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
      className={styles.sendModal}
      destroyOnHidden
    >
      <div className={styles.modalHeader}>
        <div className={styles.modalHeaderContent}>
          <div className={styles.titleWrapper}>
            <div className={styles.titleIcon}><SendOutlined /></div>
            <div>
              <h2 className={styles.modalTitle}>Send Tokens</h2>
              <p className={styles.modalSubtitle}>Send tokens to another address</p>
            </div>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose}><CloseOutlined /></button>
        </div>
      </div>

      <div className={styles.modalContent}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ token: 'native' }}>
          <Form.Item label={<label className={styles.formLabel}>Select Token</label>} name="token" rules={[{ required: true, message: 'Please select a token' }]}>
            <Select size="large" value={selectedToken} onChange={setSelectedToken} options={tokenOptions.map(token => ({ value: token.value, label: token.label }))} suffixIcon={<DownOutlined />} className={styles.tokenSelect} />
          </Form.Item>
          <Form.Item
            label={<label className={styles.formLabel}>Amount</label>}
            name="amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
            extra={
              <span className={styles.balanceExtra}>
                Available {formatBalance(currentToken?.balance || '0')} {currentToken?.symbol}
                {' · '}
                <button type="button" className={styles.maxLink} onClick={() => form.setFieldValue('amount', currentToken?.balance)}>MAX</button>
              </span>
            }
            className={styles.formItem}
          >
            <Input size='large' placeholder="0.0" onChange={handleNumericInput} addonAfter={currentToken?.symbol} className={styles.amountInput} />
          </Form.Item>

          <Form.Item
            label={<label className={styles.formLabel}>Recipient Address</label>}
            name="toAddress"
            rules={[{ required: true, message: 'Please enter recipient address' }, { pattern: /^0x[a-fA-F0-9]{40}$/, message: 'Invalid address format' }]}
            className={styles.formItem}
          >
            <Input size='large' placeholder="0x..." className={styles.addressInput} />
          </Form.Item>

          <div className={styles.feeBox}>
            <div className={styles.feeRow}>
              <span className={styles.feeLabel}>Estimated Gas Fee</span>
              <span className={styles.feeValue}>~ 0.002 {nativeSymbol}</span>
            </div>
            <div className={styles.feeRow}>
              <span className={styles.feeLabel}>Estimated Time</span>
              <span className={styles.feeValue}>~15 seconds</span>
            </div>
          </div>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<SendOutlined />} className={styles.submitBtn}>
            Confirm Send
          </Button>
        </Form>

        <div className={styles.footerHint}>
          <div className={styles.footerHintIcon}>🔒</div>
          <p className={styles.footerHintText}>Please verify the recipient address carefully. Transactions cannot be reversed once sent.</p>
        </div>
      </div>
    </Modal>
  )
})
