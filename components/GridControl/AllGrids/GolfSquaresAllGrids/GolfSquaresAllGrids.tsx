import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { Pool } from '@/api'
import { dateFormattingHistory, routes } from '@/config/constants'
import { useGrids } from '@/helpers'

import styles from './GolfSquaresAllGrids.module.scss'

export function GolfSquaresAllGrids({
  poolData,
}: {
  poolData: Pool<'golf_squares'>
}) {
  const { push } = useRouter()

  const poolId = poolData.id

  const { gridsData, gridsIsLoading } = useGrids<'golf_squares'>({
    poolId: Number(poolId),
  })

  useEffect(() => {
    if (!gridsIsLoading && !gridsData.length && poolId) {
      push(routes.account.grid.gettingStarted(Number(poolId)))
    }
  }, [gridsIsLoading, gridsData, push, poolId])

  if (!poolData) return <></>

  return (
    <div className={styles.container}>
      <div className={styles.table}>
        <div className={styles.head}>
          <div className={styles.row}>
            <div>Grid Name</div>
            <div>Tournament</div>
            <div>Date</div>
            <div>Squares Picked</div>
            <div>Squares Available</div>
          </div>
        </div>
        <div className={styles.body}>
          {!!gridsData.length &&
            gridsData.map((grid, i) => {
              return (
                <div className={styles.row} key={i}>
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
