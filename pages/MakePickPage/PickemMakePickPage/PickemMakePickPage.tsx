import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import {
  api,
  EntriesItem,
  Pool,
  SetForecastsDataForecastItem,
  Event,
} from '@/api'
import { Info } from '@/assets/icons'
import { createEntry, writeErrorToState } from '@/config/constants'
import { useOpenModal } from '@/contexts'
import {
  FilterByWeek,
  MakePickTeamWrapper,
  UserAndEntrySelects,
} from '@/features/components'
import { POOL_MODAL_TYPES } from '@/features/modals'
import { Input } from '@/features/ui'
import { Option } from '@/features/ui/SelectWithSearch'
import {
  useGetPoolEntries,
  useGetUser,
  useGetPoolEvents,
  useMessage,
} from '@/helpers'

import styles from './PickemMakePickPage.module.scss'

export function PickemMakePickPage({ poolData }: { poolData: Pool }) {
  const {
    query: { poolId, week_number, entry_id, isMaintenance, user_id },
  } = useRouter()

  const { userData } = useGetUser()

  const { openModal } = useOpenModal()

  // переменная нужна для работы функционала
  // member pick maintenance
  const isEditMode =
    isMaintenance && userData
      ? Number(isMaintenance) === 1
        ? poolData.owner.id === userData.id
        : false
      : false

  const userId = isEditMode && user_id ? Number(user_id) : userData?.id

  const [selectedWeek, setSelectedWeek] = useState<number | null>(
    !isNaN(Number(week_number)) ? Number(week_number) : null,
  )

  useEffect(() => {
    if (!!poolData && selectedWeek === null)
      setSelectedWeek(poolData.pick_pool.current_week)
  }, [poolData, selectedWeek])

  const { poolEntriesData, poolEntriesIsLoading, poolEntriesMutate } =
    useGetPoolEntries({
      poolId: Number(poolId),
      weekNumber: selectedWeek !== null ? selectedWeek : undefined,
      userId,
    })

  const [selectedEntry, setSelectedEntry] = useState<EntriesItem | null>(null)

  useEffect(() => {
    if (poolEntriesData.length && selectedEntry === null) {
      const entryId = !!entry_id && !isNaN(Number(entry_id)) ? +entry_id : null

      const selectedEntry = entryId
        ? poolEntriesData.find((entry) => entry.id === entryId) ??
          poolEntriesData[0]
        : poolEntriesData[0]
      setSelectedEntry(selectedEntry)
    }
  }, [entry_id, poolEntriesData, selectedEntry])

  const { poolEventsEvents, poolEventsTiebreakerInfo } = useGetPoolEvents({
    poolId: Number(poolId),
    weekNumber: selectedWeek,
  })

  const numberOfEvents = Object.values(poolEventsEvents ?? {}).reduce(
    (acc, item) => (acc += item.length),
    0,
  )

  type SelectedParticipants = { [key: number]: SetForecastsDataForecastItem }

  const [selectedParticipants, setSelectedParticipants] =
    useState<SelectedParticipants | null>(null)

  useEffect(() => {
    if (selectedEntry && poolData && poolEventsEvents && selectedWeek) {
      const pickemForecast = selectedEntry.pickem_forecasts
      const actualEvents = pickemForecast.length
        ? Object.entries(poolEventsEvents).reduce<Event[]>(
            (arr, eventItem) => arr.concat(eventItem[1]),
            [],
          )
        : []

      const newParticipants = pickemForecast.reduce<SelectedParticipants>(
        (acc, item) => {
          const checkEvent = actualEvents.find(
            (event) => event.id === item.event_id,
          )

          if (checkEvent)
            acc[item.event_id] = {
              participant_id: item.participant.id,
              event_id: item.event_id,
              ...(poolData.pick_pool.type === 'best_bets'
                ? { is_best_bet: Boolean(item.is_best_bet) }
                : undefined),
              ...(poolData.pick_pool.type === 'confident_points'
                ? { confident_points: item.confident_points }
                : undefined),
            }

          return acc
        },
        {},
      )
      setSelectedParticipants(newParticipants)
    }
  }, [selectedEntry, poolData, poolEventsEvents, selectedWeek])

  const [tiebreakScore, setTiebreakScore] = useState<number>(0)
  const [tiebreakError, setTiebreakError] = useState<string>()

  const tiebreakRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useMessage()

  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (error && alertRef.current) {
      const coords = alertRef.current.getBoundingClientRect()
      window.scrollTo({
        left: 0,
        top: coords.top + window.scrollY - coords.height - 20,
      })
    }
  }, [error, alertRef])

  async function setForecasts() {
    if (
      !selectedEntry ||
      !poolEventsTiebreakerInfo ||
      !selectedWeek ||
      !poolData
    )
      return

    if (tiebreakScore < 0) {
      setTiebreakError('')
      if (tiebreakRef.current) tiebreakRef.current.focus()
      return
    } else {
      setTiebreakError(undefined)
    }

    try {
      setIsLoading(true)

      const res = await (isEditMode
        ? api.forecasts.putForecasts
        : api.forecasts.setForecasts)(poolData.id, selectedEntry.id, {
        forecasts: Object.values(selectedParticipants ?? {}),
        tiebreaker: {
          tiebreaker_score: tiebreakScore,
          event_id: poolEventsTiebreakerInfo.event.id,
          tiebreaker_id: poolEventsTiebreakerInfo.tiebreaker.id,
        },
        week_number: selectedWeek,
      })

      if (res.error) {
        writeErrorToState(res.error, setError)

        poolEntriesMutate()
        setIsLoading(false)
        return
      }

      poolEntriesMutate()
      setIsLoading(false)
      openModal({ type: POOL_MODAL_TYPES.MAKE_A_PICK_SUCCESS })
    } catch (err) {
      setIsLoading(false)
      writeErrorToState(err, setError)
    }
  }

  useEffect(() => {
    setTiebreakScore(selectedEntry?.pickem_tiebreaker?.[0]?.score ?? 0)
  }, [selectedEntry, selectedWeek])

  const [newEntryName, setNewEntryName] = useState<string>('Entry #1')
  const [createEntryIsLoading, setCreateEntryIsLoading] = useState(false)

  if (!poolData || !selectedWeek) return null

  const tiebreakerText =
    poolEventsTiebreakerInfo?.tiebreaker?.formatted_description
  const tiebreakerDeadlinePassed = isEditMode
    ? false
    : !!poolEventsTiebreakerInfo?.event?.deadline_passed

  // неделя уже прошла
  const isCompleted = isEditMode
    ? false
    : selectedWeek < poolData.pick_pool.current_week

  const numberBetsPick = Number(poolData.pick_pool.number_of_bets_pick)

  const numberActiveBets = Object.values(selectedParticipants ?? {}).reduce(
    (acc, item) => {
      if (item.is_best_bet) acc += 1
      return acc
    },
    0,
  )

  const numberConfidentPoints = Object.values(poolEventsEvents ?? {}).reduce(
    (acc, item) => (acc += item.length),
    0,
  )

  const confidentPointsIsDisabled =
    numberConfidentPoints ===
    Object.values(selectedParticipants ?? {}).reduce((acc, item) => {
      if (item.confident_points) acc += 1
      return acc
    }, 0)

  const confidentPointsOptions: Option[] = new Array(
    (numberConfidentPoints ?? 0) + 1,
  )
    .fill(0)
    .map((_: number, i) => ({
      title: i === 0 ? 'None' : String(i),
      name: String(i),
      isDisabled:
        i === 0
          ? false
          : !!Object.values(selectedParticipants ?? {})
              .map((item) => item.confident_points)
              .find((item) => item === i),
    }))

  const calculatedForecasts = selectedEntry
    ? selectedEntry.pickem_forecasts.filter((item) => item.status !== 'none')
    : []
  console.log('selectedParticipants:', selectedParticipants)

  return (
    <div>
      <h1 className={styles.title}>
        Make a pick{' '}
        <div className={styles.infoWrapper}>
          <Info />
          <div className={styles.instruction}>
            <p className={styles.instructionText}>Instruction</p>
            <p>
              Pick a teams you think will win <span>before the deadline</span>
            </p>
            <p>
              You must click the <span>Submit button</span> for your picks to be
              saved
            </p>
            <p>
              Enter the number of goals scored in the{' '}
              <span>&quot;Tiebreak&quot;</span>
              column to score extra points
            </p>
          </div>
        </div>
      </h1>

      <p className={styles.text}>
        Please read the instructions above before submitting an entry.
      </p>

      <div className={styles.wrapper}>
        <div>
          <FilterByWeek
            tournamentId={poolData.tournament_id}
            selectedWeek={selectedWeek}
            setSelectedWeek={setSelectedWeek}
            currentWeek={poolData.pick_pool.current_week}
          />
        </div>

        <div className={styles.makePickTeamWrapper}>
          {poolEntriesData.length ? (
            <>
              <UserAndEntrySelects
                entriesData={poolEntriesData}
                poolData={poolData}
                setSelectedEntry={setSelectedEntry}
                mutateEntries={poolEntriesMutate}
              />

              {!!error && (
                <div ref={alertRef} className="alert alert-danger">
                  {error}
                </div>
              )}

              {!!poolEventsEvents &&
                !!selectedEntry &&
                !!poolEventsTiebreakerInfo &&
                (selectedWeek < poolData.pick_pool.current_week &&
                !calculatedForecasts.length &&
                !isEditMode ? (
                  <div className={styles.noPicked}>
                    You don&apos;t seem to have picked at{' '}
                    <span>Week {selectedWeek}</span>. Try to choose another
                    week.
                  </div>
                ) : (
                  <>
                    {Object.entries(poolEventsEvents).map(([date, data]) => (
                      <MakePickTeamWrapper
                        key={date}
                        date={date}
                        data={data}
                        selectedParticipants={selectedParticipants}
                        setSelectedParticipants={setSelectedParticipants}
                        selectedEntry={selectedEntry}
                        isCompleted={isCompleted}
                        poolType={poolData.pick_pool.type}
                        bestBetCheckboxsIsDisabled={
                          numberBetsPick === numberActiveBets
                        }
                        confidentPointsIsDisabled={confidentPointsIsDisabled}
                        confidentPointsOptions={confidentPointsOptions}
                        isEditMode={isEditMode}
                      />
                    ))}

                    <div className={styles.tiebreakWrapper}>
                      <p>
                        Tiebreak
                        {!!tiebreakerText && <span> ({tiebreakerText})</span>}:
                      </p>
                      <Input
                        inputRef={tiebreakRef}
                        type="number"
                        value={String(tiebreakScore)}
                        onChange={(value) => setTiebreakScore(Number(value))}
                        textAlign="center"
                        isDisabled={isCompleted || tiebreakerDeadlinePassed}
                        error={tiebreakError}
                        isErrorSign={false}
                        isValueBold
                      />
                    </div>

                    {poolData.pick_pool.type === 'best_bets' &&
                      numberBetsPick > 0 &&
                      !(isCompleted || tiebreakerDeadlinePassed) && (
                        <p className={styles.bestBetsLeft}>
                          Best Bets Left:{' '}
                          <span>{numberBetsPick - numberActiveBets}</span>
                        </p>
                      )}

                    <button
                      className={classNames(
                        'button',
                        'button-blue-light',
                        styles.submitBtn,
                        {
                          [styles.hide]:
                            isCompleted || tiebreakerDeadlinePassed,
                          [styles.bestBetType]:
                            poolData.pick_pool.type === 'best_bets',
                          disabled:
                            isLoading ||
                            !numberOfEvents ||
                            Object.keys(selectedParticipants ?? {}).length !==
                              numberOfEvents ||
                            (poolData.pick_pool.type === 'confident_points' &&
                              !confidentPointsIsDisabled),
                        },
                      )}
                      onClick={setForecasts}
                    >
                      Submit
                    </button>
                  </>
                ))}
            </>
          ) : (
            !poolEntriesData.length &&
            !poolEntriesIsLoading && (
              <div className={styles.firstEntryWrapper}>
                <p>Name your first entry</p>

                <div className={styles.inputWrapper}>
                  <Input
                    value={newEntryName}
                    onChange={setNewEntryName}
                    placeholder="Entry name"
                    className={styles.input}
                  />

                  <button
                    className={classNames('button button-blue-light', {
                      disabled: createEntryIsLoading,
                    })}
                    onClick={() =>
                      createEntry({
                        poolData,
                        userData,
                        poolEntriesData,
                        setCreateEntryIsLoading,
                        mutateArray: [poolEntriesMutate],
                        setError,
                        createEntryIsLoading,
                        customNewEntryName: newEntryName,
                      })
                    }
                  >
                    Create a New Entry
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
