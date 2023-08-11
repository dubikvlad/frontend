import classNames from 'classnames'
import { memo, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { BottomArrow, CheckMark } from '@/assets/icons'

import styles from './SelectWithCheckboxes.module.scss'

export type Option = { title: string; name: string }

export type SelectProps = {
  value: string[]
  onChange: (value: SelectProps['value']) => void
  options: Option[]
  placeholder?: string
  className?: string
  dropdownClassName?: string
  disabled?: boolean
}

export default memo(function SelectWithCheckboxes({
  // значение, которое отправляется на сервер
  value = [],
  // функция, которая отвечает за изменение переменной value
  onChange,
  // опции для перебора значений в селекте
  options = [],
  // текст, отображаемый при отсутствии значения в переменной value
  placeholder = 'Select',
  className = '',
  dropdownClassName = '',
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const title = options
    .reduce<string[]>((acc, item) => {
      if (value.includes(item.name)) acc.push(item.title)
      return acc
    }, [])
    .join(', ')

  function handleValue(currentValue: string) {
    if (value.includes(currentValue)) {
      onChange(value.filter((item) => item !== currentValue))
      return
    }

    const valueCopy = [...value]
    valueCopy.push(currentValue)
    onChange(valueCopy)
    return
  }

  return (
    <div>
      <OutsideClickHandler
        display="contents"
        onOutsideClick={() => setIsOpen(false)}
      >
        <div
          className={classNames(styles.selectWrapper, className, {
            [styles.dropdownOpen]: isOpen,
            [styles.disabled]: disabled,
          })}
        >
          <div
            className={styles.value}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <p>
              <span className={styles.label}>{placeholder}</span>
              <span>{!!value.length ? title : placeholder}</span>
            </p>
            <BottomArrow />
          </div>

          <div className={classNames(styles.dropdown, dropdownClassName)}>
            <ul>
              {options.map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleValue(item.name)}
                  className={styles.item}
                >
                  <div
                    className={classNames(styles.checkbox, {
                      [styles.checkboxActive]: value.includes(item.name),
                    })}
                  >
                    <CheckMark className={styles.checkmark} />
                  </div>
                  <p>{item.title}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </OutsideClickHandler>
    </div>
  )
})
