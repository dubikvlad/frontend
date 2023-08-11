import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './../ReportsPage.module.scss'

const ModificationHistoryReportLazy = dynamic(
  () => import('@/features/components/reports/ModificationHistoryReport'),
  { loading: () => <p>Loading...</p> },
)

const PickAvailabilityLazy = dynamic(
  () => import('@/features/components/PickAvailability'),
  { loading: () => <p>Loading...</p> },
)

const tabsData = ['pick availability', 'modification'] as const

type TabsDataType = typeof tabsData[number]

export function GolfPickXReportsPage() {
  const [activeTab, setActiveTab] = useState<TabsDataType>('pick availability')

  const RenderTabContent = () => {
    switch (activeTab) {
      case 'pick availability':
        return <PickAvailabilityLazy />
      case 'modification':
        return <ModificationHistoryReportLazy />
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

      <div className={styles.tabWrapper}>
        <RenderTabContent />
      </div>
    </div>
  )
}
