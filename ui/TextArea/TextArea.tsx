import classNames from 'classnames'
import { KeyboardEvent, useState } from 'react'
import { FieldError, RefCallBack } from 'react-hook-form'

import styles from './Textarea.module.scss'

export type TextAreaProps = {
  value: HTMLTextAreaElement['value']
  onChange: (value: TextAreaProps['value']) => void
  placeholder?: HTMLTextAreaElement['placeholder']
  textAlign?: 'left' | 'center' | 'right'
  autoComplete?: 'on' | 'off'
  withLabel?: boolean
  error?: FieldError['message']
  inputRef?: RefCallBack
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
  className?: string
  isDisabled?: boolean
  readOnly?: boolean
  large?: boolean
  onBlurEvent?: () => void
}

export function TextArea({
  value = '',
  onChange,
  placeholder = '',
  textAlign = 'left',
  autoComplete = 'on',
  withLabel = false,
  error,
  inputRef,
  onKeyDown,
  className = '',
  isDisabled = false,
  readOnly = false,
  large = false,
  onBlurEvent,
}: TextAreaProps) {
  const [isFocus, setIsFocus] = useState<boolean>(false)

  const isError = typeof error === 'string'
  const [showError, setShowError] = useState<boolean>(false)

  return (
    <div
      className={classNames(
        styles.inputWrapper,
        {
          [styles.focus]: isFocus,
          [styles.withLabel]: !!withLabel,
          [styles.valueNotEmpty]: !!value,
          [styles.inputError]: isError,
          [styles.disabled]: isDisabled,
        },
        className,
      )}
      onMouseOver={() => isError && setShowError(true)}
      onMouseOut={() => isError && setShowError(false)}
      onKeyDown={(e) => onKeyDown && onKeyDown(e)}
    >
      <div className={styles.inputWrapper2}>
        <textarea
          readOnly={readOnly}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={classNames(
            styles.input,
            { [styles.left]: textAlign === 'left' },
            { [styles.center]: textAlign === 'center' },
            { [styles.right]: textAlign === 'right' },
            { [styles.large]: large },
          )}
          autoComplete={autoComplete}
          onFocus={() => setIsFocus(true)}
          onBlur={() => {
            setIsFocus(false)
            onBlurEvent && onBlurEvent()
          }}
          ref={inputRef}
          placeholder={!withLabel ? placeholder : ''}
        />
        {!!withLabel && (
          <div
            className={classNames(styles.labelWrapper, {
              [styles.top]: isFocus || value,
            })}
          >
            <label>{placeholder}</label>
          </div>
        )}
      </div>

      <div
        className={classNames(styles.errorMessage, {
          [styles.errorVisible]: showError && isError && !!error.trim(),
        })}
      >
        {error}
      </div>
    </div>
  )
}
