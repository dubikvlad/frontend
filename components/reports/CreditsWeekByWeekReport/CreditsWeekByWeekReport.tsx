import classNames from 'classnames'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useCallback, useRef, useState } from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { CreditsWeekByWeekResponseData } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { getShortName } from '@/config/constants'
import { Sorting } from '@/features/ui'
import { SortingProps } from '@/features/ui/Sorting/Sorting'
import { usePool, useWeekByWeekReport } from '@/helpers'

import styles from './CreditsWeekByWeekReport.module.scss'

const FilterByEntryAndMembersAndWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndWeeks'),
  { loading: () => <p>Loading...</p> },
)

type SortType = {
  name: 'name' | 'ytd' | null
  sort: SortingProps['active']
}

type DataItem = {
  name: string
  entry_id: number
  userId: number
  total: { credits: number; wins: number; losses: number }
  weeks: { [key: string | number]: DataItemWeek } | undefined
}

type DataItemWeek = {
  credits: number
  wins: number
  losses: number
}

function filtrationProcessing(
  data: DataItem[],
  members: string[],
  search: string,
): DataItem[] {
  if (!data.length) return []

  let dataArr: DataItem[] = [...data]

  if (members.length) {
    dataArr = dataArr.filter((item) => members.includes(String(item.userId)))
  }

  if (!!search.trim()) {
    dataArr = dataArr.filter((item) =>
      item.name.trim().toLowerCase().includes(search.trim().toLowerCase()),
    )
  }

  return dataArr
}

export default function CreditsWeekByWeekReport() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'credits'>(Number(poolId))

  const { weekByWeekReportData, weekByWeekReportIsLoading } =
    useWeekByWeekReport<CreditsWeekByWeekResponseData>({
      poolId: Number(poolId),
    })

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])

  const entriesWithAvailableWeeks: DataItem[] = weekByWeekReportData.length
    ? weekByWeekReportData.map((entry) => {
        const currentWeek = poolData?.pick_pool.current_week

        return {
          ...entry,
          total: { credits: 0, wins: 0, losses: 0 },
          userId: entry.user_id,
          weeks: poolData?.available_week.reduce((acc, cur) => {
            if (currentWeek && cur > currentWeek) return acc

            const value = Object.entries(entry.weeks).find(
              ([week, _]) => week === String(cur),
            )

            if (value) {
              acc[cur] = { ...value[1], credits: Number(value[1].credits) }
            } else {
              acc[cur] = {
                credits: 0,
                wins: 0,
                losses: 0,
              }
            }
            return acc
          }, {} as { [key: string | number]: DataItemWeek }),
        }
      })
    : []

  const data: DataItem[] = Object.values(entriesWithAvailableWeeks).map(
    (item) => {
      if (!item.weeks) return item

      return {
        ...item,
        total: {
          credits: Object.values(item.weeks).reduce(
            (acc, cur) => acc + cur.credits,
            0,
          ),
          wins: Object.values(item.weeks).reduce(
            (acc, cur) => acc + cur.wins,
            0,
          ),
          losses: Object.values(item.weeks).reduce(
            (acc, cur) => acc + cur.losses,
            0,
          ),
        },
      }
    },
  )

  const filteredData = filtrationProcessing(data, members, search)

  const [sort, setSort] = useState<SortType>({ name: null, sort: null })

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
        if (a.name > b.name) return -1
        if (a.name < b.name) return 1
        return 0
      } else {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      }
    }

    if (sort.name === 'ytd' || sort.name === 'points') {
      if (sort.sort === 'bottom') {
        if (a.total.credits > b.total.credits) return -1
        if (a.total.credits < b.total.credits) return 1
        return 0
      } else {
        if (a.total.credits > b.total.credits) return 1
        if (a.total.credits < b.total.credits) return -1
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
      />

      {startWeek > currentWeek ? (
        <div className={styles.weekByWeekTableWrapper}>
          <NotFound search="" />
        </div>
      ) : (
        poolData && (
          <WholeSeasonTable
            availableWeek={availableWeek}
            data={sortedData}
            sort={sort}
            handlingSort={handlingSortMemoized}
            search={search}
            isLoading={weekByWeekReportIsLoading}
          />
        )
      )}
    </div>
  )
}

function WholeSeasonTable({
  availableWeek,
  data,
  sort,
  handlingSort,
  search = '',
  isLoading = false,
}: {
  availableWeek: number[]
  data: DataItem[]
  sort: SortType
  handlingSort: (sortName: SortType['name']) => void
  search: string
  isLoading: boolean
}) {
  const [weekActiveIndex, setWeekActiveIndex] = useState<number>(0)

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)

  function handlingNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  const topPoints = !!data
    ? data.reduce<{ [key: string]: number }>((acc, item) => {
        if (!item.weeks) return acc

        Object.entries(item.weeks).map(([weekNumber, week]) => {
          if (!isNaN(Number(weekNumber)) && week.credits) {
            if (acc[weekNumber] === undefined) {
              acc[weekNumber] = week.credits
            }

            if (acc[weekNumber] < week.credits) {
              acc[weekNumber] = week.credits
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
          <p
            className={classNames({
              [styles.active]: sort.name === 'name' && sort.sort,
            })}
          >
            Entry Name
          </p>
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
          <p
            className={classNames({
              [styles.active]: sort.name === 'ytd' && sort.sort,
            })}
          >
            YTD
          </p>

          <Sorting active={sort.name === 'ytd' ? sort.sort : null} />
        </div>
      </div>

      {!!data.length ? (
        <div className={styles.tableBody}>
          {data.map((item, i) => {
            if (!item.weeks) return null

            const weeksArr = Object.entries(item.weeks).slice(
              weekActiveIndex,
              weekActiveIndex + 10,
            )

            return (
              <div key={i} className={styles.tableBodyItem}>
                <div className={styles.shortEntryName}>
                  <p>{getShortName(item.name).toUpperCase()}</p>
                </div>

                <div className={styles.entryNameWrapper}>
                  <p>{item.name}</p>
                </div>

                <div className={styles.weekResult}>
                  {weeksArr.map(([weekNumber, result], j) => {
                    return (
                      <div
                        key={j}
                        className={classNames(styles.weekResultItem, {
                          [styles.winner]:
                            topPoints[weekNumber] === result.credits,
                        })}
                      >
                        <p>{result.credits}</p>

                        <Popup
                          title={`Week ${weekNumber} ${
                            topPoints[weekNumber] === result.credits
                              ? 'Winner'
                              : ''
                          }`}
                          result={result}
                          isWinner={topPoints[weekNumber] === result.credits}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className={classNames(styles.ytdResultWrapper)}>
                  <p className={styles.ytdResult}>{item.total.credits}</p>

                  <Popup title="YTD" result={item.total} />
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

type PopupProps = {
  title: string
  result: DataItemWeek
  isWinner?: boolean
}

export function Popup({ title = '', result, isWinner = false }: PopupProps) {
  return (
    <div
      className={classNames(styles.popup, { [styles.popupWinner]: isWinner })}
    >
      <p className={styles.popupTitle}>{title}</p>

      <ul>
        <li>
          <p>Credits</p>
          <p>{result.credits}</p>
        </li>
        <li>
          <p>Wins</p>
          <p>{result.wins}</p>
        </li>
        <li>
          <p>Losses</p>
          <p>{result.losses}</p>
        </li>
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
