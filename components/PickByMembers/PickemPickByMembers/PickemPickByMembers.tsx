import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { EntriesItem, WeekByWeekResponseData } from '@/api'
import { DownArrow } from '@/assets/icons'
import {
  generateParticipantImagePath,
  getShortName,
  routes,
} from '@/config/constants'
import { usePool, useWeekByWeekReport, useGetPoolEntries } from '@/helpers'

import styles from './PickemPickByMembers.module.scss'

const FilterByEntryAndMembersAndPastWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndPastWeeks'),
  { loading: () => <p>Loading...</p> },
)

export function PickemPickByMembers() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const { weekByWeekReportData, weekByWeekReportIsLoading } =
    useWeekByWeekReport({
      poolId:
        poolData &&
        poolData.pick_pool.current_week !==
          Number(poolData.pick_pool.start_week)
          ? Number(poolId)
          : undefined,
      params: {
        start_week_number: poolData
          ? Number(poolData.pick_pool.start_week)
          : undefined,
        end_week_number: poolData
          ? poolData.pick_pool.current_week - 1
          : undefined,
      },
    })

  const [selectedWeek, setSelectedWeek] = useState<string>('')

  const { poolEntriesData, poolEntriesIsLoading } = useGetPoolEntries({
    poolId: Number(poolId),
    weekNumber: selectedWeek !== null ? Number(selectedWeek) : undefined,
  })

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])

  if (!poolData) return null

  function filterData() {
    let data = poolEntriesData.filter(
      (entry) => !!entry.pickem_forecasts.length,
    )

    if (!!search.trim()) {
      data = data.filter((entry) =>
        entry.name.trim().toLowerCase().includes(search.trim().toLowerCase()),
      )
    }

    if (members.length) {
      data = data.filter((entry) => members.includes(String(entry.user_id)))
    }

    return data
  }

  const entriesData = filterData()

  return (
    <div>
      <FilterByEntryAndMembersAndPastWeeksLazy
        poolData={poolData}
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        week={selectedWeek}
        setWeek={setSelectedWeek}
        isDisabled={!weekByWeekReportData && !weekByWeekReportIsLoading}
      />

      {poolData.pick_pool.current_week >
      Number(poolData.pick_pool.start_week) ? (
        <div className={styles.entryList}>
          {entriesData.length
            ? entriesData.map((entry) => (
                <EntryItem
                  key={entry.id}
                  entry={entry}
                  selectedWeek={selectedWeek}
                  weekByWeekReportData={weekByWeekReportData}
                />
              ))
            : !poolEntriesIsLoading && (
                <div className={styles.statisticsAreNotReady}>
                  <p>
                    Sorry, we couldn’t find any relevant entries this week.
                    Please try another period
                  </p>
                </div>
              )}
        </div>
      ) : (
        <div className={styles.statisticsAreNotReady}>
          <p>
            The week is not over yet. Members&apos; picks will be available
            after all of the current week&apos;s games have been completed.
          </p>
          <p>
            Meanwhile, you can{' '}
            <Link href={routes.account.makePick.index(Number(poolId))}>
              make your Pick
            </Link>{' '}
            for the current week
          </p>
        </div>
      )}
    </div>
  )
}

function EntryItem({
  entry,
  selectedWeek,
  weekByWeekReportData,
}: {
  entry: EntriesItem
  selectedWeek: string
  weekByWeekReportData: WeekByWeekResponseData | null | undefined
}) {
  const [fullStatsIsOpen, setFullStatsIsOpen] = useState(false)

  const weekByWeekItem = weekByWeekReportData
    ? weekByWeekReportData.find((item) => item.name === entry.name)
    : undefined

  return (
    <div className={styles.entryItem}>
      <div className={styles.entryItemMainBlock}>
        <div>
          <p className={styles.headText}>Entry Name</p>
          <div className={styles.entryBlock}>
            <div className={styles.shortEntryName}>
              <p>{getShortName(entry.name)}</p>
            </div>
            <p>{entry.name}</p>
          </div>
        </div>
        <div>
          <p className={styles.headText}>Week {selectedWeek} Results</p>
          <div className={styles.pickemForecastsWrapper}>
            {entry.pickem_forecasts.map((forecast, i) => (
              <div
                key={i}
                className={classNames(styles.pickemForecastsItem, {
                  [styles.win]: forecast.status === 'win',
                  [styles.lost]: forecast.status === 'lost',
                })}
              >
                <Image
                  src={generateParticipantImagePath(
                    forecast.participant.external_id,
                  )}
                  width={30}
                  height={30}
                  alt={forecast.participant.name}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className={styles.headText}>W/L</p>
          <p className={styles.winAndLostInfo}>
            {entry.count_win}/{entry.count_lost}
          </p>
        </div>
      </div>

      {weekByWeekItem && (
        <div
          className={classNames(styles.fullStatsWrapper, {
            [styles.fullStatsWrapperOpen]: fullStatsIsOpen,
          })}
        >
          <div className={styles.fullStatsTable}>
            <div
              className={classNames(
                styles.fullStatsTableRow,
                styles.fullStatsTableHead,
              )}
            >
              <p></p>
              <p>Wins</p>
              <p>Losses</p>
              <p>Tbr</p>
              <p>Pts</p>
            </div>

            {Object.entries(weekByWeekItem.weeks).map(
              ([weekNumber, score], i) => (
                <div
                  key={i}
                  className={classNames(
                    styles.fullStatsTableRow,
                    styles.fullStatsTableBody,
                  )}
                >
                  <p>Week {weekNumber}</p>
                  <p className={styles.winsText}>{score.wins}</p>
                  <p className={styles.losesText}>{score.loses}</p>
                  <p className={styles.tiebreakerText}>
                    {score.tiebreaker ?? '-'}
                  </p>
                  <p className={styles.pointsText}>{score.points}</p>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {weekByWeekItem && (
        <p
          className={classNames(styles.statsText, {
            [styles.fullStatsIsOpen]: fullStatsIsOpen,
          })}
          onClick={() => setFullStatsIsOpen((prev) => !prev)}
        >
          {fullStatsIsOpen ? 'Hide' : 'Full Stats'} <DownArrow />
        </p>
      )}
    </div>
  )
}
