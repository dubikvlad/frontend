import classNames from 'classnames'
import { Dispatch, SetStateAction } from 'react'

import { BracketStage, PickSummaryGroup } from '@/api'
import {
  BracketFinalTwoLineHorizontal,
  BracketSemiTwoLeftLine,
  BracketSemiTwoRightLine,
  BracketQuarterTwoLeftLine,
} from '@/assets/icons'
import { stageRounds } from '@/config/constants'

import { Game } from './Game'
import styles from './GameWrapper.module.scss'

type GameWrapperT = {
  matchIndex: number
  stage: BracketStage[]
  pickSummaryGroups: PickSummaryGroup[] | null | undefined
  match: BracketStage
  groupId: number
  setGroupId: Dispatch<SetStateAction<number>>
  setTitle: Dispatch<SetStateAction<string>>
}

export function GameWrapper({
  matchIndex,
  stage,
  pickSummaryGroups,
  match,
  groupId,
  setGroupId,
  setTitle,
}: GameWrapperT) {
  const isLeft = matchIndex + 1 <= stage.length / 2
  const isRight = matchIndex >= stage.length / 2
  const lastInFirstGroup = matchIndex + 1 === Math.round(stage.length / 2)
  const isActive = pickSummaryGroups?.find((item) => item.id === match.stage_id)
    ? true
    : false

  const style = match.color ? { background: match.color } : {}

  const is4stage = match.type === stageRounds.PLAY_OFF_STAGE_1_4
  const is2stage = match.type === stageRounds.PLAY_OFF_STAGE_1_2
  const isfinals = match.type === stageRounds.PLAY_OFF_STAGE_FINAL

  const isFirstItem = matchIndex == 0
  const isLastItem = matchIndex == stage.length - 1

  return (
    <div
      className={classNames(styles.gameWrapper, {
        [styles.selected]: match.stage_id == groupId,
        [styles.active]: isActive,
        [styles.shadow]: groupId,

        [styles.lefty]: isLeft,
        [styles.right]: isRight,

        [styles.is4stage]: is4stage,
        [styles.is2stage]: is2stage,
        [styles.isfinals]: isfinals,
        [styles.last]: lastInFirstGroup,
      })}
      onClick={() =>
        isActive && (setGroupId(match.stage_id), setTitle(match.title))
      }
    >
      <Vectors
        isfinals={isfinals}
        is4stage={is4stage}
        is2stage={is2stage}
        isLeft={isLeft}
        isRight={isRight}
        isFirstItem={isFirstItem}
        isLastItem={isLastItem}
      />
      <Game
        game={match}
        is4stage={is4stage}
      />
      <div className={classNames(styles.gameTitle)} style={style}>
        {match.title}
      </div>
      <div className={styles.bottomLine} style={style}></div>
    </div>
  )
}

type VectorsT = {
  is4stage: boolean
  is2stage: boolean
  isfinals: boolean
  isLeft: boolean
  isRight: boolean
  isFirstItem: boolean
  isLastItem: boolean
}

function Vectors({
  is4stage,
  is2stage,
  isfinals,
  isLeft,
  isRight,
  isFirstItem,
  isLastItem,
}: VectorsT) {
  return (
    <>
      {isfinals && (
        <BracketFinalTwoLineHorizontal
          className={classNames(styles.vector, { [styles.finals]: isfinals })}
        />
      )}
      {is2stage &&
        (isLeft ? (
          <BracketSemiTwoLeftLine
            className={classNames(styles.vector, {
              [styles.is2stageleft]: is2stage && isLeft,
            })}
          />
        ) : (
          isRight && (
            <BracketSemiTwoRightLine
              className={classNames(styles.vector, {
                [styles.is2stageright]: is2stage && isRight,
              })}
            />
          )
        ))}

      {is4stage && isLeft && isFirstItem && (
        <BracketQuarterTwoLeftLine
          className={classNames(styles.vector, {
            [styles.is4stageleft]: is4stage && isLeft,
          })}
        />
      )}

      {is4stage && isRight && isLastItem && (
        <BracketQuarterTwoLeftLine
          className={classNames(styles.vector, {
            [styles.is4stageright]: is4stage && isRight,
          })}
        />
      )}
    </>
  )
}
