import classNames from 'classnames'
import { useRouter } from 'next/router'
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
} from 'react'
import { Navigation, EffectFade } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { months } from '@/config/constants'
import { useGetTournamentsWeeks, usePool } from '@/helpers'

import styles from './HorizontalFilterByWeek2.module.scss'

type WeekItem = {
  monthNumber: number
  year: number
  date: string
  weeks: { title: number; date: string }[]
}

type HorizontalFilterByWeek2Props = {
  setSelectedWeek: Dispatch<SetStateAction<number | undefined>>
}

export function HorizontalFilterByWeek2Desc({
  setSelectedWeek,
}: HorizontalFilterByWeek2Props) {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const { tournamentsWeeksData } = useGetTournamentsWeeks(
    poolData?.tournament_id,
  )

  const weeks = useMemo(() => {
    if (tournamentsWeeksData) {
      return Object.values(tournamentsWeeksData).map(
        ({ start_date, end_date, week_number: weekNumber }) => {
          const startDate = new Date(start_date)
          const endDate = new Date(end_date)

          return { startDate, endDate, weekNumber }
        },
      )
    }
    return []
  }, [tournamentsWeeksData])

  const monthsData = months.reduce<WeekItem[]>((acc, month, i) => {
    const filteringWeeks = weeks.filter(
      (week) =>
        week.endDate <= new Date() &&
        (week.startDate.getMonth() === i || week.endDate.getMonth() === i),
    )
    if (!filteringWeeks.length) return acc

    acc.push({
      monthNumber: i + 1,
      year: filteringWeeks[0].endDate.getFullYear(),
      date: `${month} ${filteringWeeks[0].endDate.getFullYear()}`,
      weeks: filteringWeeks.reduce<WeekItem['weeks']>((acc, week) => {
        acc.push({
          title: week.weekNumber,
          date: `${months[week.startDate.getMonth()].slice(
            0,
            3,
          )} ${week.startDate.getDate()} - ${months[
            week.endDate.getMonth()
          ].slice(0, 3)} ${week.endDate.getDate()}`,
        })

        return acc
      }, []),
    })

    return acc.sort((a, b) => {
      if (a.year > b.year) return 1
      if (a.year < b.year) return -1
      if (a.monthNumber > b.monthNumber) return 1
      if (a.monthNumber < b.monthNumber) return -1
      return 0
    })
  }, [])

  const [monthActiveIndex, setMonthActiveIndex] = useState<number>(0)

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)

  function handlingNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  const [weekActiveIndex, setWeekActiveIndex] = useState<number>(0)

  useEffect(() => {
    const week = monthsData[monthActiveIndex]?.weeks?.find(
      (_, i) => i === weekActiveIndex,
    )?.title

    if (week !== undefined && setSelectedWeek) setSelectedWeek(week)
  }, [weekActiveIndex, setSelectedWeek, monthsData, monthActiveIndex])

  const weekNavigationPrevRef = useRef<HTMLDivElement>(null)
  const weekNavigationNextRef = useRef<HTMLDivElement>(null)

  const [isWeekNextDisabled, setIsWeekNextDisabled] = useState<boolean>(false)
  const [isWeekPrevDisabled, setIsWeekPrevDisabled] = useState<boolean>(false)

  function handlingWeekNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsWeekPrevDisabled(isBeginning)
    setIsWeekNextDisabled(isEnd)
  }

  const weekSwiperRef = useRef<{ slideTo: (number: number) => void } | null>(
    null,
  )

  useEffect(() => {
    if (weekSwiperRef.current) {
      weekSwiperRef.current.slideTo(
        monthsData[monthActiveIndex].weeks.length - 1,
      )
    }
  }, [monthActiveIndex])

  if (!monthsData.length) return null

  return (
    <div className={styles.filterWrapper}>
      <div className={styles.monthSelection}>
        <Swiper
          modules={[Navigation, EffectFade]}
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          onBeforeInit={({ params, isEnd, isBeginning, activeIndex }) => {
            if (params.navigation && typeof params.navigation !== 'boolean') {
              params.navigation.prevEl = navigationPrevRef.current
              params.navigation.nextEl = navigationNextRef.current
            }

            handlingNavigation(
              isBeginning,
              isEnd || monthsData.length === activeIndex + 1,
            )
          }}
          allowTouchMove={false}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          onSlideChange={({ activeIndex, isBeginning, isEnd }) => {
            setMonthActiveIndex(activeIndex)
            handlingNavigation(isBeginning, isEnd)
          }}
          initialSlide={monthsData.length - 1}
        >
          {monthsData.map((item, i) => (
            <SwiperSlide key={i}>
              <p>{item.date}</p>
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
      <div className={styles.weekSelection}>
        <Swiper
          onSwiper={(swiper) => {
            weekSwiperRef.current = swiper
          }}
          modules={[Navigation]}
          slidesPerView={7}
          allowTouchMove={false}
          centeredSlides
          slideToClickedSlide
          navigation={{
            prevEl: weekNavigationPrevRef.current,
            nextEl: weekNavigationNextRef.current,
          }}
          onBeforeInit={({ params, isEnd, isBeginning, activeIndex }) => {
            if (params.navigation && typeof params.navigation !== 'boolean') {
              params.navigation.prevEl = weekNavigationPrevRef.current
              params.navigation.nextEl = weekNavigationNextRef.current
            }

            handlingWeekNavigation(
              isBeginning,
              isEnd || monthsData.length === activeIndex + 1,
            )
          }}
          onSlideChange={({ activeIndex, isBeginning, isEnd }) => {
            setWeekActiveIndex(activeIndex)
            handlingWeekNavigation(isBeginning, isEnd)
          }}
        >
          {monthsData[monthActiveIndex].weeks.map((item, i) => (
            <SwiperSlide key={i}>
              <div
                className={classNames(styles.slide, {
                  [styles.active]: weekActiveIndex === i,
                })}
              >
                <p className={styles.week}>Week</p>
                <p className={styles.title}>{item.title}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div
          ref={weekNavigationPrevRef}
          className={classNames(styles.previous, {
            [styles.disabled]: isWeekPrevDisabled,
          })}
        >
          <MonthLeftArrow />
        </div>

        <div
          ref={weekNavigationNextRef}
          className={classNames(styles.next, {
            [styles.disabled]: isWeekNextDisabled,
          })}
        >
          <MonthRightArrow />
        </div>
      </div>
    </div>
  )
}
