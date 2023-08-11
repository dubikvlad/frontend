import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { Pool, PoolTypes } from '@/api'
import {
  localStorageKeys,
  poolOverviewTabs,
  poolTypes,
} from '@/config/constants'
import { AccountShowRules, AccountTabs, Rules } from '@/features/components'
import { usePool } from '@/helpers'

import styles from './OverviewPage.module.scss'

const ScheduleLazy = dynamic(() => import('@/features/components/Schedule'), {
  loading: () => <p>Loading...</p>,
})

const LeaderboardTableLazy = dynamic(
  () => import('@/features/components/LeaderboardTable'),
  { loading: () => <p>Loading...</p> },
)

const ActualBracketLazy = dynamic(
  () => import('@/features/components/ActualBracket'),
  { loading: () => <p>Loading...</p> },
)

const CurrentGridLazy = dynamic(
  () =>
    import('features/components/CurrentGrid').then((mod) => mod.CurrentGrid),
  { loading: () => <p>Loading...</p> },
)

const ResultsLazy = dynamic(
  () =>
    import('@/features/components/OverviewResults').then(
      (mod) => mod.OverviewResults,
    ),
  { loading: () => <p>Loading...</p> },
)

const TierByTierLeaderboardLazy = dynamic(
  () =>
    import('@/features/components/TierByTierLeaderboard').then(
      (mod) => mod.TierByTierLeaderboard,
    ),
  { loading: () => <p>Loading...</p> },
)
export function OverviewPage() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<PoolTypes>(Number(poolId))

  const [isActive, setIsActive] = useState<string | null>(null)

  // добавляет в localStorage id пула, чтобы в меню выводился список
  // последних посещенных пулов
  useEffect(() => {
    if (poolId) {
      const arr = localStorage.getItem(localStorageKeys.recentlyAcessedPools)

      const newValue =
        arr === null
          ? String([String(poolId)])
          : arr.split(',').includes(String(poolId))
          ? String(arr)
          : String([String(poolId), ...arr.split(',')].slice(0, 6))

      localStorage.setItem(localStorageKeys.recentlyAcessedPools, newValue)
    }
  }, [poolId])

  const accountTabsData: string[] = useMemo(() => {
    if (!poolData) return []

    const poolType: PoolTypes = poolData.type

    switch (poolType) {
      case poolTypes.pick_em:
      case poolTypes.survivor:
      case poolTypes.credits:
      case poolTypes.margin:
      case poolTypes.xrun_mlb:
      case poolTypes.xrun:
        return ['Leaderboard', 'Schedule', 'Results']
      case poolTypes.squares:
      case poolTypes.golf_squares:
        return ['Current grid']
      case poolTypes.bracket:
      case poolTypes.playoff:
        return ['Leaderboard', 'Actual Bracket', 'Schedule', 'Results']
      case poolTypes.qa:
      case poolTypes.golf_pick_x:
        return ['Leaderboard', 'Results']
      case poolTypes.golf_majors:
        return (poolData as Pool<'golf_majors'>).pick_pool.picksheet_type ===
          'tiered'
          ? ['Leaderboard', 'Tier-by-tier leaderboard']
          : ['Leaderboard']
      default:
        return []
    }
  }, [poolData])

  const renderTabContent = () => {
    switch (isActive) {
      case poolOverviewTabs.leaderboard:
        return <LeaderboardTableLazy />
      case poolOverviewTabs.tier_by_tier_leaderboard:
        return <TierByTierLeaderboardLazy />
      case poolOverviewTabs.current_grid:
        return <CurrentGridLazy />
      case poolOverviewTabs.schedule:
        return <ScheduleLazy />
      case poolOverviewTabs.results:
        return <ResultsLazy />
      case poolOverviewTabs.actual_bracket:
        return <ActualBracketLazy />
      default:
        return null
    }
  }

  useEffect(() => {
    if (!isActive && accountTabsData.length) {
      setIsActive(accountTabsData[0])
    }
  }, [isActive, accountTabsData])

  return (
    <div>
      <AccountShowRules />
      <Rules />

      <div className={styles.tableWrapper}>
        <AccountTabs
          tabsData={accountTabsData}
          isActive={isActive}
          setIsActive={setIsActive}
        />

        <>{renderTabContent()}</>
      </div>
    </div>
  )
}
