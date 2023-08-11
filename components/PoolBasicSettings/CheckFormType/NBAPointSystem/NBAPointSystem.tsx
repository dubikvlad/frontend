import { Control, FieldValues } from 'react-hook-form'

import { SettingsFieldCustomField } from '@/api'
import { RHFInput } from '@/features/ui'

import styles from './NBAPointSystem.module.scss'

type NBAPointSystemT = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<FieldValues, any>
  field?: SettingsFieldCustomField[]
}

const gamesArr = ['', '1 Game Off', '2 Game Off', '3 Game Off']

export function NBAPointSystem({ control, field }: NBAPointSystemT) {
  return (
    <div className={styles.table}>
      <div className={styles.tableCol}>
        <div className={styles.colTitle}></div>
        {gamesArr.map((item, i) => (
          <p className={styles.colItem} key={i}>
            {!!item ? item : 'Correct Length'}
          </p>
        ))}
      </div>
      <div className={styles.inputs}>
        {field &&
          field.map((customField, index) => {
            return (
              <div className={styles.tableCol} key={index}>
                <div className={styles.colTitle}>{customField.title}</div>
                {customField.field.value &&
                  Object.entries(customField.field.value).map((item, index) => {
                    const splittedTitle = customField.title.split(' ')
                    return (
                      <div key={index} className={styles.colItem}>
                        <RHFInput
                          control={control}
                          name={customField.name + `[${item[0]}]`}
                          required
                          defaultValue={item[1]}
                          withLabel
                          placeholder={
                            !!gamesArr[index]
                              ? `${
                                  splittedTitle[1]
                                    ? splittedTitle.splice(1).join(' ')
                                    : splittedTitle[0]
                                } ${gamesArr[index]}`
                              : customField.title
                          }
                        />
                      </div>
                    )
                  })}
              </div>
            )
          })}
      </div>
    </div>
  )
}
