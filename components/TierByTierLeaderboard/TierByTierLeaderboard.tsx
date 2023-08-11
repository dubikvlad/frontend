import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { GolfTierByTierLeaderboardResponseData } from '@/api'
import {
  Cross2,
  MonthLeftArrow,
  MonthRightArrow,
  UnknownPlayer,
} from '@/assets/icons'
import { dateFormattingEvent } from '@/config/constants'
import { SelectWithSearch, Switcher } from '@/features/ui'
import {
  useGetGolfTournaments,
  useGolfTierByTierLeaderboard,
  usePool,
} from '@/helpers'

import styles from './TierByTierLeaderboard.module.scss'

export function TierByTierLeaderboard() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<'golf_majors'>(poolId ? +poolId : undefined)

  const { golfAllTournaments } = useGetGolfTournaments({ poolId: poolData?.id })

  const tournamentsOptions = useMemo(() => {
    return poolData
      ? golfAllTournaments
          .filter(
            (item) =>
              new Date(
                poolData.pick_pool.next_golf_tournament.start_date,
              ).getTime() >= new Date(item.start_date).getTime(),
          )
          .sort((a, b) =>
            new Date(a.start_date).getTime() > new Date(b.start_date).getTime()
              ? -1
              : 1,
          )
          .map((item) => ({
            title: item.name,
            name: String(item.id),
          }))
      : []
  }, [poolData, golfAllTournaments])

  const [golfTournamentId, setGolfTournamentId] = useState<string | null>(null)

  useEffect(() => {
    if (tournamentsOptions.length && golfTournamentId === null) {
      setGolfTournamentId(tournamentsOptions[0].name)
    }
  }, [golfTournamentId, tournamentsOptions])

  const [isPhotosOfPlayers, setIsPhotosOfPlayers] = useState(false)

  const { golfTierByTierLeaderboardData, golfTierByTierLeaderboardIsLoading } =
    useGolfTierByTierLeaderboard({
      poolId: poolData?.id,
      golfTournamentId: golfTournamentId ? +golfTournamentId : undefined,
    })

  const filteredData = useMemo(() => {
    if (!golfTierByTierLeaderboardData.length) return null

    return golfTierByTierLeaderboardData.reduce<{
      [key: string]: GolfTierByTierLeaderboardResponseData[]
    }>((acc, item) => {
      if (item.tier in acc) {
        acc[item.tier].push(item)
        return acc
      }

      acc[item.tier] = [item]
      return acc
    }, {})
  }, [golfTierByTierLeaderboardData])

  if (!poolData) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.tournamentAndPhotosPlayersWrapper}>
        <SelectWithSearch
          value={golfTournamentId}
          onChange={setGolfTournamentId}
          options={tournamentsOptions}
          customOptionTitle={(option) => {
            const currentTournament = golfAllTournaments.find(
              (item) => item.id === +option.name,
            )

            if (!currentTournament) return option.title

            return (
              <>
                {option.title}{' '}
                <span
                  className={classNames(styles.tournamentNameOptionDate, {
                    [styles.tournamentNameOptionDateCurrent]:
                      poolData.pick_pool.next_golf_tournament.id ===
                      currentTournament.id,
                  })}
                >
                  ({dateFormattingEvent(currentTournament.start_date)} -{' '}
                  {dateFormattingEvent(currentTournament.finish_date)})
                </span>
              </>
            )
          }}
        />

        <div className={styles.photosOfPlayersWrapper}>
          <p>Photos of players</p>
          <Switcher value={isPhotosOfPlayers} onChange={setIsPhotosOfPlayers} />
        </div>
      </div>

      {filteredData ? (
        <div className={styles.tiersWrapper}>
          {Object.entries(filteredData).map(([key, tierArr]) => {
            return (
              <TierElement
                key={key}
                tierNumber={key}
                isPhotosOfPlayers={isPhotosOfPlayers}
                tierArr={tierArr}
              />
            )
          })}
        </div>
      ) : (
        !golfTierByTierLeaderboardIsLoading &&
        golfTournamentId !== null && (
          <p className={styles.noInfo}>
            Unfortunately, there is <span>no relevant information</span> for
            this tournament. Try to choose another tournament
          </p>
        )
      )}
    </div>
  )
}

type TierElementProps = {
  tierNumber: string
  isPhotosOfPlayers: boolean
  tierArr: GolfTierByTierLeaderboardResponseData[]
}

