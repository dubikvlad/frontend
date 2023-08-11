import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './../ManageEntriesPage.module.scss'

const ManageEntriesMyPicksLazy = dynamic(
  () => import('@/features/components/ManageEntriesMyPicks'),
  { loading: () => <p>Loading...</p> },
)

const PickByMembersLazy = dynamic(
  () => import('@/features/components/PickByMembers'),
  { loading: () => <p>Loading...</p> },
)

const PoolEntriesLazy = dynamic(
  () => import('@/features/components/ManageEntriesPoolEntries'),
  { loading: () => <p>Loading...</p> },
)

const ManageEntriesWeeklyPickDistributionLazy = dynamic(
  () => import('@/features/components/ManageEntriesWeeklyPickDistribution'),
  { loading: () => <p>Loading...</p> },
)

const tabsData = [
  'My picks',
  'Picks by members',
  'Pool entries',
  'Weekly pick distribution',
] as const

type TabsData = typeof tabsData[number]

export function CreditsManageEntriesPage() {
  const [activeTabs, setActiveTabs] = useState<TabsData>(tabsData[0])

  return (
    <>
      <h1>{activeTabs}</h1>

      <p className={styles.description}>
        Submit your picks below by picking a team to win and entering the amount
        of credits to wager (note: credits do NOT reset each week so if you lose
        all of your credits you are done).
      </p>

      <AccountTabs
        tabsData={tabsData as unknown as string[]}
        isActive={activeTabs}
        setIsActive={setActiveTabs}
      />

      <div className={styles.tabWrapper}>
        {activeTabs === 'My picks' && <ManageEntriesMyPicksLazy />}
        {activeTabs === 'Picks by members' && <PickByMembersLazy />}
        {activeTabs === 'Pool entries' && <PoolEntriesLazy />}
        {activeTabs === 'Weekly pick distribution' && (
          <ManageEntriesWeeklyPickDistributionLazy />
        )}
      </div>
    </>
  )
}
