import classNames from 'classnames'
import { useRouter } from 'next/router'
import { Fragment, useState, useMemo, useEffect, useRef } from 'react'

import { PlayoffOverviewTabsT, TournamentPlayoffResultsStage } from '@/api'
import { dateFormattingEvent, playoffOverviewTabs } from '@/config/constants'
import { OverviewResultsEvent } from '@/features/components'
import { BigTabs } from '@/features/components/BigTabs'
import { useGetTournamentResultsPlayoff, usePool } from '@/helpers'

import styles from './PlayoffResults.module.scss'
import { SuperBowlEvent } from './SuperBowlEvent'

export function PlayoffResults() {
  const [iteration, setIteration] = useState(0)

  const [activeTab, setActiveTab] = useState<PlayoffOverviewTabsT | 'whole'>(
    playoffOverviewTabs[0].value,
  )

  const total: { title: string; value: 'whole' } = {
    title: 'whole playoff',
    value: 'whole',
  }

  const {
    query: { poolId },
  } = useRouter()

  const { poolData } = usePool(Number(poolId))

  const results = useRef<HTMLDivElement>(null)

  const {
    tournamentPlayoffResultsStages,
    tournamentPlayoffResultsScopes,
    tournamentPlayoffResultsIsLoading,
  } = useGetTournamentResultsPlayoff(poolData?.tournament_id)

  const currentEvent: TournamentPlayoffResultsStage | undefined | 'all' =
    activeTab === 'whole'
      ? 'all'
      : tournamentPlayoffResultsStages?.[activeTab] ?? undefined

  const allEvents = useMemo(
    () =>
      tournamentPlayoffResultsStages
        ? Object.values(tournamentPlayoffResultsStages)
        : [],
    [tournamentPlayoffResultsStages],
  )

  const allMergedEvents = useMemo(() => mergeObjects(allEvents), [allEvents])

  function mergeObjects(arr: TournamentPlayoffResultsStage[]) {
    const mergedObj: TournamentPlayoffResultsStage = {}
    arr.forEach((obj) => {
      for (const key in obj) {
        if (mergedObj[key]) {
          mergedObj[key] = [...mergedObj[key], ...obj[key]]
        } else {
          mergedObj[key] = obj[key]
        }
      }
    })
    return mergedObj
  }

  function debounce(func: () => void, delay: number) {
    let timeoutId: NodeJS.Timeout
    return function () {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(() => {
        func()
      }, delay)
    }
  }

  function checkPosition() {
    const screenHeight = window.innerHeight

    const resultsTop = results.current && results.current.offsetTop
    const resultsHeight = results.current && results.current.clientHeight

    const scrolled = window.scrollY

    const threshold = Number(resultsTop) + Number(resultsHeight) - screenHeight
    const currentPosition = scrolled + screenHeight

    if (results.current && currentPosition >= threshold) {
      if (Object.entries(allMergedEvents).length > iteration)
        setIteration((prev) => ++prev)
    }
  }

  useEffect(() => {
    const debounceFunc = debounce(checkPosition, 100)
    window.addEventListener('scroll', debounceFunc)
    window.addEventListener('resize', debounceFunc)

    return () => {
      window.removeEventListener('scroll', debounceFunc)
      window.removeEventListener('resize', debounceFunc)
    }
  }, [])

  function addFunc() {
    setIteration(0)
  }

  return (
    <div ref={results}>
      <BigTabs
        tabs={playoffOverviewTabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalTab={total}
        onClickAddFunction={addFunc}
      />
      {!tournamentPlayoffResultsIsLoading ? (
        !!tournamentPlayoffResultsStages && currentEvent === 'all' ? (
          !!allMergedEvents &&
          Object.keys(allMergedEvents).map((date, i) => {
            if (i <= iteration)
              return (
                <Fragment key={date}>
                  <EventInfo
                    date={date}
                    activeTab={activeTab}
                    currentEvent={allMergedEvents}
                  />
                  <div className={classNames(styles.results)}>
                    {allMergedEvents[date].map((event, j) => {
                      return (
                        <OverviewResultsEvent
                          key={j}
                          event={event}
                          length={allMergedEvents[date].length}
                          index={j}
                          tournamentResultsScopes={
                            tournamentPlayoffResultsScopes
                          }
                        />
                      )
                    })}
                  </div>
                </Fragment>
              )
          })
        ) : currentEvent && currentEvent !== 'all' ? (
          Object.keys(currentEvent).map((date, i) => (
            <div key={i}>
              <EventInfo
                date={date}
                activeTab={activeTab}
                currentEvent={currentEvent}
              />
              <div
                className={classNames(styles.results, {
                  [styles.full]: activeTab == 'Super Bowl',
                })}
              >
                {currentEvent[date].map((event) => {
                  return (
                    <Fragment key={event.id}>
                      {activeTab !== 'Super Bowl' ? (
                        <OverviewResultsEvent
                          event={event}
                          length={currentEvent[date].length}
                          index={i}
                          tournamentResultsScopes={
                            tournamentPlayoffResultsScopes
                          }
                        />
                      ) : (
                        tournamentPlayoffResultsScopes && (
                          <SuperBowlEvent
                            event={event}
                            tournamentResultsScopes={
                              tournamentPlayoffResultsScopes
                            }
                          />
                        )
                      )}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>
            <p>
              there are no games at this stage <span>:(</span>
            </p>
          </div>
        )
      ) : (
        <div className={styles.noData}>
          <p>Loading...</p>
        </div>
      )}
    </div>
  )
}

function EventInfo({
  date,
  activeTab,
  currentEvent,
}: {
  date: string
  activeTab: PlayoffOverviewTabsT | 'whole'
  currentEvent: TournamentPlayoffResultsStage
}) {
  return (
    <div className={styles.eventInfo}>
      <p className={styles.eventInfoText}>{dateFormattingEvent(date)}</p>
      <p className={styles.eventInfoText}>
        {activeTab == 'Super Bowl'
          ? 'Super bowl game'
          : `${currentEvent[date].length} games`}
      </p>
    </div>
  )
}
