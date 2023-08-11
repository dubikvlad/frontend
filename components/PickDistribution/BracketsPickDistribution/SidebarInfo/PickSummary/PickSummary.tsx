import classNames from 'classnames'
import Image from 'next/image'

import { PickSummaryGroup } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { generateParticipantImagePath } from '@/config/constants'

import { EntriesList } from './EntriesList'
import styles from './PickSummary.module.scss'

export function PickSummary({
  group,
  title,
}: {
  group?: PickSummaryGroup
  title?: string
}) {
  if (!group) return null

  const [first, second] = group.participants
  const totalPicks = first.entries.length + second.entries.length

  return (
    <div>
      {title && <p className={styles.title}>{title}</p>}
      <p className={styles.teams}>
        <span className={styles.team}>{first.name.split(' ').at(-1)}</span>
        <span>vs</span>
        <span className={styles.team}>{second.name.split(' ').at(-1)}</span>
      </p>

      <div className={styles.percents}>
        {group.participants.map((part, i) => {
          const data = (part.entries.length / totalPicks) * 100

          const isCrossing = data >= 46 && data <= 54
          const isReversing =
            (i !== 0 && data >= 50 && data <= 54) ||
            (i == 0 && data < 50 && data >= 46)

          let percents = 0

          if ((data + '').split('.')[1]?.[0] === '5') {
            if (i === 0) {
              percents = Math.round(data)
            } else {
              percents = Math.floor(data)
            }
          } else {
            percents = Math.round(data)
          }

          return (
            <div key={i}>
              <div className={styles.percentStatus}>
                <div className={styles.scaleWrapper}>
                  <div
                    className={styles.scale}
                    style={{ height: `${percents}%` }}
                  >
                    <p
                      className={classNames(styles.scaleData, {
                        [styles.top]: percents < 15,
                      })}
                    >
                      {part.entries.length}
                    </p>
                  </div>
                </div>

                <span
                  className={classNames(
                    styles.string,
                    { [styles.isCrossing]: isCrossing },
                    {
                      [styles.right]: i == 1,
                    },
                    { [styles.reverse]: isReversing },
                  )}
                  style={{ bottom: `calc(${percents}% - 10px)` }}
                >
                  {percents !== 50 && `${percents} %`}
                </span>

                <span className={classNames(styles.string, styles.centered)}>
                  {percents === 50 && i === 0 && `${percents} %`}
                </span>

                <div
                  className={classNames(styles.percentsStatus, {
                    [styles.right]: i == 1,
                  })}
                  style={{ bottom: `calc(${percents}% - 10px)` }}
                >
                  {i == 0 && (
                    <div className={styles.iconWrapper}>
                      <MonthLeftArrow className={styles.icon} height={9} />
                    </div>
                  )}

                  {i == 1 && (
                    <div className={styles.iconWrapper}>
                      <MonthRightArrow className={styles.icon} height={9} />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.logo}>
                <Image
                  src={generateParticipantImagePath(part.external_id)}
                  width={50}
                  height={50}
                  alt={part.name}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.entries}>
        <p className={styles.entriesTitle}>Entries who picked</p>
        <div className={styles.entriesCols}>
          {group.participants.map((part, i) => {
            return <EntriesList key={i} participant={part} />
          })}
        </div>
      </div>
    </div>
  )
}
