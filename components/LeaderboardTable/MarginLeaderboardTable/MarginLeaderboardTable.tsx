import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { MarginLeaderboardResponseDataItem } from '@/api'
import { EntriesTable } from '@/features/components'
import type { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { FilterByEntryAndMembersAndWeeksProps } from '@/features/components/FilterByEntryAndMembersAndWeeks'
import { SelectProps } from '@/features/ui/Select/Select'
import { useGetUser, useLeaderboard, usePool } from '@/helpers'
import { entriesFiltration } from '@/helpers'
import { entriesDataSorting } from '@/helpers'

import styles from './MarginLeaderboardTable.module.scss'
import {
  generateTableData,
  MarginLeaderboardTheadList,
} from './MarginLeaderboardTableData'

const FilterByEntryAndMembersAndWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndWeeks'),
  { loading: () => <p>Loading...</p> },
)

export function MarginLeaderboardTable() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'margin'>(Number(poolId))

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )
  const [wholeSeason, setWholeSeason] =
    useState<FilterByEntryAndMembersAndWeeksProps['wholeSeason']>(
      'whole-season',
    )
  const [weekOptions, setWeekOptions] = useState<SelectProps['options']>([])

  const [sort, setSort] = useState<SortType<'margin'>>({
    name: null,
    type: null,
  })

  const { leaderboardData } = useLeaderboard<'margin'>({
    poolId: Number(poolId),
  })

  const { userData } = useGetUser()

  if (!leaderboardData || !poolData) return null

  const leaderboardEntries =
    wholeSeason && wholeSeason !== 'whole-season'
      ? leaderboardData?.weeks[wholeSeason]
      : leaderboardData.all
      ? Object.values(leaderboardData.all)
      : []

  const filteredEntries = entriesFiltration<MarginLeaderboardResponseDataItem>({
    search,
    entries: leaderboardEntries,
    members,
    pathForSearch: ['name'],
    pathForFiltersMembers: ['user_id'],
  })

  const leaderboardRowObj: TBodyRowData<'margin'>[] = generateTableData(
    filteredEntries,
    userData?.id,
  )

  const renderEntriesData: TBodyRowData<'margin'>[] = !sort.type
    ? leaderboardRowObj
    : entriesDataSorting(leaderboardRowObj, sort)

  const isDisabledFilters: boolean =
    !renderEntriesData.length &&
    !members.length &&
    !search &&
    wholeSeason === 'whole-season'

  return (
    <div className={styles.wrapper}>
      {poolData && (
        <FilterByEntryAndMembersAndWeeksLazy
          search={search}
          setSearch={setSearch}
          members={members}
          setMembers={setMembers}
          setMembersOptions={setMembersOptions}
          wholeSeason={wholeSeason}
          setWholeSeason={setWholeSeason}
          poolData={poolData}
          isDisabled={isDisabledFilters}
          setWeekOptions={setWeekOptions}
        />
      )}
      {renderEntriesData.length ? (
        <EntriesTable<'margin'>
          theadList={MarginLeaderboardTheadList}
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
              Unfortunately, we did not find any suitable entries for the{' '}
              <span>
                {weekOptions.find((item) => item.name === wholeSeason)?.title}
              </span>{' '}
              for{' '}
              <span>
                {members.length
                  ? membersOptions
                      .reduce<string[]>((acc, option) => {
                        if (members.includes(option.name))
                          acc.push(option.title)
                        return acc
                      }, [])
                      .join(', ')
                  : 'All members'}{' '}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
