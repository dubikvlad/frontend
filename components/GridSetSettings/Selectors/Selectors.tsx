import { useEffect, useState } from 'react'
import { FieldValues, UseFormSetValue } from 'react-hook-form'

import { CustomFieldField } from '@/api'
import { Select } from '@/features/ui'

import styles from './Selectors.module.scss'

export function Selectors({
  name,
  setValue,
  customField,
  numberOfSetsValue,
}: {
  name: string
  setValue: UseFormSetValue<FieldValues>
  customField: CustomFieldField
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  numberOfSetsValue: any
}) {
  const defaultSelectAxis = [
    { name: '1', title: '1' },
    { name: '2', title: '2' },
    { name: '3', title: '3' },
    { name: '4', title: '4' },
    { name: '5', title: '5' },
    { name: '6', title: '6' },
    { name: '7', title: '7' },
    { name: '8', title: '8' },
    { name: '9', title: '9' },
    { name: '0', title: '0' },
  ]

  const [axisValue, setAxisValue] = useState(
    customField.value ? String(customField.value) : '1,2,3,4,5,6,7,8,9,0',
  )

  useEffect(() => {
    setValue(name, axisValue)
  }, [axisValue, name, numberOfSetsValue, setValue])

  return (
    <div className={styles.selectors}>
      {[...Array(10).keys()].map((i) => (
        <div key={i}>
          <Select
            options={defaultSelectAxis}
            value={axisValue.split(',')[i] ?? defaultSelectAxis[i].name}
            onChange={(itemName) => {
              const valueCopy = changeSameItemToPrev({
                index: i,
                value: itemName,
                values: axisValue.split(','),
              })

              valueCopy[i] = itemName
              const valCopyString = valueCopy.join(',')

              setAxisValue(valCopyString)
            }}
          />
        </div>
      ))}
    </div>
  )
}

function changeSameItemToPrev({
  index,
  value,
  values,
}: {
  index: number
  value: string
  values: string[]
}) {
  const arrCopy = values
  const mutableValue = arrCopy[index]
  const indexVlaueToChange = arrCopy.indexOf(value)

  arrCopy[indexVlaueToChange] = mutableValue

  return arrCopy
}
