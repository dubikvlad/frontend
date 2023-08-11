import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { KeyedMutator } from 'swr'

import {
  EntriesPoolEntriesData,
  GolfPickXEntriesItem,
  GolfPickXForecastItem,
  GolfPickXPlayer,
  GolfPlayer,
  GolfTournament,
  Pool,
  ResponseData,
  api,
} from '@/api'
import { Cross, Info, UnknownPlayer } from '@/assets/icons'
import {
  handlingMoneyValues,
  picksheetTypes,
  writeErrorToState,
} from '@/config/constants'
import { dateFormattingEvent } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { UserAndEntrySelects } from '@/features/components'
import { POOL_MODAL_TYPES } from '@/features/modals'
import { Input, Select2, SelectWithSearch } from '@/features/ui'
import {
  useGetGolfTournaments,
  useGetPoolEntries,
  useGetUser,
  useGolfTournamentPlayers,
  useMessage,
} from '@/helpers'

import styles from './GolfPickXMakePickPage.module.scss'

type SelectedPlayers = Omit<GolfPlayer, 'active' | 'isWD' | 'tier'>

type GetSelectedPlayersObjectReturnData = {
  id: number
  name: string
  image: string
  worldRank: number
  firstName: string
  lastName: string
  salary: number | null
}

type GetInformationAboutPlayerReturnData = {
  isSelected: boolean
  teamsPickedCount: number
  isDisabled: boolean
  salary: number
}

