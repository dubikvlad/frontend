import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

import { Pool } from '@/api'
import { usePool } from '@/helpers'

const BracketsPickDistributionLazy = dynamic(
  () =>
    import('./BracketsPickDistribution').then(
      (mod) => mod.BracketsPickDistribution,
    ),
  { loading: () => <p>Loading...</p> },
)

const QAPickDistributionLazy = dynamic(
  () => import('./QAPickDistribution').then((mod) => mod.QAPickDistribution),
  { loading: () => <p>Loading...</p> },
)

export function PickDistribution() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  function switchResult() {
    if (!poolData) return null

    switch (poolData.type) {
      // case 'pick_em':
      //   return <PickemPickByMembersLazy />
      case 'bracket':
        return <BracketsPickDistributionLazy />
      case 'qa':
        return (
          <QAPickDistributionLazy
            poolData={poolData as unknown as Pool<'qa'>}
          />
        )
      default:
        return null
    }
  }

  return switchResult()
}
