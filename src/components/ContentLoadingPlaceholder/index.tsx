import { memo } from 'react'
import { Spin } from 'antd'
import styles from './index.module.less'

interface ContentLoadingPlaceholderProps {
  message?: string
  showSkeleton?: boolean
}

export const ContentLoadingPlaceholder = memo(({ message = 'Loading...', showSkeleton = true }: ContentLoadingPlaceholderProps) => (
  <div className={styles.wrapper}>
    <div className={styles.message}>
      <Spin size="small" style={{ marginRight: 8 }} />
      {message}
    </div>
    {showSkeleton && (
      <div className={styles.skeletonCard}>
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonAvatar} />
          <div>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonSub} />
          </div>
        </div>
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
      </div>
    )}
  </div>
))
