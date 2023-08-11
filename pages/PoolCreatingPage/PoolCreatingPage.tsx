import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import { PoolTypesResponseData } from '@/api'
import { PickemIcon } from '@/assets/icons'
import {
  poolTypesCreatingIcons,
  routes,
  sportsIconsByCode,
} from '@/config/constants'
import { StartNewPoolDescription } from '@/features/components'
import {
  useAdaptiveBreakpoints,
  useGetPoolTypes,
  useGetSports,
} from '@/helpers'

import styles from './PoolCreatingPage.module.scss'

type Tournaments = { [key: string]: string[] }

export function PoolCreatingPage() {
  const { breakpoint, isBreakpointPassed } = useAdaptiveBreakpoints([
    'md',
    'sm',
  ])

  const isTabletAndBelow = isBreakpointPassed('md')
  const isMobileAndBelow = isBreakpointPassed('sm')

  const { query } = useRouter()

  const { sportsData } = useGetSports()
  const { poolTypesData } = useGetPoolTypes()

  const tournamentsObj: Tournaments | null = useMemo(() => {
    if (!sportsData.length || !poolTypesData.length) return null

    return poolTypesData.reduce<Tournaments>((acc, poolTypes) => {
      const externalId = poolTypes.sport.external_id

      if (acc[externalId]) {
        if (acc[externalId].includes(poolTypes.tournament.name)) {
          return acc
        } else {
          acc[externalId].push(poolTypes.tournament.name)
          return acc
        }
      }

      acc[externalId] = []
      acc[externalId].push(poolTypes.tournament.name)

      return acc
    }, {})
  }, [sportsData, poolTypesData])

  const [poolTypeActive, setPoolTypeActive] = useState<number | null>(null)

  const [activeSport, setActiveSport] = useState<null | number>(null)

  useEffect(() => {
    if (activeSport === null && sportsData.length) {
      const currentSport = query?.sport ? +query.sport : undefined

      const findedSport = currentSport
        ? sportsData.find((sport) => sport.id === currentSport)
        : undefined

      setActiveSport(findedSport ? findedSport.id : sportsData[0].id)
    }
  }, [activeSport, query, sportsData])

  const activePoolTypesList = poolTypesData.filter(
    (poolTypes) => poolTypes.sport.id === activeSport,
  )

  return (
    <div className={styles.wrapper}>
      <StartNewPoolDescription activeStep={1} />

      <div className={styles.poolCreationWrapper}>
        <div className={styles.poolCreationSportsWrapper}>
          <div className={styles.sportsWrapper}>
            {breakpoint === 'sm' ? (
              <Swiper slidesPerView="auto" spaceBetween={10}>
                {sportsData.map((sport) => (
                  <SwiperSlide
                    className={classNames(styles.mobileSportItem, {
                      [styles.mobileSportItemActive]: sport.id === activeSport,
                    })}
                    key={sport.id}
                    onClick={() => setActiveSport(sport.id)}
                  >
                    {sport.name}
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              sportsData.map((sport) => {
                const Icon = sportsIconsByCode[sport.sport_code]

                if (!tournamentsObj?.[sport.external_id]) return null

                return (
                  <div
                    key={sport.id}
                    className={classNames(styles.sportItem, {
                      [styles.sportActive]: sport.id === activeSport,
                    })}
                    onClick={() => setActiveSport(sport.id)}
                  >
                    <Icon className={styles.sportIcon} />
                    <div className={styles.sportItemInfo}>
                      <p className={styles.title}>{sport.name}</p>
                      {tournamentsObj !== null &&
                        tournamentsObj[sport.external_id] && (
                          <p>{tournamentsObj[sport.external_id].join(', ')}</p>
                        )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className={styles.poolTypesWrapper}>
          {activePoolTypesList.map((poolType) => (
            <PoolTypeItem
              key={poolType.id}
              poolType={poolType}
              poolTypeActive={poolTypeActive}
              setPoolTypeActive={setPoolTypeActive}
              isTabletAndBelow={isTabletAndBelow}
              isMobileAndBelow={isMobileAndBelow}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type PoolTypeTypes = {
  poolType: PoolTypesResponseData
  poolTypeActive: number | null
  setPoolTypeActive: Dispatch<SetStateAction<PoolTypeTypes['poolTypeActive']>>
  isTabletAndBelow: boolean
  isMobileAndBelow: boolean
}

function PoolTypeItem({
  poolType,
  poolTypeActive,
  setPoolTypeActive,
  isTabletAndBelow,
  isMobileAndBelow,
}: PoolTypeTypes) {
  const poolTypeRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(!isTabletAndBelow)

  useEffect(() => {
    setIsOpen(!isTabletAndBelow)
  }, [isTabletAndBelow])

  const [scrollHeight, setScrollHeight] = useState<number | null>(null)

  useEffect(() => {
    setScrollHeight(isOpen ? poolTypeRef.current?.scrollHeight ?? 0 : 0)
  }, [isOpen])

  useEffect(() => {
    function resize() {
      setIsOpen(false)
    }

    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const Icon = poolTypesCreatingIcons[poolType.type] ?? PickemIcon

  return (
    <div
      key={poolType.id}
      className={classNames(styles.poolTypesItem, {
        [styles.poolTypesItemActive]:
          poolTypeActive === poolType.id && !isTabletAndBelow,
      })}
      onClick={() => !isTabletAndBelow && setPoolTypeActive(poolType.id)}
    >
      <div
        className={styles.poolTypesItemTitle}
        onClick={() => isMobileAndBelow && setIsOpen((prev) => !prev)}
      >
        <p>{poolType.title}</p>
        <div
          className={classNames(styles.iconWrapper, {
            [styles.iconWrapperHide]: isMobileAndBelow && !isOpen,
          })}
        >
          <Icon />
        </div>
      </div>

      <div
        ref={poolTypeRef}
        className={styles.poolTypesItemDescriptionWrapper}
        style={
          isMobileAndBelow && scrollHeight !== null
            ? { height: scrollHeight }
            : undefined
        }
      >
        <div>
          <p className={styles.poolTypesItemDescription}>
            {poolType.description}
          </p>

          <Link href={routes.poolCreating.step2(poolType.id)} passHref>
            <button
              className={classNames(
                'button',
                'button-blue-light',
                styles.poolTypesItemButton,
              )}
            >
              Select
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
