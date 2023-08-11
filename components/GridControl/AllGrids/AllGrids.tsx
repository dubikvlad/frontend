import dynamic from 'next/dynamic'
import React from 'react'

import { Pool } from '@/api'

const SquaresAllGridsLazy = dynamic(
  () =>
    import('@/features/components/GridControl/AllGrids').then(
      (mod) => mod.SquaresAllGrids,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

const GolfSquaresAllGridsLazy = dynamic(
  () =>
    import('@/features/components/GridControl/AllGrids').then(
      (mod) => mod.GolfSquaresAllGrids,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

export function AllGrids({ poolData }: { poolData: Pool }) {
  if (!poolData) return null

  switch (poolData.type) {
    case 'squares':
      return (
        <SquaresAllGridsLazy
          poolData={poolData as unknown as Pool<'squares'>}
        />
      )
    case 'golf_squares':
      return (
        <GolfSquaresAllGridsLazy
          poolData={poolData as unknown as Pool<'golf_squares'>}
        />
      )
    default:
      return null
  }
}
