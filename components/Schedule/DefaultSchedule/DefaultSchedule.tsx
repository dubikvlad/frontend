import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import {
  HorizontalFilterByWeek2,
  ScheduleTeamsWrapper,
} from '@/features/components'
import { usePool } from '@/helpers'
import { useGetTournamentSchedule } from '@/helpers/hooks/useGetTournamentSchedule'

import styles from './DefaultSchedule.module.scss'

export function DefaultSchedule() {
  const { query } = useRouter()
  const { poolData } = usePool(Number(query.poolId))

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)

  useEffect(() => {
    if (selectedWeek === null && !!poolData)
      setSelectedWeek(poolData.pick_pool.current_week)
  }, [poolData, selectedWeek])

  const { tournamentScheduleEvents, tournamentScheduleIsLoading } =
    useGetTournamentSchedule(poolData?.tournament_id, selectedWeek)

  return (
    <div className={styles.schedule}>
      <HorizontalFilterByWeek2 setSelectedWeek={setSelectedWeek} />

      <div className={styles.teamList}>
        {!!tournamentScheduleEvents &&
        !tournamentScheduleIsLoading &&
        !Array.isArray(tournamentScheduleEvents) ? (
          Object.entries(tournamentScheduleEvents)?.map(
            ([title, events], index) => (
              <ScheduleTeamsWrapper
                key={index}
                date={title}
                participants={events?.map((event) => event?.participants)}
                poolType={poolData?.type}
              />
            ),
          )
        ) : (
          <p className={styles.noData}>
            No schedule <span>for your sport</span> at this moment
          </p>
        )}
      </div>
    </div>
  )
}
