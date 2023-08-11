import classNames from 'classnames'
import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Navigation, EffectFade } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import { handlingDeadline, months } from '@/config/constants'
import { useGetPoolEvents, useGetTournamentsWeeks, usePool } from '@/helpers'

import styles from './FilterByWeek.module.scss'

type WeekItem = {
  date: string
  year: number
  monthNumber: number
  weeks: { title: string; week: number; completed: boolean; date: string }[]
}

export function FilterByWeek({
  tournamentId,
  selectedWeek,
  setSelectedWeek,
  currentWeek,
  getDate,
}: {
  tournamentId: number
  selectedWeek: number
  setSelectedWeek: Dispatch<SetStateAction<number | null>>
  currentWeek: number
  getDate?: (text: string) => void
}) {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))
  const { tournamentsWeeksData } = useGetTournamentsWeeks(tournamentId)

  // выбирает стартовую неделю, в том случае, если выбранная неделя
  // меньше, чем стартовая
  useEffect(() => {
    if (currentWeek && poolData) {
      const startWeek = Number(poolData.pick_pool.start_week)
      if (startWeek > selectedWeek) setSelectedWeek(startWeek)
    }
  }, [currentWeek, poolData, setSelectedWeek, selectedWeek])

  const weeks = useMemo(() => {
    if (tournamentsWeeksData && poolData) {
      return Object.values(tournamentsWeeksData)
        .map(({ start_date, end_date, week_number: weekNumber }) => {
          const startDate = new Date(start_date)
          const endDate = new Date(end_date)

          return { startDate, endDate, weekNumber }
        })
        .filter(
          (item) => item.weekNumber >= Number(poolData.pick_pool.start_week),
        )
    }
    return []
  }, [poolData, tournamentsWeeksData])

  const monthsData = months.reduce<WeekItem[]>((acc, month, i) => {
    const filteringWeeks = weeks.filter(
      (week) =>
        week.startDate.getMonth() === i || week.endDate.getMonth() === i,
    )
    if (!filteringWeeks.length) return acc

    acc.push({
      date: `${month} ${filteringWeeks[0].endDate.getFullYear()}`,
      year: filteringWeeks[0].endDate.getFullYear(),
      monthNumber: i + 1,
      weeks: filteringWeeks.map((week) => ({
        title: `Week ${week.weekNumber}`,
        week: week.weekNumber,
        completed: week.weekNumber < currentWeek,
        date: `${months[week.startDate.getMonth()].slice(
          0,
          3,
        )} ${week.startDate.getDate()} - ${months[
          week.endDate.getMonth()
        ].slice(0, 3)} ${week.endDate.getDate()}`,
      })),
    })

    return acc.sort((a, b) => {
      if (a.year > b.year) return 1
      if (a.year < b.year) return -1
      if (a.monthNumber > b.monthNumber) return 1
      if (a.monthNumber < b.monthNumber) return -1
      return 0
    })
  }, [])

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    if (activeIndex === null && monthsData.length && selectedWeek) {
      const findItem = monthsData.find((monthItem) =>
        monthItem.weeks.find((week) => week.week === selectedWeek),
      )

      if (findItem) {
        const index = monthsData.indexOf(findItem)
        setActiveIndex(index)
      }
    }
  }, [activeIndex, monthsData, selectedWeek])

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)

  useEffect(() => {
    if (getDate && activeIndex !== null) {
      const date = monthsData[activeIndex].weeks.find(
        (item) => item.week === selectedWeek,
      )?.date
      if (date) getDate(date)
    }
  }, [getDate, activeIndex, monthsData, selectedWeek])

  function handlingNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  if (activeIndex === null || !monthsData[activeIndex]) return null

  return (
    <div className={styles.filterAndTimerWrapper}>
      <div className={styles.filterWrapper}>
        <div className={styles.monthSelection}>
          <Swiper
            modules={[Navigation, EffectFade]}
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current,
            }}
            onBeforeInit={({ params, isEnd, isBeginning }) => {
              if (params.navigation && typeof params.navigation !== 'boolean') {
                params.navigation.prevEl = navigationPrevRef.current
                params.navigation.nextEl = navigationNextRef.current
              }

              handlingNavigation(isBeginning, isEnd)
            }}
            initialSlide={activeIndex}
            slidesPerView={1}
            allowTouchMove={false}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            onSlideChange={({ activeIndex, isBeginning, isEnd }) => {
              setActiveIndex(activeIndex)
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

        <p className={styles.wholeMonth}>
          Whole Month <span />
        </p>

        <ul className={styles.listWeeks}>
          {monthsData[activeIndex].weeks.map((item, i) => (
            <li
              key={i}
              className={classNames(
                {
                  [styles.selectedWeek]: item.week === selectedWeek,
                },
                { [styles.expired]: item.completed },
              )}
              onClick={() => {
                setSelectedWeek(item.week)

                if (getDate) getDate(item.date)
              }}
            >
              <p className={styles.weekTitle}>{item.title}</p>
              <p className={styles.weekDate}>
                {item.completed ? 'Completed' : item.date}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {!!currentWeek && <WeekDeadlineTimer currentWeek={currentWeek} />}
    </div>
  )
}

type WeekDeadlineTimerProps = { currentWeek: number }

export function WeekDeadlineTimer({ currentWeek }: WeekDeadlineTimerProps) {
  const {
    query: { poolId },
  } = useRouter()

  const { poolEventsDeadline } = useGetPoolEvents({
    poolId: Number(poolId),
    weekNumber: currentWeek,
  })

  const [deadlineTime, setDeadlineTime] = useState<string | null>(null)

  useEffect(() => {
    setDeadlineTime(handlingDeadline(poolEventsDeadline))

    const timer = setInterval(
      () => setDeadlineTime(handlingDeadline(poolEventsDeadline)),
      60000, // 1 minute
    )

    return () => clearInterval(timer)
  }, [poolEventsDeadline])

  return (
    <div className={styles.weekDeadlineTimerWrapper}>
      <p className={styles.title}>Week {currentWeek} deadline</p>
      <p className={styles.timer}>{deadlineTime}</p>
    </div>
  )
}
