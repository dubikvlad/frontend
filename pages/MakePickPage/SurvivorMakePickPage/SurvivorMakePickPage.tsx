import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import {
  api,
  Pool,
  PoolTypesObj,
  SetForecastsDataForecastItem,
  SurvivorEntriesItem,
} from '@/api'
import { scrollToElement, writeErrorToState } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { SurvivorEventItem, UserAndEntrySelects } from '@/features/components'
import { POOL_MODAL_TYPES } from '@/features/modals'
import { useGetPoolEntries, useGetPoolEvents, useMessage } from '@/helpers'

import styles from './SurvivorMakePickPage.module.scss'

type SelectedForecasts = Pick<
  SetForecastsDataForecastItem,
  'participant_id' | 'event_id'
>

export function SurvivorMakePickPage({
  poolData,
}: {
  poolData: Pool<'survivor'>
}) {
  const {
    asPath,
    query: { week_number },
  } = useRouter()

  const { openModal } = useOpenModal()

  const [isEditMode, setIsEditMode] = useState(false)

  const currentWeek =
    isEditMode && week_number ? +week_number : poolData.pick_pool.current_week

  const { poolEntriesData, poolEntriesMutate } = useGetPoolEntries<
    PoolTypesObj['survivor']
  >({
    poolId: poolData.id,
  })

  const entriesOptions = poolEntriesData
    .filter((item) => (!isEditMode ? !item.is_closed : !!item))
    .map((item) => ({
      title: item.name,
      name: String(item.id),
    }))

  const [selectedEntry, setSelectedEntry] =
    useState<SurvivorEntriesItem | null>(null)

  const { poolEventsEvents, poolEventsDeadline } = useGetPoolEvents({
    poolId: poolData.id,
    weekNumber: currentWeek,
  })

  const eventsArr = Object.values(poolEventsEvents ?? {}).reduce(
    (acc, item) => (acc = [...acc, ...item]),
    [],
  )

  const [active, setActive] = useState<number[]>([])

  const [selectedForecasts, setSelectedForecasts] = useState<
    SelectedForecasts[]
  >([])

  useEffect(() => {
    if (!!selectedEntry) {
      const currentForecasts = selectedEntry.survivor_forecasts.filter(
        (item) => item.week_number === currentWeek,
      )

      setActive(currentForecasts.map((item) => item.participant_id))

      setSelectedForecasts(
        currentForecasts.map((item) => ({
          event_id: item.event_id,
          participant_id: item.participant_id,
        })),
      )
    }
  }, [selectedEntry, currentWeek, asPath])

  const [sendForecastsIsLoading, setSendForecastsIsLoading] = useState(false)
  const [error, setError] = useMessage()

  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (error && alertRef.current) scrollToElement(alertRef)
  }, [error, alertRef])

  const isDoublePick = poolData.pick_pool.double_picks.includes(
    String(currentWeek),
  )

  async function sendForecasts() {
    if (!selectedEntry || !eventsArr.length || !currentWeek) return

    try {
      setSendForecastsIsLoading(true)

      const isPutMethod =
        !!selectedEntry.survivor_forecasts.filter(
          (forecast) => forecast.week_number === currentWeek,
        ).length || isEditMode

      const res = await (isPutMethod
        ? api.forecasts.putForecasts
        : api.forecasts.setForecasts)(poolData.id, selectedEntry.id, {
        forecasts: selectedForecasts,
        week_number: currentWeek,
      })

      if (res.error) {
        writeErrorToState(res.error, setError)

        setSendForecastsIsLoading(false)
        return
      }

      await poolEntriesMutate()

      setSendForecastsIsLoading(false)
      openModal({ type: POOL_MODAL_TYPES.MAKE_A_PICK_SUCCESS })
    } catch (err) {
      writeErrorToState(err, setError)
      setSendForecastsIsLoading(false)
    }
  }

  const serverDeadline = poolEventsDeadline
    ? Date.parse(poolEventsDeadline)
    : undefined

  const isDeadline = isEditMode
    ? false
    : serverDeadline
    ? Date.now() >= serverDeadline
    : true

  return (
    <div>
      <h1>Make a survivor pick</h1>

      <p className={styles.description}>
        Pick one team you think will win by clicking a team&apos;s box below.
        You can not pick the same team more than once during the season.
      </p>

      <div className={styles.filterAndDeadlineWrapper}>
        <UserAndEntrySelects
          entriesData={poolEntriesData}
          poolData={poolData}
          setSelectedEntry={setSelectedEntry}
          mutateEntries={poolEntriesMutate}
          pickDeadline={poolEventsDeadline}
          selectedWeek={currentWeek}
          setIsEditMode={setIsEditMode}
        />
      </div>

      {!!error && (
        <div
          ref={alertRef}
          className={classNames('alert alert-danger', styles.alertDanger)}
        >
          {error}
        </div>
      )}

      {!entriesOptions.length ? (
        <div className={styles.noEntriesWrapper}>
          Sorry, but <span>All entries</span> have been eliminated
        </div>
      ) : (
        !!selectedEntry && (
          <>
            <div className={styles.eventsWrapper}>
              {eventsArr.map((item, i) => (
                <SurvivorEventItem
                  key={i}
                  item={item}
                  index={i}
                  active={active}
                  setActive={setActive}
                  isDoublePick={isDoublePick}
                  entry={selectedEntry}
                  setSelectedForecasts={setSelectedForecasts}
                  currentWeek={currentWeek}
                  isEditMode={isEditMode}
                />
              ))}
            </div>

            {!!eventsArr.length && (
              <div
                className={classNames(styles.buttonWrapper, {
                  [styles.buttonWrapperDoublePick]: isDoublePick,
                })}
              >
                {isDoublePick && (
                  <p className={styles.selected}>
                    {selectedForecasts.length}/2 selected
                  </p>
                )}
                <button
                  className={classNames(
                    'button button-blue-light',
                    styles.submit,
                    {
                      disabled:
                        sendForecastsIsLoading ||
                        (isDoublePick
                          ? selectedForecasts.length !== 2
                          : !selectedForecasts.length) ||
                        isDeadline,
                    },
                  )}
                  onClick={sendForecasts}
                >
                  Submit
                </button>
              </div>
            )}
          </>
        )
      )}
    </div>
  )
}
