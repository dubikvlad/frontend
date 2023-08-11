import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { GridItem, Pool } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { generateParticipantImagePath, routes } from '@/config/constants'
import { Select2 } from '@/features/ui'
import { useGrids, useGrid } from '@/helpers'

import styles from './SquaresGridView.module.scss'
const SquaresMakePickMainComponentLazy = dynamic(
  () =>
    import('@/features/components/SquaresMakePickMainComponent').then(
      (mod) => mod.SquaresMakePickMainComponent,
    ),
  { loading: () => <p>Loading...</p> },
)

export function SquaresGridView({ poolData }: { poolData: Pool<'squares'> }) {
  const { gridsData, gridsIsLoading } = useGrids({
    poolId: poolData.id,
  })

  const [sortedGridsData, setSortedGridsData] = useState<GridItem[]>([])

  useEffect(() => {
    function sortByDate(a: GridItem, b: GridItem) {
      const aDate = new Date(a.date).getTime()
      const bDate = new Date(b.date).getTime()

      return aDate - bDate
    }

    if (gridsData.length) {
      setSortedGridsData([...gridsData].sort(sortByDate))
    }
  }, [gridsData])

  const [gridId, setGridId] = useState<number | null>(null)

  useEffect(() => {
    if (sortedGridsData.length) {
      setGridId(sortedGridsData[0].id)
    }
  }, [sortedGridsData])

  const gridsOptions = sortedGridsData.map((item) => ({
    title: item.gridName,
    name: String(item.id),
  }))

  const gridIndex = sortedGridsData.findIndex(
    (arrItem) => arrItem.id === gridId,
  )
  const prevGrid =
    !~gridIndex || gridIndex === 0 ? undefined : sortedGridsData[gridIndex - 1]

  const { gridData: prevGridData } = useGrid<'squares'>({
    poolId:
      poolData?.type === 'squares' || poolData?.type === 'golf_squares'
        ? poolData.id
        : undefined,
    gridId: prevGrid?.id,
  })

  const nextGrid =
    !~gridIndex || gridIndex === sortedGridsData.length - 1
      ? undefined
      : sortedGridsData[gridIndex + 1]

  const { gridData: nextGridData } = useGrid<'squares'>({
    poolId:
      poolData?.type === 'squares' || poolData?.type === 'golf_squares'
        ? poolData.id
        : undefined,
    gridId: nextGrid?.id,
  })

  if (!poolData) return null

  return (
    <div className={styles.wrapper}>
      {!gridsIsLoading &&
        (!gridsData.length ? (
          <div className={styles.notGridsWrapper}>
            <p>
              You haven&apos;t created any grids yet.{' '}
              <Link href={routes.account.createGrid(poolData.id)}>
                Click here
              </Link>{' '}
              to create your first grid
            </p>
          </div>
        ) : (
          <>
            {!!gridsOptions.length && (
              <div className={styles.switchWrapper}>
                <div
                  className={classNames(styles.leftSwitch, {
                    [styles.leftSwitchDisabled]: !prevGridData,
                  })}
                  onClick={() => prevGridData && setGridId(prevGridData.id)}
                >
                  {prevGridData ? (
                    <>
                      <MonthLeftArrow />
                      <Image
                        src={generateParticipantImagePath(
                          prevGridData.x_axis_participant.external_id,
                        )}
                        width={45}
                        height={45}
                        alt={prevGridData.name}
                      />

                      <p>@</p>

                      <Image
                        src={generateParticipantImagePath(
                          prevGridData.y_axis_participant.external_id,
                        )}
                        width={45}
                        height={45}
                        alt={prevGridData.name}
                      />
                    </>
                  ) : (
                    <p className={styles.gridNotAvailable}>First Grid</p>
                  )}
                </div>

                <div className={styles.selectWrapper}>
                  <Select2
                    value={String(gridId)}
                    onChange={(value) => setGridId(Number(value))}
                    options={gridsOptions}
                    customTitle={(option) => {
                      const grid = sortedGridsData.find(
                        (item) => item.id === Number(option.name),
                      )

                      if (!grid) return option.title

                      return (
                        <p className={styles.selectTitle}>
                          {grid.gridName}{' '}
                          <span>
                            {grid.participants.reduce(
                              (acc, item, i) =>
                                i === 0
                                  ? item.name
                                  : (acc += ` @ ${item.name}`),
                              '',
                            )}
                          </span>
                        </p>
                      )
                    }}
                  />
                </div>

                <div
                  className={classNames(styles.rightSwitch, {
                    [styles.rightSwitchDisabled]: !nextGridData,
                  })}
                  onClick={() => nextGridData && setGridId(nextGridData.id)}
                >
                  {nextGridData ? (
                    <>
                      <Image
                        src={generateParticipantImagePath(
                          nextGridData.x_axis_participant.external_id,
                        )}
                        width={45}
                        height={45}
                        alt={nextGridData.name}
                      />

                      <p>@</p>

                      <Image
                        src={generateParticipantImagePath(
                          nextGridData.y_axis_participant.external_id,
                        )}
                        width={45}
                        height={45}
                        alt={nextGridData.name}
                      />

                      <MonthRightArrow />
                    </>
                  ) : (
                    <p className={styles.gridNotAvailable}>Last Grid</p>
                  )}
                </div>
              </div>
            )}

            <SquaresMakePickMainComponentLazy customGridId={gridId} />
          </>
        ))}
    </div>
  )
}
