import React, { useCallback, useMemo, useState } from 'react'

import { GolfPlayerValueSummaryResData, Pool } from '@/api'
import { EntriesTable, GolfSelectByTournaments } from '@/features/components'
import { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { useGetGolfPlayerValueSummary } from '@/helpers'

import styles from './MajorsPlayerValueSummary.module.scss'
import { generateTableData, theadList } from './MajorsPlayerValueSummaryData'

export function MajorsPlayerValueSummary({
  poolData,
}: {
  poolData: Pool<'golf_majors'>
}) {
  const [showDataId, setShowDataId] = useState<string>('')
  const [showTournamentTitle, setShowTournamentTitle] = useState<string>('')
  const [sort, setSort] = useState<
    SortType<'golf_majors_player_value_summary'>
  >({
    name: null,
    type: null,
  })

  const { playerValueSummary, isLoadingData } = useGetGolfPlayerValueSummary({
    poolId: poolData.id,
    tournamentId: showDataId,
  })

  const sortedData = !sort.type
    ? playerValueSummary
    : [...playerValueSummary].sort(sortingData)

  const maxScaleValue = useMemo(() => {
    return [...sortedData].reduce(
      (maxValue, curVal) => (maxValue < curVal.value ? curVal.value : maxValue),
      0,
    )
  }, [sortedData])

  const renderEntriesData: TBodyRowData<'golf_majors_player_value_summary'>[] =
    generateTableData({
      data: sortedData,
      maxScaleValue,
    })

  function sortingData(
    a: GolfPlayerValueSummaryResData,
    b: GolfPlayerValueSummaryResData,
  ) {
    const A = a[sort.name as keyof GolfPlayerValueSummaryResData]
    const B = b[sort.name as keyof GolfPlayerValueSummaryResData]

    if (sort.name === 'name') {
      if (sort.type === 'top') {
        return a[sort.name].localeCompare(b[sort.name])
      } else {
        return b[sort.name].localeCompare(a[sort.name])
      }
    }

    if (sort.name === 'salary') {
      const A = Number(a.salary.split(',').join(''))
      const B = Number(b.salary.split(',').join(''))

      if (sort.type === 'top') {
        return A - B
      } else {
        return B - A
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
      <div className={styles.selectWrap}>
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
