import classNames from 'classnames'
import { Dispatch, SetStateAction } from 'react'

import { GolfMajorsEntriesItem, GolfPickXEntriesItem, Pool } from '@/api'
import { Info } from '@/assets/icons'
import { dateFormattingDeadline } from '@/config/constants'

import styles from './GolfEntriesCreateBlock.module.scss'

type GolfEntriesCreateBlockProps = {
  poolEntriesData: (GolfPickXEntriesItem | GolfMajorsEntriesItem)[]
  poolData: Pool<'golf_pick_x' | 'golf_majors'>
  poolEntriesIsLoading: boolean
  isCreateEntryShow: boolean
  setIsCreateEntryShow: Dispatch<
    SetStateAction<GolfEntriesCreateBlockProps['isCreateEntryShow']>
  >
}

export function GolfEntriesCreateBlock({
  poolEntriesData,
  poolData,
  poolEntriesIsLoading,
  isCreateEntryShow,
  setIsCreateEntryShow,
}: GolfEntriesCreateBlockProps) {
  const isGolfPickXOncePerSeason =
    poolData.type === 'golf_pick_x' &&
    (poolData as Pool<'golf_pick_x'>).pick_pool.pick_frequency ===
      'once_per_season'

  if (!poolEntriesData.length) return null

  const tournamentDeadlineText =
    Date.now() >
    new Date(poolData.pick_pool.next_golf_tournament.start_date).getTime()
      ? 'This is the last tournament in this pool'
      : dateFormattingDeadline(
          poolData.pick_pool.next_golf_tournament.start_date,
        )

  return (
    <div className={styles.head}>
      <p>My {poolEntriesData.length} Entries</p>

      <div className={styles.tournament}>
        <div className={styles.tournamentTitleWrapper}>
          <p className={styles.tournamentTitle}>
            {poolData.pick_pool.next_golf_tournament.name}
          </p>

          {!!isGolfPickXOncePerSeason && (
            <div className={styles.infoIconWrapper}>
              <Info className={styles.infoIcon} />

              <div className={styles.tooltipWrapper}>
                <p>
                  Your pool settings mean that <span>you can pick</span> all
                  tournaments <span>only before</span> the first one starts.
                </p>
                <p>
                  There is no option to pick <span>after the deadline</span>.
                  Contact the commissioner if you have any questions.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className={styles.tournamentDeadline}>{tournamentDeadlineText}</p>
      </div>

      <div>
        <button
          className={classNames('button', 'button-blue-outline', {
            disabled: poolEntriesIsLoading,
            [styles.createEntryButtonHide]: isCreateEntryShow,
          })}
          onClick={() => setIsCreateEntryShow(true)}
        >
          Create a New Entry
        </button>
      </div>
    </div>
  )
}
