import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { Pool } from '@/api'
import { usePool } from '@/helpers'

const PickemPickByMembersLazy = dynamic(
  () =>
    import('@/features/components/PickByMembers/PickemPickByMembers').then(
      (mod) => mod.PickemPickByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

const BracketPickByMembersLazy = dynamic(
  () =>
    import('@/features/components/PickByMembers/BracketPickByMembers').then(
      (mod) => mod.BracketPickByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

const CreditsPickByMembersLazy = dynamic(
  () =>
    import('@/features/components/PickByMembers/CreditsPickByMembers').then(
      (mod) => mod.CreditsPickByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

const PlayoffPickByMembersLazy = dynamic(() =>
  import('@/features/components/PickByMembers/PlayoffPickByMembers').then(
    (mod) => mod.PlayoffPickByMembers,
  ),
)

const XRunMLBPickByMembersLazy = dynamic(
  () =>
    import('features/components/PickByMembers/XRunMLBPickByMembers').then(
      (mod) => mod.XRunMLBPickByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

const XRunPickByMembersLazy = dynamic(
  () =>
    import('features/components/PickByMembers/XRunPickByMembers').then(
      (mod) => mod.XRunPickByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

const QAPickByMembersLazy = dynamic(
  () =>
    import('features/components/PickByMembers/QAPickByMembers').then(
      (mod) => mod.QAPickByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfSquaresPicksByMembersLazy = dynamic(
  () =>
    import('features/components/PickByMembers/GolfSquaresPicksByMembers').then(
      (mod) => mod.GolfSquaresPicksByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

const SquaresPicksByMembersLazy = dynamic(
  () =>
    import('features/components/PickByMembers/SquaresPickByMembers').then(
      (mod) => mod.SquaresPickByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

const PickXPicksByMembersLazy = dynamic(
  () =>
    import('features/components/PickByMembers/PickXPickByMembers').then(
      (mod) => mod.PickXPickByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfMajorsPickByMembersLazy = dynamic(
  () =>
    import('features/components/PickByMembers/GolfMajorsPickByMembers').then(
      (mod) => mod.GolfMajorsPickByMembers,
    ),
  { loading: () => <p>Loading...</p> },
)

export default function PickByMembers() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  function switchResult() {
    if (!poolData) return null

    switch (poolData.type) {
      case 'pick_em':
        return <PickemPickByMembersLazy />
      case 'bracket':
        return <BracketPickByMembersLazy />
      case 'credits':
        return <CreditsPickByMembersLazy />
      case 'playoff':
        return <PlayoffPickByMembersLazy />
      case 'xrun_mlb':
        return <XRunMLBPickByMembersLazy />
      case 'xrun':
        return <XRunPickByMembersLazy />
      case 'qa':
        return <QAPickByMembersLazy />
      case 'squares':
        return (
          <SquaresPicksByMembersLazy
            poolData={poolData as unknown as Pool<'squares'>}
          />
        )
      case 'golf_squares':
        return (
          <GolfSquaresPicksByMembersLazy
            poolData={poolData as unknown as Pool<'golf_squares'>}
          />
        )
      case 'golf_pick_x':
        return (
          <PickXPicksByMembersLazy
            poolData={poolData as unknown as Pool<'golf_pick_x'>}
          />
        )
      case 'golf_majors':
        return (
          <GolfMajorsPickByMembersLazy
            poolData={poolData as unknown as Pool<'golf_majors'>}
          />
        )
      default:
        return null
    }
  }

  return switchResult()
}
