import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { Pool } from '@/api'
import { Info } from '@/assets/icons'
import { routes } from '@/config/constants'
import { useGrid } from '@/helpers'

import styles from './SquaresMakePickPage.module.scss'

const SquaresMakePickMainComponentLazy = dynamic(
  () =>
    import('@/features/components/SquaresMakePickMainComponent').then(
      (mod) => mod.SquaresMakePickMainComponent,
    ),
  { loading: () => <p>Loading...</p> },
)

export function SquaresMakePickPage({
  poolData,
}: {
  poolData: Pool<'squares'>
}) {
  const {
    query: { grid_id },
    push,
  } = useRouter()

  const { gridData } = useGrid({
    poolId: poolData.id,
    gridId: Number(grid_id),
  })

  useEffect(() => {
    if (!grid_id && poolData && push) {
      push(routes.account.gridControl(poolData.id))
    }
  }, [grid_id, poolData, push])

  if (!gridData) return null

  return (
    <div className={styles.wrapper}>
      <h1>
        Make a square pick <Info />
      </h1>

      <p className={styles.descriptionText}>
        Pick one team you think will win by clicking a team&apos;s box below.
        You can not pick the same team more than once during the season.
      </p>

      <SquaresMakePickMainComponentLazy />
    </div>
  )
}
