import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './../ReportsPage.module.scss'

const HandicappingReportLazy = dynamic(
  () => import('@/features/components/reports/HandicappingReport'),
  { loading: () => <p>Loading...</p> },
)

const ModificationHistoryReportLazy = dynamic(
  () => import('@/features/components/reports/ModificationHistoryReport'),
  { loading: () => <p>Loading...</p> },
)

const WeekByWeekReportLazy = dynamic(
  () => import('@/features/components/reports/WeekByWeekReport'),
  { loading: () => <p>Loading...</p> },
)

const PoolStatsReportLazy = dynamic(
  () => import('@/features/components/reports/PoolStatsReport'),
  { loading: () => <p>Loading...</p> },
)

type PickemTabsData =
  | 'Pool stats'
  | 'Week-by-week'
  | 'Handicapping'
  | 'Modification'

const pickemTabsData: PickemTabsData[] = [
  'Pool stats',
  'Week-by-week',
  'Handicapping',
  'Modification',
]

export function PickemReportsPage() {
  const [activeTabsPickem, setActiveTabsPickem] = useState<PickemTabsData>(
    pickemTabsData[0],
  )

  return (
    <div>
      <AccountTabs
        tabsData={pickemTabsData}
        isActive={activeTabsPickem}
        setIsActive={setActiveTabsPickem}
      />

      <div className={styles.tabWrapper}>
        {activeTabsPickem === 'Pool stats' && <PoolStatsReportLazy />}
        {activeTabsPickem === 'Week-by-week' && <WeekByWeekReportLazy />}
        {activeTabsPickem === 'Handicapping' && <HandicappingReportLazy />}
        {activeTabsPickem === 'Modification' && (
          <ModificationHistoryReportLazy />
        )}
      </div>
    </div>
  )
}
