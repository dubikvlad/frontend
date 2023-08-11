import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { tournamentName } from '@/config/constants'
import { usePool } from '@/helpers'

const BracketPickNBA = dynamic(
  () => import('./BracketPickNBA').then((mod) => mod.BracketPickNBA),
  { loading: () => <p>Loading...</p> },
)

const BracketPickNFL = dynamic(
  () => import('./BracketPickNFL').then((mod) => mod.BracketPickNFL),
  { loading: () => <p>Loading...</p> },
)

export function BracketsPickDistribution() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'bracket'>(Number(poolId))

  switch (poolData?.tournament.name) {
    case tournamentName.NBA:
      return <BracketPickNBA />
    case tournamentName.NFL:
      return <BracketPickNFL />
    default:
      return null
  }
}
