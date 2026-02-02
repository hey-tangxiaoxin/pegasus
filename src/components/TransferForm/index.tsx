import { Form, Input, Button } from 'antd'
import type { FormInstance } from 'antd/es/form'
import { SendOutlined } from '@ant-design/icons'
import styles from './index.module.less'

interface TransferFormProps {
  form: FormInstance
  onSubmit: (values: { tokenAddress: string; amount: string; toAddress: string }) => void
}

export const TransferForm = ({ form, onSubmit }: TransferFormProps) => {
  return (
    <div className={styles.sectionCard}>
      <h3 className={styles.sectionTitle}>
        <SendOutlined />
        Send Token
      </h3>
      <Form form={form} onFinish={onSubmit} layout="vertical">
        <Form.Item
          name="tokenAddress"
          label="Token Contract Address"
          rules={[
            { required: true, message: 'Required' },
            { pattern: /^0x[a-fA-F0-9]{40}$/, message: 'Invalid address' }
          ]}
        >
          <Input placeholder="0x..." size="large" />
        </Form.Item>
        <Form.Item
          name="toAddress"
          label="Recipient Address"
          rules={[
            { required: true, message: 'Required' },
            { pattern: /^0x[a-fA-F0-9]{40}$/, message: 'Invalid address' }
          ]}
        >
          <Input placeholder="0x..." size="large" />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: 'Required' },
            { pattern: /^\d+(\.\d+)?$/, message: 'Invalid amount' }
          ]}
        >
          <Input placeholder="0.0" size="large" />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" icon={<SendOutlined />}>
          Send Transaction
        </Button>
      </Form>
    </div>
  )
}
