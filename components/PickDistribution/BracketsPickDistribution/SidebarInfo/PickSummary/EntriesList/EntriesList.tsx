import classNames from 'classnames'
import { useState } from 'react'

import { PickSummaryParticipant } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './EntriesList.module.scss'

export function EntriesList({
  participant,
}: {
  participant: PickSummaryParticipant
}) {

  const [indexPage, setIndexPage] = useState(1)
  const maxLength = Math.ceil(participant.entries.length / 10)


  return (
    <div className={styles.entryCol}>
      <div>
        <p className={styles.colTitle}>{participant.name.split(' ').at(-1)}</p>
        <div className={styles.entriesList}>
          {participant.entries.map((entry, i) => {
            if (i < indexPage * 10 && i >= (indexPage - 1) * 10)
              return (
                <span key={i} className={styles.entryItem}>
                  {entry.name}
                </span>
              )
          })}
        </div>
      </div>
      <div
        className={classNames(styles.arrows, {
          [styles.hidden]: maxLength < 2,
        })}
      >
        <div onClick={() => indexPage > 1 && setIndexPage((prev) => prev - 1)}>
          <MonthLeftArrow
            className={classNames(styles.arrow, {
              [styles.disabled]: indexPage == 1,
            })}
          />
        </div>
        <div
          onClick={() =>
            indexPage < maxLength && setIndexPage((prev) => prev + 1)
          }
        >
          <MonthRightArrow className={styles.arrow} />
        </div>
      </div>
    </div>
  )
}
