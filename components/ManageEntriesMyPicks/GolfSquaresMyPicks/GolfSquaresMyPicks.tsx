import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { EntryPicksByEntry } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { getShortName, routes } from '@/config/constants'
import { Input, Sorting, SelectWithCheckboxes, Switcher } from '@/features/ui'
import { SortingProps } from '@/features/ui/Sorting/Sorting'
import { useGetUserInfo, useGrids } from '@/helpers'
import { useGetPicksByEntry } from '@/helpers/hooks'

type SortType = {
  name: 'name' | 'total' | null
  sort: SortingProps['active']
}

import styles from './GolfSquaresMyPicks.module.scss'

export function GolfSquaresMyPicks() {
  const slidesPerView = 6

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  const [sort, setSort] = useState<SortType>({ name: null, sort: null })
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)
  const [selectEntries, setSelectEntries] = useState<string[]>([])
  const [filteredEntries, setFilteredEntries] = useState<number[]>([])
  const [showGuests, setShowGuests] = useState(true)

  const {
    query: { poolId },
  } = useRouter()

  const { userInfoData } = useGetUserInfo()
  const { picksByEntryData } = useGetPicksByEntry(Number(poolId))
  const { gridsData } = useGrids({ poolId: Number(poolId) })

  function handlingWeekNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  const entries = useMemo(() => {
    return picksByEntryData?.entries ?? []
  }, [picksByEntryData])

  const grids = picksByEntryData?.grids ?? []

  useEffect(() => {
    const data = Object.values(entries).reduce<number[]>((acc, item) => {
      if (selectEntries.includes(String(item.id))) acc = [...acc, ...[item.id]]
      return acc
    }, [])

    !!data.length && setFilteredEntries(data)
  }, [selectEntries, entries])

  const entriesOptions = useMemo(() => {
    if (userInfoData && picksByEntryData) {
      return Object.values(picksByEntryData.entries)
        .filter((item) => item.user_id == userInfoData.id)
        .map((item) => {
          return {
            title: `${item.name}`,
            name: String(item.id),
          }
        })
    }
    return []
  }, [picksByEntryData, userInfoData])

  const handlingSortMemoized = useCallback(
    (sortName: SortType['name']) => {
      if (sortName === sort.name) {
        if (sort.sort === null) setSort((prev) => ({ ...prev, sort: 'top' }))
        if (sort.sort === 'top')
          setSort((prev) => ({ ...prev, sort: 'bottom' }))
        if (sort.sort === 'bottom') setSort({ name: null, sort: null })
        return
      }

      setSort({ name: sortName, sort: 'top' })
    },
    [sort],
  )

  const sortedData =
    sort.sort === null
      ? Object.values(entries)
      : [...Object.values(entries)].sort(sorting)

  const filteredData = filtration(
    sortedData,
    input,
    filteredEntries,
    selectEntries,
  )

  function filtration(
    data: EntryPicksByEntry[],
    search: string,
    filteredEntries: number[],
    selectEntries: string[],
  ) {
    if (!data) return []

    let newData = data

    if (userInfoData) {
      if (!showGuests) {
        newData = newData.filter(
          (item) => item.user_id === userInfoData.id && !item.is_guest,
        )
      } else
        newData = newData.filter((item) => item.user_id === userInfoData.id)
    }

    if (selectEntries.length) {
      newData = newData.filter((item) => filteredEntries.includes(item.id))
    }

    if (!!search.trim()) {
      newData = data.filter((item) =>
        item.name.trim().toLowerCase().includes(search.trim().toLowerCase()),
      )
    }

    return newData
  }

  function sorting(a: EntryPicksByEntry, b: EntryPicksByEntry) {
    if (sort.name === 'name') {
      if (sort.sort === 'bottom') {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      } else {
        if (a.name > b.name) return -1
        if (a.name < b.name) return 1
        return 0
      }
    }

    if (sort.name === 'total') {
      if (sort.sort === 'bottom') {
        if (a.total > b.total) return 1
        if (a.total < b.total) return -1
        return 0
      } else {
        if (a.total > b.total) return -1
        if (a.total < b.total) return 1
        return 0
      }
    }

    return 0
  }

  return (
    <div className={styles.wrapper}>
      {picksByEntryData ? (
        <>
          <div className={styles.head}>
            <Input
              value={input}
              onChange={setInput}
              type="search"
              placeholder="Search by Name"
            />
            <SelectWithCheckboxes
              options={entriesOptions}
              value={selectEntries}
              onChange={setSelectEntries}
              placeholder="All entries"
            />

            <div className={styles.switcher}>
              <Switcher value={showGuests} onChange={setShowGuests}>
                Show my guest entries
              </Switcher>
            </div>
          </div>

          <div className={styles.table}>
            <div
              className={classNames(styles.thead, {
                [styles.disabled]: !filteredData.length && input,
              })}
            >
              <div className={styles.row}>
                <div className={styles.name}>
                  <div className="short-name-block" />
                  <div
                    className={classNames(styles.sortWrapper, {
                      [styles.active]: sort.name === 'name',
                    })}
                    onClick={() => handlingSortMemoized('name')}
                  >
                    Entry Name
                    <Sorting active={sort.name === 'name' ? sort.sort : null} />
                  </div>
                </div>
                <div className={styles.swiperWrapper}>
                  <Swiper
                    modules={[Navigation]}
                    slidesPerView={slidesPerView}
                    allowTouchMove={false}
                    onSlideChange={({ activeIndex, isBeginning, isEnd }) => {
                      setActiveIndex(activeIndex)
                      handlingWeekNavigation(isBeginning, isEnd)
                    }}
                    navigation={{
                      prevEl: navigationPrevRef.current,
                      nextEl: navigationNextRef.current,
                    }}
                    onBeforeInit={({ params, isEnd, isBeginning }) => {
                      if (
                        params.navigation &&
                        typeof params.navigation !== 'boolean'
                      ) {
                        params.navigation.prevEl = navigationPrevRef.current
                        params.navigation.nextEl = navigationNextRef.current
                      }

                      handlingWeekNavigation(isBeginning, isEnd)
                    }}
                  >
                    {!!gridsData.length &&
                      gridsData.map((grid) => {
                        return (
                          <SwiperSlide key={grid.id} className={styles.slide}>
                            <p className={styles.slideTitle}>Grid {grid.id}</p>
                          </SwiperSlide>
                        )
                      })}
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
                      [styles.disabled]:
                        isNextDisabled ||
                        (grids?.length && grids.length <= slidesPerView),
                    })}
                  >
                    <MonthRightArrow />
                  </div>
                </div>
                <div
                  className={classNames(
                    styles.sortWrapper,
                    styles.totalWrapper,
                    {
                      [styles.active]: sort.name === 'total',
                    },
                  )}
                  onClick={() => handlingSortMemoized('total')}
                >
                  <div className={styles.total}>Total</div>
                  <Sorting active={sort.name === 'total' ? sort.sort : null} />
                </div>
              </div>
            </div>

            <div className={styles.tbody}>
              {!!filteredData.length
                ? filteredData.map((entry) => {
                    const isGuest = entry.is_guest
                    return (
                      <div
                        className={classNames(
                          'short-name-block-wrapper',
                          styles.row,
                          { [styles.guestRow]: isGuest },
                        )}
                        key={entry.id}
                      >
                        <div className={styles.name}>
                          <div
                            className={classNames('short-name-block', {
                              [styles.shortIsGuest]: isGuest,
                            })}
                          >
                            <p>{getShortName(entry.name).toUpperCase()}</p>
                          </div>
                          <div>
                            {entry.name}{' '}
                            {!!isGuest && (
                              <div className={styles.guestTitle}>
                                Guest Entry
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={styles.rowResults}>
                          {!!grids?.length &&
                            grids.map((grid, i) => {
                              const value = entry?.forecasts?.[grid?.id]
                              if (
                                i < activeIndex ||
                                i >= slidesPerView + activeIndex
                              )
                                return null
                              return <div key={i}>{value}</div>
                            })}
                        </div>

                        <div className={styles.total}>{entry.total}</div>
                      </div>
                    )
                  })
                : input && (
                    <p className={styles.noSearch}>
                      No matching entries were found for &quot;{input}&quot;
                    </p>
                  )}
            </div>
          </div>
        </>
      ) : (
        <p className={styles.noData}>
          You have not created any entries.{' '}
          <Link href={routes.account.createGrid(Number(poolId))}>
            Click here
          </Link>{' '}
          to go to the &quot;Create a Grid&quot; page
        </p>
      )}
    </div>
  )
}
