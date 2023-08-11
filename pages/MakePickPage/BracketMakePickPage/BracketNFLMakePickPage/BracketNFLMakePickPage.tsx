/* eslint-disable @typescript-eslint/no-non-null-assertion */
import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

import type { BracketPlayoffEntryItem, Pool } from '@/api'
import {
  api,
  BracketForecasts,
  BracketForecastsAccType,
  BracketRounds,
  BracketStage,
  BracketTeam,
  BracketTieBreaker,
  StageKeys,
} from '@/api'
import {
  BracketFinalTwoLine,
  BracketQuarterLine,
  BracketSemiTwoBottomLine,
  BracketSemiTwoTopLine,
  Info,
  Question,
} from '@/assets/icons'
import {
  generateParticipantImagePath,
  initialRoundsObj,
  initialRoundsObjType,
  routes,
  stageRounds,
  tournamentName,
} from '@/config/constants'
import { UserAndEntrySelects } from '@/features/components'
import { Input } from '@/features/ui'
import { useEventsForBracket, useGetPoolEntries, useGetUser } from '@/helpers'

import styles from './BracketNFLMakePickPage.module.scss'

export default function BracketNFLMakePickPage({
  poolData,
}: {
  poolData: Pool<'bracket'>
}) {
  const [currentEntry, setCurrentEntry] =
    useState<BracketPlayoffEntryItem | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const {
    push,
    query: { isMaintenance },
  } = useRouter()

  const { userData } = useGetUser()

  const {
    poolEntriesData: entries,
    poolEntriesIsLoading: entriesLoading,
    poolEntriesMutate: updateEntries,
  } = useGetPoolEntries<'bracket'>({ poolId: poolData.id })

  const {
    bracketEvents: events,
    tiebreaker,
    deadline,
  } = useEventsForBracket({
    poolId: poolData.id.toString(),
    userId: currentEntry?.user_id.toString(),
  })

  useEffect(() => {
    if (
      userData &&
      poolData &&
      isMaintenance &&
      userData.id !== poolData.owner.id
    ) {
      push(routes.account.makePick.index(poolData.id))
    }
  }, [isMaintenance, poolData, push, userData])

  if (entriesLoading && !entries) {
    return <p>Loading...</p>
  }

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>
        Make a PLAYOFF BRACKET pick <Info />
      </h1>
      <h2 className={styles.subTitle}>step 1/2 - pick teams</h2>
      <p className={styles.descriptionText}>{poolData.pool_type.description}</p>
      <UserAndEntrySelects
        entriesData={entries}
        poolData={poolData}
        setSelectedEntry={setCurrentEntry}
        mutateEntries={updateEntries}
        pickDeadline={poolData.pick_pool.pick_deadline}
        setIsEditMode={setIsEditMode}
      />
      <BracketTournamentTreeNFL
        roundsData={events?.rounds}
        poolData={poolData}
        tiebreaker={tiebreaker}
        deadline={deadline}
        currentEntry={currentEntry}
        isMaintenance={isEditMode}
      />
    </div>
  )
}

