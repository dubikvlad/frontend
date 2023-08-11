import classNames from 'classnames'

import { GolfPickXEntriesItem, Pool } from '@/api'

import styles from './PickXEntriesTable.module.scss'
import { PickXEntriesTableRow } from './PickXEntriesTableRow'

export function PickXEntriesTable({
  poolEntriesData,
  poolData,
}: {
  poolEntriesData: GolfPickXEntriesItem[]
  poolData: Pool<'golf_pick_x'>
}) {
  return (
    <>
      {!!poolEntriesData.length ? (
        <div className={styles.wrapper}>
          <div className={styles.row}>
            <div className={styles.entryName}>
              <div className="short-name-block" />
              <p className={styles.lower}>Entry Name</p>
            </div>
            <div className={classNames(styles.cards, styles.lower)}>
              Your Roster
            </div>
            <div className={classNames(styles.lower, styles.year)}>
              Year-To-Date
            </div>
          </div>
          {poolEntriesData.map((entry, i) => {
            return (
              <PickXEntriesTableRow entry={entry} poolData={poolData} key={i} />
            )
          })}
        </div>
      ) : (
        <div className={styles.nodata}>
          Unfortunately, there are no entries in this pool. Try to create a new
          entry
        </div>
      )}
    </>
  )
}
