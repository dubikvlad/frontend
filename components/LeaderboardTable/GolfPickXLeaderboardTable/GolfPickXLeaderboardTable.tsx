import classNames from 'classnames'
import dynamic from 'next/dynamic'
import React, { useCallback, useMemo, useState } from 'react'

import { Pool } from '@/api'
import {
  GolfLeaderboardAvailableTables,
  golfLeaderboardAvailableTables as availableTables,
} from '@/config/constants'
import { GolfSelectByTournaments } from '@/features/components'
import { useGetGolfTournaments, useGetUserInfo } from '@/helpers/hooks'

import styles from './GolfPickXLeaderboardTable.module.scss'

const GolfPickXTableByTournamentLazy = dynamic(
  () =>
    import('features/components/GolfPickXTableByTournament').then(
      (mod) => mod.GolfPickXTableByTournament,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfPickXYearToDateTableLazy = dynamic(
  () =>
    import('features/components/GolfPickXYearToDateTable').then(
      (mod) => mod.GolfPickXYearToDateTable,
    ),
  { loading: () => <p>Loading...</p> },
)

const GolfPickXCustomTableLazy = dynamic(
  () =>
    import('features/components/GolfPickXCustomTable').then(
      (mod) => mod.GolfPickXCustomTable,
    ),
  { loading: () => <p>Loading...</p> },
)

export function GolfPickXLeaderboardTable({
  poolData,
}: {
  poolData: Pool<'golf_pick_x'>
}) {
  const [idShowTournament, setIdShowTournament] = useState<string>('')
  const [activeTable, setActiveTable] =
    useState<GolfLeaderboardAvailableTables>(availableTables.byTournament)

  const { golfAllTournaments } = useGetGolfTournaments({
    poolId: poolData.id ? poolData.id : undefined,
  })

  const { userInfoData } = useGetUserInfo()

  const membersOptions = useMemo(() => {
    return poolData.users.map((user) => ({
      title: user.username,
      name: String(user.id),
    }))
  }, [poolData.users])

  function Table() {
    switch (activeTable) {
      case availableTables.yearToDate:
        return (
          <GolfPickXYearToDateTableLazy
            poolId={poolData.id}
            membersOptions={membersOptions}
            setActiveTable={setActiveTable}
            userInfoData={userInfoData}
          />
        )
      case availableTables.custom:
        return (
          <GolfPickXCustomTableLazy
            poolId={poolData.id}
            setActiveTable={setActiveTable}
            golfAllTournaments={golfAllTournaments}
            userInfoData={userInfoData}
          />
        )
      case availableTables.byTournament:
        return (
          <GolfPickXTableByTournamentLazy
            poolData={poolData}
            idShowTournament={idShowTournament}
            membersOptions={membersOptions}
            userInfoData={userInfoData}
          />
        )
      default:
        return <></>
    }
  }

  const changeShowTournament = useCallback((id: string) => {
    setIdShowTournament(id)
    setActiveTable(availableTables.byTournament)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <div
          className={classNames(styles.yearToDateTab, {
            [styles.active]: activeTable === availableTables.yearToDate,
          })}
          onClick={() => {
            setActiveTable(availableTables.yearToDate)
            setIdShowTournament('')
          }}
        >
          <span>Year-to-date</span>
        </div>
        <GolfSelectByTournaments
          poolData={poolData}
          showDataId={idShowTournament}
          changeShowTournament={changeShowTournament}
          withTabYearToDate
        />
      </div>

      <Table />
    </div>
  )
}