function BracketTournamentTreeNFL({
  roundsData,
  poolData,
  tiebreaker,
  deadline,
  currentEntry,
  isMaintenance,
}: {
  roundsData: BracketRounds | undefined
  poolData: Pool<'bracket'>
  deadline: string | undefined
  tiebreaker: BracketTieBreaker | undefined
  currentEntry: BracketPlayoffEntryItem | null
  isMaintenance: boolean
}) {
  const { push } = useRouter()

  const [rounds, setRounds] = useState<BracketRounds>(
    initialRoundsObj as initialRoundsObjType<BracketStage>,
  )
  const [selectedTeam, setSelectedTeam] = useState<
    [BracketTeam | null, BracketStage] | number[]
  >([])
  const [winner, setWinner] = useState<BracketTeam | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState('')
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
            if (forecast.stage === stageRounds.PLAY_OFF_STAGE_FINAL) {
              setWinner({
                ...forecast.participant,
                number_of_games: forecast.number_of_games,
              })
            }

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
    setSelectedTeam([1, 2])
  }, [roundsData, currentEntry, poolData?.tournament.name])

  function resetTeamFromNextSteps(
    stage = '',
    prevSelectedTeam: BracketTeam | null,
    eventRounds: BracketRounds,
  ) {
    const startStageToRemoveIndex = Object.keys(eventRounds).indexOf(stage) - 2

    if (startStageToRemoveIndex > -1) {
      for (let i = startStageToRemoveIndex; i >= 0; i--) {
        Object.values(eventRounds)[i].forEach((round) => {
          if (round?.round_teams) {
            Object.entries(round.round_teams).forEach((team) => {
              if (team[1]?.id === prevSelectedTeam?.id) {
                delete round.round_teams[+team[0]]
                round.round_teams[+team[0]] = null
              }
            })
          }
        })
      }
    }
  }

  function changeTeam(
    team: BracketTeam | null,
    currentMatch: BracketStage,
    stage: StageKeys,
  ) {
    const copyObjTeamAbout = { ...team }
    const copyObjCurrentEvent: BracketStage = { ...currentMatch }

    const teamKey = Object.entries(copyObjCurrentEvent.round_teams).find(
      (item) => item[1]?.id === copyObjTeamAbout.id,
    )

    const copyObjCurrentEventSelectedTeam =
      copyObjCurrentEvent.round_teams[Number(teamKey ? teamKey[0] : null)]

    const countOfTeamsWithPicken = Object.values(
      copyObjCurrentEvent.round_teams,
    ).reduce((count: number, team) => {
      if (team?.isPicked) ++count
      return count
    }, 0)

    if (countOfTeamsWithPicken === 0) {
      copyObjCurrentEventSelectedTeam!.isPicked = true
    }

    if (
      countOfTeamsWithPicken === 1 &&
      !copyObjCurrentEventSelectedTeam?.isPicked
    ) {
      Object.values(copyObjCurrentEvent.round_teams).forEach((team) => {
        team!.isPicked = !team!.isPicked
      })
    }

    if (copyObjCurrentEvent.type === stageRounds.PLAY_OFF_STAGE_FINAL) {
      setWinner(copyObjCurrentEventSelectedTeam)
    }

    const eventRounds: BracketRounds = { ...rounds }

    const copyObjCurrentEventIndex = eventRounds[
      copyObjCurrentEvent.type
    ].findIndex(
      (item) =>
        item.parent_id === copyObjCurrentEvent.parent_id &&
        item.stage_id === copyObjCurrentEvent.stage_id,
    )

    if (copyObjCurrentEventIndex !== -1) {
      eventRounds[copyObjCurrentEvent.type][
        copyObjCurrentEventIndex
      ].round_teams = copyObjCurrentEvent.round_teams
    }

    const nextStepStage: BracketStage[] =
      Object.values(eventRounds)[Object.keys(eventRounds).indexOf(stage) - 1]

    if (nextStepStage && copyObjCurrentEventSelectedTeam) {
      Object.values(nextStepStage).forEach((nextStageEvent) => {
        if (nextStageEvent.stage_id === copyObjCurrentEvent.parent_id) {
          const teamToNextStage = { ...copyObjCurrentEventSelectedTeam }
          delete teamToNextStage.isPicked

          if (
            nextStageEvent.round_teams[copyObjCurrentEvent.stage_id] !== null &&
            nextStageEvent.round_teams[copyObjCurrentEvent.stage_id]!.id !==
              copyObjCurrentEventSelectedTeam.id
          ) {
            resetTeamFromNextSteps(
              stage,
              Object.values(copyObjCurrentEvent.round_teams).find(
                (team) => copyObjCurrentEventSelectedTeam.id !== team?.id,
              ) ?? null,
              eventRounds,
            )
          }

          if (
            copyObjCurrentEvent.type === stageRounds.PLAY_OFF_STAGE_1_8 &&
            poolData?.tournament.name === tournamentName.NFL
          ) {
            updatePositionBySeed(
              eventRounds,
              copyObjCurrentEvent,
              copyObjCurrentEventSelectedTeam,
            )
          } else {
            nextStageEvent.round_teams[copyObjCurrentEvent.stage_id] =
              teamToNextStage
          }
        }
      })
    }

    setRounds(eventRounds)
    setSelectedTeam([copyObjCurrentEventSelectedTeam, copyObjCurrentEvent])
  }

  function updatePositionBySeed(
    eventRounds: BracketRounds,
    currentMatch: BracketStage,
    team: BracketTeam,
  ) {
    const selectedTeam: BracketTeam = { ...team }

    selectedTeam.isPicked = false

    const parent_id = eventRounds.PLAY_OFF_STAGE_1_4.find(
      (stage) => stage.stage_id === currentMatch.parent_id,
    )?.parent_id

    const parent_nodes = eventRounds.PLAY_OFF_STAGE_1_4.filter(
      (stage) => stage.parent_id === parent_id,
    )

    let sortedTeams: Array<BracketTeam | null> = []

    parent_nodes.forEach((stage) => {
      Object.values(stage.round_teams).forEach((team) => {
        sortedTeams = [...sortedTeams, team ?? null]
      })
    })

    const isSettedByStage = sortedTeams.findIndex((team) => {
      return Object.values(currentMatch.round_teams).some(
        (current_team) => current_team!.id === team?.id,
      )
    })

    if (!sortedTeams.some((team) => team?.id === selectedTeam.id)) {
      sortedTeams[
        isSettedByStage !== -1
          ? isSettedByStage
          : sortedTeams.findIndex((team) => team === null)
      ] = selectedTeam

      sortedTeams.sort((a: BracketTeam | null, b: BracketTeam | null) => {
        return a?.seed === 7
          ? 1
          : b?.seed === 7
          ? -1
          : !a
          ? 1
          : !b
          ? -1
          : a.seed && b.seed
          ? a.seed - b.seed
          : -1
      })

      const divisionalPosition: number[] = [0, 3, 1, 2]

      parent_nodes.map((node: BracketStage, key: number) => {
        Object.values(node.round_teams).forEach((_, k: number) => {
          const newTeam: BracketTeam | null =
            sortedTeams[divisionalPosition[parseInt(`${key}${k}`, 2)]]

          if (
            parent_nodes[key].round_teams[
              Number(Object.keys(node.round_teams)[k])
            ]?.id !== newTeam?.id
          ) {
            parent_nodes[key].round_teams[
              Number(Object.keys(node.round_teams)[k])
            ] = newTeam

            if (newTeam) newTeam.isPicked = false

            resetTeamFromNextSteps(
              stageRounds.PLAY_OFF_STAGE_1_8,
              newTeam,
              eventRounds,
            )
          }
        })
      })
    }
  }

  function inputForecasts() {
    const newForecasts: {
      size: number
      arr: { participant_id: number; parent_id: number | null }[]
      winner: BracketTeam | null
    } = {
      size: 0,
      arr: [],
      winner: null,
    }

    const objValuesRounds = Object.values(rounds)

    objValuesRounds.forEach((stage, i) => {
      if (i !== objValuesRounds.length - 1) {
        stage.forEach((match) => {
          Object.entries(match.round_teams).forEach((team) => {
            if (team[1] !== null) {
              newForecasts.arr.push({
                participant_id: team[1]?.id,
                parent_id: +team[0],
              })
            }

            newForecasts.size++
          })
        })
      }
    })

    let finalStageId = null

    objValuesRounds.forEach((round: BracketStage[]) => {
      if (round.length === 1) finalStageId = round[0].stage_id
    })

    if (winner) {
      newForecasts.arr.push({
        participant_id: winner.id,
        parent_id: finalStageId,
      })
    }
    newForecasts.winner = winner
    newForecasts.size++

    setError('')

    return newForecasts
  }

  const submitPicks = () => {
    if (isLoading) return null

    const forecasts = inputForecasts()

    if (forecasts.arr.length < forecasts.size || !winner) {
      setError('There are empty fields!')
      return null
    }

    if (!poolData || !currentEntry) {
      return
    }

    setIsLoading(true)
    const method =
      isMaintenance && currentEntry.bracket_forecasts.length
        ? api.forecasts.putForecasts
        : api.forecasts.setForecasts

    method(poolData.id, currentEntry.id, {
      forecasts: forecasts.arr,
      tiebreaker: {
        tiebreaker_score: Number(tiebreakerScore),
        tiebreaker_id: Number(tiebreaker?.id) || 0,
      },
    }).then((data) => {
      setIsLoading(false)

      if (data.error) {
        setError(data.error.codeError.toString())
      } else {
        push(routes.account.overview(poolData.id))
      }
    })
  }

  useEffect(() => {
    if (rounds.PLAY_OFF_STAGE_FINAL[0]?.round_teams) {
      if (
        Object.values(rounds.PLAY_OFF_STAGE_FINAL[0].round_teams).every(
          (team) => !team,
        )
      ) {
        setWinner(null)
      }
    }
  }, [rounds, selectedTeam])

  const isDeadline = deadline
    ? new Date(deadline).getTime() < new Date().getTime()
    : false

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
                        changeTeam={changeTeam}
                        submitPicks={submitPicks}
                        isDeadline={isDeadline}
                        tiebreakerScore={tiebreakerScore}
                        setTiebreakerScore={setTiebreakerScore}
                        isLoading={isLoading}
                        winner={winner}
                        error={error}
                        selectedTeam={selectedTeam}
                        setWinner={setWinner}
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
                        changeTeam={changeTeam}
                        submitPicks={submitPicks}
                        isDeadline={isDeadline}
                        tiebreakerScore={tiebreakerScore}
                        setTiebreakerScore={setTiebreakerScore}
                        isLoading={isLoading}
                        winner={winner}
                        error={error}
                        selectedTeam={selectedTeam}
                        setWinner={setWinner}
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
  changeTeam,
  submitPicks,
  isDeadline,
  tiebreakerScore,
  setTiebreakerScore,
  isLoading,
  winner,
  error,
  selectedTeam,
  setWinner,
}: {
  match: BracketStage
  matchCountInStage: number
  matchIndex: number
  isTop: boolean
  changeTeam: (
    team: BracketTeam | null,
    currentMatch: BracketStage,
    stage: StageKeys,
  ) => void
  submitPicks: () => void
  isDeadline?: boolean
  tiebreakerScore: string
  setTiebreakerScore: Dispatch<SetStateAction<string>>
  isLoading: boolean
  winner: BracketTeam | null
  error: string
  selectedTeam: [BracketTeam | null, BracketStage] | number[]
  setWinner: Dispatch<React.SetStateAction<BracketTeam | null>>
}) => {
  useEffect(() => {
    if (match.type === stageRounds.PLAY_OFF_STAGE_FINAL) {
      Object.values(match.round_teams).forEach((team) => {
        team?.isPicked === true && setWinner(team)
      })
    }
  }, [selectedTeam, match.type, match.round_teams, setWinner])

  switch (match.type) {
    case stageRounds.PLAY_OFF_STAGE_1_4:
      return (
        <Stage4Match
          match={match}
          key={matchIndex}
          matchCountInStage={matchCountInStage}
          isTop={isTop}
          changeTeam={changeTeam}
          error={error}
        />
      )
    case stageRounds.PLAY_OFF_STAGE_1_2:
      return (
        <Stage2Match
          match={match}
          key={matchIndex}
          matchCountInStage={matchCountInStage}
          isTop={isTop}
          changeTeam={changeTeam}
          error={error}
        />
      )
    case stageRounds.PLAY_OFF_STAGE_FINAL:
      return (
        <FinalsMatch
          match={match}
          key={matchIndex}
          matchCountInStage={matchCountInStage}
          changeTeam={changeTeam}
          submitPicks={submitPicks}
          isDeadline={isDeadline}
          tiebreakerScore={tiebreakerScore}
          setTiebreakerScore={setTiebreakerScore}
          isLoading={isLoading}
          winner={winner}
          error={error}
        />
      )
    default:
      return (
        <div
          className={classNames({
            [styles.indent]: matchCountInStage / 2 === matchIndex + 1,
          })}
        >
          <Match
            match={match}
            key={matchIndex}
            matchCountInStage={matchCountInStage}
            changeTeam={changeTeam}
            isTop={isTop}
          />
        </div>
      )
  }
}

