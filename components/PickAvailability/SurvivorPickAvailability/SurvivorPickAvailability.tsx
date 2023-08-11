import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { PickAvilabilityParticipantTable, Pool } from '@/api'
import { poolTypes } from '@/config/constants'
import { generateParticipantImagePath } from '@/config/constants'
import { Select } from '@/features/ui'
import { useGetPickAvailability } from '@/helpers'

import styles from './SurvivorPickAvailability.module.scss'

const selectArr = [
  { name: 'by_name', title: 'Sort by Team Name' },
  { name: 'high_to_low', title: 'Sort by Picks: high to low' },
  { name: 'low_to_high', title: 'Sort by Picks: low to high' },
]

export default function SurvivorPickAvailability({
  poolData,
}: {
  poolData: Pool<'survivor'>
}) {
  const {
    query: { poolId },
  } = useRouter()

  const [filter, setFilter] = useState(selectArr[0].name)

  const { poolPickAvailabilityData } = useGetPickAvailability(Number(poolId))

  const filteredData = poolPickAvailabilityData
    ? [...poolPickAvailabilityData.participant_table].sort(sorting)
    : []

  const leftTableCol = filteredData?.slice(0, filteredData.length / 2)
  const rightTableCol = filteredData?.slice(filteredData.length / 2)

  function sorting(
    a: PickAvilabilityParticipantTable,
    b: PickAvilabilityParticipantTable,
  ) {
    const aCount = a.count
    const bCount = b.count

    const aName = [a?.city, a?.title]?.join(' ').trim().toLocaleLowerCase()
    const bName = [b?.city, b?.title]?.join(' ').trim().toLocaleLowerCase()

    if (filter === 'by_name') {
      if (aName > bName) return 1
      if (aName < bName) return -1
      return 0
    }

    if (filter === 'low_to_high') {
      if (aCount > bCount) return 1
      if (aCount < bCount) return -1
      return 0
    }

    if (filter === 'high_to_low') {
      if (aCount > bCount) return -1
      if (aCount < bCount) return 1
      return 0
    }

    return 0
  }

  return (
    <div className={styles.wrapper}>
      <>
        <div className={styles.intro}>
          <p>
            {poolData?.type === poolTypes.margin ? (
              <>
                There are{' '}
                <strong>
                  {poolPickAvailabilityData?.max_count ?? 0} active entries{' '}
                </strong>{' '}
                in your pool. The number next to each{' '}
                {poolData?.tournament?.name} team below indicates how many of
                these entries still have that team available to pick. The color
                of the box indicates the percentage of entries who still have
                that team available to pick.
              </>
            ) : (
              <>
                There are{' '}
                <strong>
                  {poolPickAvailabilityData?.max_count ?? 0} surviving members
                </strong>{' '}
                in your pool. The number next to each{' '}
                {poolData?.tournament?.name} team below indicates how many of
                these surviving members still have that team available to pick.
                The color of the box indicates the percentage of surviving
                members who still have that team available to pick.
              </>
            )}
          </p>
          <p>This report only updates after the weekly pick deadline</p>
        </div>

        <div className={styles.data}>
          {!!poolPickAvailabilityData ? (
            <>
              {' '}
              <div className={styles.selectWrapper}>
                <Select
                  options={selectArr}
                  value={filter}
                  onChange={setFilter}
                />
              </div>
              <div className={styles.result}>
                <div className={styles.resultCol}>
                  {leftTableCol?.map((item, i) => {
                    const percent =
                      (item.count / poolPickAvailabilityData.max_count) * 100

                    const fullName = [item?.city, item?.title]?.join(' ').trim()

                    return (
                      <div className={styles.resultRow} key={i}>
                        <Image
                          src={generateParticipantImagePath(item.external_id)}
                          width={40}
                          height={40}
                          alt={fullName}
                        />
                        <span>{fullName}</span>
                        <ResultBar result={item.count} percent={percent} />
                      </div>
                    )
                  })}
                </div>

                <div className={styles.resultCol}>
                  {rightTableCol?.map((item, i) => {
                    const percent =
                      (item.count / poolPickAvailabilityData.max_count) * 100

                    const fullName = [item?.city, item?.title]?.join(' ').trim()

                    return (
                      <div className={styles.resultRow} key={i}>
                        <div className={styles.imgWrapper}>
                          <Image
                            src={generateParticipantImagePath(item.external_id)}
                            width={40}
                            height={40}
                            alt={fullName}
                          />
                        </div>
                        <span>{fullName}</span>
                        <ResultBar result={item.count} percent={percent} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <p>
              There are no{' '}
              {poolData?.type === poolTypes.margin ? 'margins' : 'surviving'}{' '}
              members left in your pool.
            </p>
          )}
        </div>
      </>
    </div>
  )
}

function ResultBar({ result, percent }: { result: number; percent: number }) {
  const style =
    percent >= 1
      ? {
          background: `linear-gradient(270deg, #F0F0F0 ${
            90 - percent
          }%, #C6EED2 ${100 - percent}%)`,
        }
      : { background: '#F0F0F0' }

  return (
    <div className={styles.bar} style={style}>
      {result}
    </div>
  )
}
