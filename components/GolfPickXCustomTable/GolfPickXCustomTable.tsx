import classNames from 'classnames'
import React, { Dispatch, SetStateAction, useMemo, useState } from 'react'

import {
  GolfTournament,
  LeaderboardResponseData,
  UserInfoResponseData,
} from '@/api'
import { TournamentGroupings } from '@/assets/icons'
import { GolfLeaderboardAvailableTables } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { EntriesTable } from '@/features/components'
import { SortType, TBodyRowData } from '@/features/components/EntriesTable'
import { POOL_MODAL_TYPES } from '@/features/modals'
import { Checkbox, Select2 } from '@/features/ui'
import {
  entriesDataSorting,
  useGetGolfCustomLeaderboard,
  useGetGolfGroups,
} from '@/helpers'

import styles from './GolfPickXCustomTable.module.scss'
import { theadList, generateTableData } from './GolfPickXCustomTableData'

const noGroups = 'No Groups' as const

export function GolfPickXCustomTable({
  poolId,
  setActiveTable,
  golfAllTournaments,
  userInfoData,
}: {
  poolId: number
  setActiveTable: Dispatch<SetStateAction<GolfLeaderboardAvailableTables>>
  golfAllTournaments: GolfTournament[]
  userInfoData: UserInfoResponseData | undefined
}) {
  const { golfGroups, updateGroups } = useGetGolfGroups({ poolId: poolId })

  const { openModal } = useOpenModal()

  const [groupId, setGroupId] = useState<string>(noGroups)
  const [showOnlyMyEntries, setShowOnlyMyEntries] = useState(false)
  const [sort, setSort] = useState<SortType<'golf_pick_x'>>({
    name: null,
    type: null,
  })

  const { customLeaderboardData, isLoadingData } =
    useGetGolfCustomLeaderboard<'golf_pick_x'>({
      poolId,
      poolGroup: groupId === noGroups ? '' : groupId,
    })

  const groupsOptions = useMemo(() => {
    return [
      {
        title: noGroups,
        name: noGroups,
      },
      ...golfGroups.map((group) => ({
        title: group.name,
        name: String(group.id),
      })),
    ]
  }, [golfGroups])

  const filteredEntries = filtration({
    entries: customLeaderboardData,
    showOnlyMyEntries,
    userInfoData,
  })

  const leaderboardRowObj: TBodyRowData<'golf_pick_x'>[] = generateTableData({
    data: filteredEntries,
  })

  const renderEntriesData: TBodyRowData<'golf_pick_x'>[] = !sort.type
    ? leaderboardRowObj
    : entriesDataSorting<'golf_pick_x'>(leaderboardRowObj, sort)

  const activeGroup = golfGroups.find((group) => String(group.id) === groupId)

  const openGroupsModal = () =>
    openModal({
      type: POOL_MODAL_TYPES.GOLF_GROUPS_TOURNAMENTS,
      props: { data: golfAllTournaments, poolId, updateGroups },
    })

  return (
    <>
      <div className={styles.filters}>
        <Select2
          options={groupsOptions}
          value={groupId}
          onChange={setGroupId}
        />

        <Checkbox value={showOnlyMyEntries} onChange={setShowOnlyMyEntries}>
          Only my entries
        </Checkbox>

        <div className={styles.buttonsWrap}>
          <button
            className={classNames(
              'button',
              'button-blue-light-outline',
              styles.addGroupBtn,
            )}
            onClick={() => openGroupsModal()}
          >
            Add a Group
          </button>

          <button
            className={classNames(
              'button',
              'button-blue-light',
              styles.groupingsBtn,
            )}
            onClick={() => setActiveTable('yearToDate')}
          >
            <TournamentGroupings />
            <>Tournament Groupings</>
          </button>
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
          {groupId === noGroups ? (
            <>
              Select a group in the filter above to display its statistics here
            </>
          ) : (
            <>
              Unfortunately, we did not find any suitable entries for&nbsp;
              {showOnlyMyEntries ? (
                <span>{userInfoData?.username}</span>
              ) : groupId ? (
                <span>{activeGroup?.name}</span>
              ) : (
                <></>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}

function filtration({
  entries,
  showOnlyMyEntries,
  userInfoData,
}: {
  entries: LeaderboardResponseData<'golf_pick_x'>
  showOnlyMyEntries: boolean
  userInfoData: UserInfoResponseData | undefined
}) {
  if (!entries) return []

  let newArr = [...entries]

  if (showOnlyMyEntries && userInfoData) {
    newArr = newArr.filter((entry) => entry.user_id === userInfoData.id)
  }

  return newArr
}
