import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React from 'react'

import { Pool } from '@/api'
import { usePool } from '@/helpers'

const SurvivorPickAvailabilityLazy = dynamic(
  () =>
    import('@/features/components/PickAvailability/SurvivorPickAvailability'),
  { loading: () => <p>Loading...</p> },
)

const GolfPickXPickAvailabilityLazy = dynamic(
  () =>
    import('@/features/components/PickAvailability/GolfPickXPickAvailability'),
  { loading: () => <p>Loading...</p> },
)

export default function PickAvailability() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  function Content() {
    switch (poolData?.type) {
      case 'survivor':
        return (
          <SurvivorPickAvailabilityLazy
            poolData={poolData as unknown as Pool<'survivor'>}
          />
        )
      case 'golf_pick_x':
        return (
          <GolfPickXPickAvailabilityLazy
            poolData={poolData as unknown as Pool<'golf_pick_x'>}
          />
        )
      default:
        return <></>
    }
  }

  return <Content />
}
