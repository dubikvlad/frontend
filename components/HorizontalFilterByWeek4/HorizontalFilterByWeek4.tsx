import classNames from 'classnames'
import { useRef, useState } from 'react'
import { UseFormSetValue, FieldValues } from 'react-hook-form'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import type { SettingsFieldOption } from '@/api'
import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './HorizontalFilterByWeek4.module.scss'

export function HorizontalFilterByWeek4({
  weeks,
  isDisabledSlider,
  setValue,
  name,
  startIndex,
  slidesInSlider,
}: {
  weeks: SettingsFieldOption[]
  isDisabledSlider?: boolean
  setValue: UseFormSetValue<FieldValues>
  name?: string
  startIndex?: number
  slidesInSlider?: number
}) {
  const weekSwiperRef = useRef<{ slideTo: (number: number) => void } | null>(
    null,
  )

  const weekNavigationPrevRef = useRef<HTMLDivElement>(null)
  const weekNavigationNextRef = useRef<HTMLDivElement>(null)

  const [weekActiveIndex, setWeekActiveIndex] = useState<number>(0)
  const [isWeekNextDisabled, setIsWeekNextDisabled] = useState<boolean>(false)
  const [isWeekPrevDisabled, setIsWeekPrevDisabled] = useState<boolean>(false)

  function handlingWeekNavigation(isBeginning: boolean, isEnd: boolean) {
    if (isDisabledSlider) {
      setIsWeekPrevDisabled(true)
      setIsWeekNextDisabled(true)
    } else {
      setIsWeekPrevDisabled(isBeginning)
      setIsWeekNextDisabled(isEnd)
    }
  }

  return (
    <div className={styles.weekSelection}>
      <Swiper
        onSwiper={(swiper) => {
          weekSwiperRef.current = swiper
        }}
        modules={[Navigation]}
        slidesPerView={!!slidesInSlider ? slidesInSlider : 7}
        allowTouchMove={false}
        centeredSlides
        slideToClickedSlide
        allowSlideNext={!isDisabledSlider}
        allowSlidePrev={!isDisabledSlider}
        initialSlide={startIndex ? startIndex : 0}
        navigation={{
          prevEl: weekNavigationPrevRef.current,
          nextEl: weekNavigationNextRef.current,
        }}
        onBeforeInit={({ params, isEnd, isBeginning }) => {
          if (
            params.navigation &&
            typeof params.navigation !== 'boolean' &&
            isDisabledSlider
          ) {
            params.navigation.prevEl = weekNavigationPrevRef.current
            params.navigation.nextEl = weekNavigationNextRef.current
          }
          handlingWeekNavigation(isBeginning, isEnd)
        }}
        onSlideChange={({ activeIndex, isBeginning, isEnd }) => {
          setWeekActiveIndex(activeIndex)
          handlingWeekNavigation(isBeginning, isEnd)
          name && setValue(name, weeks[activeIndex].name)
        }}
      >
        {weeks.map((item, i) => (
          <SwiperSlide key={i}>
            <div
              className={classNames(styles.slide, {
                [styles.active]: weekActiveIndex === i,
                [styles.disabled]: isDisabledSlider,
              })}
            >
              <p className={styles.week}>Week</p>
              <p className={styles.title}>{item.name}</p>
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
  )
}
