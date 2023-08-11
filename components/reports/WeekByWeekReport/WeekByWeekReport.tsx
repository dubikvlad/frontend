import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { WeekByWeekItem, WeekByWeekResponseData } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { getShortName } from '@/config/constants'
import { FilterByEntryAndMembersAndWeeksProps } from '@/features/components/FilterByEntryAndMembersAndWeeks'
import { Sorting } from '@/features/ui'
import { SortingProps } from '@/features/ui/Sorting/Sorting'
import { usePool, useWeekByWeekReport } from '@/helpers'

import styles from './WeekByWeekReport.module.scss'

const FilterByEntryAndMembersAndWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndWeeks'),
  { loading: () => <p>Loading...</p> },
)

type SortType = {
  name: 'name' | 'ytd' | 'wins' | 'losses' | 'points' | null
  sort: SortingProps['active']
}

type DataItem = {
  entryName: string
  entryId: number
  userId: number
  total: WeekByWeekItem
  weeks: { [key: string]: WeekByWeekItem }
}

function filtrationProcessing(
  data: DataItem[],
  members: string[],
  search: string,
) {
  if (!data.length) return []

  let dataArr = [...data]

  if (members.length) {
    dataArr = dataArr.filter((item) => members.includes(String(item.userId)))
  }

  if (!!search.trim()) {
    dataArr = dataArr.filter((item) =>
      item.entryName.trim().toLowerCase().includes(search.trim().toLowerCase()),
    )
  }

  return dataArr
}

export default function WeekByWeekReport() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const [wholeSeason, setWholeSeason] =
    useState<FilterByEntryAndMembersAndWeeksProps['wholeSeason']>('')
  const [rangeValue, setRangeValue] = useState<[number | null, number | null]>([
    null,
    null,
  ])

  useEffect(() => {
    if (poolData && rangeValue.includes(null)) {
      setRangeValue([
        poolData.available_week[0],
        poolData.available_week[poolData.available_week.length - 1],
      ])
    }
  }, [poolData, rangeValue])

  const { weekByWeekReportData, weekByWeekReportIsLoading } =
    useWeekByWeekReport({
      poolId: Number(poolId),
      params: {
        week_number:
          wholeSeason &&
          !!wholeSeason.trim() &&
          wholeSeason !== 'whole-season' &&
          wholeSeason !== 'week-range'
            ? Number(wholeSeason)
            : undefined,
        start_week_number:
          wholeSeason === 'week-range' && rangeValue[0] !== null
            ? rangeValue[0]
            : undefined,
        end_week_number:
          wholeSeason === 'week-range' && rangeValue[1] !== null
            ? rangeValue[1]
            : undefined,
      },
    })

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])

  const data: DataItem[] = !!weekByWeekReportData
    ? (weekByWeekReportData
        .map((item) => {
          if (!poolData) return null

          const startWeek = Number(poolData.pick_pool.start_week)
          const currentWeek = poolData.pick_pool.current_week

          return {
            entryName: item.name,
            entryId: item.entry_id,
            userId: item.user_id,
            total: item.total,
            weeks: Object.entries(item.weeks).reduce<{
              [key: string]: WeekByWeekItem
            }>((acc, [weekNumber, result]) => {
              if (
                Number(weekNumber) < startWeek ||
                Number(weekNumber) > currentWeek
              )
                return acc
              acc[weekNumber] = result
              return acc
            }, {}),
          }
        })
        .filter((item) => !!item) as DataItem[])
    : []

  const filteredData = filtrationProcessing(data, members, search)

  const [sort, setSort] = useState<SortType>({ name: null, sort: null })

  useEffect(() => {
    setSort({ name: null, sort: null })
  }, [wholeSeason])

  const handlingSortMemoized = useCallback(
    (sortName: SortType['name']) => {
      if (sortName === sort.name) {
        if (sort.sort === null) setSort((prev) => ({ ...prev, sort: 'top' }))
        if (sort.sort === 'top')
          setSort((prev) => ({ ...prev, sort: 'bottom' }))
        if (sort.sort === 'bottom') setSort((prev) => ({ ...prev, sort: null }))
        return
      }

      setSort({ name: sortName, sort: 'top' })
    },
    [sort],
  )

  if (!poolData) return null

  const sortedData =
    sort.sort === null ? filteredData : [...filteredData].sort(sorting)

  function sorting(a: DataItem, b: DataItem) {
    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        if (a.entryName > b.entryName) return -1
        if (a.entryName < b.entryName) return 1
        return 0
      } else {
        if (a.entryName > b.entryName) return 1
        if (a.entryName < b.entryName) return -1
        return 0
      }
    }

    if (sort.name === 'ytd' || sort.name === 'points') {
      if (sort.sort === 'bottom') {
        if (a.total.points > b.total.points) return -1
        if (a.total.points < b.total.points) return 1
        return 0
      } else {
        if (a.total.points > b.total.points) return 1
        if (a.total.points < b.total.points) return -1
        return 0
      }
    }

    if (sort.name === 'wins') {
      if (sort.sort === 'bottom') {
        if (a.total.wins > b.total.wins) return -1
        if (a.total.wins < b.total.wins) return 1
        return 0
      } else {
        if (a.total.wins > b.total.wins) return 1
        if (a.total.wins < b.total.wins) return -1
        return 0
      }
    }

    if (sort.name === 'losses') {
      if (sort.sort === 'bottom') {
        if (a.total.loses > b.total.loses) return -1
        if (a.total.loses < b.total.loses) return 1
        return 0
      } else {
        if (a.total.loses > b.total.loses) return 1
        if (a.total.loses < b.total.loses) return -1
        return 0
      }
    }

    return 0
  }

  const startWeek = Number(poolData.pick_pool.start_week)
  const currentWeek = poolData.pick_pool.current_week

  const availableWeek = poolData.available_week.slice(
    poolData.available_week.indexOf(startWeek),
    poolData.available_week.indexOf(currentWeek) + 1,
  )

  return (
    <div className={styles.wrapper}>
      <FilterByEntryAndMembersAndWeeksLazy
        poolData={poolData}
        search={search}
        setSearch={setSearch}
        members={members}
        setMembers={setMembers}
        wholeSeason={wholeSeason}
        setWholeSeason={setWholeSeason}
        isWithWeekRange
        setRangeValue={setRangeValue}
      />

      {startWeek > currentWeek ? (
        <div className={styles.weekByWeekTableWrapper}>
          <NotFound search="" />
        </div>
      ) : (
        poolData && (
          <>
            {wholeSeason === 'whole-season' ? (
              <WholeSeasonTable
                availableWeek={availableWeek}
                data={sortedData}
                weekByWeekReportData={weekByWeekReportData}
                sort={sort}
                handlingSort={handlingSortMemoized}
                search={search}
                isLoading={weekByWeekReportIsLoading}
              />
            ) : (
              <WeekRangeTable
                data={sortedData}
                sort={sort}
                handlingSort={handlingSortMemoized}
                search={search}
                isLoading={weekByWeekReportIsLoading}
              />
            )}
          </>
        )
      )}
    </div>
  )
}

