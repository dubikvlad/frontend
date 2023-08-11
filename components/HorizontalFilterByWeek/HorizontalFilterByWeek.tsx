import classNames from 'classnames'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './HorizontalFilterByWeek.module.scss'

type HorizontalFilterByWeek = {
  allWeeks?: number[]
  availableWeeks: number[]
  currentWeek: number
  startWeek?: number
  setSelectedWeek: Dispatch<SetStateAction<number | null>>
  slidesPerView?: number
  isLoading?: boolean
  isDisableSelectionComingWeeks?: boolean
}

export function HorizontalFilterByWeek({
  allWeeks = [],
  availableWeeks = [],
  currentWeek,
  startWeek,
  setSelectedWeek,
  slidesPerView = 7,
  isLoading = false,
  // запретить выбор недель, следующих за текущей неделей
  isDisableSelectionComingWeeks = false,
}: HorizontalFilterByWeek) {
  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)

  function handlingWeekNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  const weeks = allWeeks?.length ? allWeeks : availableWeeks

  const currentWeekIndex = weeks.indexOf(currentWeek)

  const [activeIndex, setActiveIndex] = useState<number>(
    startWeek && ~weeks.indexOf(startWeek)
      ? weeks.indexOf(startWeek)
      : ~weeks.indexOf(currentWeek)
      ? weeks.indexOf(currentWeek)
      : 0,
  )

  useEffect(() => {
    if (setSelectedWeek) setSelectedWeek(weeks[activeIndex])

    if (startWeek && activeIndex === weeks.indexOf(startWeek))
      setIsPrevDisabled(true)
    if (activeIndex === weeks.indexOf(Math.max(...availableWeeks)))
      setIsNextDisabled(true)
  }, [
    weeks,
    availableWeeks,
    activeIndex,
    setSelectedWeek,
    currentWeek,
    startWeek,
  ])

  return (
    <div
      className={classNames(styles.wrapper, { [styles.loading]: isLoading })}
    >
      <Swiper
        slideToClickedSlide
        allowTouchMove={false}
        centeredSlides
        slidesPerView={slidesPerView}
        modules={[Navigation]}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        initialSlide={activeIndex}
        onBeforeInit={({ params, isEnd, isBeginning }) => {
          if (params.navigation && typeof params.navigation !== 'boolean') {
            params.navigation.prevEl = navigationPrevRef.current
            params.navigation.nextEl = navigationNextRef.current
          }

          handlingWeekNavigation(isBeginning, isEnd)
        }}
        onSlideChange={({ activeIndex, isBeginning, isEnd }) => {
          setActiveIndex(activeIndex)
          handlingWeekNavigation(isBeginning, isEnd)
        }}
        className={styles.swiper}
      >
        {weeks.map((week, i) => {
          return (
            <SwiperSlide
              key={i}
              className={classNames(styles.slide, {
                [styles.slideDisabled]:
                  (isDisableSelectionComingWeeks && i > currentWeekIndex) ||
                  !availableWeeks.find((w) => w === week),
              })}
            >
              <div
                className={classNames(styles.slideWrapper, {
                  [styles.active]: activeIndex === i,
                  [styles.cloudy]:
                    i <= activeIndex - Math.trunc(slidesPerView / 2) ||
                    i >= activeIndex + Math.trunc(slidesPerView / 2),
                })}
              >
                <span className={styles.slideTitle}>WEEK {week}</span>
                <span
                  className={classNames(styles.slideInfo, {
                    [styles.current]: i === currentWeekIndex,
                    [styles.coming]:
                      i === currentWeekIndex + 1 &&
                      !isDisableSelectionComingWeeks,
                  })}
                >
                  {i === currentWeekIndex
                    ? 'Current'
                    : i > currentWeekIndex
                    ? 'Coming'
                    : 'Completed'}
                </span>
              </div>
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
            (isDisableSelectionComingWeeks && currentWeekIndex === activeIndex),
        })}
      >
        <MonthRightArrow />
      </div>
    </div>
  )
}
