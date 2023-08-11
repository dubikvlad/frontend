import classNames from 'classnames'
import { useState } from 'react'
import { FieldValues, UseFormRegister } from 'react-hook-form'

import { SettingsFieldCustomField } from '@/api'
import { Checkbox } from '@/features/ui'

import styles from './CheckboxOption.module.scss'

export function CheckboxOption({
  title,
  register,
  currentValue,
  name,
  data,
}: {
  title: string
  register: UseFormRegister<FieldValues>
  currentValue: boolean
  name: string
  data: SettingsFieldCustomField
}) {
  const [isActive, setIsActive] = useState(currentValue)

  function setActive() {
    setIsActive(!isActive)
  }

  return (
    <>
      <label
        htmlFor={String(name)}
        className={classNames(styles.listOption, {})}
        onClick={() => {
          setActive()
        }}
      >
        <Checkbox
          value={isActive}
          onChange={() => {
            setIsActive(!isActive)
          }}
        >
          <span className={classNames({ [styles.bold]: data.isMajor })}>
            {title}
          </span>
        </Checkbox>
      </label>

      <input
        className={styles.input}
        type="checkbox"
        {...register('tournaments[]')}
        value={name}
        defaultChecked={isActive}
        id={String(name)}
      />
    </>
  )
}