const FinalsMatch = ({
  match,
  matchCountInStage,
  changeTeam,
  submitPicks,
  isDeadline,
  tiebreakerScore,
  setTiebreakerScore,
  isLoading,
  winner,
  error,
}: {
  match: BracketStage
  matchCountInStage: number
  changeTeam: (
    team: BracketTeam | null,
    currentMatch: BracketStage,
    stage: StageKeys,
  ) => void
  submitPicks: () => void
  isDeadline?: boolean
  tiebreakerScore: string
  setTiebreakerScore: Dispatch<SetStateAction<string>>
  isLoading: boolean
  winner: BracketTeam | null
  error: string
}) => {
  return (
    <>
      <div className={classNames(styles.lineWrap, styles.final)}>
        <BracketFinalTwoLine />
      </div>
      <Match
        match={match}
        matchCountInStage={matchCountInStage}
        changeTeam={changeTeam}
        winner={winner}
        error={error}
      />
      <SubmitForm
        submitPicks={submitPicks}
        isDisabled={isDeadline}
        setTiebreakerScore={setTiebreakerScore}
        tiebreakerScore={tiebreakerScore}
        isLoading={isLoading}
        winner={winner}
      />
    </>
  )
}

const Stage4Match = ({
  match,
  matchCountInStage,
  isTop,
  changeTeam,
  error,
}: {
  match: BracketStage
  matchCountInStage: number
  isTop: boolean
  changeTeam: (
    team: BracketTeam | null,
    currentMatch: BracketStage,
    stage: StageKeys,
  ) => void
  error: string
}) => {
  return (
    <>
      {isTop && (
        <div
          className={classNames(styles.lineWrap, styles.stage4, {
            [styles.quarterTopLine]: isTop,
          })}
        >
          <BracketQuarterLine />
        </div>
      )}
      <Match
        match={match}
        matchCountInStage={matchCountInStage}
        isTop={isTop}
        changeTeam={changeTeam}
        error={error}
      />
      {!isTop && (
        <div
          className={classNames(styles.lineWrap, styles.stage4, {
            [styles.quarterBottomLine]: !isTop,
          })}
        >
          <BracketQuarterLine />
        </div>
      )}
    </>
  )
}

