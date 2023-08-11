import classNames from 'classnames'
import Image from 'next/image'
import React, { Fragment, memo } from 'react'

import { BracketRounds, BracketStage, BracketTeam } from '@/api'
import {
  BracketActualFinalTwoLine,
  BracketActualQuarterLine,
  BracketActualSemiTwoTopLine,
  BracketActualSemiTwoBottomLine,
  Question,
} from '@/assets/icons'
import { generateParticipantImagePath, stageRounds } from '@/config/constants'

import styles from './ActualBracketTreeNFL.module.scss'

type BracketTournamentTreeNFLProps = {
  roundsData: BracketRounds | undefined
}

export default memo(function ActualBracketTreeNFL({
  roundsData: rounds,
}: BracketTournamentTreeNFLProps) {
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
                    stage[0].type === stageRounds.PLAY_OFF_STAGE_1_2,
                  [styles.stage4]:
                    stage[0].type === stageRounds.PLAY_OFF_STAGE_1_4,
                  [styles.stage8]:
                    stage[0].type === stageRounds.PLAY_OFF_STAGE_1_8,
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
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
})

const MatchLayout = ({
  match,
  matchCountInStage,
  matchIndex,
  isTop,
}: {
  match: BracketStage
  matchCountInStage: number
  matchIndex: number
  isTop: boolean
}) => {
  switch (match.type) {
    case stageRounds.PLAY_OFF_STAGE_1_4:
      return (
        <Stage4Match
          match={match}
          key={matchIndex}
          matchCountInStage={matchCountInStage}
          isTop={isTop}
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
      return <FinalsMatch match={match} matchCountInStage={matchCountInStage} />
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
}: {
  match: BracketStage
  matchCountInStage: number
}) => {
  return (
    <>
      <div className={classNames(styles.lineWrap, styles.final)}>
        <BracketActualFinalTwoLine />
      </div>
      <Match match={match} matchCountInStage={matchCountInStage} />
    </>
  )
}

const Stage4Match = ({
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
          className={classNames(styles.lineWrap, styles.stage4, {
            [styles.quarterTopLine]: isTop,
          })}
        >
          <BracketActualQuarterLine />
        </div>
      )}
      <Match
        match={match}
        matchCountInStage={matchCountInStage}
        isTop={isTop}
      />
      {!isTop && (
        <div
          className={classNames(styles.lineWrap, styles.stage4, {
            [styles.quarterBottomLine]: !isTop,
          })}
        >
          <BracketActualQuarterLine />
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
          <BracketActualSemiTwoTopLine />
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
          <BracketActualSemiTwoBottomLine />
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
