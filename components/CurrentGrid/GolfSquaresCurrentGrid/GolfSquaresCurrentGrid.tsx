import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { Pool } from '@/api'
import { routes } from '@/config/constants'
import { Select2 } from '@/features/ui'
import { useGrids } from '@/helpers'

import styles from './GolfSquaresCurrentGrid.module.scss'

const SquaresMakePickMainComponentLazy = dynamic(
  () =>
    import('@/features/components/SquaresMakePickMainComponent').then(
      (mod) => mod.SquaresMakePickMainComponent,
    ),
  { loading: () => <p>Loading...</p> },
)

export function GolfSquaresCurrentGrid({
  poolData,
}: {
  poolData: Pool<'golf_squares'>
}) {
  const { gridsData, gridsIsLoading } = useGrids({
    poolId: poolData.id,
  })

  const currentGrids = useMemo(() => [...gridsData], [gridsData])

  const currentGridsOptions = currentGrids.map((item) => ({
    title: item.gridName.length ? item.gridName : 'Grid',
    name: String(item.id),
  }))

  const [currentGridId, setCurrentGridId] = useState<number | null>(null)

  useEffect(() => {
    if (currentGrids.length) setCurrentGridId(currentGrids[0].id)
  }, [currentGrids])

  if (!poolData) return null

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
            {!!currentGridsOptions.length && (
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

                    return <p className={styles.selectTitle}>{grid.gridName}</p>
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
