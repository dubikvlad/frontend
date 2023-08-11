import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'

import {
  GolfMajorsPickSummaryResultsData,
  GolfPickSummaryResultsData,
  Pool,
  PoolTypes,
  PoolTypesObj,
} from '@/api'
import { UnknownPlayer } from '@/assets/icons'
import { dateFormattingEvent, divideArray } from '@/config/constants'
import { Select2 } from '@/features/ui'
import {
  useGetGolfTournaments,
  usePool,
  useGetGolfPickSummary,
} from '@/helpers'

import styles from './GolfManageEntriesMemberPickSummary.module.scss'

const percentsSelect = [
  { title: 'Picks percentage', name: 'percents' },
  { title: 'Number of picks', name: 'numbers' },
]

const sortingSelect = [
  { title: 'Golfer’s name  (A to Z)', name: 'nameAZ' },
  { title: 'Golfer’s name (Z to A)', name: 'nameZA' },
  { title: 'Golfers rating', name: 'raitingAZ' },
  { title: 'Golfer’s rating (desc)', name: 'raitingZA' },
  { title: 'Number of picks (asc)', name: 'picksAZ' },
  { title: 'Number of picks (desc)', name: 'picksZA' },
]

export function GolfManageEntriesMemberPickSummary() {
  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool<
    PoolTypesObj['golf_pick_x'] | PoolTypesObj['golf_majors']
  >(Number(poolId))

  const [golfTournamentId, setGolfTournamentId] = useState('')
  const [showPercents, setShowPercents] = useState(percentsSelect[0].name)
  const [sorting, setSorting] = useState(sortingSelect[0].name)

  const { pastGolfTournaments, golfTournamentByPoolIsLoading } =
    useGetGolfTournaments({ poolId: poolData?.id })

  const isGolfPickXOncePerSeason =
    poolData?.type === 'golf_pick_x' &&
    (poolData as Pool<PoolTypesObj['golf_pick_x']>).pick_pool.pick_frequency ===
      'once_per_season'

  const { golfPickSummaryResultsData, golfPickSummaryResultsLoading } =
    useGetGolfPickSummary<'golf_pick_x' | 'golf_majors'>({
      poolId: !isGolfPickXOncePerSeason
        ? golfTournamentId
          ? poolData?.id
          : undefined
        : poolData?.id,
      golfTournamentId:
        !isGolfPickXOncePerSeason && golfTournamentId
          ? +golfTournamentId
          : undefined,
    })

  const golfTournamentsOptions = useMemo(() => {
    return [...pastGolfTournaments]
      .sort((a, b) =>
        new Date(a.start_date).getTime() > new Date(b.start_date).getTime()
          ? -1
          : 1,
      )
      .map((tournament) => ({
        title: tournament.name,
        name: String(tournament.id),
        isDisabled: tournament.is_disabled,
      }))
  }, [pastGolfTournaments])

  useEffect(() => {
    if (golfTournamentId === '' && golfTournamentsOptions.length) {
      setGolfTournamentId(golfTournamentsOptions[0].name)
    }
  }, [golfTournamentsOptions, golfTournamentId])

  if (!poolData) return null

  const sortData = (
    a: GolfPickSummaryResultsData | GolfMajorsPickSummaryResultsData,
    b: GolfPickSummaryResultsData | GolfMajorsPickSummaryResultsData,
  ) => {
    switch (sorting) {
      case 'nameAZ':
        return a.player.name.localeCompare(b.player.name)
      case 'nameZA':
        return b.player.name.localeCompare(a.player.name)
      case 'raitingAZ':
        return a.player.worldRank - b.player.worldRank
      case 'raitingZA':
        return b.player.worldRank - a.player.worldRank
      case 'picksAZ':
        return a.picksCount - b.picksCount
      case 'picksZA':
        return b.picksCount - a.picksCount
      default:
        return 0
    }
  }

  const sortedResults = [...golfPickSummaryResultsData].sort(sortData)

  return (
    <div className={styles.wrapper}>
      {!!golfTournamentsOptions.length &&
        (isGolfPickXOncePerSeason
          ? !!golfPickSummaryResultsData.length
          : true) && (
          <div className={styles.head}>
            {!isGolfPickXOncePerSeason && (
              <Select2
                value={golfTournamentId}
                onChange={setGolfTournamentId}
                options={golfTournamentsOptions}
                fitContent
                disabled={!golfTournamentsOptions.length}
                customOptionTitle={(option) => {
                  const currentTournament = pastGolfTournaments.find(
                    (item) => item.id === +option.name,
                  )

                  if (!currentTournament) return option.title

                  return (
                    <>
                      {option.title}{' '}
                      <span
                        className={classNames(styles.tournamentNameOptionDate)}
                      >
                        ({dateFormattingEvent(currentTournament.start_date)} -{' '}
                        {dateFormattingEvent(currentTournament.finish_date)})
                      </span>
                    </>
                  )
                }}
              />
            )}

            <Select2
              value={sorting}
              onChange={setSorting}
              options={sortingSelect}
              fitContent
            />

            <Select2
              value={showPercents}
              onChange={setShowPercents}
              options={percentsSelect}
              fitContent
            />
          </div>
        )}

      {golfPickSummaryResultsData.length ? (
        <>
          {poolData.type === 'golf_pick_x' && (
            <GolfPickXResults
              golfPickSummaryData={
                sortedResults as GolfPickSummaryResultsData[]
              }
              showPercents={showPercents}
              poolType={poolData.type}
            />
          )}

          {poolData.type === 'golf_majors' && (
            <GolfMajorsResults
              golfPickSummaryData={
                sortedResults as GolfMajorsPickSummaryResultsData[]
              }
              showPercents={showPercents}
              poolType={poolData.type}
            />
          )}
        </>
      ) : (
        !golfTournamentByPoolIsLoading &&
        !golfPickSummaryResultsLoading && (
          <p className={styles.noData}>Sorry, there were no results found</p>
        )
      )}
    </div>
  )
}

