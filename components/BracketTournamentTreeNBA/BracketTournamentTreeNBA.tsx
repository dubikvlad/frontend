/* eslint-disable @typescript-eslint/no-non-null-assertion */
import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, {
  Dispatch,
  Fragment,
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { KeyedMutator } from 'swr'

import {
  api,
  BracketForecasts,
  BracketForecastsAccType,
  BracketPlayoffEntryItem,
  BracketRound,
  BracketRounds,
  BracketStage,
  BracketTeam,
  BracketTieBreaker,
  PlayoffBracketDataForecastItem,
  PlayoffTiebreaker,
  Pool,
  ResponseData,
  SeriesData,
  StageType,
  UserResponseData,
} from '@/api'
import {
  BracketArrowConfFinalsBottomLeft,
  BracketArrowConfFinalsBottomRight,
  BracketArrowConfFinalsTopLeft,
  BracketArrowConfFinalsTopRight,
  BracketArrowLeft,
  BracketArrowRight,
  BracketFinalsArrowFromSemiFinals,
  BracketFinalsLine,
} from '@/assets/icons'
import {
  bracketTreePageType,
  generateParticipantImagePath,
  initialRoundsObj,
  initialRoundsObjType,
  routes,
  stageRounds,
} from '@/config/constants'
import type { BracketTreePageTypes } from '@/config/constants'
import { Input } from '@/features/ui'

import styles from './BracketTournamentTreeNBA.module.scss'

type BracketTournamentTreeProps = {
  pageType: BracketTreePageTypes
  roundsData: BracketRounds | undefined
  poolData?: Pool<'bracket'>
  deadline?: string | undefined
  tiebreaker?: BracketTieBreaker | undefined
  currentEntry?: BracketPlayoffEntryItem | null
  currentUser?: UserResponseData | null
  isMaintenance?: boolean
  updateForecasts?: KeyedMutator<ResponseData<SeriesData> | null>
}

export default function BracketTournamentTreeNBA({
  pageType,
  roundsData,
  poolData,
  tiebreaker,
  deadline,
  currentEntry,
  currentUser,
  isMaintenance,
  updateForecasts,
}: BracketTournamentTreeProps) {
  const { push } = useRouter()

  const [rounds, setRounds] = useState<BracketRounds>(
    initialRoundsObj as initialRoundsObjType<BracketStage>,
  )
  const [roundsArray, setRoundsArray] = useState<BracketStage[][]>([])
  const [winner, setWinner] = useState<BracketTeam | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState('')

  const [lastSelectedMatch, setLastSelectedMatch] = useState<StageType | null>(
    null,
  )

  const [lastSelectedTeamId, setLastSelectedTeamId] = useState<number | null>(
    null,
  )

  const [tiebreakerScore, setTiebreakerScore] = useState<string>('')
  const isTieBreaker: number | undefined = poolData?.pick_pool?.tiebreaker

  useEffect(() => {
    if (isTieBreaker && currentEntry?.playoff_tiebreaker?.score) {
      const tieBreaker: PlayoffTiebreaker | undefined =
        currentEntry?.playoff_tiebreaker
      setTiebreakerScore(String(tieBreaker?.score))
    } else {
      setTiebreakerScore('0')
    }
  }, [currentEntry?.playoff_tiebreaker, isTieBreaker, currentEntry])

  useEffect(() => {
    function updateArray(rounds?: BracketRounds) {
      const newRounds: BracketStage[][] = []

      if (rounds) {
        Object.values(rounds)
          .sort((a: BracketStage[], b: BracketStage[]) => b.length - a.length)
          .forEach((stage: BracketStage[]) => {
            const buffArr = stage.reduce(
              (acc: BracketStage[], round, roundIndex) => {
                if (roundIndex < stage.length / 2) acc.push(round)
                return acc
              },
              [],
            )

            newRounds.push(buffArr)
          })

        Object.values(rounds).forEach((stage: BracketStage[]) => {
          const buffArr = stage.reduce(
            (acc: BracketStage[], round, roundIndex) => {
              if (roundIndex >= stage.length / 2 && stage.length !== 1)
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
      ? roundsData
      : (initialRoundsObj as initialRoundsObjType<BracketStage>)

    if (pageType === bracketTreePageType.make_pick) {
      const brackets: BracketForecastsAccType[] = currentEntry
        ?.bracket_forecasts.length
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

      if (!currentEntry?.bracket_forecasts.length) {
        setWinner(null)
      }

      if (rounds) {
        Object.values(rounds).forEach(
          (stage: BracketRound[], stageIndex: number) => {
            stage.forEach((match) => {
              Object.keys(match.round_teams).forEach((team) => {
                if (
                  brackets.length === 0 &&
                  stageIndex !== Object.values(rounds).length - 1
                )
                  match.round_teams[team] = null
                else {
                  brackets.forEach((bracket) => {
                    if (bracket.forecastId === +team) {
                      match.round_teams[team] = bracket.participant
                      match.round_teams[team]!.number_of_games =
                        bracket.numberOfGames
                    }
                  })
                }
              })
            })
          },
        )

        updateArray(rounds)
      }
    } else {
      updateArray(rounds)
    }

    setRounds(rounds)
  }, [roundsData, currentEntry?.bracket_forecasts, pageType])

  function inputForecasts() {
    const newForecasts: {
      size: number
      arr: { participant_id: number; parent_id: number }[]
      winner: BracketTeam | null
    } = {
      size: 0,
      arr: [],
      winner: null,
    }

    Object.values(rounds).forEach((stage: BracketStage[], i: number) => {
      if (i !== Object.values(rounds).length - 1) {
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

    const finalStage: BracketStage[] | undefined = Object.values(rounds).find(
      (round: BracketStage[]) => round.length === 1,
    )

    const finalStageId: number | null = finalStage
      ? finalStage[0].stage_id
      : null

    newForecasts.arr.push({
      participant_id: winner?.id || 0,
      parent_id: finalStageId || 0,
    })
    newForecasts.winner = winner
    newForecasts.size++

    setError('')

    return newForecasts
  }

  const submitPicks = async () => {
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
    const method = isMaintenance
      ? api.forecasts.putForecasts
      : api.forecasts.setForecasts

    method(poolData.id, currentEntry.id, {
      forecasts: forecasts.arr as PlayoffBracketDataForecastItem[],
      tiebreaker: {
        tiebreaker_score: Number(tiebreakerScore),
        tiebreaker_id: Number(tiebreaker?.id) || 0,
      },
    }).then((data) => {
      setIsLoading(false)

      if (data.error) {
        setError(data.error.codeError.toString())
      } else {
        const redirectLink =
          isMaintenance && currentUser
            ? routes.account.makePick.step2(poolData.id, currentEntry.id, {
                isMaintenance: 1,
                user_id: currentUser.id,
              })
            : routes.account.makePick.step2(poolData.id, currentEntry.id)

        setIsLoading(true)
        push(redirectLink)

        if (updateForecasts) {
          return updateForecasts()
        }
      }
    })
  }

  function updateTeamInNextSteps(
    prevTeam: BracketTeam | null,
    currTeam: BracketTeam | null,
    stageType = '',
  ) {
    const startIndexForRemoving =
      Object.keys(rounds).reverse().indexOf(stageType) + 2

    if (startIndexForRemoving <= Object.keys(rounds).length) {
      const copyObjRounds = { ...rounds }

      Object.values(copyObjRounds)
        .reverse()
        .forEach((stage: BracketStage[], stageIndex: number) => {
          if (stageIndex + 1 >= startIndexForRemoving) {
            stage.forEach((match: BracketStage) => {
              Object.entries(match.round_teams).forEach((team) => {
                if (team[1] !== null && team[1].id === prevTeam?.id) {
                  const index = Number(team[0])
                  match.round_teams[index] = {
                    ...currTeam,
                  } as BracketTeam
                  match.round_teams[index]!.seed = null
                  match.round_teams[index]!.number_of_games = null
                }

                if (winner !== null && winner.id === prevTeam?.id) {
                  currTeam!.number_of_games = null
                  setWinner(currTeam)
                }
              })
            })
          }
        })
    }
  }

  function changeTeam(team: BracketTeam | null, currentMatch: BracketStage) {
    if (pageType !== bracketTreePageType.make_pick) return

    if (
      team === null ||
      (team.id === lastSelectedTeamId &&
        currentMatch.type === lastSelectedMatch)
    ) {
      return null
    }

    setLastSelectedTeamId(team.id)
    setLastSelectedMatch(currentMatch.type)

    const copyObjTeam = { ...team }
    const copyObjRounds = { ...rounds }

    if (currentMatch.type === stageRounds.PLAY_OFF_STAGE_FINAL) {
      copyObjTeam.number_of_games = null
      setWinner({ ...copyObjTeam })
    }

    Object.values(copyObjRounds).forEach((stage: BracketStage[]) => {
      stage.forEach((match: BracketStage) => {
        if (match.stage_id === currentMatch.parent_id) {
          if (
            match.round_teams[currentMatch.stage_id] !== null &&
            copyObjTeam.id !== match.round_teams[currentMatch.stage_id]!.id
          ) {
            updateTeamInNextSteps(
              match.round_teams[currentMatch.stage_id],
              copyObjTeam,
              currentMatch.type,
            )
          }

          match.round_teams[currentMatch.stage_id] = {
            ...copyObjTeam,
            isPicked: true,
            seed: null,
            number_of_games: null,
          }
        }
      })
    })

    setRounds(copyObjRounds)
  }

  const isDeadline = deadline
    ? new Date(deadline).getTime() < new Date().getTime()
    : false

  return (
    <div className={styles.main}>
      <div
        className={classNames(styles.container, {
          [styles.makePick]: pageType === bracketTreePageType.make_pick,
        })}
      >
        {roundsArray.map((stage: BracketStage[], stageIndex: number) => {
          return (
            <div key={stageIndex} className={styles.row}>
              {stage.map((match: BracketStage, matchIndex: number) => {
                let parentMatch: BracketStage | null = null

                const matchTeams: [string, BracketTeam | null][] =
                  Object.entries(match.round_teams)

                if (match.round_teams) {
                  Object.values(match.round_teams).forEach(
                    (team: BracketTeam | null): void => {
                      if (team && team.isPicked) team.isPicked = false
                    },
                  )
                }

                roundsArray.forEach(
                  (stage: BracketStage[], findStageIndex: number): void => {
                    if (parentMatch || findStageIndex === stageIndex) return

                    parentMatch =
                      stage.find(
                        (matchToFindFor: BracketStage): boolean =>
                          matchToFindFor.stage_id === match.parent_id,
                      ) || null
                  },
                )

                if (parentMatch && match.type !== 'PLAY_OFF_STAGE_FINAL') {
                  const winnerTeamKey:
                    | [string, BracketTeam | null]
                    | undefined = matchTeams.find(
                    ([_, team]: [string, BracketTeam | null]) =>
                      parentMatch?.round_teams &&
                      Object.values(parentMatch?.round_teams).some(
                        (parentTeam: BracketTeam | null): boolean =>
                          parentTeam ? parentTeam.id === team?.id : false,
                      ),
                  )

                  if (winnerTeamKey) {
                    match.round_teams[Number(winnerTeamKey[0])]!.isPicked = true
                  }
                }
                if (match.type === 'PLAY_OFF_STAGE_FINAL') {
                  const foundTeam: [string, BracketTeam | null] | undefined =
                    matchTeams.find(
                      ([_, team]: [string, BracketTeam | null]): boolean =>
                        team?.id === winner?.id,
                    )

                  if (foundTeam && foundTeam[1]) {
                    match.round_teams[Number(foundTeam[0])]!.isPicked = true
                  }
                }
                const onLeft: boolean =
                  stageIndex < (roundsArray.length - 1) / 2

                return (
                  <div
                    className={classNames(styles.matchContainer, {
                      [styles.left]:
                        match.type === stageRounds.PLAY_OFF_STAGE_1_2 && onLeft,
                      [styles.right]:
                        match.type === stageRounds.PLAY_OFF_STAGE_1_2 &&
                        !onLeft,
                    })}
                    key={matchIndex}
                  >
                    <MatchLayout
                      key={matchIndex}
                      match={match}
                      matchIndex={matchIndex}
                      onLeft={onLeft}
                      winner={winner}
                      makePick={pageType === bracketTreePageType.make_pick}
                      changeTeam={changeTeam}
                      error={error}
                      submitPicks={submitPicks}
                      isDeadline={isDeadline}
                      isLoading={isLoading}
                      resultMode={pageType === 'result'}
                      currentEntry={currentEntry}
                      tiebreakerScore={tiebreakerScore}
                      setTiebreakerScore={setTiebreakerScore}
                    />
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Team = ({
  team,
  match,
  changeTeam,
  top,
  bottom,
  error,
}: {
  team: BracketTeam | null
  match: BracketStage
  changeTeam: (team: BracketTeam | null, match: BracketStage) => void
  top?: boolean
  bottom?: boolean
  error?: string
}): ReactElement => {
  if (!team)
    return (
      <div
        className={classNames([styles.teamLayout, styles.withoutTeam], {
          [styles.top]: top,
          [styles.bottom]: bottom,
          [styles.error]: error,
        })}
      >
        <div className={styles.emptyLogoTeam}></div>
      </div>
    )

  const teamName: string = team.name.slice(0, team.name.lastIndexOf(' '))

  const imagePath: string = generateParticipantImagePath(team.external_id)

  return (
    <div
      className={classNames(styles.teamLayout, {
        [styles.top]: top,
        [styles.bottom]: bottom,
        [styles.picked]: team.isPicked,
        [styles.winEntry]: team?.status === 'win',
        [styles.loseEntry]: team?.status === 'lose',
      })}
      onClick={() => !team.isPicked && changeTeam(team, match)}
    >
      <div className={styles.teamSeed}>{team.seed}</div>
      <span className={styles.teamName}>{teamName}</span>
      <div className={styles.logoTeamWrap}>
        <Image alt={teamName} src={imagePath} width={25} height={25} />
      </div>
    </div>
  )
}

const MatchLayout = ({
  match,
  matchIndex,
  onLeft,
  winner,
  makePick,
  changeTeam,
  error,
  submitPicks,
  isDeadline,
  isLoading,
  tiebreakerScore,
  setTiebreakerScore,
  currentEntry,
  resultMode,
}: {
  match: BracketStage
  matchIndex: number
  onLeft: boolean
  winner: BracketTeam | null
  makePick: boolean
  changeTeam: (team: BracketTeam | null, match: BracketStage) => void
  error: string
  submitPicks: () => void
  isDeadline?: boolean
  isLoading: boolean
  tiebreakerScore: string
  currentEntry?: BracketPlayoffEntryItem | null
  setTiebreakerScore: Dispatch<SetStateAction<string>>
  resultMode: boolean
}): ReactElement => {
  const currentMatchEntryIndex = currentEntry?.bracket_forecasts.findIndex(
    (forecast) => forecast.pool_type_bracket_id === match.stage_id,
  )

  if (currentMatchEntryIndex && resultMode) {
    const teamKey = Object.entries(match.round_teams).find(
      ([_, team]) =>
        team?.id ===
        currentEntry?.bracket_forecasts[currentMatchEntryIndex].participant_id,
    )

    if (teamKey) {
      match.round_teams[Number(teamKey[0])]!.status =
        currentEntry?.bracket_forecasts[currentMatchEntryIndex].status
    }
  }

  switch (match.type) {
    case stageRounds.PLAY_OFF_STAGE_1_4:
      return (
        <Stage4Match
          match={match}
          matchIndex={matchIndex}
          onLeft={onLeft}
          changeTeam={changeTeam}
          error={error}
        />
      )
    case stageRounds.PLAY_OFF_STAGE_1_2:
      return (
        <Stage2Match
          match={match}
          matchIndex={matchIndex}
          onLeft={onLeft}
          changeTeam={changeTeam}
          error={error}
        />
      )
    case stageRounds.PLAY_OFF_STAGE_FINAL:
      return (
        <FinalsMatch
          match={match}
          matchIndex={matchIndex}
          winner={winner}
          makePick={makePick}
          submitPicks={submitPicks}
          isDeadline={isDeadline}
          isLoading={isLoading}
          tiebreakerScore={tiebreakerScore}
          setTiebreakerScore={setTiebreakerScore}
          changeTeam={changeTeam}
          error={error}
        />
      )
    default:
      return (
        <Match
          match={match}
          matchIndex={matchIndex}
          changeTeam={changeTeam}
          error={error}
        />
      )
  }
}

const Match = ({
  matchIndex,
  match,
  changeTeam,
  error,
}: {
  matchIndex: number
  match: BracketStage
  changeTeam: (team: BracketTeam | null, match: BracketStage) => void
  error: string
}) => {
  return (
    <div key={matchIndex} className={styles.matchLayout}>
      {Object.values(match.round_teams).map(
        (team: BracketTeam | null, teamIndex: number) => {
          return (
            <Fragment key={teamIndex}>
              {matchIndex === 0 && (
                <div className={styles.matchTitle}>{match.title}</div>
              )}
              <Team
                team={team}
                match={match}
                changeTeam={changeTeam}
                top={teamIndex % 2 === 0}
                bottom={teamIndex % 2 === 1}
                error={error}
              />
            </Fragment>
          )
        },
      )}
    </div>
  )
}

const Stage4Match = ({
  matchIndex,
  match,
  onLeft,
  changeTeam,
  error,
}: {
  matchIndex: number
  match: BracketStage
  onLeft?: boolean
  changeTeam: (team: BracketTeam | null, match: BracketStage) => void
  error: string
}) => {
  return (
    <>
      {onLeft && (
        <div
          className={classNames(
            styles.arrowContainer,
            styles.stage4,
            styles.left,
          )}
        >
          <BracketArrowRight />
        </div>
      )}
      <Match
        match={match}
        matchIndex={matchIndex}
        changeTeam={changeTeam}
        error={error}
      />
      {!onLeft && (
        <div
          className={classNames(
            styles.arrowContainer,
            styles.stage4,
            styles.right,
          )}
        >
          <BracketArrowLeft />
        </div>
      )}
    </>
  )
}

const Stage2Match = ({
  matchIndex,
  match,
  onLeft,
  changeTeam,
  error,
}: {
  matchIndex: number
  match: BracketStage
  onLeft?: boolean
  changeTeam: (team: BracketTeam | null, match: BracketStage) => void
  error: string
}) => {
  return (
    <div className={styles.stage2Match}>
      <div
        className={classNames(
          styles.arrowContainer,
          styles.stage2,
          styles.top,
          {
            [styles.right]: !onLeft,
          },
        )}
      >
        {onLeft ? (
          <BracketArrowConfFinalsTopLeft />
        ) : (
          <BracketArrowConfFinalsTopRight />
        )}
      </div>
      <Match
        match={match}
        matchIndex={matchIndex}
        changeTeam={changeTeam}
        error={error}
      />
      <div
        className={classNames(
          styles.arrowContainer,
          styles.stage2,
          styles.bottom,
          {
            [styles.right]: !onLeft,
          },
        )}
      >
        {onLeft ? (
          <BracketArrowConfFinalsBottomLeft />
        ) : (
          <BracketArrowConfFinalsBottomRight />
        )}
      </div>
    </div>
  )
}

const FinalsMatch = ({
  match,
  matchIndex,
  winner,
  makePick,
  submitPicks,
  isDeadline,
  isLoading,
  tiebreakerScore,
  setTiebreakerScore,
  changeTeam,
  error,
}: {
  match: BracketStage
  matchIndex: number
  winner: BracketTeam | null
  makePick: boolean
  submitPicks: () => void
  isDeadline?: boolean
  isLoading: boolean
  tiebreakerScore: string
  setTiebreakerScore: Dispatch<SetStateAction<string>>
  changeTeam: (team: BracketTeam | null, match: BracketStage) => void
  error: string
}) => {
  return (
    <>
      <div
        className={classNames(styles.arrowContainer, styles.final, styles.left)}
      >
        <BracketFinalsArrowFromSemiFinals />
      </div>
      <Match
        match={match}
        matchIndex={matchIndex}
        changeTeam={changeTeam}
        error={error}
      />
      <div
        className={classNames(
          styles.arrowContainer,
          styles.final,
          styles.center,
        )}
      >
        <BracketFinalsLine />
      </div>
      <div
        className={classNames(
          styles.arrowContainer,
          styles.final,
          styles.right,
        )}
      >
        <BracketFinalsArrowFromSemiFinals />
      </div>

      <div className={styles.resultContainer}>
        <ChampionTeamContainer winner={winner} />
        {makePick && (
          <SubmitForm
            submitPicks={submitPicks}
            isDisabled={isDeadline}
            setTiebreakerScore={setTiebreakerScore}
            tiebreakerScore={tiebreakerScore}
            isLoading={isLoading}
          />
        )}
      </div>
    </>
  )
}

const ChampionTeamContainer = ({ winner }: { winner: BracketTeam | null }) => {
  if (!winner) {
    return (
      <div
        className={classNames([styles.championContainer, styles.withoutWinner])}
      >
        <p className={styles.label}>Champion</p>
        <div className={styles.emptyLogo}></div>
      </div>
    )
  }

  const teamName: string = winner.name.slice(0, winner.name.lastIndexOf(' '))

  const imagePath: string = generateParticipantImagePath(winner.external_id)

  return (
    <div className={styles.championContainer}>
      <div className={styles.info}>
        <p className={styles.label}>Champion</p>
        <p className={styles.name}>{teamName}</p>
      </div>
      <Image alt={teamName} src={imagePath} width={55} height={55} />
    </div>
  )
}

const SubmitForm = ({
  submitPicks,
  isDisabled,
  tiebreakerScore,
  setTiebreakerScore,
  isLoading,
}: {
  submitPicks: () => void
  isDisabled?: boolean
  tiebreakerScore: string
  setTiebreakerScore: Dispatch<SetStateAction<string>>
  isLoading: boolean
}) => {
  return (
    <>
      <div className={styles.tiebreakForm}>
        <div className={styles.text}>
          <b>Tiebreak</b>
          <span>(SB Total):</span>
        </div>
        <Input
          type="number"
          onChange={(value) => setTiebreakerScore(value)}
          value={tiebreakerScore}
          small
        />
      </div>
      <button
        className={classNames('button button-blue-light', styles.submitButton)}
        onClick={submitPicks}
        disabled={isLoading || isDisabled}
        type="submit"
      >
        Submit picks
      </button>
    </>
  )
}
