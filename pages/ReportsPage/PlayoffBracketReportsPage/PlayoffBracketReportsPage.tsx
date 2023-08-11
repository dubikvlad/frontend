import dynamic from 'next/dynamic'
import { useState } from 'react'

import { AccountTabs } from '@/features/components'

import styles from './../ReportsPage.module.scss'

const WhoToRootForLazy = dynamic(
  () =>
    import('@/features/components/reports').then(
      (mod) => mod.WhoToRootForReport,
    ),
  { loading: () => <p>Loading...</p> },
)

const FinalFourPredictionLazy = dynamic(
  () =>
    import('@/features/components/reports').then(
      (mod) => mod.FinalFourPredictionReport,
    ),
  { loading: () => <p>Loading...</p> },
)

const ModificationHistoryReportLazy = dynamic(
  () => import('@/features/components/reports/ModificationHistoryReport'),
  { loading: () => <p>Loading...</p> },
)

const bracketTabsData = [
  'Who to root for',
  'Final Four Prediction',
  'Modification',
] as const

type BracketTabsData = typeof bracketTabsData[number]

export function PlayoffBracketPage() {
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
        {activeTabsBracket === 'Who to root for' && <WhoToRootForLazy />}
        {activeTabsBracket === 'Final Four Prediction' && (
          <FinalFourPredictionLazy />
        )}
        {activeTabsBracket === 'Modification' && (
          <ModificationHistoryReportLazy />
        )}
      </div>
    </div>
  )
}
