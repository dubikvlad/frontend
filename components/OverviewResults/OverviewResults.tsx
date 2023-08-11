import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { Pool } from '@/api'
import { poolTypes } from '@/config/constants'
import { usePool } from '@/helpers'

const DefaultResultsLazy = dynamic(
  () => import('./DefaultResults').then((mod) => mod.DefaultResults),
  { loading: () => <p>Loading...</p> },
)

const PlayoffResultsLazy = dynamic(
  () => import('./PlayoffResults').then((mod) => mod.PlayoffResults),
  { loading: () => <p>Loading...</p> },
)

const GolfPickXResultsLazy = dynamic(
  () => import('./GolfPickXResults').then((mod) => mod.GolfPickXResults),
  { loading: () => <p>Loading...</p> },
)

export function OverviewResults() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  if (!poolData) return null

  switch (poolData.type) {
    case poolTypes.playoff:
      return <PlayoffResultsLazy />
    case poolTypes.golf_pick_x:
      return (
        <GolfPickXResultsLazy
          poolData={poolData as unknown as Pool<'golf_pick_x'>}
        />
      )
    default:
      return <DefaultResultsLazy />
  }
}
