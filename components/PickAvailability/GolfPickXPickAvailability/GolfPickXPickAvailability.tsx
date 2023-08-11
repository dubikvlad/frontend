import classNames from 'classnames'
import Image from 'next/image'
import React, { useCallback, useState } from 'react'

import { GolfPickAvailabilityResData, Pool } from '@/api'
import { EmptyAvatar } from '@/assets/icons'
import { golfLeaderboardAvailableTables as availableTables } from '@/config/constants'
import { GolfSelectByTournaments } from '@/features/components'
import { Select2 } from '@/features/ui'
import { useGetGolfPickAvailability } from '@/helpers'

import styles from './GolfPickXPickAvailability.module.scss'

const sortOptions: { title: string; name: string }[] = [
  {
    title: 'Golfer’s name  (A to Z)',
    name: 'nameAZ',
  },
  {
    title: 'Golfer’s name (Z to A)',
    name: 'nameZA',
  },
  {
    title: 'Golfers rating',
    name: 'ratingAZ',
  },
  {
    title: 'Golfer’s rating (desc)',
    name: 'ratingZA',
  },
  {
    title: 'Number of picks (asc)',
    name: 'picksAZ',
  },
  {
    title: 'Number of picks (desc)',
    name: 'picksZA',
  },
]

export default function GolfPickXPickAvailability({
  poolData,
}: {
  poolData: Pool<'golf_pick_x'>
}) {
  const [showTableYearToDate, setShowTableYearToDate] = useState<string>('')
  const [showDataId, setShowDataId] = useState<string>('')
  const [showTournamentTitle, setShowTournamentTitle] = useState<string>('')
  const [sort, setSort] = useState(sortOptions[0].name)

  const { pickAvailabilityData, isLoadingData } = useGetGolfPickAvailability({
    poolId: poolData.id,
    tournamentId:
      showTableYearToDate !== availableTables.yearToDate ? showDataId : '',
  })

  const sortedData = sortingData({ data: pickAvailabilityData, sort })

  const changeShowTournament = useCallback((id: string) => {
    setShowDataId(id)
    setShowTableYearToDate('')
  }, [])

  return (
    <div>
      <div className={styles.head}>
        <div
          className={classNames(styles.yearToDateTab, {
            [styles.active]: showTableYearToDate === availableTables.yearToDate,
          })}
          onClick={() => {
            setShowTableYearToDate(availableTables.yearToDate)
            setShowDataId('')
          }}
        >
          <span>Year-to-date</span>
        </div>
        <GolfSelectByTournaments
          poolData={poolData}
          showDataId={showDataId}
          changeShowTournament={changeShowTournament}
          setShowTournamentTitle={setShowTournamentTitle}
          withTabYearToDate
        />
      </div>

      <div className={styles.sortingSelectWrap}>
        <Select2
          value={sort}
          onChange={setSort}
          options={sortOptions}
          disabled={!sortedData.length}
          isTitleBold
        />
      </div>

      {sortedData.length ? (
        <Table data={sortedData} />
      ) : isLoadingData ? (
        <p>Loading...</p>
      ) : (
        <div className="not-found">
          <>
            Unfortunately, we did not find any suitable entries
            {showTournamentTitle ? (
              <span>{` for ${showTournamentTitle}`}</span>
            ) : (
              <>
                &nbsp;for <span>year to date</span>
              </>
            )}
          </>
        </div>
      )}
    </div>
  )
}

function Table({ data }: { data: GolfPickAvailabilityResData[] }) {
  return (
    <div className={styles.table}>
      {data.map((player) => (
        <div key={player.id} className={styles.row}>
          <div>
            {player.playerImage.trim() ? (
              <Image
                alt="player"
                src={player.playerImage}
                width={50}
                height={66}
              />
            ) : (
              <EmptyAvatar width={50} height={66} />
            )}

            <span className={styles.rank}>({player.rank})</span>
            <span>{player.player}</span>
          </div>
          <div className={styles.percentRange}>
            <span>{player.percent}%</span>
            <div
              className={styles.scale}
              style={{
                background: `linear-gradient(to right, var(--win-color-2) ${player.percent}%, var(--border-color) ${player.percent}%)`,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function sortingData({
  data,
  sort,
}: {
  data: GolfPickAvailabilityResData[]
  sort: string
}) {
  if (!data.length) return []

  return [...data].sort(function f(
    a: GolfPickAvailabilityResData,
    b: GolfPickAvailabilityResData,
  ): number {
    switch (sort) {
      case 'nameAZ':
        if (a.player > b.player) return 1
        if (a.player < b.player) return -1
        return 0
      case 'nameZA':
        if (a.player > b.player) return -1
        if (a.player < b.player) return 1
        return 0
      case 'ratingAZ':
        if (a.rank > b.rank) return 1
        if (a.rank < b.rank) return -1
        return 0
      case 'ratingZA':
        if (a.rank > b.rank) return -1
        if (a.rank < b.rank) return 1
        return 0
      case 'picksAZ':
        if (a.percent > b.percent) return 1
        if (a.percent < b.percent) return -1
        return 0
      case 'picksZA':
        if (a.percent > b.percent) return -1
        if (a.percent < b.percent) return 1
        return 0
      default:
        return 0
    }
  })
}