type GolfMajorsResultsProps = {
  golfPickSummaryData: GolfPickSummaryResultsData[]
  showPercents: string
  poolType: CardsWrapperProps['poolType']
}

function GolfMajorsResults({
  golfPickSummaryData,
  showPercents,
  poolType,
}: GolfMajorsResultsProps) {
  const slicedArr = divideArray(golfPickSummaryData, 2)

  return (
    <div className={styles.results}>
      {slicedArr.map((itemArr, i) => (
        <CardsWrapper
          key={i}
          golfPickSummaryData={itemArr}
          showPercents={showPercents}
          poolType={poolType}
        />
      ))}
    </div>
  )
}

type GolfPickXResultsProps = {
  golfPickSummaryData: GolfPickSummaryResultsData[]
  showPercents: string
  poolType: CardsWrapperProps['poolType']
}

function GolfPickXResults({
  golfPickSummaryData,
  showPercents,
  poolType,
}: GolfPickXResultsProps) {
  const [selectedItem, setSelectedItem] =
    useState<GolfPickSummaryResultsData | null>(null)

  const playerImgSrc = selectedItem ? selectedItem.player.image : undefined

  const slicedEntriesArr = selectedItem
    ? divideArray(selectedItem.entries, 2)
    : []

  return (
    <div className={styles.golfMajorsWrapper}>
      <CardsWrapper
        golfPickSummaryData={golfPickSummaryData}
        showPercents={showPercents}
        poolType={poolType}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />

      <div className={styles.golfPlayerDetailsWrapper}>
        {selectedItem ? (
          <div className={styles.selectedPlayerWrapper}>
            <div className={styles.selectedPlayerInfoWrapper}>
              {playerImgSrc ? (
                <Image
                  src={playerImgSrc}
                  width={66}
                  height={86}
                  alt={selectedItem.player.name}
                  className={styles.selectedPlayerImage}
                />
              ) : (
                <UnknownPlayer className={styles.selectedPlayerImage} />
              )}

              <div className={styles.selectedPlayerInfo}>
                <p>{selectedItem.player.name}</p>
                <p>World Rate {selectedItem.player.worldRank}</p>
              </div>
            </div>

            <div className={styles.entriesWhoPickedWrapper}>
              <h3>Entries who picked</h3>
              <p className={styles.entriesCountText}>
                {selectedItem.entries.length} Entries
              </p>

              <div className={styles.entriesListWrapper}>
                {slicedEntriesArr.map((entriesArr, i) => (
                  <ul key={i}>
                    {entriesArr.map((entry, j) => (
                      <li key={j}>{entry.name}</li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className={styles.noSelectedPlayerText}>
            Click a player row <span>to see details</span> on which members
            picked him.
          </p>
        )}
      </div>
    </div>
  )
}

type CardsWrapperProps = {
  golfPickSummaryData: (
    | GolfPickSummaryResultsData
    | GolfMajorsPickSummaryResultsData
  )[]
  showPercents: string
  poolType: PoolTypes
  selectedItem?: GolfPickSummaryResultsData | null
  setSelectedItem?: Dispatch<SetStateAction<GolfPickSummaryResultsData | null>>
}

function CardsWrapper({
  golfPickSummaryData,
  showPercents,
  poolType = 'golf_pick_x',
  selectedItem,
  setSelectedItem,
}: CardsWrapperProps) {
  return (
    <div className={styles.cardsWrapper}>
      {golfPickSummaryData.map((item, i) => {
        const percents = Math.round(item.avgCount * 100)

        return (
          <div
            key={i}
            className={classNames(styles.card, {
              [styles.golfPickXCard]: poolType === 'golf_pick_x',
              [styles.cardIsAvailableForSelection]: !!setSelectedItem,
              [styles.cardSelected]: selectedItem?.player.id === item.player.id,
            })}
            onClick={
              setSelectedItem && poolType === 'golf_pick_x'
                ? () =>
                    setSelectedItem((prev) =>
                      prev?.player.id === item.player.id ? null : item,
                    )
                : undefined
            }
          >
            {item.player.image ? (
              <Image
                src={item.player.image}
                width={50}
                height={66}
                alt={item.player.name}
                className={styles.playerImage}
              />
            ) : (
              <UnknownPlayer className={styles.playerImage} />
            )}

            <div className={styles.nameWrapper}>
              <p className={styles.worldRank}>({item.player.worldRank})</p>
              <p>{item.player.name}</p>
            </div>

            <p className={styles.percents}>
              {showPercents === 'percents'
                ? `${percents}%`
                : `${item.picksCount}`}
            </p>

            <div className={styles.percentScale}>
              <div
                className={styles.percentResult}
                style={{ width: `${percents}%` }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
