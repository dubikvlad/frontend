import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { LeaderboardStatisticItem } from '@/api'
import { Star } from '@/assets/icons'
import { getShortName } from '@/config/constants'
import { FilterByEntryAndMembersAndWeeksProps } from '@/features/components/FilterByEntryAndMembersAndWeeks/FilterByEntryAndMembersAndWeeks'
import { Sorting } from '@/features/ui'
import { SelectProps } from '@/features/ui/Select/Select'
import { SortingProps } from '@/features/ui/Sorting/Sorting'
import { useGetUser, useLeaderboard, usePool } from '@/helpers'

import styles from './PickemLeaderboardTable.module.scss'

const FilterByEntryAndMembersAndWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndWeeks'),
  { loading: () => <p>Loading...</p> },
)

type SortType = {
  name: 'name' | 'wins' | 'losses' | 'points' | null
  sort: SortingProps['active']
}

function filtrationProcessing(
  leaderboardStatistic: { [key: string]: LeaderboardStatisticItem } | undefined,
  members: string[],
  search: string,
) {
  if (!leaderboardStatistic) return []

  let statisticArr = Object.values(leaderboardStatistic)

  if (members.length) {
    statisticArr = statisticArr.filter((item) =>
      members.includes(String(item.user_id)),
    )
  }

  if (!!search.trim()) {
    statisticArr = statisticArr.filter((item) =>
      item.entry_name
        .trim()
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )
  }

  return statisticArr
}

export function PickemLeaderboardTable() {
  const {
    query: { poolId },
  } = useRouter()

  const { userData } = useGetUser()
  const { poolData } = usePool(poolId ? +poolId : undefined)

  const [wholeSeason, setWholeSeason] =
    useState<FilterByEntryAndMembersAndWeeksProps['wholeSeason']>(
      'whole-season',
    )

  const { leaderboardData, leaderboardIsLoading } = useLeaderboard({
    poolId: poolData ? poolData.id : undefined,
    weekNumber:
      !!wholeSeason?.trim() && wholeSeason !== 'whole-season'
        ? +wholeSeason
        : undefined,
  })

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])

  const leaderboardStatistic = leaderboardData?.statistic

  const leaderboardDataFiltered = filtrationProcessing(
    leaderboardStatistic,
    members,
    search,
  )

  const [sort, setSort] = useState<SortType>({ name: null, sort: null })

  const sortedData =
    sort.sort === null
      ? leaderboardDataFiltered
      : [...leaderboardDataFiltered].sort(sorting)

  function handlingSort(sortName: SortType['name']) {
    if (sortName === sort.name) {
      if (sort.sort === null) setSort((prev) => ({ ...prev, sort: 'top' }))
      if (sort.sort === 'top') setSort((prev) => ({ ...prev, sort: 'bottom' }))
      if (sort.sort === 'bottom') setSort({ name: null, sort: null })
      return
    }

    setSort({ name: sortName, sort: 'top' })
  }

  function sorting(a: LeaderboardStatisticItem, b: LeaderboardStatisticItem) {
    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        if (a.entry_name > b.entry_name) return -1
        if (a.entry_name < b.entry_name) return 1
        return 0
      } else {
        if (a.entry_name > b.entry_name) return 1
        if (a.entry_name < b.entry_name) return -1
        return 0
      }
    }

    if (sort.name === 'wins') {
      return sort.sort === 'bottom'
        ? b.forecasts.win.count - a.forecasts.win.count
        : a.forecasts.win.count - b.forecasts.win.count
    }

    if (sort.name === 'losses') {
      return sort.sort === 'bottom'
        ? b.forecasts.lost.count - a.forecasts.lost.count
        : a.forecasts.lost.count - b.forecasts.lost.count
    }

    if (sort.name === 'points') {
      return sort.sort === 'bottom' ? b.point - a.point : a.point - b.point
    }

    return 0
  }

  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )
  const [weekOptions, setWeekOptions] = useState<SelectProps['options']>([])

  if (!userData) return null

  return (
    <div className={styles.wrapper}>
      {!!poolData && (
        <FilterByEntryAndMembersAndWeeksLazy
          search={search}
          setSearch={setSearch}
          members={members}
          setMembers={setMembers}
          wholeSeason={wholeSeason}
          setWholeSeason={setWholeSeason}
          poolData={poolData}
          setMembersOptions={setMembersOptions}
          setWeekOptions={setWeekOptions}
          isDisabled={
            !leaderboardStatistic &&
            !leaderboardIsLoading &&
            wholeSeason === 'whole-season'
          }
        />
      )}

      <div
        className={classNames(styles.tableWrapper, {
          [styles.tableNotFound]: !sortedData.length,
        })}
      >
        {sortedData.length ? (
          <>
            <div className={styles.tableHead}>
              <div></div>
              <div className={styles.starWrapper}>
                <Star className={styles.iconFavorite} />
              </div>
              <div
                onClick={() => handlingSort('name')}
                className={classNames(styles.sortHead, styles.nameHead)}
              >
                <p
                  className={classNames({
                    [styles.active]: sort.name === 'name',
                  })}
                >
                  Name
                </p>{' '}
                <Sorting active={sort.name === 'name' ? sort.sort : null} />
              </div>
              <div
                onClick={() => handlingSort('wins')}
                className={styles.sortHead}
              >
                <p
                  className={classNames({
                    [styles.active]: sort.name === 'wins',
                  })}
                >
                  Wins
                </p>
                <Sorting active={sort.name === 'wins' ? sort.sort : null} />
              </div>
              <div
                onClick={() => handlingSort('losses')}
                className={styles.sortHead}
              >
                <p
                  className={classNames({
                    [styles.active]: sort.name === 'losses',
                  })}
                >
                  Losses
                </p>
                <Sorting active={sort.name === 'losses' ? sort.sort : null} />
              </div>
              <div
                onClick={() => handlingSort('points')}
                className={classNames(styles.sortHead, styles.pointsHead)}
              >
                <p
                  className={classNames({
                    [styles.active]: sort.name === 'points',
                  })}
                >
                  Points
                </p>
                <Sorting active={sort.name === 'points' ? sort.sort : null} />
              </div>
            </div>

            <div className={styles.tableBodyWrapper}>
              {sortedData.map((item, i) => {
                return (
                  <div
                    key={item.entry_id}
                    className={classNames(styles.leaderboardItem, {
                      [styles.userEntry]: userData.id === item.user_id,
                    })}
                  >
                    <p>{i + 1}</p>
                    <div>
                      {userData.id === item.user_id ? (
                        <Star className={styles.star} />
                      ) : (
                        <div
                          className={styles.shortNameBlock}
                          style={{ backgroundColor: item?.entry_color }}
                        >
                          <p>{getShortName(item.entry_name).toUpperCase()}</p>
                        </div>
                      )}
                    </div>
                    <p className={styles.nameWrapper}>{item.entry_name}</p>
                    <p>{item.forecasts.win.count}</p>
                    <p>{item.forecasts.lost.count}</p>
                    <p className={styles.pointWrapper}>{item.point}</p>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <p className={styles.notFound}>
            {!!search.trim() ? (
              <>
                Sorry, there were no results found for{' '}
                <span>&quot;{search}&quot;</span>
              </>
            ) : (
              <>
                Unfortunately, we did not find any suitable entries for the{' '}
                <span>
                  {weekOptions.find((item) => item.name === wholeSeason)?.title}
                </span>{' '}
                for{' '}
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
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
