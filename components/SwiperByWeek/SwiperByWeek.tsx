import classNames from 'classnames'
import { useState, useRef, Dispatch, SetStateAction } from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './SwiperByWeek.module.scss'

type FilterByWeekNumberProps = {
  availableWeeks: number[]
  setActiveIndex: Dispatch<SetStateAction<number>>
  slidesPerView?: number
}

export function SwiperByWeek({
  availableWeeks = [],
  setActiveIndex,
  slidesPerView = 7,
}: FilterByWeekNumberProps) {
  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  function handlingWeekNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  if (!availableWeeks.length) return null

  return (
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
          if (params.navigation && typeof params.navigation !== 'boolean') {
            params.navigation.prevEl = navigationPrevRef.current
            params.navigation.nextEl = navigationNextRef.current
          }

          handlingWeekNavigation(isBeginning, isEnd)
        }}
      >
        {availableWeeks.map((week: number, i: number) => {
          return (
            <SwiperSlide key={i} className={styles.slide}>
              <p>{week}</p>
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
            isNextDisabled || availableWeeks.length <= slidesPerView,
        })}
      >
        <MonthRightArrow />
      </div>
    </div>
  )
}
