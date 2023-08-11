import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'

import { PlayoffScheduleEvents } from '@/api'
import {
  dateFormattingEvent,
  generateParticipantImagePath,
  getHourAndMinute,
  playoffOverviewTabs,
} from '@/config/constants'
import { BigTabs } from '@/features/components/BigTabs'
import { useGetTournamentSchedulePlayoff, usePool } from '@/helpers'

import styles from './PlayoffSchedule.module.scss'

export function PlayoffSchedule() {
  const [activeTab, setActiveTab] = useState(playoffOverviewTabs[0].value)

  const {
    query: { poolId },
  } = useRouter()
  const { poolData } = usePool<'playoff'>(Number(poolId))

  const { playoffScheduleEvents } = useGetTournamentSchedulePlayoff(
    poolData?.tournament_id,
  )

  const currentEvent: PlayoffScheduleEvents | undefined =
    playoffScheduleEvents?.[activeTab] ?? undefined

  return (
    <div>
      {playoffScheduleEvents && (
        <>
          <BigTabs
            tabs={playoffOverviewTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <div>
            {currentEvent && Object.keys(currentEvent).length ? (
              Object.keys(currentEvent).map((date) => {
                return (
                  <div key={date} className={styles.event}>
                    <div className={styles.eventInfo}>
                      <p className={styles.eventInfoText}>
                        {dateFormattingEvent(date)}
                      </p>
                      <p className={styles.eventInfoText}>
                        {currentEvent[date].length} games
                      </p>
                    </div>
                    <div className={styles.games}>
                      {currentEvent[date].map((data) => (
                        <div key={data.id} className={styles.game}>
                          {getHourAndMinute(String(data.start_date))}
                          <div className={styles.participants}>
                            {data.participants.map((participant, i) => {
                              return (
                                <Fragment key={participant.id}>
                                  <div
                                    className={classNames(styles.participant, {
                                      [styles.reverse]: i === 1,
                                    })}
                                  >
                                    {participant.name}
                                    <Image
                                      src={generateParticipantImagePath(
                                        participant.external_id,
                                      )}
                                      width={60}
                                      height={60}
                                      alt=""
                                    />
                                  </div>
                                  {i === 0 && (
                                    <div className={styles.separator}>@</div>
                                  )}
                                </Fragment>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className={styles.noData}>
                <p>
                  Schedule will be available <b>after the end</b> of the
                  previous playoff stage
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
