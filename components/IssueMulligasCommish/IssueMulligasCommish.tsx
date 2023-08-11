import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

import { IssueMulligans } from '@/features/components'
import { Select2 } from '@/features/ui'
import { usePool } from '@/helpers'

import styles from './IssueMulligasCommish.module.scss'

export function IssueMulligasCommish() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const [currentWeek, setCurrentWeek] = useState(
    String(poolData?.pick_pool.current_week),
  )

  const weekOptions = useMemo(() => {
    const availableWeek = poolData?.available_week ?? []

    return [
      ...availableWeek.map((item) => ({
        title: `Week ${item}`,
        name: String(item),
      })),
    ]
  }, [poolData])

  return (
    <div>
      <div className={styles.weeks}>
        <Select2
          value={currentWeek}
          onChange={setCurrentWeek}
          options={weekOptions}
        />
      </div>
      <IssueMulligans currentWeek={currentWeek} commish />
    </div>
  )
}
