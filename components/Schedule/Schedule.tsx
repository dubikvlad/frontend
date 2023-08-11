import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { poolTypes } from '@/config/constants'
import { usePool } from '@/helpers'

const DefaultScheduleLazy = dynamic(
  () => import('./DefaultSchedule').then((mod) => mod.DefaultSchedule),
  { loading: () => <p>Loading...</p> },
)

const PlayoffScheduleLazy = dynamic(
  () => import('./PlayoffSchedule').then((mod) => mod.PlayoffSchedule),
  { loading: () => <p>Loading...</p> },
)

export default function Schedule() {
  const { query } = useRouter()
  const { poolData } = usePool(Number(query.poolId))

  if (!poolData) return null

  switch (poolData.type) {
    case poolTypes.playoff:
      return <PlayoffScheduleLazy />
    default:
      return <DefaultScheduleLazy />
  }
}
