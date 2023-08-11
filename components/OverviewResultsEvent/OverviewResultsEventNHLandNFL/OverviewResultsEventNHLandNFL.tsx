import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'

import type {
  Event,
  EventScope,
  ScopesCodes,
  Participant,
  PlayoffResultsEvent,
} from '@/api'
import { MonthLeftArrow } from '@/assets/icons'
import { generateParticipantImagePath } from '@/config/constants'
import { usePool } from '@/helpers'

import styles from './OverviewResultsEventNHLandNFL.module.scss'

export function OverviewResultsEventNHLandNFL({
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
  const {
    query: { poolId },
  } = useRouter()

  useEffect(() => {
    const totalIndex = tournamentResultsScopes?.indexOf('fe')

    if (totalIndex !== -1 && totalIndex !== undefined) {
      tournamentResultsScopes &&
        (tournamentResultsScopes.splice(totalIndex, 1),
        tournamentResultsScopes.push('fe'),
        setFilterdScopes(tournamentResultsScopes))
    }
  }, [tournamentResultsScopes])

  const { poolData } = usePool(Number(poolId))

  const isNHL = poolData?.pool_type?.link.includes('nhl')
  const isNFL = poolData?.pool_type?.link.includes('nfl')

  const date = new Date(event.start_date)

  function getTime() {
    const isPM = date.getHours() >= 12
    const isMidday = date.getHours() == 12
    const hours = date.getUTCHours() - (isPM && !isMidday ? 12 : 0)
    const minutes = date.getUTCMinutes()
    const time =
      [
        `${hours < 10 ? `0${hours}` : hours}`,
        `${minutes < 10 ? `0${minutes}` : minutes}`,
      ].join(':') + (isPM ? ' pm' : ' am')
    return time
  }

  return (
    <div
      className={classNames(styles.resultWrapper, {
        [styles.isLast]: index + 1 == length,
      })}
    >
      {isNHL && (
        <>
          <div className={styles.timeWrapper}>
            <div className={styles.time}>{getTime()}</div>
          </div>
          <div className={styles.separator} />
        </>
      )}
      <div
        className={classNames(styles.resultData, {
          [styles.nfl]: isNFL,
        })}
      >
        <div className={styles.matchResults}>
          <div>FINAL</div>

          <div
            className={classNames(styles.points, {
              [styles.nfl]: isNFL,
            })}
          >
            <ScopesTitles filterdScopes={filterdScopes} />
          </div>
        </div>
        {event.participants.map((participant, i) => {
          const totalScope = event.scopes?.find((scope) => scope.type === 'fe')

          const homeIsWin =
            totalScope !== undefined &&
            totalScope.score_home > totalScope.score_away

          const draw =
            totalScope !== undefined &&
            totalScope.score_home == totalScope.score_away

          const isWinner =
            (participant?.pivot?.type === 'home' && homeIsWin && !draw) ||
            (participant?.pivot?.type === 'away' && !homeIsWin && !draw)

          const fullName = [participant?.city, participant?.name]
            ?.join(' ')
            .trim()

          return (
            <div
              className={classNames(styles.teamResults, {
                [styles.winner]: totalScope !== undefined && isWinner,
              })}
              key={i}
            >
              <div className={styles.teamInfo}>
                <Image
                  src={generateParticipantImagePath(participant.external_id)}
                  width={60}
                  height={60}
                  alt={participant.short_name ?? fullName}
                />
                <div className={styles.teamName}>{fullName}</div>
              </div>
              <div
                className={classNames(styles.points, {
                  [styles.nfl]: isNFL,
                })}
              >
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

function ScopesTitles({ filterdScopes }: { filterdScopes: ScopesCodes[] }) {
  return (
    <>
      {filterdScopes.map((scope, i) => (
        <div className={styles.point} key={i}>
          {`${
            scope === '1p' || scope === '1q'
              ? '1'
              : scope === '2p' || scope === '2q'
              ? '2'
              : scope === '3p' || scope === '3q'
              ? '3'
              : scope === '4q'
              ? '4'
              : scope === 'fe'
              ? 'T'
              : ''
          }`}
          {scope === 'fe' && <MonthLeftArrow className={styles.arrow} />}
        </div>
      ))}
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
      <div className={styles.point}>
        {currentScope.type === '1p' ||
        currentScope.type === '2p' ||
        currentScope.type === '3p' ||
        currentScope.type === 'fe' ||
        currentScope.type === '1q' ||
        currentScope.type === '2q' ||
        currentScope.type === '3q' ||
        currentScope.type === '4q'
          ? participant?.pivot?.type == 'away'
            ? `${currentScope.score_away}`
            : `${currentScope.score_home}`
          : ''}
        {currentScope.type === 'fe' && (
          <MonthLeftArrow className={styles.arrow} />
        )}
      </div>
    </>
  )
}
