import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { Dispatch, SetStateAction, useState } from 'react'

import { XRunLeaderboardResponseData, XRunLeaderboardEntry } from '@/api'
import { Star } from '@/assets/icons'
import { generateParticipantImagePath, getShortName } from '@/config/constants'
import { EntriesTable } from '@/features/components'
import { TBodyRowData, TheadData } from '@/features/components/EntriesTable'
import { TableSwiper } from '@/features/ui'
import { useLeaderboard } from '@/helpers'

import styles from './XRunLeaderboardTable.module.scss'

export function XRunLeaderboardTable() {
  const {
    query: { poolId },
  } = useRouter()

  const { leaderboardData } = useLeaderboard<'xrun'>({
    poolId: Number(poolId),
  })

  const [forecastIndices, setForecastIndices] = useState<{
    first: number
    last: number
  }>({ first: 0, last: 6 })

  const xRunTheadList: TheadData<'xrun'> | null = leaderboardData
    ? xRunMLBLeaderboardTheadList({
        leaderboardData,
        forecastIndices,
        setForecastIndices,
      })
    : null

  const renderEntriesData: TBodyRowData<'xrun'>[] | null = leaderboardData
    ? generateTableData({ leaderboardData, forecastIndices })
    : null

  if (!leaderboardData) return null

  return (
    <div className={styles.container}>
      {!!renderEntriesData && renderEntriesData.length ? (
        <EntriesTable<'xrun'>
          theadList={xRunTheadList}
          tbodyData={renderEntriesData}
          className={styles.grid}
          cellHeight="70px"
          defaultColorThead
        />
      ) : (
        <div className={styles.notFound}>
          Unfortunately, we did not find any suitable entries
        </div>
      )}
    </div>
  )
}

function xRunMLBLeaderboardTheadList({
  leaderboardData,
  forecastIndices,
  setForecastIndices,
}: {
  leaderboardData: XRunLeaderboardResponseData
  forecastIndices: { first: number; last: number }
  setForecastIndices: Dispatch<SetStateAction<{ first: number; last: number }>>
}): TheadData<'xrun'> {
  return {
    'entry.color': {
      title: (
        <div key="star" className={styles.starWrap}>
          <Star className={styles.star} />
        </div>
      ),
    },
    name: { title: 'Entry Name' },
    weeks: {
      title: (
        <TableSwiper
          items={leaderboardData.weeks}
          itemsCount={7}
          itemIndices={forecastIndices}
          setItemIndices={setForecastIndices}
        />
      ),
    },
  }
}

function generateTableData({
  leaderboardData,
  forecastIndices,
}: {
  leaderboardData: XRunLeaderboardResponseData
  forecastIndices: { first: number; last: number }
}): TBodyRowData<'xrun'>[] {
  return leaderboardData.entries
    .filter((entry) => entry.xrun_forecasts.length)
    .map((entry: XRunLeaderboardEntry): TBodyRowData<'xrun'> => {
      return {
        'entry.color': {
          content: (
            <div className={styles.itemNameWrap}>
              <div
                className={styles.itemName}
                style={{ backgroundColor: entry.color }}
              >
                {getShortName(entry.name).toUpperCase()}
              </div>
            </div>
          ),
        },
        name: { content: entry.name },
        weeks: {
          content: (
            <div className={styles.forecastWrap}>
              {leaderboardData.weeks.map((week_number, index) => {
                const forecasts = entry.xrun_forecasts.slice(
                  forecastIndices.first,
                  forecastIndices.last + 1,
                )

                const forecast = forecasts.find((forecast) => {
                  return forecast.week_number === week_number
                })

                if (!forecast) return null

                return (
                  <div
                    className={classNames(styles.teamInfo, {
                      [styles.win]: 'winner' in forecast && forecast.winner,
                    })}
                    key={index}
                  >
                    <div className={styles.imageWrap}>
                      <Image
                        alt={forecast.name}
                        src={generateParticipantImagePath(forecast.external_id)}
                        width={40}
                        height={40}
                      />
                    </div>
                    <p>
                      {forecast.score ? (
                        <p
                          className={classNames(styles.score, {
                            [styles.win]:
                              'winner' in forecast && forecast.winner,
                          })}
                        >
                          {forecast.score}
                        </p>
                      ) : (
                        forecast.name.slice(0, 3).toUpperCase()
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          ),
        },
      }
    })
}
