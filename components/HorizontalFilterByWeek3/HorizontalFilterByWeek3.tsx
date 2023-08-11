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

import styles from './HorizontalFilterByWeek3.module.scss'

type WeekItem = {
  monthNumber: number
  year: number
  date: string
  weeks: { title: number; date: string }[]
}

type HorizontalFilterByWeek3Props = {
  setSelectedWeek: Dispatch<SetStateAction<number | undefined>>
}

export function HorizontalFilterByWeek3({
  setSelectedWeek,
}: HorizontalFilterByWeek3Props) {
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
        week.endDate >= new Date() &&
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

  useEffect(() => {
    setWeekActiveIndex(monthsData[monthActiveIndex].weeks.length - 1)
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
        {monthsData[monthActiveIndex].weeks.map((item, i) => (
          <div
            key={i}
            className={classNames(styles.slide, {
              [styles.active]: weekActiveIndex === i,
            })}
            onClick={() => setWeekActiveIndex(i)}
          >
            <p className={styles.week}>Week {item.title}</p>

            <div className={styles.current}>
              <MonthLeftArrow />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
