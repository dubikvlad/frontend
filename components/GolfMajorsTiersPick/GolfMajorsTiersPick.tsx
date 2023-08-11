import classNames from 'classnames'
import { useRouter } from 'next/router'
import React, { useEffect, useState, useTransition } from 'react'
import { KeyedMutator } from 'swr'

import {
  EntriesPoolEntriesData,
  GolfMajorsEntriesItem,
  GolfPlayer,
  Pool,
  ResponseData,
  api,
} from '@/api'
import { CheckMark, MonthLeftArrow, MonthRightArrow } from '@/assets/icons'
import {
  GolfMajorPickTier,
  GolfMajorPickTiersState,
  routes,
  writeErrorToState,
} from '@/config/constants'
import { dateFormattingHistory } from '@/config/constants'
import { Input } from '@/features/ui'
import { useGolfTournamentPlayers } from '@/helpers'

import { GolfMajorsPickedRosterTiered } from '..'

import styles from './GolfMajorsTiersPick.module.scss'

const MAX_PLAYERS_PER_TIER = 10

export function GolfMajorsTiersPick({
  poolData,
  entry,
  isMaintenance,
  updateEntries,
  tournamentId,
  entriesLoading,
}: {
  poolData: Pool<'golf_majors'>
  entry: GolfMajorsEntriesItem | null
  isMaintenance?: boolean
  updateEntries: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'golf_majors'>
  > | null>
  tournamentId: number
  entriesLoading: boolean
}) {
  const [pickTiers, setPickTiers] = useState<GolfMajorPickTiersState>({})
  const [tiebreakValue, setTiebreakValue] = useState('0')
  const [error, setError] = useState('')

  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const {
    golfTournamentPlayersData: players,
    golfTournamentPlayersIsLoading,
    golfTournamentPlayersDeadlinePassed: isDeadline,
  } = useGolfTournamentPlayers({
    poolId: poolData.id,
    tournamentId: Number(tournamentId),
  })

  const isGenuineDeadline = isDeadline && !isMaintenance

  useEffect(() => {
    startTransition(() => {
      if (players.length) {
        const tierState: GolfMajorPickTiersState = {}

        players.forEach((p) => {
          if (p.tier) {
            const playerTier = p.tier as keyof typeof pickTiers

            if (tierState[playerTier]) {
              tierState[playerTier].players.push(p)
            } else {
              tierState[playerTier] = {
                players: [p],
                isPicked: false,
                selectedPlayerId: null,
              }
            }
          }
        })

        if (entry?.golf_majors_forecasts?.length) {
          entry.golf_majors_forecasts.forEach((forecast) => {
            if (forecast.player.tier) {
              tierState[forecast.player.tier] = {
                players: tierState[forecast.player.tier]?.players,
                isPicked: true,
                selectedPlayerId: forecast.golf_player_id,
              }
            }
          })
        }

        setPickTiers(tierState)
      }
    })
  }, [entry, players])

  useEffect(() => {
    if (entry?.tiebreaker.score) {
      setTiebreakValue(entry.tiebreaker.score.toString())
    }
  }, [entry?.tiebreaker.score])

  const onSubmit = async () => {
    if (allPicksMade() && entry) {
      const generateData = () =>
        Object.values(pickTiers)
          .map((tier) => ({
            golf_player_id: tier.selectedPlayerId,
          }))
          .filter((tier) => tier.golf_player_id !== null)

      const result = {
        tiebreaker: Number(tiebreakValue),
        forecasts: generateData(),
      }

      const request = isMaintenance
        ? api.forecasts.golfEditForecasts
        : api.forecasts.golfSetForecasts

      request(poolData.id, entry?.id, tournamentId, result)
        .then((response) => {
          if (response.error) {
            writeErrorToState(response.error, setError)
          } else {
            updateEntries()
            router.push(routes.account.overview(poolData.id))
          }
        })
        .catch(() => {
          setError('Something went wrong')
        })
    }
  }

  const handleChangePlayerInTier = (
    tierNumber: keyof typeof pickTiers,
    playerId: number,
  ) => {
    if (pickTiers[tierNumber].selectedPlayerId === playerId) return

    const tiersClone = structuredClone(pickTiers)

    tiersClone[tierNumber].selectedPlayerId = playerId
    if (!tiersClone[tierNumber].isPicked) tiersClone[tierNumber].isPicked = true

    setPickTiers(tiersClone)
  }

  const allPicksMade = () =>
    Object.values(pickTiers).every(
      (tier) => tier.isPicked && tier.selectedPlayerId,
    )

  if (
    entriesLoading ||
    (golfTournamentPlayersIsLoading && !players) ||
    (!Object.entries(pickTiers).length &&
      (pending || golfTournamentPlayersIsLoading))
  )
    return <div>Loading...</div>

  if (!players || !Object.entries(pickTiers).length)
    return <NoDataSkeleton pickTiers={pickTiers} poolData={poolData} />

  if (!entry) return <div>No entry..</div>

  return (
    <div className={styles.main}>
      <div
        className={classNames(styles.tierPicks, {
          [styles.deadline]: isGenuineDeadline,
        })}
      >
        {Object.entries(pickTiers).map(([tierNumber, tier]) =>
          tier.players.length > MAX_PLAYERS_PER_TIER ? (
            <TierPickBlockExpand
              key={tierNumber}
              tier={tier}
              tierNumber={tierNumber}
              handleChangePlayerInTier={handleChangePlayerInTier}
            />
          ) : (
            <TierPickBlock
              key={tierNumber}
              tier={tier}
              tierNumber={tierNumber}
              handleChangePlayerInTier={handleChangePlayerInTier}
            />
          ),
        )}
      </div>

      <div>
        <GolfMajorsPickedRosterTiered tiers={pickTiers} />
        <div className={classNames(styles.container, styles.tiebreak)}>
          <div>Tiebreak value:*</div>
          <div className={styles.input}>
            <Input
              value={tiebreakValue}
              onChange={setTiebreakValue}
              type="number"
              isValueBold
              isDisabled={isGenuineDeadline}
            />
          </div>
        </div>
        {error && (
          <div className="alert alert-danger alert-align-center">{error}</div>
        )}
        <div>
          <button
            className={classNames('button button-blue', {
              disabled:
                !allPicksMade() || !Number(tiebreakValue) || isGenuineDeadline,
            })}
            style={{
              marginTop: 10,
            }}
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
        <TiebreakInfo />
      </div>
    </div>
  )
}

