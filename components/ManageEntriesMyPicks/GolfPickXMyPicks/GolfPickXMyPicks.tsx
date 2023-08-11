import { useState } from 'react'

import { Pool, UserResponseData } from '@/api'
import {
  PickXEntriesTable,
  CreateEntryBlock,
  GolfEntriesCreateBlock,
} from '@/features/components'
import { useGetPoolEntries } from '@/helpers/hooks'

import styles from './GolfPickXMyPicks.module.scss'

export function GolfPickXMyPicks({
  userData,
  poolData,
}: {
  userData: UserResponseData
  poolData: Pool<'golf_pick_x'>
}) {
  const [isCreateEntryShow, setIsCreateEntryShow] = useState(false)

  const { poolEntriesData, poolEntriesIsLoading } =
    useGetPoolEntries<'golf_pick_x'>({
      poolId: poolData.id,
      userId: userData.id,
    })

  return (
    <div className={styles.wrapper}>
      {!poolEntriesIsLoading && (
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

          {poolData && (
            <PickXEntriesTable
              poolEntriesData={poolEntriesData}
              poolData={poolData}
            />
          )}
        </>
      )}
    </div>
  )
}
