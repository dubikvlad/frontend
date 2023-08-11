import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'

import { SettingsFields } from '@/api'

import styles from './ListTypeOption.module.scss'

export function ListTypeOption({
  title,
  register,
  isDisabled,
  setting,
  values,
  name,
  isMultiple,
  setValue,
  singeActiveValue,
  setSingeActiveValue,
}: {
  title: string | number
  register: UseFormRegister<FieldValues>
  isDisabled: boolean | undefined
  setting: SettingsFields
  values: number[] | number
  name: string | number
  isMultiple?: true
  setValue: UseFormSetValue<FieldValues>
  singeActiveValue?: number
  setSingeActiveValue?: (value: number) => void
}) {
  const isArr = Array.isArray(values)

  const [isActive, setIsActive] = useState(
    isArr
      ? values.includes(Number(name))
      : values
      ? Number(values) === singeActiveValue
      : false,
  )

  useEffect(() => {
    if (singeActiveValue && !isMultiple) {
      setIsActive(Number(name) === Number(singeActiveValue))
    }
  }, [singeActiveValue])

  if (!isMultiple)
    register(String(setting.name), {
      value: !!setting.field.value ? setting.field.value : 1,
    })

  function setActive() {
    if (!isMultiple) {
      setValue(String(setting.name), name)
      setSingeActiveValue && setSingeActiveValue(Number(name))
    }
    if (isMultiple) {
      setIsActive(!isActive)
    }
  }

  return (
    <>
      <label
        htmlFor={String(name)}
        className={classNames(styles.listOption, {
          [styles.disbled]: isDisabled,
          [styles.active]: isActive,
        })}
        onClick={(e) => {
          isDisabled ? e.preventDefault : setActive()
        }}
      >
        {title}
      </label>
      {isMultiple ? (
        <input
          className={styles.input}
          type="checkbox"
          {...[register(String(setting.name))]}
          value={name}
          defaultChecked={isActive}
          id={String(name)}
        />
      ) : (
        <input
          className={styles.input}
          type="checkbox"
          defaultChecked={isActive}
          value={name}
        />
      )}
    </>
  )
}
