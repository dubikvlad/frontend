import classNames from 'classnames'
import { useState } from 'react'

import { EntriesItem, PickemLeaderboardResponseData } from '@/api'
import { Bell } from '@/assets/icons'
import { getShortName } from '@/config/constants'
import { Sorting } from '@/features/ui'
import { useGetPoolUsers } from '@/helpers'

import styles from './PoolStatsLeaderboardTable.module.scss'

type PoolStatsLeaderboardTableProps = {
  selectedWeek: number
  currentWeek: number
  data: PickemLeaderboardResponseData['statistic'] | undefined
  isLoading: boolean
  entriesData: EntriesItem[]
  poolId: number
  entriesIsLoading: boolean
}

type UserData = {
  id: number
  name: string
  shortName: string
  numberOfEntries: number
  numberOfPickedEntries: number
}

type SortType = {
  name: 'name' | 'entries' | 'pick-made' | null
  sort: 'top' | 'bottom' | null
}

export default function PoolStatsLeaderboardTable({
  selectedWeek,
  currentWeek,
  data,
  isLoading,
  entriesData = [],
  poolId,
  entriesIsLoading,
}: PoolStatsLeaderboardTableProps) {
  const { poolUsersData } = useGetPoolUsers(poolId)

  const usersData = poolUsersData.map((user) => {
    const userEntries = !!entriesData?.length
      ? entriesData.filter((entry) => entry.user_id === user.id)
      : []

    const numberOfPickedEntries = userEntries.filter(
      (entry) => !!entry.pickem_forecasts.length,
    ).length

    return {
      id: user.id,
      name: `${user.username}`,
      shortName: getShortName(user.username).toUpperCase(),
      numberOfEntries: userEntries.length,
      numberOfPickedEntries,
    }
  })

  const [sort, setSort] = useState<SortType>({ name: null, sort: null })

  const sortedData =
    sort.sort === null ? usersData : [...usersData].sort(sorting)

  function handlingSort(sortName: SortType['name']) {
    if (sortName === sort.name) {
      if (sort.sort === null) setSort((prev) => ({ ...prev, sort: 'top' }))
      if (sort.sort === 'top') setSort((prev) => ({ ...prev, sort: 'bottom' }))
      if (sort.sort === 'bottom') setSort((prev) => ({ ...prev, sort: null }))
      return
    }

    setSort({ name: sortName, sort: 'top' })
  }

  function sorting(a: UserData, b: UserData) {
    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        if (a.name > b.name) return -1
        if (a.name < b.name) return 1
        return 0
      } else {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      }
    }

    if (sort.name === 'entries') {
      if (sort.sort === 'bottom') {
        if (a.numberOfEntries > b.numberOfEntries) return -1
        if (a.numberOfEntries < b.numberOfEntries) return 1
        return 0
      } else {
        if (a.numberOfEntries > b.numberOfEntries) return 1
        if (a.numberOfEntries < b.numberOfEntries) return -1
        return 0
      }
    }

    if (sort.name === 'pick-made') {
      if (sort.sort === 'bottom') {
        if (
          a.numberOfEntries - a.numberOfPickedEntries >
          b.numberOfEntries - b.numberOfPickedEntries
        )
          return 1
        if (
          a.numberOfEntries - a.numberOfPickedEntries <
          b.numberOfEntries - b.numberOfPickedEntries
        )
          return -1
        return 0
      } else {
        if (
          a.numberOfEntries - a.numberOfPickedEntries >
          b.numberOfEntries - b.numberOfPickedEntries
        )
          return -1
        if (
          a.numberOfEntries - a.numberOfPickedEntries <
          b.numberOfEntries - b.numberOfPickedEntries
        )
          return 1
        return 0
      }
    }

    return 0
  }

  return (
    <div
      className={classNames(styles.leaderboard, {
        [styles.leaderboardComing]: selectedWeek > currentWeek,
      })}
    >
      {selectedWeek <= currentWeek ? (
        <div className={styles.head}>
          <p>Leaderboard of the week</p>
          <p>W</p>
          <p>L</p>
          <p>TB</p>
          <p>P</p>
        </div>
      ) : (
        <div className={styles.comingHead}>
          <div></div>
          <div onClick={() => handlingSort('name')}>
            <p>Name</p>{' '}
            <Sorting
              active={sort.name === 'name' ? sort.sort : null}
              className={styles.sort}
            />
          </div>
          <div onClick={() => handlingSort('entries')}>
            <p>Entries #</p>{' '}
            <Sorting
              active={sort.name === 'entries' ? sort.sort : null}
              className={styles.sort}
            />
          </div>
          <div onClick={() => handlingSort('pick-made')}>
            <p>Pick Made</p>{' '}
            <Sorting
              active={sort.name === 'pick-made' ? sort.sort : null}
              className={styles.sort}
            />
          </div>
          <p></p>
        </div>
      )}

      <div
        className={classNames(styles.rows, {
          [styles.isPicks]: data,
        })}
      >
        {selectedWeek <= currentWeek ? (
          data ? (
            Object.values(data).map((item, i) => (
              <div
                key={item.entry_id}
                className={classNames(styles.row, styles.rowColorsShortEntry)}
              >
                <div className={styles.entry}>
                  <p className={styles.number}>{i + 1}</p>
                  <div className={styles.shortEntry}>
                    {getShortName(item.entry_name).toUpperCase()}
                  </div>
                  <p>{item.entry_name}</p>
                </div>
                <p>{item.forecasts.win.count}</p>
                <p>{item.forecasts.lost.count}</p>
                <p>{item?.tiebreaker ?? '-'}</p>
                <p>{item.point}</p>
              </div>
            ))
          ) : (
            !isLoading && (
              <p className={styles.noPicks}>
                {selectedWeek === currentWeek ? (
                  'No matches have been played this week. Leaderboard will be available after the results of the matches are published'
                ) : (
                  <>
                    In <span>Week {selectedWeek}</span>, no member made his
                    Picks
                  </>
                )}
              </p>
            )
          )
        ) : sortedData.length ? (
          sortedData.map((item) => {
            return (
              <div
                key={item.id}
                className={classNames(
                  styles.comingRow,
                  styles.rowColorsShortEntry,
                )}
              >
                <div>
                  <div className={styles.shortEntry}>{item.shortName}</div>
                </div>
                <p>{item.name}</p>
                <p>{!entriesIsLoading ? item.numberOfEntries : '-'}</p>
                <p className={styles.pickMade}>
                  {!entriesIsLoading ? (
                    item.numberOfPickedEntries === item.numberOfEntries ? (
                      <span className={styles.yes}>Yes</span>
                    ) : (
                      <>
                        <span className={styles.no}>No</span> (
                        {item.numberOfPickedEntries}/{item.numberOfEntries})
                      </>
                    )
                  ) : (
                    '-'
                  )}
                </p>
                <div className={styles.bell}>
                  {!entriesIsLoading &&
                    item.numberOfPickedEntries !== item.numberOfEntries && (
                      <Bell />
                    )}
                </div>
              </div>
            )
          })
        ) : (
          <div></div>
        )}
      </div>
    </div>
  )
}
