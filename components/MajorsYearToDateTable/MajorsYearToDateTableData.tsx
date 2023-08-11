import classNames from 'classnames'
import React, { Dispatch, SetStateAction } from 'react'

import { GolfTournament, MajorsLeaderboardYearToDateResData } from '@/api'
import { EntryUserIcon } from '@/features/components'
import type {
  TBodyRowData,
  TheadData,
} from '@/features/components/EntriesTable'
import { TableSwiper } from '@/features/ui'

import styles from './MajorsYearToDateTable.module.scss'

export function majorsYearToDateTHeadList({
  itemsForSwiper,
  forecastIndices,
  setForecastIndices,
}: {
  itemsForSwiper: JSX.Element[]
  forecastIndices: { first: number; last: number }
  setForecastIndices: Dispatch<SetStateAction<{ first: number; last: number }>>
}): TheadData<'golf_majors_year_to_date'> | null {
  return {
    entryColor: { title: '' },
    entryName: {
      title: <p className={styles.tHeadTitle}>Entry Name</p>,
      sort: { name: 'entryName' },
    },
    majorsPicked: {
      title: <p className={styles.tHeadTitle}>Majors Picked</p>,
      sort: { name: 'majorsPicked' },
    },
    tournaments: {
      title: (
        <div className={styles.tHeadTitle}>
          <TableSwiper
            items={itemsForSwiper}
            itemsCount={3}
            itemIndices={forecastIndices}
            setItemIndices={setForecastIndices}
          />
        </div>
      ),
    },
    total: {
      title: <p className={styles.tHeadTitle}>Total</p>,
      sort: { name: 'total' },
    },
    feDex: {
      title: <p className={styles.tHeadTitle}>FedEx</p>,
      sort: { name: 'feDex' },
    },
    winnings: {
      title: <p className={styles.tHeadTitle}>Winnings</p>,
    },
  }
}

export function generateTableData({
  data,
  golfAllTournaments,
  forecastIndices,
}: {
  data: MajorsLeaderboardYearToDateResData['entries']
  golfAllTournaments: GolfTournament[]
  forecastIndices: { first: number; last: number }
}): TBodyRowData<'golf_majors_year_to_date'>[] {
  return data.map(
    (entry, rowIndex): TBodyRowData<'golf_majors_year_to_date'> => {
      const showTournaments = golfAllTournaments.slice(
        forecastIndices.first,
        forecastIndices.last + 1,
      )

      return {
        entryColor: {
          content: (
            <EntryUserIcon
              isCurrentUser={false}
              color={entry.color}
              userName={entry.name}
            />
          ),
        },
        entryName: {
          content: entry.name,
        },
        majorsPicked: {
          content: entry.majors_picked,
        },
        tournaments: {
          content: (
            <div className={styles.pointsByTournament}>
              {showTournaments.map((t, i) => {
                const currTournament = entry.points_by_tournament.find(
                  (item) => item.tournament_id === t.id,
                )

                if (!currTournament) return <></>

                return (
                  <div
                    key={currTournament?.tournament_id}
                    className={classNames(styles.bgColor, {
                      [styles.bgColorEven]: rowIndex % 2 !== 0 && i % 2 === 0,
                      [styles.bgColorOdd]: rowIndex % 2 === 0 && i % 2 === 0,
                    })}
                  >
                    {currTournament.points}
                  </div>
                )
              })}
            </div>
          ),
        },
        total: {
          content: entry.total,
        },
        feDex: {
          content: entry.fedex_points,
          colored: true,
        },
        winnings: {
          content: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(entry.winning),
        },
      }
    },
  )
}
