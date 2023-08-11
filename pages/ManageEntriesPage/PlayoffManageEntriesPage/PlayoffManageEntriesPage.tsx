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

type TabsData = 'My picks' | 'Picks by members' | 'Pool Entries'

const tabsData: TabsData[] = ['My picks', 'Picks by members', 'Pool Entries']

export function PlayoffManageEntriesPage() {
  const [activeTabs, setActiveTabs] = useState<TabsData>(tabsData[0])

  return (
    <>
      <h1>{activeTabs}</h1>

      <p className={styles.description}>
        Make a pick for each entry below before the pick deadline listed at the
        bottom.
      </p>

      <AccountTabs
        tabsData={tabsData}
        isActive={activeTabs}
        setIsActive={setActiveTabs}
      />

      <div className={styles.tabWrapper}>
        {activeTabs === 'My picks' && <ManageEntriesMyPicksLazy />}
        {activeTabs === 'Picks by members' && <PickByMembersLazy />}
        {activeTabs === 'Pool Entries' && <PoolEntriesLazy />}
      </div>
    </>
  )
}
