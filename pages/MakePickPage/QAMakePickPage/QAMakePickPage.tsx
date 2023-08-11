import React, { useState } from 'react'

import { Pool, QAEntriesItem } from '@/api'
import { QAMainBlock, UserAndEntrySelects } from '@/features/components'
import { useGetPoolEntries } from '@/helpers'

import styles from './QAMakePickPage.module.scss'

export function QAMakePickPage({ poolData }: { poolData: Pool<'qa'> }) {
  const { poolEntriesData, poolEntriesMutate } = useGetPoolEntries<'qa'>({
    poolId: poolData.id,
  })

  const [selectedEntry, setSelectedEntry] = useState<QAEntriesItem | null>(null)

  return (
    <div>
      <h1>Make a Q&A Pick</h1>

      <p className={styles.description}>{poolData.pool_type.description}</p>

      <UserAndEntrySelects
        pickDeadline={poolData.pick_pool.pick_deadline}
        entriesData={poolEntriesData}
        mutateEntries={poolEntriesMutate}
        setSelectedEntry={setSelectedEntry}
        poolData={poolData}
      />

      <QAMainBlock
        poolData={poolData}
        currentEntry={selectedEntry}
        mutateEntries={poolEntriesMutate}
        sx={{ marginTop: '30px' }}
      />
    </div>
  )
}
