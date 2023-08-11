import classNames from 'classnames'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import type { PointSpreadDifferentialResponse } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import {
  generateParticipantImagePath,
  generateTeamShortName,
  getShortName,
} from '@/config/constants'
import { FilterByEntryAndMembersAndWeeksProps } from '@/features/components/FilterByEntryAndMembersAndWeeks'
import { Sorting } from '@/features/ui'
import { SelectProps } from '@/features/ui/Select/Select'
import { SortingProps } from '@/features/ui/Sorting/Sorting'
import { useGetPointSpreadDifferential, usePool } from '@/helpers'

import styles from './PointDifferentialReport.module.scss'

const FilterByEntryAndMembersAndWeeksLazy = dynamic(
  () => import('@/features/components/FilterByEntryAndMembersAndWeeks'),
  { loading: () => <p>Loading...</p> },
)

type SortType = {
  name: 'name' | null
  sort: SortingProps['active']
}

const itemsInRow = 5

export function PointDifferentialReport() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const { pointSpreadDifferential } = useGetPointSpreadDifferential(
    Number(poolId),
  )

  const availableWeek = poolData?.available_week ?? []
  const pickPool = poolData?.pick_pool

  const weeks =
    pickPool &&
    availableWeek.slice(
      availableWeek.indexOf(Number(pickPool.start_week)),
      availableWeek.indexOf(pickPool.current_week + 1),
    )

  const [search, setSearch] = useState<string>('')
  const [members, setMembers] = useState<string[]>([])
  const [weekActiveIndex, setWeekActiveIndex] = useState<number>(0)
  const [membersOptions, setMembersOptions] = useState<SelectProps['options']>(
    [],
  )
  const [weekOptions, setWeekOptions] = useState<SelectProps['options']>([])
  const [weekSelected, setWeekSelected] = useState(false)
  const [rangeValue, setRangeValue] = useState<[number | null, number | null]>([
    null,
    null,
  ])

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

  const [wholeSeason, setWholeSeason] =
    useState<FilterByEntryAndMembersAndWeeksProps['wholeSeason']>(
      'whole-season',
    )

  const filteredData = filtrationProcessing(
    pointSpreadDifferential,
    members,
    search,
  ).sort(sorting)

  useEffect(() => {
    if (poolData && rangeValue.includes(null)) {
      setRangeValue([
        poolData.available_week[0],
        poolData.available_week[poolData.available_week.length - 1],
      ])
    }
  }, [poolData, rangeValue])

  useEffect(() => {
    if (wholeSeason === 'week-range' || wholeSeason === 'whole-season') {
      setWeekSelected(false)
    } else setWeekSelected(true)
  }, [wholeSeason])

  function filtrationProcessing(
    pointSpreadDifferential:
      | PointSpreadDifferentialResponse[]
      | undefined
      | null,
    members: string[],
    search: string,
  ) {
    if (!pointSpreadDifferential) return []

    let filteredSpreadDiff = pointSpreadDifferential

    if (members.length) {
      filteredSpreadDiff = filteredSpreadDiff.filter((item) =>
        members.includes(String(item.user_id)),
      )
    }

    if (!!search.trim()) {
      filteredSpreadDiff = filteredSpreadDiff.filter((item) =>
        item.name.trim().toLowerCase().includes(search.trim().toLowerCase()),
      )
    }

    return filteredSpreadDiff
  }

  function sorting(
    a: PointSpreadDifferentialResponse,
    b: PointSpreadDifferentialResponse,
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

    return 0
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <p>
          This report adds up the point spread for each game a member picked.
          The higher a team&apos;s differential, the more risky their picks were
          (e.g., a member with a combined spread of -65 made riskier picks
          overall than a member with -83).
        </p>
        <p>
          The grid below shows the teams, their weekly picks (including point
          spreads), and their total point spread differential for the season.
        </p>
        <p>
          Incorrect picks are indicated in red, but are tallied the same as
          other games in the final calculation.
        </p>
      </div>
      <div className={styles.report}>
        {!!poolData && (
          <>
            <div className={styles.filters}>
              <FilterByEntryAndMembersAndWeeksLazy
                search={search}
                setSearch={setSearch}
                members={members}
                setMembers={setMembers}
                poolData={poolData}
                wholeSeason={wholeSeason}
                setWholeSeason={setWholeSeason}
                setMembersOptions={setMembersOptions}
                setWeekOptions={setWeekOptions}
                setRangeValue={setRangeValue}
                isWithWeekRange
              />
            </div>
            {filteredData.length ? (
              <div className={styles.tableWrapper}>
                <div className={styles.tableHaeder}>
                  <div className={styles.headerNameWrapper}>
                    <div
                      onClick={() => handlingSortMemoized('name')}
                      className={styles.headerName}
                    >
                      Entry Name{' '}
                      <Sorting
                        active={sort.name === 'name' ? sort.sort : null}
                      />
                    </div>
                  </div>
                  <div className={styles.headerSlider}>
                    <SliderSorting
                      weeks={weeks}
                      setWeekActiveIndex={setWeekActiveIndex}
                      wholeSeason={wholeSeason}
                      rangeValue={rangeValue}
                    />
                  </div>
                  <div className={classNames(styles.total)}>Total</div>
                </div>

                {filteredData?.map((item, i) => {
                  return (
                    <div className={styles.tableRow} key={i}>
                      <div className={styles.name}>
                        <div className={styles.shortNameBlock}>
                          <p>{getShortName(item.name).toUpperCase()}</p>
                        </div>
                        {item.name}
                      </div>
                      <div className={styles.teams}>
                        {weeks?.map((weekNumber, i) => {
                          if (i < weekActiveIndex) return null

                          if (i > itemsInRow - 1 + weekActiveIndex) return null

                          if (weekSelected) {
                            if (Number(wholeSeason) !== weekNumber) return null
                          }

                          if (
                            rangeValue[0] !== null &&
                            rangeValue[1] !== null
                          ) {
                            if (rangeValue[0] > weekNumber) return null
                            if (rangeValue[1] < weekNumber) return null
                          }

                          return (
                            <div
                              key={weekNumber}
                              className={styles.weekItemWrapper}
                            >
                              {item.weeks?.[weekNumber]?.map(
                                (participant, i) => (
                                  <div
                                    key={i}
                                    className={classNames(styles.weekItem, {
                                      [styles.lost]:
                                        participant.status === 'lost',
                                    })}
                                  >
                                    <div className={styles.imgWrapper}>
                                      <Image
                                        src={generateParticipantImagePath(
                                          participant.external_id,
                                        )}
                                        width={20}
                                        height={20}
                                        alt={
                                          participant.short_name ??
                                          generateTeamShortName(
                                            participant.name,
                                          )
                                        }
                                      />
                                    </div>
                                    <span>
                                      {participant.short_name ??
                                        generateTeamShortName(participant.name)}
                                    </span>
                                    <span>{participant.spread}</span>
                                  </div>
                                ),
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className={styles.total}>{item.total}</div>
                    </div>
                  )
                })}
              </div>
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
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SliderSorting({
  weeks,
  setWeekActiveIndex,
  wholeSeason,
  rangeValue,
}: {
  weeks: number[] | undefined
  setWeekActiveIndex: Dispatch<SetStateAction<number>>
  wholeSeason: FilterByEntryAndMembersAndWeeksProps['wholeSeason']
  rangeValue: [number | null, number | null]
}) {
  const [isNextDisabled, setIsNextDisabled] = useState(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState(false)

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  function handlingNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    if (weeks ? weeks.length <= itemsInRow : false) {
      setIsNextDisabled(true)
    } else setIsNextDisabled(isEnd)
  }

  const splicedWeeks =
    (wholeSeason !== 'whole-season' &&
      wholeSeason !== 'week-range' &&
      weeks?.slice(
        weeks.findIndex((item) => item === Number(wholeSeason)),
        weeks.findIndex((item) => item === Number(wholeSeason)) + 1,
      )) ||
    (wholeSeason === 'week-range' &&
      weeks?.slice(
        weeks.findIndex((item) => item === rangeValue[0]),
        weeks.findIndex((item) => item === rangeValue[1]) + 1,
      ))

  return (
    <div className={styles.sliderWrapper}>
      <div
        ref={navigationPrevRef}
        className={classNames(styles.navigation, styles.prev, {
          [styles.disabled]: isPrevDisabled,
        })}
      >
        <MonthLeftArrow />
      </div>
      <div
        ref={navigationNextRef}
        className={classNames(styles.navigation, styles.next, {
          [styles.disabled]: isNextDisabled,
        })}
      >
        <MonthRightArrow />
      </div>
      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        allowTouchMove={false}
        onBeforeInit={({ params, isEnd, isBeginning }) => {
          if (params.navigation && typeof params.navigation !== 'boolean') {
            params.navigation.prevEl = navigationPrevRef.current
            params.navigation.nextEl = navigationNextRef.current
          }

          handlingNavigation(isBeginning, isEnd)
        }}
        slidesPerView={itemsInRow}
        onSlideChange={({ isBeginning, isEnd, activeIndex }) => {
          handlingNavigation(isBeginning, isEnd)
          setWeekActiveIndex(activeIndex)
        }}
      >
        {Array.isArray(splicedWeeks)
          ? splicedWeeks?.map((item, i) => (
              <SwiperSlide key={i} className={styles.slide}>
                {item}
              </SwiperSlide>
            ))
          : weeks?.map((item, i) => (
              <SwiperSlide key={i} className={styles.slide}>
                {item}
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  )
}
