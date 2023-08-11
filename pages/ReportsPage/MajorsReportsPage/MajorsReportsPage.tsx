import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'

import { Pool } from '@/api'
import { picksheetTypes } from '@/config/constants'
import { AccountTabs } from '@/features/components'

import styles from './../ReportsPage.module.scss'

const MajorsPlayerPerformanceSummaryLazy = dynamic(
  () =>
    import('@/features/components').then(
      (mod) => mod.MajorsPlayerPerformanceSummary,
    ),
  { loading: () => <p>Loading...</p> },
)

const MajorsPlayerValueSummaryLazy = dynamic(
  () =>
    import('@/features/components').then((mod) => mod.MajorsPlayerValueSummary),
  { loading: () => <p>Loading...</p> },
)

const ModificationHistoryReportLazy = dynamic(
  () => import('@/features/components/reports/ModificationHistoryReport'),
  { loading: () => <p>Loading...</p> },
)

export function MajorsReportsPage({
  poolData,
}: {
  poolData: Pool<'golf_majors'>
}) {
  const tabsData = useMemo(() => {
    if (poolData.pick_pool.picksheet_type === picksheetTypes.salary_cap) {
      return [
        'player performance summary',
        'player value summary',
        'modification',
      ] as const
    }

    return ['player performance summary', 'modification'] as const
  }, [poolData.pick_pool.picksheet_type])

  const [activeTab, setActiveTab] = useState<typeof tabsData[number]>(
    'player performance summary',
  )

  const RenderTabContent = () => {
    switch (activeTab) {
      case 'player performance summary':
        return <MajorsPlayerPerformanceSummaryLazy poolData={poolData} />
      case 'player value summary':
        return <MajorsPlayerValueSummaryLazy poolData={poolData} />
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
