import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

import { Pool, Event, CreditsEntriesItem, api } from '@/api'
import { Info } from '@/assets/icons'
import {
  dateFormattingEvent,
  generateParticipantImagePath,
  handlingDeadline,
  writeErrorToState,
} from '@/config/constants'
import { useOpenModal } from '@/contexts'
import { UserAndEntrySelects } from '@/features/components'
import { POOL_MODAL_TYPES } from '@/features/modals'
import { Input, SelectWithSearch } from '@/features/ui'
import {
  useGetPoolEntries,
  useGetPoolEvents,
  useGetUserInfo,
  useMessage,
} from '@/helpers'

import styles from './CreditsMakePickPage.module.scss'

type SelectedParticipant = {
  event_id: number
  participant_id: number
  credit: number
}

export function CreditsMakePickPage({
  poolData,
}: {
  poolData: Pool<'credits'>
}) {
  const isPoolNotStart =
    +poolData.pick_pool.start_week > poolData.pick_pool.current_week

  const {
    query: { isMaintenance },
  } = useRouter()

  const { openModal } = useOpenModal()

  const { userInfoData } = useGetUserInfo()

  const isCommissioner = poolData.is_commissioner

  // переменная нужна для работы функционала
  // member pick maintenance
  const isEditMode =
    !!isMaintenance && Number(isMaintenance) === 1 && isCommissioner

  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)

  const availableWeekIndex = poolData.available_week.indexOf(
    +poolData.pick_pool.current_week,
  )

  const availableWeeks = poolData.available_week
    .slice(0, availableWeekIndex + 1)
    .map((week) => ({
      title: `Week ${week}`,
      name: String(week),
    }))

  useEffect(() => {
    if (selectedWeek === null && availableWeeks.length && poolData) {
      const selectedOption = availableWeeks.find(
        (week) => week.name === String(poolData.pick_pool.current_week),
      )

      setSelectedWeek(selectedOption?.name ?? availableWeeks[0].name)
    }
  }, [selectedWeek, availableWeeks, poolData])

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedUserId === null && userInfoData)
      setSelectedUserId(String(userInfoData.id))
  }, [selectedUserId, userInfoData])

  const { poolEntriesData, poolEntriesMutate } = useGetPoolEntries<'credits'>({
    poolId: isPoolNotStart ? undefined : poolData.id,
    userId: selectedUserId ? Number(selectedUserId) : undefined,
  })

  const { poolEventsEvents } = useGetPoolEvents({
    poolId: isPoolNotStart ? undefined : poolData.id,
    weekNumber: selectedWeek ? Number(selectedWeek) : undefined,
    withSpreads: true,
  })

  const [selectedEntry, setSelectedEntry] = useState<CreditsEntriesItem | null>(
    null,
  )

  useEffect(() => {
    setSelectedEntry(null)
  }, [selectedUserId])

  useEffect(() => {
    if (selectedEntry === null && poolEntriesData.length) {
      setSelectedEntry(poolEntriesData[0])
    }
  }, [selectedEntry, poolEntriesData])

  const [eventsArr, setEventsArr] = useState<[string, Event[]][]>([])

  useEffect(() => {
    if (poolEventsEvents) {
      setEventsArr(Object.entries(poolEventsEvents))
    }
  }, [poolEventsEvents])

  const [selectedParticipants, setSelectedParticipants] = useState<{
    [key: string]: SelectedParticipant
  } | null>(null)

  useEffect(() => {
    if (selectedEntry && selectedWeek) {
      const creditsForecasts = selectedEntry.credits_forecasts.filter(
        (item) => item.week_number === Number(selectedWeek),
      )

      const forecasts = creditsForecasts.reduce<{
        [key: string]: SelectedParticipant
      } | null>((acc, forecast, i) => {
        if (i === 0) acc = {}
        if (acc !== null) {
          acc[forecast.event_id] = {
            event_id: forecast.event_id,
            participant_id: forecast.participant_id,
            credit: forecast.credits_wagered,
          }
        }
        return acc
      }, null)

      setSelectedParticipants(forecasts)
    } else setSelectedParticipants(null)
  }, [selectedEntry, selectedWeek])

  const pendingCredits = +(selectedEntry?.pending_credits ?? 0)
  const totalCredits = selectedEntry?.total_credits ?? 0
  const availableCredits = selectedEntry?.available_credits ?? 0

  const currentPendingCredits = selectedEntry
    ? selectedEntry.credits_forecasts
        .filter((item) => item.week_number === Number(selectedWeek))
        .reduce((acc, item) => (acc += item.credits_wagered), 0)
    : 0

  const newCurrentPendingCredits = selectedParticipants
    ? Object.entries(selectedParticipants).reduce(
        (acc, item) => (acc += item[1].credit),
        0,
      )
    : currentPendingCredits

  const currentPendingCreditsDiff =
    currentPendingCredits - newCurrentPendingCredits

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
    if (!selectedWeek || !selectedParticipants || !selectedEntry) return

    try {
      setIsLoading(true)

      const forecasts = Object.values(selectedParticipants)

      if (forecasts.some((item) => !item.credit)) {
        setError(
          'The minimum amount of credits for a game must be 1 or greater.',
        )
        setIsLoading(false)
        return
      }

      const res = await (isEditMode
        ? api.forecasts.putForecasts
        : api.forecasts.setForecasts)(poolData.id, selectedEntry.id, {
        forecasts: Object.values(selectedParticipants),
        week_number: Number(selectedWeek),
      })

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
    }
  }

  const currentAvailableCredits =
    Number(availableCredits) + currentPendingCreditsDiff

  const eventDeadline = handlingDeadline(poolData.pick_pool.pick_deadline)

  const eventsArrWithoutDate = eventsArr.reduce<Event[]>(
    (acc, item) => [...acc, ...item[1]],
    [],
  )

  const isForecastsCalculated = eventsArrWithoutDate.every(
    (item) => item.status === 'finished',
  )

  return (
    <div className={styles.wrapper}>
      <h1>
        Make a credit pick <Info />
      </h1>

      {isPoolNotStart ? (
        <p className={styles.poolNotStart}>
          The pool starts from <span>Week {poolData.pick_pool.start_week}</span>
          . The current <span>Week {poolData.pick_pool.current_week}</span>,
          wait for the pool to start and enjoy it
        </p>
      ) : (
        <>
          <p className={styles.descriptionText}>
            Submit your picks below by picking a team to win and entering the
            amount of credits to wager (note: credits do NOT reset each week so
            if you lose all of your credits you are done)
          </p>

          <div className={styles.creditsWrapper}>
            <div className={styles.creditsInfo}>
              <div className={styles.creditsInfoWrapper}>
                <div className={styles.availableCreditsWrapper}>
                  <p
                    className={classNames({
                      [styles.availableCreditsZero]: !currentAvailableCredits,
                    })}
                  >
                    {!selectedEntry ? '-' : currentAvailableCredits}
                  </p>
                  <p>Available Credits</p>
                </div>

                <div className={styles.totalAndPendingCreditsWrapper}>
                  <div>
                    <p>{!selectedEntry ? '-' : totalCredits}</p>
                    <p>Total Credits</p>
                  </div>

                  <div>
                    <p>
                      {!selectedEntry
                        ? '-'
                        : pendingCredits - currentPendingCreditsDiff}
                    </p>
                    <p>Pending</p>
                  </div>
                </div>
              </div>

              <div className={styles.deadlineWrapper}>
                <p className={styles.deadlineTitle}>
                  Week {poolData.pick_pool.current_week} Deadline
                </p>
                <p className={styles.deadlineTime}>{eventDeadline}</p>
              </div>
            </div>

            <div className={styles.makePickWrapper}>
              <div className={styles.filterWrapper}>
                <SelectWithSearch
                  value={selectedWeek}
                  onChange={(value) => {
                    setSelectedWeek(value)
                    setSelectedParticipants(null)
                  }}
                  options={availableWeeks}
                  placeholder="Week"
                  isDisabled={!selectedEntry}
                />

                <UserAndEntrySelects
                  entriesData={poolEntriesData}
                  poolData={poolData}
                  setSelectedEntry={setSelectedEntry}
                  mutateEntries={poolEntriesMutate}
                />
              </div>

              {!!error && (
                <div ref={alertRef} className="alert alert-danger">
                  {error}
                </div>
              )}

              {!!selectedEntry &&
              !!selectedWeek &&
              !selectedEntry.credits_forecasts.some(
                (item) => item.week_number === +selectedWeek,
              ) &&
              isForecastsCalculated &&
              !isEditMode ? (
                <div className={styles.noPicked}>
                  You don&apos;t seem to have picked at{' '}
                  <span>Week {selectedWeek}</span>. Try to choose another week.
                </div>
              ) : (
                !!eventsArr.length && (
                  <>
                    <div className={styles.eventsWrapper}>
                      {eventsArr.map(([date, events]) => (
                        <div className={styles.eventWrapper} key={date}>
                          <p>{dateFormattingEvent(date)}</p>
                          {events.map((event) => (
                            <EventItem
                              key={event.id}
                              event={event}
                              selectedEntry={selectedEntry}
                              selectedParticipants={selectedParticipants}
                              setSelectedParticipants={setSelectedParticipants}
                              availableCredits={currentAvailableCredits}
                              isEditMode={isEditMode}
                              isEventDeadline={eventDeadline === 'PASSED'}
                            />
                          ))}
                        </div>
                      ))}
                    </div>

                    {(eventDeadline !== 'PASSED' || isEditMode) && (
                      <div
                        className={classNames(styles.buttonsWrapper, {
                          [styles.buttonsWrapperNoCreditsLeft]:
                            !currentAvailableCredits,
                        })}
                      >
                        <p className={styles.noCreditsLeft}>
                          You have no credits left
                        </p>

                        <button
                          className={classNames(
                            'button button-blue-light',
                            styles.submitButton,
                            { disabled: !selectedParticipants || isLoading },
                          )}
                          onClick={() => !isLoading && setForecasts()}
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

type EventItemProps = {
  event: Event
  selectedEntry: CreditsEntriesItem | null
  selectedParticipants: { [key: string]: SelectedParticipant } | null
  setSelectedParticipants: Dispatch<
    SetStateAction<EventItemProps['selectedParticipants']>
  >
  availableCredits: number
  isEditMode: boolean
  isEventDeadline: boolean
}

function EventItem({
  event,
  selectedEntry,
  selectedParticipants,
  setSelectedParticipants,
  availableCredits,
  isEditMode = false,
  isEventDeadline = false,
}: EventItemProps) {
  const selectedParticipant = selectedParticipants
    ? selectedParticipants[event.id]
    : undefined

  const [value, setValue] = useState(
    selectedParticipant ? String(selectedParticipant.credit) : '0',
  )

  const creditForecast = selectedEntry
    ? selectedEntry.credits_forecasts.find((item) => item.event_id === event.id)
    : undefined

  useEffect(() => {
    if (
      setSelectedParticipants &&
      selectedParticipant &&
      selectedParticipant.credit !== Number(value)
    ) {
      setSelectedParticipants((prev) => {
        const copyObj = { ...prev }
        copyObj[event.id].credit = Number(value)
        return copyObj
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    setValue(!selectedParticipant ? '0' : String(selectedParticipant.credit))
  }, [selectedParticipant])

  function changeSelectedParticipants(participantId: number) {
    if (!selectedParticipant) {
      setSelectedParticipants((prev) => ({
        ...prev,
        [event.id]: {
          event_id: event.id,
          participant_id: participantId,
          credit: Number(value),
        },
      }))
      return
    }

    const copyObj = { ...selectedParticipants }
    delete copyObj[event.id]

    if (selectedParticipant.participant_id !== participantId) {
      copyObj[event.id] = {
        event_id: event.id,
        participant_id: participantId,
        credit: Number(value),
      }
    }

    const isObjectEmpty = Object.keys(copyObj).length == 0

    setSelectedParticipants(isObjectEmpty ? null : copyObj)
  }

  const isInputContainerDisabled = !selectedParticipant && availableCredits

  const isDeadlinePassed = isEditMode
    ? false
    : event.deadline_passed || isEventDeadline

  const isEventItemResultKnown = event.status === 'finished' && !isEditMode

  return (
    <div
      className={classNames(styles.eventItem, {
        [styles.eventItemDisabled]:
          !availableCredits &&
          !Number(value) &&
          !selectedParticipant &&
          !isDeadlinePassed,
        [styles.eventItemResultKnown]: isEventItemResultKnown,
      })}
    >
      {event.participants.map((participant, participantIndex) => {
        const imgSrc = generateParticipantImagePath(participant.external_id)

        const eventSpread = event.spreads?.[0]
        const eventSpreadCoefficient = eventSpread
          ? Number.isInteger(eventSpread.spread)
            ? eventSpread.spread.toFixed(1)
            : eventSpread.spread
          : undefined

        return (
          <div
            key={participant.id}
            className={classNames(styles.participant, {
              [styles.participantReverse]: participantIndex % 2 !== 0,
              [styles.participantActive]:
                participant.id === selectedParticipant?.participant_id,
              [styles.participantDeadlinePassed]:
                isDeadlinePassed && !isEventItemResultKnown,
              [styles.participantWin]:
                creditForecast &&
                creditForecast.participant_id === participant.id &&
                creditForecast.status === 'win' &&
                !isEditMode,
              [styles.participantLost]:
                creditForecast &&
                creditForecast.participant_id === participant.id &&
                creditForecast.status === 'lost' &&
                !isEditMode,
            })}
            onClick={() => changeSelectedParticipants(participant.id)}
          >
            <p className={styles.participantType}>{participant.pivot?.type}</p>

            <div className={styles.participantNameWrapper}>
              <p className={styles.participantName}>{participant.name}</p>
              {participant.type_by_spread && eventSpread && (
                <p className={styles.coefficient}>
                  {participant.type_by_spread === 'underdog'
                    ? 'Underdog'
                    : `Favorite (${eventSpreadCoefficient})`}
                </p>
              )}
            </div>

            <div className={styles.participantImage}>
              {!!imgSrc && (
                <Image
                  src={imgSrc}
                  width={64}
                  height={64}
                  alt={participant.name}
                />
              )}
            </div>
          </div>
        )
      })}

      <div
        className={classNames(styles.inputContainer, {
          [styles.inputContainerDisabled]:
            isInputContainerDisabled || isDeadlinePassed,
        })}
      >
        <Input
          type="number"
          value={value}
          onChange={(newValue) => {
            if (!isInputContainerDisabled && !isDeadlinePassed) {
              setValue(
                Number(newValue.trim()) && selectedEntry
                  ? Number(newValue) > availableCredits + Number(value)
                    ? String(availableCredits + Number(value))
                    : newValue
                  : '0',
              )
            }
          }}
          className={styles.inputWrapper}
          textAlign="center"
          readOnly={!!(isInputContainerDisabled || isDeadlinePassed)}
        />
      </div>
    </div>
  )
}
