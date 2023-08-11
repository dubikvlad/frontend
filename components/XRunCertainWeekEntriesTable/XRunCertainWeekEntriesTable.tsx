import classNames from 'classnames'
import Image from 'next/image'

import { XRunEntryWithReducedForecast } from '@/api'
import {
  generateParticipantImagePath,
  getUserInitials,
} from '@/config/constants'
import { Select } from '@/features/ui'
import type { Option } from '@/features/ui/Select/Select'

import styles from './XRunCertainWeekEntriesTable.module.scss'

export const XRunCertainWeekEntriesTable = ({
  entries,
  loading,
  teams,
  weekNumber,
  differentAssignment = false,
  onChangeTeam,
  currentWeek,
}: {
  entries: XRunEntryWithReducedForecast[]
  loading: boolean
  teams: Option[]
  weekNumber: number
  differentAssignment?: boolean
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
  currentWeek?: number
}) => {
  if (!entries.length && !loading) return <div>No data..</div>

  if (loading) return <div>Loading...</div>

  return (
    <div className={styles.container}>
      <div className={styles.entriesTable}>
        <div className={classNames(styles.thead, styles.row)}>
          <div></div>
          <div>Entry Name</div>
          <div>Member Name</div>
          <div></div>
          <div>MLB Team</div>
        </div>
        {entries.map((e) => (
          <EntryRow
            key={e.id}
            entry={e}
            teams={teams}
            handleChangeEntryTeam={onChangeTeam}
            weekNumber={weekNumber}
            differentAssignment={differentAssignment}
            currentWeek={currentWeek}
          />
        ))}
      </div>
    </div>
  )
}

const EntryRow = ({
  entry,
  teams,
  handleChangeEntryTeam,
  weekNumber,
  differentAssignment,
  currentWeek,
}: {
  entry: XRunEntryWithReducedForecast
  teams: Option[]
  handleChangeEntryTeam: ({
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
  weekNumber: number
  differentAssignment: boolean
  currentWeek?: number
}) => {
  const initials = getUserInitials(
    entry.user.first_name + ' ' + entry.user.last_name,
  )

  const entryForecast = differentAssignment
    ? entry.xrun_forecasts.find((f) => f.week_number === weekNumber)
    : entry.xrun_forecasts.find((f) => f.week_number === currentWeek)

  const participantImage = generateParticipantImagePath(
    entryForecast ? entryForecast.participant.external_id : '',
  )

  return (
    <div key={entry.id} className={classNames(styles.container, styles.row)}>
      <div>
        <div className={styles.initials}>{initials}</div>
      </div>
      <div>{entry.name}</div>
      <div>
        {entry.user.first_name} {entry.user.last_name}
      </div>
      <div>
        {entryForecast ? (
          <Image
            src={participantImage}
            alt={entryForecast.participant.name}
            width={30}
            height={30}
          />
        ) : (
          <></>
        )}
      </div>
      <div>
        <div className={styles.selectWrapper}>
          <Select
            options={teams}
            onChange={(value) =>
              handleChangeEntryTeam({
                entryId: entry.id,
                teamId: Number(value),
                weekNumber: weekNumber,
              })
            }
            value={entryForecast ? entryForecast.participant_id.toString() : ''}
          />
        </div>
      </div>
    </div>
  )
}
