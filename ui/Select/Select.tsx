import classNames from 'classnames'
import { useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { BottomArrow, Info } from '@/assets/icons'

import styles from './Select.module.scss'

export type Option = {
  title: string
  name: string
  isDisabled?: boolean
}

export type SelectProps = {
  value: string
  onChange: (value: SelectProps['value']) => void
  options: Option[]
  placeholder?: string
  titleDisplayFormat?: (title: string) => string
  withLabel?: boolean
  onChangeEvent?: () => void
  wrapperClassName?: string
  isBold?: boolean
  disabled?: boolean
  tooltipTitle?: string
  tooltipContent?: string | string[]
}

export function Select({
  // значение, которое отправляется на сервер
  value = '',
  // функция, которая отвечает за изменение переменной value
  onChange,
  // опции для перебора значений в селекте
  options = [],
  // текст, отображаемый при отсутствии значения в переменной value
  placeholder = 'Select',
  // функция, которая приводит значение title к определенному
  // формату отображения
  titleDisplayFormat,
  // отображать ли плейсхолдер вверху селекта, после
  // выбора значения
  withLabel = false,
  onChangeEvent,
  wrapperClassName = '',
  isBold = false,
  disabled = false,
  tooltipTitle,
  tooltipContent,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const isValueExists = String(value).trim() !== ''

  function getTitle() {
    const title =
      options.find((item) => String(item.name) === String(value))?.title ?? ''

    if (titleDisplayFormat) return String(titleDisplayFormat(title))
    return title
  }

  const isTooltip = !!tooltipTitle || !!tooltipContent

  return (
    <OutsideClickHandler
      display="contents"
      onOutsideClick={() => setIsOpen(false)}
    >
      <div
        className={classNames(
          styles.selectWrapper,
          { [styles.withLabel]: !!withLabel },
          { [styles.dropdownOpen]: isOpen },
          { [wrapperClassName]: !!wrapperClassName },
          { [styles.disabled]: disabled },
        )}
      >
        <div
          className={classNames(styles.value, {
            [styles.valueWithTooltip]: !!isTooltip,
          })}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
        >
          <p className={classNames({ [styles.placeholder]: !isValueExists })}>
            <span className={styles.label}>{placeholder}</span>
            <span className={classNames({ [styles.boldTitle]: isBold })}>
              {isValueExists ? getTitle() : placeholder}
            </span>
          </p>
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
          <BottomArrow className={styles.bottomArrow} />
        </div>

        <div className={styles.dropdown}>
          <ul>
            {options.map((item, i) => (
              <li
                key={i}
                onClick={() => {
                  onChange(String(item.name))
                  setIsOpen(false)
                  onChangeEvent && onChangeEvent()
                }}
                className={classNames({
                  [styles.activeItem]: String(item.name) === String(value),
                  [styles.disabled]: item.isDisabled,
                })}
              >
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </OutsideClickHandler>
  )
}
