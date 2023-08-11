import classNames from 'classnames'
import Image from 'next/image'
import { Fragment } from 'react'

import { Participant, PoolTypes } from '@/api/api-types'
import { generateParticipantImagePath, poolTypes } from '@/config/constants'

import styles from './ScheduleTeamItem.module.scss'

export function ScheduleTeamItem({
  time,
  teams,
  poolType,
}: {
  time: string
  teams: Participant[]
  poolType: PoolTypes | undefined
}) {
  return (
    <div
      className={classNames(styles.row, {
        [styles.borderLeft]: poolType === poolTypes.bracket,
      })}
    >
      <div className={styles.time}>
        {new Date(time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
      <div className={styles.teamsWrapper}>
        <div className={styles.teams}>
          {teams.map((item, i) => {
            const fullName = [item?.city, item?.name]?.join(' ').trim()

            return (
              <Fragment key={i}>
                <div className={styles.team}>
                  <span>{item?.short_name || fullName}</span>
                  <Image
                    src={generateParticipantImagePath(item.external_id)}
                    alt={item?.short_name ?? fullName}
                    width={64}
                    height={64}
                    className={styles.img}
                  />
                </div>
                {i === 0 && <div className={styles.separator}>@</div>}
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
