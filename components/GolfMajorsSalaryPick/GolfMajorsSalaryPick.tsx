import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { KeyedMutator } from 'swr'

import {
  EntriesPoolEntriesData,
  GolfMajorsEntriesItem,
  GolfPlayer,
  Pool,
  ResponseData,
  api,
} from '@/api'
import { UnknownPlayer } from '@/assets/icons'
import {
  dateFormattingHistory,
  golfMajorsSalaryPicksCount,
  handlingMoneyValues,
  routes,
} from '@/config/constants'
import { Input, Select2 } from '@/features/ui'
import { useGolfTournamentPlayers } from '@/helpers'

import styles from './GolfMajorsSalaryPick.module.scss'

const playerSortSelectOptions = [
  { title: 'Popularity', name: 'popularity-asc' },
  { title: 'Descending popularity', name: 'popularity-desc' },
  { title: 'Player name', name: 'name-asc' },
  { title: 'Descending by player name', name: 'name-desc' },
  { title: 'Ascending by salary', name: 'salary-asc' },
  { title: 'Descending by salary', name: 'salary-desc' },
] as const

type PlayerSortType = typeof playerSortSelectOptions[number]['name']

type SortPlayers = {
  [key in PlayerSortType]: (a: GolfPlayer, b: GolfPlayer) => number
}

const sortPlayers: SortPlayers = {
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'name-desc': (a, b) => b.name.localeCompare(a.name),
  'salary-asc': (a, b) => (a.salary ?? 0) - (b.salary ?? 0),
  'salary-desc': (a, b) => (b.salary ?? 0) - (a.salary ?? 0),
  'popularity-asc': (a, b) => a.worldRank - b.worldRank,
  'popularity-desc': (a, b) => b.worldRank - a.worldRank,
}

