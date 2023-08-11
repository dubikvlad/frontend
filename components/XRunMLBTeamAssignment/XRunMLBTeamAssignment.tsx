import classNames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { KeyedMutator } from 'swr'

import {
  api,
  EntriesPoolEntriesData,
  Pool,
  ResponseData,
  User,
  XRunMLBEntriesItem,
} from '@/api'
import {
  generateParticipantImagePath,
  getUserInitials,
} from '@/config/constants'
import { useLoadingWindow } from '@/contexts'
import { Select, Select2, SubmitText } from '@/features/ui'
import { Option } from '@/features/ui/Select/Select'
import {
  useGetPoolEntries,
  useGetPoolUsers,
  usePool,
  useTeams,
} from '@/helpers'

import styles from './XRunMLBTeamAssignment.module.scss'

export function XRunMLBTeamAssignment() {
  const {
    query: { poolId },
  } = useRouter()

  const [selectedWeek, setSelectedWeek] = useState('0')
  const [entries, setEntries] = useState<XRunMLBEntriesItem[]>([])

  const { poolData, poolIsLoading } = usePool<'xrun_mlb'>(Number(poolId))

  const { teams } = useTeams({ poolId: poolData?.id })

  const { poolUsersData, poolUsersLoading } = useGetPoolUsers(poolData?.id)

  const { setIsLoadingShow } = useLoadingWindow()

  const { poolEntriesData, poolEntriesIsLoading, poolEntriesMutate } =
    useGetPoolEntries<'xrun_mlb'>({
      poolId: poolData?.id,
      weekNumber: Number(selectedWeek),
    })

  const removeEntryAllParticipants = async () => {
    if (poolData) {
      await api.forecasts
        .removeXrunForecastsByWeek(poolData?.id)
        .then(() => poolEntriesMutate())
    }
  }

  const addEntryAllParticipants = async (data?: XRunMLBEntriesItem[]) => {
    if (poolData) {
      let payload: {
        forecasts: { entry_id: number; participant_id: number }[]
        week_number: number | string
      } | null = null
      if (data) {
        payload = {
          forecasts: data.map((e) => ({
            entry_id: e.id,
            participant_id: e.xrun_mlb_forecast.participant_id,
          })),
          week_number: selectedWeek,
        }
      }

      await api.forecasts
        .xrunHandleForecastsByWeek(poolData?.id, payload)
        .then(() => poolEntriesMutate())
    }
  }

  const teamOptions: Option[] = useMemo(() => {
    if (entries.length) {
      return teams.map((t) => {
        const isTeamDisabled = entries.some((e) =>
          e.xrun_mlb_forecast
            ? e.xrun_mlb_forecast.participant_id === t.id
            : false,
        )

        return {
          name: t.id.toString(),
          title: t.name,
          isDisabled: isTeamDisabled,
        }
      })
    }

    return []
  }, [teams, entries])

  const handleChangeEntryTeam = (entryId: number, teamId: number) => {
    const foundTeam = teams.find((t) => t.id === teamId)
    const foundEntryIndex = entries.findIndex((e) => e.id === entryId)

    if (foundTeam && ~foundEntryIndex) {
      const entriesClone = JSON.parse(JSON.stringify(entries))

      entriesClone[foundEntryIndex] = {
        ...entriesClone[foundEntryIndex],
        xrun_mlb_forecast: {
          ...entriesClone[foundEntryIndex].xrun_mlb_forecast,
          participant_id: teamId,
          participant: foundTeam,
        },
      }

      addEntryAllParticipants(entriesClone)
      setEntries(entriesClone)
    }
  }

  useEffect(() => {
    if (poolEntriesData && !poolEntriesIsLoading) {
      setEntries(poolEntriesData)
    }
  }, [poolEntriesData, poolEntriesIsLoading])

  useEffect(() => {
    setIsLoadingShow(poolIsLoading)
  }, [poolIsLoading, setIsLoadingShow])

  if (!poolData) return <div>No pool data available</div>

  return (
    <div>
      <TopRow
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        poolData={poolData}
        removeEntryAllParticipants={removeEntryAllParticipants}
        addEntryAllParticipants={addEntryAllParticipants}
      />
      <EntriesTable
        entries={entries}
        loading={poolEntriesIsLoading}
        teams={teamOptions}
        handleChangeEntryTeam={handleChangeEntryTeam}
      />

      <AddNewEntry
        users={poolUsersData}
        loading={poolUsersLoading}
        poolId={poolData.id}
        updateEntries={poolEntriesMutate}
      />
    </div>
  )
}

const TopRow = ({
  selectedWeek,
  setSelectedWeek,
  poolData,
  addEntryAllParticipants,
  removeEntryAllParticipants,
}: {
  selectedWeek: string
  setSelectedWeek: Dispatch<SetStateAction<string>>
  poolData: Pool<'xrun_mlb'>
  addEntryAllParticipants: () => void
  removeEntryAllParticipants: () => void
}) => {
  const weeksData: Option[] = [
    { name: '0', title: 'All weeks' },
    ...poolData.available_week.map((w) => ({
      name: w.toString(),
      title: `Week ${w}`,
    })),
  ]

  return (
    <div className={classNames(styles.topRow, styles.container)}>
      <div>
        {poolData.type !== 'xrun_mlb' && (
          <Select2
            options={weeksData}
            onChange={(value) => setSelectedWeek(value)}
            value={selectedWeek}
          />
        )}
      </div>
      <div className={styles.buttonsContainer}>
        <div>
          <SubmitText
            onSubmit={() => removeEntryAllParticipants()}
            color="#E85D5D"
          >
            {Number(selectedWeek)
              ? `Remove Week ${selectedWeek} assignments`
              : 'Remove all picks'}
          </SubmitText>
        </div>
        <div
          className="button button-blue"
          onClick={() => addEntryAllParticipants()}
        >
          Randomly assign all weeks
        </div>
      </div>
    </div>
  )
}

const EntriesTable = ({
  entries,
  loading,
  teams,
  handleChangeEntryTeam,
}: {
  entries: XRunMLBEntriesItem[]
  loading: boolean
  teams: Option[]
  handleChangeEntryTeam: (entryId: number, teamId: number) => void
}) => {
  if (!entries.length && !loading) return <div>No data..</div>

  if (loading) return <div>Loading...</div>

  return (
    <div className={styles.entriesTable}>
      <div className={classNames(styles.container, styles.thead, styles.row)}>
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
          handleChangeEntryTeam={handleChangeEntryTeam}
        />
      ))}
    </div>
  )
}

const EntryRow = ({
  entry,
  teams,
  handleChangeEntryTeam,
}: {
  entry: XRunMLBEntriesItem
  teams: Option[]
  handleChangeEntryTeam: (entryId: number, teamId: number) => void
}) => {
  const initials = getUserInitials(
    entry.user.first_name + ' ' + entry.user.last_name,
  )

  const participantImage = entry.xrun_mlb_forecast
    ? generateParticipantImagePath(
        entry.xrun_mlb_forecast.participant.external_id,
      )
    : ''

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
        {entry.xrun_mlb_forecast ? (
          <Image
            src={participantImage}
            alt={entry.xrun_mlb_forecast.participant.name}
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
            onChange={(value) => handleChangeEntryTeam(entry.id, Number(value))}
            value={entry?.xrun_mlb_forecast?.participant_id.toString() || ''}
          />
        </div>
      </div>
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
    EntriesPoolEntriesData<'xrun_mlb'>
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
