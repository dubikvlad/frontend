import { useState } from 'react'

import { GolfMajorsEntriesItem, Pool } from '@/api'
import { CreateEntryBlock, GolfMajorsEntriesTable } from '@/features/components'
import FilterByEntryAndMembersAndPastWeeks from '@/features/components/FilterByEntryAndMembersAndPastWeeks'
import { useGetPoolEntries, useGetUser } from '@/helpers'

import styles from './GolfMajorsPickByMembers.module.scss'

function filtrationProcessing(
  poolEntriesData: GolfMajorsEntriesItem[],
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

export function GolfMajorsPickByMembers({
  poolData,
}: {
  poolData: Pool<'golf_majors'>
}) {
  const { userData } = useGetUser()

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])

  const [isCreateEntryShow, setIsCreateEntryShow] = useState(false)

  const { poolEntriesData, poolEntriesIsLoading, poolEntriesMutate } =
    useGetPoolEntries<'golf_majors'>({
      poolId: poolData.id,
    })

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
        isDisabled={!userData}
      />

      <CreateEntryBlock
        isOpen={isCreateEntryShow}
        setIsOpen={setIsCreateEntryShow}
      />

      {filteredEntriesData.length ? (
        <GolfMajorsEntriesTable
          poolEntriesData={filteredEntriesData}
          poolData={poolData}
          poolEntriesMutate={poolEntriesMutate}
          userData={userData}
        />
      ) : (
        !poolEntriesIsLoading &&
        (poolEntriesData.length ? (
          <p className={styles.noData}>
            {search.trim() ? (
              <>
                Sorry, there were no results found for{' '}
                <span>&quot;{search}&quot;</span>
              </>
            ) : (
              'Unfortunately, we did not find any suitable entries'
            )}
          </p>
        ) : (
          <p className={styles.noData}>You don’t seem to have any entries</p>
        ))
      )}
    </div>
  )
}
