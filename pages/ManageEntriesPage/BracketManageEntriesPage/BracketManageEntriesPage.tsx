import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './BracketManageEntriesPage.module.scss'

const ManageEntriesMyPicksLazy = dynamic(
  () => import('@/features/components/ManageEntriesMyPicks'),
  { loading: () => <p>Loading...</p> },
)

const PickByMembersLazy = dynamic(
  () => import('@/features/components/PickByMembers'),
  { loading: () => <p>Loading...</p> },
)

const PickDistributionLazy = dynamic(
  () =>
    import('@/features/components/PickDistribution').then(
      (mod) => mod.PickDistribution,
    ),
  { loading: () => <p>Loading...</p> },
)

const PoolEntriesLazy = dynamic(
  () => import('@/features/components/ManageEntriesPoolEntries'),
  { loading: () => <p>Loading...</p> },
)

const tabsData = [
  'My picks',
  'Picks by members',
  'Pool Entries',
  'Pick distribution',
]

export function BracketManageEntriesPage() {
  const [activeTab, setActiveTab] = useState(tabsData[0])

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>My picks</h1>

      <p>
        Make a pick for each entry below before the pick deadline listed at the
        bottom.
      </p>

      <AccountTabs
        tabsData={tabsData}
        isActive={activeTab}
        setIsActive={setActiveTab}
      />

      <div className={styles.activeTabWrapper}>
        {activeTab === 'My picks' && <ManageEntriesMyPicksLazy />}
        {activeTab === 'Picks by members' && <PickByMembersLazy />}
        {activeTab === 'Pick distribution' && <PickDistributionLazy />}
        {activeTab === 'Pool Entries' && <PoolEntriesLazy />}
      </div>
    </div>
  )
}
