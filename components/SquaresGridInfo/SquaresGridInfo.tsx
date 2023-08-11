import classNames from 'classnames'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useState } from 'react'
import { KeyedMutator } from 'swr'

import {
  api,
  EntriesPoolEntriesData,
  GridData,
  GridInfo,
  Pool,
  ResponseData,
  SquaresEntriesItem,
} from '@/api'
import { ColorPicker } from '@/features/ui'
import { useGetPoolEntries, useGetUserInfo, useGrid } from '@/helpers'

import styles from './SquaresGridInfo.module.scss'

type SquaresGridInfoProps = {
  gridData: GridInfo | undefined
  poolData: Pool<'squares'> | undefined
  customGridId?: number
  isViewingOnly?: boolean
  isHighlight?: boolean
  setIsHighlight?: Dispatch<SetStateAction<boolean>>
}

export function SquaresGridInfo({
  gridData,
  poolData,
  customGridId,
  isViewingOnly = false,
  isHighlight = false,
  setIsHighlight,
}: SquaresGridInfoProps) {
  const {
    query: { grid_id },
  } = useRouter()

  const gridId = customGridId ?? (grid_id ? Number(grid_id) : undefined)

  const { userInfoData } = useGetUserInfo()

  const { poolEntriesData, poolEntriesMutate } = useGetPoolEntries<'squares'>({
    poolId:
      poolData?.type === 'squares' || poolData?.type === 'golf_squares'
        ? poolData.id
        : undefined,
  })

  const currentEntry =
    userInfoData && poolEntriesData.length
      ? poolEntriesData.find((entry) => entry.user_id === userInfoData.id)
      : undefined

  const { gridDataForecastAvailable, gridMutate } = useGrid<'squares'>({
    poolId:
      poolData?.type === 'squares' || poolData?.type === 'golf_squares'
        ? poolData.id
        : undefined,
    gridId: Number(gridId),
  })

  if (!gridData || !poolData || !userInfoData || !gridDataForecastAvailable)
    return null

  const isCommissioner = poolData.owner.id === userInfoData.id

  const pickedSquares = gridData.number_of_squares - gridDataForecastAvailable

  const isWinningSquares = !!gridData.winning_squares.length

  return (
    <div
      className={classNames(styles.gridInfoWrapper, {
        [styles.gridInfoWrapperResultKnown]: isWinningSquares,
      })}
    >
      <p className={styles.gridNumber}>#{gridData.pool_number_grid}</p>
      <p className={styles.gridName}>
        <span className={styles.gridNameText}>{gridData.name}</span>
        <span
          className={classNames(styles.masterGridWrapper, {
            [styles.masterGridWrapperVisible]:
              gridData.grid_status === 'master',
          })}
        >
          Master Grid
        </span>
        <span
          className={classNames(styles.currentGridWrapper, {
            [styles.currentGridWrapperVisible]:
              Number(gridData.week) === poolData.pick_pool.current_week,
          })}
        >
          Current Grid
        </span>
      </p>

      {!isCommissioner && !isViewingOnly ? (
        <>
          {currentEntry ? (
            <EntryColorPicker
              currentEntry={currentEntry}
              poolEntriesMutate={poolEntriesMutate}
              gridMutate={gridMutate}
            />
          ) : (
            <div></div>
          )}

          <div className={styles.squaresPickedAndAvailableWrapper}>
            <p className={styles.squaresPicked}>
              Squares picked: <span>{pickedSquares}</span>
            </p>
            <p className={styles.squaresAvailable}>
              Squares available: <span>{gridDataForecastAvailable}</span>
            </p>
          </div>
        </>
      ) : (
        <>
          <p className={styles.squaresPicked}>
            Squares picked: <span>{pickedSquares}</span>
          </p>
          <p className={styles.squaresAvailable}>
            Squares available: <span>{gridDataForecastAvailable}</span>
          </p>
        </>
      )}

      {isWinningSquares && (
        <button
          className={classNames('button', {
            'button-white-outline': !isHighlight,
            'button-blue-light': isHighlight,
          })}
          onClick={() => setIsHighlight && setIsHighlight((prev) => !prev)}
        >
          Highlight winning square
        </button>
      )}
    </div>
  )
}

function EntryColorPicker({
  currentEntry,
  poolEntriesMutate,
  gridMutate,
}: {
  currentEntry: SquaresEntriesItem
  poolEntriesMutate: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'squares'>
  > | null>
  gridMutate: KeyedMutator<ResponseData<GridData> | null>
}) {
  const [isLoading, setIsLoading] = useState(false)

  async function changeEntryColor(newColor: string) {
    try {
      setIsLoading(true)

      await api.entries.changeFields(currentEntry.pool_id, currentEntry.id, {
        color: newColor,
      })

      await Promise.all([gridMutate(), poolEntriesMutate()])
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={classNames(styles.colorPicker, {
        [styles.colorPickerDisabled]: isLoading,
      })}
    >
      <p className={styles.entryColorText}>Entry color:</p>
      <ColorPicker value={currentEntry.color} onChange={changeEntryColor} />
    </div>
  )
}
