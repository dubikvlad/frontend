import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { BracketLeaderboardEntries } from '@/api'
import { EntriesTable } from '@/features/components'
import type { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { SelectProps } from '@/features/ui/Select/Select'
import { useGetUser, useLeaderboard, usePool } from '@/helpers'
import { entriesFiltration } from '@/helpers'
import { entriesDataSorting } from '@/helpers'

import styles from './BracketLeaderboardTable.module.scss'
import {
  BracketLeaderboardTheadList,
  generateTableData,
} from './BracketLeaderboardTableData'

const FilterByEntryAndMembersAndWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndWeeks'),
  { loading: () => <p>Loading...</p> },
)

export function BracketLeaderboardTable() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'bracket'>(Number(poolId))

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )

  const { leaderboardData } = useLeaderboard<'bracket'>({
    poolId: Number(poolId),
    weekNumber: undefined,
  })

  const leaderboardEntries: BracketLeaderboardEntries[] =
    leaderboardData?.entries ?? []

  const filteredEntries = entriesFiltration<BracketLeaderboardEntries>({
    search,
    entries: leaderboardEntries,
    members,
    pathForSearch: ['entry', 'name'],
    pathForFiltersMembers: ['entry', 'user_id'],
  })

  const { userData } = useGetUser()

  const leaderboardRowObj: TBodyRowData[] = generateTableData(
    filteredEntries,
    userData?.id,
  )

  const [sort, setSort] = useState<SortType>({
    name: null,
    type: null,
  })

  if (!poolData) return <></>

  const renderEntriesData: TBodyRowData[] = !sort.type
    ? leaderboardRowObj
    : entriesDataSorting<'bracket'>(leaderboardRowObj, sort)

  const isDisabledFilters: boolean =
    !renderEntriesData.length && !members.length && !search

  return (
    <div className={styles.wrapper}>
      {poolData && (
        <FilterByEntryAndMembersAndWeeksLazy
          search={search}
          setSearch={setSearch}
          members={members}
          setMembers={setMembers}
          setMembersOptions={setMembersOptions}
          poolData={poolData}
          isDisabled={isDisabledFilters}
        />
      )}
      {renderEntriesData.length ? (
        <EntriesTable
          theadList={BracketLeaderboardTheadList}
          sort={sort}
          setSort={setSort}
          tbodyData={renderEntriesData}
          className={styles.grid}
        />
      ) : (
        <div className={styles.notFound}>
          {search.trim() ? (
            <>
              Sorry, there were no results found for{' '}
              <span>&quot;{search}&quot;</span>
            </>
          ) : (
            <>
              Unfortunately, we did not find any suitable entries for{' '}
              <span>
                {members.length
                  ? membersOptions
                      .reduce<string[]>((acc, option) => {
                        if (members.includes(option.name))
                          acc.push(option.title)
                        return acc
                      }, [])
                      .join(', ')
                  : 'All members'}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
