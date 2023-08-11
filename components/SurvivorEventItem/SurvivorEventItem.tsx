import classNames from 'classnames'
import Image from 'next/image'
import { Dispatch, SetStateAction } from 'react'

import { SetForecastsDataForecastItem, SurvivorEntriesItem, Event } from '@/api'
import { SmallRightArrow, SmallRound } from '@/assets/icons'
import {
  getHourAndMinute,
  months,
  generateParticipantImagePath,
} from '@/config/constants'

import styles from './SurvivorEventItem.module.scss'

type SelectedForecasts = Pick<
  SetForecastsDataForecastItem,
  'participant_id' | 'event_id'
>

type EventItemProps = {
  item: Event
  index: number
  active: number[]
  isDoublePick: boolean
  entry: SurvivorEntriesItem
  currentWeek: number
  setActive?: Dispatch<SetStateAction<EventItemProps['active']>>
  setSelectedForecasts?: Dispatch<SetStateAction<SelectedForecasts[]>>
  isHighlightInactive?: boolean
  isEditMode?: boolean
}

export function SurvivorEventItem({
  item,
  index,
  active,
  isDoublePick,
  entry,
  setActive,
  setSelectedForecasts,
  currentWeek,
  // добавлять ли неактивным командам прозрачность
  isHighlightInactive = true,
  isEditMode = false,
}: EventItemProps) {
  const startDate = new Date(item.start_date)

  const gameDate = `${getHourAndMinute(item.start_date)} ${
    months[startDate.getUTCMonth()]
  } ${startDate.getUTCDate()}`

  const isActiveParticipant = item.participants.reduce((acc, item) => {
    if (active.includes(item.id)) return true
    return acc
  }, false)

  const isDeadline = isEditMode ? false : item.deadline_passed

  return (
    <div key={item.id} className={styles.eventItem}>
      <p className={styles.eventTitle}>
        Game #{index + 1}, {gameDate}
      </p>

      {item.participants.map((participiant) => {
        const src = generateParticipantImagePath(participiant.external_id)
        const forecast = entry.survivor_forecasts.find(
          (forecast) => forecast.participant_id === participiant.id,
        )

        const fullName = [participiant?.city, participiant?.name]
          ?.join(' ')
          .trim()

        return (
          <div
            key={participiant.id}
            className={classNames(styles.participiantWrapper, {
              [styles.participiantActive]: active.includes(participiant.id),
              [styles.participiantInactive]:
                (isActiveParticipant && !active.includes(participiant.id)) ||
                isDeadline ||
                (!isEditMode &&
                  (forecast?.status === 'win' || forecast?.status === 'lost')),
              [styles.participiantPicked]:
                !!forecast && forecast.week_number !== currentWeek,
              [styles.participiantDeadline]: !isEditMode && isDeadline,
              [styles.participiantWin]:
                !isEditMode &&
                forecast?.week_number === currentWeek &&
                forecast?.status === 'win',
              [styles.participiantLost]:
                !isEditMode &&
                forecast?.week_number === currentWeek &&
                forecast?.status === 'lost',
              [styles.notHighlight]: !isHighlightInactive,
            })}
            onClick={() => {
              if (setActive && setSelectedForecasts) {
                if (active.includes(participiant.id)) {
                  setActive(active.filter((id) => id !== participiant.id))
                  setSelectedForecasts((prev) =>
                    prev.filter(
                      (forecast) => forecast.participant_id !== participiant.id,
                    ),
                  )
                } else if (isDoublePick) {
                  if (active.length !== 2) {
                    setActive([...active, participiant.id])
                    setSelectedForecasts((prev) => [
                      ...prev,
                      { event_id: item.id, participant_id: participiant.id },
                    ])
                  }
                } else {
                  setActive([participiant.id])
                  setSelectedForecasts([
                    { event_id: item.id, participant_id: participiant.id },
                  ])
                }
              }
            }}
          >
            <p className={styles.pivotType}>{participiant.pivot?.type}</p>
            <div>
              {!!src && (
                <Image src={src} width={60} height={60} alt={fullName} />
              )}
            </div>
            <p className={styles.participiantName}>{fullName}</p>
            {!!forecast && forecast.week_number !== currentWeek && (
              <div className={styles.pickedInWeek}>
                <p>Picked in week {forecast.week_number}</p>
              </div>
            )}

            {!!forecast &&
              !!forecast.is_auto_pick &&
              forecast.week_number === currentWeek && (
                <div className={styles.autoPick}>
                  <SmallRightArrow />
                </div>
              )}

            {!!forecast &&
              !!forecast.is_mulligan &&
              forecast.week_number === currentWeek && (
                <div className={styles.mulligan}>
                  <SmallRound />
                </div>
              )}
          </div>
        )
      })}
    </div>
  )
}
