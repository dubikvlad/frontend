import React, { useState } from 'react'

import {
  GolfTournament,
  MajorsLeaderboardEntry,
  UserInfoResponseData,
} from '@/api'
import { EntriesTable } from '@/features/components'
import { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { Checkbox, SelectWithCheckboxes } from '@/features/ui'
import { useGetGolfLeaderboardYearToDate } from '@/helpers'

import styles from './MajorsYearToDateTable.module.scss'
import {
  generateTableData,
  majorsYearToDateTHeadList,
} from './MajorsYearToDateTableData'

export function MajorsYearToDateTable({
  poolId,
  membersOptions,
  userInfoData,
  golfAllTournaments,
}: {
  poolId: number
  membersOptions: { title: string; name: string }[]
  userInfoData: UserInfoResponseData | undefined
  golfAllTournaments: GolfTournament[]
}) {
  const { leaderboardYearToDateData, isLoadingData } =
    useGetGolfLeaderboardYearToDate<'golf_majors'>({
      poolId,
    })

  const [members, setMembers] = useState<string[]>([])
  const [showOnlyMyEntries, setShowOnlyMyEntries] = useState(false)
  const [sort, setSort] = useState<SortType<'golf_majors_year_to_date'>>({
    name: null,
    type: null,
  })

  const [forecastIndices, setForecastIndices] = useState<{
    first: number
    last: number
  }>({
    first: 0,
    last: 2,
  })

  if (!leaderboardYearToDateData) return <></>

  const entriesWithMaxTournaments = [...leaderboardYearToDateData.entries].sort(
    (a, b) => b.points_by_tournament.length - a.points_by_tournament.length,
  )[0]

  const itemsForSwiper = entriesWithMaxTournaments.points_by_tournament.map(
    (t) => {
      const tournament = golfAllTournaments.find(
        (currTournament) => currTournament.id === t.tournament_id,
      )

      return (
        <div key={tournament?.id} className={styles.swiperTournamentTitle}>
          {tournament?.name}
        </div>
      )
    },
  )

  function clickCheckboxHandler(value: boolean) {
    setShowOnlyMyEntries(value)
    setMembers([])
  }

  const filteredEntries = filtration({
    entries: leaderboardYearToDateData.entries,
    showOnlyMyEntries,
    members,
    userInfoData,
  })

  const tHeadList = majorsYearToDateTHeadList({
    itemsForSwiper,
    forecastIndices,
    setForecastIndices,
  })

  if (!tHeadList) return <></>

  const sortedData = sortingData({ data: filteredEntries, sort })

  const renderEntriesData: TBodyRowData<'golf_majors_year_to_date'>[] =
    generateTableData({
      data: sortedData,
      golfAllTournaments,
      forecastIndices,
    })

  return (
    <>
      <div className={styles.filters}>
        <SelectWithCheckboxes
          options={membersOptions}
          value={members}
          onChange={setMembers}
          placeholder="All members"
          disabled={showOnlyMyEntries}
        />

        <Checkbox value={showOnlyMyEntries} onChange={clickCheckboxHandler}>
          Only my entries
        </Checkbox>
      </div>

      {renderEntriesData.length && !isLoadingData ? (
        <div className={styles.tableWrap}>
          <div className={styles.leftLine}></div>

          <EntriesTable
            theadList={tHeadList}
            sort={sort}
            setSort={setSort}
            tbodyData={renderEntriesData}
            className={styles.grid}
          />

          <div className={styles.rightLine}></div>
        </div>
      ) : isLoadingData ? (
        <p>Loading...</p>
      ) : (
        <div className="not-found">
          Unfortunately, we did not find any suitable entries for&nbsp;
          {showOnlyMyEntries ? (
            <span>{userInfoData?.username}</span>
          ) : (
            <span>
              {members.length
                ? membersOptions
                    .reduce<string[]>((acc, option) => {
                      if (members.includes(option.name)) acc.push(option.title)
                      return acc
                    }, [])
                    .join(', ')
                : 'All members'}
            </span>
          )}
        </div>
      )}
    </>
  )
}

function filtration({
  entries,
  members,
  showOnlyMyEntries,
  userInfoData,
}: {
  entries: MajorsLeaderboardEntry[] | null
  members: string[]
  showOnlyMyEntries: boolean
  userInfoData: UserInfoResponseData | undefined
}) {
  if (!entries) return []

  let newArr = [...entries]

  if (members.length) {
    newArr = newArr.filter((entry) => members.includes(String(entry.user_id)))
  }

  if (showOnlyMyEntries && userInfoData) {
    newArr = newArr.filter((entry) => entry.user_id === userInfoData.id)
  }

  return newArr
}

function sortingData({
  data,
  sort,
}: {
  data: MajorsLeaderboardEntry[] | null
  sort: SortType<'golf_majors_year_to_date'>
}) {
  if (!data) return []

  return [...data].sort(function fn(
    a: MajorsLeaderboardEntry,
    b: MajorsLeaderboardEntry,
  ): number {
    switch (sort.name) {
      case 'majorsPicked':
        return sort.type === 'top'
          ? Number(a.majors_picked) - Number(b.majors_picked)
          : Number(b.majors_picked) - Number(a.majors_picked)
      case 'total':
        return sort.type === 'top'
          ? Number(a.total) - Number(b.total)
          : Number(b.total) - Number(a.total)
      case 'feDex':
        return sort.type === 'top'
          ? Number(a.fedex_points) - Number(b.fedex_points)
          : Number(b.fedex_points) - Number(a.fedex_points)
      default:
        return 0
    }
  })
}
