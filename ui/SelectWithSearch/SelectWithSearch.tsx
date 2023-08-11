import classNames from 'classnames'
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import OutsideClickHandler from 'react-outside-click-handler'

import { BottomArrow } from '@/assets/icons'

import styles from './SelectWithSearch.module.scss'

type Option = { title: string; name: string; isDisabled?: boolean }

type SelectWithSearchProps = {
  value: string | null
  onChange: (value: SelectWithSearchProps['value']) => void
  options: Option[]
  placeholder?: string
  isDisabled?: boolean
  customOptionTitle?: (currentOption: Option) => ReactNode | string
}

export type { Option, SelectWithSearchProps }

export function SelectWithSearch({
  value,
  onChange,
  options = [],
  placeholder = 'Select',
  isDisabled = false,
  customOptionTitle,
}: SelectWithSearchProps) {
  const selectedOption: Option | undefined = options.find(
    (item) => item.name === value,
  )

  const [dropdownIsOpen, setDropdownIsOpen] = useState<boolean>(false)

  const [inputValue, setInputValue] = useState<string>('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (dropdownIsOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }

    if (!dropdownIsOpen) setInputValue('')
  }, [dropdownIsOpen])

  const searchResult =
    inputValue.trim() !== ''
      ? options.filter((item) =>
          item.title
            .toLowerCase()
            .trim()
            .includes(inputValue.toLowerCase().trim()),
        )
      : []

  return (
    <OutsideClickHandler
      display="contents"
      onOutsideClick={() => setDropdownIsOpen(false)}
    >
      <div
        className={classNames(styles.selectWrapper, {
          [styles.open]: dropdownIsOpen,
          [styles.disabled]: isDisabled,
        })}
        onClick={() => setDropdownIsOpen((prev) => !prev)}
      >
        <div className={styles.value}>
          {dropdownIsOpen ? (
            <input
              ref={searchInputRef}
              className={styles.selectSearchInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p
              className={classNames({ [styles.placeholder]: !selectedOption })}
            >
              {selectedOption ? selectedOption.title : placeholder}
            </p>
          )}
        </div>

        <BottomArrow />

        <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
          <ul>
            {inputValue.trim() === '' ? (
              <Options
                options={options}
                onChange={onChange}
                setDropdownIsOpen={setDropdownIsOpen}
                customOptionTitle={customOptionTitle}
                selectedOption={selectedOption}
              />
            ) : searchResult.length ? (
              <Options
                options={searchResult}
                onChange={onChange}
                setDropdownIsOpen={setDropdownIsOpen}
                customOptionTitle={customOptionTitle}
                selectedOption={selectedOption}
              />
            ) : (
              <li className={styles.notFound}>Not found...</li>
            )}
          </ul>
        </div>
      </div>
    </OutsideClickHandler>
  )
}

type OptionsProps = {
  options: SelectWithSearchProps['options']
  onChange: SelectWithSearchProps['onChange']
  setDropdownIsOpen: Dispatch<SetStateAction<boolean>>
  customOptionTitle: SelectWithSearchProps['customOptionTitle']
  selectedOption: Option | undefined
}

function Options({
  options = [],
  onChange,
  setDropdownIsOpen,
  customOptionTitle,
  selectedOption,
}: OptionsProps) {
  return (
    <>
      {options.map((item, i) => (
        <li
          key={i}
          onClick={() => {
            if (!item?.isDisabled) {
              setDropdownIsOpen(false)
              onChange(item.name)
            }
          }}
          className={classNames({
            [styles.optionDisabled]: !!item?.isDisabled,
            [styles.optionActive]: selectedOption?.name === item.name,
          })}
        >
          {customOptionTitle ? customOptionTitle(item) : item.title}
        </li>
      ))}
    </>
  )
}
