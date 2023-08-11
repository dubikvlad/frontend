import classNames from 'classnames'
import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { api, Pool, PoolTypesObj, SetForecastsDataForecastItem } from '@/api'
import { handlingDeadline } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { MarginEventItem } from '@/features/components/MarginEventItem'
import { POOL_MODAL_TYPES } from '@/features/modals'
import { SelectWithSearch } from '@/features/ui'
import {
  useGetUser,
  useGetPoolEntries,
  useGetPoolEvents,
  useUsersForManagement,
  useMessage,
} from '@/helpers'

import styles from './MarginMakePickPage.module.scss'

type SelectedForecasts = Pick<
  SetForecastsDataForecastItem,
  'participant_id' | 'event_id'
>

export function MarginMakePickPage({ poolData }: { poolData: Pool<'margin'> }) {
  const {
    asPath,
    query: { entry_id, isMaintenance, user_id, week_number },
  } = useRouter()

  const { userData } = useGetUser()

  const { openModal } = useOpenModal()

  const isOwner = poolData.owner.id === userData?.id

  // переменная нужна для работы функционала
  // member pick maintenance
  const isEditMode =
    isMaintenance && userData
      ? Number(isMaintenance) === 1
        ? isOwner
        : false
      : false

  const currentWeek =
    isEditMode && week_number
      ? Number(week_number)
      : poolData.pick_pool.current_week

  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    if (isEditMode && user_id && userId === null) {
      setUserId(Number(user_id))
    } else if (!isEditMode && userId === null && userData) {
      setUserId(userData.id)
    }
  }, [userData, userId, user_id, isEditMode])

  const { poolEntriesData, poolEntriesMutate } = useGetPoolEntries<
    PoolTypesObj['margin']
  >({
    poolId: poolData.id,
    userId: userId ?? userData?.id,
  })

  const entriesOptions = poolEntriesData
    .filter((item) => (!isEditMode ? !item.is_closed : !!item))
    .map((item) => ({
      title: item.name,
      name: String(item.id),
    }))

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    !isNaN(Number(entry_id)) ? String(entry_id) : null,
  )

  useEffect(() => {
    if (!entriesOptions.find((item) => item.name === selectedEntryId)) {
      setSelectedEntryId(null)
    }
  }, [asPath, entriesOptions, selectedEntryId])

  useEffect(() => {
    setSelectedEntryId(null)
  }, [userId])

  useEffect(() => {
    if (
      poolEntriesData &&
      selectedEntryId === null &&
      !!entriesOptions.length
    ) {
      const findEntry = entry_id
        ? entriesOptions.find((item) => item.name === entry_id)
        : undefined
      setSelectedEntryId(findEntry ? findEntry.name : entriesOptions[0].name)
    }
  }, [entriesOptions, poolEntriesData, selectedEntryId, entry_id])

  const selectedEntry = poolEntriesData.find(
    (item) => item.id === Number(selectedEntryId),
  )

  const { poolEventsEvents, poolEventsDeadline } = useGetPoolEvents({
    poolId: poolData.id,
    weekNumber: currentWeek,
  })

  const eventsArr = Object.values(poolEventsEvents ?? {}).reduce(
    (acc, item) => (acc = [...acc, ...item]),
    [],
  )

  const [deadlineTime, setDeadlineTime] = useState<string | null>(null)

  useEffect(() => {
    setDeadlineTime(handlingDeadline(poolEventsDeadline))

    const timer = setInterval(
      () => setDeadlineTime(handlingDeadline(poolEventsDeadline)),
      60000, // 1 minute
    )

    return () => clearInterval(timer)
  }, [poolEventsDeadline])

  const [active, setActive] = useState<number[]>([])

  const [selectedForecasts, setSelectedForecasts] = useState<
    SelectedForecasts[]
  >([])

  useEffect(() => {
    if (!!selectedEntry) {
      const currentForecasts = selectedEntry.margin_forecasts.filter(
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
    if (error && alertRef.current) {
      const coords = alertRef.current.getBoundingClientRect()
      window.scrollTo({
        left: 0,
        top: coords.top + window.scrollY - coords.height - 20,
      })
    }
  }, [error, alertRef])

  const isDoublePick = poolData.pick_pool.double_picks.includes(
    String(currentWeek),
  )

  async function sendForecasts() {
    if (!selectedEntryId || !eventsArr.length) return

    try {
      setSendForecastsIsLoading(true)

      const res = await (isEditMode
        ? api.forecasts.putForecasts
        : api.forecasts.setForecasts)(poolData.id, Number(selectedEntryId), {
        forecasts: selectedForecasts,
        week_number: currentWeek,
      })

      if (res.error) {
        if ('message' in res.error) {
          setError(res.error.message)
        }

        if ('messages' in res.error) {
          setError(res.error.getFirstMessage())
        }

        poolEntriesMutate()
        setSendForecastsIsLoading(false)
        return
      }

      await poolEntriesMutate()
      setSendForecastsIsLoading(false)
      openModal({ type: POOL_MODAL_TYPES.MAKE_A_PICK_SUCCESS })
    } catch (err) {
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
    <div className={styles.wrapper}>
      <h1>Make a margin pick</h1>

      <p className={styles.description}>
        Pick one team you think will win by clicking a team&apos;s box below.
        You can not pick the same team more than once during the season.
      </p>

      <div className={styles.filterAndDeadlineWrapper}>
        <div className={styles.filterWrapper}>
          {isOwner && userId && (
            <OwnerSelect
              poolId={poolData.id}
              userId={userId}
              setUserId={setUserId}
            />
          )}

          <SelectWithSearch
            value={selectedEntryId}
            onChange={setSelectedEntryId}
            options={entriesOptions}
            placeholder="Entry name"
            isDisabled={!entriesOptions.length}
          />
        </div>

        <div className={styles.deadlineWrapper}>
          <p className={styles.weekDeadlineText}>Week {currentWeek} deadline</p>
          <p className={styles.weekDeadlineValue}>
            {deadlineTime?.trim() ? deadlineTime : '-'}
          </p>
        </div>
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
        <>
          {' '}
          <div className={styles.eventsWrapper}>
            {!!selectedEntry &&
              eventsArr.map((item, i) => (
                <MarginEventItem
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
          {!!eventsArr.length && !isDeadline && (
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
      )}
    </div>
  )
}

type OwnerSelectProps = {
  poolId: number
  userId: number
  setUserId: Dispatch<SetStateAction<number | null>>
}

function OwnerSelect({ poolId, userId, setUserId }: OwnerSelectProps) {
  const { usersForManagementData } = useUsersForManagement(poolId)

  const membersOptions = useMemo(
    () =>
      usersForManagementData.map((item) => ({
        title: `${item.username}`,
        name: String(item.id),
      })),
    [usersForManagementData],
  )

  return (
    <div>
      <SelectWithSearch
        options={membersOptions}
        value={String(userId)}
        onChange={(value) => setUserId(Number(value))}
        placeholder="Member"
      />
    </div>
  )
}