type WholeSeasonTableProps = {
  availableWeek: number[]
  data: DataItem[]
  weekByWeekReportData: WeekByWeekResponseData | null | undefined
  sort: SortType
  handlingSort: (sortName: SortType['name']) => void
  search: string
  isLoading: boolean
}

function WholeSeasonTable({
  availableWeek,
  data,
  weekByWeekReportData,
  sort,
  handlingSort,
  search = '',
  isLoading = false,
}: WholeSeasonTableProps) {
  const [weekActiveIndex, setWeekActiveIndex] = useState<number>(0)

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)

  function handlingNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  const topPoints = !!weekByWeekReportData
    ? weekByWeekReportData.reduce<{ [key: string]: number }>((acc, item) => {
        Object.entries(item.weeks).map(([weekNumber, week]) => {
          if (!isNaN(Number(weekNumber)) && week.points) {
            if (acc[weekNumber] === undefined) {
              acc[weekNumber] = week.points
            }

            if (acc[weekNumber] < week.points) {
              acc[weekNumber] = week.points
            }
          }
        })
        return acc
      }, {})
    : {}

  return (
    <div className={styles.weekByWeekTableWrapper}>
      <div
        className={classNames(styles.tableHead, {
          [styles.tableHeadDisabled]: !data.length,
        })}
      >
        <div></div>

        <div className={styles.name} onClick={() => handlingSort('name')}>
          <p>Name</p>
          <Sorting active={sort.name === 'name' ? sort.sort : null} />
        </div>

        <div className={styles.slider}>
          <Swiper
            modules={[Navigation]}
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current,
            }}
            slidesPerView={10}
            onBeforeInit={({ params, isEnd, isBeginning }) => {
              if (params.navigation && typeof params.navigation !== 'boolean') {
                params.navigation.prevEl = navigationPrevRef.current
                params.navigation.nextEl = navigationNextRef.current
              }

              handlingNavigation(isBeginning, isEnd)
            }}
            allowTouchMove={false}
            slideToClickedSlide
            onSlideChange={({ activeIndex, isBeginning, isEnd }) => {
              setWeekActiveIndex(activeIndex)
              handlingNavigation(isBeginning, isEnd)
            }}
          >
            {availableWeek.map((number) => (
              <SwiperSlide key={number}>
                <div>
                  <p className={styles.weekNumber}>{number}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div
            ref={navigationPrevRef}
            className={classNames(styles.previous, {
              [styles.disabled]: isPrevDisabled,
            })}
          >
            <MonthLeftArrow />
          </div>

          <div
            ref={navigationNextRef}
            className={classNames(styles.next, {
              [styles.disabled]: isNextDisabled,
            })}
          >
            <MonthRightArrow />
          </div>
        </div>

        <div className={styles.ytd} onClick={() => handlingSort('ytd')}>
          <p>YTD</p>
          <Sorting active={sort.name === 'ytd' ? sort.sort : null} />
        </div>
      </div>

      {!!data.length ? (
        <div className={styles.tableBody}>
          {data.map((item, i) => {
            const weeksArr = Object.entries(item.weeks).slice(
              weekActiveIndex,
              weekActiveIndex + 10,
            )

            return (
              <div key={i} className={styles.tableBodyItem}>
                <div className={styles.shortEntryName}>
                  <p>{getShortName(item.entryName).toUpperCase()}</p>
                </div>

                <div className={styles.entryNameWrapper}>
                  <p>{item.entryName}</p>
                </div>

                <div className={styles.weekResult}>
                  {weeksArr.map(([weekNumber, result], j) => {
                    return (
                      <div
                        key={j}
                        className={classNames(styles.weekResultItem, {
                          [styles.winner]:
                            topPoints[weekNumber] === result.points,
                        })}
                      >
                        <p>{result.points}</p>

                        <Popup
                          title={`Week ${weekNumber} ${
                            topPoints[weekNumber] === result.points
                              ? 'Winner'
                              : ''
                          }`}
                          result={result}
                          isWinner={topPoints[weekNumber] === result.points}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className={classNames(styles.ytdResultWrapper)}>
                  <p className={styles.ytdResult}>{item.total.points}</p>

                  <Popup title="YTD" result={item.total} withoutTiebreaks />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        !isLoading && <NotFound search={search} />
      )}
    </div>
  )
}

type WeekRangeTableProps = {
  data: DataItem[]
  sort: SortType
  handlingSort: (sortName: SortType['name']) => void
  search: string
  isLoading: boolean
}

function WeekRangeTable({
  data = [],
  sort,
  handlingSort,
  search,
  isLoading = false,
}: WeekRangeTableProps) {
  const topPoint = data.reduce<number>((acc, item) => {
    if (item.total.points > acc) acc = item.total.points
    return acc
  }, 0)

  return (
    <div className={styles.weekRangeTable}>
      <div
        className={classNames(styles.weekRangeTableHead, {
          [styles.weekRangeTableHeadDisabled]: !data.length,
        })}
      >
        <div></div>

        <div
          onClick={() => handlingSort('name')}
          className={styles.weekRangeHeadEntryName}
        >
          <p>Entry Name</p>
          <Sorting active={sort.name === 'name' ? sort.sort : null} />
        </div>

        <div onClick={() => handlingSort('wins')}>
          <p>Wins</p>
          <Sorting active={sort.name === 'wins' ? sort.sort : null} />
        </div>

        <div onClick={() => handlingSort('losses')}>
          <p>Losses</p>
          <Sorting active={sort.name === 'losses' ? sort.sort : null} />
        </div>

        <div>
          <p>Tiebreake</p>
        </div>

        <div onClick={() => handlingSort('points')}>
          <p>Points</p>
          <Sorting active={sort.name === 'points' ? sort.sort : null} />
        </div>
      </div>

      {data.length ? (
        <div className={styles.weekRangeTableBody}>
          {data.map((item) => (
            <div
              key={item.entryId}
              className={classNames(styles.weekRangeTableBodyItem, {
                [styles.topPoint]:
                  topPoint > 0 && item.total.points === topPoint,
              })}
            >
              <div className={styles.shortEntryName}>
                <p>{getShortName(item.entryName).toUpperCase()}</p>
              </div>

              <p className={styles.weekRangeEntryName}>{item.entryName}</p>

              <p>{item.total.wins}</p>
              <p>{item.total.loses}</p>
              <p>{item.total.tiebreaker ?? '-'}</p>
              <p className={styles.points}>{item.total.points}</p>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && <NotFound search={search} />
      )}
    </div>
  )
}

type PopupProps = {
  title: string
  result: WeekByWeekItem
  withoutTiebreaks?: boolean
  isWinner?: boolean
}

export function Popup({
  title = '',
  result,
  withoutTiebreaks = false,
  isWinner = false,
}: PopupProps) {
  return (
    <div
      className={classNames(styles.popup, { [styles.popupWinner]: isWinner })}
    >
      <p className={styles.popupTitle}>{title}</p>

      <ul>
        <li>
          <p>Points</p>
          <p>{result.points}</p>
        </li>
        <li>
          <p>Wins</p>
          <p>{result.wins}</p>
        </li>
        <li>
          <p>Losses</p>
          <p>{result.loses}</p>
        </li>
        {!withoutTiebreaks && (
          <li>
            <p>Tiebreakers</p>
            <p>{result.tiebreaker ?? 0}</p>
          </li>
        )}
      </ul>
    </div>
  )
}

function NotFound({ search }: { search: string }) {
  return (
    <p className={styles.notFound}>
      {!!search.trim() ? (
        <>
          Sorry, we didn&apos;t find any matching entries for{' '}
          <span>&quot;{search}&quot;</span>
        </>
      ) : (
        <>Sorry, we didn’t find any matching entries</>
      )}
    </p>
  )
}
