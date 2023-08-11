import classNames from 'classnames'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Control, useController, UseControllerProps } from 'react-hook-form'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './FilterByWeekNumber.module.scss'

type FilterByWeekNumberProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  name: UseControllerProps['name']
  availableWeeks: number[]
  slidesInSlider?: number
}

export function FilterByWeekNumber({
  control,
  name,
  availableWeeks = [],
  slidesInSlider,
}: FilterByWeekNumberProps) {
  const {
    field: { onChange, value },
  } = useController({
    control,
    name,
    defaultValue: String(availableWeeks?.[0]),
  })

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const allWeeks = useMemo(
    () =>
      !!availableWeeks?.length && availableWeeks[0] > 1
        ? [...Array(availableWeeks[0] - 1)]
            .map((_, i) => i + 1)
            .concat(availableWeeks)
        : availableWeeks,
    [availableWeeks],
  )

  const [activeIndex, setActiveIndex] = useState<number>(
    allWeeks.indexOf(availableWeeks?.[0]),
  )

  useEffect(() => {
    if (
      activeIndex &&
      allWeeks.length &&
      allWeeks[activeIndex] &&
      value !== allWeeks[activeIndex]
    ) {
      onChange(allWeeks[activeIndex])
    }
  }, [activeIndex, onChange, allWeeks, value])

  const [isBeginning, setIsBeginning] = useState(false)
  const [isEnd, setIsEnd] = useState(false)

  if (!availableWeeks?.length) return null

  return (
    <div className={styles.wrapper}>
      <Swiper
        className={styles.swiperWrapper}
        modules={[Navigation]}
        slidesPerView={!!slidesInSlider ? slidesInSlider : 7}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        onBeforeInit={({ params, isBeginning, isEnd }) => {
          const initialSlideIndex = allWeeks.indexOf(availableWeeks[0])
          if (~initialSlideIndex) params.initialSlide = initialSlideIndex

          if (params.navigation && typeof params.navigation !== 'boolean') {
            params.navigation.prevEl = navigationPrevRef.current
            params.navigation.nextEl = navigationNextRef.current
          }

          setIsBeginning(isBeginning)
          setIsEnd(isEnd)
        }}
        onSlideChange={({ isBeginning, isEnd }) => {
          setIsBeginning(isBeginning)
          setIsEnd(isEnd)
        }}
      >
        {allWeeks.map((weekNumber, i) => (
          <SwiperSlide key={i}>
            <div
              className={classNames(
                styles.slide,
                { [styles.disabled]: !availableWeeks.includes(weekNumber) },
                { [styles.active]: activeIndex === i },
              )}
              onClick={() => {
                const isDisabled = !availableWeeks.includes(allWeeks[i])
                if (!isDisabled) setActiveIndex(i)
              }}
            >
              <p className={styles.weekText}>Week</p>
              <p className={styles.weekNumber}>{weekNumber}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        ref={navigationPrevRef}
        className={classNames(styles.navigation, styles.prev, {
          [styles.disabled]: isBeginning,
        })}
      >
        <MonthLeftArrow />
      </div>

      <div
        ref={navigationNextRef}
        className={classNames(styles.navigation, styles.next, {
          [styles.disabled]: isEnd,
        })}
      >
        <MonthRightArrow />
      </div>
    </div>
  )
}
