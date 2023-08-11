import classNames from 'classnames'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import { EventScope, PlayoffResultsEvent, ScopesCodes } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { generateParticipantImagePath } from '@/config/constants'

import styles from './SuperBowlEvent.module.scss'

type SuperBowlEventT = {
  event: PlayoffResultsEvent
  tournamentResultsScopes: ScopesCodes[]
}

export function SuperBowlEvent({
  event,
  tournamentResultsScopes,
}: SuperBowlEventT) {
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

  const homeTeam = event.participants.find(
    (part) => part.pivot?.type === 'home',
  )
  const awayTeam = event.participants.find(
    (part) => part.pivot?.type === 'away',
  )

  const totalScope = event.scopes?.find((scope) => scope.type === 'fe')
  const homeIsWin =
    totalScope !== undefined && totalScope.score_home > totalScope.score_away

  return (
    <div className={styles.wrapper}>
      <div className={styles.results}>
        <div
          className={classNames(styles.teamInfo, {
            [styles.winner]: homeIsWin,
          })}
        >
          <Image
            width={70}
            height={70}
            alt=""
            src={generateParticipantImagePath(homeTeam?.external_id ?? '')}
          />
          <p className={styles.teamName}>{homeTeam && homeTeam.name}</p>
        </div>
        <div
          className={classNames(styles.totalScore, styles.right, {
            [styles.winner]: homeIsWin,
          })}
        >
          {totalScope?.score_home}
          <MonthLeftArrow className={styles.arrow} />
        </div>
        <div className={styles.final}>final</div>
        <div
          className={classNames(styles.totalScore, {
            [styles.winner]: !homeIsWin,
          })}
        >
          <MonthRightArrow className={styles.arrow} />
          {totalScope?.score_away}
        </div>
        <div
          className={classNames(styles.teamInfo, {
            [styles.winner]: !homeIsWin,
          })}
        >
          <Image
            width={70}
            height={70}
            alt=""
            src={generateParticipantImagePath(awayTeam?.external_id ?? '')}
          />
          <p className={styles.teamName}>{awayTeam && awayTeam.name}</p>
        </div>
      </div>
      {filterdScopes.map((scopeName, i) => {
        const currentScope =
          event.scopes && event.scopes.find((scope) => scope.type === scopeName)
        if (scopeName == 'fe') return
        return (
          currentScope && (
            <Scope
              key={i}
              scope={scopeName}
              currentScope={currentScope}
              homeIsWin={homeIsWin}
            />
          )
        )
      })}
    </div>
  )
}

function Scope({
  scope,
  currentScope,
  homeIsWin,
}: {
  scope: ScopesCodes
  currentScope: EventScope
  homeIsWin: boolean
}) {
  return (
    <div className={styles.results}>
      <div></div>
      <div
        className={classNames(styles.score, styles.lefty, {
          [styles.winner]: homeIsWin,
        })}
      >
        {currentScope.score_home}
      </div>
      <div className={styles.quater}>{`${
        scope === '1q'
          ? 'Quarter 1'
          : scope === '2q'
          ? 'Quarter 2'
          : scope === '3q'
          ? 'Quarter 3'
          : scope === '4q'
          ? 'Quarter 4'
          : ''
      }`}</div>
      <div
        className={classNames(styles.score, styles.righty, {
          [styles.winner]: !homeIsWin,
        })}
      >
        {currentScope.score_away}
      </div>
      <div></div>
    </div>
  )
}
