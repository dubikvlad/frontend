import Image from 'next/image'
import React, { Dispatch, SetStateAction } from 'react'

import { Participant, Pool, XRunEntryWithReducedForecast } from '@/api'
import { MonthLeftArrow, Pencil } from '@/assets/icons'
import {
  generateParticipantImagePath,
  getUserInitials,
} from '@/config/constants'
import { Select } from '@/features/ui'
import { Option } from '@/features/ui/Select2/Select2'

import styles from './XRunTeamAssignmentEditEntry.module.scss'

export function XRunTeamAssignmentEditEntry({
  entry,
  teamOptions,
  poolData,
  setEntryToEdit,
  onChangeTeam,
}: {
  entry: XRunEntryWithReducedForecast
  teamOptions: Option[]
  poolData: Pool<'xrun'>
  setEntryToEdit: Dispatch<SetStateAction<number | null>>
  onChangeTeam: ({
    weekNumber,
    entryId,
    teamId,
    random,
  }: {
    weekNumber?: number | undefined
    entryId?: number | undefined
    teamId?: number | undefined
    random?: boolean | undefined
  }) => Promise<void>
}) {
  const fullUserName = `${entry.user.first_name} ${entry.user.last_name}`

  const userInitials = getUserInitials(fullUserName)

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div>
          <div className={styles.info}>
            <div className={styles.initials}>{userInitials}</div>
            <div className={styles.name}>
              <div className={styles.nickname}>
                <div>{entry.name}</div>
                <div>
                  <Pencil />
                </div>
              </div>
              <div className={styles.fullName}>{fullUserName}</div>
            </div>
          </div>
          <div className={styles.return} onClick={() => setEntryToEdit(null)}>
            <MonthLeftArrow />
            Return to member list
          </div>
        </div>
        <div className={styles.teamRowsContainer}>
          {poolData.available_week.map((w, index) => {
            const participant =
              entry.xrun_forecasts.find((f) => f.week_number === w)
                ?.participant || null

            return (
              <TeamSelect
                participant={participant}
                teamOptions={teamOptions}
                weekNumber={w}
                key={index}
                entryId={entry.id}
                handleChangeTeam={onChangeTeam}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

const TeamSelect = ({
  participant,
  weekNumber,
  teamOptions,
  handleChangeTeam,
  entryId,
}: {
  participant: Participant | null
  weekNumber: number
  teamOptions: Option[]
  handleChangeTeam: ({
    weekNumber,
    entryId,
    teamId,
    random,
  }: {
    weekNumber?: number | undefined
    entryId?: number | undefined
    teamId?: number | undefined
    random?: boolean | undefined
  }) => Promise<void>
  entryId: number
}) => {
  const teamImage = generateParticipantImagePath(participant?.external_id || '')

  return (
    <div className={styles.teamRow}>
      <div>Week {weekNumber}</div>
      <div>
        {participant ? (
          <Image
            height={30}
            width={30}
            src={teamImage}
            alt={participant.name}
          />
        ) : (
          <></>
        )}
      </div>
      <div className={styles.selectContainer}>
        <Select
          onChange={(value) =>
            handleChangeTeam({
              entryId: entryId,
              teamId: Number(value),
              weekNumber: weekNumber,
            })
          }
          options={teamOptions}
          value={participant ? participant.id.toString() : ''}
        />
      </div>
    </div>
  )
}
