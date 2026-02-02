import { memo } from 'react'
import { Tooltip } from 'antd'
import { 
  DollarOutlined, 
  SwapOutlined, 
  SendOutlined, 
  QrcodeOutlined 
} from '@ant-design/icons'
import styles from './index.module.less'

export type ActionType = 'buy' | 'swap' | 'send' | 'receive'

interface ActionButtonsProps {
  onAction: (action: ActionType) => void
  disabled?: boolean
}

const actions = [
  { key: 'buy' as ActionType, icon: DollarOutlined, label: 'Buy', color: '#22c55e' },
  { key: 'swap' as ActionType, icon: SwapOutlined, label: 'Swap', color: '#8b5cf6' },
  { key: 'send' as ActionType, icon: SendOutlined, label: 'Send', color: '#3b82f6' },
  { key: 'receive' as ActionType, icon: QrcodeOutlined, label: 'Receive', color: '#f59e0b' },
]

export const ActionButtons = memo(({ onAction, disabled }: ActionButtonsProps) => {
  return (
    <div className={styles.actionContainer}>
      {actions.map(({ key, icon: Icon, label, color }) => (
        <Tooltip key={key} title={label}>
          <button
            className={styles.actionButton}
            onClick={() => onAction(key)}
            disabled={disabled}
            style={{ '--action-color': color } as React.CSSProperties}
          >
            <div className={styles.iconWrapper}>
              <Icon className={styles.actionIcon} />
            </div>
            <span className={styles.actionLabel}>{label}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  )
})
