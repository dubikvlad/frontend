import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { CreditsEntriesItem, Pool, UserResponseData, Event } from '@/api'
import { Pencil, TrendingDown, TrendingUp } from '@/assets/icons'
import {
  dateFormattingEvent,
  deleteEntry,
  generateParticipantImagePath,
  handlingDeadline,
  months,
  renameEntry,
  routes,
  scrollToElement,
} from '@/config/constants'
import { CreateEntryBlock } from '@/features/components/CreateEntryBlock'
import { Select2 } from '@/features/ui'
import {
  useGetPoolEntries,
  useGetPoolEvents,
  useGetPoolUsers,
  useGetTournamentsWeeks,
  useMessage,
} from '@/helpers'

import styles from './CreditsManageEntriesMyPicks.module.scss'

export function CreditsManageEntriesMyPicks({
  poolData,
  userData,
}: {
  poolData: Pool<'credits'>
  userData: UserResponseData
}) {
  const isCommissioner = poolData.user_id === userData.id

  const { poolUsersData } = useGetPoolUsers(
    isCommissioner ? poolData.id : undefined,
  )

  const [selectedWeek, setSelectedWeek] = useState<number>(
    poolData.pick_pool.current_week,
  )

  const [memberNameId, setMemberNameId] = useState(String(userData.id))
  const [entryId, setEntryId] = useState('')

  useEffect(() => {
    setEntryId('')
  }, [memberNameId])

  const { poolEventsEvents } = useGetPoolEvents({
    poolId: poolData.id,
    weekNumber: selectedWeek ? Number(selectedWeek) : undefined,
    withSpreads: true,
  })

  const { poolEntriesData, poolEntriesIsLoading, poolEntriesMutate } =
    useGetPoolEntries<'credits'>({
      poolId: poolData.id,
      weekNumber: selectedWeek,
      userId: !memberNameId.trim() ? userData.id : Number(memberNameId),
    })

  useEffect(() => {
    if (!entryId.trim() && poolEntriesData.length) {
      setEntryId(String(poolEntriesData[0].id))
    }
  }, [entryId, poolEntriesData])

  const selectedEntry = entryId
    ? poolEntriesData.find((item) => item.id === +entryId)
    : undefined

  const memberNameOptions = poolUsersData.map((item) => ({
    title: item.username,
    name: String(item.id),
  }))

  const entriesOptions = poolEntriesData.map((item) => ({
    title: item.name,
    name: String(item.id),
  }))

  const eventsArr = poolEventsEvents ? Object.entries(poolEventsEvents) : []

  const info = (selectedEntry?.credits_forecasts ?? []).reduce(
    (acc, item) => {
      if (item.status === 'win') acc.win += item.credits_won
      if (item.status === 'lost') acc.lost += item.credits_wagered
      if (item.status === 'none') acc.pending += item.credits_wagered

      acc.usedInWeek += item.credits_wagered
      return acc
    },
    { win: 0, lost: 0, pending: 0, usedInWeek: 0 },
  )

  const average =
    info && selectedEntry
      ? info.usedInWeek && selectedEntry.credits_forecasts.length
        ? (info.usedInWeek / selectedEntry.credits_forecasts.length).toFixed(2)
        : 0
      : 0

  const isEventDeadlinePassed =
    handlingDeadline(poolData.pick_pool.pick_deadline) === 'PASSED'

  const isCreditsForecasts = selectedEntry
    ? selectedEntry.credits_forecasts.some(
        (item) => item.week_number === selectedWeek,
      )
    : false

  const [isCreateEntryShow, setIsCreateEntryShow] = useState(false)
  const [isConfirmationDeleteEntryOpen, setIsConfirmationDeleteEntryOpen] =
    useState(false)

  const [deleteIsLoading, setDeleteIsLoading] = useState(false)
  const [nameDeletedEntry, setNameDeletedEntry] = useMessage()

  const alertRef = useRef<HTMLDivElement>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const [renameEntryName, setRenameEntryName] = useState('')

  useEffect(() => {
    if (!renameEntryName.trim() && selectedEntry) {
      setRenameEntryName(selectedEntry.name)
    }
  }, [renameEntryName, selectedEntry])

  const [isFocus, setIsFocus] = useState(false)

  const focusInput = () => {
    setIsFocus(true)
    setRenameEntryName(selectedEntry?.name ?? '')
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [isFocus])

  async function renameEntryFunc() {
    setIsFocus(false)

    if (
      selectedEntry &&
      renameEntryName.trim() &&
      selectedEntry.name.trim() !== renameEntryName.trim()
    ) {
      renameEntry({
        poolId: poolData.id,
        entryId: selectedEntry.id,
        newName: renameEntryName,
        mutateArray: [poolEntriesMutate],
      })
    }
  }

  return (
    <div className={styles.wrapper}>
      {!!nameDeletedEntry && (
        <div
          ref={alertRef}
          className={classNames('alert alert-info', styles.alertInfo)}
        >
          <p className="alert-title">Report</p>
          <p>
            Your Entry <span>{nameDeletedEntry}</span> has been successfully
            deleted
          </p>
        </div>
      )}

      <div className={styles.creditsAndWeeksWrapper}>
        <div className={styles.creditsWrapper}>
          {!!selectedEntry && (
            <div
              className={classNames(styles.entryName, {
                [styles.entryNameInputOpen]: isFocus,
              })}
              onClick={focusInput}
            >
              {isFocus ? (
                <input
                  ref={inputRef}
                  value={renameEntryName}
                  onChange={(e) => setRenameEntryName(e.target.value)}
                  onBlur={renameEntryFunc}
                  onKeyDown={(e) => e.key === 'Enter' && renameEntryFunc()}
                />
              ) : (
                <>
                  <p>{selectedEntry.name}</p>
                  <Pencil className={styles.pencil} />
                </>
              )}
            </div>
          )}

          <p className={styles.creditsValue}>
            {selectedEntry?.total_credits ?? '-'}
          </p>
          <p className={styles.ytdCredits}>YTD Credits</p>
        </div>

        <WeekList
          poolData={poolData}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
        />
      </div>

      <div>
        <div className={styles.filterWrapper}>
          {isCommissioner && (
            <Select2
              options={memberNameOptions}
              value={memberNameId}
              onChange={setMemberNameId}
              placeholder="Member Name"
            />
          )}

          <Select2
            options={entriesOptions}
            value={entryId}
            onChange={setEntryId}
            placeholder="Entry"
          />

          <div className={styles.buttonWrapper}>
            <button
              className={classNames('button', 'button-blue-outline', {
                disabled: poolEntriesIsLoading,
                [styles.createEntryButtonHide]: isCreateEntryShow,
              })}
              onClick={() => setIsCreateEntryShow(true)}
            >
              Create a New Entry
            </button>
          </div>
        </div>

        <CreateEntryBlock
          isOpen={isCreateEntryShow}
          setIsOpen={setIsCreateEntryShow}
          wrapperClassName={styles.createEntryBlock}
          customUserId={
            !!memberNameId.trim() && !isNaN(+memberNameId)
              ? +memberNameId
              : undefined
          }
          weekNumber={selectedWeek}
        />

        {selectedEntry &&
          (!selectedEntry.credits_forecasts.length && isEventDeadlinePassed ? (
            <p className={styles.noPick}>
              You have no picks this week, try another week
            </p>
          ) : (
            <div className={styles.infoWrapper}>
              <div className={styles.infoColumn}>
                <p>Used this week</p>
                <p className={styles.infoValue}>{info.usedInWeek}</p>

                <p>Pending</p>
                <p className={styles.infoValue}>{info.pending}</p>
              </div>

              <div className={styles.infoColumn}>
                <div>
                  <TrendingUp />
                  <p>Won</p>
                </div>

                <p className={styles.infoValue}>{info.win}</p>

                <div>
                  <TrendingDown />
                  <p>Lost</p>
                </div>

                <p className={styles.infoValue}>{info.lost}</p>
              </div>

              <div className={styles.infoColumn}>
                <p>Average Credits/Pick</p>
                <p className={styles.infoValue}>{average}</p>
              </div>
            </div>
          ))}

        <div className={styles.picksWrapper}>
          {!!eventsArr.length && (
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
                        isEventDisabled={
                          isEventDeadlinePassed && !isCreditsForecasts
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className={styles.buttonsWrapper}>
                <p
                  className={styles.deleteEntry}
                  onClick={() =>
                    setIsConfirmationDeleteEntryOpen((prev) => !prev)
                  }
                >
                  Delete Entry
                </p>

                <Link
                  href={routes.account.makePick.index(poolData.id, {
                    week_number: selectedWeek,
                    entry_id: +entryId,
                    user_id: userData.id,
                  })}
                  className={classNames(styles.editPicksButton, {
                    [styles.editPicksButtonDisabled]: isEventDeadlinePassed,
                  })}
                >
                  <button className="button button-blue-light">
                    Edit Picks
                  </button>
                </Link>
              </div>

              <div
                className={classNames(styles.confirmationDeleteEntry, {
                  [styles.confirmationDeleteEntryVisible]:
                    isConfirmationDeleteEntryOpen,
                })}
              >
                <p>Delete Entry?</p>
                <p
                  className={styles.deleteEntryText}
                  onClick={() => setIsConfirmationDeleteEntryOpen(false)}
                >
                  No
                </p>
                <p
                  className={styles.deleteEntryText}
                  onClick={() =>
                    !deleteIsLoading &&
                    deleteEntry({
                      poolId: poolData.id,
                      entryId: +entryId,
                      deleteEntryIsLoading: !selectedEntry || deleteIsLoading,
                      mutateArray: [poolEntriesMutate],
                      setDeleteEntryIsLoading: setDeleteIsLoading,
                      actionBeforeEntryCreation: () => {
                        if (selectedEntry)
                          setNameDeletedEntry(selectedEntry.name)
                      },
                      actionAfterEntryCreation: () => {
                        setIsConfirmationDeleteEntryOpen(false)
                        setEntryId('')
                        scrollToElement(alertRef, 80)
                      },
                    })
                  }
                >
                  Yes
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

type WeekListProps = {
  poolData: Pool<'credits'>
  selectedWeek: number
  setSelectedWeek: Dispatch<SetStateAction<number>>
}

function WeekList({ poolData, selectedWeek, setSelectedWeek }: WeekListProps) {
  const { tournamentsWeeksData } = useGetTournamentsWeeks(
    poolData.tournament_id,
  )

  const weeks = useMemo(() => {
    if (tournamentsWeeksData && poolData) {
      return Object.values(tournamentsWeeksData)
        .map(({ start_date, end_date, week_number: weekNumber }) => {
          const startDate = new Date(start_date)
          const endDate = new Date(end_date)

          const dateString = `${months[startDate.getMonth()].slice(
            0,
            3,
          )} ${startDate.getDate()} - ${months[endDate.getMonth()].slice(
            0,
            3,
          )} ${endDate.getDate()}`

          return {
            dateString,
            completed: weekNumber < poolData.pick_pool.current_week,
            weekNumber,
          }
        })
        .filter(
          (item) =>
            item.weekNumber >= Number(poolData.pick_pool.start_week) &&
            item.weekNumber <= poolData.pick_pool.current_week,
        )
    }

    return []
  }, [poolData, tournamentsWeeksData])

  return (
    <div className={styles.weeksListWrapper}>
      {weeks.map((item) => (
        <div
          key={item.weekNumber}
          className={classNames(styles.weekItem, {
            [styles.weekItemActive]: item.weekNumber === selectedWeek,
          })}
          onClick={() => setSelectedWeek(item.weekNumber)}
        >
          <p>Week {item.weekNumber}</p>
          <p>{item.completed ? 'Completed' : item.dateString}</p>
        </div>
      ))}
    </div>
  )
}

type EventItemProps = {
  event: Event
  selectedEntry: CreditsEntriesItem | undefined
  isEventDisabled: boolean
}

function EventItem({
  event,
  selectedEntry,
  isEventDisabled = false,
}: EventItemProps) {
  const creditForecast = selectedEntry
    ? selectedEntry.credits_forecasts.find((item) => item.event_id === event.id)
    : undefined

  return (
    <div className={styles.eventItem}>
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
                participant.id === creditForecast?.participant_id,
              [styles.participantWin]:
                creditForecast &&
                creditForecast.participant_id === participant.id &&
                creditForecast.status === 'win',
              [styles.participantLost]:
                creditForecast &&
                creditForecast.participant_id === participant.id &&
                creditForecast.status === 'lost',
              [styles.participantDisabled]: isEventDisabled,
            })}
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

      <div className={styles.creditsWageredWrapper}>
        {creditForecast ? (
          <>
            {creditForecast.status === 'win' && (
              <p className={styles.creditWin}>+{creditForecast.credits_won}</p>
            )}

            {creditForecast.status === 'lost' && (
              <p className={styles.creditsWagered}>
                -{creditForecast.credits_wagered}
              </p>
            )}

            {creditForecast.status === 'none' && (
              <p className={styles.creditPending}>
                <span className={styles.creditPendingValue}>
                  {creditForecast.credits_wagered}
                </span>
                <span className={styles.creditPendingText}>pending</span>
              </p>
            )}
          </>
        ) : (
          <p
            className={classNames(styles.noCreditsWagered, {
              [styles.noCreditsWageredDisabled]: isEventDisabled,
            })}
          >
            0
          </p>
        )}
      </div>
    </div>
  )
}
