import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './../ReportsPage.module.scss'

const StatisticalChartsReportLazy = dynamic(
  () =>
    import('@/features/components/reports/StatisticalChartsReport').then(
      (mod) => mod.StatisticalChartsReport,
    ),
  { loading: () => <p>Loading...</p> },
)

const PickAvailabilityLazy = dynamic(
  () => import('@/features/components/PickAvailability'),
  { loading: () => <p>Loading...</p> },
)

const PointDifferentialLazy = dynamic(
  () =>
    import('@/features/components/reports/PointDifferentialReport').then(
      (mod) => mod.PointDifferentialReport,
    ),
  { loading: () => <p>Loading...</p> },
)

const ModificationHistoryReportLazy = dynamic(
  () => import('@/features/components/reports/ModificationHistoryReport'),
  { loading: () => <p>Loading...</p> },
)

type SurvivorTabsData =
  | 'Statistical charts'
  | 'Pick availability'
  | 'Point differential'
  | 'Modification'

const survivorTabsData: SurvivorTabsData[] = [
  'Statistical charts',
  'Pick availability',
  'Point differential',
  'Modification',
]

export function SurvivorReportsPage() {
  const [activeTabsSurvivor, setActiveTabsSurvivor] =
    useState<SurvivorTabsData>(survivorTabsData[0])

  return (
    <div>
      <AccountTabs
        tabsData={survivorTabsData}
        isActive={activeTabsSurvivor}
        setIsActive={setActiveTabsSurvivor}
      />

      <div className={styles.tabWrapper}>
        {activeTabsSurvivor === 'Statistical charts' && (
          <StatisticalChartsReportLazy />
        )}
        {activeTabsSurvivor === 'Pick availability' && <PickAvailabilityLazy />}
        {activeTabsSurvivor === 'Point differential' && (
          <PointDifferentialLazy />
        )}
        {activeTabsSurvivor === 'Modification' && (
          <ModificationHistoryReportLazy />
        )}
      </div>
    </div>
  )
}
