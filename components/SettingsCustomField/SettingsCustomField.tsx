import classNames from 'classnames'
import { Fragment, useEffect, useState } from 'react'
import {
  Control,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormUnregister,
} from 'react-hook-form'

import type { SettingsFieldCustomField } from '@/api'
import { divideArray } from '@/config/constants'
import {
  HorizontalFilterByWeek4,
  InfoContainer,
  ListTypeOption,
} from '@/features/components'
import { RHFInput } from '@/features/ui'

import { CheckboxOption } from './CheckboxOption/CheckboxOption'
import styles from './SettingsCustomField.module.scss'

export function SettingsCustomField({
  control,
  data,
  active,
  infoContent,
  onBlurEvent,
  register,
  setValue,
  unregister,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  data: SettingsFieldCustomField
  active: boolean
  infoContent?: string[]
  onBlurEvent?: () => void
  register?: UseFormRegister<FieldValues>
  setValue?: UseFormSetValue<FieldValues>
  unregister?: UseFormUnregister<FieldValues>
}) {
  const [singeActiveValue, setSingeActiveValue] = useState(
    data.field.value ? Number(data.field.value) : 1,
  )

  // сброс данных в форме
  useEffect(() => {
    if (!active && unregister && data.field.type === 'input_bonus_group') {
      unregister('bonus_points')
    }
  }, [active, unregister, data])

  switch (data.field.type) {
    case 'text': {
      return (
        <div
          className={classNames(styles.wrapper, {
            [styles.withInfo]: infoContent,
          })}
        >
          <RHFInput
            control={control}
            name={data.name}
            readOnly={!active}
            isDisabled={!active}
            placeholder={data.title}
            withLabel
            defaultValue={data?.field.value}
            required={data?.field.required}
            onBlurEvent={onBlurEvent}
          />
          <div className={styles.infoWrapper}>
            {infoContent && (
              <InfoContainer>
                {infoContent.map((content, i) => (
                  <p key={i}>{content} </p>
                ))}
              </InfoContainer>
            )}
          </div>
        </div>
      )
    }

    case 'slider': {
      data?.name &&
        data.field.value &&
        register &&
        register(data.name, { value: Number(data.field.value) })

      const currentIndexValue = data.field.options?.findIndex(
        (element) => Number(element?.name) === Number(data?.field?.value),
      )

      if (!active) return null

      return (
        <div className={styles.sliderWrapper}>
          <div className={classNames(styles.sliderTitleWrapper, {})}>
            <p className={styles.sliderTitle}>{data.title}</p>
          </div>
          <div className={styles.sliderSelector}>
            {!!setValue && (
              <HorizontalFilterByWeek4
                weeks={data?.field.options ? data.field.options : []}
                setValue={setValue}
                name={data.name}
                startIndex={currentIndexValue}
              />
            )}
          </div>
        </div>
      )
    }

    case 'list_buttons': {
      if (!active) return null

      return (
        <div className={styles.sliderWrapper}>
          <div className={styles.titleWrapper}>
            <p className={styles.sliderTitle}>{data.title}</p>
          </div>
          <div className={styles.listOptions}>
            {data.field.options?.map(({ name, title }, i) => {
              return (
                <Fragment key={i}>
                  {register && setValue && (
                    <>
                      <ListTypeOption
                        title={title}
                        register={register}
                        isDisabled={false}
                        setting={data}
                        values={Number(data.field.value)}
                        name={name}
                        setValue={setValue}
                        singeActiveValue={singeActiveValue}
                        setSingeActiveValue={setSingeActiveValue}
                      />
                    </>
                  )}
                </Fragment>
              )
            })}
          </div>
        </div>
      )
    }

    case 'checkbox': {
      return (
        <div className={styles.listOptions}>
          {register && (
            <CheckboxOption
              title={data.title}
              register={register}
              currentValue={Boolean(data.field.value)}
              name={data.name}
              data={data}
            />
          )}
        </div>
      )
    }

    case 'input_bonus_group': {
      const dividedArr = data.field.group && divideArray(data.field.group, 2)

      return (
        <>
          {active && (
            <div>
              <div className={styles.group}>
                {dividedArr?.map((group, i) => {
                  return (
                    <div key={i} className={styles.groupColWrapper}>
                      <div className={styles.groupColTitle}>
                        <p>Finishing Position</p>
                        <p>Bonus Points</p>
                      </div>
                      <div className={styles.groupCol}>
                        {group.map((groupItem, j) => {
                          return (
                            <div key={j} className={styles.groupItem}>
                              <p>{groupItem.title}</p>
                              <RHFInput
                                control={control}
                                name={groupItem.name}
                                validationType="number"
                                defaultValue={groupItem.field.value ?? 0}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )
    }

    default: {
      const isNumber = data.field.type === 'number'
      return (
        <RHFInput
          control={control}
          name={data.name}
          readOnly={!active}
          isDisabled={!active}
          placeholder={data.title}
          withLabel
          defaultValue={data?.field.value}
          required={data?.field.required}
          onBlurEvent={onBlurEvent}
          type={isNumber ? 'number' : undefined}
        />
      )
    }
  }
}
