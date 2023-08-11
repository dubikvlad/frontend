import classNames from 'classnames'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useState } from 'react'
import {
  useForm,
  Control,
  UseFormWatch,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormUnregister,
  UseFormHandleSubmit,
} from 'react-hook-form'
import { KeyedMutator } from 'swr'

import { api, CustomMulligansForecasts, ResponseData } from '@/api'
import type { PoolSettingsDataResponse, SettingsFields } from '@/api'
import { rf } from '@/config/constants'
import { RHFSwitcher } from '@/features/ui'
import { useGetPoolEntries, usePool } from '@/helpers'
import { useGetPoolSettings } from '@/helpers'

import { CheckFormType } from './CheckFormType'
import { EditBranding } from './EditBranding'
import styles from './PoolBasicSettings.module.scss'

type PoolBasicSettingsType = {
  data: PoolSettingsDataResponse
  activeTab: string
  setActiveTab: Dispatch<SetStateAction<string>>
  tabsData: string[]
}

type SortType = SettingsFields['field']['value']

let timeout: NodeJS.Timeout | null = null

export default function PoolBasicSettings({
  data,
  activeTab,
  setActiveTab,
  tabsData,
}: PoolBasicSettingsType) {
  const [errors, setErrors] = useState<string[] | null>(null)
  const [mulligansObj, setMulligansObj] =
    useState<CustomMulligansForecasts | null>(null)
  const [sort, setSort] = useState<SortType>(undefined)
  const [alertSuccessIsVisible, setAlertSuccessIsVisible] = useState(false)

  const {
    query: { poolId },
  } = useRouter()
  const { poolData, poolMutate } = usePool(Number(poolId))
  const { poolSettingsMutate } = useGetPoolSettings(Number(poolId))

  const {
    control,
    watch,
    getValues,
    register,
    setValue,
    handleSubmit,
    unregister,
  } = useForm()

  const { poolEntriesMutate } = useGetPoolEntries<'survivor'>({
    poolId: mulligansObj && Number(poolId),
  })

  if (data && !sort) {
    data['pick_settings']?.fields.map((item) => {
      if (item.name === 'default_sort') {
        setSort(item.field.value)
      }
    })
  }

  function timeoutFunc() {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => setAlertSuccessIsVisible(false), 5000)
  }

  async function sendData() {
    const formValues = getValues()

    const { data: resMulligansData } = mulligansObj
      ? await api.pools.saveMulligans(
          Number(poolId),
          Object.values(mulligansObj),
        )
      : { data: null }

    const { data: resData } = await api.pools.setPool(
      Number(poolId),
      formValues,
    )

    if (resData?.errors || resMulligansData?.errors) {
      const resDataErrors =
        !!resData?.errors &&
        Object.values(resData.errors).map((value) => value[0])
      const resMulligansDataErrors =
        !!resMulligansData?.errors &&
        Object.values(resMulligansData.errors).map((value) => value[0])

      if (resDataErrors && resMulligansDataErrors) {
        setErrors([...resDataErrors, ...resMulligansDataErrors])
      } else if (resDataErrors && !resMulligansDataErrors) {
        setErrors(resDataErrors)
      } else if (!resDataErrors && resMulligansDataErrors) {
        setErrors(resMulligansDataErrors)
      }
    } else {
      setErrors(null)
      poolSettingsMutate()

      mulligansObj && poolEntriesMutate()
      setActiveTab(tabsData[0])

      setAlertSuccessIsVisible(true)
      timeoutFunc()
    }
  }

  async function removeBranding() {
    const res = await api.pools.removeBrandPool(Number(poolId))

    if (!res.error) {
      poolMutate()
    }
  }

  const saveButtonAvailable = () =>
    activeTab ? activeTab.toLowerCase() !== 'questions' : true

  return (
    <div className={styles.wrapper}>
      {Object.values(data).map((settings, i) => {
        const mainCheckbox = settings.fields.find(
          (setting) => setting.field.type === 'main_checkbox',
        )

        const bottomField = settings.fields.find(
          (setting) => setting.field.type === 'bottom',
        )

        const branding = settings.fields.find(
          (setting) => setting.field.type === 'add_edit_branding',
        )

        return (
          <div
            className={classNames(styles.forms, {
              [styles.active]: settings.title === activeTab,
            })}
            key={i}
          >
            <div className={styles.header}>
              <div className={styles.bold}>Pool Id {poolData?.id}</div>
              <div className={styles.bold}>
                {!!poolData?.pick_pool.start_week &&
                  `Starting Week ${poolData?.pick_pool.start_week}`}
              </div>
              <div>
                {mainCheckbox && (
                  <RHFSwitcher
                    control={control}
                    name={String(mainCheckbox?.name)}
                    defaultValue={mainCheckbox?.field.value}
                  >
                    {mainCheckbox?.title}
                  </RHFSwitcher>
                )}
              </div>
            </div>
            {!!settings?.fields &&
              settings.fields.map((setting, i) => {
                return (
                  <FormComponent
                    key={i}
                    setting={setting}
                    control={control}
                    watch={watch}
                    register={register}
                    setValue={setValue}
                    setMulligansObj={setMulligansObj}
                    setSort={setSort}
                    sort={sort}
                    unregister={unregister}
                    updateSettings={poolSettingsMutate}
                    onSubmit={handleSubmit}
                    sendData={sendData}
                  />
                )
              })}

            {!!branding && (
              <div className={styles.bottom}>
                <EditBranding />
              </div>
            )}

            {!!bottomField && (
              <div className={styles.bottom}>
                {bottomField.field.custom_field?.map((setting, i) => {
                  return (
                    <FormComponent
                      key={i}
                      setting={setting}
                      control={control}
                      watch={watch}
                      register={register}
                      setValue={setValue}
                      updateSettings={poolSettingsMutate}
                      onSubmit={handleSubmit}
                      sendData={sendData}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {errors && (
        <div className={classNames('alert alert-danger', styles.alert)}>
          {errors.map((error, i) => {
            return (
              <p key={i} className="alert-title">
                {error}
              </p>
            )
          })}
        </div>
      )}

      {alertSuccessIsVisible && (
        <div
          className={classNames('alert alert-success', styles.alertSuccess, {
            [styles.alertSuccessVisible]: alertSuccessIsVisible,
          })}
        >
          <p className="alert-title">{rf.settingsHaveBeenSuccessfullySaved}</p>
        </div>
      )}

      <div className={styles.buttonsWrapper}>
        {activeTab === 'Display Settings' && (
          <button
            className={classNames('button button-red-outline', styles.button)}
            onClick={removeBranding}
          >
            remove branding
          </button>
        )}

        {saveButtonAvailable() && (
          <button
            className={classNames('button button-blue-light', styles.button)}
            onClick={handleSubmit(sendData)}
          >
            save changes
          </button>
        )}
      </div>
    </div>
  )
}

function FormComponent({
  setting,
  control,
  watch,
  register,
  setValue,
  setMulligansObj,
  setSort,
  sort,
  unregister,
  updateSettings,
  onSubmit,
  sendData,
}: {
  setting: SettingsFields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  watch: UseFormWatch<FieldValues>
  register: UseFormRegister<FieldValues>
  setValue: UseFormSetValue<FieldValues>
  sort?: SortType
  setSort?: Dispatch<
    SetStateAction<string | number | boolean | number[] | undefined>
  >
  setMulligansObj?: Dispatch<SetStateAction<CustomMulligansForecasts | null>>
  unregister?: UseFormUnregister<FieldValues>
  updateSettings: KeyedMutator<ResponseData<PoolSettingsDataResponse> | null>
  onSubmit: UseFormHandleSubmit<FieldValues>
  sendData: () => void
}) {
  const settingName = setting?.name

  // смотрим есть ли зависимые поля и получаем их значение,
  //  иначе значение текщего поля
  const watchField = setting?.field?.parent_name
    ? watch(setting?.field?.parent_name)
    : watch(String(settingName))

  const parentValue = setting?.field?.parent_value
  const parentValues = setting?.field?.parent_values

  const checkDisableField =
    setting.name !== 'use_bonus_points'
      ? (!!parentValues && !parentValues.includes(String(watchField))) ||
        (!!parentValue && watchField !== parentValue)
      : setting.name === 'use_bonus_points' &&
        sort !== setting.field.parent_value

  if (checkDisableField) return null

  switch (setting.field.type) {
    // типы которые обрабатываются отдельно
    case 'main_checkbox':
    case 'add_edit_branding':
    case 'bottom': {
      return null
    }
  }

  return (
    <>
      <div
        className={classNames(
          styles.formWrapper,
          {
            [styles.half]:
              (setting.field.type === 'text' && setting.name) ||
              setting.field.type === 'number' ||
              setting.field.type === 'select',
          },
          {
            [styles.none]:
              setting.field.type === 'main_checkbox' ||
              setting.field.type === 'add_edit_branding',
          },
          {
            [styles.quarter]:
              setting.field.type === 'number' &&
              (setting.name === 'max_wager_per_game' ||
                setting.name === 'min_wager_per_game'),
          },
        )}
      >
        <CheckFormType
          field={setting.field}
          watch={watch}
          setting={setting}
          control={control}
          register={register}
          setValue={setValue}
          setMulligansObj={setMulligansObj}
          setSort={setSort}
          unregister={unregister}
          updateSettings={updateSettings}
          onSubmit={onSubmit}
          sendData={sendData}
        />
      </div>
    </>
  )
}
