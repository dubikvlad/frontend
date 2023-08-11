import classNames from 'classnames'
import Image from 'next/image'
import { Fragment, useEffect, useState } from 'react'

import type {
  Event,
  EventScope,
  Participant,
  PlayoffResultsEvent,
  ScopesCodes,
} from '@/api'
import { MonthLeftArrow } from '@/assets/icons'
import { generateParticipantImagePath } from '@/config/constants'

import styles from './OverviewResultsEventNBA.module.scss'

export function OverviewResultsEventNBA({
  event,
  length,
  index,
  tournamentResultsScopes,
}: {
  event: Event | PlayoffResultsEvent
  length: number
  index: number
  tournamentResultsScopes: ScopesCodes[] | null | undefined
}) {
  const [filterdScopes, setFilterdScopes] = useState<ScopesCodes[]>([])

  useEffect(() => {
    const totalIndex = tournamentResultsScopes?.indexOf('fe')

    if (totalIndex !== -1 && totalIndex !== undefined) {
      tournamentResultsScopes &&
        (tournamentResultsScopes.splice(totalIndex, 1),
        tournamentResultsScopes.push('fe'),
        setFilterdScopes(tournamentResultsScopes))
    }
  }, [tournamentResultsScopes])

  function returnTeamResult(
    participant: Participant,
    teamResults?: EventScope,
  ) {
    if (participant.pivot?.type === 'home') {
      return teamResults?.score_home
    } else return teamResults?.score_away
  }

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.isLast]: index + 1 == length,
      })}
    >
      <div className={styles.teams}>
        {event.participants.map((participant, i) => {
          const teamResults = event.scopes?.find((scope) => scope.type === 'fe')

          const isHomeWinner =
            teamResults && teamResults.score_away < teamResults.score_home

          const isDraw =
            teamResults && teamResults.score_away == teamResults.score_home

          const isHomeParticipant = participant.pivot?.type === 'home'

          const fullName = [participant?.city, participant?.name]
            ?.join(' ')
            .trim()

          return (
            <Fragment key={i}>
              <div
                className={classNames(styles.team, {
                  [styles.winner]:
                    (isHomeParticipant && isHomeWinner) ||
                    (!isHomeParticipant &&
                      !isHomeWinner &&
                      !isDraw &&
                      isHomeWinner !== undefined),
                })}
              >
                <div className={styles.teamResultWrapper}>
                  <Image
                    src={generateParticipantImagePath(participant.external_id)}
                    width={90}
                    height={90}
                    alt={participant.short_name ?? fullName}
                    className={styles.logo}
                  />
                  <div className={styles.teamResult}>
                    <span>{returnTeamResult(participant, teamResults)}</span>
                    <MonthLeftArrow className={classNames(styles.arrow)} />
                  </div>
                </div>
                <span className={styles.teamName}>{fullName}</span>
              </div>
              {i === 0 && <span className={styles.final}>final</span>}
            </Fragment>
          )
        })}
      </div>
      <div className={styles.separator} />
      <div className={styles.participants}>
        <div className={styles.participantsTitle}>
          <div className={styles.points}>
            <ScopesTitles filterdScopes={filterdScopes} />
          </div>
        </div>
        <div className={styles.results}>
          {event.participants.map((participant, i) => {
            const fullName = [participant?.city, participant?.name]
              ?.join(' ')
              .trim()

            return (
              <div className={styles.participant} key={i}>
                <span className={styles.teamName}>{fullName}</span>
                <div className={styles.points}>
                  <Scopes
                    scopes={event.scopes}
                    participant={participant}
                    filterdScopes={filterdScopes}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Scopes({
  scopes,
  participant,
  filterdScopes,
}: {
  scopes?: EventScope[]
  participant: Participant
  filterdScopes: ScopesCodes[]
}) {
  return (
    <>
      {filterdScopes.map((scopeName, i) => {
        const currentScope =
          scopes && scopes.find((scope) => scope.type === scopeName)
        return (
          <Fragment key={i}>
            {currentScope ? (
              <Scope currentScope={currentScope} participant={participant} />
            ) : (
              <div />
            )}
          </Fragment>
        )
      })}
    </>
  )
}

function Scope({
  currentScope,
  participant,
}: {
  currentScope: EventScope
  participant: Participant
}) {
  return (
    <>
      <div
        className={classNames(styles.point, {
          [styles.total]: currentScope.type === 'fe',
        })}
      >
        {currentScope.type === '1q' ||
        currentScope.type === '2q' ||
        currentScope.type === '3q' ||
        currentScope.type === '4q' ||
        currentScope.type === 'fe'
          ? participant?.pivot?.type == 'away'
            ? `${currentScope.score_away}`
            : `${currentScope.score_home}`
          : ''}
      </div>
    </>
  )
}

function ScopesTitles({ filterdScopes }: { filterdScopes: ScopesCodes[] }) {
  return (
    <>
      {filterdScopes.map((scope, i) => (
        <div className={styles.point} key={i}>
          {`${
            scope === '1q'
              ? '1'
              : scope === '2q'
              ? '2'
              : scope === '3q'
              ? '3'
              : scope === '4q'
              ? '4'
              : scope === 'fe'
              ? 'T'
              : ''
          }`}
        </div>
      ))}
    </>
  )
}
