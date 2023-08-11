import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

import { Pool } from '@/api'
import { poolTypes } from '@/config/constants'
import { usePool } from '@/helpers'

const PickemMakePickPageLazy = dynamic(
  () =>
    import('@/features/pages/MakePickPage/PickemMakePickPage').then(
      (mod) => mod.PickemMakePickPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const SurvivorMakePickPageLazy = dynamic(
  () =>
    import('@/features/pages/MakePickPage/SurvivorMakePickPage').then(
      (mod) => mod.SurvivorMakePickPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const SquaresMakePickPageLazy = dynamic(
  () =>
    import('@/features/pages/MakePickPage/SquaresMakePickPage').then(
      (mod) => mod.SquaresMakePickPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const BracketMakePickPageLazy = dynamic(
  () => import('@/features/pages/MakePickPage/BracketMakePickPage'),
  { loading: () => <p>Loading...</p> },
)

const CreditsMakePickPageLazy = dynamic(
  () =>
    import('@/features/pages/MakePickPage/CreditsMakePickPage').then(
      (mod) => mod.CreditsMakePickPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const MarginMakePickPageLazy = dynamic(
  () =>
    import('@/features/pages/MakePickPage/MarginMakePickPage').then(
      (mod) => mod.MarginMakePickPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const PowerRankingPlayoffMakePickPageLazy = dynamic(() =>
  import('@/features/pages/MakePickPage/PowerRankingPlayoffMakePickPage').then(
    (mod) => mod.PowerRankingPlayoffMakePickPage,
  ),
)

const QAMakePickPageLazy = dynamic(
  () =>
    import('@/features/pages/MakePickPage/QAMakePickPage').then(
      (mod) => mod.QAMakePickPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfMajorsPickPageLazy = dynamic(() =>
  import('@/features/pages/MakePickPage/GolfMajorsPickPage').then(
    (mod) => mod.GolfMajorsPickPage,
  ),
)
const GolfPickXMakePickPageLazy = dynamic(
  () =>
    import('@/features/pages/MakePickPage/GolfPickXMakePickPage').then(
      (mod) => mod.GolfPickXMakePickPage,
    ),
  { loading: () => <p>Loading...</p> },
)

export function MakePickPage() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  return useMemo(() => {
    if (poolData && poolData.type) {
      switch (poolData.type) {
        case poolTypes.pick_em:
          return <PickemMakePickPageLazy poolData={poolData} />
        case poolTypes.survivor:
          return (
            <SurvivorMakePickPageLazy
              poolData={poolData as unknown as Pool<'survivor'>}
            />
          )
        case poolTypes.squares:
          return (
            <SquaresMakePickPageLazy
              poolData={poolData as unknown as Pool<'squares'>}
            />
          )
        case poolTypes.golf_squares:
          return (
            <SquaresMakePickPageLazy
              poolData={poolData as unknown as Pool<'squares'>}
            />
          )
        case poolTypes.bracket:
          return (
            <BracketMakePickPageLazy
              poolData={poolData as unknown as Pool<'bracket'>}
            />
          )
        case poolTypes.credits:
          return (
            <CreditsMakePickPageLazy
              poolData={poolData as unknown as Pool<'credits'>}
            />
          )
        case poolTypes.margin:
          return (
            <MarginMakePickPageLazy
              poolData={poolData as unknown as Pool<'margin'>}
            />
          )
        case poolTypes.playoff:
          return (
            <PowerRankingPlayoffMakePickPageLazy
              poolData={poolData as unknown as Pool<'playoff'>}
            />
          )
        case poolTypes.qa:
          return (
            <QAMakePickPageLazy poolData={poolData as unknown as Pool<'qa'>} />
          )

        case poolTypes.golf_majors:
          return (
            <GolfMajorsPickPageLazy
              poolData={poolData as unknown as Pool<'golf_majors'>}
            />
          )

        case poolTypes.golf_pick_x:
          return (
            <GolfPickXMakePickPageLazy
              poolData={poolData as unknown as Pool<'golf_pick_x'>}
            />
          )
        default:
          return null
      }
    }

    return null
  }, [poolData])
}
