import { Dispatch, SetStateAction } from 'react'

import {
  EntriesItem,
  Event,
  PickemPickPool,
  SetForecastsDataForecastItem,
} from '@/api/api-types'
import { months } from '@/config/constants'
import { MakePickTeam } from '@/features/components'
import { Option } from '@/features/ui/SelectWithSearch'

import styles from './MakePickTeamWrapper.module.scss'

type MakePickTeamWrapperProps = {
  date: string
  data: Event[]
  selectedParticipants: { [key: number]: SetForecastsDataForecastItem } | null
  setSelectedParticipants: Dispatch<
    SetStateAction<MakePickTeamWrapperProps['selectedParticipants']>
  >
  selectedEntry: EntriesItem
  isCompleted: boolean
  poolType: PickemPickPool['type']
  bestBetCheckboxsIsDisabled: boolean
  confidentPointsIsDisabled: boolean
  confidentPointsOptions: Option[]
  isEditMode: boolean
}

export function MakePickTeamWrapper({
  date,
  data = [],
  selectedParticipants,
  setSelectedParticipants,
  selectedEntry,
  isCompleted,
  poolType = 'standard',
  bestBetCheckboxsIsDisabled = false,
  confidentPointsIsDisabled,
  confidentPointsOptions,
  isEditMode = false,
}: MakePickTeamWrapperProps) {
  const matchDate = new Date(date)
  const matchDateText = `${months[matchDate.getMonth()]} ${matchDate.getDate()}`

  if (!selectedParticipants) return null

  return (
    <div>
      <p className={styles.date}>{matchDateText}</p>

      <div className={styles.teamWrapper}>
        {data.map((event) => (
          <MakePickTeam
            key={event.id}
            selectedParticipants={selectedParticipants}
            setSelectedParticipants={setSelectedParticipants}
            selectedEntry={selectedEntry}
            isCompleted={isCompleted}
            event={event}
            poolType={poolType}
            bestBetCheckboxsIsDisabled={bestBetCheckboxsIsDisabled}
            confidentPointsIsDisabled={confidentPointsIsDisabled}
            confidentPointsOptions={confidentPointsOptions}
            isEditMode={isEditMode}
          />
        ))}
      </div>
    </div>
  )
}
