import React from 'react'

import { Pool, UserResponseData } from '@/api'
import { EntriesTable } from '@/features/components'
import { TBodyRowData, TheadData } from '@/features/components/EntriesTable'
import {
  manageEntriesMyPicksTheadList,
  generateTableData,
} from '@/features/components/ManageEntriesMyPicks/XRunMLBManageEntriesMyPicks/ManageEntriesMyPicksTableData'
import { useGetPoolEntries } from '@/helpers'

import styles from './XRunMLBManageEntriesMyPicks.module.scss'

export function XRunMLBManageEntriesMyPicks({
  poolData,
  userData,
}: {
  poolData: Pool<'xrun_mlb'>
  userData: UserResponseData
}) {
  const { poolEntriesData } = useGetPoolEntries<'xrun_mlb'>({
    poolId: poolData.id,
    userId: userData?.id,
  })

  if (!poolEntriesData.length) return null

  const theadList: TheadData<'xrun_mlb_my_picks'> | null = poolEntriesData
    ? manageEntriesMyPicksTheadList
    : null

  const renderEntriesData: TBodyRowData<'xrun_mlb_my_picks'>[] | null =
    poolEntriesData ? generateTableData(poolEntriesData) : null

  return (
    <div className={styles.wrapper}>
      {!!renderEntriesData && renderEntriesData.length ? (
        <EntriesTable<'xrun_mlb_my_picks'>
          theadList={theadList}
          tbodyData={renderEntriesData}
          className={styles.grid}
          cellHeight="70px"
          defaultColorThead
        />
      ) : (
        <div className={styles.notFound}>
          Unfortunately, we did not find any suitable entries
        </div>
      )}
    </div>
  )
}