function TierElement({
  tierNumber,
  isPhotosOfPlayers,
  tierArr,
}: TierElementProps) {
  const paginationSize = 10

  const isPagination = tierArr.length > paginationSize

  const paginationCount = isPagination
    ? Math.ceil(tierArr.length / paginationSize)
    : undefined

  type PaginationData = {
    [key: string]: {
      count: number
      from: number
      to: number
      data: GolfTierByTierLeaderboardResponseData[]
    }
  }

  const [paginationData, setPaginationData] = useState<null | PaginationData>(
    null,
  )
  const [paginationCurrentPage, setPaginationCurrentPage] = useState(1)

  useEffect(() => {
    if (isPagination && paginationCount && tierArr.length) {
      setPaginationData(
        [...new Array(paginationCount)].reduce<PaginationData>((acc, _, i) => {
          const sliceFrom = i * paginationSize
          const sliceTo = i * paginationSize + paginationSize

          const elementsArr = tierArr.slice(sliceFrom, sliceTo)

          acc[i + 1] = {
            count: elementsArr.length,
            from: sliceFrom + 1,
            to: sliceFrom + elementsArr.length,
            data: elementsArr,
          }

          return acc
        }, {}),
      )
    }
  }, [isPagination, paginationCount, tierArr])

  const currentPaginationData = paginationData?.[paginationCurrentPage]
  const lastPage = paginationData
    ? Object.keys(paginationData).length
    : undefined

  const actualData =
    isPagination && currentPaginationData
      ? currentPaginationData.data ?? []
      : tierArr

  return (
    <div className={styles.tierWrapper}>
      <p className={styles.tierHeader}>Tier {tierNumber}</p>

      <div
        className={classNames(styles.tierList, {
          [styles.tierListWithPhotos]: isPhotosOfPlayers,
        })}
      >
        {actualData.map((item) => {
          const points = item.points
          const pointsIsNumber = typeof points === 'number'

          const playerNotActive =
            typeof points == 'string' && points !== 'active' && points !== 'cut'

          return (
            <div
              key={item.id}
              className={classNames(styles.tierListItem, {
                [styles.tierListItemNotActive]: playerNotActive,
                [styles.tierListItemWithPhotos]: isPhotosOfPlayers,
                [styles.tierListItemWithPagination]: currentPaginationData,
              })}
            >
              {isPhotosOfPlayers && (
                <div className={styles.imageWrapper}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      width={40}
                      height={53}
                      alt={item.name}
                    />
                  ) : (
                    <UnknownPlayer />
                  )}
                </div>
              )}

              <p className={styles.tierListItemWorldRankText}>
                ({item.worldRank})
              </p>

              <p>{item.name}</p>

              <p
                className={classNames(styles.points, {
                  [styles.pointsMinus]: pointsIsNumber && points < 0,
                  [styles.pointsZero]: pointsIsNumber && points === 0,
                  [styles.pointsPlus]: pointsIsNumber ? points > 0 : true,
                })}
              >
                {pointsIsNumber
                  ? points > 0
                    ? `+${points}`
                    : points < 0
                    ? points
                    : 'E'
                  : points.toUpperCase()}
              </p>

              {playerNotActive && <Cross2 className={styles.cross} />}
            </div>
          )
        })}
        {actualData.length < paginationSize &&
          [...new Array(paginationSize - actualData.length)].map((_, i) => (
            <div
              key={i}
              className={classNames(styles.tierListItem, {
                [styles.tierListItemWithPhotos]: isPhotosOfPlayers,
                [styles.tierListItemWithPagination]: currentPaginationData,
              })}
            ></div>
          ))}
      </div>

      {currentPaginationData && (
        <div className={styles.paginationWrapper}>
          <div
            className={classNames(styles.arrow, {
              [styles.arrowHide]: paginationCurrentPage === 1,
            })}
            onClick={() => setPaginationCurrentPage((prev) => --prev)}
          >
            <MonthLeftArrow />
          </div>
          <p>
            {currentPaginationData.from} - {currentPaginationData.to}
          </p>
          <div
            className={classNames(styles.arrow, {
              [styles.arrowHide]: paginationCurrentPage === lastPage,
            })}
            onClick={() => setPaginationCurrentPage((prev) => ++prev)}
          >
            <MonthRightArrow />
          </div>
        </div>
      )}
    </div>
  )
}
