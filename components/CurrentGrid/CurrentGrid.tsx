import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React from 'react'

import { Pool } from '@/api'
import { usePool } from '@/helpers'

const SquaresCurrentGridLazy = dynamic(
  () =>
    import('@/features/components/CurrentGrid/SquaresCurrentGrid').then(
      (mod) => mod.SquaresCurrentGrid,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

const GolfSquaresCurrentGridLazy = dynamic(
  () =>
    import('@/features/components/CurrentGrid/GolfSquaresCurrentGrid').then(
      (mod) => mod.GolfSquaresCurrentGrid,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

export function CurrentGrid() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  if (!poolData) return null

  switch (poolData.type) {
    case 'squares':
      return (
        <SquaresCurrentGridLazy
          poolData={poolData as unknown as Pool<'squares'>}
        />
      )
    case 'golf_squares':
      return (
        <GolfSquaresCurrentGridLazy
          poolData={poolData as unknown as Pool<'golf_squares'>}
        />
      )
    default:
      return null
  }
}
