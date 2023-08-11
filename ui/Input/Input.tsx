import classNames from 'classnames'
import Image from 'next/image'
import { KeyboardEvent, memo, RefObject, useEffect, useState } from 'react'
import { FieldError, RefCallBack } from 'react-hook-form'

import { OpenEye, ClosedEye, ErrorSign, Search, Info } from '@/assets/icons'
import { getImageByCardName } from '@/config/constants'
import { passwordCheck } from '@/helpers'

import styles from './Input.module.scss'

export type InputProps = {
  value: HTMLInputElement['value']
  onChange: (value: InputProps['value']) => void
  type?:
    | 'text'
    | 'number'
    | 'password'
    | 'confirm-password'
    | 'search'
    | 'card-number'
    | 'expiration-date'
    | 'money'
    | 'email'
  placeholder?: HTMLInputElement['placeholder']
  validationType?: ValidationType
  textAlign?: 'left' | 'center' | 'right'
  autoComplete?: 'on' | 'off'
  withLabel?: boolean
  error?: FieldError['message']
  inputRef?: RefCallBack | RefObject<HTMLInputElement>
  passwordLength?: number
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
  className?: string
  inputWrapper2ClassName?: string
  inputClassName?: string
  isDisabled?: boolean
  small?: boolean
  readOnly?: boolean
  onBlurEvent?: () => void
  isErrorSign?: boolean
  showPasswordComplexity?: boolean
  onFocus?: () => void
  tooltipTitle?: string
  tooltipContent?: string | string[]
  isValueBold?: boolean
  name?: string
}

type ValidationType = 'text' | 'number' | 'withoutSpaces'

// * обработка введенного значения
function inputValidation(
  type: InputProps['type'],
  value: HTMLInputElement['value'],
  validationType: ValidationType = 'text',
) {
  if (value.trim() === '') return value.trim()

  if (type === 'number' || validationType === 'number') {
    return value.trim().replace(/\D/, '')
  }

  if (validationType === 'withoutSpaces') {
    return value.trim().replace(/\s/, '')
  }

  if (type === 'card-number') {
    return value
      .replace(/\D|\s/g, '')
      .split('', 16) // card number length
      .reduce((acc, item, i) => {
        if ((i + 1) % 4 === 0) return (acc += `${item} `)
        return (acc += item)
      }, '')
      .trim()
  }

  if (type === 'expiration-date') {
    return value
      .trim()
      .replace(/\D|\s/g, '')
      .split('', 4)
      .reduce((acc, item, i, arr) => {
        if (i === 1 && arr.length !== i + 1) return (acc += `${item}/`)
        return (acc += item)
      }, '')
  }

  if (type === 'money') {
    const processedValue = value
      .trim() // убрать пробелы по бокам
      .replace(/[^\d\.]/g, '') // удалить все нецифровые значения, кроме точки (.)
      .replace(/^0+/, '0') // заменить все найденные вначале нули на один ноль

    const matchedValue =
      processedValue.match(
        /^(0(?!\d)|0[1-9]\d*|[1-9]\d*)(\.)?(\d{1,2})?/g, // поиск совпадения в строке
      )?.[0] ?? ''

    return matchedValue
  }

  return value.replace(/\s+/g, ' ')
}

