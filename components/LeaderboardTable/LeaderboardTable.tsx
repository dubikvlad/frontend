import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { Pool, PoolTypes } from '@/api'
import { poolTypes } from '@/config/constants'
import { usePool } from '@/helpers'

const PickemLeaderboardTableLazy = dynamic(
  () =>
    import(
      '@/features/components/LeaderboardTable/PickemLeaderboardTable'
    ).then((mod) => mod.PickemLeaderboardTable),
  {
    loading: () => <p>Loading...</p>,
  },
)

const SurvivorLeaderboardTableLazy = dynamic(
  () =>
    import(
      '@/features/components/LeaderboardTable/SurvivorLeaderboardTable'
    ).then((mod) => mod.SurvivorLeaderboardTable),
  {
    loading: () => <p>Loading...</p>,
  },
)

const BracketLeaderboardTableLazy = dynamic(
  () =>
    import(
      '@/features/components/LeaderboardTable/BracketLeaderboardTable'
    ).then((mod) => mod.BracketLeaderboardTable),
  {
    loading: () => <p>Loading...</p>,
  },
)

const CreditsLeaderboardTableLazy = dynamic(
  () =>
    import(
      '@/features/components/LeaderboardTable/CreditsLeaderboardTable'
    ).then((mod) => mod.CreditsLeaderboardTable),
  {
    loading: () => <p>Loading...</p>,
  },
)

const MarginLeaderboardTableLazy = dynamic(
  () =>
    import(
      '@/features/components/LeaderboardTable/MarginLeaderboardTable'
    ).then((mod) => mod.MarginLeaderboardTable),
  {
    loading: () => <p>Loading...</p>,
  },
)

const PlayoffLeaderboardTableLazy = dynamic(() =>
  import('@/features/components/LeaderboardTable/PlayoffLeaderboardTable').then(
    (mod) => mod.PlayoffLeaderboardTable,
  ),
)

const XRunMLBLeaderboardTableLazy = dynamic(
  () =>
    import('features/components/LeaderboardTable/XRunMLBLeaderboardTable').then(
      (mod) => mod.XRunMLBLeaderboardTable,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

const XRunLeaderboardTableLazy = dynamic(
  () =>
    import('features/components/LeaderboardTable/XRunLeaderboardTable').then(
      (mod) => mod.XRunLeaderboardTable,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

const QALeaderboardTableLazy = dynamic(
  () =>
    import('features/components/LeaderboardTable/QALeaderboardTable').then(
      (mod) => mod.QALeaderboardTable,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

const GolfPickXLeaderboardTableLazy = dynamic(
  () =>
    import(
      'features/components/LeaderboardTable/GolfPickXLeaderboardTable'
    ).then((mod) => mod.GolfPickXLeaderboardTable),
  {
    loading: () => <p>Loading...</p>,
  },
)

const MajorsLeaderboardTableLazy = dynamic(
  () =>
    import('features/components/LeaderboardTable/MajorsLeaderboardTable').then(
      (mod) => mod.MajorsLeaderboardTable,
    ),
  {
    loading: () => <p>Loading...</p>,
  },
)

export default function LeaderboardTable() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  if (!poolData) return null

  const poolType: PoolTypes = poolData.type
  const getLeaderboardTableContent = (): ReactElement | null => {
    switch (poolType) {
      case poolTypes.pick_em:
        return <PickemLeaderboardTableLazy />
      case poolTypes.survivor:
        return <SurvivorLeaderboardTableLazy />
      case poolTypes.bracket:
        return <BracketLeaderboardTableLazy />
      case poolTypes.credits:
        return <CreditsLeaderboardTableLazy />
      case poolTypes.margin:
        return <MarginLeaderboardTableLazy />
      case poolTypes.playoff:
        return <PlayoffLeaderboardTableLazy />
      case poolTypes.xrun_mlb:
        return <XRunMLBLeaderboardTableLazy />
      case poolTypes.xrun:
        return <XRunLeaderboardTableLazy />
      case poolTypes.qa:
        return <QALeaderboardTableLazy />
      case poolTypes.golf_pick_x:
        return (
          <GolfPickXLeaderboardTableLazy
            poolData={poolData as unknown as Pool<'golf_pick_x'>}
          />
        )
      case poolTypes.golf_majors:
        return (
          <MajorsLeaderboardTableLazy
            poolData={poolData as unknown as Pool<'golf_majors'>}
          />
        )
      default:
        return null
    }
  }

  return <>{getLeaderboardTableContent()}</>
}
