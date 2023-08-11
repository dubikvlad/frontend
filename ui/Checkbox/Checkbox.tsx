import classNames from 'classnames'
import { ReactNode, useState } from 'react'

import { CheckMark } from '@/assets/icons'

import styles from './Checkbox.module.scss'

export type CheckboxProps = {
  value: HTMLInputElement['checked']
  onChange: (value: CheckboxProps['value']) => void
  children?: ReactNode
  error?: string
  className?: string
  onChangeCustom?: void
  disabled?: boolean
}

export function Checkbox({
  value = false,
  onChange,
  children,
  error,
  className = '',
  onChangeCustom,
  disabled = false,
}: CheckboxProps) {
  const isError = typeof error === 'string'
  const [showError, setShowError] = useState<boolean>(false)

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.checked]: value,
        [className]: !!className,
        [styles.disabled]: disabled,
      })}
      onClick={() => (onChangeCustom ? onChangeCustom : onChange(!value))}
      onMouseOver={() => isError && setShowError(true)}
      onMouseOut={() => isError && setShowError(false)}
    >
      <div
        className={classNames(styles.checkbox, {
          [styles.checkboxError]: isError,
          [styles.disabled]: disabled,
        })}
      >
        <CheckMark />

        <div
          className={classNames(styles.errorMessage, {
            [styles.errorVisible]: showError && isError && !!error.trim(),
          })}
        >
          {error}
        </div>
      </div>

      <p className={styles.signature}>{children}</p>
    </div>
  )
}
