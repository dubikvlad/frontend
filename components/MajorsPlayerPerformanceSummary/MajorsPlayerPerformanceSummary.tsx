import React, { useCallback, useState } from 'react'

import { GolfPlayerPerformanceSummaryResData, Pool } from '@/api'
import { EntriesTable, GolfSelectByTournaments } from '@/features/components'
import { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { useGetGolfPlayerPerformanceSummary } from '@/helpers'

import styles from './MajorsPlayerPerformanceSummary.module.scss'
import {
  generateTableData,
  theadList,
} from './MajorsPlayerPerformanceSummaryData'

export function MajorsPlayerPerformanceSummary({
  poolData,
}: {
  poolData: Pool<'golf_majors'>
}) {
  const [showDataId, setShowDataId] = useState<string>('')
  const [showTournamentTitle, setShowTournamentTitle] = useState<string>('')
  const [sort, setSort] = useState<
    SortType<'golf_majors_player_performance_summary'>
  >({
    name: null,
    type: null,
  })

  const { playerPerformanceSummary, isLoadingData } =
    useGetGolfPlayerPerformanceSummary({
      poolId: poolData.id,
      tournamentId: showDataId,
    })

  const sortedData = !sort.type
    ? playerPerformanceSummary
    : [...playerPerformanceSummary].sort(sortingData)

  const renderEntriesData: TBodyRowData<'golf_majors_player_performance_summary'>[] =
    generateTableData({
      data: sortedData,
    })

  function sortingData(
    a: GolfPlayerPerformanceSummaryResData,
    b: GolfPlayerPerformanceSummaryResData,
  ) {
    const A = a[sort.name as keyof GolfPlayerPerformanceSummaryResData]
    const B = b[sort.name as keyof GolfPlayerPerformanceSummaryResData]

    if (B === null) {
      return -1
    }

    if (sort.name === 'name') {
      if (sort.type === 'top') {
        return a[sort.name].localeCompare(b[sort.name])
      } else {
        return b[sort.name].localeCompare(a[sort.name])
      }
    }

    if (typeof A === 'number' && typeof B === 'number') {
      if (sort.type === 'top') {
        return A - B
      } else {
        return B - A
      }
    }

    return 0
  }

  const changeShowTournament = useCallback((id: string) => {
    setShowDataId(id)
  }, [])

  return (
    <>
      <div className={styles.wrap}>
        <GolfSelectByTournaments
          poolData={poolData}
          showDataId={showDataId}
          changeShowTournament={changeShowTournament}
          setShowTournamentTitle={setShowTournamentTitle}
        />
      </div>

      {renderEntriesData.length && !isLoadingData ? (
        <EntriesTable
          theadList={theadList}
          sort={sort}
          setSort={setSort}
          tbodyData={renderEntriesData}
          className={styles.grid}
        />
      ) : isLoadingData ? (
        <p>Loading...</p>
      ) : (
        <div className="not-found">
          {showDataId ? (
            <>
              Results are not yet available{' '}
              <>
                {showTournamentTitle ? (
                  <>
                    for <span>{showTournamentTitle}</span>
                  </>
                ) : (
                  ''
                )}
              </>
            </>
          ) : (
            <>
              Select <span>tournament</span> in the filter above to display its
              statistics here
            </>
          )}
        </div>
      )}
    </>
  )
}
