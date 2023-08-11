import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { EntriesTable, HorizontalFilterByWeek } from '@/features/components'
import { TBodyRowData, TheadData } from '@/features/components/EntriesTable'
import { useGetPoolEntries, usePool } from '@/helpers'

import styles from './XRunPickByMembers.module.scss'
import {
  generateTableData,
  pickByMembersTheadList,
} from './XRunPickByMembersData'

export function XRunPickByMembers() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const { poolEntriesData } = useGetPoolEntries<'xrun'>({
    poolId: Number(poolId),
  })

  const [currentWeek, setCurrentWeek] = useState<number | null>(null)

  if (!poolEntriesData || !poolData) return null

  const theadList: TheadData<'xrun_picks_by_members'> | null = poolEntriesData
    ? pickByMembersTheadList
    : null

  const renderEntriesData: TBodyRowData<'xrun_picks_by_members'>[] =
    poolEntriesData
      ? generateTableData({ data: poolEntriesData, currentWeek })
      : []

  return (
    <div className={styles.container}>
      <HorizontalFilterByWeek
        allWeeks={poolData.all_weeks}
        availableWeeks={poolData.available_week}
        currentWeek={Number(poolData.pick_pool.current_week)}
        startWeek={Number(poolData.pick_pool.start_week)}
        setSelectedWeek={setCurrentWeek}
        slidesPerView={9}
      />
      {!!renderEntriesData && renderEntriesData.length ? (
        <EntriesTable<'xrun_picks_by_members'>
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
