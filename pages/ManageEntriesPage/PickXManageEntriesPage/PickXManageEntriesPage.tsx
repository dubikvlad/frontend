import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

const ManageEntriesMyPicksLazy = dynamic(
  () => import('@/features/components/ManageEntriesMyPicks'),
  { loading: () => <p>Loading...</p> },
)

const PicksByMembersLazy = dynamic(
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

import styles from '../ManageEntriesPage.module.scss'

type TabsData =
  | 'my picks'
  | 'picks by members'
  | 'pool entries'
  | 'member pick summary'

const tabsData: TabsData[] = [
  'my picks',
  'picks by members',
  'pool entries',
  'member pick summary',
]

export function PickXManageEntriesPage() {
  const [activeTabs, setActiveTabs] = useState<TabsData>(tabsData[0])

  const renderTabContent = () => {
    switch (activeTabs) {
      case 'my picks':
        return <ManageEntriesMyPicksLazy />
      case 'picks by members':
        return <PicksByMembersLazy />
      case 'pool entries':
        return <PoolEntriesLazy />
      case 'member pick summary':
        return <GolfManageEntriesMemberPickSummaryLazy />
      default:
        return null
    }
  }

  return (
    <>
      <h1>{activeTabs}</h1>

      <p className={styles.description}>
        Make your picks for each entry below. You can modify your other picks up
        until the first tee time.
      </p>

      <AccountTabs
        tabsData={tabsData}
        isActive={activeTabs}
        setIsActive={setActiveTabs}
      />

      <div className={styles.tabWrapper}>{renderTabContent()}</div>
    </>
  )
}
