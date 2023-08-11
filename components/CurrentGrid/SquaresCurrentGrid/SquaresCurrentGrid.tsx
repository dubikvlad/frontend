import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { GridItem, Pool } from '@/api'
import { routes } from '@/config/constants'
import { Select2 } from '@/features/ui'
import { useGrids } from '@/helpers'

import styles from './SquaresCurrentGrid.module.scss'

const SquaresMakePickMainComponentLazy = dynamic(
  () =>
    import('@/features/components/SquaresMakePickMainComponent').then(
      (mod) => mod.SquaresMakePickMainComponent,
    ),
  { loading: () => <p>Loading...</p> },
)

export function SquaresCurrentGrid({
  poolData,
}: {
  poolData: Pool<'squares'>
}) {
  const { gridsData, gridsIsLoading } = useGrids({
    poolId: poolData.id,
  })

  // список гридов текущей недели
  const [currentGrids, setCurrentGrids] = useState<GridItem[]>([])

  useEffect(() => {
    if (poolData) {
      setCurrentGrids(
        gridsData.filter(
          (grid) => grid.week === poolData.pick_pool.current_week,
        ),
      )
    }
  }, [poolData, gridsData])

  const currentGridsOptions = currentGrids.map((item) => ({
    title: item.gridName,
    name: String(item.id),
  }))

  const [currentGridId, setCurrentGridId] = useState<number | null>(null)

  useEffect(() => {
    if (currentGrids.length) setCurrentGridId(currentGrids[0].id)
  }, [currentGrids])

  // если гридов больше одного, то вернется undefined,
  // если грид только один, то он и вернется
  const currentGrid = !!currentGrids.length
    ? currentGrids.length > 1
      ? undefined
      : currentGrids[0]
    : undefined

  if (!poolData) return null

  // если не создано ни одного грида
  const isNotGrids = !gridsData.length && !!poolData

  return (
    <div className={styles.wrapper}>
      {!gridsIsLoading &&
        (isNotGrids ? (
          <div className={styles.notGridsWrapper}>
            <p>
              You haven&apos;t created any grids yet.{' '}
              <Link href={routes.account.createGrid(poolData.id)}>
                Click here
              </Link>{' '}
              to create your first grid
            </p>
          </div>
        ) : !currentGrids.length ? (
          <div className={styles.notCurrentGridsWrapper}>
            <p>
              You do not have a current grid this week. You can find available
              grids on the{' '}
              <Link href={routes.account.gridControl(poolData.id)}>
                All Grids page
              </Link>{' '}
              or{' '}
              <Link href={routes.account.createGrid(poolData.id)}>
                Create a new grid
              </Link>
            </p>
          </div>
        ) : (
          <>
            {!currentGrid && !!currentGridsOptions.length && (
              <div className={styles.selectWrapper}>
                <Select2
                  value={String(currentGridId)}
                  onChange={(value) => setCurrentGridId(Number(value))}
                  options={currentGridsOptions}
                  customTitle={(option) => {
                    const grid = currentGrids.find(
                      (item) => item.id === Number(option.name),
                    )

                    if (!grid) return option.title

                    return (
                      <p className={styles.selectTitle}>
                        {grid.gridName}{' '}
                        <span>
                          (
                          {grid.participants.reduce(
                            (acc, item, i) =>
                              i === 0 ? item.name : (acc += ` @ ${item.name}`),
                            '',
                          )}
                          )
                        </span>
                      </p>
                    )
                  }}
                />
              </div>
            )}

            <SquaresMakePickMainComponentLazy customGridId={currentGridId} />
          </>
        ))}
    </div>
  )
}