export function GolfPickXMakePickPage({
  poolData,
}: {
  poolData: Pool<'golf_pick_x'>
}) {
  const {
    query: { isMaintenance, tournament_id },
  } = useRouter()

  const { userData } = useGetUser()

  const isCommissioner = userData ? userData.id === poolData.owner.id : false

  const isEditMode =
    !!isCommissioner && !!isMaintenance && Number(isMaintenance) === 1

  const {
    golfAllTournaments,
    golfLastTournament,
    golfTournamentByPoolIsLoading,
    golfFirstTournament,
  } = useGetGolfTournaments({ poolId: poolData.id })

  const golfTournamentsOptions = [...golfAllTournaments]
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
      isDisabled: item.is_disabled,
    }))

  const [golfTournamentId, setGolfTournamentId] = useState<string | null>(null)

  useEffect(() => {
    if (
      golfTournamentId === null &&
      golfTournamentsOptions.length &&
      poolData &&
      userData
    ) {
      const editModeSelectedOption =
        isEditMode && typeof tournament_id === 'string'
          ? golfTournamentsOptions.find(
              (item) => item.name === tournament_id && !item.isDisabled,
            )
          : undefined

      const selectedOption = !editModeSelectedOption
        ? golfTournamentsOptions.find(
            (item) =>
              item.name === String(poolData.pick_pool.next_golf_tournament.id),
          )
        : editModeSelectedOption

      if (selectedOption) setGolfTournamentId(selectedOption.name)
    }
  }, [
    golfTournamentId,
    golfTournamentsOptions,
    poolData,
    isEditMode,
    tournament_id,
    userData,
  ])

  const isGolfPickFrequencyWeekly =
    poolData.pick_pool.pick_frequency === 'weekly'

  // если pick_frequency === 'once_per_season', то здесь id турнира
  // вообще не играет роли, поэтому будет id текущего турнира или следующего,
  // без разницы
  const selectedTournament = golfAllTournaments.find(
    (item) =>
      item.id ===
      (isGolfPickFrequencyWeekly
        ? golfTournamentId
          ? +golfTournamentId
          : undefined
        : golfLastTournament?.id),
  )

  const {
    golfTournamentPlayersData,
    golfTournamentPlayersDeadlinePassed,
    golfTournamentPlayersIsLoading,
  } = useGolfTournamentPlayers({
    poolId:
      (isGolfPickFrequencyWeekly
        ? !!golfTournamentId
          ? true
          : undefined
        : true) && poolData.id,
    tournamentId: isGolfPickFrequencyWeekly
      ? golfTournamentId
        ? +golfTournamentId
        : undefined
      : undefined,
  })

  const { poolEntriesData, poolEntriesMutate } =
    useGetPoolEntries<'golf_pick_x'>({
      poolId: poolData.id,
      golf_tournament_id: isGolfPickFrequencyWeekly
        ? golfTournamentId
          ? +golfTournamentId
          : undefined
        : undefined,
    })

  const [selectedEntry, setSelectedEntry] =
    useState<GolfPickXEntriesItem | null>(null)

  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayers[]>([])

  const isSalaryCap =
    poolData.pick_pool.picksheet_type === picksheetTypes.salary_cap

  const sortByOptions = [
    { title: 'Popularity', name: 'Popularity' },
    { title: 'Descending popularity', name: 'Descending popularity' },
    { title: 'Player name', name: 'Player name' },
    { title: 'Descending by player name', name: 'Descending by player name' },
    ...(isSalaryCap
      ? [
          { title: 'Ascending by salary', name: 'Ascending by salary' },
          {
            title: 'Descending by salary',
            name: 'Descending by salary',
          },
        ]
      : [
          { title: 'Number of picks', name: 'Number of picks' },
          {
            title: 'Descending by number of picks',
            name: 'Descending by number of picks',
          },
        ]),
  ]

  const [remainingSalary, setRemainingSalary] = useState<null | number>(null)
  const [avgPlayerSalary, setAvgPlayerSalary] = useState<null | string>(null)

  useEffect(() => {
    if (isSalaryCap && !!selectedEntry) {
      const selectedPlayersSalary = selectedPlayers.reduce(
        (sum, player) => (player.salary ? sum + player.salary : sum),
        0,
      )

      const newRemainingSalary =
        poolData.pick_pool.players_picked_limit * 3000 - selectedPlayersSalary

      setRemainingSalary(newRemainingSalary)

      const numberFreeCells =
        poolData.pick_pool.players_picked_limit - selectedPlayers.length

      setAvgPlayerSalary(
        (newRemainingSalary !== 0 && numberFreeCells !== 0
          ? newRemainingSalary / numberFreeCells
          : newRemainingSalary
        ).toFixed(),
      )
    }
  }, [selectedPlayers, isSalaryCap, selectedEntry, poolData])

  function getSelectedPlayersObject(
    player: GolfPlayer | GolfPickXPlayer,
  ): GetSelectedPlayersObjectReturnData {
    const { id, name, image, worldRank, salary } = player

    const firstName =
      'firstName' in player ? player.firstName : player.first_name
    const lastName = 'lastName' in player ? player.lastName : player.last_name

    return { id, name, image, worldRank, firstName, lastName, salary }
  }

  useEffect(() => {
    if (selectedEntry && golfTournamentId) {
      setSelectedPlayers(
        selectedEntry.golf_pick_x_forecasts
          .filter((player) => player.golf_tournament_id === +golfTournamentId)
          .reduce<SelectedPlayers[]>((acc, _, index) => {
            const currentEntry = selectedEntry.golf_pick_x_forecasts[index]

            acc.push(getSelectedPlayersObject(currentEntry.player))

            return acc
          }, []),
      )
    }
  }, [selectedEntry, golfTournamentId])

  const [searchByGolfer, setSearchByGolfer] = useState('')

  const filteredByWorldRankPlayersData = useMemo(() => {
    const arr = [...golfTournamentPlayersData]
    arr.sort((a, b) => a.worldRank - b.worldRank)
    return arr
  }, [golfTournamentPlayersData])

  const searchPlayersData = searchByGolfer.trim()
    ? filteredByWorldRankPlayersData.filter((player) =>
        player.name.toLowerCase().includes(searchByGolfer.toLowerCase()),
      )
    : filteredByWorldRankPlayersData

  const [sortByValue, setSortByValue] = useState(sortByOptions[0].name)

  const isPickablePlayers =
    selectedPlayers.length < poolData.pick_pool.players_picked_limit

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useMessage()

  const automaticPicksValue = poolData.pick_pool.automatic_picks

  function getInformationAboutPlayer(
    player: GolfPlayer,
  ): GetInformationAboutPlayerReturnData {
    if (!player)
      return {
        isSelected: false,
        teamsPickedCount: 0,
        isDisabled: false,
        salary: 0,
      }

    const prevPicksInfo = selectedEntry?.prevPicksInfo?.[player.id]

    const isSelected = selectedPlayers.some(
      (selectedPlayer) => selectedPlayer.id === player.id,
    )

    const teamsPickedCount = prevPicksInfo ? prevPicksInfo.player_pick_count : 0

    const isDisabled =
      (prevPicksInfo ? prevPicksInfo.is_blocked : false) ||
      !player.active ||
      (!poolData.pick_pool.allow_wd_players_to_be_repicked && player.isWD) ||
      (!!poolData.pick_pool.player_use_limit &&
        teamsPickedCount === poolData.pick_pool.player_use_limit) ||
      (isSalaryCap &&
        remainingSalary !== null &&
        player.salary !== null &&
        remainingSalary < player.salary)

    return {
      isSelected,
      teamsPickedCount,
      isDisabled,
      salary: player.salary ?? 0,
    }
  }

  function autoSelect() {
    if (!searchPlayersData.length) return []

    const numberOfIndexes =
      poolData.pick_pool.players_picked_limit - selectedPlayers.length

    let initialRemainingSalary = remainingSalary ?? 0

    if (automaticPicksValue === 'highest_ranking_golfer_in_world') {
      const worldRanksArr: SelectedPlayers[] = []

      for (let i = 0; i < searchPlayersData.length; i++) {
        const player = searchPlayersData[i]

        if (worldRanksArr.length < numberOfIndexes) {
          const { isSelected, isDisabled, salary } =
            getInformationAboutPlayer(player)

          if (
            !isSelected &&
            !isDisabled &&
            (isSalaryCap ? initialRemainingSalary >= salary : true)
          ) {
            worldRanksArr.push(getSelectedPlayersObject(player))

            initialRemainingSalary -= salary
          }

          continue
        } else break
      }

      setSelectedPlayers((prev) => [...prev, ...worldRanksArr])
    }

    if (automaticPicksValue === 'random_golfer_top_100') {
      const indexesArr: number[] = []

      const selectedPlayersIds = selectedPlayers.map((player) => player.id)
      const actualPlayersArr = searchPlayersData.filter(
        (player) =>
          player.worldRank <= 100 && !selectedPlayersIds.includes(player.id),
      )

      function randomIndex() {
        if (!actualPlayersArr.length) return
        if (indexesArr.length === numberOfIndexes) return

        if (actualPlayersArr.length < numberOfIndexes) {
          actualPlayersArr.forEach((_, index) => {
            indexesArr.push(index)
          })

          return
        }

        const index = Math.round(Math.random() * (actualPlayersArr.length - 1))

        if (indexesArr.includes(index)) {
          randomIndex()
          return
        }

        if (actualPlayersArr[index]) {
          const player = actualPlayersArr[index]

          const { isSelected, isDisabled } = getInformationAboutPlayer(player)

          if (!isSelected && !isDisabled) {
            indexesArr.push(index)
          }
        }

        if (indexesArr.length < numberOfIndexes) {
          randomIndex()
          return
        }
      }

      randomIndex()

      const playersArr = indexesArr.map((index) =>
        getSelectedPlayersObject(actualPlayersArr[index]),
      )

      setSelectedPlayers((prev) => [...prev, ...playersArr])
    }
  }

  const removePlayerFromRoster = (player: SelectedPlayers) => {
    if (isLoading) return

    const findSelectedPlayerIndex = selectedPlayers.findIndex(
      (selectedPlayer) => selectedPlayer.id === player.id,
    )

    if (!~findSelectedPlayerIndex) return

    const selectedPlayersCopy = [...selectedPlayers]
    selectedPlayersCopy.splice(findSelectedPlayerIndex, 1)

    setSelectedPlayers(selectedPlayersCopy)
  }

  const isDeadline = isEditMode
    ? false
    : (isGolfPickFrequencyWeekly
        ? !!golfTournamentPlayersDeadlinePassed ||
          !!selectedTournament?.is_disabled
        : !!selectedTournament?.is_started ||
          !!golfFirstTournament?.is_started ||
          !!golfFirstTournament?.is_finished) ||
      golfTournamentByPoolIsLoading ||
      golfTournamentPlayersIsLoading ||
      !!selectedTournament?.is_finished

  const entriesSelectedTournament =
    selectedEntry && selectedTournament
      ? selectedEntry.golf_pick_x_forecasts.filter(
          (forecast) => forecast.golf_tournament_id === selectedTournament.id,
        )
      : []

  const isOncePerSeasonDeadlinePassed =
    !isGolfPickFrequencyWeekly &&
    (!!golfFirstTournament?.is_started || !!golfFirstTournament?.is_finished)

  return (
    <div className={styles.wrapper}>
      <h1>
        Make a pick <Info />
      </h1>

      <p>
        Pick golfers from the tournament field. The pick deadline is the first
        tee time Thursday morning
      </p>

      <div className={styles.userAndEntrySelectsWrapper}>
        {isEditMode && isGolfPickFrequencyWeekly && (
          <SelectWithSearch
            options={golfTournamentsOptions}
            value={golfTournamentId}
            onChange={setGolfTournamentId}
            placeholder="Tournament name"
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
        )}

        <UserAndEntrySelects
          poolData={poolData}
          entriesData={poolEntriesData}
          setSelectedEntry={setSelectedEntry}
          mutateEntries={poolEntriesMutate}
          pickDeadline={
            isGolfPickFrequencyWeekly
              ? poolData.pick_pool.next_golf_tournament.start_date
              : golfFirstTournament?.start_date
          }
        />
      </div>

      <div className={styles.filterWrapper}>
        <Input
          type="search"
          placeholder="Search by Golfer"
          value={searchByGolfer}
          onChange={setSearchByGolfer}
          isDisabled={!golfTournamentPlayersData.length}
        />

        <Select2
          wrapperClassName={styles.sortByWrapperSelect}
          options={sortByOptions}
          placeholder="Sort by"
          customTitle={(value) => `Sort by ${value.title}`}
          value={sortByValue}
          onChange={setSortByValue}
        />

        {automaticPicksValue !== 'no_automatic_picks' && (
          <button
            className={classNames('button button-blue-light-outline', {
              disabled:
                !golfTournamentPlayersData.length ||
                !isPickablePlayers ||
                isLoading ||
                isDeadline,
            })}
            onClick={autoSelect}
          >
            Auto Select
          </button>
        )}
      </div>

      <div className={styles.listWrapper}>
        <PlayersTableWrapper
          searchPlayersData={searchPlayersData}
          selectedPlayers={selectedPlayers}
          setSelectedPlayers={setSelectedPlayers}
          getSelectedPlayersObject={getSelectedPlayersObject}
          selectedEntry={selectedEntry}
          sortByValue={sortByValue}
          golfTournamentPlayersData={golfTournamentPlayersData}
          error={error}
          isSalaryCap={isSalaryCap}
          getInformationAboutPlayer={getInformationAboutPlayer}
          isPickablePlayers={isPickablePlayers}
          searchByGolfer={searchByGolfer}
          golfTournamentByPoolIsLoading={golfTournamentByPoolIsLoading}
          golfTournamentPlayersIsLoading={golfTournamentPlayersIsLoading}
          removePlayerFromRoster={removePlayerFromRoster}
          isDeadline={isDeadline}
          selectedTournament={selectedTournament}
          isEditMode={isEditMode}
          isOncePerSeasonDeadlinePassed={isOncePerSeasonDeadlinePassed}
        />

        <SelectedPlayersInfoWrapper
          poolData={poolData}
          selectedEntry={selectedEntry}
          isPickablePlayers={isPickablePlayers}
          selectedTournament={selectedTournament}
          setIsLoading={setIsLoading}
          selectedPlayers={selectedPlayers}
          setError={setError}
          poolEntriesMutate={poolEntriesMutate}
          isSalaryCap={isSalaryCap}
          remainingSalary={remainingSalary}
          avgPlayerSalary={avgPlayerSalary}
          removePlayerFromRoster={removePlayerFromRoster}
          isLoading={isLoading}
          isDeadline={isDeadline}
          entriesSelectedTournament={entriesSelectedTournament}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  )
}

