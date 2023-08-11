import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Control, useForm, UseFormSetValue } from 'react-hook-form'

import { api, PoolCreateData, PoolTypeFormField, UserResponseData } from '@/api'
import { Lock, LockOpen } from '@/assets/icons'
import { errR, routes, writeErrorToState } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import {
  DateSwiper,
  FilterByWeekNumber,
  StartNewPoolDescription,
  StartNewPoolDescriptionBlock,
} from '@/features/components'
import { USER_MODAL_TYPES } from '@/features/modals'
import { InfoRow, RHFInput, RHFSelect } from '@/features/ui'
import {
  useAdaptiveBreakpoints,
  useAuth,
  useGetPoolType,
  useMessage,
} from '@/helpers'

import styles from './PoolCreatingPageStep2.module.scss'

type DefaultValues = Omit<PoolCreateData, 'pool_type_id' | 'type' | 'is_public'>

const defaultValues: DefaultValues = { name: '' }

export function PoolCreatingPageStep2() {
  const { isBreakpointPassed } = useAdaptiveBreakpoints(['lg', 'md', 'sm'])

  const isLgBreakpointPassed = isBreakpointPassed('lg')
  const isMdBreakpointPassed = isBreakpointPassed('md')
  const isSmBreakpointPassed = isBreakpointPassed('sm')

  const { userData, userMutate } = useAuth()

  const { openModal } = useOpenModal()
  const { query, push } = useRouter()
  const { poolTypeData } = useGetPoolType(Number(query.poolTypeId))

  const [poolIsPublic, setPoolIsPublic] = useState<boolean>(false)

  const { control, handleSubmit, setValue } = useForm<DefaultValues>({
    defaultValues,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useMessage()

  const [createAnAccountPoolName, setCreateAnAccountPoolName] = useState<
    null | string
  >(null)

  if (!poolTypeData) return null

  const resending = () =>
    userMutate().then((data) => {
      if (data?.data?.user)
        handleSubmit((formData) => sendData(formData, data?.data?.user))()
    })

  const sendData = async (
    data: DefaultValues,
    customUserData: UserResponseData | undefined,
  ) => {
    try {
      if (!customUserData) {
        setCreateAnAccountPoolName(data.name)
        openModal({
          type: USER_MODAL_TYPES.CREATE_AN_ACCOUNT,
          props: {
            functionAfterCreateAnAccount: resending,
            functionAfterSignIn: resending,
            poolName: createAnAccountPoolName,
          },
        })
        return
      }

      setIsLoading(true)

      const res = await api.pools.create({
        pool_type_id: poolTypeData.id,
        name: data.name,
        type: poolTypeData.type,
        start_week: data.start_week,
        collect_custom_field: data.collect_custom_field,
        prevent_new_entries: data.prevent_new_entries,
        pool_format: data.pool_format,
        pick_requirement: data.pick_requirement,
        point_spreads: data.point_spreads,
        target_score: data.target_score,
        closest_wins: data.closest_wins,
        different_assignment: data.different_assignment,
        max_mulligans: data.max_mulligans,
        pick_objective: data.pick_objective,
        default_credits: data.default_credits,
        points_awarded: data.points_awarded,
        pick_frequency: data.pick_frequency,
        players_picked_limit: data.players_picked_limit,
        picksheet_type: data.picksheet_type,
        begin_calculating: data.begin_calculating,
        is_public: poolIsPublic,
      })

      if (res.error) {
        writeErrorToState(res.error, setError)

        setIsLoading(false)
        return
      }

      setIsLoading(false)

      if (res.data) {
        push(
          `${routes.poolCreating.step3}?poolId=${res.data.id}&poolTypeId=${poolTypeData.id}`,
        )
      }
    } catch (err) {
      setIsLoading(false)
      writeErrorToState(err, setError)
    }
  }

  return (
    <div className={styles.wrapper}>
      <StartNewPoolDescription activeStep={2} />

      <div className={styles.poolCreatingWrapper}>
        <StartNewPoolDescriptionBlock
          title={poolTypeData.title}
          description={poolTypeData.description}
          tournamentExternalId={poolTypeData?.tournament?.external_id}
        />

        <div className={styles.poolSettingsWrapper}>
          <p className={styles.poolSettingsTitle}>Pool Settings</p>

          {isSmBreakpointPassed && (
            <p className={styles.specificSettingsText}>
              {/** todo: добавить модалку */}
              How to define Specific Settings
            </p>
          )}

          <div className={styles.poolSettings}>
            <div className={styles.poolSettingsItem1}>
              {!!error && (
                <div
                  className={classNames(
                    'alert alert-danger',
                    styles.alertDanger,
                  )}
                >
                  {error}
                </div>
              )}

              <form onSubmit={(e) => e.preventDefault()}>
                {poolTypeData.form.map((item, i) => (
                  <FormField
                    key={i}
                    item={item}
                    control={control}
                    setValue={setValue}
                    isLgBreakpointPassed={isLgBreakpointPassed}
                    isMdBreakpointPassed={isMdBreakpointPassed}
                    isSmBreakpointPassed={isSmBreakpointPassed}
                  />
                ))}

                <div className={styles.publicOrPrivateSwitch}>
                  <div
                    className={classNames({
                      [styles.active]: !poolIsPublic,
                    })}
                    onClick={() => setPoolIsPublic(false)}
                  >
                    <Lock />
                    <p>Private</p>
                  </div>
                  <div
                    className={classNames({
                      [styles.active]: poolIsPublic,
                    })}
                    onClick={() => setPoolIsPublic(true)}
                  >
                    <LockOpen />
                    <p>Public</p>
                  </div>
                </div>

                <div
                  className={classNames(
                    'alert alert-info',
                    styles.pricingAlert,
                  )}
                >
                  <p>
                    Upool isn’t a free service. Payment tier is available after
                    initial pick deadline
                  </p>
                  {/** todo: сделать ссылку на страницу pricing */}
                  <p className={styles.pricingText}>View Pricing</p>
                </div>

                <button
                  className={classNames(
                    'button',
                    'button-blue-light',
                    styles.continue,
                    { disabled: isLoading },
                  )}
                  onClick={() =>
                    handleSubmit((formData) => sendData(formData, userData))()
                  }
                >
                  Continue
                </button>
              </form>
            </div>

            {!isSmBreakpointPassed && (
              <div className={styles.poolSettingsItem2}>
                <p className={styles.howToDefineText}>
                  How to Define specific settings
                </p>

                <div className={styles.list}>
                  <p>Define specific settings related to your pool</p>
                  <ul>
                    <li>Enter pool name</li>
                    <li>
                      Select a pool format from those listed in the dropdown
                    </li>
                    <li>Set pool privacy</li>
                    <li>Select the starting week of the pool</li>
                  </ul>
                  <p>
                    Additional settings will be available once pool creation is
                    complete.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type FormFieldProps = {
  item: PoolTypeFormField
  control: Control<DefaultValues>
  setValue: UseFormSetValue<DefaultValues>
  isLgBreakpointPassed: boolean
  isMdBreakpointPassed: boolean
  isSmBreakpointPassed: boolean
}

function FormField({
  item,
  control,
  setValue,
  isLgBreakpointPassed,
  isMdBreakpointPassed,
  isSmBreakpointPassed,
}: FormFieldProps) {
  return (
    <>
      {item.field.type === 'text' ? (
        item.name ? (
          <RHFInput
            control={control}
            name={item.name}
            placeholder={item.title}
            required={item.field.required ? errR.required : undefined}
            withLabel
            tooltipTitle={item.tooltip?.title}
            tooltipContent={item.tooltip?.content}
          />
        ) : (
          <InfoRow
            toolTipContent={item.tooltip?.content}
            toolTipTitle={item.tooltip?.title}
            value={item.field.value}
            placeholder={item.title}
          />
        )
      ) : (
        <></>
      )}

      {item.field.type === 'number' && (
        <RHFInput
          type="number"
          control={control}
          name={item.name}
          placeholder={item.title}
          required={item.field.required ? errR.required : undefined}
          withLabel
          defaultValue={String(item.field.value)}
          tooltipTitle={item.tooltip?.title}
          tooltipContent={item.tooltip?.content}
        />
      )}

      {item.field.type === 'xrun_mlb_date' && (
        <DateSwiper
          startDate={item.field.firstDate}
          endDate={item.field.lastDate}
          value={item.field.value}
          setValue={setValue}
          name={item.name}
        />
      )}

      {item.field.type === 'select' &&
        (item.name === 'start_week' ? (
          <div className={styles.filterWrapper}>
            {isSmBreakpointPassed && (
              <p className={styles.poolStartWeekText}>Pool Start Week</p>
            )}

            <FilterByWeekNumber
              control={control}
              name={item.name}
              availableWeeks={item.field.options.map((item) =>
                Number(item.name),
              )}
              slidesInSlider={
                !isLgBreakpointPassed ? 7 : !isMdBreakpointPassed ? 6 : 5
              }
            />
          </div>
        ) : (
          <RHFSelect
            control={control}
            name={item.name}
            placeholder={item.title}
            required={item.field.required ? errR.required : undefined}
            options={item.field.options}
            defaultValue={item.field.options[0].name}
            withLabel
            tooltipTitle={item.tooltip?.title}
            tooltipContent={item.tooltip?.content}
          />
        ))}
    </>
  )
}
