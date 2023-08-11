import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { Pool } from '@/api'
import {
  dateFormattingHistory,
  generateParticipantImagePath,
  routes,
} from '@/config/constants'
import { useGrids } from '@/helpers'

import styles from './SquaresAllGrids.module.scss'

export function SquaresAllGrids({ poolData }: { poolData: Pool<'squares'> }) {
  const { push } = useRouter()

  const poolId = poolData.id

  const { gridsData, gridsIsLoading } = useGrids({
    poolId: Number(poolId),
  })

  const isGolf = poolData?.type === 'golf_squares'

  useEffect(() => {
    if (!gridsIsLoading && !gridsData.length && poolId) {
      push(routes.account.grid.gettingStarted(Number(poolId)))
    }
  }, [gridsIsLoading, gridsData, push, poolId])

  if (!poolData) return <></>

  return (
    <div className={styles.wrapper}>
      <div className={styles.table}>
        <div className={styles.head}>
          {isGolf ? (
            <div className={classNames(styles.row, { [styles.golf]: isGolf })}>
              <div>Grid Name</div>
              <div>Tournament</div>
              <div>Date</div>
              <div>Squares Picked</div>
              <div>Squares Available</div>
            </div>
          ) : (
            <div className={styles.row}>
              <div>Grid Name</div>
              <div>Week</div>
              <div>Date</div>
              <div className={styles.headGame}>Game</div>
              <div>Picked / Available</div>
            </div>
          )}
        </div>
        <div className={styles.body}>
          {!!gridsData.length &&
            gridsData.map((grid, i) => {
              const leftParticipant = grid.participants[0]
              const rightParticipant = grid.participants[1]

              if (!leftParticipant || !rightParticipant) return null

              const leftParticipantImg = generateParticipantImagePath(
                leftParticipant.external_id,
              )
              const rightParticipantImg = generateParticipantImagePath(
                rightParticipant.external_id,
              )

              return isGolf ? (
                <div
                  className={classNames(styles.row, { [styles.golf]: isGolf })}
                  key={i}
                >
                  <div>{grid.gridName}</div>

                  <div>{grid.tournamentName}</div>

                  <div className={styles.date}>
                    {dateFormattingHistory({
                      withDayOfWeek: false,
                      text: grid.date,
                    })}
                  </div>

                  <div>{grid.forecastsCount}</div>

                  <div>{grid.available}</div>

                  <div className={styles.addData}>
                    <div className={styles.gridNumber}>Grid #{i + 1}</div>

                    {grid.gridType === 'Master' && (
                      <div className={styles.info}>Master Grid</div>
                    )}

                    {grid.gridType === 'Secondary' && (
                      <div
                        className={classNames(styles.info, styles.secondary)}
                      >
                        Secondary
                      </div>
                    )}

                    {'current_week' in poolData.pick_pool &&
                      grid.week === poolData.pick_pool.current_week && (
                        <div className={styles.info}>Current Grid</div>
                      )}
                  </div>

                  <Link
                    href={routes.account.makePick.index(Number(poolId), {
                      grid_id: grid.id,
                    })}
                    className={styles.link}
                  ></Link>
                </div>
              ) : (
                <div className={styles.row} key={i}>
                  <div className={styles.gridName}>{grid.gridName}</div>

                  <div>Week {grid.week}</div>

                  <div>
                    {dateFormattingHistory({
                      withDayOfWeek: false,
                      text: grid.date,
                    })}
                  </div>
                  <div className={styles.game}>
                    <div className={styles.leftParticipant}>
                      <p>{leftParticipant.name}</p>
                      {!!leftParticipantImg && (
                        <Image
                          src={leftParticipantImg}
                          width={40}
                          height={40}
                          alt={leftParticipant.name}
                        />
                      )}
                    </div>

                    <p>@</p>

                    <div className={styles.rightParticipant}>
                      {!!rightParticipantImg && (
                        <Image
                          src={rightParticipantImg}
                          width={40}
                          height={40}
                          alt={rightParticipant.name}
                        />
                      )}
                      <p>{rightParticipant.name}</p>
                    </div>
                  </div>

                  <div>
                    {grid.forecastsCount} / {grid.available}
                  </div>

                  <div className={styles.addData}>
                    <div className={styles.gridNumber}>Grid #{i + 1}</div>

                    {grid.gridType === 'Master' && (
                      <div className={styles.info}>Master Grid</div>
                    )}

                    {grid.gridType === 'Secondary' && (
                      <div
                        className={classNames(styles.info, styles.secondary)}
                      >
                        Secondary
                      </div>
                    )}

                    {'current_week' in poolData.pick_pool &&
                      grid.week === poolData.pick_pool.current_week && (
                        <div
                          className={classNames(styles.info, styles.current)}
                        >
                          Current Grid
                        </div>
                      )}
                  </div>

                  <Link
                    href={routes.account.makePick.index(Number(poolId), {
                      grid_id: grid.id,
                    })}
                    className={styles.link}
                  ></Link>
                </div>
              )
            })}
        </div>

        <Link
          href={routes.account.createGrid(Number(poolId))}
          className={styles.button}
        >
          + Add New Grid
        </Link>
      </div>
    </div>
  )
}
