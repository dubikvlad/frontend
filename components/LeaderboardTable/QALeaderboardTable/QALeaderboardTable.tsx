import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { QALeaderboardForecast } from '@/api'
import { EntriesTable } from '@/features/components'
import type { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { SelectProps } from '@/features/ui/Select/Select'
import { useGetUser, useLeaderboard, usePool } from '@/helpers'
import { entriesFiltration } from '@/helpers'
import { entriesDataSorting } from '@/helpers'

import FilterByEntryAndMembersAndWeeks from '../../FilterByEntryAndMembersAndWeeks'

import styles from './QALeaderboardTable.module.scss'
import { theadList, generateTableData } from './QALeaderboardTableData'

export function QALeaderboardTable() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'qa'>(Number(poolId))

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )

  const { leaderboardData } = useLeaderboard<'qa'>({
    poolId: Number(poolId),
  })

  const leaderboardEntries = leaderboardData?.forecasts ?? []

  const filteredEntries = entriesFiltration<QALeaderboardForecast>({
    search,
    entries: leaderboardEntries,
    members,
    pathForSearch: ['entry', 'name'],
    pathForFiltersMembers: ['entry', 'user_id'],
  })

  const { userData } = useGetUser()

  const leaderboardRowObj: TBodyRowData<'qa'>[] = generateTableData({
    data: filteredEntries,
    currentUserId: userData?.id,
    questionsAmount: leaderboardData?.questions.length || 0,
  })

  const [sort, setSort] = useState<SortType<'qa'>>({
    name: null,
    type: null,
  })

  if (!poolData) return <></>

  const renderEntriesData: TBodyRowData<'qa'>[] = !sort.type
    ? leaderboardRowObj
    : entriesDataSorting<'qa'>(leaderboardRowObj, sort)

  const isDisabledFilters: boolean =
    !renderEntriesData.length && !members.length && !search

  return (
    <div className={styles.container}>
      <FilterByEntryAndMembersAndWeeks
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        setMembersOptions={setMembersOptions}
        poolData={poolData}
        isDisabled={isDisabledFilters}
      />
      {renderEntriesData.length ? (
        <EntriesTable
          theadList={theadList}
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
