import React, { useMemo, useState } from 'react'

import {
  LeaderboardResponseData,
  PlayersLeaderboardTableType,
  Pool,
  UserInfoResponseData,
} from '@/api'
import { EntriesTable, PlayersLeaderboardTable } from '@/features/components'
import { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { Checkbox, SelectWithCheckboxes } from '@/features/ui'
import { entriesDataSorting, useGetGolfPlayersLeaderboard } from '@/helpers'
import { useGetGolfLeaderboard } from '@/helpers/hooks/useGetGolfLeaderboard'

import styles from './MajorsTableByTournament.module.scss'
import { generateTableData, theadList } from './MajorsTableByTournamentData'

export function MajorsTableByTournament({
  poolData,
  idShowTournament,
  membersOptions,
  userInfoData,
}: {
  poolData: Pool<'golf_majors'>
  idShowTournament: string
  membersOptions: { title: string; name: string }[]
  userInfoData: UserInfoResponseData | undefined
}) {
  const { leaderboardData, isLoadingData } =
    useGetGolfLeaderboard<'golf_majors'>({
      poolId: poolData.id,
      tournamentId: idShowTournament,
    })

  const { playersLeaderboard } = useGetGolfPlayersLeaderboard({
    poolId: poolData.id,
    tournamentId: idShowTournament,
  })

  const [sort, setSort] = useState<SortType<'golf_majors_by_tournament'>>({
    name: null,
    type: null,
  })
  const [members, setMembers] = useState<string[]>([])
  const [showOnlyMyEntries, setShowOnlyMyEntries] = useState(false)

  const filteredEntries = filtration({
    entries: leaderboardData,
    members,
    showOnlyMyEntries,
    userInfoData,
  })

  const leaderboardRowObj: TBodyRowData<'golf_majors_by_tournament'>[] =
    generateTableData({
      data: filteredEntries,
    })

  const renderEntriesData: TBodyRowData<'golf_majors_by_tournament'>[] =
    !sort.type
      ? leaderboardRowObj
      : entriesDataSorting<'golf_majors_by_tournament'>(leaderboardRowObj, sort)

  function clickCheckboxHandler(value: boolean) {
    setShowOnlyMyEntries(value)
    setMembers([])
  }

  const playersDataForTable: PlayersLeaderboardTableType[] = useMemo(() => {
    return playersLeaderboard.map((player) => {
      return {
        golfPlayerId: player.id,
        image: player.player_image,
        name: player.name,
        lastName: player.name.trim().split(' ')[1],
        toParPoints: player.to_par_points,
        thru: player.thru,
        pickCount: player.times_picked,
        position: player.position,
      }
    })
  }, [playersLeaderboard])

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.filters}>
          <SelectWithCheckboxes
            options={membersOptions}
            value={members}
            onChange={setMembers}
            placeholder="All members"
            disabled={showOnlyMyEntries}
          />

          <div className={styles.checkboxWrap}>
            <Checkbox value={showOnlyMyEntries} onChange={clickCheckboxHandler}>
              Only my entries
            </Checkbox>
          </div>
        </div>

        {renderEntriesData.length && !isLoadingData ? (
          <EntriesTable
            theadList={theadList}
            sort={sort}
            setSort={setSort}
            tbodyData={renderEntriesData}
            className={styles.grid}
          />
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
                        if (members.includes(option.name))
                          acc.push(option.title)
                        return acc
                      }, [])
                      .join(', ')
                  : 'All members'}
              </span>
            )}
          </div>
        )}
      </div>

      <PlayersLeaderboardTable players={playersDataForTable} />
    </div>
  )
}

function filtration({
  entries,
  members,
  showOnlyMyEntries,
  userInfoData,
}: {
  entries: LeaderboardResponseData<'golf_majors'>
  members: string[]
  showOnlyMyEntries: boolean
  userInfoData: UserInfoResponseData | undefined
}): LeaderboardResponseData<'golf_majors'> {
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
