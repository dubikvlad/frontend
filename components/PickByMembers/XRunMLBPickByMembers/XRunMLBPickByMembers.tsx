import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { XRunMLBEntriesItem } from '@/api'
import {
  EntriesTable,
  FilterByEntryAndMembersAndWeeks,
} from '@/features/components'
import { TBodyRowData, TheadData } from '@/features/components/EntriesTable'
import { SelectProps } from '@/features/ui/Select/Select'
import { entriesFiltration, useGetPoolEntries, usePool } from '@/helpers'

import styles from './XRunMLBPickByMembers.module.scss'
import {
  generateTableData,
  PickByMembersTheadList,
} from './XRunMLBPickByMembersData'

export function XRunMLBPickByMembers() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'xrun_mlb'>(Number(poolId))

  const { poolEntriesData } = useGetPoolEntries<'xrun_mlb'>({
    poolId: Number(poolId),
  })

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )

  const entriesWithForecast = poolEntriesData.filter(
    (entry) => entry.xrun_mlb_forecast,
  )

  const filteredEntries = entriesFiltration<XRunMLBEntriesItem>({
    search: search,
    entries: entriesWithForecast,
    members: members,
    pathForSearch: ['name'],
    pathForFiltersMembers: ['user_id'],
  })

  if (!filteredEntries || !poolData) return null

  const XRunMlb13TheadList: TheadData<'xrun_mlb_picks_by_members'> | null =
    poolEntriesData ? PickByMembersTheadList : null

  const renderEntriesData: TBodyRowData<'xrun_mlb_picks_by_members'>[] | null =
    filteredEntries ? generateTableData(filteredEntries) : null

  const isDisabledFilters: boolean =
    !renderEntriesData?.length && !members.length && !search

  return (
    <div className={styles.wrapper}>
      <FilterByEntryAndMembersAndWeeks
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        setMembersOptions={setMembersOptions}
        poolData={poolData}
        isDisabled={isDisabledFilters}
      />
      {!!renderEntriesData && renderEntriesData.length ? (
        <EntriesTable<'xrun_mlb_picks_by_members'>
          theadList={XRunMlb13TheadList}
          tbodyData={renderEntriesData}
          className={styles.grid}
          cellHeight="70px"
          defaultColorThead
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
