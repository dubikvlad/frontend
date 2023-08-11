import classNames from 'classnames'
import { ReactNode, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { BottomArrow } from '@/assets/icons'

import styles from './Select2.module.scss'

export type Option = { title: string; name: string; isDisabled?: boolean }

type ReadOnlyOption = Readonly<Option>

type ReadonlyOptionsArray = Readonly<ReadOnlyOption[]>

export type SelectProps = {
  value: string
  onChange: (value: SelectProps['value']) => void
  options: Option[] | ReadonlyOptionsArray
  placeholder?: string
  customTitle?: (currentOption: Option) => ReactNode | string
  wrapperClassName?: string
  customOptionTitle?: (currentOption: Option) => ReactNode | string
  isTitleBold?: boolean
  disabled?: boolean
  fitContent?: boolean
}

export function Select2({
  // значение, которое отправляется на сервер
  value = '',
  // функция, которая отвечает за изменение переменной value
  onChange,
  // опции для перебора значений в селекте
  options = [],
  // текст, отображаемый при отсутствии значения в переменной value
  placeholder = 'Select',
  customTitle,
  wrapperClassName = '',
  isTitleBold,
  customOptionTitle,
  disabled,
  fitContent = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const isValueExists = !!String(value).trim()

  const currentOption = options.find(
    (item) => String(item.name) === String(value),
  )
  const title = currentOption ? currentOption.title : ''

  return (
    <div className={classNames({ [styles.fitContent]: fitContent })}>
      <OutsideClickHandler
        display="contents"
        onOutsideClick={() => setIsOpen(false)}
      >
        <div
          className={classNames(styles.selectWrapper, {
            [styles.dropdownOpen]: isOpen,
            [styles.bold]: isTitleBold,
            [styles.disabled]: disabled,
            [wrapperClassName]: !!wrapperClassName,
          })}
        >
          <div
            className={styles.value}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {customTitle ? (
              <div
                className={classNames({ [styles.placeholder]: !isValueExists })}
              >
                {isValueExists && currentOption
                  ? customTitle(currentOption)
                  : placeholder}
              </div>
            ) : (
              <p
                className={classNames({ [styles.placeholder]: !isValueExists })}
              >
                <span>
                  {isValueExists && currentOption ? title : placeholder}
                </span>
              </p>
            )}
            <BottomArrow />
          </div>

          <div className={styles.dropdown}>
            <ul>
              {options.map((item, i) => (
                <li
                  key={i}
                  onClick={() => {
                    onChange(String(item.name))
                    setIsOpen(false)
                  }}
                  className={classNames({
                    [styles.activeItem]: String(item.name) === String(value),
                    [styles.disabled]: item.isDisabled,
                  })}
                >
                  {customOptionTitle ? customOptionTitle(item) : item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </OutsideClickHandler>
    </div>
  )
}
