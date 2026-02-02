import type { NetworkConfig } from '../../types'
import { NetworkIcons } from '../../constants'
import styles from './index.module.less'

interface NetworkIconProps {
  network: NetworkConfig
  size?: number
}

export const NetworkIcon = ({ network, size = 20 }: NetworkIconProps) => {
  const icon = NetworkIcons[network.iconKey]
  
  if (icon) {
    return (
      <span className={styles.iconWrapper} style={{ width: size, height: size }}>
        {icon}
      </span>
    )
  }
  
  return (
    <span
      className={styles.fallbackIcon}
      style={{ width: size, height: size, backgroundColor: network.iconColor }}
    />
  )
}
