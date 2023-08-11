import { useState } from 'react'

import { UserResponseData, Pool } from '@/api'
import {
  CreateEntryBlock,
  GolfEntriesCreateBlock,
  GolfMajorsEntriesTable,
} from '@/features/components'
import { useGetPoolEntries } from '@/helpers'

import styles from './GolfMajorsManageEntriesMyPicks.module.scss'

export function GolfMajorsManageEntriesMyPicks({
  userData,
  poolData,
}: {
  userData: UserResponseData
  poolData: Pool<'golf_majors'>
}) {
  const [isCreateEntryShow, setIsCreateEntryShow] = useState(false)

  const { poolEntriesData, poolEntriesIsLoading, poolEntriesMutate } =
    useGetPoolEntries<'golf_majors'>({
      poolId: poolData.id,
      userId: userData.id,
    })

  return (
    <div className={styles.wrapper}>
      {poolEntriesData.length ? (
        <>
          <GolfEntriesCreateBlock
            poolEntriesData={poolEntriesData}
            poolData={poolData}
            poolEntriesIsLoading={poolEntriesIsLoading}
            isCreateEntryShow={isCreateEntryShow}
            setIsCreateEntryShow={setIsCreateEntryShow}
          />

          <CreateEntryBlock
            isOpen={isCreateEntryShow}
            setIsOpen={setIsCreateEntryShow}
          />

          <GolfMajorsEntriesTable
            poolEntriesData={poolEntriesData}
            poolData={poolData}
            poolEntriesMutate={poolEntriesMutate}
            userData={userData}
          />
        </>
      ) : (
        !poolEntriesIsLoading && (
          <div className={styles.noData}>
            <p>
              You don’t seem to have any entries. Try to{' '}
              <span onClick={() => setIsCreateEntryShow(true)}>
                Create a New Entry
              </span>
            </p>
          </div>
        )
      )}
    </div>
  )
}
