import classNames from 'classnames'
import Image from 'next/image'

import { BracketTeam } from '@/api'
import { QuestionMark } from '@/assets/icons'
import { generateParticipantImagePath } from '@/config/constants'

import styles from './Game.module.scss'

type GameT = {
  team: BracketTeam | null
  index: number
}

export function Game({ team, index }: GameT) {
  return (
    <div className={styles.game}>
      {team ? (
        <>
          <Image
            src={generateParticipantImagePath(team.external_id)}
            width={50}
            height={50}
            alt="teamLogo"
          />
          <p className={styles.teamName}>{team.name.split(' ').at(-1)}</p>
          <p className={styles.seed}>{team.seed}</p>
        </>
      ) : (
        <>
          <div className={styles.emptyLogo}>
            <QuestionMark />
          </div>
          <p className={classNames(styles.teamName, styles.gray)}>
            Q{index + 1} Winner
          </p>
        </>
      )}
    </div>
  )
}
