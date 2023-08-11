import classNames from 'classnames'
import { useRouter } from 'next/router'

import { HistoryResponseItem, Pool } from '@/api'
import { dateFormattingHistory } from '@/config/constants'
import { useHistoryReport, usePool } from '@/helpers'

import styles from './ModificationHistoryReport.module.scss'

export default function ModificationHistoryReport() {
  const {
    query: { poolId },
  } = useRouter()

  const { historyReportData, historyReportIsLoading } = useHistoryReport({
    poolId: Number(poolId),
  })

  const { poolData } = usePool(Number(poolId))

  if (!poolData) return <></>

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoBlock}>
        <p>
          The following is a list of picks that were entered/modified by your
          Pool Commissioner:
        </p>
      </div>

      <Table
        poolType={poolData.type}
        historyReportData={historyReportData}
        historyReportIsLoading={historyReportIsLoading}
      />
    </div>
  )
}

const Table = ({
  poolType,
  historyReportData,
  historyReportIsLoading,
}: {
  poolType: Pool['type']
  historyReportData: HistoryResponseItem[]
  historyReportIsLoading: boolean
}) => {
  const tableHead = generateTableHead(poolType)

  const tableBody = generateTableData({
    poolType,
    historyReportData,
  })

  return historyReportData.length ? (
    <div className={styles.historyBlock}>
      {tableHead}

      {tableBody}
    </div>
  ) : !historyReportIsLoading ? (
    <p className={styles.nonePicks}>
      <span>None of the Picks</span> have been changed by your Pool Commissioner
    </p>
  ) : (
    <></>
  )
}

const generateTableHead = (poolType: Pool['type']) => {
  const tHeadTitles = ['Date of change', 'Changed for']

  switch (poolType) {
    case 'bracket' || 'playoff':
      tHeadTitles.unshift('Season')
      break
    case 'golf_pick_x':
      tHeadTitles.unshift('Tournament')
      break
    default:
      tHeadTitles.unshift('Week')
  }

  return (
    <div className={classNames(styles.row, styles.head)}>
      {tHeadTitles.map((title, i) => (
        <p key={i}>{title}</p>
      ))}
    </div>
  )
}

const generateTableData = ({
  poolType,
  historyReportData,
}: {
  poolType: Pool['type']
  historyReportData: HistoryResponseItem[]
}) => {
  return historyReportData.map((report) => {
    function firstCol() {
      switch (poolType) {
        case 'playoff' || 'bracket':
          return 'Playoff'
        case 'golf_pick_x':
          return 'Tournament'
        default:
          return `Week ${report.week_number ?? ''}`
      }
    }

    return (
      <div key={report.id} className={styles.row}>
        <p>{firstCol()}</p>
        <p>{dateFormattingHistory({ text: report.created_at })}</p>
        <p>{report.name}</p>
      </div>
    )
  })
}
