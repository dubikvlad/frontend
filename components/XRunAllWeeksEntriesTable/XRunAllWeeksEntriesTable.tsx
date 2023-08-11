import classNames from 'classnames'
import Image from 'next/image'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { KeyedMutator } from 'swr'

import {
  api,
  EntriesPoolEntriesData,
  Pool,
  ResponseData,
  User,
  XRunEntriesItem,
  XRunForecast,
} from '@/api'
import { Pencil } from '@/assets/icons'
import {
  generateParticipantImagePath,
  getUserInitials,
} from '@/config/constants'
import { Select2, TableSwiper } from '@/features/ui'
import type { Option } from '@/features/ui/Select/Select'
import { useGetPoolUsers } from '@/helpers'

import styles from './XRunAllWeeksEntriesTable.module.scss'

export function XRunAllWeeksEntriesTable({
  entries,
  poolData,
  setEntryToEdit,
  setSelectedWeek,
  updateEntries,
}: {
  entries?: XRunEntriesItem[]
  poolData: Pool<'xrun'>
  setEntryToEdit: Dispatch<SetStateAction<number | null>>
  setSelectedWeek: Dispatch<SetStateAction<string>>
  updateEntries: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'xrun'>
  > | null>
}) {
  const [forecastIndices, setForecastIndices] = useState({ first: 0, last: 7 })

  const { poolUsersData, poolUsersLoading } = useGetPoolUsers(poolData?.id)

  const tableSwiperData = poolData.available_week.map((week, index) => (
    <div
      className={styles.weekNumber}
      key={index}
      onClick={() => setSelectedWeek(week.toString())}
    >
      <div>{week}</div>
      <div>Edit</div>
    </div>
  ))

  if (!entries?.length) return <></>

  return (
    <div className={classNames(styles.container, styles.entriesTable)}>
      <div className={styles.row}>
        <div>Entry Name</div>
        <TableSwiper
          items={tableSwiperData}
          itemsCount={8}
          itemIndices={forecastIndices}
          setItemIndices={setForecastIndices}
        />
      </div>
      <div>
        {entries.map((e, idx) => (
          <EntryRow
            entry={e}
            key={idx}
            setEntryToEdit={setEntryToEdit}
            availableWeeks={poolData.available_week}
            indices={forecastIndices}
          />
        ))}
      </div>
      <AddNewEntry
        loading={poolUsersLoading}
        users={poolUsersData}
        poolId={poolData.id}
        updateEntries={updateEntries}
      />
    </div>
  )
}

const EntryRow = ({
  entry,
  setEntryToEdit,
  availableWeeks,
  indices,
}: {
  entry: XRunEntriesItem
  setEntryToEdit: Dispatch<SetStateAction<number | null>>
  availableWeeks: number[]
  indices: { first: number; last: number }
}) => {
  const fullUserName = `${entry.user.first_name} ${entry.user.last_name}`

  const userInitials = getUserInitials(fullUserName)

  const forecasts = availableWeeks
    .map((w) => entry.xrun_forecasts.find((f) => f.week_number === w) || null)
    .slice(indices.first, indices.last + 1)

  return (
    <div className={classNames(styles.row, styles.entry)}>
      <div className={styles.info}>
        <div className={styles.initials}>{userInitials}</div>
        <div className={styles.name}>
          <div className={styles.nickname}>
            <div>{entry.name}</div>
            <div onClick={() => setEntryToEdit(entry.id)}>
              <Pencil />
            </div>
          </div>
          <div className={styles.fullName}>{fullUserName}</div>
        </div>
      </div>
      <div className={styles.pickedTeams}>
        {forecasts.map((fcst, index) => (
          <TeamForecast key={index} forecast={fcst} />
        ))}
      </div>
    </div>
  )
}

const TeamForecast = ({ forecast }: { forecast: XRunForecast | null }) => {
  if (!forecast) {
    return <div className={styles.team}>No team</div>
  }

  const teamInitials = getUserInitials(forecast.participant.name)

  const participantImage = generateParticipantImagePath(
    forecast.participant.external_id,
  )

  return (
    <div className={styles.team}>
      <div className={styles.logo}>
        <Image
          alt={forecast.participant.name}
          src={participantImage}
          height={30}
          width={30}
        />
      </div>
      <div>{teamInitials}</div>
    </div>
  )
}

const AddNewEntry = ({
  users,
  loading,
  poolId,
  updateEntries,
}: {
  users: User[]
  loading: boolean
  poolId: number
  updateEntries: KeyedMutator<ResponseData<
    EntriesPoolEntriesData<'xrun'>
  > | null>
}) => {
  const [showSelect, setShowSelect] = useState(false)
  const [addEntryLoading, setAddEntryLoading] = useState(false)
  const [error, setError] = useState('')

  const userData: Option[] = [
    { name: '0', title: 'Select user' },
    ...users.map((u) => ({
      name: u.id.toString(),
      title: `${u.first_name} ${u.last_name}`,
    })),
  ]

  const handleAddNewEntry = (userId: string) => {
    const foundUser = users.find((u) => u.id.toString() === userId)

    if (foundUser) {
      setAddEntryLoading(true)
      const newEntryName = `${foundUser.first_name} ${foundUser.last_name} entry`

      api.entries
        .create(poolId, { name: newEntryName, user_id: foundUser.id })
        .then(() => {
          updateEntries()
        })
        .catch((e) => {
          setError(e.message)
        })
        .finally(() => {
          setAddEntryLoading(false), setShowSelect(false)
        })
    }
  }

  if (loading || addEntryLoading) return <div>Loading...</div>

  return (
    <div className={classNames(styles.container, styles.newEntry)}>
      {showSelect && (
        <div>
          <Select2
            value="0"
            onChange={(value) => handleAddNewEntry(value)}
            options={userData}
          />
        </div>
      )}
      <div>
        {showSelect ? (
          <div
            className="button button-red-outline"
            onClick={() => setShowSelect(false)}
          >
            Cancel
          </div>
        ) : (
          <div
            className="button button-blue-outline"
            onClick={() => setShowSelect(true)}
          >
            Add another entry
          </div>
        )}
      </div>
      {error && <div>{error}</div>}
    </div>
  )
}
