import classNames from 'classnames'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect } from 'react'

import { GridXAndYAxisValues } from '@/api'
import { MonthLeftArrow } from '@/assets/icons'
import { useGrid, usePool } from '@/helpers'

import styles from './SquaresQuarterSwitch.module.scss'

type SquaresQuarterSwitchProps = {
  quarterSwitch: 'total' | string
  setQuarterSwitch: Dispatch<
    SetStateAction<SquaresQuarterSwitchProps['quarterSwitch']>
  >
  getCustomAxisSquares?: (
    customAxisSquares: GridXAndYAxisValues | undefined,
  ) => void
  customGridId?: number | null
}

export function SquaresQuarterSwitch({
  quarterSwitch,
  setQuarterSwitch,
  getCustomAxisSquares,
  customGridId,
}: SquaresQuarterSwitchProps) {
  const {
    query: { poolId, grid_id },
  } = useRouter()

  const gridId = customGridId ?? (grid_id ? Number(grid_id) : undefined)

  const { poolData } = usePool(Number(poolId))
  const { gridData } = useGrid({
    poolId:
      poolData?.type === 'squares' || poolData?.type === 'golf_squares'
        ? poolData.id
        : undefined,
    gridId: gridId,
  })

  const axisSquares = gridData?.is_random
    ? gridData?.random_squares
    : gridData?.selected_squares

  const customAxisSquares =
    quarterSwitch === 'total' || !axisSquares
      ? undefined
      : !Array.isArray(axisSquares) &&
        !('fe' in axisSquares) &&
        quarterSwitch in axisSquares &&
        (quarterSwitch === '1q' ||
          quarterSwitch === '2q' ||
          quarterSwitch === '3q' ||
          quarterSwitch === '4q')
      ? axisSquares[quarterSwitch]
      : undefined

  useEffect(() => {
    if (getCustomAxisSquares) getCustomAxisSquares(customAxisSquares)
  }, [customAxisSquares, getCustomAxisSquares])

  if (!gridData) return null

  return gridData.number_of_sets > 1 ? (
    <div className={styles.quarterSwitchWrapper}>
      <div
        className={classNames({
          [styles.quarterSwitchActive]: quarterSwitch === 'total',
        })}
        onClick={() => setQuarterSwitch('total')}
      >
        <p>Total</p>
        <MonthLeftArrow />
      </div>
      {Array(gridData.number_of_sets)
        .fill(0)
        .map((_, i) => {
          const key = `${i + 1}q`

          return (
            <div
              key={i}
              className={classNames({
                [styles.quarterSwitchActive]: quarterSwitch === key,
              })}
              onClick={() => setQuarterSwitch(key)}
            >
              <p>Quarter {i + 1}</p>
              <MonthLeftArrow />
            </div>
          )
        })}
    </div>
  ) : null
}
