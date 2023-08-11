import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { Pool, PoolTypes } from '@/api'
import { poolTypes } from '@/config/constants'
import { useGetUser, usePool } from '@/helpers'

const PickemManageEntriesMyPicksLazy = dynamic(
  () =>
    import(
      '@/features/components/ManageEntriesMyPicks/PickemManageEntriesMyPicks'
    ).then((mod) => mod.PickemManageEntriesMyPicks),
  { loading: () => <p>Loading...</p> },
)

const SurvivorManageEntriesMyPicksLazy = dynamic(
  () =>
    import(
      '@/features/components/ManageEntriesMyPicks/SurvivorManageEntriesMyPicks'
    ).then((mod) => mod.SurvivorManageEntriesMyPicks),
  { loading: () => <p>Loading...</p> },
)

const BracketManageEntriesMyPicksLazy = dynamic(
  () =>
    import(
      '@/features/components/ManageEntriesMyPicks/BracketManageEntriesMyPicks'
    ).then((mod) => mod.BracketManageEntriesMyPicks),
  { loading: () => <p>Loading...</p> },
)

const CreditsManageEntriesMyPicksLazy = dynamic(
  () =>
    import(
      '@/features/components/ManageEntriesMyPicks/CreditsManageEntriesMyPicks'
    ).then((mod) => mod.CreditsManageEntriesMyPicks),
  { loading: () => <p>Loading...</p> },
)

const MarginManageEntriesMyPicksLazy = dynamic(
  () =>
    import(
      '@/features/components/ManageEntriesMyPicks/MarginManageEntriesMyPicks'
    ).then((mod) => mod.MarginManageEntriesMyPicks),
  { loading: () => <p>Loading...</p> },
)

const XRunMLBManageEntriesMyPicksLazy = dynamic(
  () =>
    import(
      'features/components/ManageEntriesMyPicks/XRunMLBManageEntriesMyPicks'
    ).then((mod) => mod.XRunMLBManageEntriesMyPicks),
  { loading: () => <p>Loading...</p> },
)

const QAManageEntriesMyPicksLazy = dynamic(
  () =>
    import(
      '@/features/components/ManageEntriesMyPicks/QAManageEntriesMyPicks'
    ).then((mod) => mod.QAManageEntriesMyPicks),
  { loading: () => <p>Loading...</p> },
)

const PowerRankingPlayoffManageEntriesMyPicksLazy = dynamic(
  () =>
    import(
      '@/features/components/ManageEntriesMyPicks/PowerRankingPlayoffManageEntriesMyPicks'
    ).then((mod) => mod.PowerRankingPlayoffManageEntriesMyPicks),
  { loading: () => <p>Loading...</p> },
)

const GolfSquaresMyPicksLazy = dynamic(
  () =>
    import(
      '@/features/components/ManageEntriesMyPicks/GolfSquaresMyPicks'
    ).then((mod) => mod.GolfSquaresMyPicks),
  { loading: () => <p>Loading...</p> },
)

const GolfPickXMyPicksLazy = dynamic(
  () =>
    import('@/features/components/ManageEntriesMyPicks/GolfPickXMyPicks').then(
      (mod) => mod.GolfPickXMyPicks,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfMajorsManageEntriesMyPicksLazy = dynamic(
  () =>
    import(
      '@/features/components/ManageEntriesMyPicks/GolfMajorsManageEntriesMyPicks'
    ).then((mod) => mod.GolfMajorsManageEntriesMyPicks),
  { loading: () => <p>Loading...</p> },
)

export default function ManageEntriesMyPicks() {
  const {
    query: { poolId },
  } = useRouter()

  const { userData } = useGetUser()
  const { poolData } = usePool<PoolTypes>(Number(poolId))

  if (!poolData || !userData) return null

  const getPage = () => {
    switch (poolData.type) {
      case poolTypes.pick_em:
        return (
          <PickemManageEntriesMyPicksLazy
            poolData={poolData as Pool<'pick_em'>}
            userData={userData}
          />
        )

      case poolTypes.survivor:
        return (
          <SurvivorManageEntriesMyPicksLazy
            poolData={poolData as Pool<'survivor'>}
            userData={userData}
          />
        )

      case poolTypes.bracket:
        return (
          <BracketManageEntriesMyPicksLazy
            poolData={poolData as Pool<'bracket'>}
            userData={userData}
          />
        )

      case poolTypes.credits:
        return (
          <CreditsManageEntriesMyPicksLazy
            poolData={poolData as Pool<'credits'>}
            userData={userData}
          />
        )

      case poolTypes.margin:
        return (
          <MarginManageEntriesMyPicksLazy
            poolData={poolData as Pool<'margin'>}
            userData={userData}
          />
        )

      case poolTypes.xrun_mlb:
        return (
          <XRunMLBManageEntriesMyPicksLazy
            poolData={poolData as Pool<'xrun_mlb'>}
            userData={userData}
          />
        )

      case poolTypes.qa:
        return (
          <QAManageEntriesMyPicksLazy
            poolData={poolData as Pool<'qa'>}
            userData={userData}
          />
        )

      case poolTypes.playoff:
        return (
          <PowerRankingPlayoffManageEntriesMyPicksLazy
            poolData={poolData as Pool<'playoff'>}
            userData={userData}
          />
        )

      case poolTypes.golf_squares:
        return <GolfSquaresMyPicksLazy />

      case poolTypes.golf_pick_x:
        return (
          <GolfPickXMyPicksLazy
            poolData={poolData as Pool<'golf_pick_x'>}
            userData={userData}
          />
        )

      case poolTypes.golf_majors:
        return (
          <GolfMajorsManageEntriesMyPicksLazy
            poolData={poolData as Pool<'golf_majors'>}
            userData={userData}
          />
        )

      default:
        return null
    }
  }

  return getPage()
}
