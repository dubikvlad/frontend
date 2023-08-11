import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './../ReportsPage.module.scss'

const ModificationHistoryReportLazy = dynamic(
  () => import('@/features/components/reports/ModificationHistoryReport'),
  { loading: () => <p>Loading...</p> },
)

const PoolMembersPicksReportLazy = dynamic(
  () =>
    import('@/features/components/reports').then(
      (mod) => mod.PoolMembersPicksReport,
    ),
  { loading: () => <p>Loading...</p> },
)

const bracketTabsData = ['Pool members picks', 'Modification'] as const

type BracketTabsData = typeof bracketTabsData[number]

export function PlayoffPowerRankingReportsPage() {
  const [activeTabsBracket, setActiveTabsBracket] = useState<BracketTabsData>(
    bracketTabsData[0],
  )

  return (
    <div>
      <AccountTabs
        tabsData={bracketTabsData}
        isActive={activeTabsBracket}
        setIsActive={setActiveTabsBracket}
      />

      <div className={styles.tabWrapper}>
        {activeTabsBracket === 'Pool members picks' && (
          <PoolMembersPicksReportLazy />
        )}

        {activeTabsBracket === 'Modification' && (
          <ModificationHistoryReportLazy />
        )}
      </div>
    </div>
  )
}
