import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './../ReportsPage.module.scss'

const EarnedCreditsReportLazy = dynamic(
  () =>
    import('@/features/components/EarnedCreditsReport').then(
      (mod) => mod.EarnedCreditsReport,
    ),
  { loading: () => <p>Loading...</p> },
)

const CreditsWeekByWeekReportLazy = dynamic(
  () => import('@/features/components/reports/CreditsWeekByWeekReport'),
  { loading: () => <p>Loading...</p> },
)

const ModificationHistoryReportLazy = dynamic(
  () => import('@/features/components/reports/ModificationHistoryReport'),
  { loading: () => <p>Loading...</p> },
)

type CreditTabsData = 'earned credits' | 'week-by-week' | 'modification'

const creditTabsData: { [key in CreditTabsData]: CreditTabsData } = {
  'earned credits': 'earned credits',
  'week-by-week': 'week-by-week',
  modification: 'modification',
}

export function CreditReportsPage() {
  const [activeTab, setActiveTab] = useState<CreditTabsData>(
    creditTabsData['earned credits'],
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case creditTabsData['earned credits']:
        return <EarnedCreditsReportLazy />
      case creditTabsData['week-by-week']:
        return <CreditsWeekByWeekReportLazy />
      case creditTabsData['modification']:
        return <ModificationHistoryReportLazy />
      default:
        return null
    }
  }

  return (
    <div>
      <AccountTabs
        tabsData={Object.values(creditTabsData)}
        isActive={activeTab}
        setIsActive={setActiveTab}
      />

      <div className={styles.tabWrapper}>{renderTabContent()}</div>
    </div>
  )
}
