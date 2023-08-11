import classNames from 'classnames'
import { useEffect, useState } from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { BottomArrow } from '@/assets/icons'
import { cpc1, cpc2, defaultEntryColor } from '@/config/constants'

import styles from './ColorPicker.module.scss'

type ColorPickerProps = {
  value: string
  onChange: (value: ColorPickerProps['value']) => void
  numberPrevColors?: number
  pickerTitle?: string
  isDisabled?: boolean
  isVisibleBorder?: boolean
}

export function ColorPicker({
  value = defaultEntryColor,
  onChange,
  numberPrevColors = 6,
  pickerTitle,
  isDisabled = false,
  isVisibleBorder = false,
}: ColorPickerProps) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)

  const [prevColors, setPrevColors] = useState<string[]>([])

  function handlingColor(newColor: string) {
    if (newColor === value) return

    if (!prevColors.includes(value)) {
      if (prevColors.length < numberPrevColors) {
        setPrevColors([value].concat(prevColors))
      } else {
        setPrevColors([value].concat(prevColors.slice(0, numberPrevColors - 1)))
      }
    }

    onChange(newColor)
  }

  // sets default color
  useEffect(() => {
    if ((!value || (typeof value === 'string' && !value.trim())) && onChange) {
      onChange(defaultEntryColor)
    }
  }, [value, onChange])

  const bgValue =
    !!value || (typeof value === 'string' && !!value.trim())
      ? value
      : defaultEntryColor

  return (
    <OutsideClickHandler
      display="contents"
      onOutsideClick={() => !isDisabled && setDropdownIsOpen(false)}
    >
      <div
        className={classNames(styles.colorPickerWrapper, {
          [styles.open]: dropdownIsOpen,
          [styles.noPrevColors]: !prevColors.length,
          [styles.disabled]: isDisabled,
          [styles.visibleBorder]: isVisibleBorder,
        })}
        onClick={() => setDropdownIsOpen((prev) => !prev)}
      >
        <div
          className={classNames(styles.value, {
            [styles.valueWithTitle]: !!pickerTitle?.trim(),
          })}
        >
          <div
            className={styles.selectedColor}
            style={{ backgroundColor: bgValue }}
          ></div>
          {!!pickerTitle?.trim() && <p>{pickerTitle}</p>}
          <BottomArrow />
        </div>

        <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
          <p className={styles.selectEntryColorText}>Select color</p>

          <div className={styles.pickerWrapper}>
            <div className={styles.pickerWrapperItem1}>
              {cpc1.map((backgroundColor, i) => (
                <div
                  key={i}
                  className={styles.item1}
                  style={{ backgroundColor }}
                  onClick={() => {
                    setDropdownIsOpen(false)
                    handlingColor(backgroundColor)
                  }}
                ></div>
              ))}
            </div>

            <div className={styles.pickerWrapperItem2}>
              {cpc2.map((backgroundColor, i) => (
                <div
                  key={i}
                  className={styles.item2}
                  style={{ backgroundColor }}
                  onClick={() => {
                    setDropdownIsOpen(false)
                    handlingColor(backgroundColor)
                  }}
                ></div>
              ))}
            </div>
          </div>

          <p className={styles.prevUsedColorsText}>Previously used colors</p>

          <div className={styles.prevUsedColors}>
            {prevColors.map((backgroundColor, i) => (
              <div
                key={i}
                style={{ backgroundColor }}
                className={styles.prevUsedColorsItem}
                onClick={() => {
                  setDropdownIsOpen(false)
                  handlingColor(backgroundColor)
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </OutsideClickHandler>
  )
}
