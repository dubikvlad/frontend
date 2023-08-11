import classNames from 'classnames'
import Image from 'next/image'

import { Events, Event } from '@/api'
import {
  generateParticipantImagePath,
  getHourAndMinute,
} from '@/config/constants'

import styles from './PoolStatsWeekGames.module.scss'

type PoolStatsWeekGamesProps = {
  selectedWeek: number
  currentWeek: number
  poolEvents: Event[][]
  tournamentScheduleEvents: Events | undefined | []
}

export default function PoolStatsWeekGames({
  selectedWeek,
  currentWeek,
  poolEvents,
  tournamentScheduleEvents,
}: PoolStatsWeekGamesProps) {
  const scheduleEvents = !!tournamentScheduleEvents
    ? Object.values(tournamentScheduleEvents)
    : []

  return (
    <div className={styles.weekGames}>
      <div className={styles.weekGamesInfo}>
        <p>Week {selectedWeek}</p>
        <p>
          {(selectedWeek <= currentWeek ? poolEvents : scheduleEvents).reduce(
            (acc, eventArr) => (acc += eventArr.length),
            0,
          )}{' '}
          games
        </p>
      </div>

      <div className={styles.games}>
        {selectedWeek <= currentWeek
          ? poolEvents.map((eventArr) =>
              eventArr.map((event) => {
                const team1 = event.participants[0]
                const team2 = event.participants[1]

                const team1FullName = [team1?.city, team1?.name]
                  ?.join(' ')
                  .trim()
                const team2FullName = [team2?.city, team2?.name]
                  ?.join(' ')
                  .trim()

                const result = event.scopes?.find(
                  (scope) => scope.type === 'fe',
                )

                if (!team1.pivot || !team2.pivot) return null

                const winner = result
                  ? result[`score_${team1.pivot.type}`] >
                    result[`score_${team2.pivot.type}`]
                    ? team1.id
                    : team2.id
                  : undefined

                return (
                  <div key={event.id} className={styles.game}>
                    <div
                      className={classNames(styles.team1, {
                        [styles.winner]: winner === team1.id || !result,
                      })}
                    >
                      <p>{team1FullName}</p>{' '}
                      <Image
                        src={generateParticipantImagePath(team1.external_id)}
                        width={40}
                        height={40}
                        alt={team1FullName}
                      />
                    </div>
                    {result ? (
                      <div className={styles.resultWrapper}>
                        <p className={styles.result}>
                          {result[`score_${team1.pivot.type}`]}:
                          {result[`score_${team2.pivot.type}`]}
                        </p>
                        <p className={styles.finalText}>Final</p>
                      </div>
                    ) : (
                      <p className={styles.separator}>@</p>
                    )}
                    <div
                      className={classNames(styles.team2, {
                        [styles.winner]: winner === team2.id || !result,
                      })}
                    >
                      <Image
                        src={generateParticipantImagePath(team2.external_id)}
                        width={40}
                        height={40}
                        alt={team2FullName}
                      />
                      <p>{team2FullName}</p>
                    </div>
                  </div>
                )
              }),
            )
          : scheduleEvents.map((scheduleEventArr) =>
              scheduleEventArr.map((item) => {
                const team1 = item.participants[0]
                const team2 = item.participants[1]

                const team1FullName = [team1?.city, team1?.name]
                  ?.join(' ')
                  .trim()
                const team2FullName = [team2?.city, team2?.name]
                  ?.join(' ')
                  .trim()

                const startDate = getHourAndMinute(item.start_date)

                return (
                  <div key={item.id} className={styles.game}>
                    <div
                      className={classNames(styles.team1, styles.teamShedule)}
                    >
                      <p>{team1FullName}</p>{' '}
                      <Image
                        src={generateParticipantImagePath(team1.external_id)}
                        width={40}
                        height={40}
                        alt={team1FullName}
                      />
                    </div>
                    <p className={styles.startDate}>{startDate}</p>
                    <div
                      className={classNames(styles.team2, styles.teamShedule)}
                    >
                      <Image
                        src={generateParticipantImagePath(team2.external_id)}
                        width={40}
                        height={40}
                        alt={team2FullName}
                      />
                      <p>{team2FullName}</p>
                    </div>
                  </div>
                )
              }),
            )}
      </div>
    </div>
  )
}
