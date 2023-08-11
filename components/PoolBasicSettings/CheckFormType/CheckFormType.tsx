import classNames from 'classnames'
import { useRouter } from 'next/router'
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Control,
  UseFormWatch,
  FieldValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormUnregister,
  UseFormHandleSubmit,
} from 'react-hook-form'
import { KeyedMutator } from 'swr'

import type {
  SettingsFields,
  SettingsField,
  CustomMulligansForecasts,
  Pool,
  PoolResponse,
  ResponseData,
  Question,
  PoolSettingsDataResponse,
} from '@/api'
import { Lock, LockOpen } from '@/assets/icons'
import {
  InfoContainer,
  SettingsCustomField,
  HorizontalFilterByWeek4,
  DateSwiper,
  SettingsEditQuestions,
} from '@/features/components'
import { ListTypeOption, IssueMulligans } from '@/features/components'
import { RHFSwitcher, RHFInput, RHFTextArea, RHFSelect } from '@/features/ui'
import { Select2 } from '@/features/ui'
import { usePool } from '@/helpers'

import styles from './CheckFormType.module.scss'
import { NBAPointSystem } from './NBAPointSystem'

export function CheckFormType({
  field,
  watch,
  setting,
  control,
  register,
  setValue,
  setMulligansObj,
  setSort,
  unregister,
  updateSettings,
  onSubmit,
  sendData,
}: {
  field: SettingsField
  watch: UseFormWatch<FieldValues>
  setting: SettingsFields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<FieldValues, any>
  register: UseFormRegister<FieldValues>
  setValue: UseFormSetValue<FieldValues>
  setMulligansObj?: Dispatch<SetStateAction<CustomMulligansForecasts | null>>
  setSort?: Dispatch<
    SetStateAction<string | number | boolean | number[] | undefined>
  >
  unregister?: UseFormUnregister<FieldValues>
  updateSettings: KeyedMutator<ResponseData<PoolSettingsDataResponse> | null>
  onSubmit: UseFormHandleSubmit<FieldValues>
  sendData: () => void
}) {
  const [selectedTournaments, setSelectedTournaments] = useState<string[]>()

  const tournamentField = watch('tournaments[]')

  useEffect(() => {
    setSelectedTournaments(tournamentField)
  }, [tournamentField])

  const {
    query: { poolId },
  } = useRouter()
  const { poolData, poolMutate } = usePool(Number(poolId))

  const [currentWeek, setCurrentWeek] = useState(
    String(poolData?.pick_pool.current_week),
  )

  const weekOptions = useMemo(() => {
    const availableWeek = poolData?.available_week ?? []

    return [
      ...availableWeek.map((item) => ({
        title: `Week ${item}`,
        name: String(item),
      })),
    ]
  }, [poolData])

  const watchField = setting?.field?.parent_name
    ? watch(setting?.field?.parent_name)
    : watch(String(setting?.name))

  function returnTooltipContent() {
    return (
      !!setting.tooltip &&
      setting.tooltip.content.map((content, i) => <p key={i}>{content} </p>)
    )
  }

  switch (field.type) {
    case 'text':
    case 'number': {
      return (
        <div className={styles.inputWrapper}>
          {field?.read_only ? (
            !setting.name ? (
              <div>{field?.value}</div>
            ) : (
              <>
                <div className={styles.readOnlyWrapper}>
                  <input
                    readOnly
                    value={field?.value ? String(field.value) : ''}
                  />
                  <div className={styles.labelWrapper}>
                    <div className={styles.label}>{setting.title}</div>
                  </div>
                </div>
                {!!setting.tooltip && (
                  <div className={styles.infoWrapper}>
                    <InfoContainer>{returnTooltipContent()}</InfoContainer>
                  </div>
                )}
              </>
            )
          ) : (
            <>
              <RHFInput
                control={control}
                name={setting?.name ?? ''}
                placeholder={setting.title}
                withLabel
                isDisabled={field?.read_only}
                defaultValue={field?.value ?? ''}
                required={field?.required}
              />
              {!!setting.tooltip && (
                <div className={styles.infoWrapper}>
                  <InfoContainer>{returnTooltipContent()}</InfoContainer>
                </div>
              )}
            </>
          )}
        </div>
      )
    }
    case 'textarea': {
      return (
        <>
          <RHFTextArea
            control={control}
            name={setting?.name ? setting.name : ''}
            placeholder={setting.title}
            required={field?.required}
            withLabel
            large
            defaultValue={field?.value ? field.value : ''}
          />
        </>
      )
    }
    case 'select': {
      const options = field?.options
        ? field.options.map((option) => {
            return { name: String(option.name), title: String(option.title) }
          })
        : [
            {
              title: field?.value ? String(field.value) : 'no data',
              name: field?.value ? String(field.value) : 'no data',
            },
          ]

      const disabled = field?.disabled

      return (
        <>
          <RHFSelect
            control={control}
            name={setting?.name ? setting.name : ''}
            defaultValue={
              field?.value
                ? field.value
                : field?.options && String(field?.options[0].name)
            }
            options={options}
            withLabel
            placeholder={setting.title}
            required={field?.required}
            disabled={disabled}
            onChangeSetCurrentState={
              setting.name === 'default_sort' ? setSort : undefined
            }
          />
        </>
      )
    }
    case 'checkbox': {
      const isMulligans = setting.name == 'automatic_mulligans'
      const isBonusPoints = setting.name === 'use_bonus_points'

      return (
        <div
          className={classNames(styles.custom, {
            [styles.column]: isMulligans,
            [styles.grid]: isBonusPoints,
          })}
        >
          <div className={styles.switcherWrapper}>
            <div className={styles.swtcherContainerWrapper}>
              <div className={styles.switcherContainer}>
                <div className={styles.checkboxInfo}>
                  {setting.title}
                  {setting?.tooltip && (
                    <InfoContainer iconHeight={16}>
                      {returnTooltipContent()}
                    </InfoContainer>
                  )}
                </div>
                <RHFSwitcher
                  control={control}
                  name={String(setting.name)}
                  defaultValue={field?.value && field.value}
                />
              </div>
              {isBonusPoints && (
                <p className={styles.switcherSubtitle}>
                  Substract strokes for top finishing positions
                </p>
              )}
            </div>

            {isMulligans && !watchField && (
              <Select2
                value={currentWeek}
                onChange={setCurrentWeek}
                options={weekOptions}
              />
            )}
          </div>

          {isMulligans && !watchField && (
            <div>
              <div className={styles.mulligansRow}></div>
              <IssueMulligans
                currentWeek={currentWeek}
                setMulligansObj={setMulligansObj}
              />
            </div>
          )}

          {!!field?.custom_field &&
            field.custom_field.map((custom_item, i) => {
              return (
                <Fragment key={i}>
                  <SettingsCustomField
                    control={control}
                    data={custom_item}
                    active={watchField}
                    infoContent={setting.tooltip?.content}
                    setValue={setValue}
                    register={register}
                    unregister={unregister}
                  />
                </Fragment>
              )
            })}
        </div>
      )
    }

    case 'slider': {
      setting?.name &&
        setting.field.value &&
        register(setting.name, { value: Number(setting.field.value) })

      return (
        <div className={styles.sliderWrapper}>
          <div
            className={classNames(styles.sliderTitleWrapper, {
              [styles.disabled]: field?.disabled,
            })}
          >
            <div className={styles.sliderTitle}>{setting.title}</div>
            {setting?.tooltip && (
              <InfoContainer>{returnTooltipContent()}</InfoContainer>
            )}
          </div>
          <div className={styles.sliderSelector}>
            <HorizontalFilterByWeek4
              weeks={field?.options ? field.options : []}
              isDisabledSlider={field?.disabled}
              setValue={setValue}
              name={setting.name}
              startIndex={field?.options?.findIndex(
                (el) => el.name == field.value,
              )}
            />
            {field?.disabled && (
              <div className={styles.sliderComment}>{field.comment}</div>
            )}
          </div>
        </div>
      )
    }

    case 'public': {
      setting?.name && register(setting.name, { value: setting.field.value })

      return (
        <div className={styles.publicOrPrivateSwitch}>
          <div
            className={classNames({
              [styles.active]: !watchField,
            })}
            onClick={() => {
              setting.name && setValue(setting.name, false)
            }}
          >
            <Lock />
            <p>Private</p>
          </div>
          <div
            className={classNames({
              [styles.active]: watchField,
            })}
            onClick={() => {
              setting.name && setValue(setting.name, true)
            }}
          >
            <LockOpen />
            <p>Public</p>
          </div>
        </div>
      )
    }

    case 'list_buttons': {
      const values = Array.isArray(setting.field.value)
        ? setting.field.value
        : []

      setting?.name &&
        register(setting.name, {
          value: values,
        })

      return (
        <div className={styles.listButtonsWrapper}>
          {!!setting.name && (
            <>
              <div className={styles.listName}>
                <span>{setting.title}</span>
                {setting?.tooltip && !field.custom_field && (
                  <InfoContainer iconHeight={16}>
                    {returnTooltipContent()}
                  </InfoContainer>
                )}
              </div>
              <div className={styles.listOptions}>
                {field.options?.map(({ name, title }, i) => {
                  const isDisabled =
                    (field.disabled_weeks &&
                      field.disabled_weeks.includes(Number(name))) ||
                    Number(name) <= Number(poolData?.pick_pool.current_week)

                  return (
                    <Fragment key={i}>
                      <ListTypeOption
                        title={title}
                        register={register}
                        isDisabled={isDisabled}
                        setting={setting}
                        values={values}
                        name={name}
                        isMultiple={field.is_multiple}
                        setValue={setValue}
                      />
                    </Fragment>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )
    }

    case 'input_table_group': {
      return (
        <div>
          <div className={styles.inputGruopTitle}>
            <p className={styles.containerTitle}>{setting.title}</p>
            {setting.field.comment && (
              <InfoContainer>{setting.field.comment}</InfoContainer>
            )}
          </div>
          <NBAPointSystem
            control={control}
            field={setting.field.custom_field}
          />
        </div>
      )
    }

    case 'input_group': {
      const customField = setting.field?.custom_field

      return (
        <div>
          <div className={styles.inputGruopTitle}>
            <p className={styles.containerTitle}>{setting.title}</p>
            {setting.field.comment && (
              <InfoContainer>{setting.field.comment}</InfoContainer>
            )}
          </div>
          <div className={styles.inputGroup}>
            {!!customField &&
              customField.map((custom_item, i) => (
                <Fragment key={i}>
                  <SettingsCustomField
                    control={control}
                    data={custom_item}
                    active={watchField}
                    infoContent={setting.tooltip?.content}
                    setValue={setValue}
                    register={register}
                  />
                </Fragment>
              ))}
          </div>
        </div>
      )
    }

    case 'date':
      if (field.firstDate && field.lastDate && setting.name && field.value) {
        return (
          <div>
            <DateSwiper
              endDate={field.lastDate}
              startDate={field.firstDate}
              name={setting.name}
              value={field.value as string}
              setValue={setValue}
            />
          </div>
        )
      }
      return <></>

    case 'datetime-local':
      if (setting.name && field.value) {
        return (
          <div className={styles.datetimeLocal}>
            <div>{setting.title}</div>

            <DateSwiper
              name={setting.name}
              value={field.value as string}
              setValue={setValue}
            />
          </div>
        )
      }
      return <></>

    case 'questions':
      return (
        <SettingsEditQuestions
          poolData={poolData as unknown as Pool<'qa'>}
          poolMutate={
            poolMutate as unknown as KeyedMutator<ResponseData<
              PoolResponse<'qa'>
            > | null>
          }
          questions={field.value as unknown as Question[]}
          isCustom={field.isCustom}
          updateSettings={updateSettings}
          setValue={setValue}
          onSubmit={onSubmit}
          sendData={sendData}
        />
      )

    case 'tournament_group':
      const customField = setting.field?.custom_field

      let chunks = [customField]

      if (customField && customField.length > 20) {
        const chunk_length = customField.length / 3
        chunks = Array.from({ length: Math.ceil(3) }, (v, i) =>
          customField.slice(i * chunk_length, i * chunk_length + chunk_length),
        )
      }

      return (
        <div>
          <p className={styles.containerTitle}>
            Select Your Tournaments{' '}
            {!!selectedTournaments &&
              customField?.length &&
              `(${selectedTournaments.length}/${customField.length})`}
          </p>
          <div className={styles.checkboxesWrapper}>
            {!!customField &&
              chunks.map((chunk, i) => (
                <div key={i} className={styles.checkboxes}>
                  {chunk?.map((custom_item, i) => (
                    <Fragment key={i}>
                      <SettingsCustomField
                        control={control}
                        data={custom_item}
                        active={watchField}
                        register={register}
                      />
                    </Fragment>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )

    default:
      return <div>block</div>
  }
}
