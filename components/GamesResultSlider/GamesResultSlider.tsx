import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useMemo, useRef, useState } from 'react'
import { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { NearEvent } from '@/api'
import { SliderNextArrow, SliderPrevArrow } from '@/assets/icons'
import { generateParticipantImagePath } from '@/config/constants'
import { usePool } from '@/helpers'
import { useGetTournamentNearEvents } from '@/helpers/hooks/useGetTournamentNearEvents'

import styles from './GamesResultSlider.module.scss'

type DataItem = {
  date: string
  stage: string
  winner: number | null
  teams: Team[]
}

type Team = {
  id: number
  image_src: string
  name: string
  result: string
  short_name: string | null
}

export default function GamesResultSlider() {
  const { query } = useRouter()
  const { poolData } = usePool(Number(query.poolId))

  const { tournamentNearEventsData, participantsStatistic } =
    useGetTournamentNearEvents(poolData?.tournament_id)
  const navigationPrevRef = useRef<HTMLDivElement>(null)
  const navigationNextRef = useRef<HTMLDivElement>(null)

  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false)
  const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(false)

  function handlingNavigation(isBeginning: boolean, isEnd: boolean) {
    setIsPrevDisabled(isBeginning)
    setIsNextDisabled(isEnd)
  }

  function getStage(event: NearEvent) {
    return event.is_overtime ? 'OT' : 'Final'
  }

  const data: DataItem[] = useMemo(() => {
    return tournamentNearEventsData.map((event) => {
      const startDate = new Date(event.start_date)
      const eventPassed = event.status == 'finished'

      return {
        date: startDate
          .toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })
          .replace(',', ''),
        stage: eventPassed
          ? getStage(event)
          : startDate.toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }),
        winner: event?.winner_id || null,
        teams: event.participants.map((participant) => {
          const imageSrc = generateParticipantImagePath(participant.external_id)
          let participantStatistic = null
          if (!event?.result_scope) {
            participantStatistic = participantsStatistic[participant.id] || null
          }
          return {
            id: participant.id,
            image_src: imageSrc,
            name: [participant?.city, participant.name].join(' ').trim(),
            short_name: participant.short_name,
            result: String(
              event?.result_scope && participant?.pivot?.type
                ? event?.result_scope[`score_${participant.pivot.type}`]
                : `${participantStatistic?.wins}-${participantStatistic?.losses}-${participantStatistic?.ties}`,
            ),
          }
        }),
      }
    })
  }, [tournamentNearEventsData, participantsStatistic])

  if (!query.poolId || data.length == 0) return null

  return (
    <div className={styles.swiperWrapper}>
      <div
        ref={navigationPrevRef}
        className={classNames(styles.previous, {
          [styles.disabled]: isPrevDisabled,
        })}
      >
        <SliderPrevArrow />
        <div className={styles.previousShadowAfter} />
      </div>

      <div
        ref={navigationNextRef}
        className={classNames(styles.next, {
          [styles.disabled]: isNextDisabled,
        })}
      >
        <div className={styles.nextShadowBefore} />
        <SliderNextArrow />
      </div>

      <Swiper
        modules={[Navigation]}
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
        slidesPerView={5}
        allowTouchMove={false}
        className={styles.swiper}
        onNavigationNext={({ isBeginning, isEnd }) =>
          handlingNavigation(isBeginning, isEnd)
        }
        onNavigationPrev={({ isBeginning, isEnd }) =>
          handlingNavigation(isBeginning, isEnd)
        }
      >
        {data.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className={styles.slideSlideWrapper}>
              <div className={styles.teams}>
                {slide.teams.map(
                  ({ id, image_src, name, short_name, result }) => {
                    const nameText =
                      short_name ??
                      name
                        .split(' ')
                        .reduce((acc, text) => acc + text[0]?.toUpperCase(), '')

                    return (
                      <div
                        className={classNames(styles.team, {
                          [styles.winner]: slide.winner && slide.winner !== id,
                        })}
                        key={id}
                      >
                        <Image
                          src={image_src}
                          width={30}
                          height={30}
                          alt={name}
                        />
                        <p>{nameText}</p>
                        <p
                          className={
                            slide.winner ? styles.result : styles.statistic
                          }
                        >
                          {result}
                        </p>
                      </div>
                    )
                  },
                )}
              </div>

              <div className={styles.dateAndStageWrapper}>
                <p>{slide.date}</p>
                <p>{slide.stage}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
