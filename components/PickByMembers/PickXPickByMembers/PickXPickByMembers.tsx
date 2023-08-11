import { useRouter } from 'next/router'
import { useState } from 'react'

import { GolfPickXEntriesItem, Pool } from '@/api'
import { CreateEntryBlock, PickXEntriesTable } from '@/features/components'
import FilterByEntryAndMembersAndPastWeeks from '@/features/components/FilterByEntryAndMembersAndPastWeeks'
import { useGetPoolEntries } from '@/helpers'

import styles from './PickXPickByMembers.module.scss'

export function PickXPickByMembers({
  poolData,
}: {
  poolData: Pool<'golf_pick_x'>
}) {
  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [isCreateEntryShow, setIsCreateEntryShow] = useState(false)

  const {
    query: { poolId },
  } = useRouter()

  const { poolEntriesData, poolEntriesIsLoading } =
    useGetPoolEntries<'golf_pick_x'>({
      poolId: Number(poolId),
    })

  function filtrationProcessing(
    poolEntriesData: GolfPickXEntriesItem[],
    members: string[],
    search: string,
  ) {
    if (!poolEntriesData.length) return []

    let data = [...poolEntriesData]

    if (members.length) {
      data = data.filter((item) => members.includes(String(item.user_id)))
    }

    if (!!search.trim()) {
      data = data.filter((item) =>
        item.name.trim().toLowerCase().includes(search.trim().toLowerCase()),
      )
    }

    return data
  }

  const filteredEntriesData = filtrationProcessing(
    poolEntriesData,
    members,
    search,
  )

  return (
    <div className={styles.wrapper}>
      <FilterByEntryAndMembersAndPastWeeks
        poolData={poolData}
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        isCreateEntryShow={isCreateEntryShow}
        setIsCreateEntryShow={setIsCreateEntryShow}
      />

      <CreateEntryBlock
        isOpen={isCreateEntryShow}
        setIsOpen={setIsCreateEntryShow}
      />

      {!poolEntriesIsLoading && search && !filteredEntriesData.length ? (
        <p className={styles.noData}>
          Sorry, there were no results found for{' '}
          <span>&quot;{search}&quot;</span>
        </p>
      ) : (
        <PickXEntriesTable
          poolEntriesData={filteredEntriesData}
          poolData={poolData}
        />
      )}
    </div>
  )
}
