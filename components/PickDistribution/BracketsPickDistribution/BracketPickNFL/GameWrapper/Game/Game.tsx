import classNames from 'classnames'
import Image from 'next/image'

import { BracketStage } from '@/api'
import { QuestionMark } from '@/assets/icons'
import { generateParticipantImagePath } from '@/config/constants'

import styles from './Game.module.scss'

type GameT = {
  game: BracketStage
  is4stage: boolean
}

export function Game({ game, is4stage }: GameT) {
  const [firstTeam, secondTeam] = Object.values(game.round_teams)

  function generateEmptyName(index: number) {
    if (is4stage) {
      if (firstTeam?.seed == 1) {
        return 'Winner 1'
      } else if (index == 1) {
        return 'Winner 2'
      } else return 'Winner 3'
    }

    if (!is4stage) {
      if (index == 1) {
        return 'Winner 1'
      } else return 'Winner 2'
    }
  }

  return (
    <>
      <div className={styles.logos}>
        {Object.values(game.round_teams).map((participant, i) => {
          return (
            <div key={i} className={styles.imageWrapper}>
              {participant ? (
                <>
                  <Image
                    src={generateParticipantImagePath(participant.external_id)}
                    width={50}
                    height={50}
                    alt={participant.name}
                    className={styles.image}
                  />
                </>
              ) : (
                <>
                  <div className={styles.empty}>
                    <QuestionMark />
                  </div>
                </>
              )}
              <span className={styles.seed}>
                Seed {participant ? participant.seed : '?'}
              </span>
            </div>
          )
        })}
      </div>
      <p className={styles.teams}>
        <span
          className={classNames({
            [styles.grey]: !firstTeam?.name,
          })}
        >
          {firstTeam && firstTeam.name
            ? firstTeam.name.split(' ').at(-1)
            : generateEmptyName(1)}{' '}
        </span>
        <span
          className={classNames({
            [styles.grey]: !secondTeam?.name && !firstTeam?.name,
          })}
        >
          vs{' '}
        </span>
        <span
          className={classNames({
            [styles.grey]: !secondTeam?.name,
          })}
        >
          {secondTeam && secondTeam.name
            ? secondTeam.name.split(' ').at(-1)
            : generateEmptyName(2)}
        </span>
      </p>
      {/* <TeamNames teams={teams} is4stage={is4stage}/> */}
    </>
  )
}
