import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './../ReportsPage.module.scss'

const XRunScoreDifferentialLazy = dynamic(
  () =>
    import('features/components/XRunScoreDifferential').then(
      (mod) => mod.XRunScoreDifferential,
    ),
  { loading: () => <p>Loading...</p> },
)

const tabsData = ['score differential'] as const

type TabsDataType = typeof tabsData[number]

export function XRunReportsPage() {
  const [activeTab, setActiveTab] = useState<TabsDataType>('score differential')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'score differential':
        return <XRunScoreDifferentialLazy />
      default:
        return null
    }
  }

  return (
    <div>
      <AccountTabs
        tabsData={tabsData}
        isActive={activeTab}
        setIsActive={setActiveTab}
      />

      <div className={styles.tabWrapper}>{renderTabContent()}</div>
    </div>
  )
}
