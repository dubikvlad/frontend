import classNames from 'classnames'
import Image from 'next/image'
import { Dispatch, SetStateAction } from 'react'

import { SetForecastsDataForecastItem, Event, MarginEntriesItem } from '@/api'
import { SmallRightArrow } from '@/assets/icons'
import {
  getHourAndMinute,
  months,
  generateParticipantImagePath,
} from '@/config/constants'

import styles from './MarginEventItem.module.scss'

type SelectedForecasts = Pick<
  SetForecastsDataForecastItem,
  'participant_id' | 'event_id'
>

type EventItemProps = {
  item: Event
  index: number
  active: number[]
  isDoublePick: boolean
  entry: MarginEntriesItem
  currentWeek: number
  setActive?: Dispatch<SetStateAction<EventItemProps['active']>>
  setSelectedForecasts?: Dispatch<SetStateAction<SelectedForecasts[]>>
  isHighlightInactive?: boolean
  isEditMode?: boolean
}

export function MarginEventItem({
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
      {item.participants.map((participant) => {
        const src = generateParticipantImagePath(participant.external_id)
        const forecast = entry.margin_forecasts.find(
          (forecast) => forecast.participant_id === participant.id,
        )
        const fullName = [participant?.city, participant?.name]
          ?.join(' ')
          .trim()

        const resultPoint = () => {
          if (!isEditMode && forecast) {
            if (forecast.week_number === currentWeek) {
              if (forecast.status === 'win') {
                return (
                  <p className={classNames(styles.resultPoints, styles.win)}>
                    +{forecast.points}
                  </p>
                )
              }
              if (forecast.status === 'lost') {
                return (
                  <p className={classNames(styles.resultPoints, styles.lost)}>
                    {forecast.points}
                  </p>
                )
              }
              return null
            }
          }
        }

        return (
          <div
            key={participant.id}
            className={classNames(styles.participiantWrapper, {
              [styles.participiantActive]: active.includes(participant.id),
              [styles.participiantInactive]:
                (isActiveParticipant && !active.includes(participant.id)) ||
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
                if (active.includes(participant.id)) {
                  setActive(active.filter((id) => id !== participant.id))
                  setSelectedForecasts((prev) =>
                    prev.filter(
                      (forecast) => forecast.participant_id !== participant.id,
                    ),
                  )
                } else if (isDoublePick) {
                  if (active.length !== 2) {
                    setActive([...active, participant.id])
                    setSelectedForecasts((prev) => [
                      ...prev,
                      { event_id: item.id, participant_id: participant.id },
                    ])
                  }
                } else {
                  setActive([participant.id])
                  setSelectedForecasts([
                    { event_id: item.id, participant_id: participant.id },
                  ])
                }
              }
            }}
          >
            <p className={styles.pivotType}>{participant.pivot?.type}</p>
            <div>
              {!!src && (
                <Image src={src} width={60} height={60} alt={fullName} />
              )}
            </div>
            <p className={styles.participiantName}>{fullName}</p>

            {resultPoint()}

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
          </div>
        )
      })}
    </div>
  )
}
