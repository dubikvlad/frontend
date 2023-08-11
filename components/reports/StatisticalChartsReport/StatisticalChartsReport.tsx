import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { useStatisticalChartsReport } from '@/helpers'

import styles from './StatisticalChartsReport.module.scss'

const EliminationsPerWeekChartLazy = dynamic(
  () =>
    import(
      '@/features/components/reports/StatisticalChartsReport/charts/EliminationsPerWeekChart'
    ).then((mod) => mod.EliminationsPerWeekChart),
  { loading: () => <p>Loading...</p> },
)

const SurvivorsRemainingAfterWeekLazy = dynamic(
  () =>
    import(
      '@/features/components/reports/StatisticalChartsReport/charts/SurvivorsRemainingAfterWeek'
    ).then((mod) => mod.SurvivorsRemainingAfterWeek),
  { loading: () => <p>Loading...</p> },
)

const EliminationsByTeamLazy = dynamic(
  () =>
    import(
      '@/features/components/reports/StatisticalChartsReport/charts/EliminationsByTeam'
    ).then((mod) => mod.EliminationsByTeam),
  { loading: () => <p>Loading...</p> },
)

export function StatisticalChartsReport() {
  const {
    query: { poolId },
  } = useRouter()

  const { chartsReportData } = useStatisticalChartsReport({
    poolId: Number(poolId),
  })

  const {
    eliminations_per_week_report: eliminationsPerWeekData,
    survivors_remaining_after_week: survivorsRemainingAfterWeekData,
    eliminations_by_team: eliminationsByTeamData,
  } = chartsReportData ?? {}

  return (
    <div className={styles.wrapper}>
      {!!eliminationsPerWeekData?.length && (
        <EliminationsPerWeekChartLazy data={eliminationsPerWeekData} />
      )}
      {!!survivorsRemainingAfterWeekData?.length && (
        <SurvivorsRemainingAfterWeekLazy
          data={survivorsRemainingAfterWeekData}
        />
      )}
      {!!eliminationsByTeamData?.length && (
        <EliminationsByTeamLazy data={eliminationsByTeamData} />
      )}
    </div>
  )
}
