import { useRouter } from 'next/router'
import React from 'react'

import { EntriesTable } from '@/features/components'
import type {
  TBodyRowData,
  TheadData,
} from '@/features/components/EntriesTable'
import { useLeaderboard } from '@/helpers'

import styles from './XRunMLBLeaderboardTable.module.scss'
import {
  generateTableData,
  xRunMLBLeaderboardTheadList,
} from './XRunMLBLeaderboardTableData'

export function XRunMLBLeaderboardTable() {
  const {
    query: { poolId },
  } = useRouter()

  const { leaderboardData } = useLeaderboard<'xrun_mlb'>({
    poolId: Number(poolId),
  })

  const theadList: TheadData<'xrun_mlb'> | null = leaderboardData
    ? xRunMLBLeaderboardTheadList(leaderboardData)
    : null

  const renderEntriesData: TBodyRowData<'xrun_mlb'>[] | null = leaderboardData
    ? generateTableData(leaderboardData)
    : null

  if (!leaderboardData) return null

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {!!renderEntriesData && renderEntriesData.length ? (
          <EntriesTable<'xrun_mlb'>
            theadList={theadList}
            tbodyData={renderEntriesData}
            className={styles.grid}
            cellHeight="60px"
            defaultColorThead
          />
        ) : (
          <div className={styles.notFound}>
            Unfortunately, we did not find any suitable entries
          </div>
        )}
      </div>
    </div>
  )
}
