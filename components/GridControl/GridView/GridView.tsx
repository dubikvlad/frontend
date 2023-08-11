import dynamic from 'next/dynamic'
import React from 'react'

import { Pool, PoolTypes } from '@/api'

const SquaresGridViewLazy = dynamic(
  () =>
    import('@/features/components/GridControl/GridView').then(
      (mod) => mod.SquaresGridView,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

const GolfSquaresGridViewLazy = dynamic(
  () =>
    import('@/features/components/GridControl/GridView').then(
      (mod) => mod.GolfSquaresGridView,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

export function GridView({ poolData }: { poolData: Pool<PoolTypes> }) {
  if (!poolData) return null

  switch (poolData.type) {
    case 'squares':
      return (
        <SquaresGridViewLazy
          poolData={poolData as unknown as Pool<'squares'>}
        />
      )
    case 'golf_squares':
      return (
        <GolfSquaresGridViewLazy
          poolData={poolData as unknown as Pool<'golf_squares'>}
        />
      )
    default:
      return null
  }
}
