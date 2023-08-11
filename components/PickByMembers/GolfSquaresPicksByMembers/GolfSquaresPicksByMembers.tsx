import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { EntryPicksByEntry, Pool } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { getShortName, routes } from '@/config/constants'
import {
  Input,
  Sorting,
  SelectWithCheckboxes,
  Switcher,
  Checkbox,
} from '@/features/ui'
import { SortingProps } from '@/features/ui/Sorting/Sorting'
import { squaresEntriesFiltration, useGetUserInfo, useGrids } from '@/helpers'
import { useGetPicksByEntry } from '@/helpers/hooks'

type SortType = {
  name: 'name' | 'total' | null
  sort: SortingProps['active']
}

import styles from './GolfSquaresPicksByMembers.module.scss'

export function GolfSquaresPicksByMembers({
  poolData,
}: {
  poolData: Pool<'golf_squares'>
}) {
  const slidesPerView = 6

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortType>({ name: null, sort: null })
  const [members, setMembers] = useState<string[]>([])

  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)

  const [showOnlyMyEntries, setShowOnlyMyEntries] = useState(false)
  const [showGuests, setShowGuests] = useState(true)

  const {
    query: { poolId },
  } = useRouter()

  const { picksByEntryData } = useGetPicksByEntry(Number(poolId))
  const { gridsData } = useGrids({ poolId: Number(poolId) })
  const { userInfoData } = useGetUserInfo()

  function handlingWeekNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  const entries = useMemo(() => {
    return picksByEntryData?.entries
      ? Object.values(picksByEntryData?.entries)
      : []
  }, [picksByEntryData])

  const grids = picksByEntryData?.grids ?? []

  const membersOptions = useMemo(() => {
    const hasGuest = entries.some((item) => item.is_guest)

    const totalData = poolData.users.map((item) => {
      return {
        title: item.username,
        name: String(item.id),
      }
    })

    if (showGuests) {
      if (hasGuest) {
        totalData.push({
          title: 'Guests',
          name: 'guests',
        })
      }
    }

    return totalData
  }, [entries, poolData.users, showGuests])

  const filteredEntries = squaresEntriesFiltration({
    data: entries,
    search,
    members,
    showGuests,
    showOnlyMyEntries,
    userInfoData,
  })

  const renderEntriesData = !sort.sort
    ? filteredEntries
    : [...filteredEntries].sort(sorting)

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

  function sorting(a: EntryPicksByEntry, b: EntryPicksByEntry) {
    if (sort.name === 'name') {
      if (sort.sort === 'top') {
        if (a.name > b.name) return -1
        if (a.name < b.name) return 1
        return 0
      } else {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      }
    }

    if (sort.name === 'total') {
      return sort.sort === 'top' ? a.total - b.total : b.total - a.total
    }

    return 0
  }

  function clickCheckboxHandler(value: boolean) {
    setShowOnlyMyEntries(value)
    setMembers([])
    setShowGuests((prev) => !prev)
    setSearch('')
  }

  return (
    <div className={styles.wrapper}>
      {picksByEntryData ? (
        <>
          <div className={styles.head}>
            <Input
              value={search}
              onChange={setSearch}
              type="search"
              placeholder="Search by Name"
              isDisabled={showOnlyMyEntries}
            />

            <SelectWithCheckboxes
              options={membersOptions}
              value={members}
              onChange={setMembers}
              placeholder="All members"
              disabled={showOnlyMyEntries}
            />

            <div className={styles.checkboxWrap}>
              <Checkbox
                value={showOnlyMyEntries}
                onChange={clickCheckboxHandler}
              >
                Only my entries
              </Checkbox>
            </div>

            {poolData.owner.id === userInfoData?.id ? (
              <div
                className={classNames(styles.switcher, {
                  [styles.disabled]: showOnlyMyEntries,
                })}
              >
                <Switcher value={showGuests} onChange={setShowGuests}>
                  Show my guest entries
                </Switcher>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className={styles.table}>
            <div
              className={classNames(styles.thead, {
                [styles.disabled]: !renderEntriesData.length && search,
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
              {!!renderEntriesData.length
                ? renderEntriesData.map((entry) => {
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
                : search && (
                    <p className={styles.noSearch}>
                      No matching entries were found for &quot;{search}&quot;
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
