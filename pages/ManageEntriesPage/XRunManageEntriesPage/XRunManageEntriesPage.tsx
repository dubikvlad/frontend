import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './XRunManageEntriesPage.module.scss'

const PickByMembersLazy = dynamic(
  () => import('@/features/components/PickByMembers'),
  { loading: () => <p>Loading...</p> },
)

const PoolEntriesLazy = dynamic(
  () => import('@/features/components/ManageEntriesPoolEntries'),
  { loading: () => <p>Loading...</p> },
)

const xRunTabsData = ['picks by members', 'pool entries'] as const

type XRunTabsData = typeof xRunTabsData[number]

export function XRunManageEntriesPage() {
  const [activeTab, setActiveTab] = useState<XRunTabsData>('picks by members')

  const renderTabContent = () => {
    switch (activeTab) {
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
        tabsData={xRunTabsData}
        isActive={activeTab}
        setIsActive={setActiveTab}
      />

      <div className={styles.activeTabWrapper}>{renderTabContent()}</div>
    </div>
  )
}
