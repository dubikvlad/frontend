/* eslint-disable @typescript-eslint/no-non-null-assertion */
import classNames from 'classnames'
import Image from 'next/image'
import React, { Fragment, useEffect, useMemo, useState } from 'react'

import type { BracketPlayoffEntryItem, Pool } from '@/api'
import {
  BracketForecasts,
  BracketForecastsAccType,
  BracketRounds,
  BracketStage,
  BracketTeam,
  StageKeys,
} from '@/api'
import {
  BracketPicksFinalTwoLine,
  BracketPicksSemiTwoTopLine,
  BracketPicksSemiTwoBottomLine,
  BracketPicksQuarterLine,
} from '@/assets/icons'
import {
  generateParticipantImagePath,
  initialRoundsObj,
  initialRoundsObjType,
  stageRounds,
} from '@/config/constants'
import { useEventsForBracket } from '@/helpers'

import styles from './BracketNFLPickByMembersTree.module.scss'

export default function BracketNFLPickByMembersTree({
  poolData,
  currentEntry,
}: {
  poolData: Pool<'bracket'>
  currentEntry: BracketPlayoffEntryItem
}) {
  const { bracketEvents: events } = useEventsForBracket({
    poolId: poolData.id.toString(),
    userId: currentEntry?.user_id.toString(),
  })

  const roundsData = useMemo(() => events?.rounds, [events])

  const [rounds, setRounds] = useState<BracketRounds>(
    initialRoundsObj as initialRoundsObjType<BracketStage>,
  )

  const [tiebreakerScore, setTiebreakerScore] = useState<string>('0')
  const isTieBreaker: number | undefined = poolData?.pick_pool?.tiebreaker

  useEffect(() => {
    if (isTieBreaker) {
      const tieBreaker = currentEntry?.playoff_tiebreaker
      if (tieBreaker) setTiebreakerScore(String(tieBreaker.score))
    }
  }, [isTieBreaker, currentEntry])

  useEffect(() => {
    const copyObjRounds: BracketRounds = roundsData
      ? JSON.parse(JSON.stringify(roundsData))
      : { ...initialRoundsObj }

    const brackets: BracketForecastsAccType[] = currentEntry?.bracket_forecasts
      .length
      ? currentEntry.bracket_forecasts.reduce(
          (acc: BracketForecastsAccType[], forecast: BracketForecasts) => {
            acc.push({
              forecastId: forecast.pool_type_bracket_id,
              participant: forecast.participant,
              numberOfGames: forecast.number_of_games,
            })

            return acc
          },
          [],
        )
      : []

    const teamsWithSeed: { id: number; seed: number }[] = []

    if (copyObjRounds && poolData?.tournament.name === 'NFL') {
      Object.values(copyObjRounds).forEach((stage: BracketStage[]) => {
        stage.forEach((match: BracketStage) => {
          Object.values(match.round_teams).forEach((team) => {
            if (
              team?.seed &&
              teamsWithSeed.findIndex(
                (teamWithSeed) => teamWithSeed.id === team.id,
              ) === -1
            ) {
              teamsWithSeed.push({
                id: team.id,
                seed: team.seed,
              })
            }
          })
        })
      })

      Object.values(copyObjRounds).forEach((stage: BracketStage[]) => {
        stage.forEach((match: BracketStage) => {
          Object.values(match.round_teams).forEach((team) => {
            if (
              team?.seed &&
              teamsWithSeed.findIndex(
                (teamWithSeed) => teamWithSeed.id === team.id,
              ) === -1
            ) {
              teamsWithSeed.push({
                id: team.id,
                seed: team.seed,
              })
            }
          })
        })
      })
    }

    if (copyObjRounds) {
      Object.values(copyObjRounds).forEach(
        (stage: BracketStage[], stageIndex: number) => {
          stage.forEach((match: BracketStage) => {
            Object.keys(match.round_teams).forEach((team) => {
              brackets.forEach((bracket: BracketForecastsAccType) => {
                if (bracket.forecastId == +team) {
                  match.round_teams[+team] = bracket.participant
                  if (teamsWithSeed.length) {
                    match.round_teams[+team]!.seed = teamsWithSeed.find(
                      (teamWithSeed) =>
                        teamWithSeed.id === bracket.participant.id,
                    )?.seed
                  }
                }
              })
            })

            Object.entries(match.round_teams).forEach(
              (team: [string, BracketTeam | null]) => {
                const isTeamPicked = copyObjRounds[
                  Object.keys(copyObjRounds)[stageIndex - 1] as StageKeys
                ]?.some((event) =>
                  Object.values(event.round_teams)?.some(
                    (participant) => participant?.id === team[1]?.id,
                  ),
                )

                brackets.forEach((bracket) => {
                  if (
                    (bracket.forecastId === match.stage_id &&
                      bracket.participant.id === team[1]?.id) ||
                    isTeamPicked
                  ) {
                    const key = +team[0]

                    match.round_teams[key]!.isPicked = true
                  }
                })
              },
            )
          })
        },
      )
    }

    setRounds(copyObjRounds)
  }, [roundsData, currentEntry, poolData?.tournament.name])

  return (
    <div className={styles.wrapper}>
      {rounds && (
        <div className={styles.container}>
          {Object.values(rounds)
            .sort((a: BracketStage[], b: BracketStage[]) => b.length - a.length)
            .map((stage: BracketStage[], stageIndex: number) => (
              <div
                key={stageIndex}
                className={classNames(styles.row, {
                  [styles.stage2]:
                    stage[0]?.type === stageRounds.PLAY_OFF_STAGE_1_2,
                  [styles.stage4]:
                    stage[0]?.type === stageRounds.PLAY_OFF_STAGE_1_4,
                  [styles.stage8]:
                    stage[0]?.type === stageRounds.PLAY_OFF_STAGE_1_8,
                })}
              >
                <div className={styles.matchGroup}>
                  {stage
                    .slice(0, stage.length / 2)
                    .map((match: BracketStage, matchIndex: number) => (
                      <MatchLayout
                        match={match}
                        key={matchIndex}
                        matchCountInStage={stage.length}
                        matchIndex={matchIndex}
                        isTop
                        tiebreakerScore={tiebreakerScore}
                        currentEntry={currentEntry}
                      />
                    ))}
                </div>
                <div className={styles.matchGroup}>
                  {stage
                    .slice(stage.length / 2)
                    .map((match: BracketStage, matchIndex: number) => (
                      <MatchLayout
                        match={match}
                        key={matchIndex}
                        matchCountInStage={stage.length}
                        matchIndex={matchIndex}
                        isTop={false}
                        tiebreakerScore={tiebreakerScore}
                        currentEntry={currentEntry}
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

const MatchLayout = ({
  match,
  matchCountInStage,
  matchIndex,
  isTop,
  tiebreakerScore,
  currentEntry,
}: {
  match: BracketStage
  matchCountInStage: number
  matchIndex: number
  isTop: boolean
  tiebreakerScore: string
  currentEntry: BracketPlayoffEntryItem
}) => {
  const currentMatchEntryIndex = currentEntry?.bracket_forecasts.findIndex(
    (forecast) => forecast.pool_type_bracket_id === match.stage_id,
  )

  const teamKey = Object.entries(match.round_teams).find(
    ([_, team]) =>
      team?.id ===
      currentEntry?.bracket_forecasts[currentMatchEntryIndex].participant_id,
  )

  if (teamKey) {
    match.round_teams[Number(teamKey[0])]!.status =
      currentEntry?.bracket_forecasts[currentMatchEntryIndex].status
  }

  switch (match.type) {
    case stageRounds.PLAY_OFF_STAGE_1_4:
      return (
        <Stage4Match
          match={match}
          key={matchIndex}
          matchCountInStage={matchCountInStage}
          isTop={isTop}
          matchIndex={matchIndex}
        />
      )
    case stageRounds.PLAY_OFF_STAGE_1_2:
      return (
        <Stage2Match
          match={match}
          key={matchIndex}
          matchCountInStage={matchCountInStage}
          isTop={isTop}
        />
      )
    case stageRounds.PLAY_OFF_STAGE_FINAL:
      return (
        <FinalsMatch
          match={match}
          key={matchIndex}
          matchCountInStage={matchCountInStage}
          tiebreakerScore={tiebreakerScore}
        />
      )
    default:
      return (
        <Match
          match={match}
          key={matchIndex}
          matchCountInStage={matchCountInStage}
          isTop={isTop}
        />
      )
  }
}

const FinalsMatch = ({
  match,
  matchCountInStage,
  tiebreakerScore,
}: {
  match: BracketStage
  matchCountInStage: number
  tiebreakerScore: string
}) => {
  return (
    <>
      <div className={classNames(styles.lineWrap, styles.final)}>
        <BracketPicksFinalTwoLine />
      </div>
      <Match match={match} matchCountInStage={matchCountInStage} />
      <TiebreakerBlock tiebreakerScore={tiebreakerScore} />
    </>
  )
}

const Stage4Match = ({
  match,
  matchCountInStage,
  isTop,
  matchIndex,
}: {
  match: BracketStage
  matchCountInStage: number
  isTop: boolean
  matchIndex: number
}) => {
  return (
    <>
      {isTop && matchIndex % 2 === 0 && (
        <div
          className={classNames(styles.lineWrap, styles.stage4, {
            [styles.quarterTopLine]: isTop,
          })}
        >
          <BracketPicksQuarterLine />
        </div>
      )}
      <Match
        match={match}
        matchCountInStage={matchCountInStage}
        isTop={isTop}
      />
      {!isTop && matchIndex % 2 === 0 && (
        <div
          className={classNames(styles.lineWrap, styles.stage4, {
            [styles.quarterBottomLine]: !isTop,
          })}
        >
          <BracketPicksQuarterLine />
        </div>
      )}
    </>
  )
}

const Stage2Match = ({
  match,
  matchCountInStage,
  isTop,
}: {
  match: BracketStage
  matchCountInStage: number
  isTop: boolean
}) => {
  return (
    <>
      {isTop && (
        <div
          className={classNames(styles.lineWrap, styles.stage2, {
            [styles.top]: isTop,
          })}
        >
          <BracketPicksSemiTwoTopLine />
        </div>
      )}
      <Match
        match={match}
        matchCountInStage={matchCountInStage}
        isTop={isTop}
      />
      {!isTop && (
        <div
          className={classNames(styles.lineWrap, styles.stage2, {
            [styles.bottom]: !isTop,
          })}
        >
          <BracketPicksSemiTwoBottomLine />
        </div>
      )}
    </>
  )
}

const Match = ({
  match,
  matchCountInStage,
  isTop,
}: {
  match: BracketStage
  matchCountInStage: number
  isTop?: boolean
}) => {
  return (
    <div
      className={classNames(styles.matchLayout, {
        [styles.anotherBg]: !isTop,
        [styles.final]: matchCountInStage === 1,
      })}
    >
      <div className={styles.matchHeader}>
        <h1
          className={classNames(styles.matchTitle, {
            [styles.anotherBg]: !isTop,
            [styles.final]: matchCountInStage === 1,
          })}
        >
          {match.title}
        </h1>
      </div>
      {Object.values(match.round_teams).map(
        (team: BracketTeam | null, teamIndex: number) => {
          return (
            <Fragment key={teamIndex}>
              {team && (
                <div
                  className={classNames(styles.team, {
                    [styles.teamBottom]: teamIndex % 2 === 1,
                    [styles.finalPick]:
                      match.type === stageRounds.PLAY_OFF_STAGE_FINAL &&
                      team.isPicked,
                    [styles.isPicked]: team.isPicked,
                    // [styles.isPicked]: team.isPicked && team.status === 'none',
                    [styles.rightPick]: team.status === 'win',
                    [styles.notRightPick]: team.status === 'lose',
                  })}
                >
                  <div className={styles.iconWrap}>
                    <Image
                      src={generateParticipantImagePath(team.external_id)}
                      alt={team.name}
                      width={34}
                      height={34}
                    />
                  </div>

                  <div className={styles.name}>
                    <p>{team.name.slice(0, team?.name.lastIndexOf(' '))}</p>
                    <p>{team.name.slice(team?.name.lastIndexOf(' '))}</p>
                  </div>
                </div>
              )}
            </Fragment>
          )
        },
      )}
    </div>
  )
}

const TiebreakerBlock = ({ tiebreakerScore }: { tiebreakerScore: string }) => {
  return (
    <div className={styles.tiebreakerBlockWrap}>
      <div className={styles.text}>
        <span>Tiebreak</span>&nbsp;<span>(SB Total):</span>
      </div>
      <span>{tiebreakerScore}</span>
    </div>
  )
}
