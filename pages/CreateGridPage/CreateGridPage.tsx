import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import type { Pool, PoolTypes } from '@/api'
import { routes } from '@/config/constants'
import { InfoContainer } from '@/features/components'
import { AccountTabs } from '@/features/components'
import { useInitialGridSettings, useMessage, usePool } from '@/helpers'

import styles from './CreateGridPage.module.scss'

const SquaresSingleGameSettingsLazy = dynamic(
  () =>
    import(
      '@/features/components/SquaresSingleGameSettings/SquaresSingleGameSettings'
    ).then((mod) => mod.SquaresSingleGameSettings),
  {
    loading: () => <p>Loading...</p>,
  },
)

const SquaresSeriesGameSettingsLazy = dynamic(
  () =>
    import(
      '@/features/components/SquaresSeriesGameSettings/SquaresSeriesGameSettings'
    ).then((mod) => mod.SquaresSeriesGameSettings),
  {
    loading: () => <p>Loading...</p>,
  },
)

const tabsData = ['single game', 'series of games']

export function CreateGridPage() {
  const [isActive, setIsActive] = useState<string>(tabsData[0])
  const [generateGridError, setGenerateGridError] = useMessage()

  const {
    query: { poolId },
  } = useRouter()

  const { initialGridSettingsData, initialGridSettingsError } =
    useInitialGridSettings({
      poolId: Number(poolId),
      gridType: isActive == 'single game' ? 'single' : 'series',
    })

  const { poolData } = usePool(Number(poolId))

  const router = useRouter()
  const link = routes.account.overview(Number(poolId))

  if (
    poolData &&
    (poolData?.type as PoolTypes) !== 'squares' &&
    (poolData?.type as PoolTypes) !== 'golf_squares'
  ) {
    router.push(link)
  }

  function redirectToMakePick(gridId: number) {
    router.push(
      routes.account.makePick.index(Number(poolId), { grid_id: gridId }),
    )
  }

  return (
    <div>
      <div className={styles.title}>
        <h1>Create a grid</h1>
        <InfoContainer iconHeight={25} withInfo>
          <p>Info</p>
        </InfoContainer>
      </div>
      <p className={styles.intro}>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry.
      </p>
      <AccountTabs
        tabsData={tabsData}
        isActive={isActive}
        setIsActive={setIsActive}
      />

      <div className={styles.dataWrapper}>
        <span className={styles.dataTitle}>{isActive}</span>
        {initialGridSettingsData && poolData && isActive == 'single game' && (
          <SquaresSingleGameSettingsLazy
            settingsData={initialGridSettingsData}
            poolData={poolData as unknown as Pool<'squares'>}
            redirectToMakePick={redirectToMakePick}
            setGenerateGridError={setGenerateGridError}
            fullSize
          />
        )}

        {initialGridSettingsData &&
          poolData &&
          isActive == 'series of games' && (
            <SquaresSeriesGameSettingsLazy
              settingsData={initialGridSettingsData}
              poolData={poolData as unknown as Pool<'squares'>}
              redirectToMakePick={redirectToMakePick}
              fullSize
              setGenerateGridError={setGenerateGridError}
            />
          )}
        {generateGridError && (
          <div
            className={classNames('alert alert-danger', styles.alertDanger)}
            style={{ marginTop: '15px' }}
          >
            {generateGridError}
          </div>
        )}
        {initialGridSettingsError && (
          <div
            className={classNames('alert alert-danger')}
            style={{ marginTop: '15px' }}
          >
            {initialGridSettingsError.message}
          </div>
        )}
      </div>
    </div>
  )
}
