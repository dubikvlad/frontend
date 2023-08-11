import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './MarginManageEntriesPage.module.scss'

const ManageEntriesMyPicksLazy = dynamic(
  () => import('@/features/components/ManageEntriesMyPicks'),
  { loading: () => <p>Loading...</p> },
)

const PoolEntriesLazy = dynamic(
  () => import('@/features/components/ManageEntriesPoolEntries'),
  { loading: () => <p>Loading...</p> },
)

const MarginManageEntriesWeeklyPickSummaryLazy = dynamic(
  () =>
    import('@/features/components/ManageEntriesWeeklyPickSummary').then(
      (mod) => mod.MarginManageEntriesWeeklyPickSummary,
    ),
  { loading: () => <p>Loading...</p> },
)

type MarginTabsData = 'my picks' | 'pool entries' | 'weekly pick summary'

const marginTabsData: { [key in MarginTabsData]: MarginTabsData } = {
  'my picks': 'my picks',
  'pool entries': 'pool entries',
  'weekly pick summary': 'weekly pick summary',
}

export function MarginManageEntriesPage() {
  const [activeTab, setActiveTab] = useState<MarginTabsData>(
    marginTabsData['my picks'],
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case marginTabsData['my picks']:
        return <ManageEntriesMyPicksLazy />
      case marginTabsData['pool entries']:
        return <PoolEntriesLazy />
      case marginTabsData['weekly pick summary']:
        return <MarginManageEntriesWeeklyPickSummaryLazy />
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
        tabsData={Object.values(marginTabsData)}
        isActive={activeTab}
        setIsActive={setActiveTab}
      />

      <div className={styles.activeTabWrapper}>{renderTabContent()}</div>
    </div>
  )
}
