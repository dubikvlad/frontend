import classNames from 'classnames'
import { memo } from 'react'

import { SortArrowBottom } from '@/assets/icons'

import styles from './Sorting.module.scss'

export type SortingProps = {
  active: 'top' | 'bottom' | null
  className?: string
}

export default memo(function Sorting({
  active = null,
  className = '',
}: SortingProps) {
  return (
    <div
      className={classNames(styles.sortingWrapper, {
        [className]: className.trim() !== '',
      })}
    >
      <SortArrowBottom
        className={classNames(styles.arrowTop, {
          [styles.active]: active === 'top',
        })}
      />
      <SortArrowBottom
        className={classNames({ [styles.active]: active === 'bottom' })}
      />
    </div>
  )
})
