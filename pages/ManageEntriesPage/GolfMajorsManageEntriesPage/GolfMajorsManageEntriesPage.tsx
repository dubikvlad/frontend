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

const GolfManageEntriesMemberPickSummaryLazy = dynamic(
  () =>
    import('@/features/components/GolfManageEntriesMemberPickSummary').then(
      (mod) => mod.GolfManageEntriesMemberPickSummary,
    ),
  { loading: () => <p>Loading...</p> },
)

const tabsData = [
  'My picks',
  'Picks by members',
  'Pool entries',
  'Member pick summary',
]

type TabsData = typeof tabsData[number]

export function GolfMajorsManageEntriesPage() {
  const [activeTabs, setActiveTabs] = useState<TabsData>(tabsData[0])

  return (
    <>
      <h1>{activeTabs}</h1>

      <p className={styles.description}>
        Make your picks for each entry below. You can modify your other picks up
        until the first tee time.
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
        {activeTabs === 'Member pick summary' && (
          <GolfManageEntriesMemberPickSummaryLazy />
        )}
      </div>
    </>
  )
}
