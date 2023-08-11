import { useEffect, useMemo, useState } from 'react'

import { BracketPlayoffEntryItem, EntriesItem, Pool } from '@/api'
import { useGetPoolEntries, usePool } from '@/helpers'

import PlayoffBracketStep2 from './PlayoffBracketStep2'

export default function MakePickPageStep2({
  poolId,
  entryId,
}: {
  poolId: number
  entryId: number
}) {
  const { poolData, poolIsLoading } = usePool(poolId)
  const { poolEntriesData, poolEntriesIsLoading } = useGetPoolEntries({
    poolId,
  })
  const [currentEntry, setCurrentEntry] = useState<EntriesItem>()

  useEffect(() => {
    if (entryId && poolEntriesData && !poolEntriesIsLoading) {
      const foundEntry = poolEntriesData.find((entry) => entry.id === entryId)
      foundEntry && setCurrentEntry(foundEntry)
    }
  }, [entryId, poolEntriesData, poolEntriesIsLoading])

  const exactMakePickPage = useMemo(() => {
    switch (poolData?.type) {
      case 'bracket':
        return (
          <PlayoffBracketStep2
            poolData={poolData as unknown as Pool<'bracket'>}
            entry={currentEntry as unknown as BracketPlayoffEntryItem}
          />
        )
      default:
        return <></>
    }
  }, [currentEntry, poolData])

  if (poolIsLoading) return <></>

  return exactMakePickPage
}