export default memo(function Input({
  type = 'text',
  value = '',
  onChange,
  placeholder = '',
  validationType = 'text',
  textAlign = 'left',
  autoComplete = 'on',
  withLabel = false,
  error,
  inputRef,
  passwordLength = 8,
  onKeyDown,
  className = '',
  inputClassName = '',
  inputWrapper2ClassName = '',
  isDisabled = false,
  small = false,
  readOnly = false,
  onBlurEvent,
  isErrorSign = true,
  showPasswordComplexity = true,
  onFocus,
  tooltipTitle,
  tooltipContent,
  isValueBold = false,
  name,
}: InputProps) {
  const [isFocus, setIsFocus] = useState<boolean>(false)

  const isError = typeof error === 'string'
  const [showError, setShowError] = useState<boolean>(false)

  // ? type = password
  // хранит в себе значение сложности пароля (макс. уровень сложности: 4)
  const [passwordComplexity, setPasswordComplexity] = useState<number>(0)

  // проверяет сложность пароля
  useEffect(() => {
    if (type === 'password') {
      if (value.length >= passwordLength) {
        setPasswordComplexity(passwordCheck(value))
      } else if (passwordComplexity !== 0) setPasswordComplexity(0)
    }
  }, [type, value, passwordLength, passwordComplexity])

  const [valueIsVisible, setValueIsVisible] = useState<boolean>(false)

  const Eye = valueIsVisible ? ClosedEye : OpenEye

  const cardImage =
    type === 'card-number' && !!value.length
      ? getImageByCardName(value[0])
      : undefined

  const isTooltip = !!tooltipTitle || !!tooltipContent

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
      <div
        className={classNames(styles.inputWrapper2, inputWrapper2ClassName, {
          [styles.small]: small,
          [styles.inputWrapper2Error]: isError,
        })}
      >
        {type === 'search' && <Search className={styles.searchIcon} />}
        {type === 'card-number' && !!cardImage && (
          <Image
            src={cardImage.src}
            width={cardImage.width}
            height={cardImage.height}
            alt="Card image"
            className={classNames(styles.cardImage, {
              [styles.americanExpress]: value[0] === '3',
              [styles.visa]: value[0] === '4',
              [styles.mastercard]: value[0] === '5',
            })}
          />
        )}
        <input
          name={name}
          readOnly={readOnly}
          type={
            type === 'password' || type === 'confirm-password'
              ? valueIsVisible
                ? 'text'
                : 'password'
              : type
          }
          value={value}
          onChange={(e) =>
            !isDisabled &&
            onChange(inputValidation(type, e.target.value, validationType))
          }
          className={classNames(styles.input, inputClassName, {
            [styles.left]: textAlign === 'left',
            [styles.center]: textAlign === 'center',
            [styles.right]: textAlign === 'right',
            [styles.password]:
              type === 'password' || type === 'confirm-password',
            [styles.small]: small,
            [styles.isErrorSign]: isErrorSign,
            [styles.inputIsTooltip]: isTooltip,
            [styles.valueBold]: isValueBold,
          })}
          autoComplete={autoComplete}
          onFocus={() => {
            !readOnly && setIsFocus(true)
            onFocus && onFocus()
          }}
          onBlur={() => {
            if (!readOnly) setIsFocus(false)
            onBlurEvent && onBlurEvent()
          }}
          ref={inputRef}
          placeholder={!withLabel ? placeholder : ''}
        />
        {!!withLabel && (
          <div
            className={classNames(styles.labelWrapper, {
              [styles.top]: isFocus || value,
              [styles.small]: small,
              [styles.hasTooltip]: isTooltip,
            })}
          >
            <label>{placeholder}</label>
            {type === 'password' &&
              showPasswordComplexity &&
              (isFocus || value) && (
                <div className={styles.passwordComplexity}>
                  {[...Array(4).keys()].map((i) => (
                    <div
                      key={i}
                      className={classNames({
                        [styles.passwordSuccess]: passwordComplexity >= i + 1,
                      })}
                    />
                  ))}
                </div>
              )}
          </div>
        )}
        {isTooltip && (
          <>
            <div className={styles.tooltipWrapper}>
              <Info />
            </div>

            <div className={styles.tooltip}>
              {!!tooltipTitle && (
                <p className={styles.tooltipTitle}>{tooltipTitle}</p>
              )}

              {!!tooltipContent &&
                (Array.isArray(tooltipContent) ? (
                  tooltipContent.map((content, i) => (
                    <div
                      key={i}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  ))
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: tooltipContent }} />
                ))}
            </div>
          </>
        )}
      </div>

      <div
        className={classNames(styles.errorMessage, {
          [styles.errorVisible]: showError && isError && !!error.trim(),
        })}
      >
        {error}
      </div>

      {(type === 'password' || type === 'confirm-password') && (
        <Eye
          className={styles.eye}
          onClick={() => !!value && setValueIsVisible(!valueIsVisible)}
        />
      )}

      {type !== 'password' &&
        type !== 'confirm-password' &&
        isError &&
        isErrorSign && <ErrorSign className={styles.errorSign} />}
    </div>
  )
})
