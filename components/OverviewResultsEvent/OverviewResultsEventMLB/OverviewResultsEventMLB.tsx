import classNames from 'classnames'
import Image from 'next/image'

import type { Event, PlayoffResultsEvent } from '@/api'
import { generateParticipantImagePath } from '@/config/constants'

import styles from './OverviewResultsEventMLB.module.scss'

export function OverviewResultsEventMLB({
  event,
}: {
  event: Event | PlayoffResultsEvent
}) {
  const teamResults = event.scopes?.find((scope) => scope.type === 'fe')

  return (
    <div className={styles.wrapper}>
      {event.participants.map((participant, i) => {
        const isHomeWinner =
          teamResults && teamResults.score_away < teamResults.score_home

        const isDraw =
          teamResults && teamResults.score_away == teamResults.score_home

        const isHomeParticipant = participant.pivot?.type === 'home'

        const fullName = [participant?.city, participant?.name]
          ?.join(' ')
          .trim()

        return (
          <div
            key={i}
            className={classNames(styles.result, {
              [styles.winner]:
                (isHomeParticipant && isHomeWinner) ||
                (!isHomeParticipant &&
                  !isHomeWinner &&
                  !isDraw &&
                  isHomeWinner !== undefined),
            })}
          >
            <Image
              src={generateParticipantImagePath(participant.external_id)}
              width={60}
              height={60}
              alt={participant.short_name ?? fullName}
            />
            <span className={styles.teamName}>{fullName}</span>
            <span className={styles.total}>
              {participant.pivot?.type === 'home'
                ? teamResults?.score_home
                : teamResults?.score_away}
            </span>
          </div>
        )
      })}
    </div>
  )
}
