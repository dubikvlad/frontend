import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs, DashboardAdditional } from '@/features/components'
import { useUserPools } from '@/helpers'
import { usePopularPools } from '@/helpers/hooks/pools/usePopularPools'
import { useRecommendedPools } from '@/helpers/hooks/pools/useRecommendedPools'

import styles from './DashboardPage.module.scss'

const MyPoolsTableLazy = dynamic(
  () => import('@/features/components').then((mod) => mod.MyPoolsTable),
  { loading: () => <p>Loading...</p> },
)

const MyPoolsTableLikeLazy = dynamic(
  () => import('@/features/components').then((mod) => mod.MyPoolsTableLike),
  { loading: () => <p>Loading...</p> },
)

const accountTabsData = ['my pools', 'join a pool', 'archived'] as const

export type DashboardPageTabs = typeof accountTabsData[number]

export function DashboardPage() {
  const [isActive, setIsActive] = useState<DashboardPageTabs>('my pools')
  const { poolsActiveData, poolsIsLoading, poolsMutate } = useUserPools()

  const {
    recommendedPools,
    recommendedPoolsIsLoading,
    recommendedPoolsMutate,
  } = useRecommendedPools()

  const { popularPoolsData, popularPoolsMutate } = usePopularPools()

  const archivedPools = poolsActiveData?.filter((pool) => !!pool.is_archive)

  const actualPools = poolsActiveData?.filter((pool) => !pool.is_archive)

  return (
    <div className={styles.wrapper}>
      <h1>Dashboard</h1>

      <DashboardAdditional />

      <AccountTabs
        tabsData={accountTabsData}
        isActive={isActive}
        setIsActive={setIsActive}
      />

      {isActive === 'my pools' && !poolsIsLoading && poolsActiveData && (
        <MyPoolsTableLazy
          poolsData={actualPools ?? []}
          activeTab={isActive}
          poolsMutate={poolsMutate}
          setActiveTab={setIsActive}
        />
      )}

      {isActive === 'join a pool' && !recommendedPoolsIsLoading && (
        <MyPoolsTableLazy
          poolsData={recommendedPools ?? []}
          activeTab={isActive}
          poolsMutate={() => {
            recommendedPoolsMutate()
            popularPoolsMutate()
          }}
          setActiveTab={setIsActive}
        />
      )}

      {isActive === 'archived' && !poolsIsLoading && (
        <MyPoolsTableLazy
          poolsData={archivedPools ?? []}
          activeTab={isActive}
          poolsMutate={poolsMutate}
          setActiveTab={setIsActive}
        />
      )}

      {isActive !== 'archived' && !!popularPoolsData?.length && (
        <MyPoolsTableLikeLazy
          poolsMutate={popularPoolsMutate}
          poolsData={popularPoolsData ?? []}
        />
      )}
    </div>
  )
}
