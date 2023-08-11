import classNames from 'classnames'
import React, { Dispatch, SetStateAction, useState } from 'react'

import { LeaderboardResponseData, UserInfoResponseData } from '@/api'
import { TournamentGroupings } from '@/assets/icons'
import { GolfLeaderboardAvailableTables } from '@/config/constants'
import { EntriesTable } from '@/features/components'
import { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { Checkbox, SelectWithCheckboxes } from '@/features/ui'
import { entriesDataSorting, useGetGolfLeaderboardYearToDate } from '@/helpers'

import styles from './GolfPickXYearToDateTable.module.scss'
import { generateTableData, theadList } from './GolfPickXYearToDateTableData'

export function GolfPickXYearToDateTable({
  poolId,
  membersOptions,
  setActiveTable,
  userInfoData,
}: {
  poolId: number
  membersOptions: { title: string; name: string }[]
  setActiveTable: Dispatch<SetStateAction<GolfLeaderboardAvailableTables>>
  userInfoData: UserInfoResponseData | undefined
}) {
  const { leaderboardYearToDateData, isLoadingData } =
    useGetGolfLeaderboardYearToDate<'golf_pick_x'>({
      poolId,
    })

  const [members, setMembers] = useState<string[]>([])
  const [showOnlyMyEntries, setShowOnlyMyEntries] = useState(false)
  const [sort, setSort] = useState<SortType<'golf_pick_x'>>({
    name: null,
    type: null,
  })

  function clickCheckboxHandler(value: boolean) {
    setShowOnlyMyEntries(value)
    setMembers([])
  }

  const filteredEntries = filtration({
    entries: leaderboardYearToDateData,
    showOnlyMyEntries,
    members,
    userInfoData,
  })

  const leaderboardRowObj: TBodyRowData<'golf_pick_x'>[] = generateTableData({
    data: filteredEntries,
  })

  const renderEntriesData: TBodyRowData<'golf_pick_x'>[] = !sort.type
    ? leaderboardRowObj
    : entriesDataSorting<'golf_pick_x'>(leaderboardRowObj, sort)

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

        <button
          className={classNames(
            'button',
            'button-blue-light-outline',
            styles.groupingsBtn,
          )}
          onClick={() => setActiveTable('custom')}
        >
          <TournamentGroupings />
          <>Tournament Groupings</>
        </button>
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
  entries: LeaderboardResponseData<'golf_pick_x'> | null
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
