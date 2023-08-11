import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { CreateEntryBlock } from '@/features/components'
import { SelectProps } from '@/features/ui/Select/Select'
import { useGetPlayoffEntries, usePool } from '@/helpers'

import styles from './PlayoffPickByMembers.module.scss'
import { PlayoffTable } from './PlayoffTable'

const FilterByEntryAndMembersAndPastWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndPastWeeks'),
  { loading: () => <p>Loading...</p> },
)

export function PlayoffPickByMembers() {
  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )
  const [isCreateEntryShow, setIsCreateEntryShow] = useState(false)

  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))
  const { playoffEntriesData } = useGetPlayoffEntries({
    poolId: Number(poolId),
  })

  return (
    <div className={styles.wrapper}>
      {!!poolData && (
        <div>
          <FilterByEntryAndMembersAndPastWeeksLazy
            poolData={poolData}
            search={search}
            setSearch={setSearch}
            members={members}
            setMembers={setMembers}
            setMembersOptions={setMembersOptions}
            isDisabled={!playoffEntriesData?.entries.length}
            isCreateEntryShow={isCreateEntryShow}
            setIsCreateEntryShow={setIsCreateEntryShow}
            isCreateEntryButtonAlwaysActive
          />
        </div>
      )}

      <CreateEntryBlock
        isOpen={isCreateEntryShow}
        setIsOpen={setIsCreateEntryShow}
        wrapperClassName={styles.createEntryBlock}
      />
      {!!playoffEntriesData?.entries.length ? (
        <PlayoffTable
          playoffData={playoffEntriesData}
          search={search}
          members={members}
          membersOptions={membersOptions}
        />
      ) : (
        <>
          <div className={styles.noData}>
            Unfortunately, there are no entries in this pool. Try to create a
            new entry
          </div>
          <CreateEntryBlock
            isOpen={isCreateEntryShow}
            setIsOpen={setIsCreateEntryShow}
          />
        </>
      )}
    </div>
  )
}