type PlayersTableWrapperProps = {
  searchPlayersData: GolfPlayer[]
  selectedPlayers: SelectedPlayers[]
  setSelectedPlayers: Dispatch<
    SetStateAction<PlayersTableWrapperProps['selectedPlayers']>
  >
  getSelectedPlayersObject: (
    player: GolfPlayer | GolfPickXPlayer,
  ) => GetSelectedPlayersObjectReturnData
  selectedEntry: GolfPickXEntriesItem | null
  sortByValue: string
  golfTournamentPlayersData: GolfPlayer[]
  error: string | null
  isSalaryCap: boolean
  getInformationAboutPlayer: (
    player: GolfPlayer,
  ) => GetInformationAboutPlayerReturnData
  isPickablePlayers: boolean
  searchByGolfer: string
  golfTournamentByPoolIsLoading: boolean
  golfTournamentPlayersIsLoading: boolean
  removePlayerFromRoster: (player: SelectedPlayers) => void
  isDeadline: boolean
  selectedTournament: GolfTournament | undefined
  isEditMode: boolean
  isOncePerSeasonDeadlinePassed: boolean
}

function PlayersTableWrapper({
  searchPlayersData,
  selectedPlayers,
  setSelectedPlayers,
  getSelectedPlayersObject,
  selectedEntry,
  sortByValue,
  golfTournamentPlayersData,
  error,
  isSalaryCap,
  getInformationAboutPlayer,
  isPickablePlayers,
  searchByGolfer,
  golfTournamentByPoolIsLoading,
  golfTournamentPlayersIsLoading,
  removePlayerFromRoster,
  isDeadline,
  selectedTournament,
  isEditMode,
  isOncePerSeasonDeadlinePassed,
}: PlayersTableWrapperProps) {
  const sortedData = [...searchPlayersData].sort(sorting)

  const addPlayerToRoster = (player: GolfPlayer) => {
    const findSelectedPlayer = selectedPlayers.find(
      (selectedPlayer) => selectedPlayer.id === player.id,
    )

    if (!!findSelectedPlayer) return

    setSelectedPlayers((prev) => [...prev, getSelectedPlayersObject(player)])
  }

  function sorting(a: GolfPlayer, b: GolfPlayer) {
    function сheckNumberOfPicks() {
      if (
        !selectedEntry ||
        Array.isArray(selectedEntry.prevPicksInfo) ||
        typeof selectedEntry.prevPicksInfo !== 'object' ||
        !selectedEntry.prevPicksInfo
      )
        return { aPlayerPickCount: 0, bPlayerPickCount: 0 }

      const aPlayerPickCount =
        selectedEntry.prevPicksInfo[a.id]?.player_pick_count ?? 0
      const bPlayerPickCount =
        selectedEntry.prevPicksInfo[b.id]?.player_pick_count ?? 0

      return { aPlayerPickCount, bPlayerPickCount }
    }

    switch (sortByValue) {
      case 'Descending popularity':
        return b.worldRank - a.worldRank
      case 'Player name':
        return a.name > b.name ? 1 : -1
      case 'Descending by player name':
        return a.name > b.name ? -1 : 1
      case 'Number of picks': {
        const { aPlayerPickCount, bPlayerPickCount } = сheckNumberOfPicks()

        return aPlayerPickCount - bPlayerPickCount
      }
      case 'Descending by number of picks': {
        const { aPlayerPickCount, bPlayerPickCount } = сheckNumberOfPicks()

        return bPlayerPickCount - aPlayerPickCount
      }
      case 'Ascending by salary':
        return (a.salary ?? 0) > (b.salary ?? 0) ? 1 : -1
      case 'Descending by salary':
        return (a.salary ?? 0) > (b.salary ?? 0) ? -1 : 1
      default:
        return 0
    }
  }

  return (
    <div className={styles.playersTableWrapper}>
      {golfTournamentPlayersData.length ? (
        <>
          {!!error && <div className="alert alert-danger">{error}</div>}

          {sortedData.length ? (
            <>
              {!!selectedTournament &&
                (selectedTournament.deadline_passed ||
                  selectedTournament.is_finished ||
                  isOncePerSeasonDeadlinePassed) &&
                !isEditMode && (
                  <div className="alert alert-info alert-align-center">
                    {isOncePerSeasonDeadlinePassed
                      ? 'Once a tournament begins, picks are no longer able to be entered or modified.'
                      : 'The deadline has passed, you can not make picks for the  current tournament'}
                  </div>
                )}

              <div className={styles.playersTableHead}>
                <p>Rank</p>
                <p>Golfer Name</p>
                <p>{isSalaryCap ? 'Salary' : 'Teams Picked'}</p>
              </div>

              <div className={styles.playersTableBody}>
                {sortedData.map((player) => {
                  const { isSelected, isDisabled, teamsPickedCount } =
                    getInformationAboutPlayer(player)

                  const isNotPickable =
                    !isPickablePlayers && !isDisabled && !isSelected

                  return (
                    <div
                      key={player.id}
                      className={classNames(styles.playersTableBodyItem, {
                        [styles.playersTableBodyItemDisabled]:
                          (isDisabled || player.isWD) && !isSelected,
                        [styles.playersTableBodyItemSelected]: isSelected,
                        [styles.playersTableBodyItemNotPickable]: isNotPickable,
                        [styles.playersTableBodyItemDeadline]: isDeadline,
                      })}
                      onClick={() => {
                        if (
                          !isDeadline &&
                          ((isPickablePlayers && !isDisabled) || isSelected)
                        ) {
                          const selectedPlayer = selectedPlayers.find(
                            (selectedPlayer) => selectedPlayer.id === player.id,
                          )
                          if (selectedPlayer) {
                            removePlayerFromRoster(selectedPlayer)
                          } else {
                            addPlayerToRoster(player)
                          }
                        }
                      }}
                    >
                      <p>{player.worldRank}</p>
                      <p>{player.name}</p>
                      <p className={styles.teamesPickedText}>
                        {isSalaryCap
                          ? `$${handlingMoneyValues(player.salary ?? '')}`
                          : teamsPickedCount}
                      </p>

                      {player.isWD && <Cross />}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            !!searchByGolfer.trim() && (
              <p className={styles.searchNotFound}>
                Sorry, there were no results found for{' '}
                <span>&quot;{searchByGolfer}&quot;</span>
              </p>
            )
          )}
        </>
      ) : (
        !golfTournamentByPoolIsLoading &&
        !golfTournamentPlayersIsLoading && (
          <div className="alert alert-info alert-align-center">
            Picks can not be entered until the tournament field has been
            finalized and world golf rankings have been updated for the week
            (usually by Monday morning, the week of the tournament).
          </div>
        )
      )}
    </div>
  )
}

type SelectedPlayersInfoWrapperProps = {
  poolData: Pool<'golf_pick_x'>
  selectedEntry: GolfPickXEntriesItem | null
  isPickablePlayers: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>
  selectedPlayers: SelectedPlayers[]
  setError: Dispatch<SetStateAction<string | null>>
  poolEntriesMutate: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'golf_pick_x'>
  > | null>
  isSalaryCap: boolean
  remainingSalary: null | number
  avgPlayerSalary: null | string
  removePlayerFromRoster: (player: SelectedPlayers) => void
  isLoading: boolean
  isDeadline: boolean
  selectedTournament: GolfTournament | undefined
  entriesSelectedTournament: GolfPickXForecastItem[]
  isEditMode: boolean
}

function SelectedPlayersInfoWrapper({
  poolData,
  selectedEntry,
  isPickablePlayers,
  selectedTournament,
  setIsLoading,
  selectedPlayers,
  setError,
  poolEntriesMutate,
  isSalaryCap,
  remainingSalary,
  avgPlayerSalary,
  removePlayerFromRoster,
  isLoading,
  isDeadline,
  entriesSelectedTournament,
  isEditMode,
}: SelectedPlayersInfoWrapperProps) {
  const playersPickedLimitArr: number[] = Array(
    poolData.pick_pool.players_picked_limit,
  ).fill(0)

  const { openModal } = useOpenModal()

  const submitButtonIsDisabled = selectedEntry
    ? selectedEntry.golf_pick_x_forecasts.filter((forecast) =>
        selectedPlayers.some((player) => player.id === forecast.player.id),
      ).length === selectedPlayers.length
    : false

  async function submitPicks() {
    if (
      !selectedEntry ||
      isPickablePlayers ||
      submitButtonIsDisabled ||
      !selectedTournament
    ) {
      return
    }

    try {
      setIsLoading(true)

      const res = await (!entriesSelectedTournament.length && !isEditMode
        ? api.forecasts.golfSetForecasts
        : api.forecasts.golfEditForecasts)(
        poolData.id,
        selectedEntry.id,
        // если pick_frequency = 'once_per_season', то selectedTournament
        // не рассматривается на бэке, так что без разницы, какое
        // здесь значение
        selectedTournament.id,
        {
          forecasts: selectedPlayers.map((player) => ({
            golf_player_id: player.id.toString(),
          })),
        },
      )

      if (res.error) {
        writeErrorToState(res.error, setError)

        setIsLoading(false)
        return
      }

      await poolEntriesMutate()
      setIsLoading(false)
      openModal({ type: POOL_MODAL_TYPES.MAKE_A_PICK_SUCCESS })
    } catch (err) {
      setIsLoading(false)
      writeErrorToState(err, setError)
    }
  }

  return (
    <div className={styles.selectedPlayersInfoWrapper}>
      {isSalaryCap && remainingSalary !== null && avgPlayerSalary !== null && (
        <div className={styles.remainingSalaryWrapper}>
          <p className={styles.remainingSalaryText}>Remaining Salary</p>
          <p
            className={classNames(styles.remainingSalaryValue, {
              [styles.remainingSalaryValueDisabled]:
                poolData.pick_pool.players_picked_limit ===
                  selectedPlayers.length || remainingSalary === 0,
            })}
          >
            ${handlingMoneyValues(remainingSalary)}
          </p>
          <p className={styles.remainingSalaryAvgPlayer}>
            Avg Rem./Player:
            <span>{handlingMoneyValues(avgPlayerSalary)}</span>
          </p>
        </div>
      )}

      <div className={styles.selectedPlayersWrapper}>
        <p className={styles.selectedPlayersWrapperTitle}>
          Your Roster
          <span>
            {selectedPlayers.length}/{poolData.pick_pool.players_picked_limit}
          </span>
        </p>

        <div className={styles.selectedPlayersList}>
          {playersPickedLimitArr.map((_, index) => (
            <PlayerItem
              key={index}
              player={selectedPlayers[index]}
              index={index}
              isSalaryCap={isSalaryCap}
              removePlayerFromRoster={removePlayerFromRoster}
              isDeadline={isDeadline}
            />
          ))}
        </div>
      </div>

      <button
        className={classNames('button button-blue-light', {
          disabled:
            isPickablePlayers ||
            submitButtonIsDisabled ||
            isLoading ||
            isDeadline,
        })}
        onClick={() => !isLoading && !isDeadline && submitPicks()}
      >
        Submit
      </button>

      <div className={styles.explanationWrapper}>
        <Cross />

        <p>
          If you see this symbol next to a name, that player has withdrawn or
          been disqualified and will not participate.
        </p>
      </div>
    </div>
  )
}

type PlayerItemProps = {
  player: SelectedPlayers | undefined
  index: number
  isSalaryCap: boolean
  removePlayerFromRoster: (player: SelectedPlayers) => void
  isDeadline: boolean
}

function PlayerItem({
  player,
  index,
  isSalaryCap,
  removePlayerFromRoster,
  isDeadline,
}: PlayerItemProps) {
  if (player)
    return (
      <div
        key={index}
        className={classNames(styles.selectedPlayerItem, {
          [styles.selectedPlayerItemDeadline]: isDeadline,
        })}
      >
        <div>
          {player.image?.trim() ? (
            <Image
              src={player.image}
              width={60}
              height={80}
              alt={player.name}
            />
          ) : (
            <UnknownPlayer />
          )}
        </div>

        <div
          className={classNames(styles.playerInfoWrapper, {
            [styles.playerInfoWrapperSalary]: isSalaryCap,
          })}
        >
          <div>
            <p className={styles.playerInfoFirstName}>{player.firstName}</p>
            <p className={styles.playerInfoLastName}>{player.lastName}</p>

            <p className={styles.playerInfoWorldRank}>
              World rank: <span>{player.worldRank}</span>
            </p>
          </div>

          {isSalaryCap && (
            <p className={styles.playerInfoSalary}>
              ${handlingMoneyValues(player.salary ?? '')}
            </p>
          )}
        </div>

        <div
          className={styles.selectedPlayerItemCrossWrapper}
          onClick={() => !isDeadline && removePlayerFromRoster(player)}
        >
          <Cross />
        </div>
      </div>
    )

  return (
    <div key={index} className={styles.selectedPlayerItem}>
      <div>
        <UnknownPlayer />
      </div>

      <p>Choose a player</p>
    </div>
  )
}
