import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './XRunMLBManageEntriesPage.module.scss'

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

const xRunMlb13TabsData = [
  'my picks',
  'picks by members',
  'pool entries',
] as const

type XRunMlb13TabsData = typeof xRunMlb13TabsData[number]

export function XRunMLBManageEntriesPage() {
  const [activeTab, setActiveTab] = useState<XRunMlb13TabsData>('my picks')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my picks':
        return <ManageEntriesMyPicksLazy />
      case 'picks by members':
        return <PickByMembersLazy />
      case 'pool entries':
        return <PoolEntriesLazy />
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
        tabsData={xRunMlb13TabsData}
        isActive={activeTab}
        setIsActive={setActiveTab}
      />

      <div className={styles.activeTabWrapper}>{renderTabContent()}</div>
    </div>
  )
}
