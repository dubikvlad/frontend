import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'

import type { WeeklyPickDistributionResponseData } from '@/api'
import { Select2 } from '@/features/ui'
import { usePool } from '@/helpers'
import { useGetPoolWeeklyPickDistribution } from '@/helpers/hooks/useGetPoolWeeklyPickDistribution'

import styles from './ManageEntriesWeeklyPickDistribution.module.scss'
import { ManageEntriesWeeklyPickDistributionTable } from './ManageEntriesWeeklyPickDistributionTable'

const filterOptions = [
  { title: 'Pick Percentage', name: 'pick_percentage' },
  { title: 'Pick Count', name: 'pick_count' },
  { title: 'Game Date/Time', name: 'game_date_time' },
]

export default function ManageEntriesWeeklyPickDistribution() {
  const { query } = useRouter()
  const { poolData } = usePool(Number(query.poolId))

  const [week, setWeek] = useState<string>(
    String(poolData?.pick_pool.start_week),
  )

  const [filterOption, setFilterOption] = useState<string>(
    filterOptions[0].name,
  )

  const { weeklyPickDistributionResponse } = useGetPoolWeeklyPickDistribution({
    weekNumber: Number(week),
    poolId: Number(query.poolId),
  })

  const weekOptions = useMemo(() => {
    const availableWeek = poolData?.available_week ?? []
    const pickPool = poolData?.pick_pool

    return [
      ...availableWeek
        .slice(availableWeek.indexOf(Number(pickPool?.start_week)))
        .map((item) => ({ title: `Week ${item}`, name: String(item) })),
    ]
  }, [poolData])

  const sortedData = weeklyPickDistributionResponse
    ? [...weeklyPickDistributionResponse].sort(sorting)
    : []

  function sorting(
    a: WeeklyPickDistributionResponseData,
    b: WeeklyPickDistributionResponseData,
  ) {
    const aAwayCount = a.participants.away?.count
    const aHomeCount = a.participants.home?.count
    const bAwayCount = b.participants.away?.count
    const bHomeCount = b.participants.home?.count

    const aStartDate = a.start_date
    const bStartdate = b.start_date

    if (filterOption === 'pick_count') {
      if (aAwayCount + aHomeCount < bAwayCount + bHomeCount) return 1
      if (aAwayCount + aHomeCount > bAwayCount + bHomeCount) return -1
      return 0
    }

    if (filterOption === 'pick_percentage') {
      return (Math.round((aAwayCount / (aAwayCount + aHomeCount)) * 100) || 0) <
        (Math.round((bAwayCount / (bAwayCount + bHomeCount)) * 100) || 0)
        ? 1
        : -1
    }

    if (filterOption === 'game_date_time') {
      if (aStartDate > bStartdate) return 1
      if (aStartDate < bStartdate) return -1
      return 0
    }
    return 0
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Select2 options={weekOptions} value={week} onChange={setWeek} />
        <Select2
          options={filterOptions}
          value={filterOption}
          onChange={setFilterOption}
        />
      </div>
      <ManageEntriesWeeklyPickDistributionTable games={sortedData} />
    </div>
  )
}
