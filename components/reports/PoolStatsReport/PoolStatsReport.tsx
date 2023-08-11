import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import {
  HorizontalFilterByWeek,
  PoolStatsWeekGames,
} from '@/features/components'
import {
  usePool,
  useLeaderboard,
  useGetPoolEntries,
  useGetPoolEvents,
  useGetTournamentSchedule,
} from '@/helpers'

import styles from './PoolStatsReport.module.scss'

const PoolStatsLeaderboardTableLazy = dynamic(
  () => import('@/features/components/PoolStatsLeaderboardTable'),
  { loading: () => <p>Loading...</p> },
)

export default function PoolStatsReport() {
  const {
    query: { poolId },
  } = useRouter()

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  const { poolData } = usePool(Number(poolId))

  const currentWeek = poolData?.pick_pool.current_week
  const availableWeeks = poolData?.available_week ?? []

  const { poolEntriesData, poolEntriesIsLoading, poolEntriesError } =
    useGetPoolEntries({
      poolId: Number(poolId),
      weekNumber: selectedWeek !== null ? selectedWeek : undefined,
    })

  const { poolEventsEvents, poolEventsIsLoading } = useGetPoolEvents({
    poolId: Number(poolId),
    weekNumber: selectedWeek,
    withScopes: true,
  })

  const events = !!poolEventsEvents ? Object.values(poolEventsEvents) : []

  const { tournamentScheduleEvents, tournamentScheduleIsLoading } =
    useGetTournamentSchedule(poolData?.tournament_id, selectedWeek)

  const { leaderboardData, leaderboardIsLoading } = useLeaderboard({
    poolId: Number(poolId),
    weekNumber: selectedWeek,
  })

  const leaderboardStatistic = leaderboardData?.statistic

  const error =
    !!poolEntriesError &&
    poolEntriesError instanceof Object &&
    'message' in poolEntriesError
      ? (poolEntriesError.message as string)
      : undefined

  return (
    <div className={styles.wrapper}>
      <div>
        {!!currentWeek && !!availableWeeks.length && (
          <HorizontalFilterByWeek
            availableWeeks={availableWeeks}
            currentWeek={currentWeek}
            setSelectedWeek={setSelectedWeek}
            slidesPerView={9}
            isLoading={poolEventsIsLoading || tournamentScheduleIsLoading}
          />
        )}
      </div>

      {!!error && (
        <div className="alert alert-danger">
          <p className="alert-title">{error}</p>
          <p>Please try again later</p>
        </div>
      )}

      <div className={styles.info}>
        {selectedWeek && currentWeek && (
          <>
            <PoolStatsLeaderboardTableLazy
              selectedWeek={selectedWeek}
              currentWeek={currentWeek}
              data={leaderboardStatistic}
              isLoading={leaderboardIsLoading}
              entriesData={poolEntriesData}
              poolId={Number(poolId)}
              entriesIsLoading={poolEntriesIsLoading}
            />

            <PoolStatsWeekGames
              selectedWeek={selectedWeek}
              currentWeek={currentWeek}
              poolEvents={events}
              tournamentScheduleEvents={tournamentScheduleEvents}
            />
          </>
        )}
      </div>
    </div>
  )
}
