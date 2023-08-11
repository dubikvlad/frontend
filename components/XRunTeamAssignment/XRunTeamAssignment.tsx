import classNames from 'classnames'
import { useRouter } from 'next/router'
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { api, Pool } from '@/api'
import { useLoadingWindow } from '@/contexts'
import { Select2, SubmitText } from '@/features/ui'
import { Option } from '@/features/ui/Select/Select'
import { useGetPoolEntries, usePool, useTeams } from '@/helpers'

import { XRunAllWeeksEntriesTable } from '../XRunAllWeeksEntriesTable'
import { XRunCertainWeekEntriesTable } from '../XRunCertainWeekEntriesTable'
import { XRunTeamAssignmentEditEntry } from '../XRunTeamAssignmentEditEntry'

import styles from './XRunTeamAssignment.module.scss'

type PayloadType = {
  forecasts: { entry_id: number; participant_id: number }[]
  week_number: number | string
}

export function XRunTeamAssignment() {
  const {
    query: { poolId },
  } = useRouter()

  const [selectedWeek, setSelectedWeek] = useState('0')
  const [entryToEdit, setEntryToEdit] = useState<number | null>(null)
  const [errors, setErrors] = useState('')

  const { poolData, poolIsLoading } = usePool<'xrun'>(Number(poolId))

  const { teams } = useTeams({ poolId: poolData?.id })

  const { setIsLoadingShow } = useLoadingWindow()

  const { poolEntriesData, poolEntriesIsLoading, poolEntriesMutate } =
    useGetPoolEntries<'xrun'>({
      poolId: poolData?.id,
      weekNumber: Number(selectedWeek),
    })

  const removeEntryAllParticipants = async (weekNumber?: number) => {
    if (poolData) {
      await api.forecasts
        .removeXrunForecastsByWeek(poolData?.id, {
          week_number: weekNumber || 0,
        })
        .then(() => poolEntriesMutate())
    }
  }

  const addEntryAllParticipants = async ({
    weekNumber,
    entryId,
    teamId,
    random,
  }: {
    weekNumber?: number
    entryId?: number
    teamId?: number
    random?: boolean
  }) => {
    setErrors('')

    let payload: PayloadType = {} as PayloadType

    if (!random && weekNumber && teamId && entryId) {
      payload = {
        forecasts: [{ entry_id: entryId, participant_id: teamId }],
        week_number: weekNumber,
      }
    }

    if (!random && (!weekNumber || !teamId || !entryId)) {
      return
    }

    if (poolData) {
      await api.forecasts
        .xrunHandleForecastsByWeek(poolData?.id, payload)
        .then((res) => {
          if (res.error) {
            if ('messages' in res.error) {
              setErrors(res.error.getFirstMessage())
            }
            if ('message' in res.error) {
              setErrors(res.error.message)
            }
          }

          poolEntriesMutate()
        })
        .catch()
    }
  }

  useEffect(() => {
    if (errors) {
      const timeout = setTimeout(() => {
        setErrors('')
      }, 4000)

      return () => clearTimeout(timeout)
    }
  }, [errors])

  const teamOptions: Option[] = useMemo(() => {
    return teams.map((t) => {
      const isTeamDisabled = poolData?.pick_pool.different_assignment
        ? poolEntriesData.some((e) =>
            e.xrun_forecasts.some(
              (f) =>
                f.week_number === Number(selectedWeek) &&
                f.participant.id === t.id,
            ),
          )
        : poolEntriesData.some((e) =>
            e?.xrun_forecasts.some(
              (f) =>
                f.week_number === poolData?.pick_pool.current_week &&
                f.participant.id === t.id,
            ),
          )

      return {
        name: t.id.toString(),
        title: t.name,
        isDisabled: isTeamDisabled,
      }
    })
  }, [teams, poolData?.pick_pool, selectedWeek, poolEntriesData])

  useEffect(() => {
    setIsLoadingShow(poolIsLoading)
  }, [poolIsLoading, setIsLoadingShow])

  if (!poolData) return <div>No pool data available</div>

  const renderMainComponent = () => {
    if (entryToEdit) {
      const entryData = poolEntriesData.find((e) => e.id === entryToEdit)

      if (!entryData) return <div>No entry</div>

      return (
        <XRunTeamAssignmentEditEntry
          entry={entryData}
          teamOptions={teamOptions}
          poolData={poolData}
          setEntryToEdit={setEntryToEdit}
          onChangeTeam={addEntryAllParticipants}
        />
      )
    }

    if (selectedWeek === '0' && poolData.pick_pool.different_assignment) {
      return (
        <XRunAllWeeksEntriesTable
          entries={poolEntriesData}
          poolData={poolData}
          setEntryToEdit={setEntryToEdit}
          setSelectedWeek={setSelectedWeek}
          updateEntries={poolEntriesMutate}
        />
      )
    }
    return (
      <XRunCertainWeekEntriesTable
        entries={poolEntriesData}
        loading={poolEntriesIsLoading}
        teams={teamOptions}
        weekNumber={Number(selectedWeek)}
        differentAssignment={!!poolData.pick_pool.different_assignment}
        onChangeTeam={addEntryAllParticipants}
        currentWeek={poolData.pick_pool.current_week}
      />
    )
  }

  return (
    <div>
      <TopRow
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
        poolData={poolData}
        removeEntryAllParticipants={removeEntryAllParticipants}
        addEntryAllParticipants={addEntryAllParticipants}
        entryToEdit={entryToEdit}
        setEntryToEdit={setEntryToEdit}
      />
      {renderMainComponent()}

      {errors && (
        <div className={classNames(styles.container, styles.error)}>
          {errors}
        </div>
      )}
    </div>
  )
}

const TopRow = ({
  selectedWeek,
  setSelectedWeek,
  poolData,
  addEntryAllParticipants,
  removeEntryAllParticipants,
  setEntryToEdit,
  entryToEdit,
}: {
  selectedWeek: string
  setSelectedWeek: Dispatch<SetStateAction<string>>
  poolData: Pool<'xrun'>
  addEntryAllParticipants: ({
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
  removeEntryAllParticipants: (weekNumber: number) => void
  entryToEdit: number | null
  setEntryToEdit: Dispatch<SetStateAction<number | null>>
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
        {poolData.type !== 'xrun_mlb' &&
        poolData.pick_pool.different_assignment ? (
          <Select2
            options={weeksData}
            onChange={(value) => {
              entryToEdit && setEntryToEdit(null)
              setSelectedWeek(value)
            }}
            value={selectedWeek}
          />
        ) : (
          <></>
        )}
      </div>
      <div className={styles.buttonsContainer}>
        <div>
          <SubmitText
            onSubmit={() => removeEntryAllParticipants(Number(selectedWeek))}
            color="#E85D5D"
          >
            {Number(selectedWeek)
              ? `Remove Week ${selectedWeek} assignments`
              : 'Remove all picks'}
          </SubmitText>
        </div>
        <div
          className="button button-blue"
          onClick={() => addEntryAllParticipants({ random: true })}
        >
          Randomly assign all weeks
        </div>
      </div>
    </div>
  )
}
