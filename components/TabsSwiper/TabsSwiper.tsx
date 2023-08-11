import classNames from 'classnames'
import React, { Dispatch, SetStateAction, useRef } from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { MonthLeftArrow, MonthRightArrow } from '@/assets/icons'

import styles from './TabsSwiper.module.scss'

type TabsData = { title: string; value: number | string }[]

export function TabsSwiper({
  tabsData,
  activeTab,
  setActiveTab,
  slidesPerView = 3,
}: {
  tabsData: TabsData
  activeTab: { value: number | string; index: number }
  setActiveTab: Dispatch<
    SetStateAction<{ value: number | string; index: number }>
  >
  slidesPerView?: number
}) {
  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  return (
    <div className={styles.tabsWrapper}>
      <div
        ref={navigationPrevRef}
        className={classNames(styles.previous, {
          [styles.disabled]: activeTab.index === 0,
        })}
      >
        <MonthLeftArrow />
      </div>

      <Swiper
        slidesPerView={slidesPerView}
        modules={[Navigation]}
        allowTouchMove={false}
        centeredSlides
        onSlideChange={({ activeIndex }) => {
          setActiveTab({
            value: tabsData[activeIndex].value,
            index: activeIndex,
          })
        }}
        slideToClickedSlide
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        onBeforeInit={({ params }) => {
          if (params.navigation && typeof params.navigation !== 'boolean') {
            params.navigation.prevEl = navigationPrevRef.current
            params.navigation.nextEl = navigationNextRef.current
          }
        }}
      >
        {tabsData.map((tab) => (
          <SwiperSlide
            key={tab.value}
            className={classNames(styles.tab, {
              [styles.active]: activeTab.value === tab.value,
            })}
          >
            <div>{tab.title}</div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        ref={navigationNextRef}
        className={classNames(styles.next, {
          [styles.disabled]: activeTab.index === tabsData.length - 1,
        })}
      >
        <MonthRightArrow />
      </div>
    </div>
  )
}
