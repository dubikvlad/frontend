import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

import {
  GolfGridSeries,
  GolfGridSingleGame,
  SquareSeriesOfGames,
  SquareSingleGame,
} from '@/assets/icons'
import { routes } from '@/config/constants'
import { useGrids, usePool } from '@/helpers'

import styles from './GridGettingStartedPage.module.scss'

export function GridGettingStartedPage({ poolId }: { poolId: number }) {
  const { push } = useRouter()

  const { poolData, poolIsLoading } = usePool(poolId)
  const { gridsData, gridsIsLoading } = useGrids({ poolId: poolData?.id })

  useEffect(() => {
    if (!poolIsLoading) {
      if (poolData?.type !== 'squares' && poolData?.type !== 'golf_squares') {
        push(routes.account.overview(poolId))
      }
    }
  }, [poolData, poolIsLoading, poolId, push])

  useEffect(() => {
    if (!gridsIsLoading && gridsData.length) {
      push(routes.account.overview(poolId))
    }
  }, [gridsData, gridsIsLoading, push, poolId])

  const [singleGameImage, seriesGameImage] = useMemo(() => {
    if (poolData?.type === 'squares')
      return [
        <SquareSingleGame key="single" />,
        <SquareSeriesOfGames key="series" />,
      ]

    return [
      <GolfGridSingleGame key="single" />,
      <GolfGridSeries key="series" />,
    ]
  }, [poolData?.type])

  return (
    <div className={styles.wrapper}>
      <h1>Getting Started</h1>

      <div className={styles.description}>
        <p>
          Thanks for starting your NFL Squares Pool. A couple important notes
          before you get started:
        </p>

        <ul>
          <li>
            You can start as many grids as you want in this pool. Please do NOT
            start a new pool for each new grid you want. You should use this
            pool for all of them.
          </li>
          <li>
            You can create all your grids ahead of time or add new grids as your
            grids fill up. You will have the option to copy picked squares from
            one grid to another.
          </li>
          <li>
            When you are ready, you can generate your grid numbers under the
            Grid Settings, or else they will be generated automatically when the
            assigned game starts.
          </li>
        </ul>
      </div>

      <div className={styles.gamesWrapper}>
        <div className={styles.gameItem}>
          {singleGameImage}

          <div>
            <p className={styles.title}>SINGLE GAME</p>
            <p>
              Choose this option if you want to start by assigning a grid to a
              single NFL game.
            </p>
            <p className={styles.smallText}>
              You can always add additional games and grids later
            </p>
            <Link
              href={routes.account.grid.add(poolId, { gridType: 'single' })}
            >
              <button className="button button-blue-light">
                Start with a Single Game
              </button>
            </Link>
          </div>
        </div>

        <div className={styles.gameItem}>
          {seriesGameImage}

          <div>
            <p className={styles.title}>SERIES OF GAMES</p>
            <p>
              Choose this option if you want to create a grid for each game in a
              series
            </p>
            <p className={styles.smallText}>
              For example, you want to use every Monday Night Football game or
              every Green Bay Packers game.
            </p>
            <Link
              href={routes.account.grid.add(poolId, { gridType: 'series' })}
            >
              <button className="button button-blue-light">
                Start a Game Series
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
