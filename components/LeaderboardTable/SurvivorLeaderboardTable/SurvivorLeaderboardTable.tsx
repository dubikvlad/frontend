import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import {
  MonthLeftArrow,
  MonthRightArrow,
  Star,
  SmallRightArrow,
  SmallRound,
} from '@/assets/icons'
import { getShortName, routes } from '@/config/constants'
import {
  SurvivorLeaderboardTableCell,
  SurvivorLeaderboardTableCellEmpty,
} from '@/features/components/SurvivorLeaderboardTableCell'
import { useLeaderboard, usePool, useGetUser } from '@/helpers'

import styles from './SurvivorLeaderboardTable.module.scss'

export function SurvivorLeaderboardTable() {
  const [weekArray, setWeekArray] = useState<number[]>([])
  const [isNextDisabled, setIsNextDisabled] = useState(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState(false)

  const [weekActiveIndex, setWeekActiveIndex] = useState<number>(0)

  const {
    query: { poolId },
  } = useRouter()

  const { userData } = useGetUser()

  const { poolData } = usePool<'survivor'>(Number(poolId))

  useEffect(
    () => poolData?.available_week && setWeekArray(poolData.available_week),
    [poolData],
  )

  const { leaderboardData } = useLeaderboard<'survivor'>({
    poolId: Number(poolId),
    weekNumber: undefined,
  })

  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const noData =
    !!leaderboardData &&
    !!leaderboardData.length &&
    (leaderboardData[0].forecasts == null ? true : false)

  function handlingNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div
          className={classNames(styles.row, styles.headRow, {
            [styles.disabled]: noData,
          })}
        >
          <div className={classNames(styles.rowTitle)}>
            <div className={styles.number}></div>
            <div className={styles.iconWrapper}>
              {!noData && <Star className={styles.iconFavorite} />}
            </div>
            <div className={styles.name}>Entry Name</div>
          </div>
          <div className={styles.rowData}>
            <div className={styles.sliderWrapper}>
              <div
                ref={navigationPrevRef}
                className={classNames(styles.navigation, styles.prev, {
                  [styles.disabled]: isPrevDisabled || noData,
                })}
              >
                <MonthLeftArrow />
              </div>
              <div
                ref={navigationNextRef}
                className={classNames(styles.navigation, styles.next, {
                  [styles.disabled]: isNextDisabled || noData,
                })}
              >
                <MonthRightArrow />
              </div>
              <Swiper
                modules={[Navigation]}
                navigation={{
                  prevEl: navigationPrevRef.current,
                  nextEl: navigationNextRef.current,
                }}
                allowSlideNext={!noData}
                allowTouchMove={false}
                onBeforeInit={({ params, isEnd, isBeginning }) => {
                  if (
                    params.navigation &&
                    typeof params.navigation !== 'boolean'
                  ) {
                    params.navigation.prevEl = navigationPrevRef.current
                    params.navigation.nextEl = navigationNextRef.current
                  }

                  handlingNavigation(isBeginning, isEnd)
                }}
                slidesPerView={14}
                onSlideChange={({ isBeginning, isEnd, activeIndex }) => {
                  handlingNavigation(isBeginning, isEnd)
                  setWeekActiveIndex(activeIndex)
                }}
                spaceBetween={5}
                className={styles.slides}
              >
                {weekArray.map(
                  (item, i) =>
                    item >= Number(poolData?.pick_pool?.start_week) && (
                      <SwiperSlide key={i} className={styles.slide}>
                        {item}
                      </SwiperSlide>
                    ),
                )}
              </Swiper>
            </div>
          </div>
        </div>

        {!noData ? (
          leaderboardData?.map(({ name, forecasts, user_id }, i) => {
            const weekResultsArr =
              !!forecasts &&
              Object.values(forecasts).slice(
                weekActiveIndex,
                weekActiveIndex + 14,
              )

            const isMulligan =
              weekResultsArr &&
              weekResultsArr?.length &&
              weekResultsArr?.some((item) =>
                item?.some((innerItem) => innerItem?.is_mulligan),
              )

            const entryIsFinished =
              !!forecasts &&
              Object.values(forecasts)
                .at(-1)
                ?.some((item) => {
                  return item.status !== 'win'
                })

            const emptyArr = !entryIsFinished &&
              weekResultsArr && [...Array(14 - weekResultsArr.length).keys()]

            return (
              <div key={i} className={classNames(styles.row, styles.data)}>
                <div className={classNames(styles.rowTitle)}>
                  <div className={styles.number}>{i + 1}</div>
                  <div className={styles.iconWrapper}>
                    {userData?.id === user_id ? (
                      <Star
                        className={classNames(styles.iconFavorite, styles.fill)}
                      />
                    ) : (
                      <div className={styles.shortNameBlock}>
                        <p>{getShortName(name).toUpperCase()}</p>
                      </div>
                    )}
                  </div>
                  <div className={styles.name}>{name}</div>
                  {!!isMulligan && (
                    <SmallRound
                      className={classNames(
                        styles.smallIcon,
                        styles.isMulligan,
                      )}
                    />
                  )}
                </div>
                <div className={styles.rowData}>
                  <div className={styles.rowCells}>
                    {!!weekResultsArr &&
                      weekResultsArr.map((week, i) => (
                        <SurvivorLeaderboardTableCell
                          forecasts={week}
                          key={i}
                        />
                      ))}
                    {emptyArr &&
                      emptyArr.map((item) => (
                        <SurvivorLeaderboardTableCellEmpty key={item} />
                      ))}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className={styles.noData}>
            Unfortunately, no picks have been made yet. Try to{' '}
            <Link
              href={routes.account.makePick.index(Number(poolId))}
              className={styles.link}
            >
              Make a new pick
            </Link>
          </div>
        )}
      </div>
      {!noData && (
        <div className={styles.info}>
          <div className={styles.infoContainer}>
            <SmallRound className={styles.smallIcon} />
            <p>
              Picks with a black dot were issued a mulligan to revive them after
              a loss.
            </p>
          </div>
          <div className={styles.infoContainer}>
            <SmallRightArrow className={styles.smallIcon} />
            <p>
              This pick was automatically generated by the system according to
              your pool settings.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
