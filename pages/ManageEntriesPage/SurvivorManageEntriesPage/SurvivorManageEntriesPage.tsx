import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './../ManageEntriesPage.module.scss'

const ManageEntriesMyPicksLazy = dynamic(
  () => import('@/features/components/ManageEntriesMyPicks'),
  { loading: () => <p>Loading...</p> },
)

const PoolEntriesLazy = dynamic(
  () => import('@/features/components/ManageEntriesPoolEntries'),
  { loading: () => <p>Loading...</p> },
)

const SurvivorManageEntriesWeeklyPickSummaryLazy = dynamic(
  () =>
    import('@/features/components/ManageEntriesWeeklyPickSummary').then(
      (mod) => mod.SurvivorManageEntriesWeeklyPickSummary,
    ),
  { loading: () => <p>Loading...</p> },
)

type TabsData = 'My picks' | 'Weekly pick summary' | 'Pool Entries'

const tabsData: TabsData[] = ['My picks', 'Weekly pick summary', 'Pool Entries']

export function SurvivorManageEntriesPage() {
  const [activeTabs, setActiveTabs] = useState<TabsData>(tabsData[0])

  return (
    <>
      <h1>{activeTabs}</h1>

      <p className={styles.description}>
        Pick one team you think will win by clicking a team&apos;s box below.
        You can not pick the same team more than once during the season.
      </p>

      <AccountTabs
        tabsData={tabsData}
        isActive={activeTabs}
        setIsActive={setActiveTabs}
      />

      <div className={styles.tabWrapper}>
        {activeTabs === 'My picks' && <ManageEntriesMyPicksLazy />}
        {activeTabs === 'Weekly pick summary' && (
          <SurvivorManageEntriesWeeklyPickSummaryLazy />
        )}
        {activeTabs === 'Pool Entries' && <PoolEntriesLazy />}
      </div>
    </>
  )
}
