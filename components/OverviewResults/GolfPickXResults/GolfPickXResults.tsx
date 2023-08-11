import React, { useCallback, useState } from 'react'

import { Pool } from '@/api'
import { EntriesTable, GolfSelectByTournaments } from '@/features/components'
import { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { entriesDataSorting, useGetGolfTournamentResults } from '@/helpers'

import styles from './GolfPickXResults.module.scss'
import { theadList, generateTableData } from './GolfPickXResultsData'

export function GolfPickXResults({
  poolData,
}: {
  poolData: Pool<'golf_pick_x'>
}) {
  const [showDataId, setShowDataId] = useState<string>('')
  const [showTournamentTitle, setShowTournamentTitle] = useState<string>('')
  const [sort, setSort] = useState<SortType<'golf_pick_x_results'>>({
    name: null,
    type: null,
  })

  const { tournamentResults, isLoadingData } = useGetGolfTournamentResults({
    poolId: poolData.id,
    tournamentId: showDataId,
  })

  const leaderboardRowObj: TBodyRowData<'golf_pick_x_results'>[] =
    generateTableData({
      data: tournamentResults,
    })

  const renderEntriesData: TBodyRowData<'golf_pick_x_results'>[] = !sort.type
    ? leaderboardRowObj
    : entriesDataSorting<'golf_pick_x_results'>(leaderboardRowObj, sort)

  const changeShowTournament = useCallback((id: string) => {
    setShowDataId(id)
  }, [])

  return (
    <>
      <GolfSelectByTournaments
        poolData={poolData}
        showDataId={showDataId}
        changeShowTournament={changeShowTournament}
        setShowTournamentTitle={setShowTournamentTitle}
      />

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
