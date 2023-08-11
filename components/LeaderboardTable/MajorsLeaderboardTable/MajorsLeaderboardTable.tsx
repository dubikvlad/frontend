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

import styles from './MajorsLeaderboardTable.module.scss'

const MajorsTableByTournamentLazy = dynamic(
  () =>
    import('features/components/MajorsTableByTournament').then(
      (mod) => mod.MajorsTableByTournament,
    ),
  { loading: () => <p>Loading...</p> },
)

const MajorsYearToDateTableLazy = dynamic(
  () =>
    import('features/components/MajorsYearToDateTable').then(
      (mod) => mod.MajorsYearToDateTable,
    ),
  { loading: () => <p>Loading...</p> },
)

export function MajorsLeaderboardTable({
  poolData,
}: {
  poolData: Pool<'golf_majors'>
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
          <MajorsYearToDateTableLazy
            poolId={poolData.id}
            membersOptions={membersOptions}
            userInfoData={userInfoData}
            golfAllTournaments={golfAllTournaments}
          />
        )
      case availableTables.byTournament:
        return (
          <MajorsTableByTournamentLazy
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
