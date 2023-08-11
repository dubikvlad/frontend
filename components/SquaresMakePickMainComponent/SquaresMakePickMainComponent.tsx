import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRef, useEffect, useState } from 'react'

import { GridXAndYAxisValues } from '@/api'
import { routes } from '@/config/constants'
import {
  useGetPoolEntries,
  useGetUserInfo,
  useGrid,
  useMessage,
  usePool,
} from '@/helpers/hooks'

import { SquaresMatchInfoAndGridSettingsProps } from '../SquaresMatchInfoAndGridSettings/SquaresMatchInfoAndGridSettings'
import { SquaresQuarterSwitch } from '../SquaresQuarterSwitch'

import styles from './SquaresMakePickMainComponent.module.scss'

const SquaresMatchInfoAndGridSettingsLazy = dynamic(
  () =>
    import('@/features/components/SquaresMatchInfoAndGridSettings').then(
      (mod) => mod.SquaresMatchInfoAndGridSettings,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfSquaresMatchInfoAndGridSettingsLazy = dynamic(
  () =>
    import('@/features/components/GolfSquaresMatchInfoAndGridSettings').then(
      (mod) => mod.GolfSquaresMatchInfoAndGridSettings,
    ),
  { loading: () => <p>Loading...</p> },
)

const SquaresGridLazy = dynamic(
  () =>
    import('@/features/components/SquaresGrid/SquaresGrid').then(
      (mod) => mod.SquaresGrid,
    ),
  { loading: () => <p>Loading...</p> },
)

const GridSettingsLazy = dynamic(
  () =>
    import('@/features/components/GridSettings').then(
      (mod) => mod.GridSettings,
    ),
  { loading: () => <p>Loading...</p> },
)

const SquaresGridInfoLazy = dynamic(
  () =>
    import('@/features/components/SquaresGridInfo').then(
      (mod) => mod.SquaresGridInfo,
    ),
  { loading: () => <p>Loading...</p> },
)

type SquaresMakePickMainComponent = {
  customGridId?: number | null
  isNotMakePick?: boolean
}

export function SquaresMakePickMainComponent({
  customGridId,
  isNotMakePick = false,
}: SquaresMakePickMainComponent) {
  const {
    query: { poolId, grid_id },
  } = useRouter()

  const gridId = customGridId ?? grid_id

  const { userInfoData } = useGetUserInfo()
  const { poolData } = usePool<'squares'>(Number(poolId))

  const { gridData, gridDataMaxFreeSelectedSquares } = useGrid<'squares'>({
    poolId:
      poolData?.type === 'squares' || poolData?.type === 'golf_squares'
        ? poolData.id
        : undefined,
    gridId: gridId ? Number(gridId) : undefined,
  })

  const { poolEntriesData } = useGetPoolEntries<'squares'>({
    poolId:
      poolData?.type === 'squares' || poolData?.type === 'golf_squares'
        ? poolData.id
        : undefined,
  })

  const gridWrapper = useRef<HTMLDivElement>(null)

  const currentEntry =
    userInfoData && poolEntriesData.length
      ? poolEntriesData.find((entry) => entry.user_id === userInfoData.id)
      : undefined

  const alertRef = useRef<HTMLDivElement>(null)

  const [forecastError, setForecastError] = useMessage()

  useEffect(() => {
    if (forecastError && alertRef.current) {
      const coords = alertRef.current.getBoundingClientRect()
      window.scrollTo({
        left: 0,
        top: coords.top + window.scrollY - coords.height - 20,
      })
    }
  }, [forecastError, alertRef])

  const [quarterSwitch, setQuarterSwitch] = useState('total')

  const [customAxisSquares, setCustomAxisSquares] = useState<
    GridXAndYAxisValues | undefined
  >(undefined)

  const [gridActiveItem, setGridActiveItem] =
    useState<SquaresMatchInfoAndGridSettingsProps['gridActiveItem']>(null)

  const [isHighlight, setIsHighlight] = useState(false)

  useEffect(() => {
    setQuarterSwitch('total')
    setIsHighlight(false)
  }, [gridId])

  if (
    !poolData ||
    !gridData ||
    !gridDataMaxFreeSelectedSquares ||
    !userInfoData
  ) {
    return null
  }

  // лимит оставшихся разрешенных ставок до блокировки грида,
  // после которого будет висеть уведомление о том,
  // что скоро грид будет заблокирован
  const beforeBlockedLimit = 3

  // кол-во оставшихся форкастов
  const numberFreeForcasts =
    gridDataMaxFreeSelectedSquares - gridData.forecasts.length

  // проверка на лимит оставшихся разрешенных фокрастов,
  // если true, грид будет заблокирован
  const isFreeLimitOver =
    !gridData.is_payed &&
    gridDataMaxFreeSelectedSquares <= gridData.forecasts.length

  const isCommissioner = poolData.owner.id === userInfoData.id

  return (
    <div>
      {poolData.type === 'squares' ? (
        <SquaresMatchInfoAndGridSettingsLazy
          gridActiveItem={gridActiveItem}
          setGridActiveItem={setGridActiveItem}
          customGridId={customGridId}
          isNotMakePick={isNotMakePick && !isCommissioner}
        />
      ) : (
        <GolfSquaresMatchInfoAndGridSettingsLazy
          gridActiveItem={gridActiveItem}
          setGridActiveItem={setGridActiveItem}
          customGridId={customGridId}
          isNotMakePick={isNotMakePick && !isCommissioner}
        />
      )}

      {gridActiveItem !== 'grid-settings' && (
        <>
          <SquaresGridInfoLazy
            gridData={gridData}
            poolData={poolData}
            customGridId={gridData.id}
            isHighlight={isHighlight}
            setIsHighlight={setIsHighlight}
          />

          {isCommissioner && (
            <>
              {!gridData.is_payed &&
                numberFreeForcasts <= beforeBlockedLimit &&
                !isFreeLimitOver && (
                  <p className={styles.beforeBlockedLimitWrapper}>
                    You have{' '}
                    <span>
                      {gridDataMaxFreeSelectedSquares -
                        gridData.forecasts.length}{' '}
                      available square
                    </span>{' '}
                    in the grid left. You can unlock <span>all squares</span> in
                    the grid. In order to do this,{' '}
                    <Link href={routes.account.commish.payment(poolData.id)}>
                      go to the payment page
                    </Link>
                  </p>
                )}

              {isFreeLimitOver && (
                <div className={styles.freeLimitOverWrapper}>
                  <p>
                    You have no more squares available. Please{' '}
                    <span>pay for the grid</span> within a week, otherwise we
                    will have to block the grid.
                  </p>
                  <Link href={routes.account.commish.payment(poolData.id)}>
                    <button className="button button-blue-light">
                      Go to Payment
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}

          {forecastError && (
            <div
              ref={alertRef}
              className={classNames('alert alert-danger', styles.alertDanger)}
            >
              {forecastError}
            </div>
          )}

          <SquaresQuarterSwitch
            quarterSwitch={quarterSwitch}
            setQuarterSwitch={setQuarterSwitch}
            getCustomAxisSquares={setCustomAxisSquares}
            customGridId={customGridId}
          />

          <div ref={gridWrapper} className={styles.gridWrapper}>
            {!!quarterSwitch && quarterSwitch !== 'total' && (
              <p
                className={styles.quarterText}
              >{`${quarterSwitch[1]}${quarterSwitch[0]}`}</p>
            )}

            <SquaresGridLazy
              wrapperRef={gridWrapper}
              isDisabled={!currentEntry}
              getError={setForecastError}
              customNumberOfSets={customAxisSquares ? 1 : undefined}
              customAxisSquares={
                customAxisSquares ? { fe: customAxisSquares } : undefined
              }
              customGridId={customGridId}
              isHighlightResult={isHighlight}
              selectedQuarter={
                quarterSwitch === 'total'
                  ? 'fe'
                  : quarterSwitch === '1q' ||
                    quarterSwitch === '2q' ||
                    quarterSwitch === '3q' ||
                    quarterSwitch === '4q'
                  ? quarterSwitch
                  : undefined
              }
              isFreeLimitOver={isFreeLimitOver}
            />
          </div>
        </>
      )}

      {gridActiveItem === 'grid-settings' && (
        <div className={styles.gridSettingsContainer}>
          <GridSettingsLazy
            closeSettings={() => setGridActiveItem(null)}
            customGridId={customGridId}
          />
        </div>
      )}
    </div>
  )
}