export function GolfMajorsSalaryPick({
  poolData,
  tournamentId,
  entriesLoading,
  entry,
  isMaintenance,
  updateEntries,
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
  const router = useRouter()

  const [pickData, setPickData] = useState<GolfPlayer[]>([])
  const [tiebreakValue, setTiebreakValue] = useState('')
  const [error, setError] = useState('')
  const [sortType, setSortType] = useState<PlayerSortType>(
    playerSortSelectOptions[0].name,
  )
  const [playerSearch, setPlayerSearch] = useState('')
  const [remainingSalary, setRemainingSalary] = useState(0)

  const {
    golfTournamentPlayersData,
    golfTournamentPlayersIsLoading,
    golfTournamentPlayersDeadlinePassed: isDeadline,
  } = useGolfTournamentPlayers({
    poolId: poolData.id,
    tournamentId: Number(tournamentId),
  })

  const allPicksMade = () => pickData.length === golfMajorsSalaryPicksCount

  const handleAddPlayer = (playerId: number) => {
    if (pickData.length >= 6) return

    const foundPlayer = golfTournamentPlayersData.find((p) => p.id === playerId)

    if (foundPlayer) {
      setPickData((prev) => [...prev, foundPlayer])
      setRemainingSalary((prev) => prev - Number(foundPlayer.salary))
      setError('')
    }
  }

  const handleRemovePlayer = (playerId: number) => {
    if (!pickData.length) return

    const foundPlayerIndex = pickData.findIndex(
      (player) => player.id === playerId,
    )

    if (~foundPlayerIndex) {
      const newPickData = structuredClone(pickData)

      newPickData.splice(foundPlayerIndex, 1)
      setRemainingSalary(
        (prev) => prev + Number(pickData[foundPlayerIndex].salary),
      )
      setPickData(newPickData)
      setError('')
    }
  }

  const autoSelect = () => {
    if (entry && !pickData.length) {
      let salary = entry.remainingSalary ?? 0
      const playersCopy = structuredClone(golfTournamentPlayersData).sort(
        (a, b) => (a.salary ?? 0) - (b.salary ?? 0),
      )
      const resultPlayersData: GolfPlayer[] = []

      for (let i = 0; i < golfMajorsSalaryPicksCount; i++) {
        const randomIndex = Math.floor(Math.random() * playersCopy.length)

        if (
          playersCopy[randomIndex] &&
          (playersCopy[randomIndex].salary ?? 0) < salary
        ) {
          resultPlayersData.push(playersCopy[randomIndex])
          salary -= playersCopy[randomIndex].salary ?? 0
        } else {
          if (playersCopy.length) i--
        }

        playersCopy.splice(randomIndex, 1)
      }

      setRemainingSalary(salary)
      setPickData(resultPlayersData)
    }
  }

  const averageSalary = useMemo(
    () =>
      golfTournamentPlayersData.reduce(
        (avg, curr, _, { length }) => avg + Number(curr.salary) / length,
        0,
      ),
    [golfTournamentPlayersData],
  )

  const onSubmit = async () => {
    if (allPicksMade() && entry) {
      const generateData = () =>
        pickData.map((player) => ({ golf_player_id: player.id.toString() }))

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
            if ('message' in response.error) {
              setError(response.error.message || 'Something went wrong')
            } else if ('messages' in response.error) {
              setError(response.error.getFirstMessage())
            } else {
              setError('Something went wrong')
            }
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

  useEffect(() => {
    if (entry) {
      if (entry.golf_majors_forecasts.length === golfMajorsSalaryPicksCount) {
        setPickData(
          entry.golf_majors_forecasts.map(
            (item) => item.player as unknown as GolfPlayer,
          ),
        )
      } else {
        setPickData([])
      }

      if (entry.remainingSalary) {
        setRemainingSalary(entry.remainingSalary)
      }

      if (entry?.tiebreaker?.score) {
        setTiebreakValue(entry.tiebreaker.score.toString())
      }
    }
  }, [entry])

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError('')
      }, 3000)
    }
  }, [error])

  if (
    (!golfTournamentPlayersData.length && golfTournamentPlayersIsLoading) ||
    entriesLoading
  )
    return <div>Loading...</div>

  if (
    (!golfTournamentPlayersData.length && !golfTournamentPlayersIsLoading) ||
    (isDeadline && !isMaintenance)
  ) {
    return <NoDataSkeleton poolData={poolData} />
  }

  return (
    <div className={styles.main}>
      <div>
        <PlayerFilter
          setSortType={setSortType}
          sortType={sortType}
          setPlayerSearch={setPlayerSearch}
          playerSearch={playerSearch}
          autoSelect={autoSelect}
          autoSelectDisabled={!!pickData.length}
        />
        <Picks
          playersData={golfTournamentPlayersData}
          pickData={pickData}
          handleAddPlayer={handleAddPlayer}
          handleRemovePlayer={handleRemovePlayer}
          remainingSalary={remainingSalary}
          playerSearch={playerSearch}
          sortType={sortType}
          allPicksMade={allPicksMade()}
        />
      </div>
      <div>
        <RemainingSalary
          remainingSalary={remainingSalary}
          averageSalary={averageSalary}
        />
        <PickedRoster
          pickLimit={golfMajorsSalaryPicksCount}
          pickedPlayers={pickData}
          handleRemovePlayer={handleRemovePlayer}
        />
        <div
          className={classNames(
            styles.container,
            styles.tiebreak,
            styles.sticky,
          )}
        >
          <div>Tiebreak value:*</div>
          <div className={styles.input}>
            <Input
              value={tiebreakValue}
              onChange={setTiebreakValue}
              type="number"
            />
          </div>
        </div>
        {error && (
          <div className="alert alert-danger alert-align-center">{error}</div>
        )}
        <div>
          <button
            className={classNames('button button-blue', {
              disabled: !allPicksMade() || !Number(tiebreakValue),
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

const PlayerFilter = ({
  setSortType,
  sortType,
  setPlayerSearch,
  playerSearch,
  autoSelect,
  autoSelectDisabled,
}: {
  sortType: string
  setSortType: Dispatch<SetStateAction<PlayerSortType>>
  setPlayerSearch: Dispatch<SetStateAction<string>>
  playerSearch: string
  autoSelect: () => void
  autoSelectDisabled: boolean
}) => {
  return (
    <div className={classNames(styles.container, styles.filter)}>
      <div className={styles.inputContainer}>
        <Input
          type="search"
          onChange={setPlayerSearch}
          value={playerSearch}
          placeholder="Search by Golfer"
        />
      </div>
      <Select2
        options={playerSortSelectOptions}
        onChange={setSortType as unknown as Dispatch<SetStateAction<string>>}
        value={sortType}
      />
      <div className={styles.buttonContainer}>
        <button
          className={classNames('button button-blue-outline', {
            disabled: autoSelectDisabled,
          })}
          onClick={autoSelect}
        >
          Auto select
        </button>
      </div>
    </div>
  )
}

const Picks = ({
  playersData,
  pickData,
  handleAddPlayer,
  handleRemovePlayer,
  remainingSalary,
  playerSearch,
  sortType,
  allPicksMade,
}: {
  playersData: GolfPlayer[]
  handleAddPlayer: (playerId: number) => void
  handleRemovePlayer: (playerId: number) => void
  pickData: GolfPlayer[]
  remainingSalary: number
  playerSearch: string
  sortType: PlayerSortType
  allPicksMade: boolean
}) => {
  const [leftPlayers, rightPlayers] = useMemo(() => {
    const filteredPlayers = playersData.filter((player) =>
      player.name.includes(playerSearch),
    )
    filteredPlayers.sort(sortPlayers[sortType])

    let leftPlayers = filteredPlayers
    let rightPlayers: GolfPlayer[] = []

    if (filteredPlayers.length > 20) {
      leftPlayers = filteredPlayers.slice(0, filteredPlayers.length / 2)
      rightPlayers = filteredPlayers.slice(filteredPlayers.length / 2)
    }

    return [leftPlayers, rightPlayers]
  }, [playerSearch, playersData, sortType])

  return (
    <div className={styles.picks}>
      <div>
        {leftPlayers.map((player) => (
          <PickItem
            player={player}
            key={player.id}
            selected={pickData.some((p) => p.id === player.id)}
            handleAddPlayer={handleAddPlayer}
            handleRemovePlayer={handleRemovePlayer}
            isDisabled={Number(player.salary) > remainingSalary || allPicksMade}
          />
        ))}
      </div>
      {rightPlayers.length ? (
        <div>
          {rightPlayers.map((player) => (
            <PickItem
              player={player}
              key={player.id}
              selected={pickData.some((p) => p.id === player.id)}
              handleAddPlayer={handleAddPlayer}
              handleRemovePlayer={handleRemovePlayer}
              isDisabled={
                Number(player.salary) > remainingSalary || allPicksMade
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

const PickItem = ({
  player,
  selected,
  handleAddPlayer,
  handleRemovePlayer,
  isDisabled,
}: {
  player: GolfPlayer
  selected?: boolean
  handleAddPlayer: (playerId: number) => void
  handleRemovePlayer: (playerId: number) => void
  isDisabled: boolean
}) => {
  return (
    <div
      className={classNames(styles.pickItem, {
        [styles.disabled]: !player.active || player.isWD,
        [styles.selected]: selected,
        [styles.noMoney]: isDisabled && !selected,
      })}
      onClick={() => {
        if (!selected) {
          handleAddPlayer(player.id)
        } else {
          handleRemovePlayer(player.id)
        }
      }}
    >
      <div className={styles.rank}>({player.worldRank})</div>
      <div className={styles.name}>{player.name}</div>
      <div className={styles.salary}>
        ${handlingMoneyValues(player.salary?.toString(), ',')}
      </div>
    </div>
  )
}

const RemainingSalary = ({
  remainingSalary,
  averageSalary,
}: {
  remainingSalary: number
  averageSalary: number
}) => {
  return (
    <div className={classNames(styles.container, styles.salaryContainer)}>
      <div>
        <div className={styles.remaining}>
          ${handlingMoneyValues(remainingSalary?.toString(), ',')}
        </div>
        <div>Remaining Salary</div>
      </div>
      <div>
        <div className={styles.avg}>
          ${handlingMoneyValues(averageSalary?.toString(), ',')}
        </div>
        <div>Avg Rm./Player</div>
      </div>
    </div>
  )
}

const PickedRoster = ({
  pickedPlayers,
  pickLimit,
  handleRemovePlayer,
}: {
  pickedPlayers: GolfPlayer[]
  pickLimit: number
  handleRemovePlayer: (playerId: number) => void
}) => {
  const fullPlayersArray = useMemo(() => {
    const additionalArrayLength = pickLimit - pickedPlayers.length

    if (additionalArrayLength) {
      const additionalArray = Array.from<GolfPlayer | null>({
        length: additionalArrayLength,
      }).fill(null)

      return [...pickedPlayers, ...additionalArray]
    }

    return pickedPlayers
  }, [pickLimit, pickedPlayers])

  return (
    <div className={classNames(styles.roster, styles.container)}>
      <div className={styles.title}>
        Your Roster {pickedPlayers.length}/{pickLimit}
      </div>
      {fullPlayersArray.map((player, index) =>
        player ? (
          <div className={styles.card} key={player.id}>
            <div className={styles.cardInfo}>
              <Image
                src={player.image}
                width={60}
                height={80}
                alt={player.name}
              />
              <div className={styles.cardName}>
                <div>
                  <div>{player.firstName}</div>
                  <div>{player.lastName}</div>
                </div>
                <div className={styles.rank}>
                  World rank: <span>{player.worldRank}</span>
                </div>
              </div>
            </div>
            <div className={styles.cardSalary}>
              ${handlingMoneyValues(player.salary?.toString(), ',')}
            </div>
            <div
              className={styles.close}
              onClick={() => handleRemovePlayer(player.id)}
            >
              &#10005;
            </div>
          </div>
        ) : (
          <div key={index} className={styles.emptyCard}>
            <UnknownPlayer />
            <div>Choose a player</div>
          </div>
        ),
      )}
    </div>
  )
}

const NoDataSkeleton = ({ poolData }: { poolData: Pool<'golf_majors'> }) => (
  <div className={styles.main}>
    <div className={styles.skeleton}>
      <div className={styles.sk}>
        <div>
          {poolData.pick_pool.next_golf_tournament.name} field will not be
          finalized until the World Golf Rankings are released the morning of{' '}
          {dateFormattingHistory({
            text: poolData.pick_pool.next_golf_tournament.finish_date.toString(),
          })}
        </div>
        <div>
          You will not be able to enter your picks for the{' '}
          {poolData.pick_pool.next_golf_tournament.name} until the field is
          finalized and entered into our system.
        </div>
      </div>
    </div>
    <div>
      <div
        className={classNames(
          styles.container,
          styles.salaryContainer,
          styles.disabled,
        )}
      >
        <div>
          <div className={styles.remaining}>???</div>
          <div>Remaining Salary</div>
        </div>
        <div>
          <div className={styles.avg}>???</div>
          <div>Avg Rm./Player</div>
        </div>
      </div>
      <div className={classNames(styles.roster, styles.container)}>
        <div className={styles.title}>Your Roster</div>
        {Array.from({ length: golfMajorsSalaryPicksCount }).map((_, index) => (
          <div key={index} className={styles.emptyCard}>
            <UnknownPlayer />
            <div>Choose a player</div>
          </div>
        ))}
      </div>
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
