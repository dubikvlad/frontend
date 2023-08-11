import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useState } from 'react'

import type { Event } from '@/api'
import {
  OverviewResultsEvent,
  HorizontalFilterByWeek3Desc,
} from '@/features/components'
import {
  useGetTournamentResults,
  usePool,
  stringifyMonth,
  stringifyDay,
  useGetTournamentsWeeks,
} from '@/helpers'

import styles from './DefaultResults.module.scss'

export function DefaultResults() {
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>(
    undefined,
  )

  const [activeDate, setActiveDate] = useState<0 | Date | undefined | null>(
    null,
  )

  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const { tournamentsWeeksData } = useGetTournamentsWeeks(
    Number(poolData?.tournament_id),
  )

  const isMLB = poolData?.sport_id === 7

  const selectedWeekData = selectedWeek && tournamentsWeeksData?.[selectedWeek]

  const { tournamentResultsEvents, tournamentResultsScopes } =
    useGetTournamentResults(poolData?.tournament_id, selectedWeek)

  const filteredEvents: Array<{ date: string; events: Event[] }> = []

  if (tournamentResultsEvents) {
    Object.keys(tournamentResultsEvents)
      .sort()
      .forEach((element) => {
        filteredEvents.push({
          date: element,
          events: tournamentResultsEvents[element],
        })
      })
  }

  function returnDay(date: Date) {
    return stringifyDay({
      day: date.getUTCDay(),
    })
  }

  function returnMonth(date: Date) {
    return stringifyMonth({
      month: date.getUTCMonth(),
      isFull: true,
    })
  }

  function hasActiveDateInFilteredEvenrtsDates() {
    return filteredEvents.some((event) => {
      const date = new Date(event.date)

      if (
        activeDate === null ||
        (activeDate &&
          activeDate.getUTCDay() === date.getUTCDay() &&
          activeDate.getUTCMonth() === date.getUTCMonth())
      ) {
        return true
      } else return false
    })
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.filter}>
        <HorizontalFilterByWeek3Desc setSelectedWeek={setSelectedWeek} />

        {selectedWeek ? (
          <>
            <div className={styles.weekSeparator}></div>
            <div className={styles.weeksData}>
              <div
                className={classNames(styles.weeksTitle, {
                  [styles.active]: activeDate === null,
                })}
                onClick={() => setActiveDate(null)}
              >
                Whole week
              </div>
              {[...Array(7)].map((l, i) => {
                const startDate =
                  selectedWeekData && new Date(selectedWeekData.start_date)

                startDate && startDate.setDate(startDate.getUTCDate() + i)

                return (
                  <div
                    key={i}
                    className={classNames(styles.weekDay, {
                      [styles.active]:
                        activeDate &&
                        startDate &&
                        activeDate.getUTCDay() === startDate.getUTCDay() &&
                        activeDate.getUTCMonth() === startDate.getUTCMonth(),
                    })}
                    onClick={() => setActiveDate(startDate)}
                  >
                    <div className={styles.day}>
                      {startDate &&
                        stringifyDay({ day: startDate.getUTCDay() })}
                    </div>
                    <div>
                      {startDate &&
                        stringifyMonth({ month: startDate.getUTCMonth() })}
                      , {startDate && startDate.getUTCDate()}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="not-found">Results are not yet available</div>
        )}
      </div>

      {selectedWeek ? (
        !!filteredEvents.length && hasActiveDateInFilteredEvenrtsDates() ? (
          filteredEvents.map((event, i) => {
            const date = new Date(event.date)

            if (
              activeDate === null ||
              (activeDate &&
                activeDate.getUTCDay() === date.getUTCDay() &&
                activeDate.getUTCMonth() === date.getUTCMonth())
            )
              return (
                <div className={styles.events} key={i}>
                  <div className={styles.eventsTitle}>
                    <span>
                      {`${returnDay(date)},`}
                      <span>{`${returnMonth(date)} ${date.getUTCDate()}`}</span>
                    </span>
                    <span>{event.events.length} games</span>
                  </div>
                  <div
                    className={classNames(styles.results, {
                      [styles.full]: isMLB,
                    })}
                  >
                    {event.events.map((eventData, i) => {
                      return (
                        <OverviewResultsEvent
                          event={eventData}
                          length={event.events.length}
                          index={i}
                          key={eventData.id}
                          tournamentResultsScopes={tournamentResultsScopes}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            else return null
          })
        ) : (
          <div className={styles.noData}>
            <p>
              there are no games on this day <span>:(</span>
            </p>{' '}
          </div>
        )
      ) : null}
    </div>
  )
}
