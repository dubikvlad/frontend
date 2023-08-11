import classNames from 'classnames'
import { useEffect, useMemo, useState } from 'react'

import { Pool, PoolTypesObj, UserResponseData } from '@/api'
import { SmallRightArrow, SmallRound } from '@/assets/icons'
import { createEntry, handlingDeadline } from '@/config/constants'
import { SurvivorEventItem } from '@/features/components'
import { Select2 } from '@/features/ui'
import type { Option } from '@/features/ui/SelectWithSearch'
import { useGetPoolEntries, useGetPoolEvents } from '@/helpers'

import styles from './SurvivorManageEntriesMyPicks.module.scss'

export function SurvivorManageEntriesMyPicks({
  poolData,
  userData,
}: {
  poolData: Pool<'survivor'>
  userData: UserResponseData
}) {
  const isPoolNotStart =
    +poolData.pick_pool.start_week > poolData.pick_pool.current_week

  const currentWeek = poolData.pick_pool.current_week

  const weeks = poolData.available_week.slice(
    0,
    poolData.available_week.indexOf(poolData.pick_pool.current_week) + 1,
  )

  const [selectedWeek, setSelectedWeek] = useState('')

  const weekOptions: Option[] = weeks.map((week) => ({
    title: `Week ${week}`,
    name: String(week),
  }))

  useEffect(() => {
    if (selectedWeek === '' && weekOptions.length) {
      setSelectedWeek(weekOptions[weekOptions.length - 1].name)
    }
  }, [selectedWeek, weekOptions])

  const { poolEntriesData, poolEntriesMutate, poolEntriesIsLoading } =
    useGetPoolEntries<PoolTypesObj['survivor']>({
      poolId: isPoolNotStart ? undefined : poolData.id,
      userId: userData.id,
      weekNumber: selectedWeek !== '' ? Number(selectedWeek) : undefined,
    })

  const [selectedEntryId, setSelectedEntryId] = useState('')

  useEffect(() => {
    setSelectedEntryId('')
  }, [poolEntriesData])

  const entriesOptions = useMemo(
    () =>
      poolEntriesData.map((item) => ({
        title: item.name,
        name: String(item.id),
      })),
    [poolEntriesData],
  )

  useEffect(() => {
    if (selectedEntryId === '' && entriesOptions.length) {
      setSelectedEntryId(entriesOptions[0].name)
    }
  }, [selectedEntryId, entriesOptions])

  const selectedEntry = poolEntriesData.find(
    (item) => item.id === Number(selectedEntryId),
  )

  const selectedEntryWithFilteredForecasts = useMemo(() => {
    return selectedEntry && selectedWeek !== ''
      ? {
          ...selectedEntry,
          survivor_forecasts: selectedEntry.survivor_forecasts.filter(
            (item) => item.week_number <= Number(selectedWeek),
          ),
        }
      : undefined
  }, [selectedEntry, selectedWeek])

  const isDoublePick = poolData.pick_pool.double_picks.includes(
    String(poolData.pick_pool.current_week),
  )

  const { poolEventsDeadline: currentWeekPoolEventsDeadline } =
    useGetPoolEvents({
      poolId: isPoolNotStart ? undefined : poolData.id,
      weekNumber: currentWeek,
    })

  const { poolEventsEvents } = useGetPoolEvents({
    poolId: isPoolNotStart ? undefined : poolData.id,
    weekNumber: Number(selectedWeek),
  })

  const eventsArr = Object.values(poolEventsEvents ?? {}).reduce(
    (acc, item) => (acc = [...acc, ...item]),
    [],
  )

  const [active, setActive] = useState<number[]>([])

  useEffect(() => {
    if (!!selectedEntryWithFilteredForecasts && !!selectedWeek) {
      const currentForecasts =
        selectedEntryWithFilteredForecasts.survivor_forecasts.filter(
          (item) => item.week_number === Number(selectedWeek),
        )
      setActive(currentForecasts.map((item) => item.participant_id))
    }
  }, [selectedEntryWithFilteredForecasts, selectedWeek])

  const [deadlineTime, setDeadlineTime] = useState<string | null>(null)

  useEffect(() => {
    setDeadlineTime(handlingDeadline(currentWeekPoolEventsDeadline))

    const timer = setInterval(
      () => setDeadlineTime(handlingDeadline(currentWeekPoolEventsDeadline)),
      60000, // 1 minute
    )

    return () => clearInterval(timer)
  }, [currentWeekPoolEventsDeadline])

  const isDeadlinePassed = deadlineTime === 'PASSED'

  const { isAutoPick, isMulligan } = selectedEntryWithFilteredForecasts
    ? selectedEntryWithFilteredForecasts.survivor_forecasts.reduce(
        (acc, item) => {
          if (
            !!item.is_auto_pick &&
            item.week_number === Number(selectedWeek) &&
            !acc.isAutoPick
          ) {
            acc.isAutoPick = true
          }

          if (
            !!item.is_mulligan &&
            item.week_number === Number(selectedWeek) &&
            !acc.isMulligan
          ) {
            acc.isMulligan = true
          }

          return acc
        },
        { isAutoPick: false, isMulligan: false },
      )
    : { isAutoPick: false, isMulligan: false }

  const [createEntryIsLoading, setCreateEntryIsLoading] = useState(false)

  const survivorForecast =
    selectedEntryWithFilteredForecasts?.survivor_forecasts.find(
      (item) => item.week_number === Number(selectedWeek),
    )

  const isFirstWeekHasPassed =
    poolData.pick_pool.current_week > +poolData.pick_pool.start_week

  const createEntryFunction = () =>
    createEntry({
      poolData,
      userData,
      poolEntriesData,
      setCreateEntryIsLoading,
      mutateArray: [poolEntriesMutate],
      createEntryIsLoading,
    })

  const entriesLimit =
    poolData.tournament.name === 'NFL'
      ? poolData.allow_multiple_entries === 0
        ? 'unlimited'
        : poolData.allow_multiple_entries
      : poolData.allow_multiple_entries
      ? 1
      : 'unlimited'

  const isEntriesLimit =
    entriesLimit === 'unlimited' || poolEntriesData.length < entriesLimit

  return (
    <div className={styles.wrapper}>
      {isPoolNotStart ? (
        <p className={styles.poolNotStart}>
          The pool starts from <span>Week {poolData.pick_pool.start_week}</span>
          . The current <span>Week {poolData.pick_pool.current_week}</span>,
          wait for the pool to start and enjoy it
        </p>
      ) : entriesOptions.length ? (
        <>
          <div className={styles.filterWrapper}>
            <Select2
              options={weekOptions}
              value={selectedWeek}
              onChange={setSelectedWeek}
              placeholder="Week"
            />

            <Select2
              options={entriesOptions}
              value={selectedEntryId}
              onChange={setSelectedEntryId}
              placeholder="Entry"
            />

            <div className={styles.deadlineWrapper}>
              <p className={styles.deadlineText}>
                Week {currentWeek} deadline {isDeadlinePassed ? 'passed' : ''}
              </p>

              {!isDeadlinePassed && (
                <>
                  <p className={styles.deadlineTime}>{deadlineTime}</p>

                  <div className={styles.createNewEntryBtnWrapper}>
                    <button
                      className={classNames(
                        'button button-blue-light-outline',
                        {
                          disabled:
                            createEntryIsLoading ||
                            isEntriesLimit ||
                            isFirstWeekHasPassed,
                        },
                      )}
                      onClick={createEntryFunction}
                    >
                      Create a New Entry
                    </button>

                    {(isFirstWeekHasPassed || isEntriesLimit) && (
                      <div className={styles.tooltipWrapper}>
                        {isFirstWeekHasPassed ? (
                          <p className={styles.tooltipDeadlineText}>
                            You <span>cannot make new entries</span> after the
                            deadline arrives
                          </p>
                        ) : (
                          isEntriesLimit && (
                            <p className={styles.tooltipLimitText}>
                              The <span>limit of entries</span> for this pool{' '}
                              <span>is {entriesLimit}</span>. Unfortunately, you{' '}
                              <span>cannot make</span> new entries
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {selectedEntryWithFilteredForecasts?.is_closed && !survivorForecast && (
            <p className={styles.entryClosedText}>
              Sorry, but <span>{selectedEntry?.name}</span> has been eliminated,
              you cannot make a pick
            </p>
          )}

          <div
            className={classNames({
              [styles.entryClosed]:
                selectedEntryWithFilteredForecasts?.is_closed &&
                !survivorForecast,
            })}
          >
            <div className={styles.eventsWrapper}>
              {!!selectedEntryWithFilteredForecasts &&
                !!selectedWeek &&
                eventsArr.map((item, i) => (
                  <SurvivorEventItem
                    key={i}
                    item={item}
                    index={i}
                    active={active}
                    isDoublePick={isDoublePick}
                    entry={selectedEntryWithFilteredForecasts}
                    currentWeek={Number(selectedWeek)}
                    isHighlightInactive={false}
                  />
                ))}
            </div>

            {(isAutoPick || isMulligan) && (
              <ul className={styles.rulesWrapper}>
                {isMulligan && (
                  <li className={styles.mulligan}>
                    <SmallRound /> Picks with a black dot were issued a mulligan
                    to revive them after a loss.
                  </li>
                )}

                {isAutoPick && (
                  <li className={styles.autoPick}>
                    <SmallRightArrow /> This pick was automatically generated by
                    the system according to your pool settings.
                  </li>
                )}
              </ul>
            )}
          </div>
        </>
      ) : (
        !poolEntriesIsLoading && (
          <p className={styles.noEntriesText}>
            You don&apos;t seem to have any entries.
            {isFirstWeekHasPassed ? (
              ''
            ) : (
              <>
                {' '}
                Try to{' '}
                <span onClick={createEntryFunction}>Create a New Entry</span>
              </>
            )}
          </p>
        )
      )}
    </div>
  )
}
