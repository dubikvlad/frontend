import classNames from 'classnames'
import Image from 'next/image'
import { Dispatch, SetStateAction } from 'react'

import {
  EntriesItem,
  Event,
  PickemPickPool,
  SetForecastsDataForecastItem,
} from '@/api'
import { generateParticipantImagePath } from '@/config/constants'
import { Checkbox, Select } from '@/features/ui'
import { Option } from '@/features/ui/SelectWithSearch'

import styles from './MakePickTeam.module.scss'

type MakePickTeamProps = {
  selectedParticipants: { [key: number]: SetForecastsDataForecastItem }
  setSelectedParticipants: Dispatch<
    SetStateAction<MakePickTeamProps['selectedParticipants'] | null>
  >
  selectedEntry: EntriesItem
  isCompleted: boolean
  event: Event
  poolType: PickemPickPool['type']
  bestBetCheckboxsIsDisabled: boolean
  confidentPointsIsDisabled: boolean
  confidentPointsOptions: Option[]
  isEditMode: boolean
}

export function MakePickTeam({
  selectedParticipants,
  setSelectedParticipants,
  selectedEntry,
  isCompleted,
  event,
  poolType = 'standard',
  bestBetCheckboxsIsDisabled,
  confidentPointsIsDisabled,
  confidentPointsOptions,
  isEditMode = false,
}: MakePickTeamProps) {
  const eventId = event.id
  const eventParticipants = event.participants
  const deadlinePassed = isEditMode ? false : event.deadline_passed
  const pickemForecasts = selectedEntry.pickem_forecasts

  const selectedParticipant: SetForecastsDataForecastItem | undefined =
    selectedParticipants[eventId]

  function changeBestBetValue(newValue: boolean) {
    if (selectedParticipant) {
      setSelectedParticipants((prev) => {
        if (!prev?.[eventId]) return prev

        return {
          ...prev,
          [eventId]: { ...prev[eventId], is_best_bet: newValue },
        }
      })
    }
  }

  function changeConfidentPointsValue(newValue: string) {
    if (selectedParticipant) {
      setSelectedParticipants((prev) => {
        if (!prev?.[eventId]) return prev

        return {
          ...prev,
          [eventId]: { ...prev[eventId], confident_points: +newValue },
        }
      })
    }
  }

  function addOrRemoveSelectedParticipant(participantId: number) {
    function addSelectedParticipant() {
      setSelectedParticipants((prev) => ({
        ...prev,
        [eventId]: {
          participant_id: participantId,
          event_id: eventId,
          ...(poolType === 'best_bets' ? { is_best_bet: false } : undefined),
          ...(poolType === 'confident_points'
            ? { confident_points: 0 }
            : undefined),
        },
      }))
    }

    if (selectedParticipant) {
      if (selectedParticipant.participant_id === participantId) {
        const selectedParticipantsCopy: typeof selectedParticipants =
          JSON.parse(JSON.stringify(selectedParticipants))

        if (selectedParticipantsCopy[eventId])
          delete selectedParticipantsCopy[eventId]

        setSelectedParticipants(selectedParticipantsCopy)
      } else {
        addSelectedParticipant()
      }
    } else {
      addSelectedParticipant()
    }
  }

  // пики рассчитаны
  const isPicksCalculated = !!pickemForecasts.find(
    (item) => item.event_id === eventId && item.status !== 'none',
  )

  return (
    <div className={styles.row}>
      <div className={styles.participantsWrapper}>
        {eventParticipants.map((participant) => {
          const imageSrc = generateParticipantImagePath(participant.external_id)
          const participantObj = pickemForecasts.find(
            (item) => item.participant.id === participant.id,
          )

          const participantFullName = [participant?.city, participant?.name]
            ?.join(' ')
            .trim()

          const itemIsActive =
            (!isEditMode &&
              selectedParticipant?.participant_id === participant.id &&
              !isCompleted &&
              !deadlinePassed &&
              !isPicksCalculated) ||
            (isEditMode &&
              selectedParticipant?.participant_id === participant.id)

          const itemIsDisabled =
            (isCompleted || deadlinePassed || isPicksCalculated) && !isEditMode

          const itemIsWin =
            (!isEditMode && participantObj?.status === 'win') ||
            (isEditMode && false)

          const itemIsLost =
            (!isEditMode && participantObj?.status === 'lost') ||
            (isEditMode && false)

          // результат еще не известен, добавляется серый фон
          const itemIsDeadline =
            deadlinePassed && !isPicksCalculated && !isCompleted

          return (
            <div
              className={classNames(styles.item, {
                [styles.active]: itemIsActive,
                [styles.disabled]: itemIsDisabled,
                [styles.win]: itemIsWin,
                [styles.lost]: itemIsLost,
                [styles.deadline]: itemIsDeadline,
              })}
              onClick={() => {
                addOrRemoveSelectedParticipant(participant.id)
              }}
              key={participant.id}
            >
              <div className={styles.vertical}>{participant?.pivot?.type}</div>
              <div className={styles.title}>{participantFullName}</div>
              <div className={styles.imgWrapper}>
                <Image
                  src={imageSrc}
                  alt={participantFullName}
                  width={64}
                  height={64}
                  className={styles.img}
                />
              </div>
            </div>
          )
        })}
      </div>

      {poolType === 'best_bets' && (
        <div
          className={classNames(styles.bestBetWrapper, {
            [styles.bestBetDisabled]:
              !selectedParticipant ||
              (bestBetCheckboxsIsDisabled &&
                !selectedParticipant?.is_best_bet) ||
              deadlinePassed ||
              isPicksCalculated,
          })}
        >
          <Checkbox
            value={!!selectedParticipant?.is_best_bet}
            onChange={() =>
              changeBestBetValue(!selectedParticipant?.is_best_bet)
            }
            className={styles.bestBetCheckbox}
          >
            Best Bet
          </Checkbox>
        </div>
      )}

      {poolType === 'confident_points' && (
        <div
          className={classNames(styles.confidentPointsWrapper, {
            [styles.confidentPointsDisabled]:
              !selectedParticipant ||
              (confidentPointsIsDisabled &&
                !selectedParticipant?.confident_points) ||
              deadlinePassed ||
              isPicksCalculated,
          })}
        >
          <p className={styles.pointsText}>Points</p>

          <Select
            value={
              selectedParticipant?.confident_points !== undefined
                ? String(selectedParticipant?.confident_points)
                : confidentPointsOptions[0].name
            }
            onChange={(value) => changeConfidentPointsValue(value)}
            options={confidentPointsOptions}
            wrapperClassName={styles.selectWrapper}
            placeholder="None"
            isBold
          />
        </div>
      )}
    </div>
  )
}
