import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './QAManageEntriesPage.module.scss'

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

const PickDistributionLazy = dynamic(
  () =>
    import('@/features/components/PickDistribution').then(
      (mod) => mod.PickDistribution,
    ),
  { loading: () => <p>Loading...</p> },
)

const tabsData = [
  'my picks',
  'picks by members',
  'pool entries',
  'pick distribution',
] as const

type TabsDataType = typeof tabsData[number]

export function QAManageEntriesPage() {
  const [activeTab, setActiveTab] = useState<TabsDataType>('my picks')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my picks':
        return <ManageEntriesMyPicksLazy />
      case 'picks by members':
        return <PicksByMembersLazy />
      case 'pool entries':
        return <PoolEntriesLazy />
      case 'pick distribution':
        return <PickDistributionLazy />
      default:
        return null
    }
  }

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

      <div className={styles.activeTabWrapper}>{renderTabContent()}</div>
    </div>
  )
}
