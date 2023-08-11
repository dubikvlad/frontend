import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { CreditsLeaderboardResponseDataItem } from '@/api'
import { Star } from '@/assets/icons'
import { defaultEntryColor, getShortName } from '@/config/constants'
import { FilterByEntryAndMembersAndWeeksProps } from '@/features/components/FilterByEntryAndMembersAndWeeks'
import { SelectProps } from '@/features/ui/Select/Select'
import { Sorting, SortingProps } from '@/features/ui/Sorting'
import { usePool, useLeaderboard, useGetUserInfo } from '@/helpers'

import styles from './CreditsLeaderboardTable.module.scss'

const FilterByEntryAndMembersAndWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndWeeks'),
  { loading: () => <p>Loading...</p> },
)

type SortType = {
  name:
    | 'name'
    | 'wins'
    | 'win_credits'
    | 'losses'
    | 'loss_credits'
    | 'total_credits'
    | null
  sort: SortingProps['active']
}

function filtrationProcessing(
  leaderboardData: CreditsLeaderboardResponseDataItem[],
  members: string[],
  search: string,
) {
  if (!leaderboardData.length) return []

  let data = [...leaderboardData]

  if (members.length) {
    data = data.filter((item) => members.includes(String(item.user_id)))
  }

  if (!!search.trim()) {
    data = data.filter((item) =>
      item.name.trim().toLowerCase().includes(search.trim().toLowerCase()),
    )
  }

  return data
}

export function CreditsLeaderboardTable() {
  const {
    query: { poolId },
  } = useRouter()

  const { userInfoData } = useGetUserInfo()
  const { poolData } = usePool<'credits'>(Number(poolId))

  const { leaderboardData, leaderboardIsLoading } = useLeaderboard<'credits'>({
    poolId: Number(poolId),
  })

  const [wholeSeason, setWholeSeason] =
    useState<FilterByEntryAndMembersAndWeeksProps['wholeSeason']>(
      'whole-season',
    )
  const [members, setMembers] = useState<string[]>([])
  const [search, setSearch] = useState<string>('')

  const actualLeaderboardData = leaderboardData
    ? !!wholeSeason?.trim() && wholeSeason !== 'whole-season'
      ? leaderboardData.weeks?.[wholeSeason]
        ? leaderboardData.weeks[wholeSeason]
        : []
      : leaderboardData.all
      ? Object.values(leaderboardData.all)
      : []
    : []

  const filteredLeaderboardData = filtrationProcessing(
    actualLeaderboardData,
    members,
    search,
  )

  const [sort, setSort] = useState<SortType>({ name: null, sort: null })

  const sortedData =
    sort.sort === null
      ? filteredLeaderboardData
      : [...filteredLeaderboardData].sort(sorting)

  function handlingSort(sortName: SortType['name']) {
    if (sortName === sort.name) {
      if (sort.sort === null) setSort((prev) => ({ ...prev, sort: 'top' }))
      if (sort.sort === 'top') setSort((prev) => ({ ...prev, sort: 'bottom' }))
      if (sort.sort === 'bottom') setSort({ name: null, sort: null })
      return
    }

    setSort({ name: sortName, sort: 'top' })
  }

  function sorting(
    a: CreditsLeaderboardResponseDataItem,
    b: CreditsLeaderboardResponseDataItem,
  ) {
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

    if (sort.name === 'wins') {
      return sort.sort === 'bottom'
        ? b.count_win - a.count_win
        : a.count_win - b.count_win
    }

    if (sort.name === 'win_credits') {
      return sort.sort === 'bottom'
        ? b.credits_won - a.credits_won
        : a.credits_won - b.credits_won
    }

    if (sort.name === 'losses') {
      return sort.sort === 'bottom'
        ? b.count_lost - a.count_lost
        : a.count_lost - b.count_lost
    }

    if (sort.name === 'loss_credits') {
      return sort.sort === 'bottom'
        ? b.credits_lost - a.credits_lost
        : a.credits_lost - b.credits_lost
    }

    if (sort.name === 'total_credits') {
      return sort.sort === 'bottom'
        ? b.credits_total - a.credits_total
        : a.credits_total - b.credits_total
    }

    return 0
  }

  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )
  const [weekOptions, setWeekOptions] = useState<SelectProps['options']>([])

  if (!poolData || !userInfoData) return null

  return (
    <div className={styles.wrapper}>
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
        isDisabled={leaderboardIsLoading}
      />

      <div
        className={classNames(styles.tableWrapper, {
          [styles.tableNotFound]: !leaderboardIsLoading && !sortedData.length,
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
                className={styles.sortHead}
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
                onClick={() => handlingSort('win_credits')}
                className={styles.sortHead}
              >
                <p
                  className={classNames({
                    [styles.active]: sort.name === 'win_credits',
                  })}
                >
                  Win Credits
                </p>
                <Sorting
                  active={sort.name === 'win_credits' ? sort.sort : null}
                />
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
                onClick={() => handlingSort('loss_credits')}
                className={styles.sortHead}
              >
                <p
                  className={classNames({
                    [styles.active]: sort.name === 'loss_credits',
                  })}
                >
                  Loss Credits
                </p>
                <Sorting
                  active={sort.name === 'loss_credits' ? sort.sort : null}
                />
              </div>

              <div
                onClick={() => handlingSort('total_credits')}
                className={classNames(styles.sortHead, styles.pointsHead)}
              >
                <p
                  className={classNames({
                    [styles.active]: sort.name === 'total_credits',
                  })}
                >
                  Total Credits
                </p>
                <Sorting
                  active={sort.name === 'total_credits' ? sort.sort : null}
                />
              </div>
            </div>

            <div className={styles.tableBodyWrapper}>
              {sortedData.map((item, i) => {
                const entryName =
                  item.name[0] && item.name[1]
                    ? getShortName(item.name).toUpperCase()
                    : ''

                return (
                  <div
                    key={item.entry_id}
                    className={classNames(styles.leaderboardItem, {
                      [styles.userEntry]: userInfoData.id === item.user_id,
                    })}
                  >
                    <p>{i + 1}</p>
                    <div>
                      {userInfoData.id === item.user_id ? (
                        <Star className={styles.star} />
                      ) : (
                        <div
                          className={styles.shortNameBlock}
                          style={{
                            backgroundColor:
                              item.entry_color ?? defaultEntryColor,
                          }}
                        >
                          <p>{entryName}</p>
                        </div>
                      )}
                    </div>
                    <p>{item.name}</p>
                    <p>{item.count_win}</p>
                    <p className={styles.winCredits}>+{item.credits_won}</p>
                    <p>{item.count_lost}</p>
                    <p className={styles.lossCredits}>-{item.credits_lost}</p>
                    <p className={styles.pointWrapper}>{item.credits_total}</p>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          !leaderboardIsLoading && (
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
                    {
                      weekOptions.find((item) => item.name === wholeSeason)
                        ?.title
                    }
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
          )
        )}
      </div>
    </div>
  )
}
