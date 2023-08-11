import { useRouter } from 'next/router'

import type { Event, PlayoffResultsEvent, ScopesCodes } from '@/api'
import {
  OverviewResultsEventNHLandNFL,
  OverviewResultsEventNBA,
  OverviewResultsEventMLB,
} from '@/features/components'
import { usePool } from '@/helpers'

export function OverviewResultsEvent({
  event,
  length,
  index,
  tournamentResultsScopes,
}: {
  event: Event | PlayoffResultsEvent
  length: number
  index: number
  tournamentResultsScopes: ScopesCodes[] | null | undefined
}) {
  const {
    query: { poolId },
  } = useRouter()
  const { poolData } = usePool(Number(poolId))

  const isNHL = poolData?.sport_id === 1
  const isNFL = poolData?.sport_id === 5
  const isNBA = poolData?.sport_id === 4
  const isMLB = poolData?.sport_id === 7

  return (
    <>
      {(isNHL || isNFL) && (
        <OverviewResultsEventNHLandNFL
          event={event}
          length={length}
          index={index}
          tournamentResultsScopes={tournamentResultsScopes}
        />
      )}

      {isNBA && (
        <OverviewResultsEventNBA
          event={event}
          length={length}
          index={index}
          tournamentResultsScopes={tournamentResultsScopes}
        />
      )}

      {isMLB && <OverviewResultsEventMLB event={event} />}
    </>
  )
}
