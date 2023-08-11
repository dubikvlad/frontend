import classNames from 'classnames'
import { useState, ReactNode } from 'react'

import styles from './Switcher.module.scss'

export type SwitcherProps = {
  value: HTMLInputElement['checked']
  onChange: (value: SwitcherProps['value']) => void
  children?: ReactNode
  error?: string
  onChangeEvent?: () => void
}

export function Switcher({
  value,
  onChange,
  error,
  children,
  onChangeEvent,
}: SwitcherProps) {
  const isError = typeof error === 'string'
  const [showError, setShowError] = useState<boolean>(false)

  return (
    <div className={styles.wrapper}>
      {children}
      <div
        className={styles.checkboxWrapper}
        onMouseOver={() => isError && setShowError(true)}
        onMouseOut={() => isError && setShowError(false)}
        onClick={() => {
          onChange(!value)
          onChangeEvent && onChangeEvent()
        }}
      >
        <div
          className={classNames(styles.checkbox, {
            [styles.checked]: value,
          })}
        />
        <div
          className={classNames(styles.errorMessage, {
            [styles.errorVisible]: showError && isError && !!error.trim(),
          })}
        >
          {error}
        </div>
      </div>
    </div>
  )
}