const TierPickBlock = ({
  tier,
  tierNumber,
  handleChangePlayerInTier,
}: {
  tier: GolfMajorPickTier
  tierNumber: string
  handleChangePlayerInTier: (tierNumber: number, playerId: number) => void
}) => {
  return (
    <div>
      <div
        className={classNames(styles.tierHead, styles.container, {
          [styles.picked]: tier.isPicked,
        })}
      >
        <div>Tier {tierNumber}</div>
        {tier.isPicked && <CheckMark />}
      </div>

      <div className={styles.tierBody}>
        {tier.players.map((p) => (
          <PickItem
            player={p}
            key={p.id}
            handleChangePlayerInTier={handleChangePlayerInTier}
            tierNumber={Number(tierNumber)}
            picked={tier.selectedPlayerId === p.id}
          />
        ))}
      </div>
    </div>
  )
}

const TierPickBlockExpand = ({
  tier,
  tierNumber,
  handleChangePlayerInTier,
}: {
  tier: GolfMajorPickTier
  tierNumber: string
  handleChangePlayerInTier: (tierNumber: number, playerId: number) => void
}) => {
  const paginationSize = MAX_PLAYERS_PER_TIER

  const paginationCount = Math.ceil(tier.players.length / paginationSize)

  type PaginationData = {
    [key: string]: {
      count: number
      from: number
      to: number
      data: GolfPlayer[]
    }
  }

  const [paginationData, setPaginationData] = useState<null | PaginationData>(
    null,
  )
  const [paginationCurrentPage, setPaginationCurrentPage] = useState(1)

  useEffect(() => {
    if (paginationCount && tier.players.length) {
      setPaginationData(
        [...new Array(paginationCount)].reduce<PaginationData>((acc, _, i) => {
          const sliceFrom = i * paginationSize
          const sliceTo = i * paginationSize + paginationSize

          const elementsArr = tier.players.slice(sliceFrom, sliceTo)

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
  }, [paginationCount, paginationSize, tier])

  useEffect(() => {
    if (tier.isPicked && tier.selectedPlayerId && paginationData) {
      let selectedPageFromTier = 0

      Object.entries(paginationData).forEach(([page, value]) => {
        if (value.data.some((player) => player.id === tier.selectedPlayerId)) {
          selectedPageFromTier = Number(page)
        }
      })

      if (selectedPageFromTier) {
        setPaginationCurrentPage(selectedPageFromTier)
      }
    }
  }, [paginationData, tier.isPicked, tier.selectedPlayerId])

  const currentPaginationData = paginationData?.[paginationCurrentPage]
  const lastPage = paginationData
    ? Object.keys(paginationData).length
    : undefined

  const actualData = currentPaginationData
    ? currentPaginationData.data ?? []
    : tier.players

  return (
    <div>
      <div
        className={classNames(styles.tierHead, styles.container, {
          [styles.picked]: tier.isPicked,
        })}
      >
        Tier {tierNumber}
        {tier.isPicked && <CheckMark />}
      </div>

      <div className={classNames(styles.tierBody, styles.expand)}>
        {actualData.map((item) => {
          return (
            <PickItem
              key={item.id}
              handleChangePlayerInTier={handleChangePlayerInTier}
              player={item}
              tierNumber={Number(tierNumber)}
              picked={tier.selectedPlayerId === item.id}
            />
          )
        })}
        {actualData.length < paginationSize &&
          [...new Array(paginationSize - actualData.length)].map((_, i) => (
            <PickItem key={i} />
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

const PickItem = ({
  player,
  picked,
  handleChangePlayerInTier,
  tierNumber,
}: {
  player?: GolfPlayer
  picked?: boolean
  tierNumber?: number
  handleChangePlayerInTier?: (tierNumber: number, playerId: number) => void
}) => {
  if (!player || !tierNumber || !handleChangePlayerInTier)
    return <div className={classNames(styles.tierItem, styles.empty)}></div>

  return (
    <div
      className={classNames(styles.tierItem, {
        [styles.picked]: picked,
        [styles.disabled]: !player.active,
      })}
      onClick={() => handleChangePlayerInTier(tierNumber, player.id)}
    >
      <div>{player.name}</div>
      <div>{player.worldRank}</div>
    </div>
  )
}

const NoDataSkeleton = ({
  poolData,
  pickTiers,
}: {
  poolData: Pool<'golf_majors'>
  pickTiers: GolfMajorPickTiersState
}) => (
  <div className={styles.main}>
    <div className={styles.skeleton}>
      <div className={classNames(styles.container, styles.sk)}>
        <div>
          {poolData.pick_pool.next_golf_tournament.name} field will not be
          finalized until the World Golf Rankings are released the morning of{' '}
          {dateFormattingHistory({
            text: poolData.pick_pool.next_golf_tournament.finish_date.toString(),
          })}
        </div>
        <div>
          You will not be able to enter your picks for the{' '}
          {poolData.tournament.name} until the field is finalized and entered
          into our system.
        </div>
      </div>
      <div className={styles.tierPicks}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <div className={classNames(styles.tierHead, styles.container)}>
              <div>Tier {index + 1}</div>
            </div>
            <div className={styles.tierBody}>
              <div className={classNames(styles.tierItem, styles.noData)}>
                No data
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <GolfMajorsPickedRosterTiered tiers={pickTiers} />
      <div className={classNames(styles.container, styles.tiebreak)}>
        <div>Tiebreak value:*</div>
        <div className={styles.input}>
          <Input value="0" onChange={() => null} type="number" />
        </div>
      </div>
      <div>
        <button
          className="button button-blue disabled"
          style={{
            marginTop: 10,
          }}
        >
          Submit
        </button>
      </div>
      <TiebreakInfo />
    </div>
  </div>
)

const TiebreakInfo = () => (
  <div className={styles.tiebreakInfo}>
    <div>
      <div>*</div>
      <div>
        The tiebreak value is your predicted total score for the winning PGA
        Player of this tournament. Use their total strokes, NOT score to par.
        Example: Enter 274 (NOT -14)
      </div>
    </div>
    <div>
      <div>&#10005;</div>
      <div>
        If you see this symbol next to a name, that player has withdrawn or been
        disqualified and will not participate.
      </div>
    </div>
  </div>
)
