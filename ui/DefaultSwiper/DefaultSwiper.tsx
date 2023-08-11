import classNames from 'classnames'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { Navigation, EffectFade } from 'swiper'
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './DefaultSwiper.module.scss'

type DefaultSwiperProps = {
  setActiveIndex: Dispatch<SetStateAction<number>>
  activeIndex: number
  sx?: SwiperProps
}

type SwiperDataType = {
  top: string
  bottom: string
}
type DefaultSwiperDefaultProps = {
  swiperStyle: 'default'
  data: string[]
}

type DefaultSwiperAltProps = {
  swiperStyle: 'alt'
  data: SwiperDataType[]
}

/**
 *
 * @param data В зависимости от swiperStyle нужно передавать строки или {top: string; bottom:string}
 */

export function DefaultSwiper({
  data,
  setActiveIndex,
  activeIndex,
  swiperStyle,
  sx,
}: (DefaultSwiperDefaultProps | DefaultSwiperAltProps) & DefaultSwiperProps) {
  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)

  const swiperRef = useRef<{ slideTo: (number: number) => void } | null>(null)

  function handlingNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  let swiperProps: SwiperProps = {
    onSwiper: (swiper) => {
      swiperRef.current = swiper
    },
    modules: [Navigation, EffectFade],
    navigation: {
      prevEl: navigationPrevRef.current,
      nextEl: navigationNextRef.current,
    },
    onBeforeInit: ({ params, isEnd, isBeginning, activeIndex }) => {
      if (params.navigation && typeof params.navigation !== 'boolean') {
        params.navigation.prevEl = navigationPrevRef.current
        params.navigation.nextEl = navigationNextRef.current
      }

      handlingNavigation(isBeginning, isEnd || data.length === activeIndex + 1)
    },
    allowTouchMove: false,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    onSlideChange: ({ activeIndex, isBeginning, isEnd }) => {
      setActiveIndex(activeIndex)
      handlingNavigation(isBeginning, isEnd)
    },
  }

  if (swiperStyle === 'alt') {
    swiperProps = {
      onSwiper: (swiper) => {
        swiperRef.current = swiper
      },
      modules: [Navigation],
      slidesPerView: 7,
      allowTouchMove: false,
      centeredSlides: true,
      slideToClickedSlide: true,
      navigation: {
        prevEl: navigationPrevRef.current,
        nextEl: navigationNextRef.current,
      },
      onBeforeInit: ({ params, isEnd, isBeginning, activeIndex }) => {
        if (params.navigation && typeof params.navigation !== 'boolean') {
          params.navigation.prevEl = navigationPrevRef.current
          params.navigation.nextEl = navigationNextRef.current
        }

        handlingNavigation(
          isBeginning,
          isEnd || data.length === activeIndex + 1,
        )
      },
      onSlideChange: ({ activeIndex, isBeginning, isEnd }) => {
        setActiveIndex(activeIndex)
        handlingNavigation(isBeginning, isEnd)
      },
    }
  }

  const endSwiperProps = Object.assign(swiperProps, sx)

  useEffect(() => {
    swiperRef.current?.slideTo(activeIndex)
  }, [activeIndex, swiperStyle])

  if (!data.length) return null

  return (
    <div
      className={classNames({
        [styles.defaultSwiper]: swiperStyle === 'default',
        [styles.altSwiper]: swiperStyle === 'alt',
      })}
    >
      <Swiper {...endSwiperProps}>
        {(() => {
          switch (swiperStyle) {
            case 'default':
              return data.map((item, i) => (
                <SwiperSlide key={i}>
                  <p>{item}</p>
                </SwiperSlide>
              ))
            case 'alt':
              return data.map((item, i) => (
                <SwiperSlide key={i}>
                  <div
                    className={classNames(styles.slide, {
                      [styles.active]: activeIndex === i,
                    })}
                  >
                    <p className={styles.week}>{item.top}</p>
                    <p className={styles.title}>{item.bottom}</p>
                  </div>
                </SwiperSlide>
              ))
          }
        })()}
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
  )
}
