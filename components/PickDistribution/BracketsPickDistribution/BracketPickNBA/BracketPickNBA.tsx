import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { BracketRounds, BracketStage } from '@/api'
import {
  BracketArrowBottom,
  BracketArrowTop,
  BracketsFinalsTop,
  BracketsFinalsBottom,
} from '@/assets/icons'
import { useGetTournamentResultsByPool, useGetPickSummary } from '@/helpers'

import { SidebarInfo } from '../SidebarInfo'

import styles from './BracketsPickNBA.module.scss'
import { Game } from './Game'

export function BracketPickNBA() {
  const [roundsArray, setRoundsArray] = useState<BracketStage[][]>([])
  const [groupId, setGroupId] = useState(0)
  const [title, setTitle] = useState('')
  const {
    query: { poolId },
  } = useRouter()

  const { pickSummaryGroups } = useGetPickSummary(Number(poolId))

  const { tournamentResult: roundsData } = useGetTournamentResultsByPool(
    String(poolId),
  )

  useEffect(() => {
    function updateArray(rounds?: BracketRounds) {
      const newRounds: BracketStage[][] = []

      if (rounds) {
        Object.values(rounds)
          .sort((a: BracketStage[], b: BracketStage[]) => b.length - a.length)
          .forEach((stage: BracketStage[]) => {
            const buffArr = stage.reduce(
              (acc: BracketStage[], round, roundIndex) => {
                if (
                  roundIndex < stage.length / 2 &&
                  stage.length !== 2 &&
                  stage.length !== 1
                )
                  acc.push(round)
                return acc
              },
              [],
            )

            if (buffArr.length !== 0) newRounds.push(buffArr)
          })

        const centerdBuffer: BracketStage[] = []
        // формируем центральный массив
        ;(function () {
          Object.values(rounds).forEach((stage: BracketStage[]) => {
            const buffArr = stage.reduce(
              (acc: BracketStage[], round, roundIndex) => {
                if (roundIndex < stage.length / 2 && stage.length === 2)
                  acc.push(round)
                return acc
              },
              [],
            )

            if (buffArr.length !== 0) centerdBuffer.push(buffArr[0])
          })

          Object.values(rounds).forEach((stage: BracketStage[]) => {
            const buffArr = stage.reduce(
              (acc: BracketStage[], round, roundIndex) => {
                if (roundIndex <= stage.length / 2 && stage.length === 1)
                  acc.push(round)
                return acc
              },
              [],
            )

            if (buffArr.length !== 0) centerdBuffer.push(buffArr[0])
          })

          Object.values(rounds).forEach((stage: BracketStage[]) => {
            const buffArr = stage.reduce(
              (acc: BracketStage[], round, roundIndex) => {
                if (roundIndex >= stage.length / 2 && stage.length <= 2)
                  acc.push(round)
                return acc
              },
              [],
            )

            if (buffArr.length !== 0) centerdBuffer.push(buffArr[0])
          })
        })()

        if (centerdBuffer.length !== 0) newRounds.push(centerdBuffer)

        Object.values(rounds).forEach((stage: BracketStage[]) => {
          const buffArr = stage.reduce(
            (acc: BracketStage[], round, roundIndex) => {
              if (
                roundIndex >= stage.length / 2 &&
                stage.length !== 1 &&
                stage.length !== 2
              )
                acc.push(round)
              return acc
            },
            [],
          )

          if (buffArr.length !== 0) newRounds.push(buffArr)
        })

        setRoundsArray(newRounds)
      }
    }

    const rounds = roundsData

    updateArray(rounds)
  }, [roundsData])

  return (
    <div className={styles.wrapper}>
      <div className={styles.rounds}>
        {roundsArray.map((round, index) => {
          const top = index + 1 < roundsArray.length / 2
          const bottom = index > roundsArray.length / 2
          const centered = index + 1 === Math.round(roundsArray.length / 2)
          const started = index === 0 || index === roundsArray.length - 1

          return (
            <div
              key={index}
              className={classNames(styles.round, {
                [styles.start]: started,
                [styles.centered]: centered,
                [styles.top]: top,
                [styles.bottom]: bottom,
              })}
            >
              {round.map((game, gameIndex) => {
                const left = gameIndex + 1 < round.length / 2
                const right = gameIndex > round.length / 2
                const final = gameIndex + 1 === Math.round(round.length / 2)
                const isActive = pickSummaryGroups?.find(
                  (item) => item.id === game.stage_id,
                )
                  ? true
                  : false

                const style = game.color ? { background: game.color } : {}

                return (
                  <div
                    key={gameIndex}
                    className={classNames(styles.game, {
                      [styles.selected]: game.stage_id == groupId,
                      [styles.active]: isActive,
                      [styles.shadow]: groupId,

                      [styles.first]: top,
                      [styles.second]: bottom,
                      [styles.leftSemi]: centered && left,
                      [styles.rightSemi]: centered && right,
                      [styles.final]: centered && final,
                    })}
                    onClick={() =>
                      isActive &&
                      (setGroupId(game.stage_id), setTitle(game.title))
                    }
                  >
                    {Object.values(game.round_teams).map((team, key) => {
                      return <Game key={key} team={team} index={key} />
                    })}
                    <div className={classNames(styles.gameTitle)} style={style}>
                      {game.title}
                    </div>

                    <div className={styles.bottomLine} style={style}></div>

                    {!started && top && (
                      <BracketArrowTop className={styles.topArrow} />
                    )}

                    {!started && bottom && (
                      <BracketArrowBottom className={styles.bottomArrow} />
                    )}
                    {centered && final && (
                      <>
                        <BracketsFinalsTop className={styles.finalsTop} />
                        <BracketsFinalsBottom className={styles.finalsBottom} />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <SidebarInfo
        pickSummaryGroups={pickSummaryGroups}
        groupId={groupId}
        title={title}
      />
    </div>
  )
}
