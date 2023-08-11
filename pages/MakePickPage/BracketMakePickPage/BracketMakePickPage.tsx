import dynamic from 'next/dynamic'
import React, { ReactElement } from 'react'

import { Pool } from '@/api'
import { tournamentName } from '@/config/constants'

const BracketNBAMakePickPageLazy = dynamic(
  () =>
    import('@/features/pages/MakePickPage').then(
      (mod) => mod.BracketNBAMakePickPage,
    ),
  { loading: () => <p>Loading...</p> },
)

const BracketNFLMakePickPageLazy = dynamic(
  () =>
    import('@/features/pages/MakePickPage').then(
      (mod) => mod.BracketNFLMakePickPage,
    ),
  { loading: () => <p>Loading...</p> },
)

export default function BracketMakePickPage({
  poolData,
}: {
  poolData: Pool<'bracket'>
}) {
  const getMakePickBracketContent = (): ReactElement | null => {
    switch (poolData?.tournament.name) {
      case tournamentName.NBA:
        return <BracketNBAMakePickPageLazy poolData={poolData} />
      case tournamentName.NFL:
        return <BracketNFLMakePickPageLazy poolData={poolData} />
      default:
        return null
    }
  }

  return <>{getMakePickBracketContent()}</>
}
