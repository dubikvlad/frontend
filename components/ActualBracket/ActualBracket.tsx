import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { ReactElement } from 'react'

import { bracketTreePageType, tournamentName } from '@/config/constants'
import { useGetTournamentResultsByPool, usePool } from '@/helpers'

const BracketTournamentTreeNBALazy = dynamic(
  () =>
    import('@/features/components').then((mod) => mod.BracketTournamentTreeNBA),
  { loading: () => <p>Loading...</p> },
)

const ActualBracketTreeNFLLazy = dynamic(
  () => import('@/features/components').then((mod) => mod.ActualBracketTreeNFL),
  { loading: () => <p>Loading...</p> },
)

export default function ActualBracket() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'bracket'>(Number(poolId))

  const { tournamentResult } = useGetTournamentResultsByPool(String(poolId))

  const getActualBracketContent = (): ReactElement | null => {
    switch (poolData?.tournament.name) {
      case tournamentName.NBA:
        return (
          <BracketTournamentTreeNBALazy
            pageType={bracketTreePageType.result}
            roundsData={tournamentResult}
          />
        )
      case tournamentName.NFL:
        return <ActualBracketTreeNFLLazy roundsData={tournamentResult} />
      default:
        return null
    }
  }

  return <>{getActualBracketContent()}</>
}
