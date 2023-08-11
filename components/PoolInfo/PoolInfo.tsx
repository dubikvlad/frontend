import classNames from 'classnames'

import styles from './PoolInfo.module.scss'

export function PoolInfo({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={classNames(styles.container, className)}>
      <span className={styles.title}>Instruction</span>
      {children}
    </div>
  )
}
