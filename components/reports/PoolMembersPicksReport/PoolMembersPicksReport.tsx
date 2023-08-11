import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'

import {
  IndividualMemberDetailEntryItem,
  IndividualMemberDetailForecastItem1,
} from '@/api'
import {
  defaultEntryColor,
  generateParticipantImagePath,
  hexToRgb,
} from '@/config/constants'
import { useIndividualMemberDetail, usePool } from '@/helpers'

import styles from './PoolMembersPicksReport.module.scss'

const FilterByEntryAndMembersAndWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndWeeks'),
  { loading: () => <p>Loading...</p> },
)

function filtrationProcessing(
  data: IndividualMemberDetailEntryItem[],
  members: string[],
  search: string,
): IndividualMemberDetailEntryItem[] {
  if (!data.length) return []

  let dataArr: IndividualMemberDetailEntryItem[] = [...data]

  if (members.length) {
    dataArr = dataArr.filter((item) => members.includes(String(item.user_id)))
  }

  if (!!search.trim()) {
    dataArr = dataArr.filter((item) =>
      item.name.trim().toLowerCase().includes(search.trim().toLowerCase()),
    )
  }

  return dataArr
}

export function PoolMembersPicksReport() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'playoff'>(Number(poolId))

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])

  const {
    individualMemberDetailEntriesData,
    individualMemberDetailStagesData,
  } = useIndividualMemberDetail({ poolId: poolData?.id })

  if (!poolData) return null

  const filteringData = filtrationProcessing(
    individualMemberDetailEntriesData,
    members,
    search,
  )

  return (
    <div className={styles.wrapper}>
      <FilterByEntryAndMembersAndWeeksLazy
        poolData={poolData}
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        isDisabled={!individualMemberDetailEntriesData.length}
      />

      <div className={styles.entriesWrapper}>
        {filteringData.length ? (
          filteringData.map((entry) => {
            const forecastsWithoutTotal = entry.forecasts.filter(
              (forecast) => 'participant' in forecast,
            ) as IndividualMemberDetailForecastItem1[]

            const isForecasts = !!forecastsWithoutTotal.length

            const totalPoints =
              entry.forecasts.find((forecast) => 'total' in forecast)
                ?.points_by_stage.pts_by_team ?? 0

            const rgbColor = hexToRgb(entry.color)
            const getEntryColor = (opacity = 1) =>
              rgbColor
                ? `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${opacity})`
                : defaultEntryColor

            return (
              <div key={entry.id} className={styles.entryItem}>
                <div
                  className={styles.entryNameWrapper}
                  style={{ backgroundColor: entry.color }}
                >
                  <p>{entry.name}</p>
                </div>

                <div className={styles.entryItemBody}>
                  <div className={styles.pointsWrapper}>
                    <p className={styles.pointsValue}>{totalPoints}</p>
                    <p className={styles.pointsText}>Points</p>

                    <ul className={styles.stagesList}>
                      <li>Points Assigned</li>
                      {isForecasts ? (
                        individualMemberDetailStagesData.map((stage) => (
                          <li key={stage.name}>{stage.title}</li>
                        ))
                      ) : (
                        <li>Points by Team</li>
                      )}
                    </ul>
                  </div>

                  <div className={styles.forecastsWrapper}>
                    {isForecasts
                      ? forecastsWithoutTotal.map((forecast, i) => {
                          const imageSrc = generateParticipantImagePath(
                            forecast.participant.external_id,
                          )

                          return (
                            <div key={i} className={styles.forecastItem}>
                              <div className={styles.forecastItemHead}>
                                <div className={styles.imageWrapper}>
                                  {!!imageSrc && (
                                    <Image
                                      src={imageSrc}
                                      width={55}
                                      height={55}
                                      alt={forecast.participant.name}
                                    />
                                  )}
                                </div>
                                <p className={styles.assignPointsValue}>
                                  {forecast.assign_points}
                                </p>
                              </div>

                              {individualMemberDetailStagesData.map(
                                (stage, stageIndex, stageArr) => {
                                  const stageValue =
                                    forecast.points_by_stage?.[stage.name]

                                  if (stageValue === undefined) return null

                                  const stageValueColor = getEntryColor(
                                    individualMemberDetailStagesData.length -
                                      1 ===
                                      stageIndex
                                      ? 0.5
                                      : stageIndex % 2 !== 0
                                      ? 0.2
                                      : 0.1,
                                  )

                                  return (
                                    <p
                                      key={stage.name}
                                      className={styles.stageValue}
                                      style={{
                                        backgroundColor: stageValueColor,
                                      }}
                                    >
                                      {stageValue === 0 &&
                                      stageArr.length - 1 !== stageIndex
                                        ? '-'
                                        : stageValue}
                                    </p>
                                  )
                                },
                              )}
                            </div>
                          )
                        })
                      : Array(14)
                          .fill(0)
                          .map((_, index, arr) => {
                            const stageValueColor = getEntryColor(0.5)

                            return (
                              <div key={index} className={styles.forecastItem}>
                                <div className={styles.forecastItemHead}>
                                  <div className={styles.imageWrapper}>
                                    <p className={styles.question}>?</p>
                                  </div>
                                  <p
                                    className={classNames(
                                      styles.assignPointsValue,
                                      {
                                        [styles.assignPointsValueNotForecast]:
                                          !isForecasts,
                                      },
                                    )}
                                  >
                                    {arr.length - index}
                                  </p>
                                </div>

                                <p
                                  className={styles.stageValue}
                                  style={{ backgroundColor: stageValueColor }}
                                >
                                  0
                                </p>
                              </div>
                            )
                          })}
                  </div>

                  <div
                    className={styles.line}
                    style={{ backgroundColor: entry.color }}
                  ></div>
                </div>
              </div>
            )
          })
        ) : (
          <p className={styles.noEntries}>
            {search.trim() ? (
              <>
                Sorry, there were no results found for{' '}
                <span>&quot;{search}&quot;</span>
              </>
            ) : (
              'Sorry, we didn’t find any matching entries'
            )}
          </p>
        )}
      </div>
    </div>
  )
}