const Stage2Match = ({
  match,
  matchCountInStage,
  isTop,
  changeTeam,
  error,
}: {
  match: BracketStage
  matchCountInStage: number
  isTop: boolean
  changeTeam: (
    team: BracketTeam | null,
    currentMatch: BracketStage,
    stage: StageKeys,
  ) => void
  error: string
}) => {
  return (
    <>
      {isTop && (
        <div
          className={classNames(styles.lineWrap, styles.stage2, {
            [styles.top]: isTop,
          })}
        >
          <BracketSemiTwoTopLine />
        </div>
      )}
      <Match
        match={match}
        matchCountInStage={matchCountInStage}
        isTop={isTop}
        changeTeam={changeTeam}
        error={error}
      />
      {!isTop && (
        <div
          className={classNames(styles.lineWrap, styles.stage2, {
            [styles.bottom]: !isTop,
          })}
        >
          <BracketSemiTwoBottomLine />
        </div>
      )}
    </>
  )
}

const Match = ({
  match,
  matchCountInStage,
  isTop,
  changeTeam,
  winner,
  error,
}: {
  match: BracketStage
  matchCountInStage: number
  isTop?: boolean
  changeTeam: (
    team: BracketTeam | null,
    currentMatch: BracketStage,
    stage: StageKeys,
  ) => void
  winner?: BracketTeam | null
  error?: string
}) => {
  const isShowWinner: boolean =
    !!(match.type === stageRounds.PLAY_OFF_STAGE_FINAL && winner) ?? false

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
        {isShowWinner && (
          <span>{`Winner - ${winner?.name.slice(
            winner?.name.lastIndexOf(' '),
          )}`}</span>
        )}
      </div>
      {Object.values(match.round_teams)?.map(
        (team: BracketTeam | null, teamIndex: number) => {
          return (
            <Fragment key={teamIndex}>
              {team ? (
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
                  onClick={() => changeTeam(team, match, match.type)}
                >
                  <div className={styles.iconWrap}>
                    <Image
                      src={generateParticipantImagePath(team.external_id)}
                      alt={team.name}
                      width={45}
                      height={45}
                    />
                  </div>

                  <div className={styles.name}>
                    <p>{team.name.slice(0, team?.name.lastIndexOf(' '))}</p>
                    <p>{team.name.slice(team?.name.lastIndexOf(' '))}</p>
                  </div>

                  <span className={styles.seed}>Seed {team.seed}</span>
                </div>
              ) : (
                <div
                  className={classNames(styles.team, {
                    [styles.teamBottom]: teamIndex % 2 === 1,
                    [styles.error]: error,
                  })}
                >
                  <div className={styles.iconWrap}>
                    <Question />
                  </div>
                  <span className={styles.emptyText}>
                    {`Winner ${teamIndex + 1}`}
                  </span>
                </div>
              )}
            </Fragment>
          )
        },
      )}
    </div>
  )
}

const SubmitForm = ({
  submitPicks,
  isDisabled,
  tiebreakerScore,
  setTiebreakerScore,
  isLoading,
  winner,
}: {
  submitPicks: () => void
  isDisabled?: boolean
  tiebreakerScore: string
  setTiebreakerScore: Dispatch<SetStateAction<string>>
  isLoading: boolean
  winner: BracketTeam | null
}) => {
  return (
    <div className={styles.formContainer}>
      <div className={styles.tiebreakForm}>
        <div className={styles.text}>
          <span>Tiebreak</span>&nbsp;<span>(SB Total):</span>
        </div>
        <Input
          type="number"
          onChange={(value) => setTiebreakerScore(value)}
          value={tiebreakerScore}
          small
          onKeyDown={(e) => e.key === 'Enter' && submitPicks()}
          onFocus={() =>
            setTiebreakerScore((prev) => (prev === '0' ? '' : prev))
          }
        />
      </div>
      <button
        className={classNames('button button-blue-light', styles.submitButton, {
          [styles.disabled]: !winner,
        })}
        onClick={winner ? submitPicks : () => null}
        disabled={isLoading || isDisabled}
        type="submit"
      >
        Submit picks
      </button>
    </div>
  )
}
