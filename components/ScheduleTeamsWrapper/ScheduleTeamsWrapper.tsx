import { Participant, PoolTypes } from '@/api/api-types'
import { ScheduleTeamItem } from '@/features/components'

import styles from './ScheduleTeamsWrapper.module.scss'

export function ScheduleTeamsWrapper({
  date,
  participants,
  poolType,
}: {
  date: string
  participants: Participant[][]
  poolType: PoolTypes | undefined
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <span>
          {new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span>{participants?.length} games</span>
      </div>
      <div className={styles.items}>
        {participants.map((item, i) => (
          <ScheduleTeamItem
            key={i}
            time={date}
            teams={item}
            poolType={poolType}
          />
        ))}
      </div>
    </div>
  )
}
